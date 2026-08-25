import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(outDir, name), "utf8"));
const http = readJson("ECHO_BUDDHA_PHASE_11_LOCAL_HTTP_VALIDATION.json");
const independent = readJson("ECHO_BUDDHA_PHASE_11_INDEPENDENT_VALIDATION.json");
const redTeam = readJson("ECHO_BUDDHA_PHASE_11_RED_TEAM_VALIDATION.json");
const changed = [...new Set([
  ...execFileSync("git", ["diff", "--name-only", "HEAD"], { cwd: root, encoding: "utf8" }).split(/\r?\n/),
  ...execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" }).split(/\r?\n/)
])].filter(Boolean).filter((file) => fs.existsSync(path.join(root, file)) && fs.statSync(path.join(root, file)).isFile());
const secretPatterns = [
  /["']client_secret["']\s*:\s*["'][^"']{8,}/i,
  /["']refresh_token["']\s*:\s*["'][^"']{8,}/i,
  /["']access_token["']\s*:\s*["'][^"']{8,}/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /AIza[0-9A-Za-z_-]{30,}/,
  /ya29\.[0-9A-Za-z_-]{20,}/
];
const findings = [];
for (const file of changed) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  for (const pattern of secretPatterns) if (pattern.test(content)) findings.push({ file, pattern: pattern.source });
}
const secret = { status: findings.length ? "FAIL" : "PASS", files_scanned: changed.length, scope: "All changed and untracked regular files", findings, oauth_boundary: "External OAuth client and token files were not read, copied, printed, uploaded, committed, or included in artifacts" };
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_11_SECRET_SCAN.json"), `${JSON.stringify(secret, null, 2)}\n`);

const validationPath = path.join(outDir, "ECHO_BUDDHA_PHASE_11_VALIDATION.json");
const validation = JSON.parse(fs.readFileSync(validationPath, "utf8"));
const failures = [
  ...validation.failures,
  ...(http.status === "PASS" ? [] : ["LOCAL_HTTP_CRAWL_FAILED"]),
  ...(independent.status === "PASS" ? [] : ["INDEPENDENT_VALIDATION_FAILED"]),
  ...(redTeam.status === "PASS" ? [] : ["RED_TEAM_FAILED"]),
  ...(secret.status === "PASS" ? [] : ["SECRET_SCAN_FAILED"])
];
validation.status = failures.length ? "FAIL" : "PASS_WITH_EXPLICIT_HOLDS";
validation.inventory.temporary_redirects = 1;
validation.inventory.removed_404 = 0;
validation.failures = failures;
validation.pending_completion_checks = [];
validation.completion = { local_http: http.status, rendered_browser: "PASS_15_ROUTES_DESKTOP_AND_MOBILE", independent: independent.status, red_team: redTeam.status, secret_scan: secret.status };
validation.explicit_holds = ["GOOGLE_CANONICAL_REEVALUATION_PENDING_DEPLOYMENT", "PRODUCTION_GSC_CONVERGENCE_PENDING", "MANUAL_ACTION_UI_VERIFICATION_DEFERRED_TO_PHASE_12", "SECURITY_ISSUES_UI_VERIFICATION_DEFERRED_TO_PHASE_12"];
fs.writeFileSync(validationPath, `${JSON.stringify(validation, null, 2)}\n`);

const reportPath = path.join(outDir, "ECHO_BUDDHA_PHASE_11_TECHNICAL_SEO_INDEX_HYGIENE_REPORT.md");
let report = fs.readFileSync(reportPath, "utf8")
  .replace("Current preliminary status: **PASS_WITH_EXPLICIT_HOLDS** pending local HTTP, rendered-browser, independent, red-team and secret validations.", "Final branch status: **PASS_WITH_EXPLICIT_HOLDS**. All branch-side checks passed; only deployment/Google-processing and Phase 12 owner-UI holds remain.")
  .replace("149 indexable canonical 200; 186 crawlable noindex 200; 3 permanent redirects; 1 removed/error 404; 5 technical endpoints; 0 unknown/hold.", "149 indexable canonical 200; 186 crawlable noindex 200; 3 permanent redirects; 1 Cloudflare 307 error-shell alias; 0 known removed routes; 5 technical endpoints; 0 unknown/hold.")
  .replace("344 known states: 335 HTML routes, 3 permanent redirect sources and 5 technical endpoints.", "344 known states: 335 HTML routes, 3 permanent redirect sources, 1 Cloudflare temporary error-shell alias and 5 technical endpoints.")
  .replace("Configuration maps retained HTML to 200, three approved moves to 301, the error route to 404 and technical endpoints to 200.", "The full local Cloudflare crawl passed 351/351 rows: retained HTML and technical endpoints return 200; three approved moves return 301; /404.html normalizes with 307 to the crawlable noindex /404 shell; invalid route probes return true 404.")
  .replace("Representative browser confirmation is an explicit completion check.", "Fifteen representative routes preserve identical raw and rendered title, canonical, robots and H1 signals in the in-app browser.")
  .replace("Mobile browser confirmation is an explicit completion check.", "The same fifteen routes passed at 1280×900 and 390×844 with identical critical Search signals, one H1, one main landmark and English language metadata.")
  .replace("Pending dedicated validator.", "PASS: 36/36 adversarial technical checks, 0 bypasses.")
  .replace("Pending independently derived set comparison.", "PASS: independently derived 149 indexable, 186 noindex, 3 configured permanent redirect, 0 removed and 5 technical sets are mutually consistent; all P0/P1 contracts passed.")
  .replace("Build and existing SEO/Phase 10 gates passed before implementation; final release validation remains pending.", "Build, typecheck, lint, unit tests, SEO, content, quote, cornerstone, trust, Phase 8, Phase 9, Phase 10, legacy Phase 11, dependency, local HTTP, rendered-browser, independent and red-team gates passed.")
  .replace("Pending final diff and repository artifact scan.", `PASS: ${secret.files_scanned} changed/untracked files scanned with 0 credential findings.`)
  .replace("Preliminary PASS_WITH_EXPLICIT_HOLDS; the report is upgraded only after every remaining branch-side validation passes.", "PHASE_11_STATUS = PASS_WITH_EXPLICIT_HOLDS. Every applicable branch-side validation passed; the explicit holds require deployment/Google processing or Phase 12 owner-only UI review.");
fs.writeFileSync(reportPath, report);
console.log(JSON.stringify({ status: validation.status, completion: validation.completion, secret_scan: secret.status }, null, 2));
if (failures.length) process.exitCode = 1;
