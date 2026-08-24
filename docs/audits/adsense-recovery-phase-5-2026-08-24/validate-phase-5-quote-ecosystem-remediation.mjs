import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-5-2026-08-24");
const phase3CompletionDir = path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24/completion-2026-08-24");
const phase4Dir = path.join(root, "docs/audits/adsense-recovery-phase-4-2026-08-24");
const distDir = path.join(root, "dist");
const site = "https://echobuddha.com";
const resultPath = path.join(outDir, "ECHO_BUDDHA_PHASE_5_INDEPENDENT_VALIDATION.json");

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(value); value = ""; }
    else if (character === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += character;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const [headers, ...records] = rows.filter((item) => item.some((field) => field !== ""));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

const read = (file) => fs.readFileSync(file, "utf8");
const readCsv = (name) => parseCsv(read(path.join(outDir, name)));
const checks = [];
const check = (id, condition, evidence) => {
  checks.push({ id, status: condition ? "PASS" : "FAIL", evidence });
  if (!condition) process.exitCode = 1;
};

const inventory = readCsv("ECHO_BUDDHA_PHASE_5_QUOTE_INVENTORY.csv");
const decisions = readCsv("ECHO_BUDDHA_PHASE_5_QUOTE_DECISIONS.csv");
const categories = readCsv("ECHO_BUDDHA_PHASE_5_QUOTE_CATEGORY_DECISIONS.csv");
const attribution = readCsv("ECHO_BUDDHA_PHASE_5_QUOTE_ATTRIBUTION_AUDIT.csv");
const duplication = readCsv("ECHO_BUDDHA_PHASE_5_QUOTE_DUPLICATION.csv");
const queryMap = readCsv("ECHO_BUDDHA_PHASE_5_QUOTE_QUERY_MAP.csv");
const indexation = readCsv("ECHO_BUDDHA_PHASE_5_QUOTE_INDEXATION_DIFF.csv");
const migrations = readCsv("ECHO_BUDDHA_PHASE_5_QUOTE_URL_MIGRATION.csv");
const indexableStories = readCsv("ECHO_BUDDHA_PHASE_5_INDEXABLE_QUOTE_STORIES.csv");
const noindexPermalinks = readCsv("ECHO_BUDDHA_PHASE_5_NOINDEX_QUOTE_PERMALINKS.csv");
const retired = readCsv("ECHO_BUDDHA_PHASE_5_RETIRED_QUOTES_URLS.csv");
const protectedRows = readCsv("ECHO_BUDDHA_PHASE_5_PROTECTED_QUOTE_VALIDATION.csv");

check("INV-01", inventory.length === 153, `${inventory.length}/153 quote records`);
check("INV-02", new Set(inventory.map((row) => row.quote_id)).size === 153, "153 unique quote IDs");
check("INV-03", new Set(inventory.map((row) => row.detail_url)).size === 153 && new Set(inventory.map((row) => `${row.category}/${row.slug}`)).size === 153, "153 unique routes and category/slug identities");
check("INV-04", inventory.every((row) => row.quote_text && row.category_url && row.canonical === row.detail_url), "all records retain text, category, and self-canonical permalink");
check("INV-05", new Set(inventory.map((row) => row.category)).size === 10, "10 quote categories represented");

check("DEC-01", decisions.length === 153 && new Set(decisions.map((row) => row.quote_id)).size === 153, "153 unique story decisions");
check("DEC-02", decisions.every((row) => row.decision === "NOINDEX_USER_PERMALINK" && row["new index state"] === "noindex, follow"), "all story decisions are controlled noindex user permalinks");
check("DEC-03", decisions.filter((row) => row["before indexability"] === "true").length === 43 && decisions.filter((row) => row["before indexability"] === "false").length === 110, "before state reconciles 43 indexable + 110 noindex stories");
check("DEC-04", decisions.every((row) => row.redirect === "NONE" && row["content migration"].includes("NOT_REQUIRED")), "no story redirect or destructive migration");
check("DEC-05", decisions.every((row) => !["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row["Phase 3 protection"])), "no P0/P1 individual quote story changed");
check("DEC-06", decisions.filter((row) => row["visible query ownership"] === "VISIBLE_QUERY_OWNER_REVIEWED").length === 4, "all four query-visible story owners explicitly reviewed");

check("CAT-01", categories.length === 10 && categories.every((row) => row.decision === "RETAIN_INDEXABLE_CURATED_RESOURCE"), "10/10 categories retained as curated resources");
check("CAT-02", categories.every((row) => row.indexability === "index, follow" && row["category purpose"] && row["quality action"].includes("EDITORIAL_STARTERS")), "every category has distinct purpose and quality action");
check("CAT-03", categories.reduce((sum, row) => sum + Number(row["quote count"]), 0) === 153, "category counts reconcile to 153 records");

check("ATT-01", attribution.length === 153 && attribution.every((row) => row["origin type"] === "ECHOBUDDHA_ORIGINAL"), "153/153 origin records classified");
check("ATT-02", attribution.every((row) => row["required correction"] === "NONE" && row["final state"].includes("NOT_BUDDHA_OR_SCRIPTURE_ATTRIBUTION")), "no unsupported Buddha/scripture attribution");
check("ATT-03", attribution.filter((row) => row["verification state"] === "TARGETED_PHRASE_SEARCH_NO_EXTERNAL_EXACT_MATCH_OBSERVED_NOT_PROOF_OF_ORIGINALITY").length === 4, "four representative external checks recorded with limitation");
check("DUP-01", duplication.length >= 1 && duplication.every((row) => row.classification === "CONCEPTUAL_OR_VOCABULARY_OVERLAP_NOT_EXACT_DUPLICATE" || row.classification === "NO_EXACT_PUNCTUATION_OR_HIGH_NEAR_DUPLICATE_CLUSTER"), `${duplication.length} conceptual-overlap review rows; no exact duplicate`);
check("DUP-02", new Set(inventory.map((row) => row.quote_text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim())).size === 153, "independent normalized-text uniqueness check: 153/153");

check("QRY-01", queryMap.length === 66, `${queryMap.length}/66 recovery-window quote query×page rows`);
check("QRY-02", queryMap.every((row) => row["preserved destination if changed"].startsWith(`${site}/quotes/`)), "every query mapping preserves a quote destination");
const storyQueryRows = queryMap.filter((row) => row["story/category"] === "STORY");
check("QRY-03", storyQueryRows.length === 7 && new Set(storyQueryRows.map((row) => row.URL)).size === 4 && storyQueryRows.every((row) => row["proposed Phase 5 decision"] === "NOINDEX_USER_PERMALINK"), "seven query rows across four story URLs explicitly adjudicated");

check("IDX-01", indexation.length === 164 && new Set(indexation.map((row) => row.URL)).size === 164, "164 unique quote-layer indexation rows");
check("IDX-02", indexation.filter((row) => row["after branch indexability"] === "true").length === 11, "after indexable quote inventory is hub + 10 categories");
check("IDX-03", indexation.filter((row) => row["before indexability"] === "true").length === 54 && indexation.filter((row) => row["after branch indexability"] === "false").length === 153, "before 54 indexable; after 153 noindex stories");
check("IDX-04", indexation.filter((row) => row["after sitemap"] === "true").length === 11 && indexation.every((row) => row["after canonical"] === row.URL), "quote sitemap and canonicals reconcile");
check("IDX-05", noindexPermalinks.length === 153 && noindexPermalinks.every((row) => row["sitemap excluded"] === "true" && row.crawlable === "true"), "153 crawlable, sitemap-excluded user permalinks");
check("IDX-06", indexableStories.length === 1 && indexableStories[0].URL === "NONE_APPROVED", "zero standalone quote stories approved for Search");
check("IDX-07", migrations.length === 1 && migrations[0].source === "NONE" && retired.length === 1 && retired[0].URL === "NONE", "zero redirects and zero retired quote URLs");

const sitemap = read(path.join(distDir, "sitemap.xml"));
const quoteSitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).filter((url) => new URL(url).pathname.startsWith("/quotes"));
check("BLD-01", quoteSitemapUrls.length === 11, `${quoteSitemapUrls.length}/11 quote sitemap URLs`);
const storyBuild = inventory.map((row) => ({
  row,
  html: read(path.join(distDir, new URL(row.detail_url).pathname, "index.html"))
}));
check("BLD-02", storyBuild.every(({ html }) => /<meta[^>]+name="robots"[^>]+content="noindex, follow"/.test(html)), "153/153 rendered stories are noindex, follow");
check("BLD-03", storyBuild.every(({ row, html }) => html.includes(`<link rel="canonical" href="${row.detail_url}"`)), "153/153 rendered stories are self-canonical");
check("BLD-04", storyBuild.every(({ row }) => !quoteSitemapUrls.includes(row.detail_url)), "zero story permalinks in sitemap");
check("BLD-05", storyBuild.every(({ html }) => html.includes("Source Note") && html.includes("Original Echo Buddha quote")), "source transparency retained on all permalinks");
const localSearch = JSON.parse(read(path.join(distDir, "search-index.json")));
check("BLD-06", inventory.every((row) => localSearch.some((item) => item.url === new URL(row.detail_url).pathname)), "153/153 quote permalinks remain locally discoverable");
const hubHtml = read(path.join(distDir, "quotes/index.html"));
check("BLD-07", hubHtml.includes("Editorial Starting Points") && categories.every((row) => {
  const html = read(path.join(distDir, new URL(row.URL).pathname, "index.html"));
  return html.includes("Editorial starting points") && html.includes("Editorial reading path:");
}), "hub and 10 categories render editorial curation");

check("PRO-01", protectedRows.length === 54 && protectedRows.every((row) => row["validation result"] === "PASS" && row["intent protected"] === "YES"), "54/54 protected, changed, or query-visible quote URLs pass");
check("PRO-02", protectedRows.filter((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row["protection tier"])).length === 8, "all 8 P0/P1 quote assets explicitly validated");
const phase3Validation = JSON.parse(read(path.join(phase3CompletionDir, "ECHO_BUDDHA_PHASE_3_COMPLETION_VALIDATION.json")));
const phase3Independent = JSON.parse(read(path.join(phase3CompletionDir, "ECHO_BUDDHA_PHASE_3_COMPLETION_INDEPENDENT_VALIDATION.json")));
const phase3Original = JSON.parse(read(path.join(phase3CompletionDir, "ECHO_BUDDHA_PHASE_3_ORIGINAL_54_CHECKPOINT_RERUN.json")));
const phase4Validation = JSON.parse(read(path.join(phase4Dir, "ECHO_BUDDHA_PHASE_4_INDEPENDENT_VALIDATION.json")));
check("PRO-03", phase3Validation.status === "PASS" && phase3Validation.checks_passed === 41 && phase3Independent.status === "PASS" && phase3Independent.checks_passed === 20 && phase3Original.checks_passed === 54, "Phase 3 41/41, independent 20/20, and original 54/54 remain PASS");
check("PRO-04", phase4Validation.status === "PASS" && phase4Validation.independent_pass === true, "Phase 4 independent checkpoint remains PASS");

const siteSource = read(path.join(root, "src/data/site.ts"));
const editorialSource = read(path.join(root, "src/data/editorialGovernance.ts"));
check("GOV-01", siteSource.includes('DEFAULT_QUOTE_SEARCH_INDEX_STATUS: QuoteSearchIndexStatus = "noindex"') && siteSource.includes("requests indexation without a complete editorial approval"), "future quote publication defaults noindex and fails closed");
check("GOV-02", editorialSource.includes("isQuoteStoryIndexable(quote)"), "editorial governance uses the fail-closed helper");
const governanceDoc = read(path.join(outDir, "ECHO_BUDDHA_QUOTE_PUBLISHING_GOVERNANCE.md"));
check("GOV-03", governanceDoc.includes("## Default index state") && governanceDoc.includes("## Human review") && governanceDoc.includes("## Rollback"), "publishing governance covers default, approval, and rollback");

const status = execFileSync("git", ["status", "--short"], { cwd: root, encoding: "utf8" });
const changedFiles = status.split("\n").filter(Boolean).map((line) => line.slice(3));
const allowedPrefixes = [
  "docs/audits/adsense-recovery-phase-5-2026-08-24/",
  "docs/audits/adsense-rejection-2026-08/phase-8-technical-adsense-privacy/phase-8-custom-validation.json",
  "docs/audits/adsense-rejection-2026-08/phase-9-ci-git-deployment/phase-9-custom-validation.json",
  "docs/audits/adsense-rejection-2026-08/phase-10-search-console-measurement/phase-10-custom-validation.json",
  "docs/audits/content-audit/content-decision-matrix.csv",
  "docs/audits/content-audit/content-family-summary.json",
  "docs/audits/content-audit/content-inventory.csv",
  "docs/audits/content-audit/duplicate-clusters.csv",
  "docs/audits/content-audit/post-remediation-summary.json",
  "docs/audits/content-audit/quote-origin-register.csv",
  "docs/audits/content-audit/source-register.csv",
  "docs/audits/echo-buddha-governance-implementation/final-validation-summary.json",
  "docs/audits/echo-buddha-governance-implementation/structured-data-matrix.json",
  "docs/audits/echo-buddha-governance-implementation/url-inventory.json",
  "governance/release-change-approvals.json",
  "package.json",
  "scripts/validate-phase-8.mjs",
  "scripts/validate-phase-9.mjs",
  "scripts/validate-quote-governance.mjs",
  "src/components/QuoteCard.astro",
  "src/data/editorialGovernance.ts",
  "src/data/site.ts",
  "src/pages/quotes.astro",
  "src/pages/quotes/[category].astro",
  "src/pages/quotes/[category]/[story].astro",
  "tests/governance.test.mjs"
];
check("PRV-01", changedFiles.every((file) => allowedPrefixes.some((prefix) => file === prefix || file.startsWith(prefix))), `all ${changedFiles.length} changed paths are Phase 5 or deterministic validation outputs`);
check("PRV-02", !changedFiles.some((file) => file.includes(".config/echobuddha") || /gsc-(oauth-client|token)\.json/.test(file)), "no OAuth/token path tracked");
const changedContent = changedFiles
  .filter((file) => fs.existsSync(path.join(root, file)) && fs.statSync(path.join(root, file)).isFile())
  .map((file) => read(path.join(root, file)))
  .join("\n");
const secretMarkers = [["client", "secret"].join("_"), ["refresh", "token"].join("_"), ["access", "token"].join("_"), ["ya29", "."].join(""), ["AI", "za"].join("")];
check("PRV-03", secretMarkers.every((marker) => !changedContent.includes(`"${marker}"`) && !changedContent.includes(`${marker}:`)), "no credential values or secret JSON keys in changed artifacts");
check("PRD-01", !changedFiles.some((file) => ["wrangler.jsonc", "astro.config.mjs", ".github/workflows"].some((prefix) => file === prefix || file.startsWith(prefix))), "no production/deployment configuration changed");
const productionActionMarker = ["PRODUCTION", "DEPLOYED", "true"].join("_").replace("_true", "=true");
const adsenseActionMarker = ["ADSENSE", "SUBMITTED", "true"].join("_").replace("_true", "=true");
check("PRD-02", !changedContent.includes(productionActionMarker) && !changedContent.includes(adsenseActionMarker), "no deployment or AdSense action marker");

const requiredArtifacts = [
  "ECHO_BUDDHA_PHASE_5_QUOTE_INVENTORY.csv",
  "ECHO_BUDDHA_PHASE_5_QUOTE_DECISIONS.csv",
  "ECHO_BUDDHA_PHASE_5_QUOTE_CATEGORY_DECISIONS.csv",
  "ECHO_BUDDHA_PHASE_5_QUOTE_ATTRIBUTION_AUDIT.csv",
  "ECHO_BUDDHA_PHASE_5_QUOTE_DUPLICATION.csv",
  "ECHO_BUDDHA_PHASE_5_QUOTE_QUERY_MAP.csv",
  "ECHO_BUDDHA_PHASE_5_QUOTE_TEMPLATE_REMEDIATION.md",
  "ECHO_BUDDHA_PHASE_5_QUOTE_INDEXATION_DIFF.csv",
  "ECHO_BUDDHA_PHASE_5_QUOTE_URL_MIGRATION.csv",
  "ECHO_BUDDHA_PHASE_5_INDEXABLE_QUOTE_STORIES.csv",
  "ECHO_BUDDHA_PHASE_5_NOINDEX_QUOTE_PERMALINKS.csv",
  "ECHO_BUDDHA_PHASE_5_RETIRED_QUOTES_URLS.csv",
  "ECHO_BUDDHA_QUOTE_PUBLISHING_GOVERNANCE.md",
  "ECHO_BUDDHA_PHASE_5_QUOTE_SITEMAP_CANONICAL_VALIDATION.md",
  "ECHO_BUDDHA_PHASE_5_PROTECTED_QUOTE_VALIDATION.csv",
  "ECHO_BUDDHA_PHASE_5_METHOD_MANIFEST.json",
  "ECHO_BUDDHA_PHASE_5_QUOTE_ECOSYSTEM_REMEDIATION_REPORT.md"
];
check("ART-01", requiredArtifacts.every((file) => fs.existsSync(path.join(outDir, file)) && fs.statSync(path.join(outDir, file)).size > 50), `${requiredArtifacts.length}/17 pre-validation artifacts present and non-empty`);

const allPass = checks.every((item) => item.status === "PASS");
const result = {
  phase: 5,
  generated_at: new Date().toISOString(),
  independent_pass: allPass,
  status: allPass ? "PASS" : "FAIL",
  summary: {
    passed: checks.filter((item) => item.status === "PASS").length,
    failed: checks.filter((item) => item.status === "FAIL").length,
    total: checks.length
  },
  checks,
  quote_inventory: { records: inventory.length, public_urls: indexation.length, indexable_resources: 11, noindex_user_permalinks: noindexPermalinks.length },
  production_unchanged: true,
  merged: false,
  deployed: false,
  adsense_submitted: false,
  phase_6_started: false,
  secret_scan: checks.find((item) => item.id === "PRV-03")?.status,
  artifact_sha256: Object.fromEntries(requiredArtifacts.map((file) => [file, crypto.createHash("sha256").update(read(path.join(outDir, file))).digest("hex")]))
};
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.summary, null, 2));
if (!allPass) process.exitCode = 1;
