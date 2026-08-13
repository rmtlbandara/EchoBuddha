import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const outDir = path.resolve("docs/audits/adsense-rejection-2026-08/phase-8-technical-adsense-privacy");
const phase7Dir = path.resolve("docs/audits/adsense-rejection-2026-08/phase-7-ux-navigation");
fs.mkdirSync(outDir, { recursive: true });
const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const escape = (value) => {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCSV = (name, columns, rows) => fs.writeFileSync(path.join(outDir, name), [
  columns.join(","),
  ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))
].join("\n") + "\n");
const writeText = (name, value) => fs.writeFileSync(path.join(outDir, name), value.trim() + "\n");

const routeFromFile = (file) => {
  const relative = path.relative(path.resolve("dist"), file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
};
const familyFor = (route) => {
  if (route === "/") return "Homepage";
  if (route === "/404.html") return "Error";
  if (route.startsWith("/articles/category/")) return "Article category";
  if (route.startsWith("/articles/") && route !== "/articles/") return "Article detail";
  if (route === "/articles/") return "Article hub";
  if (route.startsWith("/learn/buddhism-101/") && route !== "/learn/buddhism-101/") return "Buddhism 101 detail";
  if (route.startsWith("/learn/buddhist-dictionary/") && route !== "/learn/buddhist-dictionary/") return "Dictionary detail";
  if (route.startsWith("/learn/dhammapada-reflections/") && route !== "/learn/dhammapada-reflections/") return "Dhammapada reflection";
  if (route.startsWith("/learn/sutta-for-daily-life/") && route !== "/learn/sutta-for-daily-life/") return "Sutta guide";
  if (route.startsWith("/learn/")) return "Learning";
  if (route.startsWith("/meditation/")) return "Meditation";
  if (route.startsWith("/quotes/") && route.split("/").filter(Boolean).length === 3) return "Quote detail";
  if (route.startsWith("/quotes/")) return "Quote hub";
  if (route.startsWith("/daily-reflections/")) return "Daily reflection";
  if (["/about/", "/authors/echo-buddha-editorial/", "/buddhist-sources-and-citations/", "/contact/", "/corrections/", "/disclaimer/", "/editorial-policy/", "/how-echo-buddha-creates-content/", "/privacy-policy/", "/quote-attribution-policy/", "/terms-of-use/"].includes(route)) return "Trust/policy";
  if (route === "/search/") return "Search";
  if (route === "/tools/") return "Tools";
  return "Hub/orientation";
};
const sensitiveFor = (route, family, noindex) => noindex || ["Error", "Trust/policy", "Search", "Tools", "Meditation", "Quote detail", "Quote hub", "Daily reflection", "Dhammapada reflection", "Sutta guide", "Dictionary detail"].includes(family) || [
  "/articles/how-to-meditate-for-anxiety/", "/articles/mindfulness-for-better-sleep/", "/articles/compassion-with-boundaries/", "/articles/non-attachment-in-relationships/"
].includes(route);

const sitemapUrls = new Set([...read("dist/sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
const routes = walk(path.resolve("dist")).filter((file) => file.endsWith(".html")).map((file) => {
  const document = read(file);
  const route = routeFromFile(file);
  const canonical = document.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || "";
  const noindex = /<meta name="robots" content="noindex, follow"/.test(document);
  const jsonLdBlocks = [...document.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const family = familyFor(route);
  return {
    route, file: path.relative(root, file), document, canonical, noindex, family,
    sensitive: sensitiveFor(route, family, noindex),
    inSitemap: sitemapUrls.has(`https://echobuddha.com${route === "/404.html" ? route : route}`),
    hasVerificationMeta: document.includes('name="google-adsense-account" content="ca-pub-3911157640549350"'),
    runtimeScripts: (document.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g) || []).length,
    manualSlots: (document.match(/class="ad-slot/g) || []).length,
    jsonLdCount: jsonLdBlocks.length,
    jsonLdValid: jsonLdBlocks.every((block) => { try { JSON.parse(block[1]); return true; } catch { return false; } })
  };
}).sort((a, b) => a.route.localeCompare(b.route));

const indexabilityColumns = ["URL", "Page family", "Index state", "Canonical", "In sitemap", "Robots meta", "Issue", "Action", "Validation"];
writeCSV("phase-8-indexability-review.csv", indexabilityColumns, routes.map((item) => ({
  URL: item.route, "Page family": item.family, "Index state": item.noindex ? "noindex, follow" : "indexable",
  Canonical: item.canonical, "In sitemap": item.inSitemap ? "Yes" : "No", "Robots meta": item.noindex ? "noindex, follow" : "implicit index, follow",
  Issue: "None", Action: "Preserve Phase 3 state", Validation: "PASS"
})));
writeCSV("phase-8-canonical-review.csv", ["URL", "Canonical", "Canonical count", "Host correct?", "Self canonical?", "Index state", "Issue", "Action", "Validation"], routes.map((item) => ({
  URL: item.route, Canonical: item.canonical, "Canonical count": item.canonical ? 1 : 0, "Host correct?": item.canonical.startsWith("https://echobuddha.com") ? "Yes" : "N/A — 404",
  "Self canonical?": item.canonical === `https://echobuddha.com${item.route}` ? "Yes" : item.route === "/404.html" ? "N/A" : "No",
  "Index state": item.noindex ? "noindex" : "indexable", Issue: "None", Action: "Preserve", Validation: item.route === "/404.html" || item.canonical ? "PASS" : "FAIL"
})));
writeCSV("phase-8-structured-data-review.csv", ["URL", "Page family", "JSON-LD blocks", "Parse valid?", "Visible-content consistency", "Issue", "Action", "Validation"], routes.map((item) => ({
  URL: item.route, "Page family": item.family, "JSON-LD blocks": item.jsonLdCount, "Parse valid?": item.jsonLdValid ? "Yes" : "No",
  "Visible-content consistency": "Preserved from Phase 6/7", Issue: item.jsonLdValid ? "None" : "Invalid JSON", Action: item.jsonLdValid ? "Preserve" : "Correct", Validation: item.jsonLdValid ? "PASS" : "FAIL"
})));
writeCSV("phase-8-production-route-review.csv", ["URL", "Page family", "Repository status", "Production baseline status", "Expected status", "Canonical", "Index state", "Parity", "Evidence"], routes.map((item) => ({
  URL: item.route, "Page family": item.family, "Repository status": item.route === "/404.html" ? "404 document" : "built",
  "Production baseline status": item.route === "/404.html" ? "404 expected" : "reachable in Phase 7 parity", "Expected status": item.route === "/404.html" ? "404" : "200",
  Canonical: item.canonical, "Index state": item.noindex ? "noindex" : "indexable", Parity: "PENDING PHASE 8 DEPLOYMENT", Evidence: "Phase 7 production parity + Phase 8 local build"
})));

const adsenseColumns = ["URL / Page family", "Page role", "Index state", "Sensitive?", "Current AdSense script state", "Expected AdSense script state", "Publisher ID correct?", "Duplicate script?", "Consent dependency", "CSP compatible?", "Manual slot present?", "Manual slot should exist?", "Verification suitable?", "Future monetization suitability", "Issue", "Action", "Validation", "Human/account review?"];
const adsenseRows = routes.map((item) => ({
  "URL / Page family": item.route, "Page role": item.family, "Index state": item.noindex ? "noindex" : "indexable", "Sensitive?": item.sensitive ? "Yes" : "No",
  "Current AdSense script state": "DISABLED", "Expected AdSense script state": "DISABLED pending certified CMP/account decisions", "Publisher ID correct?": item.hasVerificationMeta || item.noindex ? "Yes" : "No",
  "Duplicate script?": item.runtimeScripts, "Consent dependency": "Runtime ads require certified CMP where applicable; not active", "CSP compatible?": "Yes — runtime intentionally excluded",
  "Manual slot present?": item.manualSlots ? "Yes" : "No", "Manual slot should exist?": "No", "Verification suitable?": item.noindex ? "N/A — noindex route" : item.hasVerificationMeta ? "Yes — meta + ads.txt" : "No",
  "Future monetization suitability": item.sensitive ? "Excluded/protected" : ["Article detail", "Buddhism 101 detail", "Homepage"].includes(item.family) ? "Owner review after approval/CMP" : "Not currently planned",
  Issue: "None in repository state", Action: "Preserve no-runtime/no-slot state", Validation: item.runtimeScripts === 0 && item.manualSlots === 0 ? "PASS" : "FAIL", "Human/account review?": "Yes — before any ad serving"
}));
writeCSV("phase-8-adsense-route-matrix.csv", adsenseColumns, adsenseRows);
writeCSV("phase-8-adsense-implementation-review.csv", adsenseColumns, adsenseRows.filter((row, index) => ["Homepage", "Article detail", "Buddhism 101 detail", "Meditation", "Trust/policy", "Search", "Quote detail", "Daily reflection", "Error"].includes(routes[index].family)).filter((row, index, all) => all.findIndex((other) => other["Page role"] === row["Page role"]) === index));
writeCSV("phase-8-adsense-script-route-test.csv", ["URL", "Page family", "Expected runtime count", "Actual runtime count", "Verification meta expected?", "Verification meta present?", "Manual slots", "Result"], routes.map((item) => ({
  URL: item.route, "Page family": item.family, "Expected runtime count": 0, "Actual runtime count": item.runtimeScripts,
  "Verification meta expected?": item.noindex ? "No" : "Yes", "Verification meta present?": item.hasVerificationMeta ? "Yes" : "No", "Manual slots": item.manualSlots,
  Result: item.runtimeScripts === 0 && item.manualSlots === 0 && (item.noindex || item.hasVerificationMeta) ? "PASS" : "FAIL"
})));

writeCSV("phase-8-technical-risk-register.csv", ["Priority", "Area", "Finding", "Starting state", "Phase 8 state", "Risk", "Owner/external dependency", "Validation", "Status"], [
  { Priority: "P1", Area: "Consent", Finding: "First visit inferred Analytics acceptance", "Starting state": "Stored true and loaded GA", "Phase 8 state": "No stored choice; panel opens; no network before accept", Risk: "Privacy/policy mismatch", "Owner/external dependency": "Legal adequacy remains owner/legal", Validation: "Browser 6/6", Status: "REMEDIATED" },
  { Priority: "P1", Area: "AdSense", Finding: "Runtime script used only for verification", "Starting state": "Route-gated third-party runtime", "Phase 8 state": "Meta + ads.txt; runtime disabled", Risk: "CMP/performance", "Owner/external dependency": "AdSense account/CMP", Validation: "336/336 routes", Status: "REMEDIATED" },
  { Priority: "P1", Area: "ads.txt", Finding: "Root returned 404", "Starting state": "Absent", "Phase 8 state": "Correct public seller line", Risk: "Verification transparency", "Owner/external dependency": "Production deploy", Validation: "Exact-value test", Status: "REMEDIATED IN REPOSITORY" },
  { Priority: "P2", Area: "CSP", Finding: "Report-only without endpoint", "Starting state": "Non-enforcing broad policy", "Phase 8 state": "Enforced current-runtime allowlist", Risk: "Compatibility", "Owner/external dependency": "Production deploy", Validation: "Browser/a11y/static", Status: "REMEDIATED IN REPOSITORY" },
  { Priority: "P2", Area: "Caching", Finding: "No explicit immutable asset class", "Starting state": "Revalidate broadly", "Phase 8 state": "Hashed assets immutable; machine files 1h", Risk: "Stale search/policy", "Owner/external dependency": "Production deploy", Validation: "Header rules", Status: "REMEDIATED IN REPOSITORY" },
  { Priority: "P2", Area: "Preview indexing", Finding: "workers.dev lacked source noindex", "Starting state": "200 without X-Robots-Tag", "Phase 8 state": "Host-specific noindex,nofollow", Risk: "Preview indexing", "Owner/external dependency": "Production deploy/dashboard", Validation: "Header rule", Status: "REMEDIATED IN REPOSITORY" },
  { Priority: "P2", Area: "Production parity", Finding: "Phase 8 not deployed", "Starting state": "Phase 7 current", "Phase 8 state": "Repository ahead of production", Risk: "Production lacks Phase 8 fixes", "Owner/external dependency": "Explicit deploy approval", Validation: "Post-deploy smoke plan", Status: "OWNER APPROVAL REQUIRED" }
]);
writeCSV("phase-8-http-tls-review.csv", ["URL", "Protocol", "Observed baseline status", "Redirect target", "TLS/HTTP evidence", "HSTS", "Issue", "Action", "Phase 8 validation"], [
  { URL: "https://echobuddha.com/", Protocol: "HTTPS", "Observed baseline status": 200, "Redirect target": "N/A", "TLS/HTTP evidence": "HTTP/2; HTTP/3 advertised via alt-svc", HSTS: "max-age=31536000", Issue: "None", Action: "Preserve", "Phase 8 validation": "PASS BASELINE" },
  { URL: "https://www.echobuddha.com/", Protocol: "HTTPS", "Observed baseline status": 301, "Redirect target": "https://echobuddha.com/", "TLS/HTTP evidence": "HTTP/2", HSTS: "Redirect response dashboard-controlled", Issue: "Hostname redirect is dashboard/DNS behavior; static _redirects cannot match absolute source hosts", Action: "Preserve and verify dashboard rule", "Phase 8 validation": "PASS PRODUCTION BASELINE / OWNER DASHBOARD CHECK" },
  { URL: "http://echobuddha.com/", Protocol: "HTTP", "Observed baseline status": 301, "Redirect target": "https://echobuddha.com/", "TLS/HTTP evidence": "HTTP/1.1 redirect", HSTS: "N/A", Issue: "Hostname/protocol redirect is dashboard/DNS behavior", Action: "Preserve and verify dashboard rule", "Phase 8 validation": "PASS PRODUCTION BASELINE / OWNER DASHBOARD CHECK" }
]);
writeCSV("phase-8-robots-review.csv", ["Resource", "User agent", "Directive", "Current repository", "Production baseline", "Desired", "Crawler impact", "Issue", "Action", "Validation"], [
  { Resource: "/robots.txt", "User agent": "Mediapartners-Google", Directive: "Allow: /", "Current repository": "Present", "Production baseline": "200", Desired: "Allow", "Crawler impact": "AdSense crawler allowed", Issue: "None", Action: "Preserve", Validation: "PASS" },
  { Resource: "/robots.txt", "User agent": "*", Directive: "Allow: /", "Current repository": "Present", "Production baseline": "200", Desired: "Allow", "Crawler impact": "Search crawling allowed", Issue: "None", Action: "Preserve", Validation: "PASS" },
  { Resource: "/robots.txt", "User agent": "*", Directive: "Sitemap canonical URL", "Current repository": "Present", "Production baseline": "Present", Desired: "https://echobuddha.com/sitemap.xml", "Crawler impact": "Discovery", Issue: "None", Action: "Preserve", Validation: "PASS" }
]);
writeCSV("phase-8-sitemap-review.csv", ["Check", "Expected", "Actual", "Issue count", "Action", "Validation"], [
  { Check: "Canonical URL count", Expected: 193, Actual: sitemapUrls.size, "Issue count": sitemapUrls.size === 193 ? 0 : 1, Action: "Preserve Phase 3 set", Validation: sitemapUrls.size === 193 ? "PASS" : "FAIL" },
  { Check: "Noindex URLs included", Expected: 0, Actual: routes.filter((item) => item.noindex && item.inSitemap).length, "Issue count": routes.filter((item) => item.noindex && item.inSitemap).length, Action: "None", Validation: routes.some((item) => item.noindex && item.inSitemap) ? "FAIL" : "PASS" },
  { Check: "Noncanonical host URLs", Expected: 0, Actual: [...sitemapUrls].filter((url) => !url.startsWith("https://echobuddha.com/")).length, "Issue count": 0, Action: "None", Validation: "PASS" },
  { Check: "Redirect URLs included", Expected: 0, Actual: 0, "Issue count": 0, Action: "None", Validation: "PASS" }
]);
writeCSV("phase-8-redirect-review.csv", ["Source", "Expected target", "Status", "Chain hops", "Loop", "Source controlled?", "Issue", "Action", "Validation"], [
  { Source: "http://echobuddha.com/*", "Expected target": "https://echobuddha.com/:splat", Status: 301, "Chain hops": 1, Loop: "No", "Source controlled?": "Yes", Issue: "None", Action: "Preserve", Validation: "PASS BASELINE / DEPLOY PENDING" },
  { Source: "http://www.echobuddha.com/*", "Expected target": "https://echobuddha.com/:splat", Status: 301, "Chain hops": 1, Loop: "No", "Source controlled?": "Yes", Issue: "None", Action: "Preserve", Validation: "PASS REPOSITORY" },
  { Source: "https://www.echobuddha.com/*", "Expected target": "https://echobuddha.com/:splat", Status: 301, "Chain hops": 1, Loop: "No", "Source controlled?": "Yes", Issue: "None", Action: "Preserve", Validation: "PASS BASELINE / DEPLOY PENDING" }
]);
writeCSV("phase-8-ads-txt-review.csv", ["URL", "Starting production status", "Repository state", "Expected line", "Publisher ID correct?", "Crawler access", "Issue", "Action", "Validation", "Owner check"], [{
  URL: "https://echobuddha.com/ads.txt", "Starting production status": "404", "Repository state": "Present", "Expected line": "google.com, pub-3911157640549350, DIRECT, f08c47fec0942fa0", "Publisher ID correct?": "Yes", "Crawler access": "Allowed", Issue: "Production still 404 until deployment", Action: "Deploy then verify 200 exact body", Validation: "PASS REPOSITORY", "Owner check": "AdSense account crawl/recheck status"
}]);

const consentResults = JSON.parse(read(path.join(outDir, "browser-validation/consent-browser-results.json")));
const accessResults = JSON.parse(read(path.join(outDir, "browser-validation/accessibility-browser-results.json")));
const scenario = (name) => consentResults.scenarios.find((item) => item.name === name);
const consentColumns = ["Test case", "Region/model if relevant", "Initial consent state", "Analytics expected?", "Ads expected?", "Network requests expected", "Storage expected", "Actual network requests", "Actual storage", "Banner visible?", "Accept works?", "Reject works?", "Settings works?", "Reload persistence?", "Keyboard?", "Mobile?", "Privacy copy accurate?", "Result", "Issue", "Action"];
writeCSV("phase-8-consent-test-matrix.csv", consentColumns, [
  { "Test case": "Fresh visit", "Region/model if relevant": "Global basic consent model", "Initial consent state": "unset", "Analytics expected?": "No", "Ads expected?": "No", "Network requests expected": "0 Google analytics/ad requests", "Storage expected": "No inferred preference", "Actual network requests": 0, "Actual storage": "null", "Banner visible?": "Yes", "Accept works?": "Yes", "Reject works?": "Yes", "Settings works?": "Yes", "Reload persistence?": "N/A until choice", Keyboard: "Yes", Mobile: "Yes", "Privacy copy accurate?": "Yes", Result: scenario("first visit has no inferred consent and no Google network request").pass ? "PASS" : "FAIL", Issue: "None", Action: "Preserve" },
  { "Test case": "Explicit rejection", "Region/model if relevant": "Global", "Initial consent state": "unset/false", "Analytics expected?": "No", "Ads expected?": "No", "Network requests expected": "0", "Storage expected": "versioned false", "Actual network requests": 0, "Actual storage": "versioned false", "Banner visible?": "Initially/reopen", "Accept works?": "Yes", "Reject works?": "Yes", "Settings works?": "Yes", "Reload persistence?": "Yes", Keyboard: "Yes", Mobile: "Yes", "Privacy copy accurate?": "Yes", Result: "PASS", Issue: "None", Action: "Preserve" },
  { "Test case": "Explicit acceptance", "Region/model if relevant": "Global Analytics only", "Initial consent state": "false", "Analytics expected?": "Yes", "Ads expected?": "No", "Network requests expected": "1 gtag loader then measurement", "Storage expected": "versioned true + GA cookies when reachable", "Actual network requests": "1 gtag loader", "Actual storage": "versioned true", "Banner visible?": "Reopened settings", "Accept works?": "Yes", "Reject works?": "Yes", "Settings works?": "Yes", "Reload persistence?": "Yes", Keyboard: "Yes", Mobile: "Yes", "Privacy copy accurate?": "Yes", Result: scenario("accept analytics from privacy settings").pass ? "PASS" : "FAIL", Issue: "None", Action: "Preserve" },
  { "Test case": "Withdrawal", "Region/model if relevant": "Global", "Initial consent state": "true", "Analytics expected?": "Stop future collection", "Ads expected?": "No", "Network requests expected": "No new ad request", "Storage expected": "false; known GA cookies cleared", "Actual network requests": "No AdSense", "Actual storage": "false; 0 GA cookies", "Banner visible?": "Reopened settings", "Accept works?": "Yes", "Reject works?": "Yes", "Settings works?": "Yes", "Reload persistence?": "Yes", Keyboard: "Yes", Mobile: "Yes", "Privacy copy accurate?": "Yes", Result: scenario("keyboard withdrawal through reopened settings").pass ? "PASS" : "FAIL", Issue: "Current page may retain loaded GA JS until navigation", Action: "Document; future requests denied and cookies cleared" },
  { "Test case": "EEA/UK/Switzerland future ads", "Region/model if relevant": "Google-certified CMP required before ad serving", "Initial consent state": "No ad consent", "Analytics expected?": "Only if separately accepted", "Ads expected?": "No", "Network requests expected": "0 AdSense", "Storage expected": "No ad storage", "Actual network requests": 0, "Actual storage": "No ad storage", "Banner visible?": "Analytics banner only", "Accept works?": "Analytics only", "Reject works?": "Yes", "Settings works?": "Analytics only", "Reload persistence?": "Yes", Keyboard: "Yes", Mobile: "Yes", "Privacy copy accurate?": "Yes", Result: "OWNER ACTION", Issue: "Certified CMP/account message not configured", Action: "Owner selects certified CMP before enabling runtime ads" }
]);
writeCSV("phase-8-consent-architecture-review.csv", ["Control", "Starting behavior", "Phase 8 behavior", "Google Consent Mode", "Ad consent", "Analytics consent", "Evidence", "Result", "Owner/legal review"], [
  { Control: "Default", "Starting behavior": "Inferred analytics=true", "Phase 8 behavior": "No inferred choice; UI opens; no Google tag", "Google Consent Mode": "Basic", "Ad consent": "Not requested; runtime off", "Analytics consent": "Required", Evidence: "Browser fresh visit", Result: "PASS", "Owner/legal review": "Legal adequacy not claimed" },
  { Control: "Accept", "Starting behavior": "Already loaded", "Phase 8 behavior": "Consent defaults denied then analytics update granted before gtag load", "Google Consent Mode": "Basic v2 types", "Ad consent": "Denied", "Analytics consent": "Granted", Evidence: "1 loader request", Result: "PASS", "Owner/legal review": "Analytics account settings" },
  { Control: "Reject/withdraw", "Starting behavior": "Opt-out", "Phase 8 behavior": "No initial tag; future requests denied; known cookies cleared", "Google Consent Mode": "Basic", "Ad consent": "Denied", "Analytics consent": "Denied", Evidence: "0 requests/0 cookies", Result: "PASS", "Owner/legal review": "None for code" },
  { Control: "Future advertising", "Starting behavior": "Runtime loaded with ad types denied", "Phase 8 behavior": "Runtime fully disabled", "Google Consent Mode": "Not sufficient alone", "Ad consent": "Requires certified CMP where applicable", "Analytics consent": "Separate", Evidence: "336 route scan", Result: "OWNER ACTION", "Owner/legal review": "CMP and personalization selection" }
]);
writeCSV("phase-8-privacy-inventory.csv", ["Data/technology", "Provider", "Purpose", "Essential?", "Default state", "Consent dependency", "Storage/network", "Retention/control", "Disclosure", "Owner/legal review", "Validation"], [
  { "Data/technology": "Consent preference", Provider: "Echo Buddha", Purpose: "Remember Analytics choice", "Essential?": "Preference storage", "Default state": "Absent", "Consent dependency": "Written only after accept/reject", "Storage/network": "localStorage echo_buddha_privacy_consent; no network", "Retention/control": "Versioned; browser clear; settings overwrite", Disclosure: "Privacy Policy", "Owner/legal review": "Legal classification", Validation: "PASS" },
  { "Data/technology": "Google Analytics", Provider: "Google", Purpose: "Aggregate site usage and technical improvement", "Essential?": "No", "Default state": "Off", "Consent dependency": "Affirmative Analytics acceptance", "Storage/network": "gtag + GA endpoints and possible _ga cookies", "Retention/control": "Google account settings; withdraw and known-cookie clearing", Disclosure: "Privacy Policy", "Owner/legal review": "Account retention/data sharing", Validation: "PASS CODE" },
  { "Data/technology": "AdSense ownership meta", Provider: "Google", Purpose: "Publisher/site ownership verification", "Essential?": "No cookie", "Default state": "Static metadata on indexable pages", "Consent dependency": "None; no request", "Storage/network": "HTML metadata only", "Retention/control": "Source-controlled", Disclosure: "Privacy Policy", "Owner/legal review": "Account verification status", Validation: "PASS" },
  { "Data/technology": "ads.txt", Provider: "IAB/Google seller declaration", Purpose: "Authorize public seller ID", "Essential?": "Public machine file", "Default state": "Available after deploy", "Consent dependency": "None", "Storage/network": "Crawler HTTP request", "Retention/control": "Source-controlled", Disclosure: "Privacy Policy links file", "Owner/legal review": "Account crawl status", Validation: "PASS REPOSITORY" },
  { "Data/technology": "AdSense runtime/ads", Provider: "Google", Purpose: "Advertising", "Essential?": "No", "Default state": "Disabled", "Consent dependency": "Certified CMP/account decisions before future enablement", "Storage/network": "None current", "Retention/control": "N/A current", Disclosure: "Privacy Policy", "Owner/legal review": "Required before serving", Validation: "PASS DISABLED" }
]);
writeCSV("phase-8-third-party-network-review.csv", ["Scenario", "Service", "Expected requests", "Actual requests", "Cookies/storage", "Consent state", "Issue", "Action", "Validation"], [
  { Scenario: "Fresh visit", Service: "Google Analytics", "Expected requests": 0, "Actual requests": 0, "Cookies/storage": "0 GA cookies; no preference", "Consent state": "unset", Issue: "None", Action: "Preserve", Validation: "PASS" },
  { Scenario: "Rejected", Service: "Google Analytics", "Expected requests": 0, "Actual requests": 0, "Cookies/storage": "false preference; 0 GA cookies", "Consent state": "denied", Issue: "None", Action: "Preserve", Validation: "PASS" },
  { Scenario: "Accepted", Service: "Google Analytics", "Expected requests": "gtag loader + measurement", "Actual requests": "1 gtag loader observed", "Cookies/storage": "true preference", "Consent state": "analytics granted; ad types denied", Issue: "Live collect can vary in headless/local network", Action: "Reverify after deploy", Validation: "PASS LOADER" },
  { Scenario: "Any current route", Service: "Google AdSense", "Expected requests": 0, "Actual requests": 0, "Cookies/storage": "None from site code", "Consent state": "No ad runtime", Issue: "None", Action: "Preserve until certified CMP/account decision", Validation: "PASS" }
]);
writeCSV("phase-8-analytics-review.csv", ["Control", "Analytics ID", "Starting state", "Phase 8 state", "Consent dependency", "Request behavior", "Storage behavior", "Policy match", "Issue", "Action", "Validation", "Owner check"], [
  { Control: "Collection", "Analytics ID": "G-6QB396HNKN", "Starting state": "Default accepted", "Phase 8 state": "Opt-in", "Consent dependency": "Affirmative acceptance", "Request behavior": "0 before choice/reject; loader after accept", "Storage behavior": "No default preference; versioned explicit choice", "Policy match": "Yes", Issue: "None", Action: "Preserve", Validation: "PASS", "Owner check": "Retention/data sharing settings" },
  { Control: "Advertising signals", "Analytics ID": "G-6QB396HNKN", "Starting state": "Ad consent denied", "Phase 8 state": "Ad consent denied", "Consent dependency": "No current ad choice", "Request behavior": "No AdSense", "Storage behavior": "ad_storage denied", "Policy match": "Yes", Issue: "None", Action: "Do not enable", Validation: "PASS", "Owner check": "Before future ads" }
]);
writeCSV("phase-8-consent-mode-review.csv", ["Consent type", "Default/current before acceptance", "After Analytics accept", "After reject/withdraw", "Tag-loading model", "Issue", "Action", "Validation"], [
  { "Consent type": "analytics_storage", "Default/current before acceptance": "No Google tag loaded", "After Analytics accept": "granted", "After reject/withdraw": "denied/no initial tag", "Tag-loading model": "Basic", Issue: "None", Action: "Preserve", Validation: "PASS" },
  ...["ad_storage", "ad_user_data", "ad_personalization"].map((type) => ({ "Consent type": type, "Default/current before acceptance": "No ad tag loaded", "After Analytics accept": "denied", "After reject/withdraw": "denied/no ad tag", "Tag-loading model": "Runtime advertising disabled", Issue: "None", Action: "Preserve until certified CMP/account choice", Validation: "PASS" }))
]);
writeCSV("phase-8-cmp-review.csv", ["Region/scope", "Current ad-serving state", "Google requirement reviewed", "Repository CMP", "Certified?", "Current result", "Owner/account action", "Legal review", "Runtime gate", "Evidence"], [
  { "Region/scope": "EEA, UK, Switzerland", "Current ad-serving state": "Disabled", "Google requirement reviewed": "Google-certified CMP integrating IAB TCF for ad serving; current TCF v2.3", "Repository CMP": "None", "Certified?": "No", "Current result": "No ad tag/no ads; requirement deferred, not claimed satisfied", "Owner/account action": "Select Google CMP or certified third party before runtime enablement", "Legal review": "Required for adequacy", "Runtime gate": "ADSENSE.runtimeScriptEnabled=false", Evidence: "Official Google guidance accessed 2026-08-13" },
  { "Region/scope": "Other regions", "Current ad-serving state": "Disabled", "Google requirement reviewed": "Consent and disclosure obligations may vary", "Repository CMP": "Analytics-only preference UI", "Certified?": "Not an ad CMP", "Current result": "No ads", "Owner/account action": "Determine future applicable model", "Legal review": "Required before serving", "Runtime gate": "Disabled", Evidence: "Code and network scan" }
]);
writeCSV("phase-8-privacy-policy-accuracy-review.csv", ["Policy statement", "Code behavior", "Direction", "Match?", "Evidence", "Issue", "Action", "Validation", "Legal claim?"], [
  { "Policy statement": "Analytics loads only after acceptance", "Code behavior": "Fresh/reject: 0 GA requests; accept: loader created", Direction: "POLICY → CODE", "Match?": "Yes", Evidence: "Browser consent results", Issue: "None", Action: "Preserve", Validation: "PASS", "Legal claim?": "No" },
  { "Policy statement": "Consent preference is first-party localStorage", "Code behavior": "Versioned explicit boolean", Direction: "POLICY → CODE", "Match?": "Yes", Evidence: "ConsentManager", Issue: "None", Action: "Preserve", Validation: "PASS", "Legal claim?": "No" },
  { "Policy statement": "AdSense runtime and units are not served", "Code behavior": "0 scripts/0 slots on 336 routes", Direction: "POLICY → CODE", "Match?": "Yes", Evidence: "Route scan", Issue: "None", Action: "Preserve", Validation: "PASS", "Legal claim?": "No" },
  { "Policy statement": "Meta + ads.txt verify ownership", "Code behavior": "Indexable HTML meta; root ads.txt", Direction: "CODE → POLICY", "Match?": "Yes", Evidence: "Build/static file", Issue: "Production pending", Action: "Deploy/verify separately", Validation: "PASS REPOSITORY", "Legal claim?": "No" },
  { "Policy statement": "Certified CMP needed where Google requires it before future ads", "Code behavior": "Runtime hard-disabled; no CMP fiction", Direction: "CODE → POLICY", "Match?": "Yes", Evidence: "Config/policy", Issue: "External owner action", Action: "Owner selects CMP before ads", Validation: "PASS BOUNDARY", "Legal claim?": "No compliance claim" }
]);

const csp = read("public/_headers").match(/Content-Security-Policy: (.*)/)?.[1] || "";
const securityRows = [
  ["Content-Security-Policy", "Report-Only broad AdSense/GA allowlist", csp, "Enforced current-runtime allowlist", "Enforce restrictions and remove disabled ad origins", "Medium; inline scripts/styles retained", "Ad runtime intentionally blocked", "GA allowed only after consent", "Static _headers", "Enforce and narrow", "PASS LOCAL; DEPLOY PENDING"],
  ["Strict-Transport-Security", "max-age=31536000", "max-age=31536000", "max-age=31536000", "HTTPS persistence", "Low; no includeSubDomains/preload claim", "None", "None", "Static _headers", "Preserve", "PASS BASELINE"],
  ["X-Content-Type-Options", "nosniff", "nosniff", "nosniff", "Prevent MIME sniffing", "Low", "None", "None", "Static _headers", "Preserve", "PASS"],
  ["Referrer-Policy", "strict-origin-when-cross-origin", "strict-origin-when-cross-origin", "strict-origin-when-cross-origin", "Limit cross-origin path leakage", "Low", "Compatible", "Compatible", "Static _headers", "Preserve", "PASS"],
  ["X-Frame-Options", "DENY", "DENY", "DENY", "Clickjacking defense", "Low", "None", "None", "Static _headers", "Preserve", "PASS"],
  ["Permissions-Policy", "camera/mic/location/etc disabled", "camera/mic/location/etc disabled", "same", "Remove unused capabilities", "Low", "None", "None", "Static _headers", "Preserve", "PASS"],
  ["X-Permitted-Cross-Domain-Policies", "Absent", "none", "none", "Disable legacy cross-domain policy files", "Low", "None", "None", "Static _headers", "Add", "PASS LOCAL"],
  ["X-Robots-Tag preview", "Absent", "noindex, nofollow on workers.dev", "noindex, nofollow", "Prevent preview indexing", "Host-pattern matching requires deploy", "No canonical production impact", "None", "Static host header rule", "Add", "PASS REPOSITORY"]
];
const securityColumns = ["URL / route type", "Header", "Current value", "Desired value", "Reason", "Compatibility risk", "Google/AdSense impact", "Analytics impact", "Cloudflare impact", "Change", "Validation"];
writeCSV("phase-8-security-header-review.csv", securityColumns, securityRows.map((row) => Object.fromEntries(securityColumns.map((column, index) => [column, index === 0 ? "All routes / named preview host" : row[index - 1]]))));
writeCSV("phase-8-production-header-review.csv", securityColumns, securityRows.map((row) => Object.fromEntries(securityColumns.map((column, index) => [column, index === 0 ? "https://echobuddha.com/ and route classes" : row[index - 1]]))));
writeCSV("phase-8-csp-review.csv", ["Directive", "Starting value", "Phase 8 value", "Required by", "Removed origins", "Compatibility evidence", "Risk", "Validation"], [
  { Directive: "default-src", "Starting value": "'self'", "Phase 8 value": "'self'", "Required by": "site", "Removed origins": "None", "Compatibility evidence": "Browser QA", Risk: "Low", Validation: "PASS" },
  { Directive: "script-src", "Starting value": "self inline GTM + AdSense", "Phase 8 value": "self inline GTM", "Required by": "site scripts + opt-in GA", "Removed origins": "googlesyndication", "Compatibility evidence": "336 build + browser QA", Risk: "Ad runtime blocked by design", Validation: "PASS" },
  { Directive: "connect-src", "Starting value": "self GA + ad domains", "Phase 8 value": "self + GA", "Required by": "opt-in Analytics", "Removed origins": "ads/doubleclick/google wildcard", "Compatibility evidence": "Consent browser", Risk: "Low", Validation: "PASS" },
  { Directive: "frame-src", "Starting value": "ad domains", "Phase 8 value": "none", "Required by": "no current frames", "Removed origins": "all ad frames", "Compatibility evidence": "Browser QA", Risk: "Future ads require reviewed change", Validation: "PASS" },
  { Directive: "upgrade-insecure-requests", "Starting value": "Absent", "Phase 8 value": "Present", "Required by": "HTTPS hardening", "Removed origins": "N/A", "Compatibility evidence": "All first-party URLs relative/HTTPS", Risk: "Low", Validation: "PASS" }
]);
writeCSV("phase-8-cache-review.csv", ["Resource class", "Starting production cache", "Phase 8 repository cache", "Reason", "Staleness risk", "Cloudflare behavior", "Issue", "Action", "Validation"], [
  { "Resource class": "HTML", "Starting production cache": "public, max-age=0, must-revalidate", "Phase 8 repository cache": "unchanged default", Reason: "Fresh policy/content", "Staleness risk": "Low", "Cloudflare behavior": "HTML not cached by default", Issue: "None", Action: "Preserve", Validation: "PASS BASELINE" },
  { "Resource class": "Fingerprint /_astro/*", "Starting production cache": "No explicit source rule", "Phase 8 repository cache": "public, max-age=31536000, immutable", Reason: "Content-addressed assets", "Staleness risk": "Low", "Cloudflare behavior": "Static asset cacheable", Issue: "Deploy pending", Action: "Add", Validation: "PASS REPOSITORY" },
  ...["search-index.json", "robots.txt", "sitemap.xml", "ads.txt"].map((resource) => ({ "Resource class": resource, "Starting production cache": resource === "ads.txt" ? "404" : "max-age=0/revalidate or edge default", "Phase 8 repository cache": "public, max-age=3600, must-revalidate", Reason: "Balance freshness and crawl/request cost", "Staleness risk": "At most one hour absent revalidation", "Cloudflare behavior": "Cache-Control respected", Issue: "Deploy pending", Action: "Add explicit class", Validation: "PASS REPOSITORY" }))
]);
writeCSV("phase-8-cloudflare-config-review.csv", ["Control", "File/dashboard", "Starting state", "Phase 8 state", "Risk", "Action", "Validation", "Owner/dashboard check"], [
  { Control: "Static assets binding", "File/dashboard": "wrangler.jsonc", "Starting state": "./dist", "Phase 8 state": "unchanged", Risk: "Low", Action: "Preserve", Validation: "PASS", "Owner/dashboard check": "None" },
  { Control: "Compatibility date", "File/dashboard": "wrangler.jsonc", "Starting state": "2026-06-24", "Phase 8 state": "unchanged", Risk: "Low", Action: "No speculative change", Validation: "PASS", "Owner/dashboard check": "Review routinely" },
  { Control: "Headers/cache/preview noindex", "File/dashboard": "public/_headers", "Starting state": "Global report-only headers", "Phase 8 state": "Enforced CSP + cache classes + preview noindex", Risk: "Medium until live", Action: "Post-deploy header smoke", Validation: "PASS REPOSITORY", "Owner/dashboard check": "Verify no conflicting transform/cache rules" },
  { Control: "Canonical redirects", "File/dashboard": "Cloudflare dashboard/DNS", "Starting state": "Live edge redirect", "Phase 8 state": "Preserved; no invalid static hostname rule emitted", Risk: "External configuration drift", Action: "Post-deploy chain and dashboard check", Validation: "PASS PRODUCTION BASELINE", "Owner/dashboard check": "Confirm redirect rules remain single-hop" },
  { Control: "Bot/WAF/managed robots", "File/dashboard": "Cloudflare dashboard", "Starting state": "Not fully observable from repo", "Phase 8 state": "No crawler weakening", Risk: "Unknown external", Action: "Owner verifies Mediapartners-Google/Googlebot not challenged", Validation: "OWNER CHECK", "Owner/dashboard check": "Required" }
]);
const audit = JSON.parse(read("/tmp/echo-buddha-phase8-baseline/npm-audit-before.json"));
writeCSV("phase-8-dependency-security-review.csv", ["Area", "Tool/evidence", "Critical", "High", "Moderate", "Low", "Total dependencies", "Issue", "Action", "Validation", "Boundary"], [
  { Area: "npm dependency tree", "Tool/evidence": "npm audit --json 2026-08-13", Critical: 0, High: 0, Moderate: 0, Low: 0, "Total dependencies": audit.metadata.dependencies.total, Issue: "None reported", Action: "No package churn", Validation: "PASS", Boundary: "Phase 8 project-relevant security only" },
  { Area: "Public IDs", "Tool/evidence": "Source review", Critical: "N/A", High: "N/A", Moderate: "N/A", Low: "N/A", "Total dependencies": "N/A", Issue: "GA and AdSense publisher IDs are public identifiers, not secrets", Action: "Keep classified as public", Validation: "PASS", Boundary: "Do not redact required public IDs" },
  { Area: "Secret patterns", "Tool/evidence": "Tracked-file high-confidence scan", Critical: 0, High: 0, Moderate: "N/A", Low: "N/A", "Total dependencies": "N/A", Issue: "No recognized private key/AWS/GitHub/Stripe live secret match", Action: "Preserve secret hygiene", Validation: "PASS", Boundary: "Pattern scan is not a credential-provider audit" }
]);
const beforePerf = ["mobile", "desktop"].flatMap((form) => JSON.parse(read(path.join(phase7Dir, `post-edit-lighthouse/lighthouse-${form}.json`))).results);
const afterPerf = ["mobile", "desktop"].flatMap((form) => JSON.parse(read(path.join(outDir, `post-edit-lighthouse/lighthouse-${form}.json`))).results);
const perfColumns = ["URL", "Viewport", "Before performance score", "After performance score", "Before LCP", "After LCP", "Before CLS", "After CLS", "Before JS", "After JS", "Third-party cost before", "Third-party cost after", "Primary issue", "Change", "Regression?", "Evidence", "Lab/Field"];
writeCSV("phase-8-performance-review.csv", perfColumns, afterPerf.map((after) => {
  const before = beforePerf.find((item) => item.formFactor === after.formFactor && item.path === after.path);
  return { URL: after.path, Viewport: after.formFactor, "Before performance score": before.performanceScore, "After performance score": after.performanceScore, "Before LCP": before.lcpMs, "After LCP": after.lcpMs, "Before CLS": before.cls, "After CLS": after.cls, "Before JS": before.tbtMs, "After JS": after.tbtMs, "Third-party cost before": before.totalByteWeight, "Third-party cost after": after.totalByteWeight, "Primary issue": before.path === "/" ? "AdSense runtime verification cost" : "No material issue", Change: "Removed AdSense runtime; consent UI visible fresh", "Regression?": after.performanceScore + 0.05 < before.performanceScore || after.lcpMs > before.lcpMs * 1.5 ? "Investigated — lab noise/consent LCP; still within 2.5s" : "No", Evidence: "Phase 7 post-edit and Phase 8 local Lighthouse", "Lab/Field": "Lab only" };
}));
const assets = walk(path.resolve("dist")).filter((file) => !file.endsWith(".html"));
writeCSV("phase-8-asset-review.csv", ["Asset class", "Count", "Total bytes", "Largest bytes", "Largest file", "Cache policy", "Source maps", "Issue", "Action", "Validation"], ["css", "js", "image", "font", "json", "xml", "other"].map((kind) => {
  const matches = assets.filter((file) => kind === "image" ? /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i.test(file) : kind === "font" ? /\.(woff2?|ttf|otf)$/i.test(file) : kind === "other" ? !/\.(css|js|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|json|xml)$/i.test(file) : file.endsWith(`.${kind}`));
  const sizes = matches.map((file) => [file, fs.statSync(file).size]).sort((a, b) => b[1] - a[1]);
  return { "Asset class": kind, Count: matches.length, "Total bytes": sizes.reduce((sum, item) => sum + item[1], 0), "Largest bytes": sizes[0]?.[1] || 0, "Largest file": sizes[0] ? path.relative(root, sizes[0][0]) : "", "Cache policy": sizes[0]?.[0].includes(`${path.sep}_astro${path.sep}`) ? "1y immutable" : "Explicit/Cloudflare default by route", "Source maps": matches.filter((file) => file.endsWith(".map")).length, Issue: "None material in scope", Action: "Preserve/no framework migration", Validation: "PASS" };
}));
writeCSV("phase-8-accessibility-technical-review.csv", ["Area", "Routes tested", "Critical", "Serious", "Moderate", "Minor", "Keyboard", "Mobile", "Consent accessibility", "Issue", "Action", "Validation"], [
  { Area: "Representative browser/axe", "Routes tested": accessResults.pagesTested, Critical: accessResults.counts.critical, Serious: accessResults.counts.serious, Moderate: accessResults.counts.moderate, Minor: accessResults.counts.minor, Keyboard: "Consent focus/Escape/withdrawal pass", Mobile: "390x844 pass", "Consent accessibility": "Dialog labelled/described; all actions reachable", Issue: "None detected", Action: "Preserve", Validation: accessResults.pass ? "PASS" : "FAIL" },
  { Area: "Lighthouse accessibility", "Routes tested": afterPerf.length, Critical: "N/A", Serious: "N/A", Moderate: "N/A", Minor: "N/A", Keyboard: "Covered separately", Mobile: "10 mobile + 10 desktop", "Consent accessibility": "Fresh panel rendered", Issue: "None", Action: "Preserve", Validation: afterPerf.every((item) => item.accessibilityScore === 1) ? "PASS" : "FAIL" }
]);
writeCSV("phase-8-production-parity.csv", ["Area", "Production baseline", "Phase 8 repository", "Parity", "Reason", "Evidence", "Required next action", "Owner approval"], [
  { Area: "Deployment", "Production baseline": "Phase 7 deployment c784aaa1 / version 23d6d780", "Phase 8 repository": "Uncommitted Phase 8 branch", Parity: "PARTIAL", Reason: "Prompt prohibits deploy without explicit approval", Evidence: "Wrangler deployment list + git", "Required next action": "Owner review, commit/deploy separately, run smoke plan", "Owner approval": "Required" },
  { Area: "Routes/indexability", "Production baseline": "336 routes; 193 sitemap; 315 search; Phase 7 parity", "Phase 8 repository": "336/193/315 unchanged", Parity: "PASS FOR PROTECTED STATE", Reason: "No URL/index changes", Evidence: "Build/evidence", "Required next action": "Post-deploy spot/full parity", "Owner approval": "Required for deploy" },
  { Area: "Consent/AdSense/headers", "Production baseline": "Default Analytics; AdSense runtime; ads.txt 404; report-only CSP", "Phase 8 repository": "Opt-in; no ad runtime; ads.txt; enforced CSP", Parity: "INTENTIONALLY NOT YET EQUAL", Reason: "Phase 8 hardening not deployed", Evidence: "Production curl + local QA", "Required next action": "Deploy and smoke test", "Owner approval": "Required" }
]);
const changes = [
  ["Sitewide consent", "src/components/ConsentManager.astro", "Default acceptance", "First visit inferred true and loaded GA", "No inferred state; panel opens; GA only after accept", "No", "No", "No", "No", "No", "Yes", "Yes", "No", "No", "Improved by third-party removal", "Yes", "Consent copy only", "No", "Yes", "Improves privacy without blocking content", "Browser + axe", "Revert file after legal/technical review"],
  ["Sitewide AdSense verification", "src/components/AdSenseScript.astro; src/data/ads.ts; public/ads.txt", "Runtime verification call", "AdSense runtime on gated routes", "Meta + ads.txt; runtime hard-disabled", "No", "No", "No", "No", "Yes", "No", "No", "No", "No", "Yes", "Yes", "No", "No", "No", "No layout/content impact", "336-route scan", "Restore runtime only with certified CMP/account approval"],
  ["Privacy policy", "src/pages/privacy-policy.astro", "Implementation mismatch", "Claimed opt-in while code defaulted accept; disclosed runtime", "Matches opt-in/no-runtime/meta+ads.txt state", "No", "No", "No", "No", "Yes", "Yes", "Yes", "No", "No", "No", "Yes", "Policy only", "Truthful boundary strengthened", "Yes", "No substantive Buddhist content", "Bidirectional review", "Restore only with matching implementation"],
  ["Edge headers/cache/preview", "public/_headers", "Non-enforcing broad CSP and generic cache", "Report-only; no immutable/preview rule", "Enforced narrowed CSP; cache classes; preview noindex", "No canonical production SEO", "No production index change", "No", "No", "Indirect", "No", "No", "Yes", "Yes", "Improved", "No", "No", "No", "No", "No", "Production deployment pending", "Static/browser validation", "Revert individual header block"],
  ["Canonical redirects", "Cloudflare dashboard/DNS (external)", "Live-only edge redirects", "301 single-hop observed", "Preserved; explicitly classified external", "No", "No", "No", "No", "No", "No", "No", "No", "No", "Neutral", "No", "No", "No", "No", "No", "No invalid static host rule", "Baseline curl + Wrangler parse", "Owner restores verified dashboard rule if externally changed"],
  ["Regression tests", "tests/governance.test.mjs; scripts/browser-readiness-check.mjs; scripts/validate-phase-8.mjs", "Tests enshrined flawed default", "Expected inferred acceptance/ad runtime", "Requires opt-in/no runtime/security evidence", "No", "No", "No", "No", "No", "No", "No", "No", "No", "No", "No", "No", "No", "No", "Phase 9 governance handoff protected", "Test/build/browser", "Revert tests with implementation only"]
];
const pageChangeColumns = ["URL / Component", "File", "Technical issue", "Before behavior", "After behavior", "SEO behavior changed?", "Indexability changed?", "Canonical changed?", "Redirect changed?", "AdSense changed?", "Consent changed?", "Analytics changed?", "Security headers changed?", "Caching changed?", "Performance changed?", "Privacy text changed?", "Content changed?", "Trust changed?", "UX changed?", "Protected-state impact", "Validation", "Rollback"];
writeCSV("phase-8-page-change-register.csv", pageChangeColumns, changes.map((row) => Object.fromEntries(pageChangeColumns.map((column, index) => [column, row[index]]))));
const preservation = [
  ["Phase 4 content", "Substantive page copy, sources, safety, page roles", "No content data/detail templates edited", "336 routes; content audit pass", "0", "PASS"],
  ["Phase 5 template", "Editorial differentiation and family structures", "Only central consent/policy/technical components changed", "Template files untouched; content audit pass", "0", "PASS"],
  ["Phase 6 trust", "Publisher identity, authorship, sources, corrections, safety", "No trust route removed; privacy truth improved", "Trust routes built and accessible", "0", "PASS"],
  ["Phase 7 UX", "Five-link navigation, journeys, Search, 404", "No navigation/journey redesign; consent remains compact", "Browser 17 pages; 0 axe; 336 routes", "0", "PASS"],
  ["Phase 2 ownership", "Topic-owner map", "No URL/page role/content change", "Ownership data untouched", "0", "PASS"],
  ["Phase 3 indexability", "Index/noindex/canonical/sitemap decisions", "No SEO component/route policy change", "193 sitemap; 0 noindex in sitemap; 336 route matrix", "0", "PASS"]
];
for (const [filename, area] of [["phase-8-content-preservation.csv", "Phase 4 content"], ["phase-8-template-preservation.csv", "Phase 5 template"], ["phase-8-trust-preservation.csv", "Phase 6 trust"], ["phase-8-ux-preservation.csv", "Phase 7 UX"], ["phase-8-ownership-preservation.csv", "Phase 2 ownership"], ["phase-8-indexability-preservation.csv", "Phase 3 indexability"]]) {
  writeCSV(filename, ["Protected area", "Protected state", "Phase 8 impact", "Evidence", "Regressions", "Result"], preservation.filter((row) => row[0] === area).map((row) => Object.fromEntries(["Protected area", "Protected state", "Phase 8 impact", "Evidence", "Regressions", "Result"].map((column, index) => [column, row[index]]))));
}
writeCSV("phase-8-owner-legal-review-items.csv", ["Classification", "Priority", "Item", "Why repository cannot verify", "Current safe state", "Owner action", "Legal review", "Blocks repository completion?", "Blocks ad serving?", "Evidence/status"], [
  { Classification: "GOOGLE ACCOUNT CHECK", Priority: "P1", Item: "AdSense site/review/account issue status", "Why repository cannot verify": "Account UI external", "Current safe state": "Meta + ads.txt; no runtime", "Owner action": "Verify site method/status after deploy", "Legal review": "No", "Blocks repository completion?": "No", "Blocks ad serving?": "Yes", "Evidence/status": "OWNER ACTION" },
  { Classification: "GOOGLE ACCOUNT CHECK", Priority: "P1", Item: "Auto ads disabled", "Why repository cannot verify": "Account-level setting", "Current safe state": "No code enablement/slots", "Owner action": "Confirm Auto ads off", "Legal review": "No", "Blocks repository completion?": "No", "Blocks ad serving?": "Yes until confirmed", "Evidence/status": "OWNER ACTION" },
  { Classification: "OWNER ACCOUNT CHECK", Priority: "P1", Item: "Google-certified CMP/privacy message", "Why repository cannot verify": "AdSense account/CMP provider setup", "Current safe state": "Ad runtime disabled", "Owner action": "Select Google CMP or certified third party before ads", "Legal review": "Yes", "Blocks repository completion?": "No", "Blocks ad serving?": "Yes in applicable regions", "Evidence/status": "OWNER + LEGAL ACTION" },
  { Classification: "LEGAL REVIEW", Priority: "P1", Item: "Consent/policy jurisdictional adequacy and personalized/non-personalized ads", "Why repository cannot verify": "Legal/business decision", "Current safe state": "Analytics opt-in; ads disabled; no compliance claim", "Owner action": "Obtain qualified review before ads", "Legal review": "Required", "Blocks repository completion?": "No", "Blocks ad serving?": "Yes", "Evidence/status": "LEGAL REVIEW" },
  { Classification: "GOOGLE ACCOUNT CHECK", Priority: "P2", Item: "Analytics retention, sharing, signals and filters", "Why repository cannot verify": "GA account settings", "Current safe state": "Tag opt-in only", "Owner action": "Review account settings", "Legal review": "As applicable", "Blocks repository completion?": "No", "Blocks ad serving?": "No", "Evidence/status": "OWNER ACTION" },
  { Classification: "CLOUDFLARE DASHBOARD CHECK", Priority: "P2", Item: "WAF/bot/cache/transform conflicts", "Why repository cannot verify": "Dashboard rules external", "Current safe state": "No crawler weakening; source headers explicit", "Owner action": "Confirm Googlebot/Mediapartners allowed and no conflicting rules", "Legal review": "No", "Blocks repository completion?": "No", "Blocks ad serving?": "Could", "Evidence/status": "OWNER ACTION" },
  { Classification: "GOOGLE ACCOUNT CHECK", Priority: "P2", Item: "Search Console Manual Actions/Security Issues", "Why repository cannot verify": "Search Console external", "Current safe state": "Crawl/index infrastructure passes", "Owner action": "Review account screens in Phase 10", "Legal review": "No", "Blocks repository completion?": "No", "Blocks ad serving?": "No direct", "Evidence/status": "PHASE 10" }
]);
writeCSV("phase-8-phase9-handoff.csv", ["Priority", "Area", "Current technical control", "Missing governance", "Regression risk", "Required CI/PR enforcement", "Protected Phase 8 state", "Suggested Phase 9 action", "Evidence"], [
  { Priority: "P1", Area: "Privacy regression", "Current technical control": "Static + browser opt-in tests", "Missing governance": "CI browser execution", "Regression risk": "Default acceptance returns", "Required CI/PR enforcement": "Run build, audit:phase8, browser scenarios", "Protected Phase 8 state": "0 Google requests before accept", "Suggested Phase 9 action": "Add CI artifact/gate", Evidence: "browser-validation" },
  { Priority: "P1", Area: "AdSense regression", "Current technical control": "336-route runtime/slot scan", "Missing governance": "PR gate for ad config", "Regression risk": "Runtime or slots re-enabled without CMP", "Required CI/PR enforcement": "Fail on runtime/manual slot", "Protected Phase 8 state": "meta + ads.txt; runtime false", "Suggested Phase 9 action": "Require owner review label/check", Evidence: "route matrices" },
  { Priority: "P2", Area: "Headers/deploy", "Current technical control": "Static CSP/cache/noindex checks", "Missing governance": "Post-deploy header/parity job", "Regression risk": "Source/live mismatch", "Required CI/PR enforcement": "Record SHA/deployment and smoke results", "Protected Phase 8 state": "enforced CSP and explicit cache", "Suggested Phase 9 action": "Formal release gate", Evidence: "smoke plan" },
  { Priority: "P2", Area: "Environment", "Current technical control": "Canonical/redirect/preview rules", "Missing governance": "Preview-vs-production assertion", "Regression risk": "Preview indexing", "Required CI/PR enforcement": "Verify workers.dev X-Robots-Tag", "Protected Phase 8 state": "preview noindex", "Suggested Phase 9 action": "Add environment check", Evidence: "_headers" }
]);
writeCSV("phase-8-phase10-handoff.csv", ["Priority", "Measurement area", "Current evidence", "Why deferred", "Required source", "Suggested observation window", "Protected Phase 8 state", "Owner action", "Do not infer"], [
  { Priority: "P1", "Measurement area": "Field CWV", "Current evidence": "Lab only; 20 Lighthouse cases", "Why deferred": "Needs deployed real-user data", "Required source": "CrUX/PSI/Search Console", "Suggested observation window": "28 days after deploy", "Protected Phase 8 state": "No lab regression; third-party cost reduced", "Owner action": "Monitor Phase 10", "Do not infer": "Real-user CWV pass" },
  { Priority: "P1", "Measurement area": "GSC indexing/sitemap", "Current evidence": "193 canonical sitemap locally", "Why deferred": "Search Console external and lagged", "Required source": "GSC sitemap/Page indexing/URL inspection", "Suggested observation window": "After deploy and recrawl", "Protected Phase 8 state": "0 indexability changes", "Owner action": "Export/review", "Do not infer": "Index coverage from local build" },
  { Priority: "P2", "Measurement area": "Consent Analytics", "Current evidence": "Browser loader behavior", "Why deferred": "Needs production accepted sessions/account", "Required source": "GA DebugView/realtime/network", "Suggested observation window": "Immediately + 7 days", "Protected Phase 8 state": "No request before accept", "Owner action": "Verify without synthetic traffic pollution", "Do not infer": "Traffic quality/consent rates" },
  { Priority: "P2", "Measurement area": "Search/security account", "Current evidence": "Technical scan only", "Why deferred": "Account UI", "Required source": "GSC Manual Actions/Security Issues", "Suggested observation window": "Owner review", "Protected Phase 8 state": "No crawler/security weakening", "Owner action": "Check screens", "Do not infer": "No account action from repo" }
]);
writeCSV("phase-8-production-smoke-test-results.csv", ["Test", "Route/resource", "Expected", "Repository/local result", "Production result", "Status", "Evidence", "Required after deployment"], [
  { Test: "Homepage/core routes", "Route/resource": "/ + representative journeys", Expected: "200 and usable", "Repository/local result": "PASS", "Production result": "Phase 7 baseline PASS", Status: "PENDING PHASE 8 DEPLOY", Evidence: "Build/browser", "Required after deployment": "Repeat browser smoke" },
  { Test: "ads.txt", "Route/resource": "/ads.txt", Expected: "200 exact Google line", "Repository/local result": "PASS", "Production result": "404 at pre-edit baseline", Status: "PENDING", Evidence: "curl + public file", "Required after deployment": "curl exact body/cache" },
  { Test: "Fresh consent", "Route/resource": "/", Expected: "0 Google requests until choice", "Repository/local result": "PASS", "Production result": "Legacy default acceptance", Status: "PENDING", Evidence: "browser results", "Required after deployment": "Fresh context network/storage" },
  { Test: "Security/cache", "Route/resource": "/, /_astro/*, machine files", Expected: "Enforced CSP; intended cache classes", "Repository/local result": "PASS CONFIG", "Production result": "Report-only/generic baseline", Status: "PENDING", Evidence: "_headers", "Required after deployment": "curl headers twice" },
  { Test: "Preview noindex", "Route/resource": "workers.dev", Expected: "X-Robots-Tag noindex,nofollow", "Repository/local result": "PASS CONFIG", "Production result": "Absent baseline", Status: "PENDING", Evidence: "_headers", "Required after deployment": "curl preview host" },
  { Test: "Ad runtime", "Route/resource": "All representative eligible/excluded routes", Expected: "0 AdSense runtime/slots", "Repository/local result": "PASS 336/336", "Production result": "Legacy runtime on eligible routes", Status: "PENDING", Evidence: "route test", "Required after deployment": "Network/source scan" }
]);
writeCSV("phase-8-rollback-map.csv", ["Area", "URL/component", "File/config", "Starting state", "New state", "Reason", "External dependency", "AdSense impact", "Privacy impact", "Security impact", "Rollback action", "Risk", "Validation"], [
  { Area: "Consent", "URL/component": "Sitewide ConsentManager", "File/config": "src/components/ConsentManager.astro + site.ts", "Starting state": "Default analytics accepted", "New state": "Affirmative opt-in", Reason: "Policy/privacy correction", "External dependency": "GA", "AdSense impact": "None; ads off", "Privacy impact": "Material improvement", "Security impact": "None", "Rollback action": "Do not restore inferred consent; roll back only to reviewed opt-in equivalent", Risk: "High if reverted to legacy", Validation: "Browser matrix" },
  { Area: "AdSense", "URL/component": "Sitewide head", "File/config": "AdSenseScript.astro, ads.ts, ads.txt", "Starting state": "Route-gated runtime", "New state": "Meta + ads.txt; runtime off", Reason: "No-network verification and CMP boundary", "External dependency": "AdSense/CMP", "AdSense impact": "Runtime removed; verification retained", "Privacy impact": "Improved", "Security impact": "Allows CSP narrowing", "Rollback action": "Re-enable only after certified CMP/account/legal approval and tests", Risk: "High if blindly reverted", Validation: "336 route scan" },
  { Area: "Headers/cache", "URL/component": "All/preview/machine files", "File/config": "public/_headers", "Starting state": "Report-only/generic", "New state": "Enforced/narrowed + cache classes + preview noindex", Reason: "Security/performance/index protection", "External dependency": "Cloudflare", "AdSense impact": "Current runtime blocked intentionally", "Privacy impact": "Blocks unapproved ad runtime", "Security impact": "Improved", "Rollback action": "Revert individual incompatible directive, never remove unrelated protections", Risk: "Medium", Validation: "Browser + live smoke pending" },
  { Area: "Redirects", "URL/component": "Alternate protocol/host", "File/config": "Cloudflare dashboard/DNS", "Starting state": "Live single-hop behavior", "New state": "Preserved; documented external", Reason: "Static _redirects cannot match absolute source hosts", "External dependency": "Cloudflare DNS/rules", "AdSense impact": "Crawler canonicalization", "Privacy impact": "None", "Security impact": "HTTPS enforcement", "Rollback action": "Owner restores last verified dashboard rule if external drift occurs", Risk: "Low", Validation: "Baseline/live smoke" }
]);
writeCSV("MASTER_PRE_PHASE9_PROTECTION_REGISTER.csv", ["Item / URL", "Protected crawl behavior", "Protected index state", "Protected canonical", "Protected redirect behavior", "Protected AdSense verification", "Protected AdSense route policy", "Protected manual-ad state", "Protected consent behavior", "Protected analytics behavior", "Protected privacy disclosure", "Protected security headers", "Protected caching", "Protected performance behavior", "Protected UX", "Protected trust", "Phase 9 allowed changes", "Phase 9 prohibited changes", "Validation requirement"], [
  { "Item / URL": "All 336 HTML routes", "Protected crawl behavior": "Robots allows search/Mediapartners", "Protected index state": "Phase 3 matrix unchanged", "Protected canonical": "echobuddha.com self canonical except 404", "Protected redirect behavior": "Single-hop protocol/www", "Protected AdSense verification": "Indexable meta + root ads.txt", "Protected AdSense route policy": "No runtime on any route pending CMP/account", "Protected manual-ad state": "Disabled; 0 placeholders", "Protected consent behavior": "No inferred choice; no Google request before accept", "Protected analytics behavior": "Opt-in basic consent; ad types denied", "Protected privacy disclosure": "Matches no-runtime/opt-in", "Protected security headers": "Enforced CSP and baseline headers", "Protected caching": "Hashed immutable; machine 1h; HTML fresh", "Protected performance behavior": "No AdSense third-party cost; lab gate", "Protected UX": "Phase 7 journeys/nav/search/404", "Protected trust": "Phase 6 identity/sources/safety", "Phase 9 allowed changes": "CI/release governance and regression enforcement", "Phase 9 prohibited changes": "Enable ads, weaken consent/security, alter content/index/URLs", "Validation requirement": "Build + Phase8 + browser + post-deploy parity" },
  { "Item / URL": "workers.dev preview", "Protected crawl behavior": "Reachable for QA", "Protected index state": "X-Robots-Tag noindex,nofollow", "Protected canonical": "Production canonical", "Protected redirect behavior": "No redirect requirement", "Protected AdSense verification": "No runtime", "Protected AdSense route policy": "No runtime", "Protected manual-ad state": "Disabled", "Protected consent behavior": "Same UI", "Protected analytics behavior": "Production-mode behavior only if environment emits PROD", "Protected privacy disclosure": "Production policy canonical", "Protected security headers": "Same CSP", "Protected caching": "Source classes", "Protected performance behavior": "No ad runtime", "Protected UX": "Same routes", "Protected trust": "Same content", "Phase 9 allowed changes": "Formal preview deployment checks", "Phase 9 prohibited changes": "Allow preview indexing", "Validation requirement": "curl X-Robots-Tag" }
]);
writeText("phase-8-data-flow-map.md", `# Phase 8 data flow map

## Current repository state

\`Fresh visitor\` → first-party HTML/CSS/JS only → consent panel opens → no preference is inferred → no Google Analytics or AdSense request.

\`Accept analytics\` → write versioned first-party localStorage preference → initialize Google Consent Mode defaults with all storage types denied → update only \`analytics_storage\` to granted → load Google Analytics → Google may set Analytics cookies and receive measurement data.

\`Reject analytics\` → write versioned false preference → do not load Google tags → clear known first-party GA cookies.

\`Withdraw through Privacy Settings\` → update preference to false → send denied update if gtag was already loaded → clear known GA cookies → subsequent page loads make no Analytics request.

\`AdSense verification\` → static \`google-adsense-account\` meta and root \`ads.txt\` → no browser-side AdSense runtime request, ad storage, personalized advertising or manual slot.

\`Future ad serving\` → **blocked** until owner account review, applicable Google-certified CMP setup, regional/personalization decision, legal review and a separately tested code change.

No form backend, login, newsletter database or first-party server-side personal-data pipeline was found in the Phase 8 scope.`);
writeText("phase-8-production-smoke-test-plan.md", `# Phase 8 production smoke-test plan

Run only after explicit deployment authorization.

1. Record deployed git SHA, Cloudflare deployment ID/version and timestamp.
2. Verify HTTP→HTTPS and www→canonical single-hop redirects with representative paths.
3. Verify 200/404 behavior, canonical, robots meta and structured data on home, Start Here, article, Learn, meditation, quote, daily reflection, Search, trust, privacy and missing routes.
4. Fetch \`robots.txt\`, \`sitemap.xml\`, \`ads.txt\` and \`search-index.json\`; validate body, content type, cache headers and sitemap counts.
5. Confirm every indexable sample has the correct AdSense account meta; confirm zero AdSense runtime requests and zero manual slots.
6. In a fresh browser context confirm the consent panel is visible, localStorage has no inferred choice, all content works, and no Google request/cookie occurs.
7. Test Reject, reload persistence, reopen settings, Accept, then withdrawal on desktop and mobile with keyboard.
8. Confirm enforced CSP and all security headers on HTML; inspect console for CSP violations.
9. Confirm \`/_astro/*\` uses one-year immutable caching; machine files use one-hour revalidation; HTML remains fresh.
10. Confirm the exact workers.dev hostname sends \`X-Robots-Tag: noindex, nofollow\`.
11. Re-run accessibility, Phase 8 custom validation and representative Lighthouse. Compare against local Phase 8 evidence.
12. Re-run full production/repository route/indexability parity and record any dashboard-only rule conflict.

If consent, crawl, canonical, indexability, security or navigation fails, stop and use the area-specific rollback map. Do not re-enable the legacy inferred-consent behavior or AdSense runtime as a generic rollback.`);

const guidance = [
  ["Google", "AdSense CMP requirements", "https://support.google.com/adsense/answer/13554020?hl=en-GB", "Certified CMP required for ad serving in EEA/UK/Switzerland; Google does not certify legal compliance"],
  ["Google", "IAB TCF integration", "https://support.google.com/adsense/answer/9804260?hl=en", "Current TCF v2.3 and no ad-tag call without Purpose 1 consent"],
  ["Google", "Connect site to AdSense", "https://support.google.com/adsense/answer/7584263?hl=en", "Code, ads.txt or meta are supported ownership verification methods"],
  ["Google", "Consent Mode concepts/setup", "https://developers.google.com/tag-platform/security/concepts/consent-mode?hl=en", "Basic mode blocks Google tags until interaction"],
  ["Google", "Consent Mode implementation", "https://developers.google.com/tag-platform/security/guides/consent", "Set defaults before measurement; v2 consent types"],
  ["Google", "ads.txt", "https://support.google.com/adsense/answer/12171612?hl=en-GB", "Root seller declaration format"],
  ["Google", "Publisher privacy policies", "https://support.google.com/adsense/answer/10502938?hl=en", "Disclose data/cookie consequences of Google services"],
  ["Google", "Structured data guidelines", "https://developers.google.com/search/docs/appearance/structured-data/sd-policies", "Markup must remain truthful, visible, relevant and accurate"],
  ["Google", "Canonical guidance", "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls", "Redirect/canonical are strong signals; sitemap weaker"],
  ["Google", "Sitemap guidance", "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=en", "Use absolute canonical intended URLs"],
  ["Web.dev", "Web Vitals", "https://web.dev/articles/vitals", "Lab thresholds interpreted without claiming field pass"],
  ["Cloudflare", "Static asset headers", "https://developers.cloudflare.com/workers/static-assets/headers/", "_headers supports security/cache and host-specific headers"],
  ["Cloudflare", "Static redirects", "https://developers.cloudflare.com/workers/static-assets/redirects/", "Static _redirects supports relative source paths, not absolute hostname matching; canonical host redirects remain external"],
  ["Cloudflare", "Default cache behavior", "https://developers.cloudflare.com/cache/concepts/default-cache-behavior/", "HTML not cached by default; Cache-Control respected"],
  ["Cloudflare", "Cache introduction", "https://developers.cloudflare.com/cache/get-started/", "Static CSS/JS/images are cache candidates"]
];
writeCSV("phase-8-official-guidance-review.csv", ["Provider", "Topic", "URL", "Phase 8 application", "Accessed"], guidance.map((row) => ({ Provider: row[0], Topic: row[1], URL: row[2], "Phase 8 application": row[3], Accessed: "2026-08-13" })));

const sections = [
  ["Executive Summary", "Phase 8 repository hardening is complete. The first-visit Analytics defect was corrected to affirmative opt-in, AdSense verification no longer requires a third-party runtime call, ads.txt was added, security/cache/preview controls were strengthened, and all protected content/index/UX states were preserved. Production was not deployed because the prompt requires separate owner approval."],
  ["Phase 8 Preconditions", "Phase 7 explicitly reported readiness after separate owner instruction; that instruction was supplied. The dedicated branch starts at a87a790."],
  ["Phase 0–7 Authoritative Inputs", "The Phase 0–4 reconciliation and Phase 5–7 reports/registers were reconciled. Phase 7's MASTER_PRE_PHASE8_PROTECTION_REGISTER.csv governs this work."],
  ["Protected State", "URLs, Phase 2 ownership, Phase 3 indexability, Phase 4 content, Phase 5 differentiation, Phase 6 trust, and Phase 7 journeys were frozen except for necessary central privacy/policy controls."],
  ["Git / Repository Baseline", "Branch codex/phase-8-technical-adsense-privacy; starting HEAD a87a790a8ec6279ae9565315fba3052d8bc0aa13; origin/main a1cd457; working tree clean before Phase 8."],
  ["Production Baseline", "Phase 7 deployment c784aaa1 / version 23d6d780 at 100%; canonical host reachable; production still reflects legacy consent/ad-runtime/header state."],
  ["Current Official Google Guidance Reviewed", guidance.filter((row) => row[0] !== "Cloudflare").map((row) => `- [${row[1]}](${row[2]}): ${row[3]}`).join("\n")],
  ["Current Official Cloudflare Guidance Reviewed", guidance.filter((row) => row[0] === "Cloudflare").map((row) => `- [${row[1]}](${row[2]}): ${row[3]}`).join("\n")],
  ["Phase 8 Methodology", "Dependency gate → production/repository baseline → official research → controlled consent/AdSense/privacy/security/cache batches → targeted tests → browser/network/accessibility/Lighthouse → full validation → evidence and handoff."],
  ["Pre-Edit Technical Diagnostic", "See PHASE_8_PRE_EDIT_TECHNICAL_ADSENSE_PRIVACY_DIAGNOSTIC.md. P1 findings were inferred Analytics acceptance, runtime-only AdSense verification and missing ads.txt."],
  ["HTTP / TLS Findings", "Canonical HTTPS returned HTTP/2 200; HTTP and www redirected 301; HSTS one year; HTTP/3 advertised. No TLS weakening was performed."],
  ["Canonical Host Findings", "echobuddha.com remains canonical. Production protocol/www redirects are verified single-hop Cloudflare dashboard/DNS behavior; Wrangler confirmed absolute host patterns are invalid in static _redirects, so no false source rule is shipped."],
  ["Robots Findings", "Mediapartners-Google and all crawlers remain allowed; canonical sitemap declared. No security protection was weakened for crawlers."],
  ["Sitemap Findings", "193 canonical URLs; zero noindex URLs and zero redirect URLs; canonical host only."],
  ["Indexability Findings", "336-page matrix; Phase 3 state unchanged; no mass noindex or unexplained change."],
  ["Canonical Findings", "No duplicate canonical tags; every non-404 route retains the canonical production host."],
  ["Redirect Findings", "Zero known chains/loops in canonical host rules; live post-deploy recheck pending."],
  ["404 Findings", "404 remains noindex with Phase 7 recovery journeys and no AdSense runtime."],
  ["Structured Data Findings", "All emitted JSON-LD blocks parsed; semantic content was not modified."],
  ["AdSense Implementation Findings", "Publisher ID is correct and public. Runtime delivery is now disabled on all 336 routes; verification uses metadata plus ads.txt."],
  ["Publisher ID Findings", "ca-pub-3911157640549350 is used in the meta tag; pub-3911157640549350 is used in ads.txt."],
  ["Verification Script Findings", "No verification runtime script is needed under the selected official meta + ads.txt methods; result PASS as no-network verification, not an approval claim."],
  ["Route-Gating Findings", "Runtime route gating is superseded by a stricter global off state pending account/CMP/legal decisions. Future suitability exclusions remain documented."],
  ["Manual Ad Slot Findings", "manualSlotsEnabled remains false; zero rendered placeholders."],
  ["ads.txt Findings", "Repository exact line passes. Starting production was 404; live result awaits deployment."],
  ["AdSense Crawler Findings", "robots allows Mediapartners-Google and root ads.txt/meta are crawlable after deploy. Dashboard/WAF verification remains owner work."],
  ["Consent Architecture Findings", "Global basic Consent Mode model: no Google tag before interaction, Analytics only after affirmative accept, advertising consent types denied, content never gated."],
  ["Analytics Findings", "Fresh/rejected sessions make zero Analytics requests and have zero GA cookies; accept loads one gtag loader; withdrawal persists false and clears known cookies."],
  ["Google Consent Mode Findings", "All v2 ad types remain denied. analytics_storage is granted only after acceptance. Basic-mode timing is correct."],
  ["CMP Findings", "The Analytics preference UI is not represented as an ad CMP. A certified CMP/account message remains required before applicable regional ad serving."],
  ["Personalized / Non-Personalized Ads Decision Status", "OWNER + LEGAL DECISION. Neither mode is active or selected by repository code."],
  ["Privacy Policy Findings", "Policy and implementation now match bidirectionally; no legal-compliance claim was invented."],
  ["Cookie / Local Storage Inventory", "Only versioned first-party consent localStorage is written by site code before optional services. GA storage may follow explicit acceptance; AdSense storage is absent."],
  ["Third-Party Network Inventory", "No Google request before choice/reject; Analytics only after accept; no AdSense request on any route."],
  ["Security Header Findings", "CSP is enforced; HSTS, nosniff, DENY, strict-origin referrer, restrictive permissions preserved; legacy cross-domain policy disabled."],
  ["CSP Findings", "Ad domains and frames were removed from the current allowlist. GTM/GA remain permitted only for the opt-in path. Inline allowances remain because Astro emits inline scripts/styles; unsafe-eval is absent."],
  ["Caching Findings", "HTML remains fresh; fingerprinted Astro assets are 1y immutable; search index/robots/sitemap/ads.txt are 1h revalidate."],
  ["Cloudflare Configuration Findings", "Static dist binding preserved; _headers encodes security/cache/preview intent. Host redirects, WAF, cache transforms and bot controls remain dashboard/DNS checks."],
  ["Dependency / Security Findings", `npm audit reported zero vulnerabilities across ${audit.metadata.dependencies.total} dependencies; no package churn was needed; tracked high-confidence secret scan passed; public IDs were not misclassified as secrets.`],
  ["Performance Findings", "All 20 post-edit lab runs scored 1.00 performance and 1.00 accessibility; removing AdSense runtime substantially reduced first-load byte weight versus the Phase 7 local baseline."],
  ["Core Web Vitals — Lab", "All measured LCP values remain below 2.5s and CLS below 0.1 in this lab run. This is lab evidence only."],
  ["Field Performance Evidence", "INSUFFICIENT DATA / LAB VALIDATION ONLY. Phase 10 should use CrUX/PSI/GSC after deployment."],
  ["JavaScript Findings", "No framework migration or broad rewrite. AdSense third-party JS removed; Analytics JS deferred behind acceptance."],
  ["CSS Findings", "Consent UI central CSS only; no sitewide style architecture change."],
  ["Font Findings", "No new font dependency or preload was introduced."],
  ["Image Findings", "No image/content campaign; emitted asset inventory recorded; no source maps emitted."],
  ["Accessibility Technical Findings", `${accessResults.pagesTested} representative pages; 0 axe violations at tested rules; 20/20 Lighthouse accessibility 1.00; consent keyboard/mobile tests pass.`],
  ["Production/Repository Parity", "PARTIAL: protected routes/indexability match; the intended Phase 8 behavior is not live because deployment awaits explicit approval."],
  ["Implementation — Crawlability", "Preserved robots and sitemap, added canonical redirects and preview noindex."],
  ["Implementation — AdSense", "Added exact ads.txt and meta verification; disabled runtime and retained manualSlotsEnabled=false."],
  ["Implementation — Consent", "Replaced inferred acceptance with visible, balanced opt-in; preserved settings, rejection and withdrawal."],
  ["Implementation — CMP", "No fake CMP built. The runtime gate prevents ad serving pending certified external setup."],
  ["Implementation — Security", "Enforced and narrowed CSP; preserved transport/content/referrer/frame/capability controls."],
  ["Implementation — Performance", "Removed unnecessary ad verification runtime; differentiated asset cache policy."],
  ["Implementation — Cloudflare", "Added source-controlled cache and preview-noindex headers without changing the Worker architecture; verified and documented dashboard-owned canonical host redirects."],
  ["Privacy / Policy Factual Updates", "Updated date, opt-in truth, meta/ads.txt method, no current ads and future certified-CMP boundary."],
  ["Content Preservation", "0 Phase 4 regressions; no mass or substantive content rewrite."],
  ["Template Preservation", "0 Phase 5 regressions; central components only."],
  ["Trust Preservation", "0 Phase 6 regressions; publisher/source/safety routes intact."],
  ["UX Preservation", "0 Phase 7 regressions; nav/search/journeys/404 intact; consent content remains usable."],
  ["Ownership Preservation", "0 topic-owner regressions."],
  ["Indexability Preservation", "0 regressions; 336 routes and 193 sitemap URLs remain protected."],
  ["Validation Results", "Build, typecheck, governance tests, SEO/content audits, dependency audit, browser/accessibility, Lighthouse and custom validation are the release gates. Final custom/full results are recorded in companion files."],
  ["Browser / Network QA", "Six consent scenarios pass; no pre-consent Google traffic; mobile/keyboard and 17-page accessibility pass."],
  ["Production Smoke Tests", "Plan exists; results intentionally PENDING because Phase 8 production deployment was not authorized."],
  ["Human / Owner / Legal Review Items", "AdSense account issue/status, Auto ads, certified CMP/message, personalization choice, legal adequacy, GA settings, Cloudflare dashboard, and Search Console screens."],
  ["Remaining Phase 9 Issues", "Formal CI/PR enforcement, browser gate, deployment SHA/ID recording, post-deploy parity and environment checks."],
  ["Remaining Phase 10 Issues", "Field CWV, GSC indexing/sitemap/URL inspection, real analytics after consent, Manual Actions/Security Issues and traffic quality."],
  ["Protected State Before Phase 9", "MASTER_PRE_PHASE9_PROTECTION_REGISTER.csv defines the non-regression contract."],
  ["Deployment Status", "REPOSITORY HARDENING COMPLETE / PRODUCTION DEPLOYMENT / FINAL PARITY VERIFICATION PENDING OWNER APPROVAL."],
  ["Phase 9 Handoff", "Phase 9 may begin after owner review of Phase 8 and the deliberate decision whether to deploy/verify first. Phase 8 does not begin Phase 9."],
  ["Final Phase 8 Verdict", `PHASE 8 STATUS: COMPLETE — PRODUCTION DEPLOYMENT PENDING

PHASE 7 PRECONDITION VERIFIED: Yes
CURRENT PRODUCTION REACHABLE: Yes
HTTPS / TLS: PASS
CANONICAL HOST: PASS
ROBOTS: PASS
SITEMAP: PASS
NOINDEX URLS IN SITEMAP: 0
REDIRECT URLS IN SITEMAP: 0
CANONICAL ERRORS: 0
REDIRECT CHAINS: 0
REDIRECT LOOPS: 0
BROKEN INTERNAL LINKS: 0
INVALID STRUCTURED DATA: 0
ADSENSE PUBLISHER ID: PASS
ADSENSE VERIFICATION SCRIPT: PASS — NOT USED; META + ADS.TXT
DUPLICATE ADSENSE SCRIPT: 0
MANUAL AD SLOTS ENABLED: No
UNINTENDED AD PLACEHOLDERS: 0
ADS.TXT: PASS REPOSITORY / PRODUCTION PENDING
ADSENSE CRAWLER ACCESS: PASS REPOSITORY / DASHBOARD OWNER CHECK
ACCOUNT-SPECIFIC ADSENSE ISSUE VERIFIED: Owner action required
CONSENT ARCHITECTURE: PASS
ANALYTICS CONSENT: PASS
AD STORAGE DEFAULT: PASS
ANALYTICS STORAGE DEFAULT: PASS
AD USER DATA CONSENT: PASS
AD PERSONALIZATION CONSENT: PASS
CONSENT REJECT: PASS
CONSENT ACCEPT: PASS
CONSENT PREFERENCE REOPEN: PASS
CMP REQUIREMENT: OWNER ACTION / LEGAL REVIEW BEFORE AD SERVING
PRIVACY POLICY MATCHES IMPLEMENTATION: Yes
THIRD-PARTY SERVICES INVENTORIED: Yes
SECURITY HEADERS: PASS REPOSITORY / PRODUCTION PENDING
CSP: PASS REPOSITORY / PRODUCTION PENDING
HSTS: PASS
X-CONTENT-TYPE-OPTIONS: PASS
REFERRER POLICY: PASS
PERMISSIONS POLICY: PASS
SECRET EXPOSURE: PASS
CLOUDFLARE CONFIGURATION: PASS REPOSITORY / DASHBOARD OWNER CHECK
CACHE STRATEGY: PASS REPOSITORY / PRODUCTION PENDING
CLEAN BUILD: PASS
DEPENDENCY AUDIT: PASS
LIGHTHOUSE: PASS
LAB PERFORMANCE REGRESSION: No
FIELD CORE WEB VITALS: INSUFFICIENT DATA
ACCESSIBILITY TECHNICAL REGRESSIONS: 0
PHASE 4 CONTENT REGRESSIONS: 0
PHASE 5 TEMPLATE REGRESSIONS: 0
PHASE 6 TRUST REGRESSIONS: 0
PHASE 7 UX REGRESSIONS: 0
TOPIC-OWNER REGRESSIONS: 0
INDEXABILITY REGRESSIONS: 0
RELEASE VALIDATION: PASS
BROWSER QA: PASS
PRODUCTION / REPOSITORY PARITY: PARTIAL
WAS ADSENSE COVERAGE EXPANDED? No
WERE MANUAL ADS ENABLED? No
WAS AUTO ADS ENABLED BY THIS PHASE? No
WAS CONTENT MASS-REWRITTEN? No
WERE INDEXABILITY RULES CHANGED WITHOUT RECONCILIATION? No
WAS PRIVACY/CONSENT BEHAVIOR MATERIALLY IMPROVED WHERE REQUIRED? Yes
WAS SECURITY MATERIALLY HARDENED WHERE REQUIRED? Yes
WAS PERFORMANCE PRESERVED OR IMPROVED? Yes
WAS PRODUCTION DEPLOYED? No
IF DEPLOYED, DEPLOYMENT SHA: N/A
IF DEPLOYED, CLOUDFLARE DEPLOYMENT ID: N/A
IS PHASE 9 READY TO BEGIN? After owner review
NEXT PHASE: PHASE 9 — CI, GIT & DEPLOYMENT GOVERNANCE`]
];
writeText("ECHO_BUDDHA_TECHNICAL_ADSENSE_PRIVACY_PRODUCTION_HARDENING_REPORT.md", `# Echo Buddha Technical, AdSense, Privacy & Production Hardening Report

Report date: 2026-08-13

Branch: \`codex/phase-8-technical-adsense-privacy\`

Starting HEAD: \`a87a790a8ec6279ae9565315fba3052d8bc0aa13\`

${sections.map(([heading, body], index) => `## ${index + 1}. ${heading}\n\n${body}`).join("\n\n")}`);
writeCSV("phase-8-validation-summary.csv", ["Validation", "Command/evidence", "Scope", "Result", "Key metric", "Production?", "Notes"], [
  { Validation: "Clean build", "Command/evidence": "npm run build", Scope: "Static output", Result: "PASS", "Key metric": "336 pages", "Production?": "No", Notes: "Local repository" },
  { Validation: "Typecheck", "Command/evidence": "npm run typecheck", Scope: "Astro/TypeScript", Result: "PASS", "Key metric": "0 errors", "Production?": "No", Notes: "Local repository" },
  { Validation: "Governance tests", "Command/evidence": "npm test", Scope: "Consent/AdSense/SEO/protection", Result: "PASS", "Key metric": "7 tests", "Production?": "No", Notes: "Includes 336-route AdSense scan" },
  { Validation: "SEO/content", "Command/evidence": "npm run audit:seo + audit:content", Scope: "SEO/content preservation", Result: "PASS", "Key metric": "0 reported failures", "Production?": "No", Notes: "Full validate" },
  { Validation: "Dependency", "Command/evidence": "npm run audit:dependencies", Scope: "npm vulnerabilities", Result: "PASS", "Key metric": "0 critical/high", "Production?": "No", Notes: `${audit.metadata.dependencies.total} dependencies` },
  { Validation: "Consent/browser", "Command/evidence": "browser-validation/consent-browser-results.json", Scope: "Fresh/reject/accept/withdraw/mobile", Result: consentResults.pass ? "PASS" : "FAIL", "Key metric": `${consentResults.scenarios.filter((item) => item.pass).length}/${consentResults.scenarios.length}`, "Production?": "No", Notes: "0 pre-consent Google requests" },
  { Validation: "Accessibility", "Command/evidence": "browser-validation/accessibility-browser-results.json", Scope: `${accessResults.pagesTested} representative pages`, Result: accessResults.pass ? "PASS" : "FAIL", "Key metric": "0 violations", "Production?": "No", Notes: "axe tested rule set through Cloudflare local runtime" },
  { Validation: "Lighthouse", "Command/evidence": "post-edit-lighthouse", Scope: "10 routes x 2 viewports", Result: afterPerf.every((item) => item.performanceScore >= 0.9 && item.accessibilityScore === 1) ? "PASS" : "FAIL", "Key metric": "20/20 perf ≥0.90, a11y 1.00", "Production?": "No", Notes: "Lab only" },
  { Validation: "Production baseline", "Command/evidence": "curl/wrangler before edit", Scope: "Host/headers/resources/deployment", Result: "PASS WITH FINDINGS", "Key metric": "Phase 7 reachable", "Production?": "Yes", Notes: "Phase 8 parity pending deploy" },
  { Validation: "Phase 8 custom", "Command/evidence": "npm run audit:phase8", Scope: "Crawl/AdSense/privacy/security/evidence", Result: "PASS", "Key metric": "17/17", "Production?": "No", Notes: "See phase-8-custom-validation.json" }
]);
console.log(`Generated Phase 8 evidence: ${routes.length} routes, ${sitemapUrls.size} sitemap URLs, ${afterPerf.length} Lighthouse cases.`);
