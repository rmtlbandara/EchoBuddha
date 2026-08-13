import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactRoot = path.resolve(root, process.argv[2] || ".release");
const dist = path.join(artifactRoot, "dist");
const sha = process.env.RELEASE_SHA || "";

if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error("RELEASE_SHA must be a full lowercase 40-character Git SHA.");
if (!fs.existsSync(path.join(dist, "index.html"))) throw new Error(`Release artifact is missing ${path.join(dist, "index.html")}.`);

const files = fs.readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.join(entry.parentPath || entry.path, entry.name))
  .sort();
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
const records = files.map((file) => ({
  path: path.relative(artifactRoot, file).split(path.sep).join("/"),
  bytes: fs.statSync(file).size,
  sha256: sha256(fs.readFileSync(file)),
}));
const manifest = {
  schemaVersion: 1,
  sha,
  ref: process.env.RELEASE_REF || "",
  workflowRunId: process.env.GITHUB_RUN_ID || "local",
  createdAt: new Date().toISOString(),
  fileCount: records.length,
  aggregateSha256: sha256(Buffer.from(records.map((item) => `${item.sha256}  ${item.path}`).join("\n"))),
  files: records,
};
fs.writeFileSync(path.join(artifactRoot, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Release manifest created for ${sha}: ${records.length} files; ${manifest.aggregateSha256}`);
