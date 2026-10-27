import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { collectBing } from "../scripts/collect-bing.mjs";

test("Bing reporting uses only approved JSON read methods and excludes credentials and foreign sites", async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "eb-bing-"));
  const calls = [];
  try {
    const summary = await collectBing({ key: "private-test-key", out, fetcher: async url => {
      calls.push(url.pathname);
      assert.match(url.origin, /^https:\/\/ssl\.bing\.com$/);
      assert.ok(!url.pathname.includes("/pox/") && !url.pathname.includes("/soap/"));
      const d = url.pathname.endsWith("GetUserSites") ? [{ Url: "https://echobuddha.com/", IsVerified: true, AuthenticationCode: "never-export" }, { Url: "https://unrelated.invalid/", AuthenticationCode: "foreign-secret" }]
        : url.pathname.endsWith("GetRankAndTrafficStats") ? [{ Clicks: 2, Impressions: 40, Date: "/Date(1792713600000)/" }] : [];
      return { status: 200, json: async () => ({ d }) };
    } });
    assert.equal(calls.length, 4);
    assert.equal(summary.verified, true);
    assert.equal(summary.traffic.clicks, 2);
    for (const file of ["raw.json", "summary.json"]) {
      const body = fs.readFileSync(path.join(out, file), "utf8");
      assert.ok(!/private-test-key|never-export|foreign-secret|unrelated.invalid/.test(body));
    }
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test("optional exact-URL diagnostics use the read endpoint and export only public crawl fields", async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "eb-bing-url-"));
  try {
    const summary = await collectBing({ key: "private-test-key", out, diagnosticUrls: ["https://echobuddha.com/daily-reflections/"], fetcher: async url => ({ status: 200, json: async () => ({ d: url.pathname.endsWith("GetUserSites") ? [{ Url: "https://echobuddha.com/", IsVerified: true }] : url.pathname.endsWith("GetUrlInfo") ? { IsPage: true, HttpStatus: 200, LastCrawledDate: "/Date(1)/", AuthenticationCode: "must-not-export" } : [] }) }) });
    assert.equal(summary.urlDiagnostics[0].httpStatus, 200);
    assert.equal(summary.urlDiagnostics[0].isPage, true);
    assert.match(summary.urlDiagnostics[0].note, /not an indexed-status assertion/);
    for (const file of ["raw.json", "summary.json"]) assert.doesNotMatch(fs.readFileSync(path.join(out, file), "utf8"), /private-test-key|must-not-export/);
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});
