import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const auditDir = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-8-technical-adsense-privacy");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const checks = [];
const check = (area, name, callback) => {
  try {
    const evidence = callback();
    checks.push({ area, name, pass: true, evidence: String(evidence ?? "pass") });
  } catch (error) {
    checks.push({ area, name, pass: false, evidence: error.message });
  }
};

const htmlFiles = walk(path.join(root, "dist")).filter((file) => file.endsWith(".html"));
const html = htmlFiles.map((file) => fs.readFileSync(file, "utf8"));
const sitemap = read("dist/sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const searchIndex = JSON.parse(read("dist/search-index.json"));
const releaseBaseline = JSON.parse(read("governance/release-baseline.json"));
const indexableApprovals = JSON.parse(read("governance/indexable-page-approvals.json"));
const approvedRoutes = indexableApprovals.approvals
  .filter((approval) => approval.status === "Approved")
  .map((approval) => approval.route);
const expectedHtmlCount = releaseBaseline.counts.html + approvedRoutes.length;
const expectedSitemapCount = releaseBaseline.counts.sitemap + approvedRoutes.length;
const expectedSearchCount = releaseBaseline.counts.search + approvedRoutes.length;
const builtRoutes = new Set(htmlFiles.map((file) => {
  const relative = path.relative(path.join(root, "dist"), file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}));
const sitemapRoutes = new Set(sitemapUrls.map((url) => new URL(url).pathname));
const searchRoutes = new Set(searchIndex.map((entry) => entry.url));

check("Build", "Protected route count", () => {
  assert.equal(htmlFiles.length, expectedHtmlCount);
  assert.ok(approvedRoutes.every((route) => builtRoutes.has(route)));
  return `${htmlFiles.length} HTML pages (${releaseBaseline.counts.html} protected baseline + ${approvedRoutes.length} approved additions)`;
});
check("Sitemap", "Protected sitemap count and canonical host", () => {
  assert.equal(sitemapUrls.length, expectedSitemapCount);
  assert.ok(sitemapUrls.every((url) => url.startsWith("https://echobuddha.com/")));
  assert.ok(approvedRoutes.every((route) => sitemapRoutes.has(route)));
  return `${sitemapUrls.length} canonical URLs (${releaseBaseline.counts.sitemap} protected baseline + ${approvedRoutes.length} approved additions)`;
});
check("Search", "Protected search index count", () => {
  assert.equal(searchIndex.length, expectedSearchCount);
  assert.ok(approvedRoutes.every((route) => searchRoutes.has(route)));
  return `${searchIndex.length} search records (${releaseBaseline.counts.search} protected baseline + ${approvedRoutes.length} approved additions)`;
});
check("Canonical", "Every HTML document has at most one canonical", () => {
  const failures = htmlFiles.filter((file, index) => (html[index].match(/rel="canonical"/g) || []).length > 1);
  assert.deepEqual(failures, []);
  return "0 duplicate canonicals";
});
check("Structured data", "Every emitted JSON-LD block parses", () => {
  let count = 0;
  for (const document of html) {
    for (const match of document.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      JSON.parse(match[1]);
      count += 1;
    }
  }
  return `${count} JSON-LD blocks parsed`;
});
check("AdSense", "Runtime script is absent from every route", () => {
  assert.ok(html.every((document) => !document.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js")));
  return "0 runtime scripts";
});
check("AdSense", "No manual ad placeholder is rendered", () => {
  assert.ok(html.every((document) => !document.includes("class=\"ad-slot")));
  return "0 rendered manual slots";
});
check("AdSense", "No-network ownership verification is correct", () => {
  assert.equal(read("public/ads.txt").trim(), "google.com, pub-3911157640549350, DIRECT, f08c47fec0942fa0");
  assert.match(read("dist/index.html"), /google-adsense-account/);
  return "meta + ads.txt";
});
check("Privacy", "First visit is affirmative opt-in", () => {
  const consent = read("src/components/ConsentManager.astro");
  assert.match(consent, /else \{\s*openPanel\(\);\s*\}/);
  assert.doesNotMatch(consent, /if \(!preference\) writePreference\(true\)/);
  assert.match(consent, /It stays off unless you accept/);
  return "no inferred acceptance";
});
check("Privacy", "Privacy policy matches no-ad-runtime state", () => {
  const policy = read("src/pages/privacy-policy.astro");
  assert.match(policy, /does not currently serve ad units/);
  assert.match(policy, /does not currently serve ad units or\s*load the AdSense runtime script/);
  assert.match(policy, /Google-certified consent-management path/);
  return "policy-to-code alignment present";
});
check("Security", "CSP is enforced and excludes disabled ad runtime", () => {
  const headers = read("public/_headers");
  assert.match(headers, /Content-Security-Policy:/);
  assert.doesNotMatch(headers, /Content-Security-Policy-Report-Only:/);
  assert.doesNotMatch(headers, /googlesyndication|doubleclick/);
  assert.match(headers, /frame-ancestors 'none'/);
  return "enforced least-current-privilege CSP";
});
check("Caching", "Fingerprint and machine-file cache policies exist", () => {
  const headers = read("public/_headers");
  assert.match(headers, /\/_astro\/\*[\s\S]*max-age=31536000, immutable/);
  for (const route of ["search-index.json", "robots.txt", "sitemap.xml", "ads.txt"]) assert.match(headers, new RegExp(route.replace(".", "\\.")));
  return "5 explicit cache classes";
});
check("Preview", "workers.dev is protected from indexing", () => {
  assert.match(read("public/_headers"), /workers\.dev\/\*[\s\S]*X-Robots-Tag: noindex, nofollow/);
  return "X-Robots-Tag noindex, nofollow";
});
check("Redirects", "No invalid static hostname redirect file is emitted", () => {
  assert.equal(fs.existsSync(path.join(root, "public/_redirects")), false);
  assert.equal(fs.existsSync(path.join(root, "dist/_redirects")), false);
  return "canonical hostname redirects remain verified Cloudflare dashboard/DNS behavior";
});
check("Exposure", "No source maps or private dotfiles are emitted", () => {
  const emitted = walk(path.join(root, "dist"));
  const failures = emitted.filter((file) => file.endsWith(".map") || path.basename(file).startsWith(".env") || file.includes(`${path.sep}.git${path.sep}`));
  assert.deepEqual(failures, []);
  return "0 exposed source maps/private dotfiles";
});
check("Secrets", "Tracked source has no recognized high-confidence secret material", () => {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root }).toString().split("\0").filter(Boolean);
  const patterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /AKIA[0-9A-Z]{16}/, /gh[pousr]_[A-Za-z0-9]{36,}/, /sk_live_[A-Za-z0-9]{20,}/];
  const failures = tracked.filter((file) => {
    const full = path.join(root, file);
    if (!fs.existsSync(full) || fs.statSync(full).size > 5_000_000) return false;
    const content = fs.readFileSync(full, "utf8");
    return patterns.some((pattern) => pattern.test(content));
  });
  assert.deepEqual(failures, []);
  return "0 high-confidence matches";
});

const requiredDeliverables = [
  "phase-8-technical-risk-register.csv", "phase-8-production-route-review.csv", "phase-8-http-tls-review.csv",
  "phase-8-robots-review.csv", "phase-8-sitemap-review.csv", "phase-8-indexability-review.csv",
  "phase-8-canonical-review.csv", "phase-8-redirect-review.csv", "phase-8-structured-data-review.csv",
  "phase-8-adsense-implementation-review.csv", "phase-8-adsense-route-matrix.csv", "phase-8-adsense-script-route-test.csv",
  "phase-8-ads-txt-review.csv", "phase-8-consent-architecture-review.csv", "phase-8-consent-test-matrix.csv",
  "phase-8-privacy-inventory.csv", "phase-8-third-party-network-review.csv", "phase-8-analytics-review.csv",
  "phase-8-consent-mode-review.csv", "phase-8-cmp-review.csv", "phase-8-privacy-policy-accuracy-review.csv",
  "phase-8-production-header-review.csv", "phase-8-csp-review.csv", "phase-8-security-header-review.csv",
  "phase-8-cache-review.csv", "phase-8-cloudflare-config-review.csv", "phase-8-dependency-security-review.csv",
  "phase-8-performance-review.csv", "phase-8-asset-review.csv", "phase-8-accessibility-technical-review.csv",
  "phase-8-production-parity.csv", "phase-8-page-change-register.csv", "phase-8-content-preservation.csv",
  "phase-8-template-preservation.csv", "phase-8-trust-preservation.csv", "phase-8-ux-preservation.csv",
  "phase-8-ownership-preservation.csv", "phase-8-indexability-preservation.csv", "phase-8-owner-legal-review-items.csv",
  "phase-8-phase9-handoff.csv", "phase-8-phase10-handoff.csv", "phase-8-validation-summary.csv",
  "phase-8-production-smoke-test-results.csv", "phase-8-rollback-map.csv", "phase-8-data-flow-map.md",
  "phase-8-production-smoke-test-plan.md", "MASTER_PRE_PHASE9_PROTECTION_REGISTER.csv",
  "ECHO_BUDDHA_TECHNICAL_ADSENSE_PRIVACY_PRODUCTION_HARDENING_REPORT.md"
];
check("Evidence", "All mandatory Phase 8 deliverables exist and are non-empty", () => {
  const missing = requiredDeliverables.filter((file) => !fs.existsSync(path.join(auditDir, file)) || fs.statSync(path.join(auditDir, file)).size === 0);
  assert.deepEqual(missing, []);
  return `${requiredDeliverables.length} required artifacts`;
});

const failed = checks.filter((item) => !item.pass);
fs.mkdirSync(auditDir, { recursive: true });
fs.writeFileSync(path.join(auditDir, "phase-8-custom-validation.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalChecks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  pass: failed.length === 0,
  checks
}, null, 2)}\n`);

if (failed.length) {
  for (const failure of failed) console.error(`${failure.area}: ${failure.name}: ${failure.evidence}`);
  process.exit(1);
}
console.log(`Phase 8 validation passed: ${checks.length}/${checks.length} checks.`);
