import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buddhistQuestions, getBuddhistQuestionPath } from "../src/data/buddhistQuestions.ts";

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
const historicalExpansion = readJson(
  "docs/audits/buddhist-questions-q1-q2-2026-09-02/VALIDATION_SUMMARY.json"
);
const historicalExpansion2 = readJson(
  "docs/audits/buddhist-questions-q3-q4-2026-09-14/VALIDATION_SUMMARY.json"
);
const currentExpansion = readJson(
  "docs/audits/buddhist-question-q5-2026-09-20/VALIDATION_SUMMARY.json"
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
const historicalQuestionRoutes = [
  `${questionPrefix}did-buddha-order-buddha-images/`,
  `${questionPrefix}respecting-buddha-after-parinibbana/`
];
const historicalExpansion2Routes = [
  `${questionPrefix}is-buddha-image-only-uddesika-cetiya/`,
  `${questionPrefix}why-no-buddha-statue-at-jetavana/`
];
const currentQuestionRoutes = [
  `${questionPrefix}why-bodhi-tree-planted-at-jetavana/`
];
const cumulativeQuestionRoutes = [...historicalQuestionRoutes, ...historicalExpansion2Routes, ...currentQuestionRoutes].sort();
const approvedQuestionRoutes = approvals
  .filter((approval) => approval.route.startsWith(questionPrefix) && approval.route !== questionPrefix)
  .map((approval) => approval.route)
  .sort();

assert.deepEqual(approvedQuestionRoutes, cumulativeQuestionRoutes, "the cumulative approved question expansion must be exactly Q1 through Q5");
assert.deepEqual(buddhistQuestions.map(getBuddhistQuestionPath).sort(), cumulativeQuestionRoutes, "the current data model must generate exactly Q1 through Q5");
assert.deepEqual(buddhistQuestions.map((question) => question.number), [1, 2, 3, 4, 5], "no Q6+ question may enter the bounded data model");

for (const route of historicalQuestionRoutes) {
  const approval = approvals.find((entry) => entry.route === route);
  assert.equal(approval.status, "Approved", `${route} must have explicit approval`);
  assert.equal(approval.approvedAt, "2026-09-02", `${route} must retain its historical Q1/Q2 authorization date`);
}
for (const route of historicalExpansion2Routes) {
  const approval = approvals.find((entry) => entry.route === route);
  assert.equal(approval.status, "Approved", `${route} must have explicit approval`);
  assert.equal(approval.approvedAt, "2026-09-14", `${route} must retain its historical Q3/Q4 authorization date`);
}
for (const route of currentQuestionRoutes) {
  const approval = approvals.find((entry) => entry.route === route);
  assert.equal(approval.status, "Approved", `${route} must have explicit approval`);
  assert.equal(approval.approvedAt, "2026-09-20", `${route} must have the Q5 authorization date`);
}

assert.equal(historicalExpansion.counts.new_indexable_detail_urls, 2);
assert.equal(historicalExpansion.counts.unauthorized_extra_urls, 0);
assert.equal(historicalExpansion.counts.html_after, 337);
assert.equal(historicalExpansion.counts.sitemap_after, 151);

assert.deepEqual(historicalExpansion2.scope.current_expansion_2.questions, [3, 4]);
assert.equal(historicalExpansion2.counts.new_indexable_detail_urls, 2);
assert.equal(historicalExpansion2.counts.unauthorized_extra_urls, 0);
assert.equal(historicalExpansion2.counts.html_before, 337);
assert.equal(historicalExpansion2.counts.html_after, 339);
assert.equal(historicalExpansion2.counts.sitemap_before, 151);
assert.equal(historicalExpansion2.counts.sitemap_after, 153);

assert.deepEqual(currentExpansion.scope.current_expansion_3.questions, [5]);
assert.deepEqual(currentExpansion.scope.cumulative_questions, [1, 2, 3, 4, 5]);
assert.equal(currentExpansion.counts.new_indexable_detail_urls, 1);
assert.equal(currentExpansion.counts.unauthorized_extra_urls, 0);
assert.equal(currentExpansion.counts.html_before, 339);
assert.equal(currentExpansion.counts.html_after, 340);
assert.equal(currentExpansion.counts.sitemap_before, 153);
assert.equal(currentExpansion.counts.sitemap_after, 154);
assert.equal(approvedQuestionRoutes.some((route) => /(?:question|q)-?\d*[6-9]|(?:question|q)-?[1-9]\d+/i.test(route)), false);

console.log("Historical snapshot boundary validation passed: frozen Phase evidence, Q1/Q2 +2, and Q3/Q4 +2 remain intact; Q5 is an independent authorized +1; cumulative scope is exactly Q1-Q5 with no Q6+.");
