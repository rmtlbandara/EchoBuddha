import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SEARCH_INDEX_POLICY, SEARCH_INDEX_STATES, SEARCH_REDIRECTS } from "../../../src/data/search-index-policy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25");
const read = (name) => fs.readFileSync(path.join(outDir, name), "utf8");
const attacks = [];
const attack = (name, condition, evidence) => attacks.push({ name, pass: Boolean(condition), evidence });
const sitemap = fs.readFileSync(path.join(root, "dist/sitemap.xml"), "utf8");
const robots = fs.readFileSync(path.join(root, "public/robots.txt"), "utf8");
const redirects = fs.readFileSync(path.join(root, "public/_redirects"), "utf8");
const headers = fs.readFileSync(path.join(root, "public/_headers"), "utf8");
const policyRows = Object.entries(SEARCH_INDEX_POLICY);
const indexable = policyRows.filter(([, row]) => row.state === SEARCH_INDEX_STATES.INDEXABLE).map(([route]) => route);
const noindex = policyRows.filter(([, row]) => row.state === SEARCH_INDEX_STATES.NOINDEX).map(([route]) => route);
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/echobuddha\.com(.*?)<\/loc>/g)].map((match) => match[1] || "/");
attack("unknown route fails closed", !Object.hasOwn(SEARCH_INDEX_POLICY, "/invented-route/"), "invented route absent");
attack("only HTTPS non-www sitemap URL origins", sitemapPaths.every((route) => sitemap.includes(`<loc>https://echobuddha.com${route}</loc>`)) && !sitemap.includes("www.echobuddha.com"), "sitemap loc scan; XML namespace excluded");
attack("no localhost or preview hostname", !/localhost|127\.0\.0\.1|pages\.dev|workers\.dev/i.test(sitemap), "sitemap environment scan");
attack("no sitemap duplicates", new Set(sitemapPaths).size === sitemapPaths.length, sitemapPaths.length);
attack("sitemap equals indexable count", sitemapPaths.length === indexable.length, `${sitemapPaths.length}/${indexable.length}`);
attack("noindex excluded from sitemap", noindex.every((route) => !sitemapPaths.includes(route)), noindex.length);
attack("redirect sources excluded from sitemap", Object.keys(SEARCH_REDIRECTS).every((route) => !sitemapPaths.includes(route)), Object.keys(SEARCH_REDIRECTS).length);
attack("redirect targets included", Object.values(SEARCH_REDIRECTS).every((route) => sitemapPaths.includes(route)), Object.values(SEARCH_REDIRECTS).join("|"));
attack("no redirect loops", Object.entries(SEARCH_REDIRECTS).every(([source, target]) => source !== target && !Object.hasOwn(SEARCH_REDIRECTS, target)), "three one-hop targets");
attack("redirect config exact count", redirects.split(/\r?\n/).filter((line) => /\s301\s*$/.test(line)).length === 3, "public/_redirects");
attack("robots allows Search crawl", robots.includes("User-agent: *") && robots.includes("Allow: /") && !robots.includes("Disallow:"), "public/robots.txt");
attack("robots declares canonical sitemap", robots.includes("Sitemap: https://echobuddha.com/sitemap.xml"), "public/robots.txt");
attack("no robots/noindex contradiction", !robots.includes("Disallow:"), "noindex pages remain crawlable");
attack("preview host protected", headers.includes("echobuddha.rmtlbandara.workers.dev") && headers.includes("X-Robots-Tag: noindex, nofollow"), "public/_headers");
attack("404 has no canonical", !fs.readFileSync(path.join(root, "dist/404.html"), "utf8").includes('rel="canonical"'), "dist/404.html");
attack("404 is noindex", /name="robots" content="noindex, follow"/.test(fs.readFileSync(path.join(root, "dist/404.html"), "utf8")), "dist/404.html");
attack("parameter canonicalization observed", read("ECHO_BUDDHA_PHASE_11_PRODUCTION_BRANCH_DIFF.csv").includes("about/?utm_source=phase11"), "production query probe");
attack("wrong-case behavior observed", read("ECHO_BUDDHA_PHASE_11_PRODUCTION_BRANCH_DIFF.csv").includes("/About/"), "production case probe");
attack("raw/rendered evidence passes", !read("ECHO_BUDDHA_PHASE_11_RAW_RENDERED_DIFF.csv").includes("PENDING_BROWSER_CAPTURE") && !read("ECHO_BUDDHA_PHASE_11_RAW_RENDERED_DIFF.csv").includes(",FAIL"), "15 desktop/mobile samples");
attack("local full HTTP crawl passes", JSON.parse(read("ECHO_BUDDHA_PHASE_11_LOCAL_HTTP_VALIDATION.json")).status === "PASS", "350 responses/probes");
attack("GSC provenance explicit", read("ECHO_BUDDHA_PHASE_11_GSC_INDEX_RECONCILIATION.csv").includes("GOOGLE_OBSERVED_PRODUCTION") && read("ECHO_BUDDHA_PHASE_11_GSC_INDEX_RECONCILIATION.csv").includes("EXPECTED_POST_DEPLOYMENT"), "GSC matrix");
attack("no indexing request language as action", !/indexing_requested": true|indexing_api_used": true|sitemap_submitted": true/.test(read("ECHO_BUDDHA_PHASE_11_VALIDATION.json")), "validation boundary");
attack("Phase 10 ads remain off", JSON.parse(fs.readFileSync(path.join(root, "docs/audits/adsense-recovery-phase-10-2026-08-24/FIREWALL_VALIDATION.json"), "utf8")).status === "PASS_WITH_EXPLICIT_HOLDS", "Phase 10 firewall");
attack("no AdSense runtime in build", !walkText(path.join(root, "dist"), /pagead2\.googlesyndication\.com|adsbygoogle/i), "dist scan");
attack("no build-time sitemap timestamp", !/<lastmod>2026-08-25<\/lastmod>/.test(sitemap), "sitemap lastmod");
attack("structured data audit passes", !read("ECHO_BUDDHA_PHASE_11_STRUCTURED_DATA_AUDIT.csv").includes(",FAIL"), "335 rows");
attack("internal link audit passes", !read("ECHO_BUDDHA_PHASE_11_INTERNAL_LINK_HYGIENE.csv").includes(",FAIL"), "335 rows");
attack("canonical audit passes", !read("ECHO_BUDDHA_PHASE_11_CANONICAL_AUDIT.csv").includes(",FAIL"), "335 rows");
attack("sitemap audit passes", !read("ECHO_BUDDHA_PHASE_11_SITEMAP_DIFF.csv").includes(",FAIL"), "343 rows");
attack("exact state coverage", policyRows.length === 344 && new Set(policyRows.map(([route]) => route)).size === 344, policyRows.length);
attack("no hold states", policyRows.every(([, row]) => row.state !== SEARCH_INDEX_STATES.HOLD), "zero holds");
attack("Phase 3 checkpoint remains ancestor", execFileSync("git", ["merge-base", "--is-ancestor", "2fb776a989aca32da70b8bbdf972a24da8b30fd0", "HEAD"], { cwd: root }).length === 0, "git ancestry exit 0");
attack("Phase 10 checkpoint remains HEAD ancestor", execFileSync("git", ["merge-base", "--is-ancestor", "c703bdd1e4bc96c6c636377f6658069992837c31", "HEAD"], { cwd: root }).length === 0, "git ancestry exit 0");
attack("production unchanged boundary", read("ECHO_BUDDHA_PHASE_11_VALIDATION.json").includes('"production_deployed": false'), "validation boundary");
attack("repository treated private", read("ECHO_BUDDHA_PHASE_11_METHOD_MANIFEST.json").includes("PRIVATE_REGARDLESS_OF_HOST_VISIBILITY"), "method manifest");
attack("all official sources are first party", JSON.parse(read("ECHO_BUDDHA_PHASE_11_METHOD_MANIFEST.json")).official_google_sources.every((url) => /^(https:\/\/developers\.google\.com\/search|https:\/\/support\.google\.com\/webmasters)/.test(url)), "10 sources");

function walkText(dir, pattern) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) { if (walkText(file, pattern)) return true; }
    else if (/\.(?:html|js|css|json|xml|txt)$/.test(file) && pattern.test(fs.readFileSync(file, "utf8"))) return true;
  }
  return false;
}

const failures = attacks.filter((item) => !item.pass);
const result = { status: failures.length ? "FAIL" : "PASS", attacks: attacks.length, bypasses: failures.length, results: attacks };
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_11_RED_TEAM_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, attacks: result.attacks, bypasses: result.bypasses, failures }, null, 2));
if (failures.length) process.exitCode = 1;
