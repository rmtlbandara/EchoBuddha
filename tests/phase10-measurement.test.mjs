import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const audit = "docs/audits/adsense-rejection-2026-08/phase-10-search-console-measurement";
const read = (name) => fs.readFileSync(`${audit}/${name}`, "utf8");

test("Phase 10 measurement evidence preserves aggregate and privacy boundaries", () => {
  const report = read("ECHO_BUDDHA_SEARCH_CONSOLE_REAL_WORLD_MEASUREMENT_REPORT.md");
  const privacy = read("phase-10-query-privacy-coverage.csv");
  assert.match(report, /Page-tab impressions were never used as property totals/);
  assert.match(report, /No phase is credited causally/);
  assert.match(report, /zero supplied performance days after the final August 13 release/i);
  assert.match(privacy, /6\.67%/);
  assert.match(privacy, /46\.04%/);
});

test("Phase 10 protects every route and records zero production remediation", () => {
  const protection = read("MASTER_PRE_PHASE11_PROTECTION_REGISTER.csv").trimEnd().split(/\r?\n/);
  const report = read("ECHO_BUDDHA_SEARCH_CONSOLE_REAL_WORLD_MEASUREMENT_REPORT.md");
  assert.equal(protection.length, 337);
  assert.match(report, /ZERO production content, URL, indexability, navigation, consent or AdSense changes/);
  assert.match(report, /Production was not deployed/);
});
