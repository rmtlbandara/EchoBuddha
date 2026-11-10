import { SHA_PATTERN } from "./production-release-identity.mjs";

export const PRODUCTION_ORIGIN = "https://echobuddha.com";
export const RECOVERY_PREFIX = "Verified activation after initial smoke failure:";
const ACTIVE_STATES = new Set(["waiting", "queued", "pending", "in_progress"]);
const FAILURE_STATES = new Set(["error", "failure"]);
const STATUS_STATES = new Set(["success", "inactive", ...ACTIVE_STATES, ...FAILURE_STATES]);
const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;

function matchesReleaseRun(run, sha) {
  return run.path === ".github/workflows/deploy-production.yml" && run.event === "workflow_dispatch" &&
    run.head_branch === "main" && run.head_sha === sha;
}

export function createGitHubReader(repository, token) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository ?? "") || !token) {
    throw new Error("Production monitoring requires GITHUB_REPOSITORY and a GitHub token with Deployments and Actions read access.");
  }
  return async endpoint => {
    const response = await fetch(`https://api.github.com/repos/${repository}/${endpoint}`, {
      redirect: "error",
      signal: AbortSignal.timeout(8000),
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub deployment evidence request failed (HTTP ${response.status}).`);
    return response.json();
  };
}

async function verifySuccess(deployment, status, repository, read) {
  const repoUrl = `https://github.com/${repository}/`;
  if (deployment.ref !== "main" || status.environment_url !== PRODUCTION_ORIGIN) {
    throw new Error(`Production success ${status.id} does not name the expected branch and environment URL.`);
  }
  const evidenceUrl = status.log_url ?? "";
  if (!evidenceUrl.startsWith(repoUrl)) throw new Error(`Production success ${status.id} lacks repository evidence.`);
  const evidencePath = evidenceUrl.slice(repoUrl.length);

  if (status.description?.startsWith(RECOVERY_PREFIX)) {
    const match = /^blob\/([0-9a-f]{40})\/(docs\/deployments\/receipts\/[\w.-]+\.json)$/.exec(evidencePath);
    if (!match) {
      throw new Error(`Recovered production status ${status.id} must link to a deployment receipt at an immutable commit.`);
    }
    const [, commit, path] = match;
    const file = await read(`contents/${path}?ref=${commit}`);
    if (file.type !== "file" || file.encoding !== "base64") {
      throw new Error(`Recovered production status ${status.id} has no readable receipt.`);
    }
    const receipt = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
    const smoke = receipt.smoke;
    if (receipt.schemaVersion !== 1 || receipt.githubDeploymentId !== deployment.id ||
        receipt.sha !== deployment.sha || !Number.isSafeInteger(receipt.githubRunId) ||
        !UUID.test(receipt.cloudflareDeploymentId ?? "") || !UUID.test(receipt.cloudflareVersionId ?? "") ||
        receipt.trafficPercent !== 100 || !Number.isInteger(smoke?.total) || smoke.total < 15 ||
        smoke.passed !== smoke.total || !Number.isFinite(Date.parse(smoke.verifiedAt))) {
      throw new Error(`Recovered production status ${status.id} lacks matching activation and exact-SHA smoke evidence.`);
    }
    const run = await read(`actions/runs/${receipt.githubRunId}`);
    if (!matchesReleaseRun(run, deployment.sha) || run.conclusion !== "failure") {
      throw new Error(`Recovered production status ${status.id} does not match the original failed deployment run.`);
    }
    return "independently-verified";
  }

  const match = /^actions\/runs\/(\d+)(?:\/job\/\d+)?$/.exec(evidencePath);
  if (!match) throw new Error(`Production success ${status.id} does not link to its deployment workflow.`);
  const run = await read(`actions/runs/${match[1]}`);
  if (!matchesReleaseRun(run, deployment.sha) || run.conclusion !== "success") {
    throw new Error(`Production success ${status.id} does not match a completed exact-SHA deployment run.`);
  }
  return "hosted-deploy-smoke";
}

export async function resolveProductionDeployment(repository, read) {
  // GitHub lists newest first. Stop at the first current, verifiable success.
  const deployments = await read("deployments?environment=production&task=deploy&per_page=20");
  let latest;
  for (const deployment of deployments) {
    if (!Number.isSafeInteger(deployment.id) || deployment.environment !== "production" ||
        deployment.task !== "deploy" || !SHA_PATTERN.test(deployment.sha ?? "")) {
      throw new Error("GitHub returned an invalid production deployment record.");
    }
    const [status] = await read(`deployments/${deployment.id}/statuses?per_page=1`);
    if (status && (!Number.isSafeInteger(status.id) || status.environment !== "production" ||
        !STATUS_STATES.has(status.state))) {
      throw new Error(`GitHub returned an invalid status for production deployment ${deployment.id}.`);
    }
    const evidence = {
      deploymentId: deployment.id,
      sha: deployment.sha,
      statusId: status?.id ?? null,
      state: status?.state ?? "pending",
      evidenceUrl: status?.log_url || null,
    };
    latest ??= evidence;
    if (status?.state === "success") {
      const verification = await verifySuccess(deployment, status, repository, read);
      return { latest, verified: { ...evidence, verification } };
    }
  }
  throw new Error("No verified success in the latest 20 production deployments. The expected SHA was not inferred from the live site.");
}

export function classifyProduction({ latest, verified }, identity, failures) {
  if (failures.some(name => name !== "release-identity")) return "LIVE_SMOKE_FAILED";

  const observed = identity.sha;
  const newerAttempt = latest.deploymentId !== verified.deploymentId;
  if (newerAttempt && ACTIVE_STATES.has(latest.state) && (observed === latest.sha || observed === verified.sha)) {
    return "DEPLOYMENT_TRANSITION";
  }
  if (newerAttempt && FAILURE_STATES.has(latest.state)) {
    if (observed === verified.sha) return "VERIFIED_RELEASE_SERVING_AFTER_FAILED_ATTEMPT";
    if (observed === latest.sha) return "ACTIVATION_NEEDS_VERIFICATION";
  }
  if (!observed) return "RELEASE_IDENTITY_UNAVAILABLE";
  if (observed !== verified.sha) return "RELEASE_IDENTITY_MISMATCH";
  return verified.verification === "independently-verified" ? "VERIFIED_AFTER_INITIAL_FAILURE" : "VERIFIED_LIVE";
}
