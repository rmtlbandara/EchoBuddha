import fs from "node:fs";
import path from "node:path";

export function canonicalSlashRedirects(dist) {
  const routes = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name === "index.html") {
        const relative = path.relative(dist, directory).split(path.sep).join("/");
        // Exact known HTML routes only: assets, APIs, encoded paths and unknown URLs
        // retain Cloudflare's own behavior. No wildcard rules or extra Worker.
        if (relative && !/[.%\s?#]/.test(relative)) routes.push(`/${relative} /${relative}/ 308`);
      }
    }
  }
  walk(dist);
  return routes.sort();
}

export function prepareReleaseAssets(dist, { sha, ref } = {}) {
  const existing = fs.readFileSync(path.join(dist, "_redirects"), "utf8").trim();
  fs.writeFileSync(path.join(dist, "_redirects"), `${existing}\n\n# Exact canonical HTML slash normalization; query strings are preserved.\n${canonicalSlashRedirects(dist).join("\n")}\n`);
  if (!/^[a-f0-9]{40}$/.test(sha || "")) throw new Error("Release identity requires a full Git SHA");
  fs.writeFileSync(path.join(dist, "release.json"), JSON.stringify({ schemaVersion: 1, sha, ref: ref || "local", builtAt: new Date().toISOString() }, null, 2) + "\n");
}
