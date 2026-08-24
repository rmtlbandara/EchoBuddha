import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

test("analytics requires affirmative consent and advertising storage remains denied", () => {
  const layout = read("src/layouts/Layout.astro");
  const consent = read("src/components/ConsentManager.astro");
  const site = read("src/data/site.ts");
  const ads = read("src/data/ads.ts");

  assert.equal(layout.includes("googletagmanager.com/gtag/js"), false);
  assert.match(consent, /else \{\s*openPanel\(\);\s*\}/);
  assert.doesNotMatch(consent, /if \(!preference\) writePreference\(true\)/);
  assert.match(consent, /It stays off unless you accept/);
  assert.match(consent, /\.consent-panel\[hidden\]/);
  assert.match(consent, /analytics_storage:\s*"denied"/);
  assert.match(consent, /ad_storage:\s*"denied"/);
  assert.match(consent, /ad_user_data:\s*"denied"/);
  assert.match(consent, /ad_personalization:\s*"denied"/);
  assert.match(consent, /ga-disable-\$\{analyticsId\}/);
  assert.match(site, /adsEnabled:\s*true/);
  assert.match(ads, /enabled:\s*true/);
  assert.match(ads, /publisherId:\s*"ca-pub-3911157640549350"/);
  assert.match(ads, /runtimeScriptEnabled:\s*false/);
  assert.match(ads, /manualSlotsEnabled:\s*false/);
  assert.match(layout, /AdSenseScript/);
});

test("AdSense uses no-network verification and the runtime script is absent from every built page", () => {
  if (!fs.existsSync("dist/articles/four-noble-truths-explained-simply/index.html")) {
    console.warn("dist HTML is missing; run npm run build before this full validation test.");
    return;
  }

  const htmlFiles = fs.readdirSync("dist", { recursive: true })
    .filter((file) => String(file).endsWith(".html"))
    .map((file) => `dist/${file}`);
  assert.ok(htmlFiles.length >= 300);
  for (const file of htmlFiles) {
    assert.equal(read(file).includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"), false, `${file} must not load the AdSense runtime`);
  }
  assert.match(read("dist/index.html"), /<meta name="google-adsense-account" content="ca-pub-3911157640549350"/);
  assert.equal(read("public/ads.txt").trim(), "google.com, pub-3911157640549350, DIRECT, f08c47fec0942fa0");
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
  assert.match(robots, /User-agent:\s*Mediapartners-Google/);
  assert.match(robots, /User-agent:\s*Mediapartners-Google\s+Allow:\s*\//);
  assert.equal(manifest.name, "Echo Buddha");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.length >= 3);
  assert.match(headers, /X-Content-Type-Options:\s*nosniff/);
  assert.match(headers, /Referrer-Policy:\s*strict-origin-when-cross-origin/);
  assert.match(headers, /X-Frame-Options:\s*DENY/);
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.doesNotMatch(headers, /pagead2\.googlesyndication\.com/);
  assert.match(headers, /\/_astro\/\*/);
  assert.match(headers, /max-age=31536000, immutable/);
  assert.match(headers, /workers\.dev\/\*/);
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

test("Phase 5 keeps every quote permalink useful while requiring explicit standalone Search approval", () => {
  if (!fs.existsSync("dist/sitemap.xml")) {
    console.warn("dist HTML is missing; run npm run build before this full validation test.");
    return;
  }

  const sitemap = read("dist/sitemap.xml");
  const searchIndex = read("dist/search-index.json");
  const generatedQuotePath = "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/";
  const authoredQuotePath = "/quotes/mindfulness/begin-the-day-with-awareness/";
  const dailyPath = "/daily-reflections/one-honest-breath/";
  const generatedQuote = read(`dist${generatedQuotePath}index.html`);
  const authoredQuote = read(`dist${authoredQuotePath}index.html`);
  const daily = read(`dist${dailyPath}index.html`);

  assert.match(generatedQuote, /<meta name="robots" content="noindex, follow"/);
  assert.match(authoredQuote, /<meta name="robots" content="noindex, follow"/);
  assert.match(daily, /<meta name="robots" content="noindex, follow"/);
  assert.match(generatedQuote, new RegExp(`<link rel="canonical" href="https://echobuddha.com${generatedQuotePath}"`));
  assert.match(daily, new RegExp(`<link rel="canonical" href="https://echobuddha.com${dailyPath}"`));
  assert.equal(sitemap.includes(`https://echobuddha.com${generatedQuotePath}`), false);
  assert.equal(sitemap.includes(`https://echobuddha.com${dailyPath}`), false);
  assert.equal(sitemap.includes(`https://echobuddha.com${authoredQuotePath}`), false);
  assert.equal(sitemap.includes("https://echobuddha.com/quotes/"), true);
  assert.equal(sitemap.includes("https://echobuddha.com/quotes/letting-go/"), true);
  assert.equal(searchIndex.includes(generatedQuotePath), true);
  assert.equal(searchIndex.includes(dailyPath), true);
});

test("content remediation governance assets remain present", () => {
  const governance = read("src/data/editorialGovernance.ts");
  assert.match(governance, /quoteId/);
  assert.match(governance, /adSuitabilityMatrix/);
  assert.match(governance, /safetyReviewChecklist/);
  assert.match(governance, /topicRoleMap/);
  assert.match(governance, /Original Echo Buddha writing/);
});
