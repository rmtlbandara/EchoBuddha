import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ADSENSE } from "../../../src/data/ads.ts";
import { MONETIZATION_ROUTE_REGISTRY } from "../../../src/data/monetization-route-registry.mjs";
import { AD_ZONES, MONETIZATION_STATES, PROTECTED_ZONE_NAMES, canLoadAdSenseRuntime, canRenderAd, classifyTechnicalResource, getMonetizationPolicy, getRegisteredMonetizationPolicy, isPlacementEligible } from "../../../src/data/monetization.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-10-2026-08-24");
const read = (file) => fs.readFileSync(path.isAbsolute(file) ? file : path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const checks = [];
const check = (id, condition, evidence) => checks.push({ id, status: condition ? "PASS" : "FAIL", evidence });
const routeEntries = Object.entries(MONETIZATION_ROUTE_REGISTRY);
const htmlFiles = fs.readdirSync(path.join(root, "dist"), { recursive: true }).filter((file) => String(file).endsWith(".html")).map((file) => path.join(root, "dist", String(file)));
const allHtml = htmlFiles.map((file) => read(file));
const builtRoutes = htmlFiles.map((file) => {
  const relative = path.relative(path.join(root, "dist"), file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return relative.endsWith("/index.html") ? `/${relative.slice(0, -"index.html".length)}` : `/${relative.replace(/\.html$/, "")}/`;
}).sort();
const states = Object.fromEntries(["NEVER_MONETIZE", "ELIGIBLE_CANDIDATE", "HOLD_MANUAL_REVIEW"].map((state) => [state, routeEntries.filter(([, row]) => row.state === state).length]));
const requiredArtifacts = [
  "ADSENSE_INTEGRATION_INVENTORY.csv", "INVENTORY_FIREWALL.csv", "PAGE_FAMILY_POLICY.csv", "AD_ZONE_POLICY.csv",
  "AUTO_ADS_EXCLUSION_PLAN.csv", "AD_PLACEHOLDER_AUDIT.csv", "AD_CODE_AUDIT.md", "ADS_TXT_AUDIT.md",
  "VERIFICATION_VS_SERVING.md", "AD_PRIVACY_READINESS.md", "ECHO_BUDDHA_ADVERTISING_GOVERNANCE.md",
  "POST_APPROVAL_ACTIVATION_CHECKLIST.md", "ADSERVING_ROLLBACK_PLAN.md", "OWNER_ACTION_REQUIRED.md",
  "FIREWALL_VALIDATION.json", "INDEPENDENT_VALIDATION.json", "METHOD_MANIFEST.json", "ADSENSE_INVENTORY_FIREWALL_REPORT.md"
];

check("INV-01", routeEntries.length === 335 && new Set(routeEntries.map(([route]) => route)).size === 335, `${routeEntries.length}/335 unique HTML routes`);
check("INV-02", htmlFiles.length === 335, `${htmlFiles.length}/335 built HTML files`);
check("INV-02B", JSON.stringify(builtRoutes) === JSON.stringify(routeEntries.map(([route]) => route).sort()), "built HTML routes and exact registry keys reconcile bidirectionally");
check("INV-03", states.NEVER_MONETIZE === 252 && states.ELIGIBLE_CANDIDATE === 7 && states.HOLD_MANUAL_REVIEW === 76, JSON.stringify(states));
check("INV-04", routeEntries.filter(([, row]) => row.indexable).length === 149 && routeEntries.filter(([, row]) => !row.indexable).length === 186, "149 indexable + 186 noindex/error = 335");
check("INV-05", routeEntries.every(([, row]) => Object.values(MONETIZATION_STATES).includes(row.state) && row.family && row.reason), "all rows have exactly one valid state, family and reason");
check("INV-06", read(path.join(outDir, "INVENTORY_FIREWALL.csv")).trim().split("\n").length === 341, "340 inventory records plus header");
check("INV-07", ["/ads.txt", "/robots.txt", "/sitemap.xml", "/search-index.json", "/search.js"].every((route) => classifyTechnicalResource(route) === MONETIZATION_STATES.TECHNICAL_NON_HTML), "5/5 technical resources classified separately");

const candidates = routeEntries.filter(([, row]) => row.state === MONETIZATION_STATES.ELIGIBLE_CANDIDATE);
check("ELG-01", candidates.length === 7 && candidates.every(([route, row]) => row.family === "ARTICLE" && row.reason === "EXPLICIT_PHASE_6_MATERIALLY_UPGRADED_ARTICLE" && route.startsWith("/articles/")), "7 explicit page-level Phase 6 article candidates");
check("ELG-02", candidates.every(([route]) => getMonetizationPolicy({ pathname: route, indexable: true, reviewedPublisherContent: true }).state === MONETIZATION_STATES.ELIGIBLE_CANDIDATE), "complete candidate context retains registry state");
check("ELG-03", candidates.every(([route]) => getMonetizationPolicy({ pathname: route }).state === MONETIZATION_STATES.NEVER_MONETIZE), "missing metadata denies all candidates");
check("ELG-04", routeEntries.filter(([, row]) => !row.indexable).every(([route]) => getRegisteredMonetizationPolicy(route).state === MONETIZATION_STATES.NEVER_MONETIZE), "186/186 noindex/error routes denied");
check("ELG-05", ["/404.html", "/search/", "/contact/", "/privacy-policy/", "/terms-of-use/", "/about/", "/editorial-policy/", "/", "/quotes/", "/daily-reflections/one-honest-breath/"].every((route) => getRegisteredMonetizationPolicy(route).state === MONETIZATION_STATES.NEVER_MONETIZE), "required conservative deny matrix passes");
check("ELG-06", ["/articles/what-is-buddhism-beginner-guide/", "/learn/buddhism-101/what-is-buddhism/"].every((route) => getRegisteredMonetizationPolicy(route).state === MONETIZATION_STATES.HOLD_MANUAL_REVIEW), "unapproved substantive Article and Learn routes held");
check("ELG-07", ["/unknown/", "/articles/future/", "https://example.com/path/", "/articles/../x/", "//evil.example/x"].every((route) => getRegisteredMonetizationPolicy(route).state === MONETIZATION_STATES.NEVER_MONETIZE), "unknown, external and malformed routes fail closed");
check("ELG-08", getRegisteredMonetizationPolicy("/articles/right-speech-buddhism/?x=1#part").state === MONETIZATION_STATES.ELIGIBLE_CANDIDATE, "query/fragment normalize to the exact registered page without changing state");

const candidatePolicy = getMonetizationPolicy({ pathname: "/articles/right-speech-buddhism/", indexable: true, reviewedPublisherContent: true });
check("PLC-01", isPlacementEligible(candidatePolicy, AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION), "explicit candidate plus explicit semantic zone passes placement-only gate");
check("PLC-02", PROTECTED_ZONE_NAMES.length === 14 && PROTECTED_ZONE_NAMES.every((zone) => !isPlacementEligible(candidatePolicy, zone)), "14/14 protected zones denied");
check("PLC-03", !isPlacementEligible(candidatePolicy, "UNKNOWN_ZONE"), "unknown zone denied");
check("PLC-04", !isPlacementEligible(getRegisteredMonetizationPolicy("/privacy-policy/"), AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION), "safe zone cannot override page denial");

check("GAT-01", ADSENSE.siteApprovedForRendering === false, "site approval gate false");
check("GAT-02", ADSENSE.servingEnabled === false, "serving kill switch false");
check("GAT-03", ADSENSE.autoAdsEnabled === false, "Auto Ads flag false");
check("GAT-04", ADSENSE.runtimeScriptEnabled === false, "runtime flag false");
check("GAT-05", ADSENSE.manualSlotsEnabled === false, "manual slots flag false");
check("GAT-05B", Array.isArray(ADSENSE.approvedManualSlotIds) && ADSENSE.approvedManualSlotIds.length === 0, "no manual slot ID is approved");
check("GAT-06", canLoadAdSenseRuntime() === false && canRenderAd({ policy: candidatePolicy, zone: AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION }) === false, "candidate cannot load or render while global gates are off");

check("BLD-01", allHtml.every((html) => !/pagead2\.googlesyndication|adsbygoogle|google_ad_client/i.test(html)), "0 AdSense runtimes/units in 335 built pages");
check("BLD-02", allHtml.every((html) => !/<[^>]+class=["'][^"']*\bad-slot\b/i.test(html)), "0 rendered ad-slot/placeholder elements");
check("BLD-03", allHtml.every((html) => !/<ins[^>]+adsbygoogle/i.test(html)), "0 direct raw ad units");
check("BLD-04", read("dist/index.html").includes('<meta name="google-adsense-account" content="ca-pub-3911157640549350">'), "homepage ownership meta preserved");
check("BLD-05", !read("dist/404.html").includes("google-adsense-account"), "no verification/ad metadata on noindex 404");
check("BLD-06", read("public/ads.txt").trim() === "google.com, pub-3911157640549350, DIRECT, f08c47fec0942fa0", "ads.txt exact valid repository record");
let distributedSlots = "";
try {
  distributedSlots = execFileSync("rg", ["-n", "<AdSlot|import AdSlot", "src/pages"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
} catch (error) {
  if (error.status !== 1) throw error;
}
check("BLD-07", distributedSlots === "", "0 distributed template slot calls");

const manifest = JSON.parse(read(path.join(outDir, "METHOD_MANIFEST.json")));
const report = read(path.join(outDir, "ADSENSE_INVENTORY_FIREWALL_REPORT.md"));
check("DOC-01", manifest.status === "PASS_WITH_EXPLICIT_HOLDS" && manifest.inventory.total === 340 && manifest.inventory.unclassified_html === 0, "manifest status and 340-resource inventory reconcile");
check("DOC-02", manifest.official_google_guidance.length === 11 && manifest.official_google_guidance.every((url) => url.startsWith("https://support.google.com/")), "11 official Google policy/help sources recorded");
check("DOC-03", Array.from({ length: 43 }, (_, index) => `## ${index + 1}.`).every((heading) => report.includes(heading)), "primary report contains all 43 exact numbered sections");
check("DOC-04", report.includes("REAL_AD_SERVING = OFF") && report.includes("Production was not modified or deployed") && report.includes("Phase 11 was not started"), "required safety and scope outcomes stated");
check("DOC-05", read(path.join(outDir, "OWNER_ACTION_REQUIRED.md")).includes("AUTO_ADS_ACCOUNT_STATE_OWNER_CONFIRMATION_PENDING") && read(path.join(outDir, "OWNER_ACTION_REQUIRED.md")).includes("CMP_CONFIGURATION_REQUIRED_BEFORE_AD_SERVING"), "owner/account blockers explicit");
check("DOC-06", read(path.join(outDir, "AD_PRIVACY_READINESS.md")).includes("Google-certified") && read(path.join(outDir, "AD_PRIVACY_READINESS.md")).includes("religious belief"), "CMP and sensitive-interest safeguards documented");
check("DOC-07", read(path.join(outDir, "AUTO_ADS_EXCLUSION_PLAN.csv")).includes("OWNER_CONFIRMATION_PENDING") && read(path.join(outDir, "AUTO_ADS_EXCLUSION_PLAN.csv")).includes("defense-in-depth"), "Auto Ads state and limitations documented");
check("DOC-08", read(path.join(outDir, "AD_PLACEHOLDER_AUDIT.csv")).trim().split("\n").length === 15, "13 template rows + central component + header");
const browserValidation = JSON.parse(read(path.join(outDir, "BROWSER_VALIDATION.json")));
check("DOC-09", browserValidation.results.status === "PASS" && browserValidation.results.rendered_ad_nodes === 0 && browserValidation.results.external_adsense_resource_elements === 0 && browserValidation.results.horizontal_overflow_routes === 0, "desktop and 390x844 browser firewall review passes");

const phase3 = JSON.parse(read("docs/audits/adsense-recovery-phase-3-2026-08-24/completion-2026-08-24/ECHO_BUDDHA_PHASE_3_COMPLETION_VALIDATION.json"));
const phase3Original = JSON.parse(read("docs/audits/adsense-recovery-phase-3-2026-08-24/completion-2026-08-24/ECHO_BUDDHA_PHASE_3_ORIGINAL_54_CHECKPOINT_RERUN.json"));
const phase4 = JSON.parse(read("docs/audits/adsense-recovery-phase-4-2026-08-24/ECHO_BUDDHA_PHASE_4_INDEPENDENT_VALIDATION.json"));
const phase5 = JSON.parse(read("docs/audits/adsense-recovery-phase-5-2026-08-24/ECHO_BUDDHA_PHASE_5_INDEPENDENT_VALIDATION.json"));
const phase6 = JSON.parse(read("docs/audits/adsense-recovery-phase-6-2026-08-24/ECHO_BUDDHA_PHASE_6_INDEPENDENT_VALIDATION.json"));
const phase7 = JSON.parse(read("docs/audits/adsense-recovery-phase-7-2026-08-24/ECHO_BUDDHA_PHASE_7_GOVERNANCE_VALIDATION.json"));
const phase8 = JSON.parse(read("docs/audits/adsense-recovery-phase-8-2026-08-24/ECHO_BUDDHA_PHASE_8_INDEPENDENT_VALIDATION.json"));
const phase9 = JSON.parse(read("docs/audits/adsense-recovery-phase-9-2026-08-24/ECHO_BUDDHA_PHASE_9_INDEPENDENT_VALIDATION.json"));
check("PRV-01", phase3.status === "PASS" && phase3Original.checks_passed === 54, "Phase 3 completion and original 54/54 preserved");
check("PRV-02", phase4.status === "PASS" && phase4.independent_pass === true, "Phase 4 preserved");
check("PRV-03", phase5.status === "PASS" && phase5.independent_pass === true, "Phase 5 preserved");
check("PRV-04", phase6.status === "PASS" && phase6.independent_pass === true, "Phase 6 preserved");
check("PRV-05", phase7.status === "PASS", "Phase 7 preserved");
check("PRV-06", phase8.status === "PASS" && phase8.failed === 0, "Phase 8 preserved");
check("PRV-07", ["PASS", "PASS_WITH_EXPLICIT_HOLDS"].includes(phase9.status), `Phase 9 preserved: ${phase9.status}`);

const changed = `${execFileSync("git", ["diff", "--name-only"], { cwd: root, encoding: "utf8" })}\n${execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" })}`.trim().split("\n").filter(Boolean);
check("SCP-01", !changed.some((file) => ["wrangler.jsonc", "astro.config.mjs", ".github/workflows"].some((prefix) => file === prefix || file.startsWith(prefix))), "deployment and production configuration untouched");
check("SCP-02", !changed.some((file) => file.includes(".config/echobuddha") || /gsc-(oauth-client|token)\.json/.test(file)), "no OAuth/token path tracked");
const changedContent = changed.filter((file) => exists(file) && fs.statSync(path.join(root, file)).isFile()).map((file) => read(file)).join("\n");
const secretKeys = [["client", "secret"].join("_"), ["access", "token"].join("_"), ["refresh", "token"].join("_"), ["private", "key"].join("_")];
check("SCP-03", secretKeys.every((key) => !new RegExp(`["']${key}["']\\s*:`).test(changedContent)), "no credential JSON keys in changed files");
const tokenValuePatterns = [new RegExp(`${["ya29", "\\."].join("")}[0-9A-Za-z_-]{20,}`), new RegExp(`${["AI", "za"].join("")}[0-9A-Za-z_-]{30,}`)];
check("SCP-04", tokenValuePatterns.every((pattern) => !pattern.test(changedContent)), "no high-confidence OAuth/API token values");
check("SCP-05", manifest.production_modified === false && manifest.merged === false && manifest.deployed === false && manifest.adsense_submitted === false && manifest.phase_11_started === false, "scope controls preserved");

const requiredBeforeIndependent = requiredArtifacts.filter((name) => !["FIREWALL_VALIDATION.json", "INDEPENDENT_VALIDATION.json"].includes(name));
check("ART-01", requiredBeforeIndependent.every((name) => fs.existsSync(path.join(outDir, name))), `${requiredBeforeIndependent.length}/16 pre-validation artifacts present`);

const allPass = checks.every((item) => item.status === "PASS");
const result = {
  phase: 10,
  generated_at: new Date().toISOString(),
  status: allPass ? "PASS_WITH_EXPLICIT_HOLDS" : "FAIL",
  firewall_pass: allPass,
  checks_passed: checks.filter((item) => item.status === "PASS").length,
  checks_failed: checks.filter((item) => item.status === "FAIL").length,
  checks_total: checks.length,
  checks,
  metrics: { html_inventory: 335, technical_non_html: 5, total_inventory: 340, ...states, unclassified_html: 0, protected_zones: PROTECTED_ZONE_NAMES.length, real_ad_requests: 0, rendered_placeholders: 0, direct_raw_slots: 0 },
  global_gates: { siteApprovedForRendering: ADSENSE.siteApprovedForRendering, servingEnabled: ADSENSE.servingEnabled, autoAdsEnabled: ADSENSE.autoAdsEnabled, runtimeScriptEnabled: ADSENSE.runtimeScriptEnabled, manualSlotsEnabled: ADSENSE.manualSlotsEnabled },
  owner_holds: manifest.owner_holds,
  secret_scan: checks.filter((item) => item.id.startsWith("SCP-")).every((item) => item.status === "PASS") ? "PASS" : "FAIL",
  production_modified: false,
  merged: false,
  deployed: false,
  adsense_submitted: false,
  phase_11_started: false,
  artifact_sha256: Object.fromEntries(requiredBeforeIndependent.map((name) => [name, crypto.createHash("sha256").update(read(path.join(outDir, name))).digest("hex")]))
};
fs.writeFileSync(path.join(outDir, "FIREWALL_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, passed: result.checks_passed, failed: result.checks_failed, total: result.checks_total }, null, 2));
if (!allPass) process.exitCode = 1;
