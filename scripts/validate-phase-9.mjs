import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import YAML from "yaml";

const root = process.cwd();
const dist = path.join(root, "dist");
const auditDir = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-9-ci-git-deployment");
const outputPath = process.env.PHASE9_AUDIT_OUT
  ? path.resolve(root, process.env.PHASE9_AUDIT_OUT)
  : path.join(auditDir, "phase-9-custom-validation.json");
const origin = "https://echobuddha.com";
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});
const match = (value, pattern) => value.match(pattern)?.[1]?.trim() || "";
const routeFor = (file) => {
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
};
const canonicalFor = (html) => match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)
  || match(html, /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
const robotsFor = (html) => match(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i)
  || match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i)
  || "index, follow (implicit)";
const parseCsv = (text) => {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (character !== "\r") field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...records] = rows.filter((item) => item.some(Boolean));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
};

const checks = [];
const check = (area, name, callback) => {
  try {
    const evidence = callback();
    checks.push({ area, name, pass: true, evidence: String(evidence ?? "pass") });
  } catch (error) {
    checks.push({ area, name, pass: false, evidence: error.message });
  }
};

if (!fs.existsSync(path.join(dist, "index.html"))) throw new Error("Phase 9 validation requires a current production build.");
const baseline = JSON.parse(read("governance/release-baseline.json"));
const pageApprovals = JSON.parse(read("governance/indexable-page-approvals.json")).approvals;
const changeApprovals = JSON.parse(read("governance/release-change-approvals.json")).changes;
const approvedNewRoutes = pageApprovals.filter((approval) => approval.status === "Approved").map((approval) => approval.route);
const approvedRetiredRoutes = changeApprovals
  .filter((approval) => approval.approved === true && approval.type === "redirect-and-content-consolidation")
  .map((approval) => approval.target.split(" -> ")[0]);
const quoteRemediationApproval = changeApprovals.find(
  (approval) => approval.approved === true && approval.type === "quote-indexation-remediation"
);
const phase5DecisionPath = path.join(root, "docs/audits/adsense-recovery-phase-5-2026-08-24/ECHO_BUDDHA_PHASE_5_QUOTE_DECISIONS.csv");
const phase5Decisions = fs.existsSync(phase5DecisionPath) ? parseCsv(fs.readFileSync(phase5DecisionPath, "utf8")) : [];
const approvedQuoteNoindexRoutes = new Set(phase5Decisions
  .filter((row) => row.decision === "NOINDEX_USER_PERMALINK" && row["before indexability"] === "true" && row["new index state"] === "noindex, follow")
  .map((row) => new URL(row["detail URL"]).pathname));
const htmlFiles = walk(dist).filter((file) => file.endsWith(".html")).sort();
const currentRoutes = htmlFiles.map((file) => {
  const route = routeFor(file);
  const html = fs.readFileSync(file, "utf8");
  const robots = robotsFor(html);
  return { route, file, html, robots, indexable: !/noindex/i.test(robots) && route !== "/404.html", canonical: canonicalFor(html) };
});
const routeMap = new Map(currentRoutes.map((route) => [route.route, route]));
const baselineMap = new Map(baseline.routes.map((route) => [route.route, route]));
const sitemap = read("dist/sitemap.xml");
const sitemapRoutes = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((item) => new URL(item[1]).pathname));
const approvalFor = (type, target) => changeApprovals.find((approval) => approval.type === type && approval.target === target && approval.approved === true && approval.reason && approval.owner && approval.date);

check("Baseline", "Phase 8 production baseline is exact and complete", () => {
  assert.equal(baseline.sourceCommit, "e01071b114cd3615840dfa630f5ee03c1348a570");
  assert.equal(baseline.production.implementationCommit, "8de969c74139a68b88849f2404e3dc7c353e6a12");
  assert.deepEqual(baseline.counts, { html: 336, indexable: 193, noindexOrError: 143, sitemap: 193, search: 315, primaryOwners: 40 });
  return "336/193/143 routes; 193 sitemap; 315 search; 40 owners";
});

check("Routes", "No protected URL disappears without explicit approval", () => {
  const removed = baseline.routes.filter((route) => !routeMap.has(route.route) && !approvalFor("remove-url", route.route) && !approvedRetiredRoutes.includes(route.route));
  assert.deepEqual(removed, []);
  assert.ok(approvedRetiredRoutes.every((route) => !routeMap.has(route)));
  return `0 silent removals; ${approvedRetiredRoutes.length} approved consolidation source(s)`;
});

check("Routes", "Every new indexable URL has complete human approval metadata", () => {
  const required = ["route", "topicCluster", "pageRole", "primaryOwner", "userNeed", "intendedReader", "closestExistingPage", "whyNotImproveExisting", "uniqueValue", "sourceRequirements", "safetyRequirements", "indexIntent", "monetizationSuitability", "nextStep", "independentValueWithoutSearchOrAds", "owner", "approvedAt", "status"];
  const newIndexable = currentRoutes.filter((route) => route.indexable && !baselineMap.has(route.route));
  const failures = newIndexable.filter((route) => {
    const approval = pageApprovals.find((item) => item.route === route.route);
    return !approval || approval.status !== "Approved" || required.some((field) => !String(approval[field] || "").trim());
  });
  assert.deepEqual(failures, []);
  return `${newIndexable.length} new indexable URL(s); all approved`;
});

check("Indexability", "Protected index and canonical state cannot drift silently", () => {
  const drift = [];
  for (const [route, previous] of baselineMap) {
    const current = routeMap.get(route);
    if (!current) continue;
    const approvedQuoteNoindex = quoteRemediationApproval && approvedQuoteNoindexRoutes.has(route) && previous.indexable && !current.indexable;
    if (current.indexable !== previous.indexable && !approvalFor("index-state", route) && !approvedQuoteNoindex) drift.push(`${route}: index state`);
    if (current.canonical !== previous.canonical && !approvalFor("canonical", route)) drift.push(`${route}: canonical`);
  }
  assert.deepEqual(drift, []);
  assert.equal(approvedQuoteNoindexRoutes.size, Number(quoteRemediationApproval?.expectedIndexableToNoindex || 0));
  return `0 unapproved index/canonical changes; ${approvedQuoteNoindexRoutes.size} approved quote noindex changes`;
});

check("Sitemap", "Sitemap contains only current indexable self-canonical routes", () => {
  const failures = [...sitemapRoutes].filter((route) => {
    const page = routeMap.get(route);
    return !page || !page.indexable || page.canonical !== `${origin}${route}`;
  });
  assert.deepEqual(failures, []);
  assert.equal(sitemapRoutes.size, baseline.counts.sitemap + approvedNewRoutes.length - approvedRetiredRoutes.length - approvedQuoteNoindexRoutes.size);
  assert.ok(approvedNewRoutes.every((route) => sitemapRoutes.has(route)));
  assert.ok(approvedRetiredRoutes.every((route) => !sitemapRoutes.has(route)));
  assert.ok([...approvedQuoteNoindexRoutes].every((route) => !sitemapRoutes.has(route) && routeMap.get(route)?.indexable === false));
  return `${sitemapRoutes.size} valid routes (${baseline.counts.sitemap} protected baseline + ${approvedNewRoutes.length} approved additions - ${approvedRetiredRoutes.length} approved consolidations - ${approvedQuoteNoindexRoutes.size} approved quote noindex decisions); 0 noindex/redirect/unknown URLs`;
});

check("Canonical", "All public pages retain self canonicals and 404 retains none", () => {
  const failures = currentRoutes.filter((page) => page.route === "/404.html" ? page.canonical : page.canonical !== `${origin}${page.route}`);
  assert.deepEqual(failures, []);
  return `${currentRoutes.length - 1} self canonicals; 404 canonical absent`;
});

check("Internal links", "Every source-controlled internal HTML link resolves", () => {
  const resources = new Set(walk(dist).map((file) => `/${path.relative(dist, file).split(path.sep).join("/")}`));
  const failures = [];
  for (const page of currentRoutes) {
    for (const item of page.html.matchAll(/\shref=["']([^"'#]+)["']/gi)) {
      const href = item[1];
      if (!href.startsWith("/") && !href.startsWith(origin)) continue;
      const pathname = new URL(href, origin).pathname;
      const normalized = pathname === "/404/" ? "/404.html" : pathname;
      if (!routeMap.has(normalized) && !resources.has(normalized) && !resources.has(`${normalized}index.html`)) failures.push(`${page.route} -> ${pathname}`);
    }
  }
  assert.deepEqual([...new Set(failures)], []);
  return "0 broken internal links";
});

check("Ownership", "Primary topic owners remain unique, indexable and in sitemap", () => {
  const owners = parseCsv(read("docs/audits/adsense-rejection-2026-08/reconciliation/phase-0-4-current-topic-owner-review.csv"));
  assert.equal(owners.length, 40);
  assert.equal(new Set(owners.map((row) => row.Topic)).size, 40);
  assert.equal(new Set(owners.map((row) => row["Primary owner URL"])).size, 40);
  const failures = owners.filter((row) => {
    const route = new URL(row["Primary owner URL"]).pathname;
    const page = routeMap.get(route);
    return !page?.indexable || !sitemapRoutes.has(route) || page.canonical !== row["Primary owner URL"];
  });
  assert.deepEqual(failures, []);
  return "40/40 unique owners protected";
});

check("Structured data", "JSON-LD parses and cannot fabricate people, reviewers or credentials", () => {
  let blocks = 0;
  const failures = [];
  for (const page of currentRoutes) {
    for (const item of page.html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const parsed = JSON.parse(item[1]);
        const serialized = JSON.stringify(parsed);
        if (/"@type":"Person"|"reviewedBy"|"reviewer"|"credential"/.test(serialized)) failures.push(page.route);
        blocks += 1;
      } catch { failures.push(`${page.route}: invalid JSON`); }
    }
  }
  assert.deepEqual([...new Set(failures)], []);
  return `${blocks} blocks; 0 invalid/fabricated trust entities`;
});

check("Trust", "Central organizational identity and trust routes remain available", () => {
  const governance = read("src/data/editorialGovernance.ts");
  assert.match(governance, /namedPersonPublished:\s*false/);
  assert.match(governance, /verifiedCredentials:\s*\[\]/);
  assert.match(governance, /externalReviewers:\s*\[\]/);
  const routes = ["/about/", "/authors/echo-buddha-editorial/", "/editorial-policy/", "/how-echo-buddha-creates-content/", "/buddhist-sources-and-citations/", "/quote-attribution-policy/", "/corrections/", "/contact/", "/meditation-safety/"];
  assert.deepEqual(routes.filter((route) => !routeMap.has(route)), []);
  return `${routes.length}/${routes.length} trust/safety routes; no named expert/reviewer`;
});

check("Template", "No two pages collapse to identical full visible content", () => {
  const hashes = new Map();
  const duplicates = [];
  for (const page of currentRoutes) {
    const visible = page.html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const hash = sha256(visible);
    if (hashes.has(hash)) duplicates.push(`${hashes.get(hash)} = ${page.route}`);
    else hashes.set(hash, page.route);
  }
  assert.deepEqual(duplicates, []);
  return "0 exact full-page visible-content duplicates; similarity remains a warning";
});

check("AdSense", "Phase 8 no-runtime and no-manual-slot state is immutable by default", () => {
  const ads = read("src/data/ads.ts");
  assert.match(ads, /publisherId:\s*"ca-pub-3911157640549350"/);
  assert.match(ads, /runtimeScriptEnabled:\s*false/);
  assert.match(ads, /manualSlotsEnabled:\s*false/);
  assert.equal(read("public/ads.txt").trim(), "google.com, pub-3911157640549350, DIRECT, f08c47fec0942fa0");
  const runtime = currentRoutes.filter((page) => /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js|class=["'][^"']*ad-slot/.test(page.html));
  assert.deepEqual(runtime, []);
  return `0 runtime scripts/slots across ${currentRoutes.length} pages; exact meta + ads.txt`;
});

check("Consent", "Analytics remains affirmative opt-in with advertising storage denied", () => {
  const consent = read("src/components/ConsentManager.astro");
  assert.match(consent, /else \{\s*openPanel\(\);\s*\}/);
  assert.doesNotMatch(consent, /if \(!preference\) writePreference\(true\)/);
  assert.match(consent, /It stays off unless you accept/);
  for (const type of ["analytics_storage", "ad_storage", "ad_user_data", "ad_personalization"]) assert.match(consent, new RegExp(`${type}:\\s*"denied"`));
  assert.doesNotMatch(read("src/layouts/Layout.astro"), /googletagmanager\.com\/gtag\/js/);
  return "no inferred choice; no alternate global Analytics loader; ad types denied";
});

check("Security", "Repository security, cache and preview policies remain protected", () => {
  const headers = read("public/_headers");
  for (const expected of ["Content-Security-Policy:", "Strict-Transport-Security: max-age=31536000", "X-Content-Type-Options: nosniff", "Referrer-Policy: strict-origin-when-cross-origin", "X-Frame-Options: DENY", "X-Permitted-Cross-Domain-Policies: none", "max-age=31536000, immutable", "X-Robots-Tag: noindex, nofollow"]) assert.match(headers, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(headers, /Content-Security-Policy-Report-Only|googlesyndication|doubleclick/);
  return "enforced CSP; baseline headers; immutable assets; preview noindex";
});

check("Protected files", "Phase 8 sensitive files cannot drift without explicit approval", () => {
  const drift = Object.entries(baseline.protectedFileHashes).filter(([file, hash]) => sha256(fs.readFileSync(path.join(root, file))) !== hash && !approvalFor("protected-file", file));
  assert.deepEqual(drift, []);
  return `${Object.keys(baseline.protectedFileHashes).length} protected file hashes unchanged`;
});

const workflowFiles = walk(path.join(root, ".github/workflows")).filter((file) => /\.ya?ml$/.test(file)).sort();
const workflows = workflowFiles.map((file) => ({ file, relative: path.relative(root, file), text: fs.readFileSync(file, "utf8"), yaml: YAML.parse(fs.readFileSync(file, "utf8")) }));

check("CI", "All workflow YAML parses and uses explicit least privilege", () => {
  assert.ok(workflows.length >= 4);
  const failures = workflows.filter((workflow) => workflow.yaml.permissions?.contents !== "read" || Object.entries(workflow.yaml.permissions || {}).some(([permission, level]) => permission !== "contents" && level === "write"));
  assert.deepEqual(failures, []);
  return `${workflows.length} workflows; contents read; 0 unexplained writes`;
});

check("CI", "Workflows contain no privileged pull_request_target or direct event-shell interpolation", () => {
  const failures = workflows.filter((workflow) => /pull_request_target/.test(workflow.text) || /run:\s*[|>-]?[\s\S]*\$\{\{\s*github\.event\./.test(workflow.text));
  assert.deepEqual(failures, []);
  return "0 unsafe privileged PR workflows; 0 event payload shell interpolation";
});

check("Supply chain", "Every workflow action is pinned to a full immutable SHA", () => {
  const uses = workflows.flatMap((workflow) => [...workflow.text.matchAll(/uses:\s*([^\s#]+)(?:\s*#\s*(.*))?/g)].map((item) => ({ workflow: workflow.relative, action: item[1], version: item[2] || "" })));
  const failures = uses.filter((item) => !/@[0-9a-f]{40}$/.test(item.action));
  assert.deepEqual(failures, []);
  assert.ok(uses.length > 0);
  return `${uses.length} action uses; all immutable SHA pinned`;
});

check("Validation workflow", "Required CI runs deterministic release and browser gates", () => {
  const workflow = workflows.find((item) => item.relative === ".github/workflows/validate.yml");
  assert.ok(workflow);
  assert.match(workflow.text, /pull_request:/);
  assert.match(workflow.text, /push:[\s\S]*branches:[\s\S]*main/);
  assert.match(workflow.text, /npm ci/);
  assert.match(workflow.text, /npm run validate:release/);
  assert.match(workflow.text, /npm run audit:browser/);
  assert.match(workflow.text, /cancel-in-progress: true/);
  assert.match(workflow.text, /timeout-minutes:/);
  return "PR/main release-validation + browser-validation; cancellation and timeouts";
});

check("Deployment", "Production workflow is manual, exact-main-SHA, serialized and smoke-tested", () => {
  const workflow = workflows.find((item) => item.relative === ".github/workflows/deploy-production.yml");
  assert.ok(workflow);
  assert.match(workflow.text, /workflow_dispatch:/);
  assert.doesNotMatch(workflow.text, /\npush:|pull_request:/);
  assert.match(workflow.text, /environment:[\s\S]*name: production/);
  assert.match(workflow.text, /group: echobuddha-production/);
  assert.match(workflow.text, /cancel-in-progress: false/);
  assert.match(workflow.text, /git merge-base --is-ancestor/);
  assert.match(workflow.text, /origin\/main/);
  assert.match(workflow.text, /npm run validate:release/);
  assert.match(workflow.text, /create-release-manifest/);
  assert.match(workflow.text, /verify-release-manifest/);
  assert.match(workflow.text, /wrangler deploy/);
  assert.match(workflow.text, /audit:production-smoke/);
  assert.match(workflow.text, /CLOUDFLARE_API_TOKEN/);
  return "manual only; current main SHA; build-once artifact; serialized deploy; smoke";
});

check("Rollback", "Rollback workflow is manual, exact-version guarded and smoke-tested", () => {
  const workflow = workflows.find((item) => item.relative === ".github/workflows/rollback-production.yml");
  assert.ok(workflow);
  assert.match(workflow.text, /workflow_dispatch:/);
  assert.doesNotMatch(workflow.text, /\npush:|pull_request:/);
  assert.match(workflow.text, /confirm/);
  assert.match(workflow.text, /wrangler rollback/);
  assert.match(workflow.text, /audit:production-smoke/);
  assert.match(workflow.text, /group: echobuddha-production/);
  return "manual exact Cloudflare version; confirmation; shared concurrency; smoke";
});

check("Runtime", "Node, npm and lockfile reproducibility are aligned", () => {
  const pkg = JSON.parse(read("package.json"));
  const nodeVersion = read(".node-version").trim();
  const [nodeMajor, nodeMinor] = nodeVersion.split(".").map(Number);
  assert.equal(nodeMajor, 22);
  assert.ok(nodeMinor >= 18, "Node 22 must support unflagged TypeScript type stripping used by repository validators");
  assert.equal(pkg.engines.node, "22.x");
  assert.equal(pkg.engines.npm, "10.x");
  assert.equal(pkg.packageManager, "npm@10.9.8");
  assert.equal(JSON.parse(read("package-lock.json")).lockfileVersion, 3);
  return `Node ${nodeVersion}; npm 10; lockfile v3; npm ci`;
});

check("Secrets", "Tracked and pending source contains no recognized high-confidence secret value", () => {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: root }).toString().split("\0").filter(Boolean);
  const patterns = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /AKIA[0-9A-Z]{16}/, /gh[pousr]_[A-Za-z0-9]{36,}/, /sk_live_[A-Za-z0-9]{20,}/, /CF_API_TOKEN\s*=\s*[A-Za-z0-9_-]{20,}/];
  const failures = files.filter((file) => {
    const full = path.join(root, file);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile() || fs.statSync(full).size > 5_000_000) return false;
    const value = fs.readFileSync(full, "utf8");
    return patterns.some((pattern) => pattern.test(value));
  });
  assert.deepEqual(failures, []);
  return "0 private-key/token matches; public GA/AdSense identifiers correctly exempt";
});

check("Dependency governance", "Weekly bounded npm and Actions update policy exists", () => {
  const dependabot = YAML.parse(read(".github/dependabot.yml"));
  assert.equal(dependabot.version, 2);
  assert.deepEqual(new Set(dependabot.updates.map((item) => item["package-ecosystem"])), new Set(["npm", "github-actions"]));
  assert.ok(dependabot.updates.every((item) => item.schedule.interval === "weekly" && item["open-pull-requests-limit"] <= 5));
  return "weekly npm + GitHub Actions; bounded PR count; CI required";
});

const requiredDeliverables = [
  "phase-9-governance-risk-register.csv", "phase-9-workflow-inventory.csv", "phase-9-workflow-permission-review.csv", "phase-9-workflow-trigger-review.csv", "phase-9-action-supply-chain-review.csv", "phase-9-runtime-reproducibility-review.csv", "phase-9-ci-quality-gate-register.csv", "phase-9-blocking-warning-register.csv", "phase-9-content-governance-review.csv", "phase-9-topic-owner-governance-review.csv", "phase-9-indexability-governance-review.csv", "phase-9-source-safety-governance-review.csv", "phase-9-template-governance-review.csv", "phase-9-trust-authorship-governance-review.csv", "phase-9-ux-accessibility-governance-review.csv", "phase-9-adsense-governance-review.csv", "phase-9-privacy-consent-governance-review.csv", "phase-9-security-governance-review.csv", "phase-9-pr-governance-review.csv", "phase-9-branch-protection-review.csv", "phase-9-external-github-cloudflare-settings.csv", "phase-9-dependency-governance-review.csv", "phase-9-environment-secret-inventory.csv", "phase-9-release-governance-review.csv", "phase-9-deployment-workflow-review.csv", "phase-9-production-smoke-governance.csv", "phase-9-rollback-governance.csv", "phase-9-deployment-traceability-review.csv", "phase-9-artifact-retention-review.csv", "phase-9-repository-hygiene-review.csv", "phase-9-page-change-register.csv", "phase-9-phase8-preservation-review.csv", "phase-9-owner-action-items.csv", "phase-9-phase10-handoff.csv", "phase-9-validation-summary.csv", "phase-9-rollback-map.csv", "MASTER_PRE_PHASE10_PROTECTION_REGISTER.csv", "ECHO_BUDDHA_CI_GIT_DEPLOYMENT_GOVERNANCE_REPORT.md"
];
check("Evidence", "All mandatory Phase 9 deliverables exist and are non-empty", () => {
  const missing = requiredDeliverables.filter((file) => !fs.existsSync(path.join(auditDir, file)) || fs.statSync(path.join(auditDir, file)).size === 0);
  assert.deepEqual(missing, []);
  return `${requiredDeliverables.length}/${requiredDeliverables.length} mandatory artifacts`;
});

check("Documentation", "Contributor, governance, deployment and rollback instructions exist", () => {
  const files = ["CONTRIBUTING.md", "ECHO_BUDDHA_CI_GIT_DEPLOYMENT_GOVERNANCE.md", ".github/pull_request_template.md", "docs/deployments/DEPLOYMENT_RECORD_TEMPLATE.md", "docs/deployments/ROLLBACK_RUNBOOK.md", "docs/deployments/PRODUCTION_DEPLOYMENT_CHECKLIST.md"];
  assert.deepEqual(files.filter((file) => !fs.existsSync(path.join(root, file))), []);
  return `${files.length}/${files.length} durable governance documents`;
});

const failures = checks.filter((item) => !item.pass);
const result = { generatedAt: new Date().toISOString(), totalChecks: checks.length, passed: checks.length - failures.length, failed: failures.length, pass: failures.length === 0, checks };
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
if (failures.length) {
  for (const failure of failures) console.error(`${failure.area}: ${failure.name}: ${failure.evidence}`);
  process.exitCode = 1;
} else {
  console.log(`Phase 9 validation passed: ${checks.length}/${checks.length} checks.`);
}
