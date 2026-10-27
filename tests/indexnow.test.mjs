import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import YAML from "yaml";
import {
  ORIGIN, KEY, KEY_PATH, MANIFEST_PATH, ENDPOINT,
  buildManifest, createPlan, preparePlan, sitemapUrls, submitPlan
} from "../scripts/indexnow.mjs";

const home = `${ORIGIN}/`;
const article = `${ORIGIN}/articles/test/`;
const html = (url) => `<html><head><link rel="canonical" href="${url}"><meta name="robots" content="index, follow"></head><body>Content</body></html>`;
const manifest = (pages) => ({
  schemaVersion: 1, origin: ORIGIN,
  pages: pages.map(([url, hash = "a"]) => ({ url, sha256: hash.repeat(64) }))
});
const xml = (urls) => `<urlset>${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`;

function fakeProduction(target, overrides = new Map(), postStatus = 200) {
  const posts = [];
  const responses = new Map([
    [`${ORIGIN}${KEY_PATH}`, new Response(`${KEY}\n`)],
    [`${ORIGIN}${MANIFEST_PATH}`, Response.json(target)],
    [`${ORIGIN}/sitemap.xml`, new Response(xml(target.pages.map((page) => page.url)))],
    ...target.pages.map((page) => [page.url, new Response(html(page.url))]),
    ...overrides
  ]);
  return {
    posts,
    fetcher: async (url, options) => {
      if (url === ENDPOINT) {
        posts.push(JSON.parse(options.body));
        return new Response("", { status: postStatus });
      }
      assert.equal(options.redirect, "manual");
      assert.ok(responses.has(url), `Unexpected fetch: ${url}`);
      return responses.get(url).clone();
    }
  };
}

test("build publishes proof and hashes only canonical, indexable sitemap HTML", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "indexnow-"));
  try {
    fs.writeFileSync(path.join(dir, "sitemap.xml"), xml([home]));
    fs.writeFileSync(path.join(dir, "index.html"), html(home));
    fs.writeFileSync(path.join(dir, "private.html"), "not in sitemap");
    const result = buildManifest(dir);
    assert.equal(result.pages.length, 1);
    assert.equal(fs.readFileSync(path.join(dir, KEY_PATH), "utf8").trim(), KEY);
    fs.writeFileSync(path.join(dir, "index.html"), html(home).replace("index, follow", "noindex, follow"));
    assert.throws(() => buildManifest(dir), /Noindex/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("sitemap validation rejects external, duplicate, query and traversal URLs", () => {
  for (const urls of [
    ["https://evil.example/"], [home, home], [`${home}?x=1`],
    [`${ORIGIN}/../`], [`${ORIGIN}/%2e%2e/`], [`${ORIGIN}/file.json`]
  ]) assert.throws(() => sitemapUrls(xml(urls)));
});

test("plans bootstrap, unchanged releases, additions, updates and removals", () => {
  const old = manifest([[home], [article]]);
  assert.equal(createPlan(old, null).changes.length, 2);
  assert.deepEqual(createPlan(old, old).changes, []);
  const next = manifest([[home, "b"], [`${ORIGIN}/learn/`]]);
  assert.deepEqual(createPlan(next, old).changes, [
    { url: home, kind: "updated" },
    { url: `${ORIGIN}/learn/`, kind: "added" },
    { url: article, kind: "removed" }
  ]);
});

test("only a missing production manifest bootstraps; server failures stop planning", async () => {
  const target = manifest([[home]]);
  assert.equal((await preparePlan(target, async () => new Response("", { status: 404 }))).bootstrap, true);
  await assert.rejects(preparePlan(target, async () => new Response("", { status: 503 })));
});

test("submission checks live proof and release, and distinguishes 202 from success", async () => {
  const target = manifest([[home], [article]]);
  for (const status of [200, 202]) {
    const fake = fakeProduction(target, new Map(), status);
    const result = await submitPlan(createPlan(target, null), fake.fetcher);
    assert.equal(result.status, status === 200 ? "SUBMITTED" : "KEY_VALIDATION_PENDING");
    assert.deepEqual(fake.posts[0].urlList, [home, article]);
    assert.equal(fake.posts[0].keyLocation, `${ORIGIN}${KEY_PATH}`);
  }
});

test("failed key, stale release, sitemap drift, redirects and noindex prevent all POSTs", async () => {
  const target = manifest([[home]]);
  for (const [url, response] of [
    [`${ORIGIN}${KEY_PATH}`, new Response("wrong")],
    [`${ORIGIN}${MANIFEST_PATH}`, Response.json(manifest([[home, "b"]]))],
    [`${ORIGIN}/sitemap.xml`, new Response(xml([article]))],
    [home, new Response("", { status: 301, headers: { location: article } })],
    [home, new Response(html(home).replace("index, follow", "noindex, follow"))],
    [home, new Response(html(home), { headers: { "x-robots-tag": "noindex" } })],
    [home, new Response(html(article))]
  ]) {
    const fake = fakeProduction(target, new Map([[url, response]]));
    await assert.rejects(submitPlan(createPlan(target, null), fake.fetcher, { attempts: 1 }));
    assert.equal(fake.posts.length, 0);
  }
});

test("transient prior manifests retry reads and submit once only after exact equality", async () => {
  const target = manifest([[home]]);
  const previous = manifest([[home, "b"]]);
  const fake = fakeProduction(target);
  let reads = 0;
  const waits = [];
  const fetcher = async (url, options) => {
    if (url === `${ORIGIN}${MANIFEST_PATH}`) return Response.json(++reads < 3 ? previous : target);
    if (options?.method === "POST") assert.equal(reads, 3);
    return fake.fetcher(url, options);
  };
  const result = await submitPlan(createPlan(target, previous), fetcher, { sleep: async ms => { waits.push(ms); } });
  assert.equal(result.manifestVerificationAttempts, 3);
  assert.deepEqual(waits, [5000, 5000]);
  assert.equal(fake.posts.length, 1);
});

test("a permanently different release exhausts bounded verification without any submission", async () => {
  const target = manifest([[home]]);
  const fake = fakeProduction(target, new Map([[`${ORIGIN}${MANIFEST_PATH}`, Response.json(manifest([[home, "b"]]))]]));
  const waits = [];
  await assert.rejects(submitPlan(createPlan(target, null), fake.fetcher, { sleep: async ms => { waits.push(ms); } }), /after 7 verification attempts/);
  assert.equal(waits.length, 6);
  assert.equal(waits.reduce((a, b) => a + b, 0), 30000);
  assert.equal(fake.posts.length, 0);
});

test("removed URLs require a live removal, exclusion or permanent redirect", async () => {
  const target = manifest([[home]]);
  const plan = createPlan(target, manifest([[home], [article]]));
  for (const response of [
    new Response("", { status: 404 }),
    new Response("", { status: 410 }),
    new Response("", { status: 301, headers: { location: home } }),
    new Response(html(article).replace("index, follow", "noindex, follow"))
  ]) {
    const fake = fakeProduction(target, new Map([[article, response]]));
    assert.equal((await submitPlan(plan, fake.fetcher)).submitted, 1);
  }
  const fake = fakeProduction(target, new Map([[article, new Response(html(article))]]));
  await assert.rejects(submitPlan(plan, fake.fetcher), /still indexable/);
  assert.equal(fake.posts.length, 0);
});

test("no-change plans perform no requests; endpoint failures are reported", async () => {
  const target = manifest([[home]]);
  assert.equal((await submitPlan(createPlan(target, target), async () => { throw Error("unexpected"); })).submitted, 0);
  for (const status of [400, 403, 422, 429, 500]) {
    const fake = fakeProduction(target, new Map(), status);
    await assert.rejects(submitPlan(createPlan(target, null), fake.fetcher), new RegExp(`HTTP ${status}`));
  }
});

test("workflow plans before deploy and submits only after production smoke", () => {
  const workflow = YAML.parse(fs.readFileSync(".github/workflows/deploy-production.yml", "utf8"));
  const steps = workflow.jobs["deploy-production"].steps;
  const index = (pattern) => steps.findIndex((step) => pattern.test(step.run || ""));
  assert.ok(index(/indexnow.mjs plan/) < index(/wrangler deploy/));
  assert.ok(index(/indexnow.mjs submit/) > index(/audit:production-smoke/));
  assert.equal(steps[index(/indexnow.mjs submit/)].if, undefined);
  assert.equal(steps[index(/indexnow.mjs submit/)]["continue-on-error"], undefined);
});
