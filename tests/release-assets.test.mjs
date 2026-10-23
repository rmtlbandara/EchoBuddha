import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { canonicalSlashRedirects, prepareReleaseAssets } from "../scripts/prepare-release-assets.mjs";

test("slash redirects enumerate actual HTML routes without catching assets or unknown paths", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "eb-release-"));
  try {
    for (const file of ["index.html", "learn/index.html", "search/index.html", "images/picture.png", "api/data.json", "404.html", "has.dot/index.html"]) {
      fs.mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
      fs.writeFileSync(path.join(directory, file), "test");
    }
    fs.writeFileSync(path.join(directory, "_redirects"), "/old/ /learn/ 301\n");
    assert.deepEqual(canonicalSlashRedirects(directory), ["/learn /learn/ 308", "/search /search/ 308"]);
    prepareReleaseAssets(directory, { sha: "a".repeat(40), ref: "refs/heads/main" });
    const redirects = fs.readFileSync(path.join(directory, "_redirects"), "utf8");
    assert.ok(redirects.startsWith("/old/ /learn/ 301\n"));
    assert.ok(!redirects.includes("*"));
    assert.equal(JSON.parse(fs.readFileSync(path.join(directory, "release.json"))).sha, "a".repeat(40));
    assert.throws(() => prepareReleaseAssets(directory, { sha: "main" }), /full Git SHA/);
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test("unknown production paths serve the existing noindex HTML error page with a 404 status", () => {
  const config = JSON.parse(fs.readFileSync("wrangler.jsonc", "utf8"));
  assert.equal(config.assets.not_found_handling, "404-page");
  const html = fs.readFileSync("dist/404.html", "utf8");
  assert.match(html, /<h1\b/);
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(html, /rel="canonical"/);
});
