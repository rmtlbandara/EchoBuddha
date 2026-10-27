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

test("only substantially revised learning pages receive the new truthful modification date", () => {
  const routes = ["learn/buddhist-dictionary/karuna", "learn/buddhist-dictionary/compassion", "learn/buddhist-dictionary/sati", "learn/buddhism-101/what-is-mindfulness", "meditation/5-minute-meditation-practice", "meditation/10-minute-meditation-practice"];
  for (const route of routes) {
    const html = fs.readFileSync(`dist/${route}/index.html`, "utf8");
    assert.match(html, /datetime="2026-10-27"/, route);
    if (!route.includes("dictionary")) assert.match(html, /"dateModified":"2026-10-27"/, route);
    assert.doesNotMatch(html, /"datePublished":"2026-10-27"/, "Original publication date must not be invented");
  }
  const unchanged = fs.readFileSync("dist/learn/buddhist-dictionary/metta/index.html", "utf8");
  assert.doesNotMatch(unchanged, /datetime="2026-10-27"/);
});
