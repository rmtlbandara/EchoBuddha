import { execFileSync } from "node:child_process";
import fs from "node:fs";

let audit;

try {
  const stdout = execFileSync("npm", ["audit", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  audit = JSON.parse(stdout);
} catch (error) {
  if (!error.stdout) {
    console.error(String(error.stderr || error.message));
    process.exit(1);
  }
  audit = JSON.parse(error.stdout);
}

const counts = audit.metadata?.vulnerabilities || {};
const critical = counts.critical || 0;
const high = counts.high || 0;

const exceptionRegister = JSON.parse(fs.readFileSync("governance/dependency-risk-exceptions.json", "utf8"));
const today = new Date().toISOString().slice(0, 10);
const activeExceptions = exceptionRegister.exceptions.filter((exception) =>
  exception.effectiveOn <= today && today <= exception.expiresOn
);
const vulnerabilities = audit.vulnerabilities || {};

function advisoryUrlsFor(name, seen = new Set()) {
  if (seen.has(name)) return new Set();
  seen.add(name);
  const urls = new Set();
  for (const via of vulnerabilities[name]?.via || []) {
    if (typeof via === "string") {
      for (const url of advisoryUrlsFor(via, seen)) urls.add(url);
    } else if (via?.url) {
      urls.add(via.url);
    }
  }
  return urls;
}

const blocking = [];
const accepted = [];
for (const [name, item] of Object.entries(vulnerabilities)) {
  if (item.severity !== "critical" && item.severity !== "high") continue;
  const advisoryUrls = [...advisoryUrlsFor(name)];
  const exception = activeExceptions.find((candidate) =>
    candidate.severity === item.severity &&
    candidate.allowedVulnerabilityNames.includes(name) &&
    advisoryUrls.length > 0 &&
    advisoryUrls.every((url) => url === candidate.advisoryUrl)
  );
  (exception ? accepted : blocking).push({ name, severity: item.severity, advisoryUrls, exception });
}

if (blocking.length > 0) {
  console.error(`Dependency audit failed: ${critical} critical, ${high} high vulnerability paths; ${blocking.length} unaccepted.`);
  for (const item of blocking) {
    console.error(`- ${item.name}: ${item.severity}; ${item.advisoryUrls.join(", ") || "unresolved advisory chain"}`);
  }
  process.exit(1);
}

if (accepted.length > 0) {
  const exceptions = [...new Map(accepted.map((item) => [item.exception.id, item.exception])).values()];
  console.log(`Dependency audit passed with ${exceptions.length} time-bounded exception: ${critical} critical, ${high} high transitive paths, 0 unaccepted.`);
  for (const exception of exceptions) {
    console.log(`- ${exception.id}: ${exception.advisoryUrl}; expires ${exception.expiresOn}; no patched release observed at ${exception.upstream.checkedAt}`);
  }
} else {
  console.log(`Dependency audit passed: ${critical} critical, ${high} high vulnerabilities.`);
}
