import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { execFileSync } from "node:child_process";
import { prepareReleaseAssets } from "./prepare-release-assets.mjs";
import { buildManifest } from "./indexnow.mjs";

const require = createRequire(import.meta.url);
const packagePath = require.resolve("astro/package.json");
const astro = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const args = process.argv.slice(2);
const result = spawnSync(process.execPath, [
  path.resolve(path.dirname(packagePath), astro.bin.astro), "build", ...args
], { stdio: "inherit" });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
const outDirIndex = args.indexOf("--outDir");
const outDir = args.find((arg) => arg.startsWith("--outDir="))?.slice("--outDir=".length)
  || (outDirIndex >= 0 ? args[outDirIndex + 1] : "dist");
if (!outDir) throw new Error("--outDir requires a directory");
prepareReleaseAssets(outDir, {
  sha: process.env.RELEASE_SHA || execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  ref: process.env.RELEASE_REF || "local"
});
console.log(`IndexNow proof and manifest built for ${buildManifest(outDir).pages.length} sitemap URLs.`);
