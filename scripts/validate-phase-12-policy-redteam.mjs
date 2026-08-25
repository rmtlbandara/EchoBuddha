import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ADSENSE } from "../src/data/ads.ts";
import { POLICY_GOVERNANCE, PHASE_12_REQUIRED_TRUE_CONTROLS } from "../src/data/policy-governance.mjs";

const root = process.cwd();
const dir = path.join(root, "docs/audits/adsense-recovery-phase-12-2026-08-25");
const required = [
  "ECHO_BUDDHA_PHASE_12_POLICY_SOURCE_MANIFEST.md", "ECHO_BUDDHA_PHASE_12_POLICY_CORPUS.csv",
  "ECHO_BUDDHA_PHASE_12_SEARCH_SPAM_MATRIX.csv", "ECHO_BUDDHA_PHASE_12_SCALED_CONTENT_REDTEAM.csv",
  "ECHO_BUDDHA_PHASE_12_PUBLISHER_POLICY_MATRIX.csv", "ECHO_BUDDHA_PHASE_12_PUBLISHER_RESTRICTIONS_MATRIX.csv",
  "ECHO_BUDDHA_PHASE_12_CONTENT_SAFETY_AUDIT.csv", "ECHO_BUDDHA_PHASE_12_IP_COPYRIGHT_AUDIT.csv",
  "ECHO_BUDDHA_PHASE_12_LINK_POLICY_AUDIT.csv", "ECHO_BUDDHA_PHASE_12_CLOAKING_REDIRECT_REDTEAM.csv",
  "ECHO_BUDDHA_PHASE_12_HIDDEN_TEXT_LINK_AUDIT.csv", "ECHO_BUDDHA_PHASE_12_INVALID_TRAFFIC_READINESS.md",
  "ECHO_BUDDHA_PHASE_12_GOOGLE_ACCOUNT_EVIDENCE.md", "ECHO_BUDDHA_PHASE_12_REDTEAM_FINDINGS.csv",
  "ECHO_BUDDHA_PHASE_12_PROSECUTION_CASE.md", "ECHO_BUDDHA_PHASE_12_DEFENSE_AND_EVIDENCE.md",
  "ECHO_BUDDHA_PHASE_12_LOW_VALUE_REJECTION_RECONSTRUCTION.md", "ECHO_BUDDHA_PHASE_12_PHASE_14_HANDOFF.md",
  "ECHO_BUDDHA_PHASE_12_PHASE_13_DECISION.md", "ECHO_BUDDHA_PHASE_12_POLICY_GOVERNANCE.md",
  "ECHO_BUDDHA_PHASE_12_VALIDATION.json", "ECHO_BUDDHA_PHASE_12_INDEPENDENT_VALIDATION.json",
  "ECHO_BUDDHA_PHASE_12_METHOD_MANIFEST.json", "ECHO_BUDDHA_PHASE_12_SEARCH_SPAM_PUBLISHER_POLICY_REDTEAM_REPORT.md",
  "ECHO_BUDDHA_PHASE_12_LOCAL_POLICY_HTTP_VALIDATION.json", "ECHO_BUDDHA_PHASE_12_RENDERED_POLICY_VALIDATION.json",
  "ECHO_BUDDHA_PHASE_12_RED_TEAM_VALIDATION.json", "ECHO_BUDDHA_PHASE_12_SECRET_SCAN.json",
  "ECHO_BUDDHA_PHASE_12_WEAKEST_INVENTORY_REVIEW.csv", "ECHO_BUDDHA_PHASE_12_ELIGIBLE_CANDIDATE_REDTEAM.csv",
  "ECHO_BUDDHA_PHASE_12_RANDOM_INVENTORY_REVIEW.csv", "ECHO_BUDDHA_PHASE_12_SECOND_REVIEW_SAMPLE.csv",
  "ECHO_BUDDHA_PHASE_12_REPOSITORY_CODE_SCAN.csv", "source-evidence/account-and-public-observations.json"
];
const checks = [];
const check = (name, pass, evidence = "") => checks.push({ name, pass: Boolean(pass), evidence });
const read = (name) => fs.readFileSync(path.join(dir, name), "utf8");
for (const name of required) check(`artifact ${name}`, fs.existsSync(path.join(dir, name)) && fs.statSync(path.join(dir, name)).size > 0);
const validation = JSON.parse(read("ECHO_BUDDHA_PHASE_12_VALIDATION.json"));
const independent = JSON.parse(read("ECHO_BUDDHA_PHASE_12_INDEPENDENT_VALIDATION.json"));
const redTeam = JSON.parse(read("ECHO_BUDDHA_PHASE_12_RED_TEAM_VALIDATION.json"));
const http = JSON.parse(read("ECHO_BUDDHA_PHASE_12_LOCAL_POLICY_HTTP_VALIDATION.json"));
const rendered = JSON.parse(read("ECHO_BUDDHA_PHASE_12_RENDERED_POLICY_VALIDATION.json"));
const secret = JSON.parse(read("ECHO_BUDDHA_PHASE_12_SECRET_SCAN.json"));
const report = read("ECHO_BUDDHA_PHASE_12_SEARCH_SPAM_PUBLISHER_POLICY_REDTEAM_REPORT.md");
const account = read("ECHO_BUDDHA_PHASE_12_GOOGLE_ACCOUNT_EVIDENCE.md");
const lines = (name) => read(name).split(/\r?\n/).filter(Boolean).length - 1;
check("final Phase 12 status", validation.status === "PASS_WITH_EXPLICIT_HOLDS", validation.status);
check("Phase 11 checkpoint", validation.starting_checkpoint.phase_11_status === "PASS_WITH_EXPLICIT_HOLDS" && validation.starting_checkpoint.phase_11_commit === "916f2bef3e477458cb4fa787afe6a88c77fa4bc3");
check("complete corpus", validation.corpus.total === 344 && validation.corpus.html === 335 && validation.corpus.indexable === 149 && validation.corpus.noindex === 186 && validation.corpus.eligible_candidates === 7, JSON.stringify(validation.corpus));
check("targeted and random review", validation.corpus.full_targeted_review >= 68 && validation.corpus.worst_reviewed === 20 && validation.corpus.first_random_sample === 20 && validation.corpus.second_random_sample === 20);
check("GSC Manual Actions UI evidence", validation.account_evidence.gsc_manual_actions === "UI_VERIFIED_NO_ISSUES_DETECTED" && account.includes("No issues detected | GSC_UI_VERIFIED"));
check("GSC Security Issues UI evidence", validation.account_evidence.gsc_security_issues === "UI_VERIFIED_NO_ISSUES_DETECTED");
check("AdSense account evidence and limitation", validation.account_evidence.adsense_sites === "NEEDS_ATTENTION_LOW_VALUE_CONTENT" && validation.account_evidence.adsense_policy_center === "NO_CURRENT_ISSUES_WITH_EXPLICIT_LIMITATION" && account.includes("not proof that no Publisher Policy issue exists"));
check("full policy matrices", lines("ECHO_BUDDHA_PHASE_12_SEARCH_SPAM_MATRIX.csv") === 16 && lines("ECHO_BUDDHA_PHASE_12_PUBLISHER_POLICY_MATRIX.csv") === 19 && lines("ECHO_BUDDHA_PHASE_12_PUBLISHER_RESTRICTIONS_MATRIX.csv") === 12);
check("complete content/IP/link reviews", lines("ECHO_BUDDHA_PHASE_12_CONTENT_SAFETY_AUDIT.csv") === 335 && validation.checks.ip_rows === 380 && validation.checks.external_link_rows === 190);
check("HTTP cloaking/redirect parity", http.status === "PASS" && http.routes === 18 && http.failures.length === 0 && http.observations.every((row) => row.parity));
check("rendered policy review", rendered.status === "PASS" && rendered.routes_passed === 19 && rendered.search_injection.result === "PASS" && rendered.required_signals.real_ad_runtime === 0 && rendered.required_signals.empty_ad_placeholders === 0);
check("independent second review", independent.status === "PASS" && independent.checks.length === 13 && independent.failures.length === 0 && independent.sample.overlap_with_first === 0);
check("60-attack red team", redTeam.status === "PASS" && redTeam.attacks === 60 && redTeam.bypasses === 0);
check("no material findings", validation.findings.p0 === 0 && validation.findings.p1 === 0 && validation.findings.p2 === 0 && validation.findings.unresolved_material === 0);
check("secret scan", secret.status === "PASS" && secret.findings.length === 0);
check("67-section report", (report.match(/^## \d+\./gm) ?? []).length === 67 && report.includes("PHASE_12_STATUS = PASS_WITH_EXPLICIT_HOLDS"));
check("Phase 13 decision", validation.phase_13_required === false && read("ECHO_BUDDHA_PHASE_12_PHASE_13_DECISION.md").includes("PHASE_13_REQUIRED = NO"));
check("four explicit deployment/account holds", validation.explicit_holds.length === 4 && validation.explicit_holds.includes("ADSENSE_CMP_CONFIGURATION_REVERIFY_BEFORE_REAL_AD_SERVING"));
check("no prohibited boundary action", Object.values(validation.boundaries).every((value) => value === false));
check("real ads and Auto Ads off", ADSENSE.servingEnabled === false && ADSENSE.runtimeScriptEnabled === false && ADSENSE.autoAdsEnabled === false && ADSENSE.manualSlotsEnabled === false);
check("fail-closed policy governance", POLICY_GOVERNANCE.repositoryPrivacy === "PRIVATE_BY_POLICY" && POLICY_GOVERNANCE.realAdServingDuringRecovery === false && PHASE_12_REQUIRED_TRUE_CONTROLS.every((name) => POLICY_GOVERNANCE[name] === true));
check("completion gates", validation.completion.local_http.startsWith("PASS") && validation.completion.rendered_browser.startsWith("PASS") && validation.completion.independent.startsWith("PASS") && validation.completion.red_team.startsWith("PASS") && validation.completion.secret_scan.startsWith("PASS"), JSON.stringify(validation.completion));
execFileSync("git", ["merge-base", "--is-ancestor", "2fb776a989aca32da70b8bbdf972a24da8b30fd0", "HEAD"], { cwd: root });
execFileSync("git", ["merge-base", "--is-ancestor", "916f2bef3e477458cb4fa787afe6a88c77fa4bc3", "HEAD"], { cwd: root });
check("protected checkpoints remain ancestors", true);
const failed = checks.filter((item) => !item.pass);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}${item.evidence ? `: ${item.evidence}` : ""}`);
if (failed.length) process.exitCode = 1;
else console.log(`Phase 12 policy red-team validation passed: ${checks.length}/${checks.length} checks.`);
