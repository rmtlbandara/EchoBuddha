import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const phase6 = readJson(
  "docs/audits/adsense-recovery-phase-6-2026-08-24/ECHO_BUDDHA_PHASE_6_INDEPENDENT_VALIDATION.json"
);
const phase8 = readJson(
  "docs/audits/adsense-recovery-phase-8-2026-08-24/ECHO_BUDDHA_PHASE_8_INDEPENDENT_VALIDATION.json"
);
const phase10 = readJson(
  "docs/audits/adsense-recovery-phase-10-2026-08-24/INDEPENDENT_VALIDATION.json"
);
const phase13 = readJson(
  "docs/audits/adsense-recovery-phase-13-2026-08-25/ECHO_BUDDHA_PHASE_13_INDEPENDENT_VALIDATION.json"
);
const approvals = readJson("governance/indexable-page-approvals.json").approvals;
const currentExpansion = readJson(
  "docs/audits/buddhist-questions-q1-q2-2026-09-02/VALIDATION_SUMMARY.json"
);

assert.equal(phase6.status, "PASS", "Phase 6 must remain a passing historical snapshot");
assert.equal(phase6.checks_passed, 67, "Phase 6 historical check count changed");
assert.equal(phase6.checks_failed, 0, "Phase 6 historical snapshot contains failures");

assert.equal(phase8.status, "PASS", "Phase 8 must remain a passing historical snapshot");
assert.equal(phase8.passed, 26, "Phase 8 historical check count changed");
assert.equal(phase8.failed, 0, "Phase 8 historical snapshot contains failures");

assert.equal(phase10.status, "PASS_WITH_EXPLICIT_HOLDS", "Phase 10 firewall snapshot status changed");
assert.equal(phase10.attacks_passed, 52, "Phase 10 historical attack count changed");
assert.equal(phase10.bypasses, 0, "Phase 10 historical snapshot contains a bypass");

assert.equal(phase13.status, "PASS_NO_EXPANSION_REQUIRED", "Phase 13 decision must remain historical");
assert.equal(phase13.checks_passed, 10, "Phase 13 historical check count changed");

const questionPrefix = "/learn/questions-about-buddhism/";
const expectedQuestionRoutes = [
  `${questionPrefix}did-buddha-order-buddha-images/`,
  `${questionPrefix}respecting-buddha-after-parinibbana/`
];
const approvedQuestionRoutes = approvals
  .filter((approval) => approval.route.startsWith(questionPrefix) && approval.route !== questionPrefix)
  .map((approval) => approval.route)
  .sort();

assert.deepEqual(approvedQuestionRoutes, expectedQuestionRoutes, "the post-Phase-13 question expansion must remain exactly Q1 and Q2");
for (const route of expectedQuestionRoutes) {
  const approval = approvals.find((entry) => entry.route === route);
  assert.equal(approval.status, "Approved", `${route} must have explicit approval`);
  assert.ok(approval.approvedAt > "2026-08-25", `${route} approval must remain later than Phase 13`);
}

assert.equal(currentExpansion.counts.new_indexable_detail_urls, 2);
assert.equal(currentExpansion.counts.unauthorized_extra_urls, 0);
assert.equal(currentExpansion.counts.html_after, 337);
assert.equal(currentExpansion.counts.sitemap_after, 151);

console.log("Historical snapshot boundary validation passed: frozen evidence preserved; authorized current expansion is exactly +2.");
