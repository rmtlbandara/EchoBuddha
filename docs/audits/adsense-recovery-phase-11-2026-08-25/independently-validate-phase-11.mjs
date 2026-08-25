import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25");
const dist = path.join(root, "dist");
const walk = (dir, out = []) => { for (const name of fs.readdirSync(dir)) { const file = path.join(dir, name); fs.statSync(file).isDirectory() ? walk(file, out) : file.endsWith(".html") && out.push(file); } return out; };
const route = (file) => { const rel = path.relative(dist, file).split(path.sep).join("/"); return rel === "index.html" ? "/" : rel.endsWith("/index.html") ? `/${rel.slice(0, -10)}` : `/${rel}`; };
const htmlRoutes = walk(dist).map(route).sort();
const noindex = htmlRoutes.filter((item) => /<meta\s+name=["']robots["'][^>]*noindex/i.test(fs.readFileSync(item === "/" ? path.join(dist, "index.html") : item === "/404.html" ? path.join(dist, "404.html") : path.join(dist, item.slice(1), "index.html"), "utf8")));
const indexable = htmlRoutes.filter((item) => !noindex.includes(item));
const sitemap = [...fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/echobuddha\.com(.*?)<\/loc>/g)].map((match) => match[1] || "/").sort();
const redirectLines = fs.readFileSync(path.join(root, "public/_redirects"), "utf8").split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith("#"));
const redirects = redirectLines.map((line) => line.trim().split(/\s+/)[0]).sort();
const technical = ["/ads.txt", "/robots.txt", "/search-index.json", "/search.js", "/sitemap.xml"];
const sets = { INDEXABLE_SET: indexable, NOINDEX_SET: noindex, REDIRECT_SET: redirects, REMOVED_SET: [], TECHNICAL_SET: technical };
const intersection = (a, b) => a.filter((item) => b.includes(item));
const checks = [
  { name: "335 independently discovered HTML routes", pass: htmlRoutes.length === 335, actual: htmlRoutes.length },
  { name: "149 independently discovered indexable routes", pass: indexable.length === 149, actual: indexable.length },
  { name: "186 independently discovered noindex routes", pass: noindex.length === 186, actual: noindex.length },
  { name: "sitemap equals independently derived indexable set", pass: JSON.stringify(sitemap) === JSON.stringify(indexable), actual: sitemap.length },
  { name: "three independently parsed permanent redirects", pass: redirects.length === 3 && redirectLines.every((line) => /\s301\s*$/.test(line)), actual: redirects.length },
  { name: "indexable/noindex mutually exclusive", pass: intersection(indexable, noindex).length === 0, actual: intersection(indexable, noindex).length },
  { name: "sitemap/noindex mutually exclusive", pass: intersection(sitemap, noindex).length === 0, actual: intersection(sitemap, noindex).length },
  { name: "sitemap/redirect mutually exclusive", pass: intersection(sitemap, redirects).length === 0, actual: intersection(sitemap, redirects).length },
  { name: "technical/indexable mutually exclusive", pass: intersection(technical, indexable).length === 0, actual: intersection(technical, indexable).length },
  { name: "404 build shell noindex and sitemap excluded", pass: noindex.includes("/404.html") && !sitemap.includes("/404.html"), actual: noindex.includes("/404.html") },
  { name: "all P0/P1 canonical-map URLs protected", pass: true, actual: "checked below" }
];
const canonicalMap = fs.readFileSync(path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24/ECHO_BUDDHA_CANONICAL_EQUITY_MAP.csv"), "utf8").split(/\r?\n/).filter((line) => /SEO_P[01]_/.test(line));
const protectedFailures = canonicalMap.map((line) => line.match(/^([^,]+)/)?.[1]).filter(Boolean).map((url) => new URL(url).pathname).filter((pathname) => !indexable.includes(pathname) && !redirects.includes(pathname));
checks.at(-1).pass = protectedFailures.length === 0;
checks.at(-1).actual = { checked: canonicalMap.length, failures: protectedFailures };
const failures = checks.filter((check) => !check.pass);
const result = { status: failures.length ? "FAIL" : "PASS", method: "Independent derivation from dist HTML, sitemap XML, redirect config and Phase 3 canonical map without importing the Phase 11 policy module", sets: Object.fromEntries(Object.entries(sets).map(([name, value]) => [name, { count: value.length, sha256: crypto.createHash("sha256").update(value.join("\n")).digest("hex") }])), checks, failures };
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_11_INDEPENDENT_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, sets: result.sets, checks: checks.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
