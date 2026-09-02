import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  buddhistQuestions,
  getBuddhistQuestionPath
} from "../src/data/buddhistQuestions.ts";
import { MONETIZATION_ROUTE_REGISTRY } from "../src/data/monetization-route-registry.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const questionRoutes = buddhistQuestions.map(getBuddhistQuestionPath);

test("controlled Buddhist question collection contains exactly two complete, unique records", () => {
  assert.equal(buddhistQuestions.length, 2);
  assert.deepEqual(buddhistQuestions.map((question) => question.number), [1, 2]);
  assert.equal(new Set(buddhistQuestions.map((question) => question.slug)).size, 2);
  assert.equal(new Set(buddhistQuestions.map((question) => question.title)).size, 2);
  for (const question of buddhistQuestions) {
    assert.ok(question.description.trim());
    assert.ok(question.shortAnswer.length >= 2);
    assert.ok(question.sections.length >= 6);
    assert.ok(question.sources.length >= 2);
    assert.doesNotMatch(JSON.stringify(question), /placeholder|coming soon|lorem ipsum/i);
  }
  const learnSource = read("src/data/learn.ts");
  const existingFaqSource = learnSource.split("export const questionsAboutBuddhism = [")[1].split("export const resourceGroups")[0];
  assert.equal((existingFaqSource.match(/\n\s{4}question:/g) ?? []).length, 10, "the existing compact FAQ set must remain intact");
});

test("only Q1 and Q2 public question detail routes are generated", () => {
  const detailRoot = path.join(root, "dist/learn/questions-about-buddhism");
  const generated = fs.readdirSync(detailRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `/learn/questions-about-buddhism/${entry.name}/`)
    .sort();
  assert.deepEqual(generated, [...questionRoutes].sort());
  assert.equal(generated.some((route) => /question-[3-9]|q(?:uestion)?-?[3-9]/i.test(route)), false);
});

test("both question pages resolve in the build with canonical Article and breadcrumb metadata", () => {
  for (const [index, route] of questionRoutes.entries()) {
    const html = read(`dist${route}index.html`);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://echobuddha.com${route}"`));
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i);
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    assert.doesNotMatch(html, /"@type":"FAQPage"/);
    assert.match(html, /rel="author"[^>]*>Echo Buddha Editorial/);
    assert.match(html, /Sources and Context/);
    assert.match(html, /Selected References/);
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    assert.match(html, new RegExp(questionRoutes[1 - index].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(html, /pagead2\.googlesyndication|adsbygoogle|google_ad_client|class="[^"]*ad-slot/i);
  }
});

test("hub, internal search, and sitemap discover both question pages exactly once", () => {
  const hub = read("dist/learn/questions-about-buddhism/index.html");
  const sitemap = read("dist/sitemap.xml");
  const searchIndex = JSON.parse(read("dist/search-index.json"));
  for (const route of questionRoutes) {
    assert.match(hub, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal((sitemap.match(new RegExp(`https://echobuddha.com${route}`, "g")) ?? []).length, 1);
    assert.equal(searchIndex.filter((item) => item.url === route).length, 1);
  }
});

test("new question routes remain conservative Learn-detail monetization holds", () => {
  for (const route of questionRoutes) {
    assert.deepEqual(MONETIZATION_ROUTE_REGISTRY[route], {
      state: "HOLD_MANUAL_REVIEW",
      family: "LEARN_DETAIL",
      indexable: true,
      reason: "INDEXABLE_SUBSTANTIVE_ROUTE_NOT_EXPLICITLY_APPROVED"
    });
  }
  assert.equal(Object.keys(MONETIZATION_ROUTE_REGISTRY).length, 337);
});
