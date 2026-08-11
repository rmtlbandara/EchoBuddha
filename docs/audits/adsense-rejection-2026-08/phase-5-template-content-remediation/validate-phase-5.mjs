import { execFileSync } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-5-template-content-remediation");
const START = "4bbeef7a85d071752f9c1d0ec23e0ce1ff348505";

const parseCsv = (text) => {
  const records = []; let record = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { record.push(field); field = ""; }
    else if (char === "\n") { record.push(field); records.push(record); record = []; field = ""; }
    else if (char !== "\r") field += char;
  }
  const headers = records.shift() ?? [];
  return records.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
};
const csv = async (name) => parseCsv(await readFile(path.join(OUT, name), "utf8"));
const checks = [];
const check = (name, pass, evidence) => checks.push({ name, status: pass ? "PASS" : "FAIL", evidence });

const required = [
  "phase-5-template-risk-baseline.csv", "phase-5-page-template-risk.csv", "phase-5-structure-fingerprint-register.csv", "phase-5-introduction-pattern-review.csv",
  "phase-5-heading-pattern-review.csv", "phase-5-transition-pattern-review.csv", "phase-5-practice-scaffold-review.csv", "phase-5-example-pattern-review.csv",
  "phase-5-faq-pattern-review.csv", "phase-5-conclusion-pattern-review.csv", "phase-5-protected-language-allowlist.csv", "phase-5-remediation-queue.csv",
  "phase-5-page-change-register.csv", "phase-5-before-after-template-scores.csv", "phase-5-content-quality-preservation.csv", "phase-5-source-preservation-review.csv",
  "phase-5-safety-preservation-review.csv", "phase-5-ownership-preservation-review.csv", "phase-5-indexability-preservation-review.csv", "phase-5-structured-data-review.csv",
  "phase-5-internal-link-review.csv", "phase-5-cross-family-review.csv", "phase-5-human-editorial-review.csv", "phase-5-human-review-items.csv",
  "phase-5-phase6-handoff.csv", "phase-5-future-phase-handoff.csv", "phase-5-validation-summary.csv", "phase-5-rollback-map.csv",
  "MASTER_PRE_PHASE6_PROTECTION_REGISTER.csv", "PHASE_5_PRE_EDIT_TEMPLATE_DIAGNOSTIC.md", "ECHO_BUDDHA_TEMPLATE_CONTENT_FEEL_REMEDIATION_REPORT.md"
];
const files = new Set(await readdir(OUT));
const missing = required.filter((name) => !files.has(name));
check("required-artifacts", missing.length === 0, missing.length ? `Missing: ${missing.join(", ")}` : `${required.length}/${required.length} present`);

const pre = await csv("phase-5-page-template-risk.csv");
const post = await csv("phase-5-page-template-risk-post.csv");
const changes = await csv("phase-5-page-change-register.csv");
const quality = await csv("phase-5-content-quality-preservation.csv");
const ownership = await csv("phase-5-ownership-preservation-review.csv");
const indexability = await csv("phase-5-indexability-preservation-review.csv");
const sources = await csv("phase-5-source-preservation-review.csv");
const safety = await csv("phase-5-safety-preservation-review.csv");
const schema = await csv("phase-5-structured-data-review.csv");
const links = await csv("phase-5-internal-link-review.csv");
const protection = await csv("MASTER_PRE_PHASE6_PROTECTION_REGISTER.csv");
const validation = await csv("phase-5-validation-summary.csv");

check("pre-risk-page-count", pre.length === 336, `${pre.length}/336`);
check("post-risk-page-count", post.length === 336, `${post.length}/336`);
check("material-change-count", changes.length === 218, `${changes.length}/218`);
check("content-quality-dual-gate", quality.length === 218 && quality.every((row) => row["Final status"] === "PASS" && row["Any regression?"] === "No"), `${quality.length} rows`);
check("ownership-preserved", ownership.length === 218 && ownership.every((row) => row["Ownership drift?"] === "No"), `${ownership.length} rows`);
check("index-canonical-preserved", indexability.length === 336 && indexability.every((row) => row.Validation === "PASS" && row["Unexpected change?"] === "No"), `${indexability.length} rows`);
check("source-preserved", sources.length === 218 && sources.every((row) => row.Validation === "PASS"), `${sources.length} rows`);
check("safety-preserved", safety.length === 218 && safety.every((row) => row.Validation === "PASS"), `${safety.length} rows`);
check("structured-data-preserved", schema.length === 336 && schema.every((row) => row.Validation === "PASS"), `${schema.length} rows`);
check("internal-links", links.length === 218 && links.every((row) => row.Validation === "PASS" && row["Broken internal links"] === "0"), `${links.length} changed routes`);
check("pre-phase6-protection", protection.length === 336, `${protection.length}/336`);
check("no-unresolved-high-critical", post.every((row) => !["HIGH", "CRITICAL"].includes(row["Risk classification"])), `${post.filter((row) => ["HIGH", "CRITICAL"].includes(row["Risk classification"])).length} found`);
check("urls-canonicals-index-unchanged", changes.every((row) => row["URL changed?"] === "No" && row["Canonical changed?"] === "No" && row["Index state changed?"] === "No"), `${changes.length} changed routes`);
check("release-validation", validation.every((row) => row.Status === "PASS"), `${validation.filter((row) => row.Status !== "PASS").length} failures`);

const report = await readFile(path.join(OUT, "ECHO_BUDDHA_TEMPLATE_CONTENT_FEEL_REMEDIATION_REPORT.md"), "utf8");
const numberedSections = [...report.matchAll(/^## (\d+)\./gm)].map((match) => Number(match[1]));
check("report-47-sections", numberedSections.length === 47 && numberedSections.every((number, index) => number === index + 1), `${numberedSections.length} ordered sections`);
check("report-final-verdict", /PHASE 5 STATUS:\nCOMPLETE/.test(report) && /WAS PRODUCTION DEPLOYED\?\nNo/.test(report), "Complete; production No");

const changedFiles = execFileSync("git", ["diff", "--name-only", START], { cwd: ROOT, encoding: "utf8" }).trim().split("\n").filter(Boolean);
const sourceAllowlist = new Set([
  "src/data/site.ts", "src/pages/daily-reflections/[slug].astro", "src/pages/learn/[section]/[slug].astro",
  "src/pages/meditation/[slug].astro", "src/pages/quotes/[category]/[story].astro"
]);
const unexpectedSource = changedFiles.filter((file) => file.startsWith("src/") && !sourceAllowlist.has(file));
check("source-change-scope", unexpectedSource.length === 0, unexpectedSource.length ? unexpectedSource.join(" | ") : `${sourceAllowlist.size} approved source files only`);
check("adsense-behavior-unchanged", !changedFiles.some((file) => /AdSlot|ads|consent|privacy|Layout\.astro|package\.json|astro\.config/i.test(file)), "No ad, consent, route, or build configuration file changed");

const failures = checks.filter((item) => item.status === "FAIL");
const result = { generatedAt: new Date().toISOString(), startingCommit: START, totalChecks: checks.length, passed: checks.length - failures.length, failed: failures.length, status: failures.length ? "FAIL" : "PASS", checks };
await writeFile(path.join(OUT, "phase-5-custom-validation.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
