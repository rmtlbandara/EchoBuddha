import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

export const ORIGIN = "https://echobuddha.com";
// Public ownership proof served on the website, not an account/API credential.
export const KEY = "81e7690f87496de3112f2f896e936ac7";
export const KEY_PATH = `/${KEY}.txt`;
export const MANIFEST_PATH = "/indexnow-manifest.json";
export const ENDPOINT = "https://api.indexnow.org/indexnow";
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function validateUrl(value) {
  const url = new URL(value);
  assert.equal(url.origin, ORIGIN, "IndexNow only accepts the production origin");
  assert.equal(url.href, value, "URL must be canonical");
  assert.ok(!url.search && !url.hash && !url.username && !url.password, "Unexpected URL components");
  assert.match(url.pathname, /^(?:\/[a-z0-9-]+)*\/$/, "Expected a canonical HTML route");
  return url;
}

export function sitemapUrls(xml) {
  assert.match(xml, /<urlset\b/, "Expected a URL sitemap");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.ok(urls.length > 0 && urls.length <= 10000, "Expected 1–10,000 sitemap URLs");
  urls.forEach(validateUrl);
  assert.equal(new Set(urls).size, urls.length, "Duplicate sitemap URLs");
  return urls.sort();
}

function canonical(html) {
  const tag = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0] || "";
  return tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
}

function noindex(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*noindex)[^>]*>/i.test(html);
}

export function validateManifest(manifest) {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.origin, ORIGIN);
  assert.ok(Array.isArray(manifest.pages) && manifest.pages.length > 0 && manifest.pages.length <= 10000);
  for (const page of manifest.pages) {
    validateUrl(page.url);
    assert.match(page.sha256, /^[a-f0-9]{64}$/);
  }
  assert.equal(new Set(manifest.pages.map((page) => page.url)).size, manifest.pages.length);
  return manifest;
}

export function buildManifest(dist) {
  const urls = sitemapUrls(fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8"));
  const pages = urls.map((url) => {
    const html = fs.readFileSync(path.join(dist, new URL(url).pathname.slice(1), "index.html"), "utf8");
    assert.equal(canonical(html), url, `Noncanonical sitemap page: ${url}`);
    assert.ok(!noindex(html), `Noindex sitemap page: ${url}`);
    return { url, sha256: sha256(html) };
  });
  const manifest = validateManifest({ schemaVersion: 1, origin: ORIGIN, pages });
  fs.writeFileSync(path.join(dist, KEY_PATH.slice(1)), `${KEY}\n`);
  fs.writeFileSync(path.join(dist, MANIFEST_PATH.slice(1)), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function get(url, fetcher) {
  return fetcher(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(20000),
    headers: { "user-agent": "EchoBuddha-IndexNow/1.0", "cache-control": "no-cache" }
  });
}

export function createPlan(target, previous) {
  validateManifest(target);
  if (previous) validateManifest(previous);
  const oldPages = new Map((previous?.pages || []).map((page) => [page.url, page.sha256]));
  const newPages = new Set(target.pages.map((page) => page.url));
  const changes = target.pages
    .filter((page) => oldPages.get(page.url) !== page.sha256)
    .map((page) => ({ url: page.url, kind: oldPages.has(page.url) ? "updated" : "added" }));
  for (const url of oldPages.keys()) {
    if (!newPages.has(url)) changes.push({ url, kind: "removed" });
  }
  assert.ok(changes.length <= 10000, "Split releases larger than 10,000 changed URLs");
  return { schemaVersion: 1, origin: ORIGIN, bootstrap: !previous, target, changes };
}

export async function preparePlan(target, fetcher = fetch) {
  const response = await get(`${ORIGIN}${MANIFEST_PATH}`, fetcher);
  if (response.status === 404) return createPlan(target, null);
  assert.equal(response.status, 200, "Cannot read previous production IndexNow manifest");
  return createPlan(target, await response.json());
}

export async function waitForTargetManifest(target, fetcher, {
  attempts = 7,
  delayMs = 5000,
  sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
} = {}) {
  assert.ok(Number.isInteger(attempts) && attempts >= 1 && attempts <= 7, "Manifest verification permits 1–7 attempts");
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = await get(`${ORIGIN}${MANIFEST_PATH}`, fetcher);
    assert.equal(response.status, 200, "Production manifest is not live");
    const live = validateManifest(await response.json());
    if (isDeepStrictEqual(live, target)) return attempt;
    // Asset propagation may briefly expose the preceding valid manifest even
    // after release.json and smoke pass. Retry reads, never relax equality or POST.
    if (attempt < attempts) await sleep(delayMs);
  }
  throw new Error(`A different release is live: target manifest did not match after ${attempts} verification attempts. Retry the saved plan only after the matching artifact is live.`);
}

export async function submitPlan(plan, fetcher = fetch, verificationOptions) {
  assert.equal(plan.schemaVersion, 1);
  assert.equal(plan.origin, ORIGIN);
  validateManifest(plan.target);
  assert.ok(Array.isArray(plan.changes) && plan.changes.length <= 10000);
  const current = new Set(plan.target.pages.map((page) => page.url));
  for (const change of plan.changes) {
    validateUrl(change.url);
    assert.ok(["added", "updated", "removed"].includes(change.kind));
    assert.equal(current.has(change.url), change.kind !== "removed", "Change disagrees with target sitemap");
  }
  assert.equal(new Set(plan.changes.map((change) => change.url)).size, plan.changes.length);
  if (!plan.changes.length) return { status: "NO_CHANGES", submitted: 0 };

  // Never send notifications for an artifact that has not reached production.
  const key = await get(`${ORIGIN}${KEY_PATH}`, fetcher);
  assert.equal(key.status, 200, "IndexNow key is not live");
  assert.equal((await key.text()).trim(), KEY, "IndexNow key content mismatch");
  const manifestVerificationAttempts = await waitForTargetManifest(plan.target, fetcher, verificationOptions);
  const sitemapResponse = await get(`${ORIGIN}/sitemap.xml`, fetcher);
  assert.equal(sitemapResponse.status, 200);
  assert.deepEqual(sitemapUrls(await sitemapResponse.text()), [...current].sort(), "Live sitemap differs from release");

  // Check actual routes as well as the manifest. Five requests at a time keeps
  // bootstrap checks bounded without serially waiting on every page.
  for (let offset = 0; offset < plan.changes.length; offset += 5) {
    await Promise.all(plan.changes.slice(offset, offset + 5).map(async ({ url, kind }) => {
      const response = await get(url, fetcher);
      const html = await response.text();
      if (kind === "removed") {
        const moved = [301, 308].includes(response.status) && response.headers.has("location");
        const excluded = response.status === 200 &&
          (noindex(html) || /noindex/i.test(response.headers.get("x-robots-tag") || ""));
        assert.ok(moved || excluded || [404, 410].includes(response.status), `Removed URL still indexable: ${url}`);
      } else {
        assert.equal(response.status, 200, `Page not live: ${url}`);
        assert.equal(canonical(html), url, `Live canonical mismatch: ${url}`);
        assert.ok(!noindex(html) && !/noindex/i.test(response.headers.get("x-robots-tag") || ""), `Live noindex: ${url}`);
      }
    }));
  }

  const response = await fetcher(ENDPOINT, {
    method: "POST",
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(ORIGIN).host,
      key: KEY,
      keyLocation: `${ORIGIN}${KEY_PATH}`,
      urlList: plan.changes.map((change) => change.url)
    })
  });
  assert.ok([200, 202].includes(response.status), `IndexNow rejected submission: HTTP ${response.status}. Retry the saved plan after resolving the error.`);
  return {
    status: response.status === 200 ? "SUBMITTED" : "KEY_VALIDATION_PENDING",
    httpStatus: response.status,
    submitted: plan.changes.length,
    manifestVerificationAttempts,
    checkedAt: new Date().toISOString(),
    indexingGuaranteed: false
  };
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [command, input, output] = process.argv.slice(2);
  if (command === "build" && input) {
    console.log(`IndexNow ownership proof and manifest built for ${buildManifest(input).pages.length} sitemap URLs.`);
  } else if (command === "plan" && input && output) {
    const target = JSON.parse(fs.readFileSync(path.join(input, MANIFEST_PATH.slice(1)), "utf8"));
    const plan = await preparePlan(target);
    writeJson(output, plan);
    console.log(`IndexNow plan: ${plan.changes.length} changed URLs; bootstrap=${plan.bootstrap}. No submissions sent.`);
  } else if (command === "submit" && input && output) {
    try {
      const result = await submitPlan(JSON.parse(fs.readFileSync(input, "utf8")));
      writeJson(output, result);
      console.log(JSON.stringify(result));
    } catch (error) {
      writeJson(output, { status: "FAILED", error: error.message, checkedAt: new Date().toISOString() });
      throw error;
    }
  } else {
    throw new Error("Usage: indexnow.mjs build <dist> | plan <dist> <plan.json> | submit <plan.json> <result.json>");
  }
}
