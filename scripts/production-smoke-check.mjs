import fs from "node:fs";
import path from "node:path";

const origin = process.env.PRODUCTION_ORIGIN || "https://echobuddha.com";
const root = process.cwd();
const outDir = path.resolve(root, process.env.SMOKE_OUT_DIR || ".artifacts/production-smoke");
const indexableApprovals = JSON.parse(fs.readFileSync(path.join(root, "governance/indexable-page-approvals.json"), "utf8"));
const currentInventory = JSON.parse(fs.readFileSync(path.join(root, "docs/audits/content-audit/post-remediation-summary.json"), "utf8"));
const currentGovernance = JSON.parse(fs.readFileSync(path.join(root, "docs/audits/adsense-rejection-2026-08/phase-8-technical-adsense-privacy/phase-8-custom-validation.json"), "utf8"));
const approvedRoutes = indexableApprovals.approvals
  .filter((approval) => approval.status === "Approved")
  .map((approval) => approval.route);
const searchCountEvidence = currentGovernance.checks.find((item) => item.name === "Protected search index count")?.evidence || "";
const expectedSitemapCount = currentInventory.sitemapUrls;
const expectedSearchCount = Number.parseInt(searchCountEvidence.match(/^(\d+) search records/)?.[1] || "", 10);
if (!Number.isInteger(expectedSitemapCount) || !Number.isInteger(expectedSearchCount)) {
  throw new Error("Current recovery inventory counts are unavailable.");
}
const expectedAdsTxt = "google.com, pub-3911157640549350, DIRECT, f08c47fec0942fa0";
const expectedHeaders = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "x-frame-options",
  "permissions-policy",
  "x-permitted-cross-domain-policies",
];
const checks = [];
const check = (name, pass, evidence) => checks.push({ name, pass: Boolean(pass), evidence });
const get = (pathname, options = {}) => fetch(`${origin}${pathname}`, {
  redirect: options.redirect || "follow",
  headers: { "user-agent": "EchoBuddha-Phase9-Smoke/1.0" },
});

const homeResponse = await get("/");
const home = await homeResponse.text();
check("homepage", homeResponse.status === 200 && /<h1\b/i.test(home), `${homeResponse.status}; H1 ${/<h1\b/i.test(home)}`);
check("consent", /data-consent-panel/.test(home) && /It stays off unless you accept/.test(home), "affirmative preference UI present");
check("adsense-runtime", !/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/.test(home) && !/class=["'][^"']*ad-slot/.test(home), "0 homepage runtime scripts/slots");
check("verification-meta", /google-adsense-account["'] content=["']ca-pub-3911157640549350/.test(home), "publisher meta present");
const missingHeaders = expectedHeaders.filter((header) => !homeResponse.headers.has(header));
check("security-headers", missingHeaders.length === 0 && !homeResponse.headers.has("content-security-policy-report-only"), missingHeaders.length ? missingHeaders.join(" | ") : "enforced CSP + 6 baseline headers");

const robotsResponse = await get("/robots.txt");
const robots = await robotsResponse.text();
check("robots", robotsResponse.status === 200 && /Sitemap: https:\/\/echobuddha\.com\/sitemap\.xml/.test(robots) && /Mediapartners-Google[\s\S]*Allow: \//.test(robots), `${robotsResponse.status}; crawler policy present`);

const sitemapResponse = await get("/sitemap.xml");
const sitemap = await sitemapResponse.text();
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((item) => item[1]);
const sitemapRoutes = new Set(sitemapUrls.map((url) => new URL(url).pathname));
check(
  "sitemap",
  sitemapResponse.status === 200 && sitemapUrls.length === expectedSitemapCount &&
    sitemapUrls.every((url) => url.startsWith(`${origin}/`)) && approvedRoutes.every((route) => sitemapRoutes.has(route)),
  `${sitemapResponse.status}; ${sitemapUrls.length}/${expectedSitemapCount} URLs; ${approvedRoutes.length} approved additions present`
);

const ownerResponse = await get("/learn/four-noble-truths/");
const owner = await ownerResponse.text();
check("primary-owner", ownerResponse.status === 200 && !/noindex/i.test(owner.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || "") && /rel=["']canonical["'][^>]+https:\/\/echobuddha\.com\/learn\/four-noble-truths\//.test(owner), `${ownerResponse.status}; indexable self-canonical`);

const noindexResponse = await get("/search/");
const noindex = await noindexResponse.text();
check("noindex-route", noindexResponse.status === 200 && /name=["']robots["'] content=["']noindex, follow/.test(noindex), `${noindexResponse.status}; noindex follow`);

const searchResponse = await get("/search-index.json");
const search = await searchResponse.json();
const searchRoutes = new Set(search.map((entry) => entry.url));
check(
  "search",
  searchResponse.status === 200 && search.length === expectedSearchCount && approvedRoutes.every((route) => searchRoutes.has(route)),
  `${searchResponse.status}; ${search.length}/${expectedSearchCount} items; ${approvedRoutes.length} approved additions present`
);

const adsResponse = await get("/ads.txt");
const adsTxt = (await adsResponse.text()).trim();
check("ads.txt", adsResponse.status === 200 && adsTxt === expectedAdsTxt, `${adsResponse.status}; exact ${adsTxt === expectedAdsTxt}`);

const missingResponse = await get("/phase-9-smoke-missing/", { redirect: "manual" });
check("404", missingResponse.status === 404, `${missingResponse.status}`);

const httpResponse = await fetch("http://echobuddha.com/", { redirect: "manual" });
check("https-redirect", [301, 302, 307, 308].includes(httpResponse.status) && httpResponse.headers.get("location") === `${origin}/`, `${httpResponse.status}; ${httpResponse.headers.get("location")}`);

const workersResponse = await fetch("https://echobuddha.rmtlbandara.workers.dev/");
check("preview-noindex", workersResponse.status === 200 && workersResponse.headers.get("x-robots-tag") === "noindex, nofollow", `${workersResponse.status}; ${workersResponse.headers.get("x-robots-tag")}`);

const failures = checks.filter((item) => !item.pass);
const result = {
  generatedAt: new Date().toISOString(),
  origin,
  sha: process.env.RELEASE_SHA || "not-provided",
  workflowRunId: process.env.GITHUB_RUN_ID || "local",
  total: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  pass: failures.length === 0,
  checks,
};
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "production-smoke-results.json"), `${JSON.stringify(result, null, 2)}\n`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}: ${item.evidence}`);
if (failures.length) process.exitCode = 1;
