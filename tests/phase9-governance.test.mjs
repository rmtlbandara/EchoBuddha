import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import YAML from "yaml";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const workflowNames = ["validate.yml", "extended-validation.yml", "production-smoke.yml", "deploy-production.yml", "rollback-production.yml"];
const workflows = workflowNames.map((name) => ({ name, text: read(`.github/workflows/${name}`), yaml: YAML.parse(read(`.github/workflows/${name}`)) }));

test("Phase 9 workflows parse, use least privilege, and pin every action", () => {
  for (const workflow of workflows) {
    assert.equal(workflow.yaml.permissions.contents, "read", `${workflow.name}: contents permission`);
    assert.doesNotMatch(workflow.text, /pull_request_target/);
    const actions = [...workflow.text.matchAll(/uses:\s*([^\s#]+)/g)].map((item) => item[1]);
    assert.ok(actions.length > 0, `${workflow.name}: expected at least one action`);
    assert.deepEqual(actions.filter((action) => !/@[0-9a-f]{40}$/.test(action)), [], `${workflow.name}: mutable action ref`);
    const artifactUploads = Object.values(workflow.yaml.jobs).flatMap((job) => job.steps || []).filter((step) => /actions\/upload-artifact@/.test(step.uses || ""));
    for (const upload of artifactUploads) assert.equal(upload.with?.["include-hidden-files"], true, `${workflow.name}: hidden artifact path must be explicitly included`);
  }
});

test("production deployment is manual, exact-SHA, build-once, serialized, and environment gated", () => {
  const deploy = read(".github/workflows/deploy-production.yml");
  const parsed = YAML.parse(deploy);
  assert.match(deploy, /workflow_dispatch:/);
  assert.doesNotMatch(deploy, /\npush:/);
  assert.match(deploy, /\^\[0-9a-f\]\{40\}\$/);
  assert.match(deploy, /origin\/main/);
  assert.equal((deploy.match(/npm run validate:release/g) || []).length, 1);
  assert.match(deploy, /cp -R dist \.release\/dist/);
  assert.equal(parsed.jobs["deploy-production"].environment.name, "production");
  assert.match(deploy, /group:\s*echobuddha-production/);
  assert.match(deploy, /cancel-in-progress:\s*false/);
  assert.match(deploy, /verify-release-manifest/);
  assert.match(deploy, /audit:production-smoke/);
});

test("rollback requires an explicit version ID and confirmation", () => {
  const rollback = read(".github/workflows/rollback-production.yml");
  const parsed = YAML.parse(rollback);
  assert.match(rollback, /version_id:/);
  assert.match(rollback, /confirm:/);
  assert.match(rollback, /ROLLBACK/);
  assert.match(rollback, /wrangler rollback/);
  assert.equal(parsed.jobs["rollback-production"].environment.name, "production");
  assert.match(rollback, /group:\s*echobuddha-production/);
});

test("AdSense runtime and implicit analytics consent remain disabled", () => {
  const ads = read("src/data/ads.ts");
  const consent = read("src/components/ConsentManager.astro");
  assert.match(ads, /runtimeScriptEnabled:\s*false/);
  assert.match(ads, /manualSlotsEnabled:\s*false/);
  assert.doesNotMatch(consent, /if \(!preference\) writePreference\(true\)/);
  assert.match(consent, /else \{\s*openPanel\(\);\s*\}/);
});

test("release governance files and owner approval registers exist", () => {
  for (const file of [
    "CONTRIBUTING.md",
    "ECHO_BUDDHA_CI_GIT_DEPLOYMENT_GOVERNANCE.md",
    ".github/pull_request_template.md",
    "docs/deployments/DEPLOYMENT_RECORD_TEMPLATE.md",
    "docs/deployments/PRODUCTION_DEPLOYMENT_CHECKLIST.md",
    "docs/deployments/ROLLBACK_RUNBOOK.md",
    "governance/release-baseline.json",
    "governance/indexable-page-approvals.json",
    "governance/release-change-approvals.json"
  ]) assert.ok(fs.existsSync(path.join(root, file)), file);
});
