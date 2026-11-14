import fs from "node:fs";
import path from "node:path";
import { classifyProduction, createGitHubReader, PRODUCTION_ORIGIN, resolveProductionDeployment } from "./production-deployment-evidence.mjs";
import { verifyReleaseIdentity } from "./production-release-identity.mjs";

const monitor = process.argv.includes("--monitor");
const waitForRelease = process.argv.includes("--wait-for-release");
const origin = monitor ? PRODUCTION_ORIGIN : process.env.PRODUCTION_ORIGIN || PRODUCTION_ORIGIN;
const root = process.cwd();
const outDir = path.resolve(root, process.env.SMOKE_OUT_DIR || ".artifacts/production-smoke");
fs.mkdirSync(outDir, { recursive: true });
let deploymentEvidence;
if (monitor) {
  try {
    const repository = process.env.GITHUB_REPOSITORY;
    deploymentEvidence = await resolveProductionDeployment(repository, createGitHubReader(repository, process.env.GH_TOKEN));
  } catch (error) {
    fs.writeFileSync(path.join(outDir, "deployment-evidence-error.json"), JSON.stringify({
      result: "DEPLOYMENT_EVIDENCE_UNAVAILABLE",
      error: error.message,
    }, null, 2) + "\n");
    throw error;
  }
}
const expectedSha = deploymentEvidence?.verified.sha ?? process.env.RELEASE_SHA;
const releaseBaseline = JSON.parse(fs.readFileSync(path.join(root, "governance/release-baseline.json"), "utf8"));
const indexableApprovals = JSON.parse(fs.readFileSync(path.join(root, "governance/indexable-page-approvals.json"), "utf8"));
const releaseChanges = JSON.parse(fs.readFileSync(path.join(root, "governance/release-change-approvals.json"), "utf8"));
const approvedRoutes = indexableApprovals.approvals
  .filter((approval) => approval.status === "Approved")
  .map((approval) => approval.route);
const retiredRoutes = releaseChanges.changes
  .filter((change) => change.approved && change.type === "redirect-and-content-consolidation")
  .map((change) => change.target.split(" -> ")[0]);
const approvedQuoteNoindexCount = releaseChanges.changes
  .filter((change) => change.approved && change.type === "quote-indexation-remediation")
  .reduce((total, change) => total + Number(change.expectedIndexableToNoindex || 0), 0);
const expectedSitemapCount = releaseBaseline.counts.sitemap + approvedRoutes.length - retiredRoutes.length - approvedQuoteNoindexCount;
const approvedUserPermalinks = releaseChanges.changes
  .filter((change) => change.approved === true && change.type === "user-permalink-addition")
  .map((change) => change.target);
if (new Set(approvedUserPermalinks).size !== approvedUserPermalinks.length ||
    approvedUserPermalinks.some(route => !/^\/(quotes\/[^/]+\/[^/]+|daily-reflections\/[^/]+)\/$/.test(route))) {
  throw new Error("Approved user permalinks must be unique quote/reflection detail routes.");
}
const expectedSearchCount = releaseBaseline.counts.search + approvedRoutes.length + approvedUserPermalinks.length - retiredRoutes.length;
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
  signal: AbortSignal.timeout(10000),
  headers: { "user-agent": "EchoBuddha-Phase9-Smoke/1.0" },
});

const identityResult = await verifyReleaseIdentity(origin, expectedSha, {
  waitForRelease,
  onRetry: (observation, delay) => console.log(
    `Release identity still pending (${observation.sha ?? observation.result}); checking again in ${delay / 1000}s.`
  ),
});
const { identity, attempts } = identityResult;
const lastAttempt = attempts.at(-1);
check("release-identity", identityResult.pass,
  `${lastAttempt.status ?? lastAttempt.result}; serving ${identity.sha ?? "unverified"}; ${attempts.length} attempt(s)`);

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
    sitemapUrls.every((url) => url.startsWith(`${origin}/`)) &&
    approvedRoutes.every((route) => sitemapRoutes.has(route)) &&
    approvedUserPermalinks.every((route) => !sitemapRoutes.has(route)) &&
    retiredRoutes.every((route) => !sitemapRoutes.has(route)),
  `${sitemapResponse.status}; ${sitemapUrls.length}/${expectedSitemapCount} URLs; ${approvedRoutes.length} approved additions present; ${retiredRoutes.length} approved consolidations absent; ${approvedQuoteNoindexCount} approved quote noindex decisions applied`
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
  searchResponse.status === 200 && search.length === expectedSearchCount &&
    approvedRoutes.every((route) => searchRoutes.has(route)) &&
    approvedUserPermalinks.every((route) => searchRoutes.has(route)) &&
    retiredRoutes.every((route) => !searchRoutes.has(route)),
  `${searchResponse.status}; ${search.length}/${expectedSearchCount} items; ${approvedRoutes.length} approved indexable additions and ${approvedUserPermalinks.length} noindex permalinks present; ${retiredRoutes.length} approved consolidations absent`
);

const adsResponse = await get("/ads.txt");
const adsTxt = (await adsResponse.text()).trim();
check("ads.txt", adsResponse.status === 200 && adsTxt === expectedAdsTxt, `${adsResponse.status}; exact ${adsTxt === expectedAdsTxt}`);

const missingResponse = await get("/phase-9-smoke-missing/", { redirect: "manual" });
const missingHtml = await missingResponse.text();
check("404", missingResponse.status === 404 && /text\/html/.test(missingResponse.headers.get("content-type") || "") && /<h1\b/i.test(missingHtml) && /name=["']robots["'] content=["']noindex, follow/.test(missingHtml) && !/rel=["']canonical["']/.test(missingHtml), `${missingResponse.status}; rendered HTML error page with H1 and noindex, no canonical`);

const httpResponse = await fetch("http://echobuddha.com/", { redirect: "manual" });
check("https-redirect", [301, 302, 307, 308].includes(httpResponse.status) && httpResponse.headers.get("location") === `${origin}/`, `${httpResponse.status}; ${httpResponse.headers.get("location")}`);

const workersResponse = await fetch("https://echobuddha.rmtlbandara.workers.dev/");
check("preview-noindex", workersResponse.status === 200 && workersResponse.headers.get("x-robots-tag") === "noindex, nofollow", `${workersResponse.status}; ${workersResponse.headers.get("x-robots-tag")}`);

const failures = checks.filter((item) => !item.pass);
const result = {
  generatedAt: new Date().toISOString(),
  origin,
  sha: expectedSha || "not-provided",
  releaseIdentityAttempts: attempts,
  ...(deploymentEvidence && {
    deploymentEvidence,
    productionStatus: classifyProduction(deploymentEvidence, identity, failures.map(check => check.name)),
  }),
  deployedIdentity: identity,
  workflowRunId: process.env.GITHUB_RUN_ID || "local",
  total: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  pass: failures.length === 0,
  checks,
};
fs.writeFileSync(path.join(outDir, "production-smoke-results.json"), `${JSON.stringify(result, null, 2)}\n`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name}: ${item.evidence}`);
if (deploymentEvidence) {
  const { latest, verified } = deploymentEvidence;
  const summary = [
    `Production monitoring: ${result.productionStatus}`,
    `Expected ${verified.sha} from deployment ${verified.deploymentId}, status ${verified.statusId} (${verified.verification}).`,
    `Newest attempt: deployment ${latest.deploymentId} (${latest.state}).`,
    `Observed: ${identity.sha ?? "unverified"}. Smoke: ${result.passed}/${result.total}.`,
  ].join("\n");
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}
if (failures.length) process.exitCode = 1;
