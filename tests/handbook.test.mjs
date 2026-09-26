import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  HANDBOOK_PATH,
  getHandbookPath,
  getHandbookReadTime,
  handbookPages
} from "../src/data/handbook.ts";
import { MONETIZATION_ROUTE_REGISTRY } from "../src/data/monetization-route-registry.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const routes = handbookPages.map(getHandbookPath);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("handbook contains exactly eight substantial, unique, source-aware chapters", () => {
  assert.equal(handbookPages.length, 8);
  assert.deepEqual(handbookPages.map((page) => page.number), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(new Set(handbookPages.map((page) => page.slug)).size, 8);
  assert.equal(new Set(handbookPages.map((page) => page.title)).size, 8);
  for (const page of handbookPages) {
    const readable = [page.intro, page.takeaway, ...page.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.points ?? [])])]
      .join(" ")
      .replace(/<[^>]+>/g, " ")
      .trim()
      .split(/\s+/).length;
    assert.ok(readable >= 500, `${page.slug} should remain substantial`);
    assert.ok(page.sections.length >= 4);
    assert.ok(page.sources.length >= 3);
    assert.ok(page.relatedLinks.length >= 3);
    assert.equal(page.publishedDate, "2026-09-25");
    assert.equal(page.modifiedDate, "2026-09-26");
    assert.equal(page.image.width, 1600);
    assert.equal(page.image.height, 900);
    assert.match(getHandbookReadTime(page), /^\d+ min read$/);
    assert.doesNotMatch(JSON.stringify(page), /placeholder|coming soon|lorem ipsum/i);
  }
});

test("handbook generates one hub and exactly eight canonical article routes", () => {
  const hub = read(`dist${HANDBOOK_PATH}/index.html`);
  assert.match(hub, new RegExp(`<link rel="canonical" href="https://echobuddha.com${HANDBOOK_PATH}/"`));
  assert.match(hub, /"@type":"CollectionPage"/);
  assert.match(hub, /"@type":"ItemList"/);
  assert.match(hub, /"numberOfItems":8/);
  assert.match(hub, /"@type":"BreadcrumbList"/);
  assert.equal((hub.match(/class="surface chapter-card"/g) ?? []).length, 8);

  const generated = fs.readdirSync(path.join(root, `dist${HANDBOOK_PATH}`), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${HANDBOOK_PATH}/${entry.name}/`)
    .sort();
  assert.deepEqual(generated, [...routes].sort());

  for (const [index, route] of routes.entries()) {
    const html = read(`dist${route}index.html`);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://echobuddha.com${escapeRegex(route)}"`));
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    assert.match(html, /"datePublished":"2026-09-25"/);
    assert.match(html, /How the Sources Fit/);
    assert.match(html, /Selected References/);
    assert.match(html, /<meta property="og:image:width" content="1600"/);
    assert.match(html, /<meta property="og:image:height" content="900"/);
    assert.match(html, new RegExp(escapeRegex(pageImagePath(index))));
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i);
    assert.doesNotMatch(html, /pagead2\.googlesyndication|adsbygoogle|google_ad_client|class="[^"]*ad-slot/i);
    if (index > 0) assert.match(html, new RegExp(escapeRegex(routes[index - 1])));
    if (index < routes.length - 1) assert.match(html, new RegExp(escapeRegex(routes[index + 1])));
  }
});

test("home, Learn, search, and sitemap discover the complete handbook without duplication", () => {
  const homepage = read("dist/index.html");
  const learn = read("dist/learn/index.html");
  const sitemap = read("dist/sitemap.xml");
  const search = JSON.parse(read("dist/search-index.json"));
  assert.match(homepage, new RegExp(`${HANDBOOK_PATH}/`));
  assert.match(learn, new RegExp(`${HANDBOOK_PATH}/`));
  assert.equal(search.filter((item) => item.url === `${HANDBOOK_PATH}/`).length, 1);
  assert.equal((sitemap.match(new RegExp(`https://echobuddha.com${HANDBOOK_PATH}/`, "g")) ?? []).length, 9);
  for (const route of routes) {
    assert.equal(search.filter((item) => item.url === route).length, 1);
    assert.equal((sitemap.match(new RegExp(`https://echobuddha.com${escapeRegex(route)}`, "g")) ?? []).length, 1);
  }
  const corpus = JSON.stringify(search.filter((item) => item.url.startsWith(`${HANDBOOK_PATH}/`)));
  for (const term of ["Triple Gem", "Three Jewels", "taking refuge", "Buddha refuge", "Dhamma refuge", "Sangha refuge", "Saṅgha", "devas", "stupa", "cetiya", "Bodhi tree", "lay Buddhist", "bhikkhu", "monastic community"]) {
    assert.match(corpus, new RegExp(term, "i"), term);
  }
});

test("handbook monetization remains fail-closed", () => {
  assert.deepEqual(MONETIZATION_ROUTE_REGISTRY[`${HANDBOOK_PATH}/`], {
    state: "NEVER_MONETIZE",
    family: "LEARN_NAVIGATION",
    indexable: true,
    reason: "FAMILY_EXCLUDED_OR_NON_SUBSTANTIVE_SCREEN"
  });
  for (const route of routes) {
    assert.deepEqual(MONETIZATION_ROUTE_REGISTRY[route], {
      state: "HOLD_MANUAL_REVIEW",
      family: "LEARN_DETAIL",
      indexable: true,
      reason: "INDEXABLE_SUBSTANTIVE_ROUTE_NOT_EXPLICITLY_APPROVED"
    });
  }
});

test("coverage and asset evidence are complete", () => {
  const audit = read("docs/handbook/HANDBOOK_SOURCE_CONTENT_AUDIT.md");
  for (const range of ["1–3", "14", "28", "30–32", "37", "56–61", "74–75", "81–103", "104–105", "107–114", "117–118", "119"]) {
    assert.match(audit, new RegExp(`\\| ${range.replace("–", "–")} \\|`));
  }
  assert.match(audit, /All 119 non-empty paragraphs/);
  const imagePaths = [
    "public/images/handbook/refined/buddhist-life-practice-handbook.webp",
    "public/images/handbook/refined/buddhist-life-practice-handbook.avif",
    "public/images/handbook/refined/buddhist-life-practice-handbook-800.webp",
    "public/images/handbook/refined/buddhist-life-practice-handbook-800.avif",
    ...handbookPages.flatMap((page) => [
      `public${page.image.src}`,
      `public${page.image.avif}`,
      `public${page.image.src.replace(".webp", "-800.webp")}`,
      `public${page.image.avif.replace(".avif", "-800.avif")}`
    ])
  ];
  assert.equal(new Set(handbookPages.map((page) => page.image.src)).size, 8);
  for (const image of imagePaths) {
    assert.ok(fs.existsSync(path.join(root, image)), image);
    assert.ok(fs.statSync(path.join(root, image)).size > 30_000, image);
  }
});

function pageImagePath(index) {
  return handbookPages[index].image.src;
}
