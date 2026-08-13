import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactRoot = path.resolve(root, process.argv[2] || ".release");
const expectedSha = process.env.RELEASE_SHA || "";
const manifest = JSON.parse(fs.readFileSync(path.join(artifactRoot, "release-manifest.json"), "utf8"));
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

if (!/^[0-9a-f]{40}$/.test(expectedSha)) throw new Error("RELEASE_SHA must be a full lowercase 40-character Git SHA.");
if (manifest.sha !== expectedSha) throw new Error(`Artifact SHA mismatch: expected ${expectedSha}, received ${manifest.sha}.`);

const failures = [];
for (const record of manifest.files) {
  const file = path.resolve(artifactRoot, record.path);
  if (!file.startsWith(`${artifactRoot}${path.sep}`)) { failures.push(`${record.path}: outside artifact root`); continue; }
  if (!fs.existsSync(file)) { failures.push(`${record.path}: missing`); continue; }
  const actual = sha256(fs.readFileSync(file));
  if (actual !== record.sha256) failures.push(`${record.path}: hash mismatch`);
}
const aggregate = sha256(Buffer.from(manifest.files.map((item) => `${item.sha256}  ${item.path}`).join("\n")));
if (aggregate !== manifest.aggregateSha256) failures.push("aggregate manifest hash mismatch");
if (failures.length) throw new Error(`Release artifact verification failed:\n- ${failures.join("\n- ")}`);
console.log(`Release artifact verified for ${expectedSha}: ${manifest.fileCount} files; ${aggregate}`);
