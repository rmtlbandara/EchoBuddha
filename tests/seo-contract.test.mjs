import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? htmlFiles(path.join(directory, entry.name))
    : entry.name.endsWith(".html") ? [path.join(directory, entry.name)] : []);
}
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

test("every rendered share image has actual raster dimensions matching its metadata", async () => {
  const metadata = new Map();
  for (const file of htmlFiles("dist")) {
    const html = fs.readFileSync(file, "utf8");
    const tags = [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => attributes(m[0]));
    const value = (name) => tags.find((tag) => tag.property === name || tag.name === name)?.content;
    const url = new URL(value("og:image"));
    assert.equal(url.origin, "https://echobuddha.com", file);
    assert.ok(!url.pathname.endsWith(".svg"), file);
    const asset = path.join("dist", url.pathname);
    if (!metadata.has(asset)) metadata.set(asset, await sharp(asset).metadata());
    const image = metadata.get(asset);
    assert.equal(Number(value("og:image:width")), image.width, file);
    assert.equal(Number(value("og:image:height")), image.height, file);
    assert.equal(value("twitter:image"), value("og:image"), file);
  }
});

test("publisher entities use one identity and accurate logo dimensions", async () => {
  const logo = await sharp("dist/images/publisher-logo.png").metadata();
  assert.equal(logo.width, 512); assert.equal(logo.height, 512);
  let publishers = 0;
  function inspect(node, file) {
    if (!node || typeof node !== "object") return;
    if (node["@id"] === "https://echobuddha.com/#organization") {
      publishers++;
      assert.equal(node.logo?.url, "https://echobuddha.com/images/publisher-logo.png", file);
      assert.equal(node.logo?.width, 512, file);
      assert.equal(node.logo?.height, 512, file);
      assert.equal(node.sameAs?.length, 4, file);
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach((item) => inspect(item, file));
      else if (typeof value === "object") inspect(value, file);
    }
  }
  for (const file of htmlFiles("dist")) {
    const html = fs.readFileSync(file, "utf8");
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) inspect(JSON.parse(json), file);
  }
  assert.ok(publishers > 100);
});

test("new guide dates and semantic tables match visible, non-fabricated editorial updates", () => {
  const routes = ["learn/four-noble-truths", "learn/eightfold-path", "learn/buddhism-for-beginners", "learn/buddhism-101/what-is-impermanence", "meditation/meditation-for-beginners", "meditation/loving-kindness-meditation", "learn/buddhism-101/five-precepts-buddhism", "learn/buddhism-101/three-marks-of-existence"];
  for (const route of routes) {
    const html = fs.readFileSync(`dist/${route}/index.html`, "utf8");
    assert.match(html, /<caption\b/, route);
    assert.match(html, /scope="col"/, route);
    assert.match(html, /scope="row"/, route);
    // The October 30 source correction materially revised this existing guide.
    const expectedDate = route === "learn/buddhism-101/five-precepts-buddhism" ? "2026-10-30" : "2026-10-23";
    assert.ok(html.includes(`datetime="${expectedDate}"`), `${route}: visible approved update date`);
    assert.ok(html.includes(`"dateModified":"${expectedDate}"`), `${route}: schema approved update date`);
    assert.ok(!html.includes('"@type":"FAQPage"'), route);
  }
});
