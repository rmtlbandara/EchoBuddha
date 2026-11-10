import assert from "node:assert/strict";
import test from "node:test";
import { verifyReleaseIdentity } from "../scripts/production-release-identity.mjs";
import {
  classifyProduction,
  PRODUCTION_ORIGIN,
  RECOVERY_PREFIX,
  resolveProductionDeployment,
} from "../scripts/production-deployment-evidence.mjs";

const previous = "a".repeat(40);
const target = "b".repeat(40);
const repository = "owner/repository";
const repoUrl = `https://github.com/${repository}`;
const release = sha => Response.json({
  schemaVersion: 1, sha, ref: "refs/heads/main", builtAt: "2026-11-10T15:42:56.314Z",
});

test("deployment identity retries the preceding SHA and a transient response, then requires the exact target", async () => {
  const responses = [release(previous), new Response(null, { status: 503 }), release(target)];
  const waits = [];
  const result = await verifyReleaseIdentity(PRODUCTION_ORIGIN, target, {
    waitForRelease: true,
    fetcher: async (url, options) => {
      assert.equal(url.href, `${PRODUCTION_ORIGIN}/release.json`);
      assert.equal(options.redirect, "error");
      assert.equal(options.headers["cache-control"], "no-cache");
      assert.ok(options.signal instanceof AbortSignal);
      return responses.shift();
    },
    sleep: async delay => waits.push(delay),
  });
  assert.equal(result.pass, true);
  assert.equal(result.identity.sha, target);
  assert.deepEqual(result.attempts.map(attempt => attempt.result), ["different-sha", "transient-http", "matched"]);
  assert.deepEqual(waits, [2000, 4000]);
});

test("deployment identity keeps a strict failure after the bounded wait", async () => {
  const waits = [];
  const result = await verifyReleaseIdentity(PRODUCTION_ORIGIN, target, {
    waitForRelease: true,
    fetcher: async () => release(previous),
    sleep: async delay => waits.push(delay),
  });
  assert.equal(result.pass, false);
  assert.equal(result.identity.sha, previous);
  assert.equal(result.attempts.length, 6);
  assert.deepEqual(waits, [2000, 4000, 8000, 12000, 15000]);
});

test("malformed identity fails without retries and routine monitoring observes once", async () => {
  const invalid = await verifyReleaseIdentity(PRODUCTION_ORIGIN, target, {
    waitForRelease: true,
    fetcher: async () => Response.json({ sha: target }),
    sleep: async () => assert.fail("malformed record should fail immediately"),
  });
  assert.equal(invalid.pass, false);
  assert.equal(invalid.attempts[0].result, "invalid-identity");

  const mismatch = await verifyReleaseIdentity(PRODUCTION_ORIGIN, target, {
    fetcher: async () => release(previous),
    sleep: async () => assert.fail("routine smoke should not wait on a mismatched SHA"),
  });
  assert.equal(mismatch.pass, false);
  assert.equal(mismatch.attempts.length, 1);
  await assert.rejects(verifyReleaseIdentity(PRODUCTION_ORIGIN, undefined, { waitForRelease: true }), /full expected Git SHA/);
});

const attempt = (id, sha) => ({ id, sha, ref: "main", environment: "production", task: "deploy" });
const status = (id, state, overrides = {}) => ({
  id, state, environment: "production", environment_url: PRODUCTION_ORIGIN,
  log_url: `${repoUrl}/actions/runs/123/job/456`, ...overrides,
});
const deployedRun = {
  path: ".github/workflows/deploy-production.yml", event: "workflow_dispatch",
  head_branch: "main", head_sha: previous, conclusion: "success",
};

function reader(latestStatus, run = deployedRun) {
  const data = {
    "deployments?environment=production&task=deploy&per_page=20": [attempt(20, target), attempt(10, previous)],
    "deployments/20/statuses?per_page=1": [latestStatus],
    "deployments/10/statuses?per_page=1": [status(11, "success")],
    "actions/runs/123": run,
  };
  return async endpoint => {
    assert.ok(Object.hasOwn(data, endpoint), endpoint);
    return data[endpoint];
  };
}

test("failed newest deployment does not redefine the expected SHA, even when the attempt is serving", async () => {
  const evidence = await resolveProductionDeployment(repository, reader(status(21, "failure")));
  assert.equal(evidence.verified.sha, previous);
  assert.equal(evidence.latest.sha, target);
  assert.equal(classifyProduction(evidence, { sha: previous }, []), "VERIFIED_RELEASE_SERVING_AFTER_FAILED_ATTEMPT");
  assert.equal(classifyProduction(evidence, { sha: target }, ["release-identity"]), "ACTIVATION_NEEDS_VERIFICATION");
  assert.equal(classifyProduction(evidence, { sha: target }, ["release-identity", "security-headers"]), "LIVE_SMOKE_FAILED");
});

test("an active attempt is reported as a transition without accepting its SHA", async () => {
  const evidence = await resolveProductionDeployment(repository, reader(status(21, "in_progress")));
  assert.equal(evidence.verified.sha, previous);
  assert.equal(classifyProduction(evidence, { sha: target }, ["release-identity"]), "DEPLOYMENT_TRANSITION");
  assert.equal(classifyProduction(evidence, { sha: "c".repeat(40) }, ["release-identity"]), "RELEASE_IDENTITY_MISMATCH");
});

test("independently verified activation is accepted with immutable evidence, without changing run history", async () => {
  const commit = "c".repeat(40);
  const path = "docs/deployments/receipts/recovery.json";
  const recovered = status(22, "success", {
    description: `${RECOVERY_PREFIX} exact-SHA smoke 15/15.`,
    log_url: `${repoUrl}/blob/${commit}/${path}`,
  });
  const makeReader = sha => async endpoint => {
    if (endpoint === `contents/${path}?ref=${commit}`) {
      const receipt = {
        schemaVersion: 1, githubDeploymentId: 20, sha, githubRunId: 123,
        cloudflareDeploymentId: "9c7376f6-6620-4ff9-b4b4-3d193a8a6259",
        cloudflareVersionId: "611bcc75-9236-4bad-9068-0a716e2a46d0",
        trafficPercent: 100,
        smoke: { total: 15, passed: 15, verifiedAt: "2026-11-10T15:44:57.874Z" },
      };
      return { type: "file", encoding: "base64", content: Buffer.from(JSON.stringify(receipt)).toString("base64") };
    }
    return reader(recovered, { ...deployedRun, head_sha: target, conclusion: "failure" })(endpoint);
  };
  const evidence = await resolveProductionDeployment(repository, makeReader(target));
  assert.equal(evidence.verified.sha, target);
  assert.equal(evidence.verified.statusId, 22);
  assert.equal(classifyProduction(evidence, { sha: target }, []), "VERIFIED_AFTER_INITIAL_FAILURE");
  assert.equal(classifyProduction(evidence, {}, ["release-identity"]), "RELEASE_IDENTITY_UNAVAILABLE");
  await assert.rejects(resolveProductionDeployment(repository, makeReader(previous)), /lacks matching activation/);
  await assert.rejects(resolveProductionDeployment(repository, reader({
    ...recovered, log_url: `${repoUrl}/blob/main/${path}`,
  })), /immutable commit/);
});

test("success evidence from an unrelated run or with no verified deployment fails closed", async () => {
  await assert.rejects(resolveProductionDeployment(repository, reader(status(21, "success"), {
    ...deployedRun, path: ".github/workflows/rollback-production.yml", head_sha: target,
  })), /completed exact-SHA deployment run/);
  await assert.rejects(resolveProductionDeployment(repository, async () => []), /No verified success/);
});
