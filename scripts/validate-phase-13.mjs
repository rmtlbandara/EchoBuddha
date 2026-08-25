import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dir = path.join(root, "docs/audits/adsense-recovery-phase-13-2026-08-25");
const read = (name) => fs.readFileSync(path.join(dir, name), "utf8");
const json = (name) => JSON.parse(read(name));
const checks = [];
const check = (name, pass, evidence = "") => checks.push({ name, pass: Boolean(pass), evidence });

const required = [
  "ECHO_BUDDHA_PHASE_13_SKIP_VALIDATION.md",
  "ECHO_BUDDHA_PHASE_13_METHOD_MANIFEST.json",
  "ECHO_BUDDHA_PHASE_13_INDEPENDENT_VALIDATION.json",
  "ECHO_BUDDHA_PHASE_13_CONTROLLED_EXPANSION_REPORT.md",
  "ECHO_BUDDHA_PHASE_13_PHASE_14_HANDOFF.md",
  "ECHO_BUDDHA_PHASE_13_VALIDATION.json"
];
check("required artifacts", required.every((name) => fs.existsSync(path.join(dir, name)) && read(name).length > 100), `${required.length}/${required.length}`);
const skip = read(required[0]);
const manifest = json(required[1]);
const independent = json(required[2]);
const report = read(required[3]);
const validation = json(required[5]);
check("Phase 12 decision honored", skip.includes("PHASE_13_REQUIRED = NO"));
check("successful zero-expansion status", validation.status === "PASS_NO_EXPANSION_REQUIRED");
check("zero new indexable URLs", validation.new_indexable_urls_created === 0 && manifest.new_indexable_urls_created === 0);
check("zero existing enhancements", validation.existing_pages_enhanced === 0 && manifest.existing_pages_enhanced === 0);
check("independent review", independent.status === "PASS_NO_EXPANSION_REQUIRED" && independent.checks_passed === independent.checks_total && independent.checks_total === 10);
check("22-section report", Array.from({ length: 22 }, (_, i) => report.includes(`## ${i + 1}.`)).every(Boolean));
check("no meaningless expansion artifacts", !["ECHO_BUDDHA_PHASE_13_GAP_INVENTORY.csv", "ECHO_BUDDHA_PHASE_13_CONTENT_REGISTRY.csv", "ECHO_BUDDHA_PHASE_13_APPROVED_CONTENT_BRIEFS.md"].some((name) => fs.existsSync(path.join(dir, name))));
check("people-first sources", manifest.source_review.length === 2 && manifest.source_review.every((item) => item.url.startsWith("https://")));
check("production and advertising boundaries", Object.values(manifest.boundaries).every((value) => value === false));
check("protected Phase 3 checkpoint", execFileSync("git", ["merge-base", "--is-ancestor", "2fb776a989aca32da70b8bbdf972a24da8b30fd0", "HEAD"], { cwd: root }).length === 0);

for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}${item.evidence ? `: ${item.evidence}` : ""}`);
const failed = checks.filter((item) => !item.pass);
if (failed.length) process.exitCode = 1;
else console.log(`Phase 13 validation passed: ${checks.length}/${checks.length}; no expansion required.`);
