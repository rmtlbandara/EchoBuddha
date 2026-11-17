import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseCsv, evaluate, latestByKey, checkYouTube } from "../scripts/publication-watch.mjs";

const manifest = {
  watch_until_utc: "2026-12-02T00:00:00Z",
  thresholds_minutes: { manual_reminder_before_due: 90, youtube_public_after_due: 20, unrecorded_after_due: 1080 },
  items: [
    { retry_key: "reel", due_utc: "2026-11-19T14:30:00Z", mode: "manual_native" },
    { retry_key: "yt", due_utc: "2026-11-19T14:00:00Z", mode: "platform_scheduled", youtube_id: "abc" },
    { retry_key: "story", due_utc: "2026-11-19T15:00:00Z", mode: "platform_scheduled" },
  ],
};
const row = (retry_key, status) => ({ retry_key, status });
const kinds = (result) => result.alerts.map((a) => `${a.kind}:${a.item.retry_key}`).sort();

test("parses quoted CSV fields with commas, quotes and newlines", () => {
  const rows = parseCsv('a,b,c\n1,"x, ""y""\nz",3\n');
  assert.deepEqual(rows, [{ a: "1", b: 'x, "y"\nz', c: "3" }]);
});

test("the last ledger row for a key is its current state", () => {
  const latest = latestByKey([row("k", "SCHEDULED"), row("k", "PUBLISHED_VERIFIED")]);
  assert.equal(latest.get("k").status, "PUBLISHED_VERIFIED");
});

test("reminds about a manual Instagram Reel only in the window before it is due", () => {
  const rows = [row("reel", "READY"), row("yt", "SCHEDULED"), row("story", "SCHEDULED")];
  assert.deepEqual(kinds(evaluate({ manifest, ledgerRows: rows, now: new Date("2026-11-19T13:45:00Z") })), ["MANUAL_DUE_SOON:reel"]);
  assert.deepEqual(kinds(evaluate({ manifest, ledgerRows: rows, now: new Date("2026-11-19T12:00:00Z") })), []);
  const done = [row("reel", "PUBLISHED_VERIFIED"), row("yt", "SCHEDULED"), row("story", "SCHEDULED")];
  assert.deepEqual(kinds(evaluate({ manifest, ledgerRows: done, now: new Date("2026-11-19T13:45:00Z") })), []);
});

test("alerts when a scheduled YouTube video is not public after its slot", () => {
  const rows = [row("reel", "PUBLISHED_VERIFIED"), row("yt", "SCHEDULED"), row("story", "SCHEDULED")];
  const now = new Date("2026-11-19T14:30:00Z");
  assert.deepEqual(kinds(evaluate({ manifest, ledgerRows: rows, now, youtube: { abc: { public: false, http: 401 } } })), ["YOUTUBE_NOT_PUBLIC:yt"]);
  assert.deepEqual(kinds(evaluate({ manifest, ledgerRows: rows, now, youtube: { abc: { public: true, http: 200 } } })), []);
});

test("alerts when an item is still unverified in the ledger 18 hours after due, unless YouTube confirms it live", () => {
  const rows = [row("reel", "READY"), row("yt", "SCHEDULED"), row("story", "PUBLISHED_UNVERIFIED")];
  const now = new Date("2026-11-20T09:30:00Z");
  assert.deepEqual(kinds(evaluate({ manifest, ledgerRows: rows, now, youtube: { abc: { public: true, http: 200 } } })), ["NOT_VERIFIED_IN_LEDGER:reel", "NOT_VERIFIED_IN_LEDGER:story"]);
});

test("cancelled items and an expired watch window never alert", () => {
  const rows = [row("reel", "CANCELLED_DUPLICATE"), row("yt", "NOT_APPROVED"), row("story", "CANCELLED_DUPLICATE")];
  assert.deepEqual(kinds(evaluate({ manifest, ledgerRows: rows, now: new Date("2026-11-21T00:00:00Z") })), []);
  const expired = evaluate({ manifest, ledgerRows: [], now: new Date("2026-12-03T00:00:00Z") });
  assert.equal(expired.expired, true);
  assert.deepEqual(expired.alerts, []);
});

test("YouTube check treats only HTTP 200 as public and survives network errors", async () => {
  assert.deepEqual(await checkYouTube("x", async () => ({ status: 200 })), { public: true, http: 200 });
  assert.deepEqual(await checkYouTube("x", async () => ({ status: 401 })), { public: false, http: 401 });
  const failed = await checkYouTube("x", async () => { throw new Error("offline"); });
  assert.equal(failed.public, false);
});

test("the real November manifest matches the ledger and stays credential-free", () => {
  const real = JSON.parse(fs.readFileSync("docs/marketing/2026-11/publication-watch.json", "utf8"));
  const keys = new Set(parseCsv(fs.readFileSync(real.ledger, "utf8")).map((r) => r.retry_key));
  for (const item of real.items) {
    assert.ok(keys.has(item.retry_key), `${item.retry_key} missing from ledger`);
    assert.ok(Object.hasOwn(real.modes, item.mode), `${item.retry_key}: unknown mode`);
    assert.ok(!Number.isNaN(Date.parse(item.due_utc)), `${item.retry_key}: bad due_utc`);
  }
  const workflow = fs.readFileSync(".github/workflows/publication-watch.yml", "utf8");
  assert.doesNotMatch(workflow, /secrets\./);
  assert.match(workflow, /contents: read/);
  assert.doesNotMatch(workflow, /: write/);
});
