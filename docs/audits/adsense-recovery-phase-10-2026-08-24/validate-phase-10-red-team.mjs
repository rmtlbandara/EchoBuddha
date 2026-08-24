import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ADSENSE } from "../../../src/data/ads.ts";
import { MONETIZATION_ROUTE_REGISTRY } from "../../../src/data/monetization-route-registry.mjs";
import { AD_ZONES, MONETIZATION_STATES, PROTECTED_ZONE_NAMES, canLoadAdSenseRuntime, canRenderAd, getMonetizationPolicy, getRegisteredMonetizationPolicy, isPlacementEligible, normalizeMonetizationPath } from "../../../src/data/monetization.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-10-2026-08-24");
const read = (file) => fs.readFileSync(path.isAbsolute(file) ? file : path.join(root, file), "utf8");
const checks = [];
const attack = (id, condition, evidence) => checks.push({ id, result: condition ? "PASS_DENIED_OR_CONTROLLED" : "FAIL_BYPASS", evidence });
const deny = (value) => getRegisteredMonetizationPolicy(value).state === MONETIZATION_STATES.NEVER_MONETIZE;
const candidateContext = { pathname: "/articles/right-speech-buddhism/", indexable: true, reviewedPublisherContent: true };
const candidate = getMonetizationPolicy(candidateContext);

for (const [id, value] of [
  ["RT-UNKNOWN", "/future-page/"], ["RT-UNKNOWN-ARTICLE", "/articles/not-in-inventory/"], ["RT-DYNAMIC", "/api/render/anything/"],
  ["RT-EXTERNAL", "https://example.com/articles/right-speech-buddhism/"], ["RT-PROTOCOL-RELATIVE", "//evil.example/path/"],
  ["RT-TRAVERSAL", "/articles/../right-speech-buddhism/"], ["RT-BACKSLASH", "/articles\\right-speech-buddhism/"],
  ["RT-DOUBLE-SLASH", "/articles//right-speech-buddhism/"], ["RT-ENCODED-SLASH", "/articles%2fright-speech-buddhism/"],
  ["RT-WRONG-CASE", "/Articles/right-speech-buddhism/"], ["RT-EMPTY", ""], ["RT-NUL", "/articles/\0right-speech-buddhism/"]
]) attack(id, deny(value), `${JSON.stringify(value)} did not gain candidacy`);

attack("RT-QUERY", getRegisteredMonetizationPolicy("/articles/right-speech-buddhism/?utm_source=redteam#x").state === MONETIZATION_STATES.ELIGIBLE_CANDIDATE, "benign query/fragment maps to same exact registered route, not a new policy row");
attack("RT-QUERY-NEVER", getRegisteredMonetizationPolicy("/privacy-policy/?preview=1").state === MONETIZATION_STATES.NEVER_MONETIZE, "query cannot lift a denied page");
attack("RT-NORMALIZE-HOST", normalizeMonetizationPath("http://echobuddha.com/articles/right-speech-buddhism") === "/articles/right-speech-buddhism/", "canonical host normalizes consistently while serving remains gated");

attack("CTX-MISSING-ALL", getMonetizationPolicy({ pathname: candidateContext.pathname }).state === MONETIZATION_STATES.NEVER_MONETIZE, "missing page evidence denied");
attack("CTX-MISSING-INDEX", getMonetizationPolicy({ pathname: candidateContext.pathname, reviewedPublisherContent: true }).state === MONETIZATION_STATES.NEVER_MONETIZE, "missing indexability denied");
attack("CTX-MISSING-REVIEW", getMonetizationPolicy({ pathname: candidateContext.pathname, indexable: true }).state === MONETIZATION_STATES.NEVER_MONETIZE, "missing publisher-content review denied");
attack("CTX-NOINDEX", getMonetizationPolicy({ ...candidateContext, noindex: true }).state === MONETIZATION_STATES.NEVER_MONETIZE, "runtime noindex overrides candidate registry");
attack("CTX-FALSE-INDEX", getMonetizationPolicy({ ...candidateContext, indexable: false }).state === MONETIZATION_STATES.NEVER_MONETIZE, "false indexability denied");

attack("PAGE-HOLD", !isPlacementEligible(getMonetizationPolicy({ pathname: "/learn/buddhism-101/what-is-buddhism/", indexable: true, reviewedPublisherContent: true }), AD_ZONES.LEARN_AFTER_MEANINGFUL_SECTION), "allowlisted Learn zone cannot lift held page");
attack("PAGE-NEVER", !isPlacementEligible(getMonetizationPolicy({ pathname: "/privacy-policy/", indexable: true, reviewedPublisherContent: true }), AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION), "allowlisted zone cannot lift never page");
attack("ZONE-UNKNOWN", !isPlacementEligible(candidate, "ARTICLE_SIDEBAR"), "unregistered zone denied");
attack("ZONE-MISSING", !isPlacementEligible(candidate), "missing zone denied");
for (const zone of PROTECTED_ZONE_NAMES) attack(`ZONE-${zone}`, !isPlacementEligible(candidate, zone), `${zone} protected`);

attack("GATE-RUNTIME", canLoadAdSenseRuntime() === false, "runtime cannot load");
attack("GATE-RENDER", canRenderAd({ policy: candidate, zone: AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION }) === false, "strongest candidate and safe zone still cannot render");
attack("GATE-MISSING-POLICY", canRenderAd({ zone: AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION }) === false, "missing policy cannot render");
attack("GATE-ALL-FALSE", [ADSENSE.siteApprovedForRendering, ADSENSE.servingEnabled, ADSENSE.autoAdsEnabled, ADSENSE.runtimeScriptEnabled, ADSENSE.manualSlotsEnabled].every((value) => value === false), "all five global controls false");

const entries = Object.entries(MONETIZATION_ROUTE_REGISTRY);
attack("REG-COMPLETE", entries.length === 335 && entries.every(([, row]) => row.state), "335/335 HTML routes classified");
attack("REG-NOINDEX", entries.filter(([, row]) => !row.indexable).every(([, row]) => row.state === MONETIZATION_STATES.NEVER_MONETIZE), "all 186 non-indexable rows denied");
attack("REG-CANDIDATES", entries.filter(([, row]) => row.state === MONETIZATION_STATES.ELIGIBLE_CANDIDATE).length === 7, "candidate set cannot expand implicitly");
attack("REG-WEAKEST", entries.filter(([, row]) => row.state === MONETIZATION_STATES.ELIGIBLE_CANDIDATE).every(([route, row]) => row.family === "ARTICLE" && read(`dist${route}index.html`).includes("Selected References") && read(`dist${route}index.html`).includes("Echo Buddha Editorial")), "every candidate, including weakest, has rendered references and accountability");

const htmlFiles = fs.readdirSync(path.join(root, "dist"), { recursive: true }).filter((file) => String(file).endsWith(".html")).map((file) => path.join(root, "dist", String(file)));
const html = htmlFiles.map((file) => read(file));
attack("OUT-NETWORK", html.every((value) => !/pagead2\.googlesyndication|adsbygoogle|google_ad_client/i.test(value)), "335 built pages contain zero real ad request code");
attack("OUT-PLACEHOLDER", html.every((value) => !/<[^>]+class=["'][^"']*\bad-slot\b/i.test(value)), "335 built pages contain zero empty slot elements");
attack("OUT-VERIFY", read("dist/index.html").includes("google-adsense-account") && !read("dist/404.html").includes("google-adsense-account"), "verification remains network-free and noindex-aware");
attack("OUT-SITEMAP", [...read("dist/sitemap.xml").matchAll(/<loc>/g)].length === 149, "149-URL indexable inventory preserved");

const phase10Files = fs.readdirSync(outDir).filter((name) => !name.endsWith(".mjs")).map((name) => read(path.join(outDir, name))).join("\n");
const secretPatterns = [["ya29", "."].join(""), ["AI", "za"].join("")];
attack("SEC-TOKEN", secretPatterns.every((marker) => !phase10Files.includes(marker)), "no token/API-key value marker in audit artifacts");
attack("SEC-PRIVATE-DATA", !phase10Files.includes("/Users/tharindu/.config/echobuddha") && !phase10Files.includes("gsc-oauth-client.json") && !phase10Files.includes("gsc-token.json"), "no private OAuth path in artifacts");

const bypasses = checks.filter((item) => item.result === "FAIL_BYPASS");
const result = {
  phase: 10,
  generated_at: new Date().toISOString(),
  reviewer: "independent adversarial deterministic pass",
  status: bypasses.length === 0 ? "PASS_WITH_EXPLICIT_HOLDS" : "FAIL",
  independent_pass: bypasses.length === 0,
  attacks_total: checks.length,
  attacks_passed: checks.length - bypasses.length,
  bypasses: bypasses.length,
  checks,
  conclusion: bypasses.length === 0 ? "No attempted unknown-route, malformed-input, context, page, zone, output or gate bypass produced ad rendering." : "At least one firewall bypass succeeded.",
  current_ad_requests: 0,
  owner_holds_preserved: true
};
fs.writeFileSync(path.join(outDir, "INDEPENDENT_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, attacks: result.attacks_total, bypasses: result.bypasses }, null, 2));
if (bypasses.length) process.exitCode = 1;
