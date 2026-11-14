import test from "node:test";
import assert from "node:assert/strict";
import { canonicalInspectionUrls, fetchSearchEvidence, summarizeGoogleInspection } from "../scripts/search-inspection-policy.mjs";

test("inspection cohort follows current sitemap additions and rejects unsafe or duplicated URLs", () => {
  const xml = '<urlset><url><loc>https://echobuddha.com/learn/buddhist-dictionary/vedana/</loc></url></urlset>';
  assert.deepEqual(canonicalInspectionUrls(xml), ["https://echobuddha.com/learn/buddhist-dictionary/vedana/"]);
  for (const bad of ["https://other.example/", "https://echobuddha.com/?token=x", "https://echobuddha.com/#x"]) assert.throws(() => canonicalInspectionUrls(xml.replace("https://echobuddha.com/learn/buddhist-dictionary/vedana/", bad)));
  assert.throws(() => canonicalInspectionUrls(xml + xml), /Duplicate/);
});

test("transient timeout and rate limit recover within bounded attempts and honor retry delay", async () => {
  let calls = 0; const delays = [];
  const response = await fetchSearchEvidence("https://example.test/", {}, {
    fetcher: async () => { calls++; if (calls === 1) throw new Error("private transport details"); return new Response("{}", {status: calls === 2 ? 429 : 200, headers:{"retry-after":"3"}}); },
    sleep: async delay => delays.push(delay)
  });
  assert.equal(response.status, 200); assert.equal(calls, 3); assert.deepEqual(delays, [1000, 3000]);
});

test("persistent transport failures stop and cannot disclose credential-bearing exception messages", async () => {
  let calls = 0;
  await assert.rejects(fetchSearchEvidence("https://example.test/?apikey=private", {}, {fetcher:async () => { calls++; throw new Error("apikey=private"); },sleep:async () => {}}), error => !error.message.includes("private") && /bounded transport retries/.test(error.message));
  assert.equal(calls, 4);
});

test("authentication and permanent client errors are not repeatedly retried", async () => {
  for (const status of [400, 401, 403]) {
    let calls = 0;
    const response = await fetchSearchEvidence("https://example.test/", {}, {fetcher:async () => {calls++;return new Response("{}",{status});},sleep:async () => {throw new Error("Unexpected retry");}});
    assert.equal(response.status, status); assert.equal(calls, 1);
  }
});

test("public inspection summary keeps unknowns explicit and excludes private referring pages or errors", () => {
  const summary = summarizeGoogleInspection({inspectionUrl:"https://echobuddha.com/",httpStatus:200,inspectionResult:{indexStatusResult:{verdict:"PASS",coverageState:"Submitted and indexed",googleCanonical:"https://echobuddha.com/",referringUrls:["private.example"]},privateData:"secret"}});
  assert.equal(summary.verdict,"PASS"); assert.equal(summary.lastCrawlTime,null);
  assert.equal(JSON.stringify(summary).includes("private"),false);
  assert.equal(summarizeGoogleInspection({httpStatus:403,error:{status:"PERMISSION_DENIED",message:"secret"}}).coverageState,"UNKNOWN");
});
