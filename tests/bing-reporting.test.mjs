import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { collectBing } from "../scripts/collect-bing.mjs";
import { bingPriorityCohort } from "../scripts/search-inspection-policy.mjs";

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

test("Bing priority diagnostics include all four new owners and remain a bounded canonical cohort", () => {
  const urls=[...fs.readFileSync('dist/sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  const cohort=bingPriorityCohort(urls);assert.equal(cohort.length,10);
  for(const slug of ['five-remembrances-an-5-57','two-arrows-sn-36-6','vedana','appreciative-joy-when-comparison-hurts']) assert.ok(cohort.some(url=>url.includes('/'+slug+'/')));
  assert.ok(cohort.every(url=>urls.includes(url)));
});

test("Bing diagnostics pace requests and stop on typed HTTP-400 throttling without disclosing raw errors", async () => {
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'eb-bing-limit-'));const delays=[];let diagnostics=0;
  try{
    const summary=await collectBing({key:'private-key',out,diagnosticUrls:['https://echobuddha.com/','https://echobuddha.com/articles/','https://echobuddha.com/learn/'],sleep:async ms=>delays.push(ms),fetcher:async url=>{
      const diagnostic=url.pathname.endsWith('GetUrlInfo');if(diagnostic)diagnostics++;
      const limited=diagnostic&&diagnostics===2;
      return {status:limited?400:200,json:async()=>limited?{ErrorCode:4,Message:'secret error with private-key'}:{d:url.pathname.endsWith('GetUserSites')?[{Url:'https://echobuddha.com/',IsVerified:true}]:diagnostic?{IsPage:true}:[]}};
    }});
    assert.deepEqual(delays,[7000]);assert.equal(diagnostics,2);assert.equal(summary.urlDiagnostics[1].classification,'RATE_LIMITED');
    assert.equal(summary.urlDiagnostics[2].status,'NOT_ATTEMPTED');assert.equal(summary.urlDiagnostics[2].apiErrorCode,4);
    assert.doesNotMatch(fs.readFileSync(path.join(out,'summary.json'),'utf8'),/private-key|secret error/);
  }finally{fs.rmSync(out,{recursive:true,force:true});}
});
