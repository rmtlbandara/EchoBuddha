import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const output = path.join(root, "governance/release-baseline.json");
const origin = "https://echobuddha.com";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : [target];
});
const routeFor = (file) => {
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
};
const match = (value, pattern) => value.match(pattern)?.[1]?.trim() || "";
const canonicalFor = (html) => match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)
  || match(html, /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
const robotsFor = (html) => match(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i)
  || match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i)
  || "index, follow (implicit)";
const parseCsv = (text) => {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (character !== "\r") field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...records] = rows.filter((item) => item.some(Boolean));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
};

if (!fs.existsSync(path.join(dist, "sitemap.xml"))) {
  throw new Error("Build output is missing. Run npm run build before capturing the baseline.");
}

const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const sitemapRoutes = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((item) => new URL(item[1]).pathname));
const routes = walk(dist).filter((file) => file.endsWith(".html")).sort().map((file) => {
  const route = routeFor(file);
  const html = fs.readFileSync(file, "utf8");
  const robots = robotsFor(html);
  return {
    route,
    indexable: !/noindex/i.test(robots) && route !== "/404.html",
    robots,
    canonical: canonicalFor(html),
    inSitemap: sitemapRoutes.has(route),
  };
});

const owners = parseCsv(fs.readFileSync(path.join(root,
  "docs/audits/adsense-rejection-2026-08/reconciliation/phase-0-4-current-topic-owner-review.csv"), "utf8"))
  .map((row) => ({ topic: row.Topic, ownerUrl: row["Primary owner URL"] }))
  .sort((left, right) => left.topic.localeCompare(right.topic));

const protectedFiles = [
  "public/robots.txt",
  "public/_headers",
  "public/ads.txt",
  "src/data/ads.ts",
  "src/components/ConsentManager.astro",
  "src/data/editorialGovernance.ts",
  "src/components/Header.astro",
  "src/pages/privacy-policy.astro",
  "wrangler.jsonc",
];

const baseline = {
  version: 1,
  capturedAt: "2026-08-13",
  sourceCommit: "e01071b114cd3615840dfa630f5ee03c1348a570",
  production: {
    implementationCommit: "8de969c74139a68b88849f2404e3dc7c353e6a12",
    deployedAt: "2026-08-13T10:54:18.802821Z",
    deploymentId: "891ac394-206e-4c9a-ba55-811b397fb6a4",
    versionId: "fa751ad8-ebeb-45b3-983a-96703733631b",
    previousGoodVersionId: "23d6d780-5174-43c2-86d1-09fd2e574cce"
  },
  counts: {
    html: routes.length,
    indexable: routes.filter((route) => route.indexable).length,
    noindexOrError: routes.filter((route) => !route.indexable).length,
    sitemap: sitemapRoutes.size,
    search: JSON.parse(fs.readFileSync(path.join(dist, "search-index.json"), "utf8")).length,
    primaryOwners: owners.length
  },
  origin,
  routes,
  primaryOwners: owners,
  protectedFileHashes: Object.fromEntries(protectedFiles.map((file) => [file, sha256(fs.readFileSync(path.join(root, file)))]))
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(baseline, null, 2)}\n`);
console.log(`Captured governance baseline: ${routes.length} routes, ${sitemapRoutes.size} sitemap URLs, ${owners.length} owners.`);
