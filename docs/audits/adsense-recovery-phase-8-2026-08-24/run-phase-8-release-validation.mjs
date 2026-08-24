import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "../../..");
const commands = [
  ["validate", ["run", "validate"]],
  ["phase8", ["run", "audit:phase8"]],
  ["dependencies", ["run", "audit:dependencies"]]
];
const results = [];

for (const [name, args] of commands) {
  execFileSync("npm", args, { cwd: root, stdio: "inherit" });
  results.push({ name, command: `npm ${args.join(" ")}`, status: "PASS" });
}

const artifact = {
  generatedAt: new Date().toISOString(),
  status: "PASS",
  scope: "Phase 8 full local release gate; no production, merge, deployment, AdSense, or Phase 9 action",
  results
};
fs.writeFileSync(path.join(import.meta.dirname, "ECHO_BUDDHA_PHASE_8_RELEASE_VALIDATION.json"), `${JSON.stringify(artifact, null, 2)}\n`);
console.log("Phase 8 full release gate passed.");
