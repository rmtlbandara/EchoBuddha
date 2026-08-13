import fs from "node:fs";
import path from "node:path";

const input = path.resolve(process.cwd(), process.argv[2] || ".artifacts/deployment/deployments.json");
const output = path.resolve(process.cwd(), process.argv[3] || ".artifacts/deployment/deployment-record.json");
const deployments = JSON.parse(fs.readFileSync(input, "utf8"));
if (!Array.isArray(deployments) || deployments.length === 0) throw new Error("Cloudflare returned no deployment records.");
const latest = [...deployments].sort((left, right) => new Date(right.created_on) - new Date(left.created_on))[0];
const record = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  gitSha: process.env.RELEASE_SHA || "not-provided",
  githubRunId: process.env.GITHUB_RUN_ID || "local",
  worker: "echobuddha",
  productionUrl: "https://echobuddha.com",
  deploymentId: latest.id,
  createdOn: latest.created_on,
  strategy: latest.strategy,
  versions: latest.versions,
};
fs.writeFileSync(output, `${JSON.stringify(record, null, 2)}\n`);
console.log(`Captured Cloudflare deployment ${record.deploymentId} for ${record.gitSha}.`);
