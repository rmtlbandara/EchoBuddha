import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-0-retroactive-baseline");
fs.mkdirSync(OUT, { recursive: true });
const capturedAt = new Date().toISOString();
const run = (command, args = []) => execFileSync(command, args, { cwd: ROOT, encoding: "utf8" }).trimEnd();
const csvEscape = (value) => /[",\n\r]/.test(String(value ?? "")) ? `"${String(value ?? "").replaceAll('"', '""')}"` : String(value ?? "");
const writeCsv = (name, headers, rows) => fs.writeFileSync(path.join(OUT, name), `${[headers, ...rows.map((row) => headers.map((h) => row[h] ?? ""))].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`);

const status = run("git", ["status", "--porcelain=v1", "--untracked-files=all"]).split("\n").filter(Boolean);
const ignored = run("git", ["status", "--ignored", "--porcelain=v1"]).split("\n").filter((line) => line.startsWith("!! "));
const modified = status.filter((line) => !line.startsWith("?? ")).map((line) => line.slice(3));
const untracked = status.filter((line) => line.startsWith("?? ")).map((line) => line.slice(3));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const lock = fs.readFileSync(path.join(ROOT, "package-lock.json"));
const branch = run("git", ["branch", "--show-current"]);
const head = run("git", ["rev-parse", "HEAD"]);
const originMain = run("git", ["rev-parse", "origin/main"]);
const [behind, ahead] = run("git", ["rev-list", "--left-right", "--count", "origin/main...HEAD"]).split(/\s+/).map(Number);

const rows = [
  ["captured_at", capturedAt, "Exact current reconciliation-start snapshot"],
  ["branch", branch, "Dedicated reconciliation branch"],
  ["head_sha", head, "Current commit; working-tree changes are not included in this SHA"],
  ["origin_main_sha", originMain, "Remote-tracking main at capture time"],
  ["ahead_of_origin_main", ahead, "Commit count only"],
  ["behind_origin_main", behind, "Commit count only"],
  ["working_tree", status.length ? "DIRTY" : "CLEAN", `${modified.length} modified; ${untracked.length} untracked files`],
  ["modified_file_count", modified.length, "Preserved owner/programme work"],
  ["untracked_file_count", untracked.length, "Includes Phase 1–4 programme artifacts"],
  ["node_version", run("node", ["--version"]), ".node-version is the CI authority"],
  ["npm_version", run("npm", ["--version"]), "Local package manager"],
  ["package_lock_sha256", crypto.createHash("sha256").update(lock).digest("hex"), "Lockfile integrity at snapshot"],
  ["astro_declared", pkg.dependencies?.astro ?? "", "package.json"],
  ["typescript_declared", pkg.devDependencies?.typescript ?? "", "package.json"],
  ["wrangler_declared", pkg.devDependencies?.wrangler ?? "", "package.json"],
  ["ci_workflow", ".github/workflows/validate.yml", "npm ci then npm run validate:release on pull_request and main push"],
  ["generated_dist_present", fs.existsSync(path.join(ROOT, "dist")) ? "Yes" : "No", "Ignored build output; not a historical source of truth"],
  ["phase_0_4_changes_committed", "No", "Post-rejection Phase 1–4 work is uncommitted at this snapshot"]
].map(([Item, Value, Notes]) => ({ Item, Value, Notes }));
writeCsv("phase-0-current-repository-baseline.csv", ["Item", "Value", "Notes"], rows);

const statusRows = status.map((line) => ({ Status: line.slice(0, 2), File: line.slice(3), Classification: line.startsWith("?? ") ? "UNTRACKED" : "MODIFIED", Protected: "Yes" }));
writeCsv("phase-0-current-working-tree.csv", ["Status", "File", "Classification", "Protected"], statusRows);

const gitRows = [
  { Evidence: "FORENSIC_BASELINE_COMMIT", Value: head, Confidence: "High", Reason: "All post-rejection Phase 1–4 branches were created from this commit; reflog records only branch checkouts on 2026-08-11 and no later commits." },
  { Evidence: "ORIGIN_MAIN_AT_RECONCILIATION_START", Value: originMain, Confidence: "High", Reason: "Direct git rev-parse of origin/main." },
  { Evidence: "CURRENT_BRANCH", Value: branch, Confidence: "High", Reason: "Direct git branch query." },
  { Evidence: "AHEAD_BEHIND", Value: `${ahead}/${behind}`, Confidence: "High", Reason: "Direct origin/main...HEAD comparison." },
  { Evidence: "HISTORICAL_PRODUCTION_SHA", Value: "UNVERIFIED", Confidence: "None", Reason: "A main-branch commit is not proof of a deployment; deployment records must be checked separately." },
  { Evidence: "PRE_PHASE_1_WORKING_TREE", Value: "NOT FULLY RECOVERABLE", Confidence: "Medium", Reason: "Commit is recoverable, but any uncommitted state present immediately before Phase 1 cannot be proven from Git." }
];
writeCsv("phase-0-forensic-git-baseline.csv", ["Evidence", "Value", "Confidence", "Reason"], gitRows);

const manifest = {
  capturedAt,
  currentRepository: { branch, head, originMain, ahead, behind, workingTree: status.length ? "DIRTY" : "CLEAN", modified, untracked, ignored },
  tooling: { node: run("node", ["--version"]), npm: run("npm", ["--version"]), packageLockSha256: crypto.createHash("sha256").update(lock).digest("hex"), package: pkg },
  ci: { workflow: ".github/workflows/validate.yml", trigger: "pull_request and push to main", install: "npm ci", gate: "npm run validate:release", lastRemoteResult: "NOT YET VERIFIED" },
  forensicBaseline: { commit: head, confidence: "High for committed repository state; pre-Phase-1 uncommitted state not fully recoverable", historicalProduction: "NOT YET VERIFIED" },
  integrity: { historicalReportsWillRemainHistorical: true, noSecretsCaptured: true, snapshotTakenBeforeReconciliationCorrections: true }
};
fs.writeFileSync(path.join(OUT, "phase-0-baseline-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ capturedAt, branch, head, originMain, ahead, behind, modified: modified.length, untracked: untracked.length }, null, 2));
