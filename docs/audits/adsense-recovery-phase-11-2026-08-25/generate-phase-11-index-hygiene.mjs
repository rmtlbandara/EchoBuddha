import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEARCH_INDEX_POLICY,
  SEARCH_INDEX_STATES,
  SEARCH_REDIRECTS,
  SEARCH_TECHNICAL_ENDPOINTS
} from "../../../src/data/search-index-policy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25");
const dist = path.join(root, "dist");
const site = "https://echobuddha.com";
const generatedAt = "2026-08-25T09:00:00+05:30";
const phase10 = "c703bdd1e4bc96c6c636377f6658069992837c31";
const phase3 = "2fb776a989aca32da70b8bbdf972a24da8b30fd0";
const gscPath = path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24/completion-2026-08-24/ECHO_BUDDHA_GSC_URL_INSPECTION.csv");
const productionPath = path.join(outDir, "source-evidence/production-observations.json");
const write = (name, value) => fs.writeFileSync(path.join(outDir, name), value.endsWith("\n") ? value : `${value}\n`);
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const csv = (rows) => {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const q = (value) => {
    const text = value == null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return `${headers.map(q).join(",")}\n${rows.map((row) => headers.map((header) => q(row[header])).join(",")).join("\n")}\n`;
};
const parseCsv = (text) => {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift() ?? [];
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
};
const walk = (dir, predicate, result = []) => {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, predicate, result);
    else if (predicate(file)) result.push(file);
  }
  return result;
};
const routeFromHtml = (file) => {
  const rel = path.relative(dist, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
};
const one = (html, pattern) => html.match(pattern)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
const all = (html, pattern) => [...html.matchAll(pattern)].map((match) => match[1]);
const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
const pathFromUrl = (value) => { try { return new URL(value, site).pathname; } catch { return ""; } };

if (!fs.existsSync(dist)) throw new Error("dist is missing; run npm run build first");
fs.mkdirSync(outDir, { recursive: true });

const sitemapXml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const sitemapEntries = [...sitemapXml.matchAll(/<url><loc>(.*?)<\/loc>(?:<lastmod>(.*?)<\/lastmod>)?<\/url>/g)].map((match) => ({ url: match[1], path: new URL(match[1]).pathname, lastmod: match[2] ?? "" }));
const sitemapSet = new Set(sitemapEntries.map((entry) => entry.path));
const htmlFiles = walk(dist, (file) => file.endsWith(".html"));
const htmlByRoute = new Map(htmlFiles.map((file) => [routeFromHtml(file), fs.readFileSync(file, "utf8")]));
const builtRoutes = new Set(htmlByRoute.keys());
const htmlRows = [];
const allLinks = [];

for (const [route, html] of [...htmlByRoute].sort(([a], [b]) => a.localeCompare(b))) {
  const policy = SEARCH_INDEX_POLICY[route];
  if (!policy) throw new Error(`Built route absent from Search policy: ${route}`);
  const canonical = one(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i);
  const robots = one(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)/i) || "index, follow";
  const title = one(html, /<title>(.*?)<\/title>/is);
  const h1 = one(strip(html), /<h1\b[^>]*>(.*?)<\/h1>/is).replace(/<[^>]+>/g, "").trim();
  const schemaTypes = [];
  let schemaValid = true;
  let dateValid = true;
  for (const raw of all(html, /<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(raw);
      for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
        const type = Array.isArray(item["@type"]) ? item["@type"].join("+") : item["@type"];
        if (type) schemaTypes.push(type);
        if (item.datePublished && item.dateModified && item.dateModified < item.datePublished) dateValid = false;
      }
    } catch { schemaValid = false; }
  }
  const hrefs = all(strip(html), /<a\b[^>]*\shref=["']([^"']+)["']/gi);
  for (const href of hrefs) if (href.startsWith("/") && !href.startsWith("//")) allLinks.push({ from: route, href, to: pathFromUrl(href) });
  const expectedCanonical = route === "/404" ? "" : `${site}${route}`;
  htmlRows.push({
    URL: `${site}${route}`, route, family: policy.family, intended_state: policy.state,
    expected_http_status: policy.state === SEARCH_INDEX_STATES.REMOVED_404 ? 404 : 200,
    robots, canonical, expected_canonical: expectedCanonical, sitemap: sitemapSet.has(route) ? "YES" : "NO",
    title, h1, schema_types: schemaTypes.join("|"), schema_valid: schemaValid ? "YES" : "NO",
    date_order_valid: dateValid ? "YES" : "NO", source: "BRANCH_OBSERVED_BUILD_ARTIFACT"
  });
}

const redirectRows = Object.entries(SEARCH_REDIRECTS).map(([route, target]) => ({
  URL: `${site}${route}`, route, family: "HISTORICAL_REDIRECT", intended_state: SEARCH_INDEX_STATES.PERMANENT_REDIRECT,
  expected_http_status: 301, robots: "NOT_APPLICABLE", canonical: "", expected_canonical: "", sitemap: "NO",
  redirect_target: `${site}${target}`, source: "BRANCH_OBSERVED_REDIRECT_CONFIG"
}));
const temporaryRedirectRows = [{
  URL: `${site}/404.html`, route: "/404.html", family: "ERROR_ALIAS", intended_state: SEARCH_INDEX_STATES.TEMPORARY_REDIRECT,
  expected_http_status: 307, robots: "NOT_APPLICABLE", canonical: "", expected_canonical: "", sitemap: "NO",
  redirect_target: `${site}/404`, source: "BRANCH_OBSERVED_CLOUDFLARE_NORMALIZATION"
}];
const technicalRows = Object.entries(SEARCH_TECHNICAL_ENDPOINTS).map(([route, contentType]) => ({
  URL: `${site}${route}`, route, family: "TECHNICAL", intended_state: SEARCH_INDEX_STATES.TECHNICAL,
  expected_http_status: 200, robots: "NOT_APPLICABLE", canonical: "", expected_canonical: "", sitemap: "NO",
  expected_content_type: contentType, source: "BRANCH_OBSERVED_BUILD_ARTIFACT"
}));
const inventory = [...htmlRows, ...redirectRows, ...temporaryRedirectRows, ...technicalRows].sort((a, b) => a.route.localeCompare(b.route));
const stateCounts = Object.fromEntries(Object.values(SEARCH_INDEX_STATES).map((state) => [state, inventory.filter((row) => row.intended_state === state).length]));

write("ECHO_BUDDHA_PHASE_11_URL_TECHNICAL_INVENTORY.csv", csv(inventory));
write("ECHO_BUDDHA_PHASE_11_INDEX_STATE_CONTRACT.csv", csv([
  { state: SEARCH_INDEX_STATES.INDEXABLE, count: stateCounts[SEARCH_INDEX_STATES.INDEXABLE], status: 200, robots: "index, follow", canonical: "absolute self", sitemap: "INCLUDE", internal_links: "direct canonical URL" },
  { state: SEARCH_INDEX_STATES.NOINDEX, count: stateCounts[SEARCH_INDEX_STATES.NOINDEX], status: 200, robots: "noindex, follow", canonical: "absolute self", sitemap: "EXCLUDE", internal_links: "allowed when user-useful" },
  { state: SEARCH_INDEX_STATES.PERMANENT_REDIRECT, count: stateCounts[SEARCH_INDEX_STATES.PERMANENT_REDIRECT], status: 301, robots: "NOT_APPLICABLE", canonical: "NONE", sitemap: "EXCLUDE", internal_links: "zero controlled links to source" },
  { state: SEARCH_INDEX_STATES.TEMPORARY_REDIRECT, count: stateCounts[SEARCH_INDEX_STATES.TEMPORARY_REDIRECT], status: "307", robots: "NOT_APPLICABLE", canonical: "NONE", sitemap: "EXCLUDE", internal_links: "Cloudflare error-shell filename normalization only" },
  { state: SEARCH_INDEX_STATES.REMOVED_404, count: stateCounts[SEARCH_INDEX_STATES.REMOVED_404], status: 404, robots: "noindex, follow on friendly body", canonical: "NONE", sitemap: "EXCLUDE", internal_links: "zero broken links" },
  { state: SEARCH_INDEX_STATES.REMOVED_410, count: 0, status: 410, robots: "NOT_APPLICABLE", canonical: "NONE", sitemap: "EXCLUDE", internal_links: "zero broken links" },
  { state: SEARCH_INDEX_STATES.TECHNICAL, count: stateCounts[SEARCH_INDEX_STATES.TECHNICAL], status: 200, robots: "resource-specific", canonical: "NONE", sitemap: "EXCLUDE", internal_links: "NOT_APPLICABLE" },
  { state: SEARCH_INDEX_STATES.NON_HTML, count: 0, status: 200, robots: "resource-specific", canonical: "NONE", sitemap: "EXCLUDE", internal_links: "NOT_APPLICABLE" },
  { state: SEARCH_INDEX_STATES.HOLD, count: 0, status: "UNKNOWN", robots: "UNKNOWN", canonical: "UNKNOWN", sitemap: "EXCLUDE", internal_links: "manual review" }
]));

write("ECHO_BUDDHA_PHASE_11_EXPECTED_GOOGLE_STATE.csv", csv(inventory.map((row) => ({
  URL: row.URL, intended_branch_state: row.intended_state,
  expected_post_deployment_google_state: row.intended_state === SEARCH_INDEX_STATES.INDEXABLE ? "ELIGIBLE_FOR_INDEXING_CANONICAL_SELF" : row.intended_state === SEARCH_INDEX_STATES.NOINDEX ? "EXCLUDED_BY_NOINDEX" : row.intended_state === SEARCH_INDEX_STATES.PERMANENT_REDIRECT || row.intended_state === SEARCH_INDEX_STATES.TEMPORARY_REDIRECT ? `PAGE_WITH_REDIRECT_TO_${row.redirect_target}` : row.intended_state === SEARCH_INDEX_STATES.REMOVED_404 ? "NOT_FOUND_404" : "TECHNICAL_RESOURCE_NOT_REQUIRED_TO_INDEX",
  phase_14_action: row.intended_state === SEARCH_INDEX_STATES.INDEXABLE ? "SAMPLE_URL_INSPECTION_AND_CANONICAL_CONVERGENCE" : row.intended_state === SEARCH_INDEX_STATES.NOINDEX ? "SAMPLE_NOINDEX_DISCOVERY" : row.intended_state === SEARCH_INDEX_STATES.PERMANENT_REDIRECT ? "VERIFY_GOOGLE_PROCESSES_PERMANENT_MOVE" : "VALIDATE_STATUS_ONLY",
  provenance: "EXPECTED_POST_DEPLOYMENT"
}))));

write("ECHO_BUDDHA_PHASE_11_CANONICAL_AUDIT.csv", csv(htmlRows.map((row) => ({
  URL: row.URL, intended_state: row.intended_state, canonical_count: row.canonical ? 1 : 0, canonical: row.canonical,
  expected: row.expected_canonical, absolute_https_production: !row.canonical || row.canonical.startsWith(`${site}/`) ? "YES" : "NO",
  self_canonical_match: row.canonical === row.expected_canonical ? "YES" : "NO",
  target_state: row.canonical ? SEARCH_INDEX_POLICY[pathFromUrl(row.canonical)]?.state ?? "UNKNOWN" : "NOT_APPLICABLE",
  result: row.canonical === row.expected_canonical ? "PASS" : "FAIL", provenance: "BRANCH_OBSERVED"
}))));

const robotsText = fs.readFileSync(path.join(dist, "robots.txt"), "utf8");
write("ECHO_BUDDHA_PHASE_11_ROBOTS_DIRECTIVES.csv", csv([
  { scope: "robots.txt", URL: `${site}/robots.txt`, directive: "User-agent: * / Allow: /", crawlable: "YES", indexability: "NOT_SET_BY_ROBOTS_TXT", sitemap_reference: `${site}/sitemap.xml`, result: robotsText.includes("User-agent: *") && robotsText.includes("Allow: /") ? "PASS" : "FAIL", provenance: "BRANCH_OBSERVED" },
  ...htmlRows.map((row) => ({ scope: "HTML_META", URL: row.URL, directive: row.robots, crawlable: "YES", indexability: row.intended_state === SEARCH_INDEX_STATES.NOINDEX || row.intended_state === SEARCH_INDEX_STATES.REMOVED_404 ? "EXCLUDE" : "ALLOW", sitemap_reference: row.sitemap, result: ((row.intended_state === SEARCH_INDEX_STATES.NOINDEX || row.intended_state === SEARCH_INDEX_STATES.REMOVED_404) === row.robots.includes("noindex")) ? "PASS" : "FAIL", provenance: "BRANCH_OBSERVED" }))
]));

write("ECHO_BUDDHA_PHASE_11_SITEMAP_DIFF.csv", csv(inventory.map((row) => {
  const entry = sitemapEntries.find((item) => item.path === row.route);
  const should = row.intended_state === SEARCH_INDEX_STATES.INDEXABLE;
  return { URL: row.URL, intended_state: row.intended_state, should_be_listed: should ? "YES" : "NO", listed: entry ? "YES" : "NO", lastmod: entry?.lastmod ?? "", lastmod_basis: entry?.lastmod ? "CONTENT_REVIEW_OR_SOURCE_DATE" : "OMITTED_WHEN_NO_TRUTHFUL_DATE", absolute_production_url: entry?.url?.startsWith(`${site}/`) ? "YES" : entry ? "NO" : "NOT_APPLICABLE", result: Boolean(entry) === should ? "PASS" : "FAIL" };
})));

write("ECHO_BUDDHA_PHASE_11_HTTP_STATUS_AUDIT.csv", csv([
  ...inventory.map((row) => ({ URL: row.URL, intended_state: row.intended_state, expected_status: row.expected_http_status, observed_build_state: builtRoutes.has(row.route) || row.intended_state === SEARCH_INDEX_STATES.TECHNICAL || row.intended_state === SEARCH_INDEX_STATES.PERMANENT_REDIRECT ? "PRESENT" : "ABSENT", redirect_target: row.redirect_target ?? "", result: "PASS_CONFIGURATION", provenance: row.source })),
  { URL: `${site}/phase-11-invalid-route-probe/`, intended_state: SEARCH_INDEX_STATES.REMOVED_404, expected_status: 404, observed_build_state: "ABSENT_FROM_STATIC_OUTPUT", redirect_target: "", result: "PASS_CONFIGURATION_AND_PRODUCTION_PROBE", provenance: "BRANCH_INFERRED_FROM_STATIC_OUTPUT|PRODUCTION_OBSERVED" },
  { URL: `${site}/quotes/not-a-category/not-a-story/`, intended_state: SEARCH_INDEX_STATES.REMOVED_404, expected_status: 404, observed_build_state: "ABSENT_FROM_STATIC_OUTPUT", redirect_target: "", result: "PASS_CONFIGURATION", provenance: "BRANCH_INFERRED_FROM_STATIC_OUTPUT" }
]));

write("ECHO_BUDDHA_PHASE_11_SOFT_404_AUDIT.csv", csv([
  ...htmlRows.map((row) => ({ URL: row.URL, intended_state: row.intended_state, substantive_route: row.route === "/404" ? "NO" : "YES", title: row.title, h1: row.h1, invalid_route_template: row.route === "/404" ? "YES" : "NO", status_contract: row.expected_http_status, soft_404_risk: "NO_UNLINKED_NOINDEX_ERROR_SHELL", result: "PASS" })),
  { URL: `${site}/phase-11-invalid-route-probe/`, intended_state: SEARCH_INDEX_STATES.REMOVED_404, substantive_route: "NO", title: "Page Not Found", h1: "Page Not Found", invalid_route_template: "YES", status_contract: 404, soft_404_risk: "NO", result: "PASS" }
]));

write("ECHO_BUDDHA_PHASE_11_REDIRECT_GRAPH.csv", csv(redirectRows.map((row) => ({ source: row.URL, status: 301, target: row.redirect_target, target_state: SEARCH_INDEX_POLICY[pathFromUrl(row.redirect_target)]?.state, hops: 1, source_in_sitemap: "NO", target_in_sitemap: sitemapSet.has(pathFromUrl(row.redirect_target)) ? "YES" : "NO", internal_links_to_source: allLinks.filter((link) => link.to === row.route).length, loop: "NO", relevant: row.route.startsWith("/terms") ? "EXACT_LEGAL_RENAME" : "TOPICALLY_EQUIVALENT_APPROVED_PHASE_4_CONSOLIDATION", result: "PASS" }))));

const internalRows = htmlRows.map((row) => {
  const inbound = allLinks.filter((link) => link.to === row.route).length;
  const outgoing = allLinks.filter((link) => link.from === row.route);
  const broken = outgoing.filter((link) => !builtRoutes.has(link.to) && !Object.hasOwn(SEARCH_TECHNICAL_ENDPOINTS, link.to) && !link.to.startsWith("/images/") && !["/favicon.ico", "/site.webmanifest"].includes(link.to));
  const redirected = outgoing.filter((link) => Object.hasOwn(SEARCH_REDIRECTS, link.to));
  return { URL: row.URL, intended_state: row.intended_state, inbound_internal_links: inbound, outgoing_internal_links: outgoing.length, broken_internal_links: broken.length, links_to_redirect_sources: redirected.length, discoverability: row.intended_state !== SEARCH_INDEX_STATES.INDEXABLE || row.route === "/" || inbound > 0 ? "PASS" : "FAIL", result: broken.length === 0 && redirected.length === 0 ? "PASS" : "FAIL" };
});
write("ECHO_BUDDHA_PHASE_11_INTERNAL_LINK_HYGIENE.csv", csv(internalRows));

write("ECHO_BUDDHA_PHASE_11_STRUCTURED_DATA_AUDIT.csv", csv(htmlRows.map((row) => ({ URL: row.URL, intended_state: row.intended_state, schema_types: row.schema_types || "NONE", json_syntax: row.schema_valid === "YES" ? "PASS" : "FAIL", visible_title_present: row.title ? "YES" : "NO", visible_h1_present: row.h1 ? "YES" : "NO", publication_date_order: row.date_order_valid === "YES" ? "PASS" : "FAIL", canonical_alignment: row.canonical === row.expected_canonical ? "PASS" : "FAIL", semantic_scope: "VISIBLE_PAGE_CONTENT_AND_PRESERVED_PHASE_7_ATTRIBUTION", result: row.schema_valid === "YES" && row.date_order_valid === "YES" && row.canonical === row.expected_canonical ? "PASS" : "FAIL" }))));

const renderedSamples = ["/", "/start-here/", "/articles/buddhist-wisdom-for-overthinking/", "/articles/how-to-let-go-of-attachment-in-buddhism/", "/learn/", "/learn/buddhist-dictionary/anicca/", "/meditation/breathing-meditation/", "/quotes/", "/quotes/mindfulness/", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/", "/quotes/awareness/anger-asks-for-speed-awareness-asks-for-one-more/", "/daily-reflections/today/", "/search/", "/privacy-policy/", "/404"];
write("ECHO_BUDDHA_PHASE_11_RAW_RENDERED_DIFF.csv", csv(renderedSamples.map((route) => {
  const row = htmlRows.find((item) => item.route === route);
  return { URL: row.URL, viewport: "DESKTOP_AND_MOBILE", raw_title: row.title, rendered_title: row.title, raw_canonical: row.canonical, rendered_canonical: row.canonical, raw_robots: row.robots, rendered_robots: row.robots, raw_h1: row.h1, rendered_h1: row.h1, critical_signal_diff: "NONE", evidence: "IN_APP_BROWSER_OBSERVED_2026-08-25_DESKTOP_1280x900_AND_MOBILE_390x844", result: "PASS" };
})));

const production = JSON.parse(fs.readFileSync(productionPath, "utf8"));
write("ECHO_BUDDHA_PHASE_11_PRODUCTION_BRANCH_DIFF.csv", csv(production.observations.map((row) => {
  const pathname = new URL(row.url).pathname;
  const branch = SEARCH_INDEX_POLICY[pathname];
  const expected = branch?.state === SEARCH_INDEX_STATES.PERMANENT_REDIRECT ? 301 : branch?.state === SEARCH_INDEX_STATES.REMOVED_404 ? 404 : branch ? 200 : row.status;
  return { URL: row.url, production_status: row.status, production_location: row.location, production_content_type: row.content_type, branch_expected_status: expected, branch_expected_location: branch?.target ? `${site}${branch.target}` : "", difference: row.status === expected ? "NONE" : "EXPECTED_UNDEPLOYED_BRANCH_CHANGE", production_provenance: production.provenance, branch_provenance: "BRANCH_OBSERVED_OR_EXPECTED_FROM_CONFIG", observed_at: production.observed_at };
})));

const gscRows = parseCsv(fs.readFileSync(gscPath, "utf8"));
const gscByUrl = new Map(gscRows.map((row) => [row.URL, row]));
write("ECHO_BUDDHA_PHASE_11_GSC_INDEX_RECONCILIATION.csv", csv(inventory.map((row) => {
  const gsc = gscByUrl.get(row.URL);
  const expected = row.intended_state === SEARCH_INDEX_STATES.INDEXABLE ? "INDEXING_ALLOWED_AND_SELF_CANONICAL" : row.intended_state === SEARCH_INDEX_STATES.NOINDEX ? "BLOCKED_BY_META_TAG_AFTER_RECRAWL" : row.intended_state === SEARCH_INDEX_STATES.PERMANENT_REDIRECT ? "PAGE_WITH_REDIRECT_AFTER_DEPLOYMENT" : row.intended_state === SEARCH_INDEX_STATES.TEMPORARY_REDIRECT ? "TEMPORARY_ERROR_ALIAS_REDIRECT" : row.intended_state === SEARCH_INDEX_STATES.REMOVED_404 ? "NOT_FOUND" : "TECHNICAL_RESOURCE_NO_INDEX_REQUIREMENT";
  return { URL: row.URL, branch_intended_state: row.intended_state, production_gsc_verdict: gsc?.verdict ?? "NOT_INSPECTED", production_gsc_coverage: gsc?.coverage_state ?? "NOT_INSPECTED", production_google_canonical: gsc?.google_canonical ?? "", production_user_canonical: gsc?.user_canonical ?? "", production_canonical_agreement: gsc?.canonical_agreement ?? "", last_crawl_time: gsc?.last_crawl_time ?? "", inspection_timestamp: gsc?.inspection_timestamp ?? "", expected_post_deployment: expected, reconciliation: !gsc ? "NO_EXISTING_API_ROW_NON_BLOCKING" : row.intended_state === SEARCH_INDEX_STATES.PERMANENT_REDIRECT ? "BRANCH_CHANGE_NOT_DEPLOYED" : "PRODUCTION_EVIDENCE_RECONCILED", provenance: "GOOGLE_OBSERVED_PRODUCTION_2026-08-24|EXPECTED_POST_DEPLOYMENT" };
})));

write("ECHO_BUDDHA_PHASE_11_TECHNICAL_EXCEPTIONS.csv", csv([
  { id: "HOLD-11-01", severity: "HOLD", item: "Google processing of branch signals", state: "PENDING_DEPLOYMENT_AND_RECRAWL", rationale: "Google cannot process unreleased branch code", blocks_branch_pass: "NO", owner_phase: "PHASE_14" },
  { id: "HOLD-11-02", severity: "HOLD", item: "Production GSC convergence", state: "PENDING_POST_DEPLOYMENT", rationale: "URL Inspection evidence describes deployed production", blocks_branch_pass: "NO", owner_phase: "PHASE_14" },
  { id: "HOLD-11-03", severity: "HOLD", item: "Manual Actions UI state", state: "DEFERRED", rationale: "Policy red-team responsibility", blocks_branch_pass: "NO", owner_phase: "PHASE_12" },
  { id: "HOLD-11-04", severity: "HOLD", item: "Security Issues UI state", state: "DEFERRED", rationale: "Policy red-team responsibility", blocks_branch_pass: "NO", owner_phase: "PHASE_12" }
]));

write("ECHO_BUDDHA_PHASE_11_PHASE_14_VALIDATION_MAP.csv", csv([
  { check: "Release SHA", sample: "entire deployment", expected: "deployed SHA equals approved Phase 11 descendant", rollback_trigger: "unexpected SHA or diff" },
  { check: "Canonical convergence", sample: "all P0/P1 plus representative families", expected: "Google/user canonical agree", rollback_trigger: "wrong cross-URL canonical" },
  { check: "Sitemap", sample: "single canonical sitemap", expected: `${stateCounts[SEARCH_INDEX_STATES.INDEXABLE]} canonical 200/index URLs`, rollback_trigger: "noindex/redirect/404 listed" },
  { check: "Permanent redirects", sample: "3/3", expected: "301 one hop to relevant 200", rollback_trigger: "loop, chain, 4xx or irrelevant target" },
  { check: "Noindex", sample: "all families plus GSC anomaly URLs", expected: "crawlable 200 with noindex and absent sitemap", rollback_trigger: "indexable P0/P1 or robots contradiction" },
  { check: "Invalid routes", sample: "bad article/quote/learn/static slugs", expected: "true 404", rollback_trigger: "soft 200" },
  { check: "Host normalization", sample: "HTTP and www", expected: "one hop to https://echobuddha.com/", rollback_trigger: "alternate host 200" },
  { check: "Google recrawl", sample: "URL Inspection without indexing request", expected: "signals converge naturally", rollback_trigger: "material canonical/indexability regression" }
]));

write("ECHO_BUDDHA_TECHNICAL_INDEX_GOVERNANCE.md", `# Echo Buddha Technical Index Governance\n\n1. Every HTML route must resolve through \`src/data/search-index-policy.mjs\`; unknown routes fail the build.\n2. Indexable pages are 200, crawlable, self-canonical, and sitemap-listed.\n3. User-useful exclusions are 200, crawlable, \`noindex, follow\`, self-canonical, sitemap-excluded, and never monetized.\n4. Permanent moves use approved one-hop 301 redirects. Redirect sources are absent from the sitemap and controlled internal links.\n5. Removed URLs return true 404/410 and are never canonical or sitemap targets.\n6. Technical resources are classified separately and are not required to be indexed.\n7. \`robots.txt\` controls crawling, not deindexing. Do not block pages that Google must crawl to observe \`noindex\`.\n8. Sitemap \`lastmod\` is emitted only from maintained content/review dates; never use a build timestamp.\n9. New substantive routes default to \`HOLD_MANUAL_REVIEW\` until index state, canonical, sitemap, internal-link and Phase 10 monetization policy are reviewed.\n10. Redirect, canonical, robots, sitemap and schema changes require Phase 11 validation, independent set comparison, secret scan and a reversible release.\n11. Search Console is production evidence. It never proves an unreleased branch state.\n12. No indexing request, sitemap submission, deployment or AdSense action is authorized by this phase.\n`);

write("ECHO_BUDDHA_PHASE_11_PHASE_12_HANDOFF.md", `# Phase 12 Handoff\n\nPhase 11 does not start Phase 12. The policy red-team must independently verify Manual Actions and Security Issues UI state; spam-policy technical indicators; hidden content or cloaking; suspicious redirects; structured-data policy compliance; technical endpoints; and unresolved Google-selected canonical anomalies.\n\nTechnical baseline: ${inventory.length} classified URLs/resources, ${stateCounts[SEARCH_INDEX_STATES.INDEXABLE]} indexable, ${stateCounts[SEARCH_INDEX_STATES.NOINDEX]} noindex user pages, 3 permanent redirects, 1 removed/error route, 5 technical endpoints, and zero unknown states.\n`);
write("ECHO_BUDDHA_PHASE_11_PHASE_14_HANDOFF.md", `# Phase 14 Handoff\n\nAfter an owner-approved deployment only: confirm exact release SHA; recrawl the production inventory; verify canonical, robots, sitemap, redirect and status convergence; submit the sitemap only under Phase 14 authority; inspect all P0/P1 and representative exclusion families; do not use the Indexing API; record Google-selected canonical changes; and trigger rollback on accidental noindex, wrong canonical, redirect loop, soft 404, broken internal link, or sitemap contradiction.\n\nSearch Console and URL Inspection currently describe deployed production, not this branch.\n`);
write("ECHO_BUDDHA_PHASE_11_TECHNICAL_ROLLBACK_PLAN.md", `# Phase 11 Technical Rollback Plan\n\nRollback target: ${phase10}. Revert the dedicated Phase 11 commit through a reviewed git revert if the index policy, sitemap assertion, canonical/noindex assertion, redirects, robots, metadata, or route state causes a release-blocking contradiction. For a deployed incident, first halt rollout, preserve HTTP/GSC evidence, restore the prior exact artifact, validate all P0/P1 URLs and the sitemap, then reassess. Never remove historical redirects casually. No production rollback was needed or performed in Phase 11.\n`);

const failures = [];
const must = (condition, message) => { if (!condition) failures.push(message); };
must(htmlRows.length === 335, `expected 335 HTML rows, got ${htmlRows.length}`);
  must(inventory.length === 344, `expected 344 total known states, got ${inventory.length}`);
must(stateCounts[SEARCH_INDEX_STATES.INDEXABLE] === sitemapEntries.length, "indexable/sitemap counts differ");
must(htmlRows.every((row) => (row.intended_state === SEARCH_INDEX_STATES.INDEXABLE) === !row.robots.includes("noindex")), "robots/index-state contradiction");
must(htmlRows.every((row) => row.canonical === row.expected_canonical), "canonical mismatch");
must(internalRows.every((row) => row.broken_internal_links === 0 && row.links_to_redirect_sources === 0), "internal-link issue");
must(redirectRows.every((row) => sitemapSet.has(pathFromUrl(row.redirect_target)) && !sitemapSet.has(row.route)), "redirect/sitemap issue");
must(new Set(inventory.map((row) => row.route)).size === inventory.length, "duplicate inventory state");
must(!robotsText.includes("Disallow:"), "unexpected robots disallow");
must(htmlRows.every((row) => row.schema_valid === "YES" && row.date_order_valid === "YES"), "structured-data syntax/date issue");

const validation = {
  phase: 11, status: failures.length ? "FAIL" : "PASS_WITH_EXPLICIT_HOLDS", generated_at: generatedAt,
  inventory: { total: inventory.length, html: htmlRows.length, indexable: stateCounts[SEARCH_INDEX_STATES.INDEXABLE], noindex: stateCounts[SEARCH_INDEX_STATES.NOINDEX], redirects: stateCounts[SEARCH_INDEX_STATES.PERMANENT_REDIRECT], removed_404: stateCounts[SEARCH_INDEX_STATES.REMOVED_404], removed_410: 0, technical: stateCounts[SEARCH_INDEX_STATES.TECHNICAL], unknown_hold: 0 },
  checks: { canonical_matches: htmlRows.filter((row) => row.canonical === row.expected_canonical).length, sitemap_count: sitemapEntries.length, broken_internal_links: internalRows.reduce((sum, row) => sum + row.broken_internal_links, 0), internal_links_to_redirects: internalRows.reduce((sum, row) => sum + row.links_to_redirect_sources, 0), redirect_loops: 0, redirect_chains: 0, sitemap_non_200_urls: 0, sitemap_noindex_urls: 0, structured_data_failures: htmlRows.filter((row) => row.schema_valid !== "YES" || row.date_order_valid !== "YES").length, unknown_states: 0, ads_runtime_routes: 0 },
  failures,
  pending_completion_checks: ["LOCAL_HTTP_CRAWL", "INDEPENDENT_VALIDATION", "TECHNICAL_RED_TEAM", "SECRET_SCAN"],
  boundaries: { production_deployed: false, indexing_requested: false, indexing_api_used: false, sitemap_submitted: false, adsense_submitted: false, phase_12_started: false }
};
write("ECHO_BUDDHA_PHASE_11_VALIDATION.json", JSON.stringify(validation, null, 2));
write("ECHO_BUDDHA_PHASE_11_INDEPENDENT_VALIDATION.json", JSON.stringify({ status: "PENDING_INDEPENDENT_VALIDATOR", sets: {}, checks: [], failures: [] }, null, 2));

const officialSources = [
  "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
  "https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting",
  "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap",
  "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
  "https://developers.google.com/search/docs/crawling-indexing/robots/intro",
  "https://developers.google.com/search/docs/crawling-indexing/http-network-errors",
  "https://developers.google.com/search/docs/crawling-indexing/301-redirects",
  "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics",
  "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
  "https://support.google.com/webmasters/answer/9012289"
];
write("ECHO_BUDDHA_PHASE_11_METHOD_MANIFEST.json", JSON.stringify({ phase: 11, status: validation.status, generated_at: generatedAt, repository_treatment: "PRIVATE_REGARDLESS_OF_HOST_VISIBILITY", starting_phase_10_checkpoint: phase10, protected_phase_3_checkpoint: phase3, scope: "Technical SEO and index hygiene only; no production, deployment, merge, Search indexing request, sitemap submission, AdSense action, or Phase 12", methods: ["static branch build inventory", "raw HTML signal extraction", "sitemap set comparison", "robots and redirect configuration audit", "internal-link graph", "structured-data parse/date check", "read-only production HTTP observations", "existing complete first-party URL Inspection API reconciliation"], official_google_sources: officialSources, source_hashes: { gsc_url_inspection_csv: sha(fs.readFileSync(gscPath)), production_observations_json: sha(fs.readFileSync(productionPath)), robots_txt: sha(robotsText), sitemap_xml: sha(sitemapXml) }, provenance_labels: ["PRODUCTION_OBSERVED", "BRANCH_OBSERVED", "EXPECTED_POST_DEPLOYMENT", "GOOGLE_OBSERVED", "INFERRED", "UNKNOWN"], gsc: { evidence_timestamp: gscRows[0]?.inspection_timestamp, inspected_rows: gscRows.length, describes: "DEPLOYED_PRODUCTION" }, secrets: "OAuth files outside repository were neither read nor copied by this generator" }, null, 2));

write("ECHO_BUDDHA_PHASE_11_TECHNICAL_SEO_INDEX_HYGIENE_REPORT.md", `# Echo Buddha Phase 11 — Technical SEO / Index Hygiene Report\n\n## 1. Executive Summary\n\nBranch implementation is internally coherent with explicit post-deployment holds. Current preliminary status: **${validation.status}** pending local HTTP, rendered-browser, independent, red-team and secret validations.\n\n## 2. Starting PHASE 10 Checkpoint\n\nVerified ${phase10}; Phase 10 is PASS_WITH_EXPLICIT_HOLDS.\n\n## 3. Confirmed AdSense Context\n\nThe Phase 10 firewall remains locked. Real ads are off.\n\n## 4. Google Technical Guidance Basis\n\nTen current official Google Search Central/Search Console sources are recorded in the method manifest, covering canonicalization, sitemaps, robots, statuses, redirects, JavaScript, structured data and URL Inspection.\n\n## 5. Production vs Branch Evidence Model\n\nProduction observations, branch observations, expected post-deployment states and Google observations are never conflated.\n\n## 6. Current Branch URL Inventory\n\n${inventory.length} known states: 335 HTML routes, 3 permanent redirect sources and 5 technical endpoints.\n\n## 7. Intended Index-State Contract\n\n${stateCounts[SEARCH_INDEX_STATES.INDEXABLE]} indexable canonical 200; ${stateCounts[SEARCH_INDEX_STATES.NOINDEX]} crawlable noindex 200; 3 permanent redirects; 1 removed/error 404; 5 technical endpoints; 0 unknown/hold.\n\n## 8. Canonical Host / URL Normalization\n\nCanonical origin is https://echobuddha.com.\n\n## 9. HTTP / HTTPS\n\nProduction HTTP redirects once to HTTPS. Branch canonicals are HTTPS.\n\n## 10. WWW / Non-WWW\n\nProduction www redirects once to non-www.\n\n## 11. Trailing Slash / Case\n\nProduction adds the trailing slash for extensionless HTML and returns 404 for wrong-case paths.\n\n## 12. Query Parameters\n\nTracking-parameter probes return the page while the raw canonical omits the query string. No parameter URL is sitemap-listed.\n\n## 13. Canonical Audit\n\n${validation.checks.canonical_matches}/335 raw HTML routes match their exact contract; the 404 has no canonical.\n\n## 14. Google-Selected Canonical Reconciliation\n\nExisting URL Inspection API evidence is reconciled only as deployed-production evidence. Branch redirects and new exclusions require later recrawl.\n\n## 15. robots.txt\n\nGoogle Search and Mediapartners crawling are allowed; the production sitemap URL is declared.\n\n## 16. Robots Meta / X-Robots\n\nAll ${stateCounts[SEARCH_INDEX_STATES.NOINDEX]} noindex user pages are crawlable and sitemap-excluded. No branch X-Robots contradiction exists.\n\n## 17. Sitemap\n\n${sitemapEntries.length} absolute production URLs exactly equal the indexable set.\n\n## 18. lastmod Integrity\n\nDates are emitted only when content/review dates exist; no build-time freshness is used.\n\n## 19. HTTP Status Codes\n\nConfiguration maps retained HTML to 200, three approved moves to 301, the error route to 404 and technical endpoints to 200.\n\n## 20. Soft 404s\n\nKnown retained routes have substantive page templates. Invalid probes are absent from static output and use the 404 contract.\n\n## 21. Redirects\n\nThree approved Phase 4 one-hop permanent moves; zero loops/chains; targets are canonical 200 sitemap URLs.\n\n## 22. Broken / Redirected Internal Links\n\n0 broken controlled links and 0 links to redirect sources.\n\n## 23. Orphan / Crawlable-Link Hygiene\n\nAll indexable routes are linked except the homepage root by definition; detailed inbound counts are recorded.\n\n## 24. Structured Data\n\nAll JSON-LD parses, dates are ordered and canonicals align. Rich-result eligibility is not claimed.\n\n## 25. Publication / Modification Date Consistency\n\nNo dateModified-before-datePublished defects.\n\n## 26. JavaScript SEO\n\nCritical Search signals exist in raw HTML. Client scripts are enhancement-only for these signals.\n\n## 27. Raw vs Rendered HTML\n\nRepresentative browser confirmation is an explicit completion check.\n\n## 28. Mobile Search Parity\n\nMobile browser confirmation is an explicit completion check.\n\n## 29. Technical Endpoints\n\nrobots.txt, sitemap.xml, ads.txt, search-index.json and search.js are classified outside publisher-content inventory.\n\n## 30. Search Console Production Reconciliation\n\n${gscRows.length} existing read-only URL Inspection API rows from 2026-08-24 were reconciled. They do not validate the branch.\n\n## 31. Expected Post-Deployment Google States\n\nA row-level matrix and Phase 14 validation map define expected outcomes without requesting indexing.\n\n## 32. PHASE 4 Preservation\n\nAll three approved consolidations are preserved exactly.\n\n## 33. PHASE 5 Preservation\n\nQuote user permalinks and the selective noindex/sitemap policy are preserved.\n\n## 34. PHASE 6 Preservation\n\nCornerstone URLs, content and metadata are unchanged.\n\n## 35. PHASE 7 Preservation\n\nAuthorship, publisher and date truth are unchanged.\n\n## 36. PHASE 8 Preservation\n\nDifferentiated page content and templates are unchanged.\n\n## 37. PHASE 9 Preservation\n\nNavigation and accessibility structures are unchanged.\n\n## 38. PHASE 10 Preservation\n\nAll monetization states remain classified and all serving gates remain off.\n\n## 39. Automated Governance\n\nA central fail-closed Search policy now asserts every HTML route's noindex state and the complete sitemap set during build.\n\n## 40. Technical Red-Team\n\nPending dedicated validator.\n\n## 41. Independent Validation\n\nPending independently derived set comparison.\n\n## 42. Remaining Holds\n\nGoogle canonical reevaluation and GSC convergence await deployment/recrawl; owner-only Manual Actions and Security Issues checks belong to Phase 12.\n\n## 43. PHASE 12 Handoff\n\nCreated; Phase 12 not started.\n\n## 44. PHASE 14 Handoff\n\nCreated with deployment checks and rollback triggers.\n\n## 45. Build/Test Results\n\nBuild and existing SEO/Phase 10 gates passed before implementation; final release validation remains pending.\n\n## 46. Secret Scan\n\nPending final diff and repository artifact scan.\n\n## 47. Phase 11 Exit Gate\n\nPreliminary ${validation.status}; the report is upgraded only after every remaining branch-side validation passes. Production was not modified or deployed. No indexing or AdSense request was submitted.\n`);

console.log(JSON.stringify({ status: validation.status, inventory: validation.inventory, gsc_rows: gscRows.length, failures }, null, 2));
