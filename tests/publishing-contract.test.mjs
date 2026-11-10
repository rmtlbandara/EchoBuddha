import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("representative source-led article reaches sitemap, search, schema and IndexNow artifact", () => {
  const route = "/articles/right-speech-buddhism/";
  const html = fs.readFileSync(`dist${route}index.html`, "utf8");
  const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
  const manifest = JSON.parse(fs.readFileSync("dist/indexnow-manifest.json"));
  assert.match(html, /rel="canonical" href="https:\/\/echobuddha.com\/articles\/right-speech-buddhism\/"/);
  assert.doesNotMatch(html, /name="robots" content="noindex/);
  assert.match(html, /Echo Buddha Editorial/);
  assert.match(html, /accesstoinsight|suttacentral|dhammatalks/);
  assert.match(html, /"datePublished":"2026-06-26/);
  assert.match(sitemap, /https:\/\/echobuddha.com\/articles\/right-speech-buddhism\//);
  assert.ok(JSON.stringify(manifest).includes(`https://echobuddha.com${route}`));
  assert.ok(fs.readFileSync("dist/search-index.json", "utf8").includes(route));
});

test("substantively revised learning pages expose their actual modification dates", () => {
  const datedRoutes = {
    "learn/buddhist-dictionary/compassion": "2026-10-27",
    "learn/buddhist-dictionary/sati": "2026-10-27",
    "learn/buddhism-101/what-is-mindfulness": "2026-10-27",
    "meditation/5-minute-meditation-practice": "2026-10-27",
    "meditation/10-minute-meditation-practice": "2026-10-27",
    "learn/buddhist-dictionary/karuna": "2026-11-10",
    "learn/buddhist-dictionary/dukkha": "2026-11-10",
    "learn/buddhism-101/the-noble-eightfold-path-explained": "2026-11-10",
    "learn/buddhism-101/how-to-practice-buddhism-at-home": "2026-11-10",
    "meditation/meditation-posture-for-beginners": "2026-11-10",
    "meditation/mindfulness-in-daily-life": "2026-11-10"
  };
  const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
  for (const [route, modified] of Object.entries(datedRoutes)) {
    const html = fs.readFileSync(`dist/${route}/index.html`, "utf8");
    assert.ok(html.includes(`datetime="${modified}"`), route);
    if (!route.includes("dictionary")) assert.ok(html.includes(`"dateModified":"${modified}"`), route);
    assert.ok(!html.includes(`"datePublished":"${modified}"`), "Original publication date must not be invented");
    assert.ok(sitemap.includes(`<loc>https://echobuddha.com/${route}/</loc><lastmod>${modified}</lastmod>`), route);
  }
  const unchanged = fs.readFileSync("dist/learn/buddhist-dictionary/metta/index.html", "utf8");
  assert.doesNotMatch(unchanged, /datetime="2026-(?:10-27|11-10)"/);
  assert.ok(sitemap.includes("<loc>https://echobuddha.com/learn/buddhist-dictionary/metta/</loc></url>"));
});
