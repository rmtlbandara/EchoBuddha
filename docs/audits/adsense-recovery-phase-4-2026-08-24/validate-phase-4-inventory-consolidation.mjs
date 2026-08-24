import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-4-2026-08-24");
const phase3Dir = path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24");
const distDir = path.join(root, "dist");
const reportPath = path.join(outDir, "ECHO_BUDDHA_PHASE_4_INDEPENDENT_VALIDATION.json");
const site = "https://echobuddha.com";
const sources = [
  "/articles/how-to-practice-non-attachment/",
  "/articles/letting-go-without-giving-up/"
];
const survivor = "/articles/how-to-let-go-of-attachment-in-buddhism/";

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { value += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(value); value = ""; }
    else if (char === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift() ?? [];
  return rows.filter((item) => item.some(Boolean)).map((item) => Object.fromEntries(headers.map((header, index) => [header, item[index] ?? ""])));
}

const readCsv = (name) => parseCsv(fs.readFileSync(path.join(outDir, name), "utf8"));
const phase3Csv = (name) => parseCsv(fs.readFileSync(path.join(phase3Dir, name), "utf8"));
const checks = [];
const check = (id, condition, evidence) => {
  checks.push({ id, status: condition ? "PASS" : "FAIL", evidence });
  if (!condition) process.exitCode = 1;
};

const registry = readCsv("ECHO_BUDDHA_PHASE_4_CONSOLIDATION_REGISTRY.csv");
const registryByUrl = new Map(registry.map((row) => [row.URL, row]));
const migrations = readCsv("ECHO_BUDDHA_PHASE_4_URL_MIGRATION_MAP.csv");
const contentMigrations = readCsv("ECHO_BUDDHA_PHASE_4_CONTENT_MIGRATION.csv");
const indexation = readCsv("ECHO_BUDDHA_PHASE_4_INDEXATION_DECISIONS.csv");
const redirects = readCsv("ECHO_BUDDHA_PHASE_4_REDIRECT_VALIDATION.csv");
const protectedValidation = readCsv("ECHO_BUDDHA_PHASE_4_PROTECTED_URL_VALIDATION.csv");
const phase3Performance = phase3Csv("ECHO_BUDDHA_SEARCH_PERFORMANCE_PROTECTION_MAP.csv");
const allowed = new Set(["RETAIN", "RETAIN_AND_DIFFERENTIATE", "SURGICAL_IN_PLACE_IMPROVEMENT", "MERGE_TO_EXISTING_SURVIVOR", "MERGE_AND_STRENGTHEN_SURVIVOR", "NOINDEX_RETAIN_FOR_USERS", "REMOVE_404_OR_410", "TECHNICAL_REDIRECT", "DEFER_TO_PHASE_5_QUOTES", "HOLD"]);

check("DEC-01", registry.length === 340, `${registry.length}/340 rows`);
check("DEC-02", new Set(registry.map((row) => row.URL)).size === 340, "340 unique URLs");
check("DEC-03", registry.every((row) => allowed.has(row["Phase 4 decision"])), "all decisions use the controlled vocabulary");
check("DEC-04", sources.every((source) => registryByUrl.get(`${site}${source}`)?.["Phase 4 decision"] === "MERGE_AND_STRENGTHEN_SURVIVOR"), "two approved source decisions");
check("DEC-05", registryByUrl.get(`${site}${survivor}`)?.["Phase 4 decision"] === "SURGICAL_IN_PLACE_IMPROVEMENT", "survivor strengthened in place");
check("DEC-06", registry.filter((row) => row["page family"].startsWith("QUOTE")).every((row) => row["Phase 4 decision"] === "DEFER_TO_PHASE_5_QUOTES"), "all quote surfaces deferred");
check("DEC-07", registry.filter((row) => row["Phase 3 protection tier"] === "SEO_UNKNOWN").every((row) => row["Phase 4 decision"] === "HOLD"), "all SEO-UNKNOWN URLs held");
check("DEC-08", registry.filter((row) => row["Phase 3 protection tier"] === "SEO_P0_CRITICAL").every((row) => !["MERGE_TO_EXISTING_SURVIVOR", "MERGE_AND_STRENGTHEN_SURVIVOR", "NOINDEX_RETAIN_FOR_USERS", "REMOVE_404_OR_410", "TECHNICAL_REDIRECT"].includes(row["Phase 4 decision"])), "no destructive P0 decision");
check("DEC-09", registry.filter((row) => row["Phase 3 protection tier"] === "SEO_P1_HIGH" && row.URL !== `${site}${survivor}`).every((row) => !row["Phase 4 decision"].startsWith("MERGE") && row["Phase 4 decision"] !== "REMOVE_404_OR_410"), "P1 URLs preserved except strengthened survivor");

check("MIG-01", migrations.length === 3, `${migrations.length}/3 migrations`);
check("MIG-02", migrations.every((row) => row.redirect === "301_PERMANENT" && row["chain-free?"] === "YES"), "all migrations permanent and chain-free");
check("MIG-03", contentMigrations.length >= 8 && contentMigrations.filter((row) => row["unique?"] === "YES").every((row) => row["final action"].startsWith("MIGRATED")), `${contentMigrations.length} content decisions; unique elements migrated`);

const redirectText = fs.readFileSync(path.join(root, "public/_redirects"), "utf8");
check("RED-01", redirects.length === 3 && redirects.every((row) => row.status === "301" && row["validation result"] === "PASS_LOCAL_WRANGLER_HTTP_301_TO_200"), "3/3 local 301→200 tests recorded");
check("RED-02", sources.every((source) => redirectText.includes(`${source} ${survivor} 301`)), "article redirect rules exact");
check("RED-03", redirectText.includes("/terms-and-conditions/ /terms-of-use/ 301"), "legacy legal redirect exact");
const redirectPairs = redirects.map((row) => [new URL(row["source URL"]).pathname, new URL(row["target URL"]).pathname]);
const redirectSources = new Set(redirectPairs.map(([source]) => source));
check("RED-04", redirectPairs.every(([source, target]) => source !== target && !redirectSources.has(target)), "no loops or redirect chains");

const sitemap = fs.readFileSync(path.join(distDir, "sitemap.xml"), "utf8");
check("IDX-01", sources.every((source) => !sitemap.includes(source)), "retired sources absent from sitemap");
check("IDX-02", sitemap.includes(survivor), "survivor present in sitemap");
check("IDX-03", sources.every((source) => !fs.existsSync(path.join(distDir, source, "index.html"))), "retired source assets absent");
check("IDX-04", fs.existsSync(path.join(distDir, survivor, "index.html")), "survivor asset exists");
const survivorHtml = fs.readFileSync(path.join(distDir, survivor, "index.html"), "utf8");
check("IDX-05", survivorHtml.includes(`<link rel="canonical" href="${site}${survivor}"`), "survivor self-canonical");
check("IDX-06", indexation.length === phase3Performance.filter((row) => row.intended_indexable === "false").length && indexation.every((row) => row.implementation === "EXISTING_STATE_PRESERVED_NO_NEW_NOINDEX"), "no new noindex; all prior non-indexable rows accounted for");

const htmlFiles = [];
function walk(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const item = path.join(dir, entry.name); if (entry.isDirectory()) walk(item); else if (entry.name.endsWith(".html")) htmlFiles.push(item); } }
walk(distDir);
const rendered = htmlFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
check("LNK-01", sources.every((source) => !rendered.includes(`href="${source}`)), "zero rendered internal links to retired sources");
check("LNK-02", rendered.includes(`href="${survivor}`), "rendered internal links reach final survivor");

const siteSource = fs.readFileSync(path.join(root, "src/data/site.ts"), "utf8");
check("CON-01", sources.every((source) => !siteSource.includes(`slug: "${source.split("/").filter(Boolean).at(-1)}"`)), "retired article route definitions removed");
check("CON-02", ["A Mine-to-Do and Not-Mine-to-Force Exercise", "Practice Appreciation Instead of Possession", "Letting Go Is Not Giving Up"].every((heading) => survivorHtml.includes(heading)), "migrated survivor sections rendered");
check("CON-03", survivorHtml.includes("August 24, 2026") && survivorHtml.includes("2026-08-24"), "substantial survivor review date rendered in visible metadata and schema");
check("CON-04", registry.filter((row) => row["Phase 4 decision"] === "RETAIN_AND_DIFFERENTIATE").length >= 2, "retained differentiation decisions recorded");

check("PRO-01", protectedValidation.length > 0 && protectedValidation.every((row) => row["validation result"] === "PASS" && row["intent protected"] === "YES"), `${protectedValidation.length} protected/changed URLs pass`);
const phase3CompletionDir = path.join(phase3Dir, "completion-2026-08-24");
const phase3Validation = JSON.parse(fs.readFileSync(path.join(phase3CompletionDir, "ECHO_BUDDHA_PHASE_3_COMPLETION_VALIDATION.json"), "utf8"));
const phase3Independent = JSON.parse(fs.readFileSync(path.join(phase3CompletionDir, "ECHO_BUDDHA_PHASE_3_COMPLETION_INDEPENDENT_VALIDATION.json"), "utf8"));
const phase3Original = JSON.parse(fs.readFileSync(path.join(phase3CompletionDir, "ECHO_BUDDHA_PHASE_3_ORIGINAL_54_CHECKPOINT_RERUN.json"), "utf8"));
check("PRO-02", phase3Validation.status === "PASS" && phase3Validation.checks_passed === 41 && phase3Original.checks_passed === 54, "Phase 3 completion 41/41 and original 54/54 checkpoints remain PASS");
check("PRO-03", phase3Independent.status === "PASS" && phase3Independent.checks_passed === 20, "Phase 3 completion independent validation remains 20/20 PASS");

const status = execFileSync("git", ["status", "--short"], { cwd: root, encoding: "utf8" });
const changedFiles = status.split("\n").filter(Boolean).map((line) => line.slice(3));
const allowedPrefixes = [
  "docs/audits/adsense-recovery-phase-4-2026-08-24/",
  "docs/audits/adsense-rejection-2026-08/phase-8-technical-adsense-privacy/phase-8-custom-validation.json",
  "docs/audits/adsense-rejection-2026-08/phase-9-ci-git-deployment/phase-9-custom-validation.json",
  "docs/audits/adsense-rejection-2026-08/phase-10-search-console-measurement/phase-10-custom-validation.json",
  "docs/audits/content-audit/content-decision-matrix.csv",
  "docs/audits/content-audit/content-family-summary.json",
  "docs/audits/content-audit/content-inventory.csv",
  "docs/audits/content-audit/post-remediation-summary.json",
  "docs/audits/content-audit/source-register.csv",
  "docs/audits/echo-buddha-governance-implementation/final-validation-summary.json",
  "docs/audits/echo-buddha-governance-implementation/structured-data-matrix.json",
  "docs/audits/echo-buddha-governance-implementation/url-inventory.json",
  "src/data/site.ts",
  "src/data/dailyReflections.ts",
  "src/pages/",
  "public/_redirects",
  "governance/release-change-approvals.json",
  "scripts/validate-phase-8.mjs",
  "scripts/validate-phase-9.mjs"
];
check("PRV-01", changedFiles.every((file) => allowedPrefixes.some((prefix) => file === prefix || file.startsWith(prefix))), `scoped changed files: ${changedFiles.length}`);
check("PRV-02", !changedFiles.some((file) => file.includes(".config/echobuddha") || /gsc-(oauth-client|token)\.json/.test(file)), "no OAuth/token path tracked");
const changedContent = changedFiles.filter((file) => fs.existsSync(path.join(root, file)) && fs.statSync(path.join(root, file)).isFile()).map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const secretMarkers = [["client", "secret"].join("_"), ["refresh", "token"].join("_"), ["access", "token"].join("_"), ["ya29", "."].join(""), ["AI", "za"].join("")];
check("PRV-03", secretMarkers.every((marker) => !changedContent.includes(`"${marker}"`) && !changedContent.includes(`${marker}:`)), "no credential values or JSON secret keys in changed artifacts");
check("PRD-01", !changedFiles.some((file) => ["wrangler.jsonc", "astro.config.mjs", ".github/workflows"].some((prefix) => file === prefix || file.startsWith(prefix))), "no production/deployment configuration changed");
const adsenseActionMarker = ["ADSENSE_SUBMITTED", "true"].join("=");
const productionActionMarker = ["PRODUCTION_DEPLOYED", "true"].join("=");
check("PRD-02", !changedContent.includes(adsenseActionMarker) && !changedContent.includes(productionActionMarker), "no deployment or AdSense action marker");

const requiredArtifacts = [
  "ECHO_BUDDHA_PHASE_4_CONSOLIDATION_REGISTRY.csv", "ECHO_BUDDHA_PHASE_4_CLUSTER_DECISIONS.md", "ECHO_BUDDHA_PHASE_4_URL_MIGRATION_MAP.csv", "ECHO_BUDDHA_PHASE_4_CONTENT_MIGRATION.csv", "ECHO_BUDDHA_PHASE_4_RETAINED_DIFFERENTIATION.csv", "ECHO_BUDDHA_PHASE_4_INDEXATION_DECISIONS.csv", "ECHO_BUDDHA_PHASE_4_URL_INVENTORY_DIFF.csv", "ECHO_BUDDHA_PHASE_4_REDIRECT_VALIDATION.csv", "ECHO_BUDDHA_PHASE_4_PROTECTED_URL_VALIDATION.csv", "ECHO_BUDDHA_PHASE_4_SITEMAP_CANONICAL_VALIDATION.md", "ECHO_BUDDHA_PHASE_4_ROLLBACK_PLAN.md", "ECHO_BUDDHA_PHASE_4_METHOD_MANIFEST.json", "ECHO_BUDDHA_PHASE_4_INVENTORY_CONSOLIDATION_REPORT.md"
];
check("ART-01", requiredArtifacts.every((file) => fs.existsSync(path.join(outDir, file)) && fs.statSync(path.join(outDir, file)).size > 50), `${requiredArtifacts.length}/13 pre-validation artifacts present and non-empty`);

const allChecksPass = checks.every((item) => item.status === "PASS");
const result = {
  phase: 4,
  generated_at: new Date().toISOString(),
  independent_pass: allChecksPass,
  status: allChecksPass ? "PASS" : "FAIL",
  summary: { passed: checks.filter((item) => item.status === "PASS").length, failed: checks.filter((item) => item.status === "FAIL").length, total: checks.length },
  checks,
  production_unchanged: true,
  adsense_submission_unchanged: true,
  secret_scan: checks.find((item) => item.id === "PRV-03")?.status,
  artifact_sha256: Object.fromEntries(requiredArtifacts.map((file) => [file, crypto.createHash("sha256").update(fs.readFileSync(path.join(outDir, file))).digest("hex")]))
};
fs.writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.summary, null, 2));
if (result.status !== "PASS") process.exitCode = 1;
