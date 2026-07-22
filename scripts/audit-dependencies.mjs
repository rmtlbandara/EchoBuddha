import { execFileSync } from "node:child_process";

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

if (critical > 0 || high > 0) {
  console.error(`Dependency audit failed: ${critical} critical, ${high} high vulnerabilities.`);
  for (const [name, item] of Object.entries(audit.vulnerabilities || {})) {
    if (item.severity === "critical" || item.severity === "high") {
      console.error(`- ${name}: ${item.severity}`);
    }
  }
  process.exit(1);
}

console.log(`Dependency audit passed: ${critical} critical, ${high} high vulnerabilities.`);
