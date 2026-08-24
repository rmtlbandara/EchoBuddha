import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(dir, "../../../..");
const clientPath = process.env.ECHOBUDDHA_GSC_CLIENT_FILE;
const tokenPath = process.env.ECHOBUDDHA_GSC_TOKEN_FILE;
if (!clientPath || !tokenPath) throw new Error("Credential file paths must be supplied through environment variables.");
const clientDoc = JSON.parse(fs.readFileSync(clientPath, "utf8"));
const client = clientDoc.installed ?? clientDoc.web ?? {};
const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
const sensitiveValues = [client.client_id, client.client_secret, token.access_token, token.refresh_token, token.id_token].filter((value) => typeof value === "string" && value.length >= 10);
const skip = new Set([".git", "node_modules", ".astro", "dist"]);
const matches = [];
let filesScanned = 0;
function walk(base) {
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(base, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) {
      filesScanned += 1;
      const stat = fs.statSync(full);
      if (stat.size > 25_000_000) continue;
      const body = fs.readFileSync(full);
      if (sensitiveValues.some((value) => body.includes(Buffer.from(value)))) matches.push(path.relative(repo, full));
    }
  }
}
walk(repo);
const tokenMode = fs.statSync(tokenPath).mode & 0o777;
const result = {
  validated_at: new Date().toISOString(),
  status: matches.length || tokenMode !== 0o600 || path.resolve(tokenPath).startsWith(`${repo}${path.sep}`) ? "FAIL" : "PASS",
  repository_scanned: true,
  files_scanned: filesScanned,
  exact_sensitive_value_matches: matches,
  client_file_outside_repository: !path.resolve(clientPath).startsWith(`${repo}${path.sep}`),
  token_file_outside_repository: !path.resolve(tokenPath).startsWith(`${repo}${path.sep}`),
  token_mode_0600: tokenMode === 0o600,
  scope_expected: "https://www.googleapis.com/auth/webmasters.readonly",
  secret_values_recorded_in_artifact: false
};
fs.writeFileSync(path.join(dir, "ECHO_BUDDHA_PHASE_3_SECRET_HANDLING_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, files_scanned: filesScanned, exact_sensitive_value_match_count: matches.length, token_mode_0600: result.token_mode_0600 }));
if (result.status !== "PASS") process.exitCode = 1;
