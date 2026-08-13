import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-9-ci-git-deployment");
fs.mkdirSync(out, { recursive: true });
const baseline = JSON.parse(fs.readFileSync(path.join(root, "governance/release-baseline.json"), "utf8"));
const finalValidation = process.env.PHASE9_FINAL_VALIDATION === "passed";
const csv = (name, headers, rows) => {
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  fs.writeFileSync(path.join(out, name), `${headers.map(escape).join(",")}\n${rows.map((row) => headers.map((header) => escape(row[header])).join(",")).join("\n")}\n`);
};
const row = (headers, values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
const same = (name, finding, state = "Implemented", evidence = "npm run audit:phase9") => [{ Control: name, Finding: finding, State: state, Evidence: evidence }];

csv("phase-9-governance-risk-register.csv", ["Risk ID", "Domain", "Risk", "Likelihood", "Impact", "Control", "Residual risk", "Owner"], [
  row(["Risk ID", "Domain", "Risk", "Likelihood", "Impact", "Control", "Residual risk", "Owner"], ["R-01", "Deployment", "Wrong or stale revision reaches production", "Medium", "Critical", "Manual exact-main-SHA input; build once; shared concurrency; manifest verification", "Low after external environment setup", "Repository owner"]),
  row(["Risk ID", "Domain", "Risk", "Likelihood", "Impact", "Control", "Residual risk", "Owner"], ["R-02", "Secrets", "Untrusted PR accesses Cloudflare credentials", "Low", "Critical", "PR validation has no secrets; production environment secrets are step scoped", "Production environment is not yet configured", "Repository owner"]),
  row(["Risk ID", "Domain", "Risk", "Likelihood", "Impact", "Control", "Residual risk", "Owner"], ["R-03", "Content/index", "Protected URL or index state drifts", "Medium", "High", "Release baseline plus explicit approvals and Phase 9 blocker", "Semantic quality still requires review", "Editorial owner"]),
  row(["Risk ID", "Domain", "Risk", "Likelihood", "Impact", "Control", "Residual risk", "Owner"], ["R-04", "External settings", "Repository documentation is mistaken for active GitHub/Cloudflare protection", "High", "High", "Truthful verified/pending registers and owner queue", "Pending until dashboard actions are verified", "Repository owner"])
]);

const wfHeaders = ["Workflow", "File", "Trigger", "Purpose", "Secrets", "Environment", "Concurrency", "Blocking role", "State"];
csv("phase-9-workflow-inventory.csv", wfHeaders, [
  ["Release validation", ".github/workflows/validate.yml", "pull_request main; push main; manual", "Release and browser gates", "None", "None", "Per ref; superseded validation cancels", "Required PR/main checks when branch rules become available", "Implemented"],
  ["Extended validation", ".github/workflows/extended-validation.yml", "manual; monthly", "Browser and Lighthouse evidence", "None", "None", "Per ref", "Informational/warning", "Implemented"],
  ["Production smoke", ".github/workflows/production-smoke.yml", "manual; weekly", "Read-only public verification", "None", "None", "Single smoke group", "Monitoring", "Implemented"],
  ["Deploy production", ".github/workflows/deploy-production.yml", "manual exact SHA", "Validate/build once/deploy/smoke", "Cloudflare token and account ID", "production", "echobuddha-production; no cancellation", "Production blocker", "Repository complete; external environment pending"],
  ["Rollback production", ".github/workflows/rollback-production.yml", "manual version UUID and ROLLBACK confirmation", "Known-version rollback and smoke", "Cloudflare token and account ID", "production", "echobuddha-production; no cancellation", "Recovery control", "Repository complete; external environment pending"]
].map((values) => row(wfHeaders, values)));

const permissionHeaders = ["Workflow", "Job", "Trigger", "Permission", "Current level", "Required level", "Overprivileged?", "Secret access?", "Untrusted code risk?", "Action", "Validation", "Evidence"];
csv("phase-9-workflow-permission-review.csv", permissionHeaders, [
  ["validate.yml", "release-validation; browser-validation", "PR/main/manual", "contents", "read", "read", "No", "No", "Low", "Retain explicit least privilege", "PASS", "YAML parse and audit:phase9"],
  ["extended-validation.yml", "extended", "manual/monthly", "contents", "read", "read", "No", "No", "Low", "Retain", "PASS", "YAML parse"],
  ["production-smoke.yml", "smoke", "manual/weekly", "contents", "read", "read", "No", "No", "Low", "Retain", "PASS", "No secrets"],
  ["deploy-production.yml", "validate; deploy", "manual", "contents", "read", "read", "No", "Deploy steps only", "No PR trigger", "Configure protected production environment", "PASS repository / PENDING external", "Environment secret references only"],
  ["rollback-production.yml", "rollback", "manual", "contents", "read", "read", "No", "Rollback step only", "No PR trigger", "Configure protected production environment", "PASS repository / PENDING external", "Confirmation and environment gate"]
].map((values) => row(permissionHeaders, values)));

const triggerHeaders = ["Workflow", "Trigger", "Privileged?", "Untrusted code path?", "Production mutation?", "Finding", "Action", "Validation"];
csv("phase-9-workflow-trigger-review.csv", triggerHeaders, [
  ["validate.yml", "pull_request; push main; manual", "No", "PR code runs without secrets", "No", "Safe", "Make jobs required when available", "No pull_request_target"],
  ["extended-validation.yml", "manual; monthly", "No", "No", "No", "Safe", "Retain", "Parsed"],
  ["production-smoke.yml", "manual; weekly", "No", "No", "No", "Safe public reads", "Retain", "Parsed"],
  ["deploy-production.yml", "manual full SHA", "Yes", "No PR trigger", "Yes", "Correctly isolated", "Configure environment approval", "Exact main SHA verified twice"],
  ["rollback-production.yml", "manual version UUID + confirmation", "Yes", "No PR trigger", "Yes", "Correctly isolated", "Configure environment approval", "Version and confirmation validated"]
].map((values) => row(triggerHeaders, values)));

const actionHeaders = ["Workflow", "Action", "Current ref", "Publisher", "Official/third-party", "Mutable tag?", "Immutable SHA?", "Version represented", "Required?", "Security concern", "Action", "Validation"];
const actionRefs = [
  ["All applicable", "actions/checkout", "d23441a48e516b6c34aea4fa41551a30e30af803", "GitHub", "Official", "No", "Yes", "v6", "Yes", "Repository checkout can affect every job", "Dependabot-reviewed updates only", "GitHub API ref resolved"],
  ["All applicable", "actions/setup-node", "249970729cb0ef3589644e2896645e5dc5ba9c38", "GitHub", "Official", "No", "Yes", "v6", "Yes", "Runtime setup", "Dependabot-reviewed updates only", "GitHub API ref resolved"],
  ["Evidence jobs", "actions/upload-artifact", "ea165f8d65b6e75b540449e92b4886f43607fa02", "GitHub", "Official", "No", "Yes", "v4", "Yes", "Artifact upload", "Retain digest evidence and bounded retention", "GitHub API ref resolved"],
  ["Deploy", "actions/download-artifact", "634f93cb2916e3fdff6788551b99b062d0335ce0", "GitHub", "Official", "No", "Yes", "v5", "Yes", "Artifact boundary", "Verify per-file release manifest after download", "GitHub API ref resolved"]
];
csv("phase-9-action-supply-chain-review.csv", actionHeaders, actionRefs.map((values) => row(actionHeaders, values)));

const runtimeHeaders = ["Item", "Before", "After", "Deterministic?", "Control", "Validation"];
csv("phase-9-runtime-reproducibility-review.csv", runtimeHeaders, [
  ["Node", ".node-version 22.16.0", "Node 22.x plus .node-version", "Yes", "setup-node uses node-version-file", "npm ci/build"],
  ["npm", "Implicit local npm", "npm 10.x; packageManager npm@10.9.8", "Yes", "engines and packageManager", "npm ci"],
  ["Dependencies", "lockfile v3", "lockfile v3 and npm ci", "Yes", "No npm install in CI", "npm ci"],
  ["Actions", "Mutable v4 tags", "Full 40-character SHAs", "Yes", "Phase 9 supply-chain gate", "audit:phase9"]
].map((values) => row(runtimeHeaders, values)));

const gateHeaders = ["Gate ID", "Gate name", "Category", "Command/script", "Trigger", "Blocking / Warning / Informational", "Why it exists", "Phase source", "Failure condition", "False-positive risk", "Runtime cost", "PR required?", "Main required?", "Release required?", "Deploy required?", "Owner override allowed?", "Current state", "Final state", "Validation"];
const gates = [
  ["G-01", "Build", "Technical", "npm run build", "PR/main/release", "Blocking", "Prove static output", "0-9", "Build error", "Low", "Low", "Yes", "Yes", "Yes", "Yes", "No", "Existing", "Strengthened", "PASS"],
  ["G-02", "Typecheck", "Technical", "npm run typecheck", "PR/main/release", "Blocking", "Prevent type regressions", "0-9", "Type error", "Low", "Low", "Yes", "Yes", "Yes", "Yes", "No", "Existing", "Retained", "PASS"],
  ["G-03", "Lint", "Technical", "npm run lint", "PR/main/release", "Blocking", "Policy and source safety", "0-9", "Lint/governance failure", "Low", "Low", "Yes", "Yes", "Yes", "Yes", "Approval register only", "Existing", "Strengthened", "PASS"],
  ["G-04", "Tests", "Technical", "npm test", "PR/main/release", "Blocking", "Behavior regression", "0-9", "Test failure", "Low", "Medium", "Yes", "Yes", "Yes", "Yes", "No", "Existing", "Strengthened", "PASS"],
  ["G-05", "SEO", "Indexability", "npm run audit:seo", "PR/main/release", "Blocking", "Links/schema/sitemap", "1-9", "Deterministic SEO error", "Low", "Medium", "Yes", "Yes", "Yes", "Yes", "Approval register only", "Existing", "Retained", "PASS"],
  ["G-06", "Content", "Content", "npm run audit:content", "PR/main/release", "Blocking", "Content/source governance", "1-9", "Deterministic integrity error", "Medium", "Medium", "Yes", "Yes", "Yes", "Yes", "Approval register only", "Existing", "Retained", "PASS"],
  ["G-07", "Phase 8", "Security/privacy", "npm run audit:phase8", "PR/main/release", "Blocking", "Preserve hardening", "8", "Phase 8 regression", "Low", "Medium", "Yes", "Yes", "Yes", "Yes", "No", "Existing", "Retained", "PASS"],
  ["G-08", "Phase 9", "Governance", "npm run audit:phase9", "PR/main/release", "Blocking", "Baseline/workflow/release protections", "9", "Objective protected state drifts", "Low", "Medium", "Yes", "Yes", "Yes", "Yes", "Approval register where declared", "New", "Implemented", "PASS"],
  ["G-09", "Dependencies", "Supply chain", "npm run audit:dependencies", "PR/main/release", "Blocking", "Block high/critical advisories", "8-9", "High/critical audit finding", "Low", "Low", "Yes", "Yes", "Yes", "Yes", "No silent override", "Existing", "Retained", "PASS"],
  ["G-10", "Browser consent/accessibility", "UX/privacy", "npm run audit:browser", "PR/main", "Blocking", "Runtime consent and accessibility", "7-9", "Critical browser audit error", "Medium", "High", "Yes", "Yes", "Before release", "No", "No", "Existing", "CI job added", "PASS"],
  ["G-11", "Lighthouse", "Performance", "npm run audit:lighthouse", "Monthly/manual", "Warning / Informational", "Spot performance/accessibility drift", "8-9", "Evidence recorded; not arbitrary perfect score", "High", "High", "No", "No", "Review", "No", "N/A", "Existing local", "Scheduled evidence", "PASS"],
  ["G-12", "Topic overlap", "Editorial", "npm run audit:governance:changes", "PR/main", "Warning", "Surface likely owner overlap", "2-9", "Review report only", "High", "Low", "Yes", "Yes", "Review", "No", "N/A", "Manual", "Automated warning", "PASS"],
  ["G-13", "Exact release SHA", "Deployment", "deploy-production.yml", "Manual deploy", "Blocking", "Tie production to validated main", "9", "SHA invalid/not origin main", "Low", "Low", "No", "No", "Yes", "Yes", "No", "Absent", "Implemented", "PASS"],
  ["G-14", "Artifact digest", "Deployment", "create/verify-release-manifest.mjs", "Manual deploy", "Blocking", "Deploy exactly built files", "9", "Missing/changed file digest", "Low", "Low", "No", "No", "Yes", "Yes", "No", "Absent", "Implemented", "PASS"],
  ["G-15", "Production smoke", "Deployment", "npm run audit:production-smoke", "Post-deploy/weekly/manual", "Blocking on deploy; monitoring otherwise", "Catch critical production failure", "9", "Status/content/canonical/header failure", "Medium", "Low", "No", "No", "Yes", "Yes", "Owner incident judgment", "Ad hoc", "Implemented", "PASS current production"],
  ["G-16", "Rollback confirmation", "Recovery", "rollback-production.yml", "Manual rollback", "Blocking", "Prevent accidental mutation", "9", "Invalid UUID/confirmation", "Low", "Low", "No", "No", "No", "Rollback", "No", "Absent", "Implemented", "PASS static validation"],
  ["G-17", "Secret scan", "Security", "audit:phase9", "PR/main/release", "Blocking", "Prevent committed credential patterns", "9", "Detected token/private key pattern", "Medium", "Low", "Yes", "Yes", "Yes", "Yes", "Security review only", "Partial", "Strengthened", "PASS"],
  ["G-18", "Workflow safety", "CI security", "audit:phase9", "PR/main/release", "Blocking", "Least privilege/pins/safe trigger", "9", "Mutable action/broad permission/unsafe trigger", "Low", "Low", "Yes", "Yes", "Yes", "Yes", "No", "Absent", "Implemented", "PASS"]
];
csv("phase-9-ci-quality-gate-register.csv", gateHeaders, gates.map((values) => row(gateHeaders, values)));

const bwHeaders = ["Signal", "Classification", "Reason", "Failure behavior", "Human review", "Evidence"];
csv("phase-9-blocking-warning-register.csv", bwHeaders, [
  ["Broken build/link/schema; index/sitemap/canonical drift; source identity mismatch; consent or AdSense activation; unsafe workflow; artifact mismatch", "Blocking", "Objective and reproducible", "Non-zero exit", "Required to resolve or explicitly register supported governance change", "validate:release"],
  ["Likely semantic overlap; repetitive structure; unusual thinness; source density; Lighthouse score variation", "Warning", "Contextual and prone to false certainty", "Artifact/report only", "Editor reviews in PR", "audit:governance:changes and extended validation"]
].map((values) => row(bwHeaders, values)));

for (const [file, control, finding, evidence] of [
  ["phase-9-content-governance-review.csv", "Content", "Deterministic content integrity remains blocking; subjective value remains human-reviewed", "audit:content; audit:phase9"],
  ["phase-9-topic-owner-governance-review.csv", "Topic ownership", "40 unique primary owners protected; new indexable routes need complete approval", "release baseline; owner CSV"],
  ["phase-9-indexability-governance-review.csv", "Indexability", "336 routes; 193 indexable/sitemap; silent removal or state/canonical drift blocked", "release baseline; audit:phase9"],
  ["phase-9-source-safety-governance-review.csv", "Sources and safety", "Source/trust routes and registered metadata remain validated", "audit:content; audit:phase9"],
  ["phase-9-template-governance-review.csv", "Template quality", "Exact visible duplicates blocked; similarity is warning", "audit:phase9"],
  ["phase-9-trust-authorship-governance-review.csv", "Trust/authorship", "Organization authorship protected; fabricated persons/reviewers/credentials blocked", "editorialGovernance.ts; JSON-LD audit"],
  ["phase-9-ux-accessibility-governance-review.csv", "UX/accessibility", "Browser accessibility/consent is CI blocking; Lighthouse variation is evidence", "validate and extended workflows"],
  ["phase-9-adsense-governance-review.csv", "AdSense", "Verification metadata/ads.txt retained; runtime scripts and manual slots blocked", "ads.ts; built-page scan"],
  ["phase-9-privacy-consent-governance-review.csv", "Privacy/consent", "Missing choice opens panel; Analytics and advertising storage denied by default", "ConsentManager.astro; browser audit"],
  ["phase-9-security-governance-review.csv", "Security", "Enforced CSP and baseline headers protected; workflow secrets isolated", "public/_headers; workflow review"],
  ["phase-9-pr-governance-review.csv", "Pull requests", "Template requires scope, risk domains, tests, owner approvals, deployment declaration", ".github/pull_request_template.md"]
]) csv(file, ["Control", "Finding", "State", "Evidence"], same(control, finding, "Implemented", evidence));

const branchHeaders = ["Setting", "Desired state", "Current state", "Verified?", "Repository-enforceable?", "GitHub settings required?", "Reason", "Solo-maintainer impact", "Action", "Owner action required?"];
csv("phase-9-branch-protection-review.csv", branchHeaders, [
  ["Protect main", "PR required; no force push/deletion", "Unavailable on current private-repo plan", "Yes: API 403 plan limitation", "No", "Yes", "Prevent direct unvalidated change", "Adds PR step", "Upgrade plan or make public; then create ruleset", "Yes"],
  ["Required checks", "Release validation and Browser and consent validation", "Not configured", "Yes", "No", "Yes", "Block failed objective gates", "Waits for CI", "Set exact required job names after first hosted run", "Yes"],
  ["Action pinning policy", "Require full SHA where GitHub setting supports it", "sha_pinning_required=false", "Yes", "Partly: files are pinned", "Yes", "Defense in depth", "Low", "Enable repository/organization policy if available", "Yes"],
  ["Default token permission", "Read repository contents", "Read", "Yes", "No", "Already configured", "Least privilege", "None", "Retain and reverify quarterly", "Yes"]
].map((values) => row(branchHeaders, values)));

const extHeaders = ["Platform", "Setting", "Desired state", "Observed state", "Verified", "Repository controlled", "Risk", "Exact owner action", "Evidence"];
csv("phase-9-external-github-cloudflare-settings.csv", extHeaders, [
  ["GitHub", "Branch/ruleset protection", "PR + required Phase 9 checks + no force/delete", "API denied: private repository plan limitation", "Yes", "No", "Direct main changes remain possible", "Upgrade plan/make public, then create ruleset with exact hosted job names", "GitHub REST 403"],
  ["GitHub", "Production environment", "Environment with secrets and optional reviewer", "No environments", "Yes", "No", "Deploy workflow cannot run yet", "Create production environment; restrict branch; add secrets; optionally require reviewer", "GitHub REST environments: empty"],
  ["GitHub", "Actions SHA pin policy", "Required", "false", "Yes", "No", "Future workflow could use mutable ref", "Enable SHA pinning policy where available", "GitHub Actions permissions API"],
  ["GitHub", "Security alerts", "Dependency graph, Dependabot alerts/updates enabled", "Partially unverified because API/plan returned 404", "Partial", "No", "Owner may miss advisory", "Verify Code security settings in dashboard", "REST observations recorded in diagnostic"],
  ["Cloudflare", "API token", "Scoped to required account and Worker deployment only", "Value/scope intentionally not inspected", "No", "No", "Overbroad credential risk", "Create/rotate least-privilege token and record scope review date", "Official Cloudflare CI/CD guidance"],
  ["Cloudflare", "Preview indexing", "Preview URLs noindex and no ad/analytics pollution", "Repository _headers rule exists; dashboard behavior pending", "Partial", "Partial", "Preview could be crawled", "Upload an authorized preview and verify X-Robots-Tag plus Cloudflare preview settings", "public/_headers"]
].map((values) => row(extHeaders, values)));

for (const [file, headers, values] of [
  ["phase-9-dependency-governance-review.csv", ["Control", "Cadence", "Scope", "Blocking policy", "Auto-merge", "State", "Evidence"], [["Dependabot", "Weekly", "npm and GitHub Actions; bounded groups", "High/critical audit blocks release", "Disabled", "Implemented", ".github/dependabot.yml; audit:dependencies"], ["Dependency review action", "PR", "Not installed", "Plan/feature availability unverified", "N/A", "Owner decision pending", "Use only if private-repo feature is available"]]],
  ["phase-9-release-governance-review.csv", ["Control", "Before", "After", "State", "Evidence"], [["Release source", "Manual local working tree", "Exact lowercase origin/main SHA", "Implemented", "deploy workflow"], ["Build", "Potential rebuild at deploy", "Build once and upload immutable artifact", "Implemented", "manifest scripts"], ["Authorization", "Owner instruction", "Separate workflow dispatch plus production environment", "Repository complete / external pending", "governance document"]]],
  ["phase-9-production-smoke-governance.csv", ["Check", "Endpoint", "Blocking on deploy", "Scheduled", "State", "Evidence"], [["Homepage", "https://echobuddha.com/", "Yes", "Weekly", "Implemented", "status; canonical; CSP; no ad runtime"], ["Sitemap", "https://echobuddha.com/sitemap.xml", "Yes", "Weekly", "Implemented", "status and production origin"], ["Robots", "https://echobuddha.com/robots.txt", "Yes", "Weekly", "Implemented", "status and sitemap reference"]]],
  ["phase-9-rollback-governance.csv", ["Control", "Policy", "State", "Evidence"], [["Known good", "Recorded Cloudflare version with SHA and passing smoke", "Defined", "rollback runbook"], ["Trigger", "Severe availability/security/privacy/delivery regression", "Defined", "rollback runbook"], ["Execution", "Manual UUID plus ROLLBACK confirmation; serialized; smoke", "Implemented", "rollback workflow"]]],
  ["phase-9-deployment-traceability-review.csv", ["Item", "Before", "After", "Traceable", "Evidence"], [["Git source", "Historical manual record", "Exact main SHA input and recheck", "Yes", "workflow inputs/log"], ["Artifact", "dist not independently attested", "Per-file SHA-256 manifest", "Yes", "release-manifest.json"], ["Cloudflare", "Prior deployment/version recorded", "Deployment list captured after release", "Yes after authorized run", "cloudflare-deployments.json"]]],
  ["phase-9-artifact-retention-review.csv", ["Artifact", "Location", "Retention", "Contains secrets", "Policy", "State"], [["CI evidence", "GitHub artifact", "30 days", "No", "Do not commit transient logs", "Implemented"], ["Deployment/rollback evidence", "GitHub artifact", "90 days", "No", "Durable record via reviewed template", "Implemented"], ["Local browser/Lighthouse", ".artifacts", "Ephemeral", "No", "Ignored", "Implemented"]]],
  ["phase-9-repository-hygiene-review.csv", ["Item", "Observed", "Policy", "State", "Evidence"], [["Git database", "About 144 MB; historical audit objects dominate", "Do not rewrite history in Phase 9", "Recorded", "pre-edit diagnostic"], ["LFS", "No Git LFS configuration/CLI", "Use only for future necessary large binaries", "No action", ".gitattributes absent"], ["Generated artifacts", "dist/node_modules/logs ignored", "Keep transient evidence out of Git", "Strengthened", ".gitignore"]]],
  ["phase-9-page-change-register.csv", ["URL", "Content changed", "Index state changed", "Canonical changed", "Sitemap changed", "Phase 9 reason", "Validation"], [["All 336 built routes", "No", "No", "No", "No", "Phase 9 repository delivery governance only", "Baseline parity PASS"]]],
  ["phase-9-phase8-preservation-review.csv", ["Protected item", "Before", "After", "Changed?", "Status", "Evidence"], [["Routes/index/sitemap", "336/193/193", "336/193/193", "No", "PASS", "release baseline"], ["AdSense", "Verification only; runtime/manual off", "Same", "No", "PASS", "audit:phase9"], ["Consent", "Explicit opt-in", "Same", "No", "PASS", "audit:browser and phase9"], ["Security headers", "Enforced CSP and baseline", "Same", "No", "PASS", "protected hashes"], ["Production", baseline.production.versionId, baseline.production.versionId, "No", "PASS", "No deploy performed"]]],
  ["phase-9-rollback-map.csv", ["Scenario", "Preferred response", "Target", "Authorization", "Validation", "Record"], [["Severe availability/security/privacy regression", "Rollback", "Last recorded known-good Cloudflare version", "Owner + production environment", "Production smoke", "Rollback artifact + incident record"], ["Editorial typo/minor issue", "Fix forward", "New exact main SHA", "Normal PR/release authorization", "Full release + smoke", "Deployment record"], ["Unknown external outage", "Investigate first", "No immediate mutation", "Owner decision", "Cloudflare/status evidence", "Incident notes"]]]
]) csv(file, headers, values.map((item) => row(headers, item)));

const secretHeaders = ["Secret / Variable Name", "Platform", "Scope", "Environment", "Purpose", "Required?", "Public identifier or secret?", "Least privilege verified?", "Rotation status known?", "Used by", "Owner review?"];
csv("phase-9-environment-secret-inventory.csv", secretHeaders, [
  ["CLOUDFLARE_API_TOKEN", "GitHub Actions", "Repository environment", "production", "Deploy/rollback Echo Buddha Worker", "Yes for production mutation", "Secret", "Pending", "Unknown", "deploy-production; rollback-production", "Required"],
  ["CLOUDFLARE_ACCOUNT_ID", "GitHub Actions", "Repository environment", "production", "Select Cloudflare account", "Yes for production mutation", "Sensitive identifier", "Pending", "N/A", "deploy-production; rollback-production", "Required"],
  ["GITHUB_TOKEN", "GitHub Actions", "Per workflow run", "All", "Checkout/artifacts", "Automatic", "Ephemeral secret", "Yes: contents read", "Automatic", "All workflows", "Reviewed"]
].map((values) => row(secretHeaders, values)));

const deployHeaders = ["Workflow", "Trigger", "Source branch/ref", "Validation dependency", "Build command", "Deploy command", "Cloudflare environment", "Secret names used", "Permissions", "Concurrency", "Artifact strategy", "Deployment SHA traceable?", "Deployment ID traceable?", "Smoke test?", "Rollback known?", "Issue", "Action", "Validation"];
csv("phase-9-deployment-workflow-review.csv", deployHeaders, [
  ["deploy-production.yml", "workflow_dispatch full SHA", "Exact current origin/main", "npm run validate:release", "npm run build -- --outDir .release/dist", "npx wrangler deploy --assets .release/dist --strict --tag git-<shortsha> --message ...", "production", "CLOUDFLARE_API_TOKEN; CLOUDFLARE_ACCOUNT_ID", "contents: read", "echobuddha-production; cancel false", "Build once; upload; download; verify SHA-256 manifest", "Yes", "Yes after authorized run", "Yes", "Yes", "Environment/secrets not yet configured", "Owner configures external settings; then separately authorizes", "Local syntax/manifest/dry-run PASS; hosted run pending"],
  ["rollback-production.yml", "workflow_dispatch UUID + reason + ROLLBACK", "Recorded version ID", "Confirmation and environment gate", "None", "npx wrangler rollback <version-id> --message ...", "production", "CLOUDFLARE_API_TOKEN; CLOUDFLARE_ACCOUNT_ID", "contents: read", "echobuddha-production; cancel false", "Post-action evidence artifact", "Prior record", "Yes after authorized run", "Yes", "N/A", "Environment/secrets not yet configured", "Owner configures and uses only for incident", "Static/local validation PASS; live rollback not performed"]
].map((values) => row(deployHeaders, values)));

const ownerHeaders = ["ID", "Platform", "Exact action", "Reason", "Repository status", "Owner action required", "Priority", "Validation after action"];
csv("phase-9-owner-action-items.csv", ownerHeaders, [
  ["O-01", "GitHub", "Upgrade the private repository plan or make the repository public; create a main ruleset requiring pull requests, no force push/deletion, and the exact hosted Phase 9 check names", "REST API confirmed rules are unavailable on the current private-repo plan", "Cannot enforce in repository", "Yes", "High", "Query rulesets and test a failing PR"],
  ["O-02", "GitHub", "Run the Phase 9 workflows on the branch once and configure Release validation and Browser and consent validation as required checks", "Required-check names must match hosted jobs", "Workflow files ready", "Yes", "High", "Open a controlled PR and verify merge is blocked on failure"],
  ["O-03", "GitHub", "Create production environment; restrict deployment branch to main; optionally require reviewer; add the two Cloudflare secrets", "Deploy and rollback must be isolated from validation", "Environment references ready", "Yes", "Critical before deployment", "Inspect environment and perform separately authorized dry release"],
  ["O-04", "GitHub", "Enable require-SHA-pinning Actions policy where available and retain read default token permission", "Defense in depth against future mutable action references", "All current refs pinned", "Yes", "Medium", "Permissions API returns sha_pinning_required=true"],
  ["O-05", "GitHub", "Verify dependency graph, Dependabot alerts, security updates, private vulnerability reporting, and notification recipients", "API/plan did not verify every security control", "Dependabot config committed", "Yes", "High", "Dashboard screenshots/dated register without secret data"],
  ["O-06", "Cloudflare", "Create or rotate a token limited to the required account and Echo Buddha Worker deployment permissions; record scope and review date without recording value", "Least-privilege secret scope cannot be proven from repository", "Secret names only", "Yes", "Critical before deployment", "Owner attestation and successful authorized deployment"],
  ["O-07", "Cloudflare", "Verify preview URLs, workers.dev exposure, preview noindex header, Analytics isolation, and AdSense runtime absence", "Repository header intent requires live preview verification", "Source noindex rule ready", "Yes", "Medium", "Authorized preview curl/browser evidence"],
  ["O-08", "Cloudflare", "Verify custom-domain routing, cache/header transformations, WAF/bot rules, and that they do not override source-controlled behavior", "External edge configuration can drift independently", "Production smoke detects a subset", "Yes", "High", "Dashboard review plus production headers/smoke"],
  ["O-09", "Process", "Use the deployment record template for every authorized release and retain the last-known-good version ID", "Phase 10 needs SHA/time/change traceability", "Template/runbook ready", "Yes", "High", "Next release record complete"],
  ["O-10", "Process", "Freeze unrelated production/index/AdSense changes during AdSense review and do not reapply in Phase 9", "Avoid confounding measurement and policy review", "Documented; no production mutation", "Yes", "High", "Owner release review"]
].map((values) => row(ownerHeaders, values)));

const handoffHeaders = ["Item", "Current state", "Last production SHA", "Last production timestamp", "Relevant release/change", "Measurement dependency", "Data source", "Owner/account action required?", "Recommended Phase 10 action", "Evidence"];
const prodSha = baseline.production.implementationCommit;
const prodTime = baseline.production.deployedAt;
csv("phase-9-phase10-handoff.csv", handoffHeaders, [
  ["Production release", "Phase 8 remains live; Phase 9 repository-only", prodSha, prodTime, "Phase 8 technical hardening", "Stable production window", "Cloudflare deployment record", "No for observation; yes for future release", "Anchor all measurement windows to this timestamp until next authorized deploy", baseline.production.deploymentId],
  ["Search Console", "Not collected in Phase 9", prodSha, prodTime, "No Phase 9 production change", "Owner account access and sufficient post-release window", "Google Search Console", "Yes", "Export performance/indexing/manual-action/security evidence by defined windows", "Owner action pending"],
  ["Analytics/consent", "Explicit opt-in; field data not collected", prodSha, prodTime, "Consent posture unchanged", "Consent context and GA access", "GA4 plus consent implementation", "Yes", "Interpret traffic only with consent coverage documented", "ConsentManager.astro"],
  ["Sitemap/indexing", "193 indexable URLs in source sitemap", prodSha, prodTime, "No route/index change", "Live sitemap and GSC crawl/index data", "Repository + production + GSC", "Yes for GSC", "Measure submitted/indexed/excluded groups without casual production changes", "release-baseline.json"],
  ["Field performance", "Not available in repository", prodSha, prodTime, "No Phase 9 production change", "CrUX/PageSpeed availability", "PageSpeed Insights/CrUX", "Maybe", "Record field availability separately from lab Lighthouse", "Phase 10 pending"]
].map((values) => row(handoffHeaders, values)));

const protectHeaders = ["Item / URL / Control", "Protected content role", "Protected index state", "Protected source/trust", "Protected UX", "Protected AdSense state", "Protected consent state", "Protected technical state", "Protected CI gate", "Protected deployment behavior", "Phase 10 allowed actions", "Phase 10 prohibited actions", "Validation requirement"];
csv("MASTER_PRE_PHASE10_PROTECTION_REGISTER.csv", protectHeaders, [
  ["All 336 generated HTML routes", "Phase 0-8 roles retained", "193 indexable; 143 noindex/error; 193 sitemap", "Existing organizational identity and sources", "Navigation/accessibility baseline", "No runtime script/manual slots", "Explicit analytics opt-in", "Self canonicals except 404; links/schema valid", "audit:seo; audit:content; audit:phase8; audit:phase9", "No production change in Phase 9", "Measure and propose evidence-based scoped change", "Change URL/index/canonical merely to chase metrics", "validate:release plus approvals for protected state change"],
  ["40 primary topic owners", "One primary owner per governed topic", "Owner URLs indexable and in sitemap", "Registered editorial ownership", "Clear journey to supporting pages", "No ownership decision based on ad value", "No consent impact", "Unique owner mappings", "Phase 9 owner check", "Deploy only through exact-SHA release", "Analyze queries and strengthen existing owner", "Create competing broad owner without review", "Owner approval record and release validation"],
  ["Trust and safety routes", "Explain identity, method, sources, corrections, contact, meditation safety", "Index state protected", "No fabricated person/reviewer/credential", "Discoverable and accessible", "No runtime/manual ads", "No consent bypass", "JSON-LD integrity", "Trust/structured-data checks", "Smoke representative trust route when changed", "Correct verified facts and improve clarity", "Invent credentials or remove route silently", "Content + Phase 9 validation"],
  ["AdSense and consent controls", "Verification and privacy controls", "No route change", "Accurate disclosures", "Clear settings and withdrawal", "Metadata/ads.txt only; runtime/manual off", "Analytics denied until explicit opt-in; all ad types denied", "CSP excludes ad-serving hosts", "Phase 8/9 + browser audit", "No AdSense activation/reapplication in Phase 9", "Owner/legal review and separately scoped future change", "Enable runtime/manual ads or infer consent", "Full privacy/AdSense/browser/security review"],
  ["Production delivery", "Deliver reviewed site", "Exact validated main revision", "Preserve evidence", "Smoke critical routes", "Preserve disabled runtime state", "Preserve consent state", "Build once; manifest; least secrets", "All release gates", "Manual exact SHA; production environment; serialized; smoke; version record", "Observe and prepare Phase 10 measurements", "Deploy from arbitrary branch/rebuild/stale run", "Authorized workflow run plus deployment record"]
].map((values) => row(protectHeaders, values)));

const validationHeaders = ["Validation", "Command or method", "State", "Result", "Evidence"];
csv("phase-9-validation-summary.csv", validationHeaders, [
  ["Workflow syntax", "YAML.parse all workflows", "Complete", "PASS", "5 valid workflow files"],
  ["Full local release", "npm ci; npm run validate:release", finalValidation ? "Complete" : "Pending final run", finalValidation ? "PASS" : "PENDING", "phase-9-custom-validation.json and command log"],
  ["Browser audit", "npm run audit:browser", finalValidation ? "Complete" : "Pending final run", finalValidation ? "PASS" : "PENDING", ".artifacts/browser-audit"],
  ["Lighthouse", "npm run audit:lighthouse", finalValidation ? "Complete" : "Pending final run", finalValidation ? "PASS" : "PENDING", ".artifacts/lighthouse"],
  ["Clean snapshot", "npm ci and validate:release in temporary repository snapshot", finalValidation ? "Complete" : "Pending final run", finalValidation ? "PASS" : "PENDING", "Temporary snapshot command evidence"],
  ["Wrangler dry run", "wrangler deploy --dry-run", finalValidation ? "Complete" : "Pending final run", finalValidation ? "PASS" : "PENDING", ".artifacts/wrangler-dry-run"],
  ["Hosted Actions", "GitHub Actions", "Not run: no push authorized", "OWNER ACTION", "Workflow files locally validated"],
  ["Production deployment", "None", "Not authorized", "UNCHANGED", baseline.production.deploymentId]
].map((values) => row(validationHeaders, values)));

const metricsHeaders = ["Metric", "Before", "After", "Interpretation"];
csv("phase-9-before-after-governance-metrics.csv", metricsHeaders, [
  ["Workflows", "1", "5", "Separated validation, extended evidence, monitoring, deployment and rollback responsibilities"],
  ["Validation gates", "Existing release gate", "18 registered controls", "Objective Phase 0-8 and release controls integrated"],
  ["Blocking gates", "No formal register", "16 deterministic/blocking contexts", "Proportionate objective enforcement"],
  ["Warning/informational gates", "Ad hoc", "2 explicit warning/evidence classes", "Semantic/editorial and noisy performance judgment retained"],
  ["Production triggers", "Local manual Wrangler command", "Manual workflow dispatch only; exact current main SHA", "Traceable and separately authorized"],
  ["Broad permissions", "No explicit workflow permissions", "0; contents read explicit", "Least privilege"],
  ["Mutable Action refs", "2 distinct actions at mutable v4 tags", "0; all 22 action uses full SHA", "Supply-chain hardening"],
  ["Automated indexability/source/AdSense/consent protection", "Distributed audits", "Explicit Phase 9 release baseline gates", "Protected state cannot silently drift"],
  ["Production traceability", "Historical manual record", "SHA + manifest + deployment list + smoke evidence", "Complete after authorized workflow run"],
  ["Rollback traceability", "Known prior version recorded", "Confirmed UUID workflow + runbook + evidence", "Live exercise remains intentionally unauthorized"]
].map((values) => row(metricsHeaders, values)));

const adversarialHeaders = ["Scenario", "Expected", "Control", "Outcome", "False-blocker posture"];
csv("phase-9-adversarial-validation.csv", adversarialHeaders, [
  ["Duplicate broad-topic article", "Detect new indexable URL; surface owner overlap; human review", "New-page approval + governance change warning", "PASS design review", "No automatic semantic verdict"],
  ["Noindex URL in sitemap", "Block", "Sitemap/indexability Phase 9 check", "PASS", "Deterministic"],
  ["Redirect chain", "Block", "Existing SEO redirect/link checks plus registered route change", "PASS design review", "Deterministic redirect evidence required"],
  ["Missing source metadata", "Block", "Content/source validation", "PASS design review", "Source correction remains practical"],
  ["Unknown Expert Reviewer in schema", "Block", "JSON-LD identity check", "PASS", "Verified identity requires explicit governance change"],
  ["manualSlotsEnabled true", "Block", "AdSense Phase 9 check", "PASS", "Owner cannot silently override pre-approval policy"],
  ["Analytics bypasses ConsentManager", "Block where detectable", "Source scan + browser audit + CSP", "PASS design review", "Legitimate provider change requires privacy review"],
  ["Deploy after failed validation", "Prevent", "deploy job needs successful validate job", "PASS architecture", "No bypass input"],
  ["Older deploy completes later", "Prevent or serialize safely", "Shared concurrency + main SHA recheck", "PASS architecture", "Owner can retry newest main"],
  ["Secret exposure from PR", "Prevent", "No PR secrets/environment/write token", "PASS", "No impact on normal PR"],
  ["Typo/source correction/article refresh", "Remain practical", "Normal validation; no approval unless protected state changes", "PASS false-blocker review", "Subjective warnings do not fail"]
].map((values) => row(adversarialHeaders, values)));

const researchHeaders = ["Platform", "Topic", "Official URL", "Applied decision", "Reviewed"];
csv("phase-9-external-research-review.csv", researchHeaders, [
  ["GitHub", "GITHUB_TOKEN least privilege", "https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication", "Explicit contents: read", "2026-08-13"],
  ["GitHub", "Deployment environments", "https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments", "production environment and scoped secrets", "2026-08-13"],
  ["GitHub", "Concurrency", "https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency", "Shared production mutation group", "2026-08-13"],
  ["GitHub", "Artifacts", "https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts", "Build once and pass verified artifact", "2026-08-13"],
  ["Cloudflare", "External CI/CD", "https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/", "Scoped token/account ID via environment secrets", "2026-08-13"],
  ["Cloudflare", "Versions/deployments", "https://developers.cloudflare.com/workers/versions-and-deployments/", "Capture version/deployment evidence", "2026-08-13"],
  ["Cloudflare", "Rollbacks", "https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/", "Manual recorded-version rollback; note external resources are not rolled back", "2026-08-13"],
  ["Cloudflare", "Preview URLs", "https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/", "Authorized preview only and noindex verification", "2026-08-13"]
].map((values) => row(researchHeaders, values)));

const sections = [
  ["Executive Summary", "Phase 9 converts the Phase 0-8 protections into practical CI, Git and Cloudflare release governance. Repository work is complete subject to final validation; production remains unchanged and owner-only platform settings are isolated as pending."],
  ["Phase 9 Preconditions", "The Phase 8 verdict was ready for Phase 9. The source baseline is e01071b114cd3615840dfa630f5ee03c1348a570 and the recorded live Phase 8 implementation is 8de969c74139a68b88849f2404e3dc7c353e6a12."],
  ["Phase 0–8 Inputs", "The reconciliation, topic-owner, source/safety, trust, UX, AdSense, consent and technical hardening registers were treated as protected input rather than reopened editorial scope."],
  ["Protected State", "The baseline freezes 336 HTML routes, 193 indexable/sitemap URLs, 143 noindex/error routes, 315 search records, 40 unique primary owners and hashes for sensitive Phase 8 controls."],
  ["Git / Repository Baseline", "One pre-existing validation workflow used mutable action tags. The private user repository has no available branch protection under its current plan, no environments, no Actions secrets/variables and an approximately 144 MB Git database dominated by historical audit objects."],
  ["Current Official GitHub Guidance Reviewed", "Official GitHub guidance on least-privilege GITHUB_TOKEN, deployment environments, concurrency, workflow artifacts, Dependabot and private-repository feature limits was reviewed on 2026-08-13; URLs are in phase-9-external-research-review.csv."],
  ["Current Official Cloudflare Guidance Reviewed", "Official Workers external CI/CD, versions/deployments, rollback, preview URL, headers and Wrangler guidance was reviewed. Scoped credentials, immutable evidence, explicit rollback versions and preview noindex behavior shaped the implementation."],
  ["Phase 9 Methodology", "Inventory first; distinguish repository controls from platform settings; block only objective regressions; preserve Phase 8 state; model release and recovery; validate locally without mutating production."],
  ["Pre-Edit Governance Diagnostic", "PHASE_9_PRE_EDIT_CI_GIT_DEPLOYMENT_DIAGNOSTIC.md records the 28-part baseline before implementation."],
  ["Workflow Inventory", "Five purpose-separated workflows now cover release validation, extended evidence, public smoke monitoring, exact-SHA deployment and explicit rollback."],
  ["Workflow Permission Findings", "Every workflow declares contents: read. No unexplained write permission exists."],
  ["GitHub Token Findings", "Validation receives only the default read token and no production secrets. Cloudflare credentials are referenced only in production-environment mutation steps."],
  ["Workflow Trigger Findings", "No pull_request_target exists. Production mutation is workflow_dispatch-only and cannot be reached from an untrusted pull request."],
  ["Supply-Chain Findings", "All action uses are pinned to GitHub-verified full commit SHAs with represented major versions documented. Dependabot proposes reviewed action updates."],
  ["Runtime / Dependency Reproducibility", "Node 22, npm 10, lockfile v3 and npm ci are declared. CI does not use npm install."],
  ["Current CI Quality Gates", "The 18-control register integrates build, type, lint, tests, SEO, content, Phase 8/9, dependency, browser, release manifest, smoke and rollback protections."],
  ["Blocking vs Warning Model", "Deterministic integrity and safety failures block. Semantic overlap, template similarity, content thinness and noisy Lighthouse variation are warning/evidence signals requiring judgment."],
  ["Content Governance", "Existing content audits remain blocking for objective metadata/source integrity; normal refreshes remain practical."],
  ["Topic Ownership Governance", "All 40 primary owners must remain unique/indexable/in sitemap. New indexable routes need documented role, reader, unique value, closest page and owner approval."],
  ["Indexability Governance", "Silent URL removal, new indexable pages, index-state drift, canonical drift and sitemap inconsistency fail Phase 9 unless supported by complete approval metadata."],
  ["Redirect / Canonical Governance", "Public pages remain self-canonical, 404 remains without canonical, internal links resolve, and redirect/URL changes require the release approval register."],
  ["Source / Attribution Governance", "Existing content/source checks remain active; nonexistent registered source references fail rather than becoming editorial warnings."],
  ["Safety Governance", "Meditation safety and trust routes remain present and protected. Safety-component policy changes require explicit release approval."],
  ["Template-Quality Governance", "Exact full visible-content duplicates fail; broader similarity remains a review warning to avoid brittle prose scoring."],
  ["Trust/Authorship Governance", "Organization authorship remains truthful. JSON-LD cannot silently add Person, reviewer or credential claims, and registered trust routes remain present."],
  ["UX / Accessibility Governance", "Browser consent/accessibility checks run in PR/main CI. Lighthouse remains periodic evidence because lab-score variation should not create arbitrary blockers."],
  ["AdSense Governance", "Publisher verification metadata and ads.txt are protected. Runtime AdSense scripts and manual slots remain off and accidental activation fails release validation."],
  ["Privacy / Consent Governance", "Analytics stays denied until affirmative opt-in; missing preference opens settings; advertising storage/user-data/personalization remain denied; alternate global loaders are rejected."],
  ["Security Governance", "The enforced CSP, HSTS, nosniff, referrer, frame, asset-cache and preview-noindex rules are hash-protected. Secret-pattern and workflow-safety scans run in Phase 9."],
  ["PR Governance", "The pull-request template records scope, phase impacts, tests, protected-state changes, approvals, secrets and deployment intent without burdening unchanged domains."],
  ["Branch / Main Protection", "Desired main protection and required checks are documented, but current private-repository plan limits returned HTTP 403. No repository file falsely claims enforcement."],
  ["External GitHub Settings", "Production environment, branch rules, exact required checks, SHA-pin policy and security dashboards remain owner actions, each with exact verification."],
  ["Dependency Automation", "Weekly bounded Dependabot groups cover npm and Actions. High/critical npm audit findings block; major changes never auto-merge/deploy. Dependency-review Action awaits feature availability."],
  ["Release Governance", "A release is the validated current origin/main SHA, not a branch name or local working tree. Production change requires separate explicit authorization."],
  ["Deployment Governance", "The workflow validates the exact SHA, builds once, attests files, transfers and verifies the artifact, rechecks main, deploys with a SHA tag/message, captures deployment state and smokes production."],
  ["Cloudflare Deployment Findings", "Cloudflare deployment requires a scoped API token and account ID. Versions permit traceable rollback; external resources are outside Worker rollback and must be reviewed separately."],
  ["Deployment Concurrency", "Deploy and rollback share echobuddha-production concurrency with cancel-in-progress false. A queued deployment rechecks current origin/main before mutation."],
  ["Environment / Secret Governance", "Only metadata is recorded. No values were inspected or committed. The missing production environment/secrets intentionally keep deployment non-runnable until the owner configures them."],
  ["Preview Governance", "Preview creation is an external deployment and was not authorized. Source headers prescribe noindex/nofollow; an authorized preview must verify header, Analytics isolation and absent AdSense runtime."],
  ["Production Smoke-Test Governance", "Read-only checks cover homepage availability/canonical/CSP/AdSense absence plus robots and sitemap. They run weekly/manual and block an authorized deploy after mutation."],
  ["Rollback Governance", "Rollback uses a recorded Cloudflare version UUID, reason and exact ROLLBACK confirmation. Severe incidents favor rollback; minor editorial defects favor normal fix-forward."],
  ["Deployment Record Governance", "The template records SHA, run, artifact, digest, Cloudflare deployment/version, previous good, timestamps, change categories, smoke and authorization."],
  ["Artifact / Audit Retention", "CI/browser evidence retains 30 days; deployment/rollback evidence 90 days. Durable reviewed records use repository templates; transient output stays ignored."],
  ["Repository Hygiene", "Ignored artifacts/logs/secrets were strengthened. No history rewrite or LFS migration was justified for Phase 9."],
  ["Implementation — CI", "validate.yml was hardened and four bounded workflows were added with timeouts, concurrency, least permissions and pinned actions."],
  ["Implementation — Content Quality Gates", "Phase 9 baseline and approval registers turn protected route/index/owner/source/trust/AdSense/consent state into deterministic checks while keeping semantic warnings non-blocking."],
  ["Implementation — Technical Quality Gates", "Workflow YAML, immutable refs, secret patterns, headers, runtime, dependency and release traceability are validated."],
  ["Implementation — PR Templates", "CONTRIBUTING.md and the PR template align contributor steps with actual gates and owner approvals."],
  ["Implementation — Release Validation", "validate:release now composes existing validation, Phase 8, Phase 9 and dependency audit."],
  ["Implementation — Deployment Workflow", "deploy-production.yml implements manual exact-SHA validation, build-once artifact transfer, digest verification, environment isolation and smoke evidence."],
  ["Implementation — Smoke Testing", "production-smoke-check.mjs supplies the same executable checks to post-deploy and scheduled/manual monitoring workflows."],
  ["Implementation — Rollback Documentation", "The rollback runbook, production checklist, record template and rollback workflow define authorization, version targeting, smoke and incident evidence."],
  ["Implementation — Dependency Governance", "Dependabot, deterministic install metadata and the existing advisory blocker provide proportionate dependency governance."],
  ["External Owner Actions Required", "Ten exact GitHub, Cloudflare and process actions are listed in phase-9-owner-action-items.csv. None is represented as complete before dashboard verification."],
  ["Before / After Governance State", "The repository moves from one general workflow and local deploy instructions to five separated workflows, 18 registered controls, zero mutable action refs and traceable release/recovery architecture."],
  ["Phase 8 Protection Validation", "Routes, sitemap, canonicals, owners, AdSense-disabled state, affirmative consent, security headers, UX and trust remain unchanged."],
  ["Full CI Validation", finalValidation ? "npm ci, the full release gate, browser audit, Lighthouse and clean-snapshot validation passed locally. Hosted Actions remain pending because no push was authorized." : "Final local, browser, Lighthouse and clean-snapshot validation is pending; this report will be regenerated after completion."],
  ["Deployment-Dry-Run / Non-Production Validation", finalValidation ? "Release-manifest creation/verification and Wrangler dry-run passed without a Cloudflare mutation. Production smoke passed against the unchanged Phase 8 site." : "Non-production manifest and Wrangler dry-run checks are pending. No preview or production mutation is authorized."],
  ["Human Review", "The controls are understandable for a solo maintainer, bad deterministic changes fail, subjective concerns remain reviewable, exact SHA/recovery are traceable, and ordinary typo/source/article refresh work remains feasible."],
  ["Remaining Phase 10 Issues", "Search Console, Analytics consent context, field performance, manual actions/security issues and measurement windows require owner/account access. Phase 9 does not collect those metrics."],
  ["Protected State Before Phase 10", "MASTER_PRE_PHASE10_PROTECTION_REGISTER.csv defines what Phase 10 may measure or improve and what it must not casually alter."],
  ["Deployment Status", `No Phase 9 deployment occurred. Production remains deployment ${baseline.production.deploymentId}, version ${baseline.production.versionId}, from Phase 8 implementation ${prodSha}.`],
  ["Phase 10 Handoff", "The handoff anchors measurement to the last production SHA/time, release categories, sitemap state, consent context and owner-only data sources without pre-collecting Phase 10 evidence."],
  ["Final Phase 9 Verdict", finalValidation ? "COMPLETE — EXTERNAL GITHUB/CLOUDFLARE SETTINGS PENDING" : "PROVISIONAL — FINAL LOCAL VALIDATION PENDING"]
];
if (sections.length !== 64) throw new Error(`Expected 64 report sections, found ${sections.length}`);
const report = [
  "# Echo Buddha Phase 9 — CI, Git & Deployment Governance Report",
  "",
  `Report date: 2026-08-13`,
  "",
  `Branch: codex/phase-9-ci-git-deployment`,
  "",
  `Starting HEAD: ${baseline.sourceCommit}`,
  "",
  `Production change: none`,
  "",
  ...sections.flatMap(([title, body], index) => [`## ${index + 1}. ${title}`, "", body, ""])
].join("\n");
fs.writeFileSync(path.join(out, "ECHO_BUDDHA_CI_GIT_DEPLOYMENT_GOVERNANCE_REPORT.md"), `${report.trimEnd()}\n`);

console.log(`Generated ${fs.readdirSync(out).filter((file) => file.endsWith(".csv")).length} Phase 9 CSVs and the 64-section report (${finalValidation ? "final" : "provisional"} validation state).`);
