import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("analytics defaults accepted without auto-opening the popup and ad consent remains denied", () => {
  const layout = read("src/layouts/Layout.astro");
  const consent = read("src/components/ConsentManager.astro");
  const site = read("src/data/site.ts");
  const ads = read("src/data/ads.ts");

  assert.equal(layout.includes("googletagmanager.com/gtag/js"), false);
  assert.match(consent, /writePreference\(true\)/);
  assert.equal(consent.includes("window.setTimeout(openPanel"), false);
  assert.match(consent, /\.consent-panel\[hidden\]/);
  assert.match(consent, /analytics_storage:\s*"denied"/);
  assert.match(consent, /ad_storage:\s*"denied"/);
  assert.match(consent, /ad_user_data:\s*"denied"/);
  assert.match(consent, /ad_personalization:\s*"denied"/);
  assert.match(site, /adsEnabled:\s*true/);
  assert.match(ads, /enabled:\s*true/);
  assert.match(ads, /publisherId:\s*"ca-pub-3911157640549350"/);
  assert.match(ads, /manualSlotsEnabled:\s*false/);
  assert.match(layout, /AdSenseScript/);
});

test("AdSense is route-gated away from sensitive and trust pages when built", () => {
  if (!fs.existsSync("dist/articles/four-noble-truths-explained-simply/index.html")) {
    console.warn("dist HTML is missing; run npm run build before this full validation test.");
    return;
  }

  const allowedArticle = read("dist/articles/four-noble-truths-explained-simply/index.html");
  const allowedLearn = read("dist/learn/buddhism-101/what-is-mindfulness/index.html");
  assert.match(allowedArticle, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-3911157640549350/);
  assert.match(allowedLearn, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-3911157640549350/);

  for (const file of [
    "dist/privacy-policy/index.html",
    "dist/search/index.html",
    "dist/daily-reflections/today/index.html",
    "dist/quotes/mindfulness/index.html",
    "dist/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/index.html",
    "dist/meditation/breathing-meditation/index.html",
    "dist/articles/how-to-meditate-for-anxiety/index.html",
    "dist/articles/dhammapada-verse-1-meaning/index.html",
    "dist/learn/buddhism-101/five-hindrances-in-buddhism/index.html"
  ]) {
    assert.equal(read(file).includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), false, `${file} should not load AdSense`);
  }
});

test("required validation scripts are present", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const script of [
    "typecheck",
    "lint",
    "test",
    "audit:seo",
    "audit:content",
    "audit:dependencies",
    "audit:browser",
    "audit:lighthouse",
    "validate",
    "validate:release"
  ]) {
    assert.ok(pkg.scripts[script], `missing ${script} script`);
  }
});

test("robots manifest and security headers are source-controlled", () => {
  const robots = read("public/robots.txt");
  const manifest = JSON.parse(read("public/site.webmanifest"));
  const headers = read("public/_headers");
  assert.match(robots, /Sitemap: https:\/\/echobuddha\.com\/sitemap\.xml/);
  assert.equal(manifest.name, "Echo Buddha");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.length >= 3);
  assert.match(headers, /X-Content-Type-Options:\s*nosniff/);
  assert.match(headers, /Referrer-Policy:\s*strict-origin-when-cross-origin/);
  assert.match(headers, /X-Frame-Options:\s*DENY/);
  assert.match(headers, /Content-Security-Policy-Report-Only:/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /pagead2\.googlesyndication\.com/);
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
