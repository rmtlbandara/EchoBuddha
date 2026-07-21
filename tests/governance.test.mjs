import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("analytics defaults accepted without auto-opening the popup and ads remain disabled", () => {
  const layout = read("src/layouts/Layout.astro");
  const consent = read("src/components/ConsentManager.astro");
  const site = read("src/data/site.ts");

  assert.equal(layout.includes("googletagmanager.com/gtag/js"), false);
  assert.match(consent, /writePreference\(true\)/);
  assert.equal(consent.includes("window.setTimeout(openPanel"), false);
  assert.match(consent, /\.consent-panel\[hidden\]/);
  assert.match(consent, /analytics_storage:\s*"denied"/);
  assert.match(consent, /ad_storage:\s*"denied"/);
  assert.match(consent, /ad_user_data:\s*"denied"/);
  assert.match(consent, /ad_personalization:\s*"denied"/);
  assert.match(site, /adsEnabled:\s*false/);
});

test("required validation scripts are present", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const script of ["typecheck", "lint", "test", "audit:seo", "audit:content", "validate"]) {
    assert.ok(pkg.scripts[script], `missing ${script} script`);
  }
});

test("robots and manifest metadata are source-controlled", () => {
  const robots = read("public/robots.txt");
  const manifest = JSON.parse(read("public/site.webmanifest"));
  assert.match(robots, /Sitemap: https:\/\/echobuddha\.com\/sitemap\.xml/);
  assert.equal(manifest.name, "Echo Buddha");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.length >= 3);
});

test("sitemap output aligns with canonical site when built", () => {
  if (!fs.existsSync("dist/sitemap.xml")) {
    console.warn("dist/sitemap.xml is missing; run npm run build before this full validation test.");
    return;
  }
  const sitemap = read("dist/sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.ok(urls.length > 0);
  assert.ok(urls.every((url) => url.startsWith("https://echobuddha.com/")));
  assert.equal(urls.some((url) => url.includes("/search/")), false);
  assert.equal(urls.some((url) => url.includes("/daily-reflections/today/")), false);
});

test("content remediation governance assets remain present", () => {
  const governance = read("src/data/editorialGovernance.ts");
  assert.match(governance, /quoteId/);
  assert.match(governance, /adSuitabilityMatrix/);
  assert.match(governance, /safetyReviewChecklist/);
  assert.match(governance, /topicRoleMap/);
  assert.match(governance, /Original Echo Buddha writing/);
});
