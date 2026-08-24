import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const origin = "https://echobuddha.com";
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [];
const check = (name, callback) => {
  try {
    const evidence = callback();
    checks.push({ name, pass: true, evidence });
  } catch (error) {
    checks.push({ name, pass: false, evidence: error.message });
  }
};

if (!fs.existsSync(path.join(dist, "sitemap.xml"))) {
  throw new Error("Quote governance validation requires a current production build.");
}

const sitemap = read("dist/sitemap.xml");
const sitemapRoutes = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname));
const searchIndex = JSON.parse(read("dist/search-index.json"));
const quoteSearchItems = searchIndex.filter((item) => item.type === "Quote");
const quoteRoot = path.join(dist, "quotes");
const categoryDirectories = fs.readdirSync(quoteRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const storyPages = categoryDirectories.flatMap((category) => {
  const categoryRoot = path.join(quoteRoot, category);
  return fs.readdirSync(categoryRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      route: `/quotes/${category}/${entry.name}/`,
      html: fs.readFileSync(path.join(categoryRoot, entry.name, "index.html"), "utf8")
    }));
});

check("quote identity and route uniqueness", () => {
  assert.equal(storyPages.length, 153);
  assert.equal(quoteSearchItems.length, 153);
  assert.equal(new Set(quoteSearchItems.map((item) => item.url)).size, 153);
  assert.equal(new Set(quoteSearchItems.map((item) => item.title.trim().toLowerCase())).size, 153);
  return "153 unique quote records, routes, titles, and local-search entries";
});

check("fail-closed story index governance", () => {
  const source = read("src/data/site.ts");
  assert.match(source, /DEFAULT_QUOTE_SEARCH_INDEX_STATUS[^=]*= "noindex"/);
  assert.match(source, /status !== "index"/);
  assert.match(source, /requests indexation without a complete editorial approval/);
  assert.match(source, /categoryInsufficientReason/);
  return "default noindex; explicit index plus complete approval required";
});

check("all current quote permalinks remain useful noindex pages", () => {
  const failures = storyPages.filter(({ route, html }) =>
    !/<meta name="robots" content="noindex, follow"/.test(html)
    || !html.includes(`<link rel="canonical" href="${origin}${route}"`)
    || !html.includes("Origin and Practical Context")
    || !html.includes("Quote Attribution Policy")
    || !html.includes("Explore all")
  );
  assert.deepEqual(failures.map((item) => item.route), []);
  return "153/153 return useful self-canonical noindex, follow experiences";
});

check("quote stories are excluded from sitemap but retained in local search", () => {
  assert.deepEqual(storyPages.filter(({ route }) => sitemapRoutes.has(route)).map(({ route }) => route), []);
  const indexedLocally = new Set(quoteSearchItems.map((item) => item.url));
  assert.deepEqual(storyPages.filter(({ route }) => !indexedLocally.has(route)).map(({ route }) => route), []);
  return "0 story sitemap entries; 153/153 local-search entries";
});

check("hub and ten curated categories remain protected indexable resources", () => {
  assert.equal(categoryDirectories.length, 10);
  const routes = ["/quotes/", ...categoryDirectories.map((category) => `/quotes/${category}/`)];
  const failures = routes.filter((route) => {
    const html = read(`dist${route}index.html`);
    return /<meta name="robots" content="noindex/.test(html)
      || !html.includes(`<link rel="canonical" href="${origin}${route}"`)
      || !sitemapRoutes.has(route);
  });
  assert.deepEqual(failures, []);
  return "11/11 indexable, self-canonical, and in sitemap";
});

check("hub and category curation is visible", () => {
  const hub = read("dist/quotes/index.html");
  assert.match(hub, /Editorial Starting Points/);
  assert.match(hub, /not direct Buddha quotes or scripture translations/);
  for (const category of categoryDirectories) {
    const html = read(`dist/quotes/${category}/index.html`);
    assert.match(html, /Editorial reading path/);
    assert.match(html, /Editorial starting points/);
    assert.match(html, /Practice With the Theme/);
  }
  return "hub provenance plus three-level curation across all categories";
});

check("quote structured data does not fabricate scripture or reviewers", () => {
  const failures = [];
  for (const { route, html } of storyPages) {
    for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      const value = JSON.parse(match[1]);
      const serialized = JSON.stringify(value);
      if (/"reviewedBy"|"reviewer"|"credential"|"Buddha"\s*:\s*/.test(serialized)) failures.push(route);
    }
  }
  assert.deepEqual([...new Set(failures)], []);
  return "all quote JSON-LD parses; no fabricated reviewer, credential, or Buddha attribution";
});

const failed = checks.filter((item) => !item.pass);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}: ${item.evidence}`);
if (failed.length) process.exitCode = 1;
else console.log(`Quote governance validation passed: ${checks.length}/${checks.length} checks.`);
