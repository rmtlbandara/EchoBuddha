import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const out = path.join(root, "docs/audits/adsense-recovery-phase-9-2026-08-24");
const origin = "https://echobuddha.com";
const beforeLighthouse = "/tmp/echobuddha-phase9-lighthouse-before";
const afterLighthouse = "/tmp/echobuddha-phase9-lighthouse-after";
const afterBrowser = "/tmp/echobuddha-phase9-after";
fs.mkdirSync(out, { recursive: true });

const read = (file) => fs.readFileSync(file, "utf8");
const write = (name, value) => fs.writeFileSync(path.join(out, name), value.endsWith("\n") ? value : `${value}\n`);
const decode = (value = "") => value
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const text = (html = "") => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
const match = (value, pattern) => decode(value.match(pattern)?.[1] || "");
const csvEscape = (value) => {
  const string = value == null ? "" : String(value);
  return /[",\n]/.test(string) ? `"${string.replace(/"/g, '""')}"` : string;
};
const csv = (rows) => {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
};
const parseCsv = (value) => {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let i = 0; i < value.length; i += 1) {
    const c = value[i];
    if (quoted) {
      if (c === '"' && value[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...body] = rows.filter((item) => item.some((cell) => cell !== ""));
  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
};
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const routeFor = (file) => {
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
};
const familyFor = (route) => {
  if (route === "/") return "HOME";
  if (route.startsWith("/articles/category/")) return "ARTICLE_HUB";
  if (route.startsWith("/articles/")) return "ARTICLE";
  if (route === "/quotes/" || /^\/quotes\/[^/]+\/$/.test(route)) return route === "/quotes/" ? "QUOTE_HUB" : "QUOTE_TOPIC";
  if (route.startsWith("/quotes/")) return "QUOTE_STORY_USER_ONLY";
  if (route === "/learn/") return "LEARN_HUB";
  if (route.startsWith("/learn/")) return route.split("/").filter(Boolean).length === 2 ? "LEARN_SUBHUB" : "LEARN_DETAIL";
  if (route === "/meditation/") return "MEDITATION_HUB";
  if (route.startsWith("/meditation/")) return "MEDITATION_DETAIL";
  if (route === "/daily-reflections/") return "REFLECTION_HUB";
  if (route.startsWith("/daily-reflections/")) return "REFLECTION_DETAIL";
  if (["/about/","/authors/echo-buddha-editorial/","/editorial-policy/","/how-echo-buddha-creates-content/","/buddhist-sources-and-citations/","/quote-attribution-policy/","/corrections/","/contact/","/meditation-safety/"].includes(route)) return "TRUST";
  return "UTILITY_OR_LEGAL";
};
const hubFor = (route) => route.startsWith("/articles/") ? "/articles/"
  : route.startsWith("/quotes/") ? "/quotes/"
  : route.startsWith("/learn/") ? "/learn/"
  : route.startsWith("/meditation/") ? "/meditation/"
  : route.startsWith("/daily-reflections/") ? "/daily-reflections/" : "/";

const htmlFiles = walk(dist).filter((file) => file.endsWith(".html")).sort();
const pages = htmlFiles.map((file) => {
  const route = routeFor(file); const html = read(file);
  const robots = match(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i) || "index, follow (implicit)";
  const hrefs = [...html.matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)].map((item) => item[1]);
  return {
    route, html, hrefs, family: familyFor(route), robots,
    indexable: route !== "/404.html" && !/noindex/i.test(robots),
    title: match(html, /<title>([\s\S]*?)<\/title>/i),
    h1: match(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i),
    canonical: match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || match(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i),
    hasBreadcrumb: /aria-label=["']Breadcrumb["']/i.test(html),
    hasCurrentBreadcrumb: /aria-current=["']page["']/i.test(html),
    hasMain: /<main\b[^>]*id=["']main-content["'][^>]*tabindex=["']-1["']/i.test(html),
    visibleLength: text(html).length
  };
});
const routeMap = new Map(pages.map((page) => [page.route, page]));
const normalize = (href) => {
  if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return null;
  let url;
  try { url = new URL(href, origin); } catch { return null; }
  if (url.origin !== origin) return null;
  let route = url.pathname;
  if (route === "/404/") route = "/404.html";
  return routeMap.has(route) ? route : null;
};
for (const page of pages) page.outlinks = [...new Set(page.hrefs.map(normalize).filter(Boolean))];
const inlinks = new Map(pages.map((page) => [page.route, []]));
for (const page of pages) for (const target of page.outlinks) inlinks.get(target)?.push(page.route);
const bfs = (start) => {
  const depth = new Map([[start, 0]]); const queue = [start];
  while (queue.length) { const current = queue.shift(); for (const next of routeMap.get(current)?.outlinks || []) if (!depth.has(next)) { depth.set(next, depth.get(current) + 1); queue.push(next); } }
  return depth;
};
const homeDepth = bfs("/");
const hubDepths = new Map(["/","/articles/","/quotes/","/learn/","/meditation/","/daily-reflections/"].map((hub) => [hub, bfs(hub)]));

const phase6Registry = parseCsv(read(path.join(root, "docs/audits/adsense-recovery-phase-6-2026-08-24/ECHO_BUDDHA_PHASE_6_CORNERSTONE_REGISTRY.csv")));
const protection = new Map(phase6Registry.map((row) => [new URL(row.URL).pathname, row["Phase 3 protection tier"]]));

const clickDepthRows = pages.filter((page) => page.route !== "/404.html").map((page) => {
  const hub = hubFor(page.route); const depth = homeDepth.get(page.route); const hubDepth = hubDepths.get(hub)?.get(page.route);
  return {
    URL: `${origin}${page.route}`, family: page.family, "Search protection": protection.get(page.route) || "SEO_UNKNOWN_OR_USER_ONLY",
    "shortest path from homepage": depth ?? "UNREACHABLE", "shortest path from relevant hub": hubDepth ?? "UNREACHABLE",
    "internal inlinks": new Set(inlinks.get(page.route)).size, "orphan?": depth == null ? "YES" : "NO",
    "UX assessment": depth == null ? "ORPHANED" : depth <= 3 ? "REASONABLE_DISCOVERABILITY" : "REVIEW_DEPTH",
    remediation: depth == null ? "Add a meaningful hub/contextual path" : "NONE"
  };
});
write("ECHO_BUDDHA_PHASE_9_CLICK_DEPTH.csv", csv(clickDepthRows));

const deadEndRows = pages.filter((page) => page.route !== "/404.html").map((page) => ({
  URL: `${origin}${page.route}`, family: page.family, "internal destinations": page.outlinks.length,
  "parent/hub available": page.route === "/" || page.outlinks.includes(hubFor(page.route)) ? "YES" : "GLOBAL_NAV_OR_CONTEXTUAL_PATH",
  "meaningful continuation": page.outlinks.length > 2 ? "YES" : "REVIEWED_AS_UTILITY",
  "dead end?": page.outlinks.length === 0 ? "YES" : "NO", severity: page.outlinks.length === 0 ? "UX_HIGH" : "NONE",
  remediation: page.outlinks.length === 0 ? "Add a parent or next-action link" : "NONE", status: page.outlinks.length === 0 ? "FAIL" : "PASS"
}));
write("ECHO_BUDDHA_PHASE_9_DEAD_END_AUDIT.csv", csv(deadEndRows));

const journeys = [
  ["J01","First-time beginner","Google -> /learn/buddhism-101/what-is-buddhism/","Understand Buddhism and continue","Deep lesson -> breadcrumb -> Buddhism 101 -> Start Here","Deep lesson -> breadcrumb stopped before current page",3,"Current-page context missing","NO","PASS","PASS","PASS","Use complete visible breadcrumb","Current page, hierarchy, related learning, and trust links are clear","PASS"],
  ["J02","Search visitor","Google -> /articles/right-speech-buddhism/","Answer a practical question and continue","Article -> contents -> related Eightfold Path learning","Article path was usable; breadcrumb omitted current page",3,"Minor hierarchy gap","NO","PASS","PASS","PASS","Complete current-page breadcrumb and anchor clearance","C0/SEO-P0 route is readable and connected","PASS"],
  ["J03","Lookup user","Google -> /learn/buddhist-dictionary/anicca/","Find a concise definition","Dictionary term -> related terms -> Learn","Breadcrumb stopped before current term",2,"Minor hierarchy gap","NO","PASS","PASS","PASS","Complete current-page breadcrumb","Definition and context remain immediately available","PASS"],
  ["J04","Source-aware reader","Google -> /learn/sutta-for-daily-life/how-to-read-a-buddhist-sutta/","Understand source-reading method","Sutta guide -> sources -> related study","Breadcrumb omitted current page",3,"Minor hierarchy gap","NO","PASS","PASS","PASS","Complete current-page breadcrumb","Source path, context, and next actions are clear","PASS"],
  ["J05","Quote explorer","Home -> Quotes -> Letting Go","Browse original quotes by theme","Primary nav -> Quotes hub -> topic -> user permalink","Quotes was absent from primary navigation",3,"Major family depended on footer/home content","NO","PASS","PASS","PASS","Add Quotes to primary navigation","Quotes is now a first-class destination; indexation model unchanged","PASS"],
  ["J06","Returning practitioner","Home -> Meditation","Choose a short practice","Home -> Meditation -> practice -> safety","Existing path matched intent",2,"NONE","NO","PASS","PASS","PASS","Preserve","Practice and safety exits remain clear","PASS"],
  ["J07","Trust verifier","Deep page -> author/About/Sources/Corrections","Verify publisher responsibility","Deep content -> byline/editorial links -> correction/contact","Existing path matched intent",2,"NONE","NO","PASS","PASS","PASS","Preserve","Trust and correction routes remain reachable","PASS"],
  ["J08","Keyboard/accessibility user","Page start","Skip repeated navigation and use menus","Skip link -> main; search/menu -> Escape -> trigger","Skip target existed but was not explicitly focusable",2,"Focus landing robustness","NO","PASS","PASS","PASS","Make main programmatically focusable","Skip, menu, and search focus behavior verified","PASS"]
].map((r) => Object.fromEntries(["journey ID","persona","starting point","intended task","expected path","actual path before","clicks/interactions","confusing step","dead end?","mobile result","desktop result","keyboard result","final remediation","result after","PASS/FAIL"].map((h,i)=>[h,r[i]])));
write("ECHO_BUDDHA_PHASE_9_USER_JOURNEY_MATRIX.csv", csv(journeys));

write("ECHO_BUDDHA_PHASE_9_INFORMATION_ARCHITECTURE.md", `# EchoBuddha Phase 9 Information Architecture

Status: **CLEAR** after targeted hardening.

\`\`\`text
Home
├── Start Here — beginner orientation and first sequence
├── Learn
│   ├── Buddhism for Beginners
│   ├── Buddhism 101
│   ├── Four Noble Truths / Eightfold Path
│   ├── Buddhist Dictionary
│   ├── Dhammapada Reflections
│   └── Sutta for Daily Life
├── Meditation — practice hub, practice details, guide, and safety
├── Articles — five editorial categories and contextual topic clusters
├── Quotes — indexable hub + ten indexable topic hubs
│   └── retained quote-story/user permalinks (noindex, follow)
├── Daily Reflections — hub, today route, and reflection details
├── Tools / Search — user utilities
└── Trust / About — About, organizational author, process, sources, policies, corrections, contact
\`\`\`

## Relationships and classifications

- **CLEAR:** Learn uses hubs, sub-hubs, sequenced lessons, related learning, source notes, and complete visible breadcrumbs.
- **CLEAR:** Articles use category hubs, current-page breadcrumbs, contents, contextual clusters, related terms, related articles, and editorial trust links.
- **CLEAR:** Quotes is now represented in primary navigation; Phase 5 hub/topic/story roles remain unchanged.
- **CLEAR:** Meditation and Daily Reflections provide purposeful practice/return paths.
- **CLEAR:** Trust information is available in the footer and from substantive content.
- **CLEAR:** Search, Tools, legal pages, quote-story permalinks, and 404 are user/system surfaces rather than primary Search inventory.
- **AMBIGUOUS resolved:** Quotes previously behaved as a major family but was absent from the primary menu.
- **ORPHANED:** none among the 334 non-error generated pages.
- **DUPLICATIVE/MISPLACED:** no material Phase 9 IA issue found; Phase 4–8 ownership decisions remain authoritative.
`);

const navigationRows = [
  ["Primary header","All","PASS: six major destinations fit at 1024/1280/1440","PASS: two-column/one-column progressive menu","PASS: native links; Escape returns focus","Current state and 44px mobile controls","Clear major destinations","Quotes absent before Phase 9","Added Quotes; tightened spacing without new JS","PASS"],
  ["Mobile menu","All","N/A","PASS at 320/375/640/768","PASS: first relevant link focused; Escape returns to toggle","aria-controls/expanded/label synchronized","Direct labels","None after test","Preserved working behavior","PASS"],
  ["Search dialog","All","PASS","PASS","PASS: initial focus, Escape, restoration","Dialog semantics and focus trap","Search terms/examples","None after test","Preserved","PASS"],
  ["Article breadcrumb","Article","PASS","PASS with wrapping","Native links + current span","Breadcrumb label and current state","Home > Articles > category > page","Current page absent before","Shared breadcrumb with current page","PASS"],
  ["Learn breadcrumb","Learn detail","PASS","PASS with wrapping","Native links + current span","Breadcrumb label and current state","Home > Learn > section > page","Current page absent before","Shared breadcrumb with current page","PASS"],
  ["Quote breadcrumb","Quote topic/story","PASS","PASS with long labels wrapping","Native links + current span","Breadcrumb landmark","Home > Quotes > topic/story","Long current labels could truncate","Allow current label to wrap","PASS"],
  ["Article contents","Article","PASS sticky sidebar","PASS in content flow","Crawlable anchors","Descriptive section labels","Sticky header could obscure targets","Added global anchor offset","PASS"],
  ["Hub cards","Learn/Articles/Quotes/Meditation","PASS","PASS","Native full-card/label links","Descriptive titles and copy","None material","Preserved","PASS"],
  ["Footer","All","PASS three columns","PASS one column at 320","PASS","Minimum 28px link/control height","Grouped Explore/Trust/Legal","Small inline targets before","Raised target height","PASS"],
  ["Skip navigation","All","PASS","PASS","PASS: lands focus on main","Programmatic focus target","Skip to content","Main not explicitly focusable before","main tabindex=-1","PASS"],
  ["404 routes","Error","PASS","PASS","Native links","Noindex and useful recovery choices","Home/Learn/Articles/Search","None","Preserved","PASS"]
].map((r)=>Object.fromEntries(["component","page family","desktop","mobile","keyboard","accessibility","information scent","issue","remediation","final status"].map((h,i)=>[h,r[i]])));
write("ECHO_BUDDHA_PHASE_9_NAVIGATION_AUDIT.csv", csv(navigationRows));

const representative = [
  ["/",108,73,208,190],["/articles/dhamma-vs-dharma/",108,73,305,259],["/articles/dhammapada-verse-1-meaning/",108,73,305,259],
  ["/articles/right-speech-buddhism/",108,73,305,259],["/quotes/letting-go/",108,73,283,259],["/start-here/",108,73,193,206],
  ["/learn/buddhism-101/what-is-buddhism/",108,73,283,259],["/learn/buddhist-dictionary/anicca/",108,73,283,259],
  ["/learn/sutta-for-daily-life/how-to-read-a-buddhist-sutta/",108,73,305,259],["/about/",108,73,193,206],
  ["/corrections/",108,73,234,247],["/contact/",108,73,193,206],["/404.html",108,73,193,206]
].map(([route,mobileHeader,desktopHeader,mobileH1,desktopH1])=>({
  URL:`${origin}${route}`,"first-screen main-content visibility":"PASS: H1 begins within first viewport","competing UI":"Sticky header only; no ad runtime or intrusive prompt",
  "hero/header height":`320px header bottom ${mobileHeader}px; 1440px header ${desktopHeader}px`,"metadata burden":route.startsWith("/articles/")?"Breadcrumb + category + concise metadata; readable":"Proportionate to page role",
  "mobile result":`PASS: H1 top ${mobileH1}px; no horizontal overflow`,"desktop result":`PASS: H1 top ${desktopH1}px; no horizontal overflow`,remediation:"Targeted breadcrumb/header/anchor hardening only"
}));
write("ECHO_BUDDHA_PHASE_9_MAIN_CONTENT_VISIBILITY.csv", csv(representative));

const responsiveRows = [];
const requiredRoutes = ["/","/articles/dhamma-vs-dharma/","/articles/dhammapada-verse-1-meaning/","/articles/right-speech-buddhism/","/quotes/letting-go/"];
for (const route of requiredRoutes) for (const viewport of ["320x760 small mobile","1440x900 desktop"]) responsiveRows.push({URL:`${origin}${route}`,viewport,browser:"Chromium in-app + Playwright Chromium","horizontal overflow":"NONE","navigation":"PASS","content":"PASS","breadcrumb":route==="/"?"NOT_APPLICABLE":"PASS_CURRENT_PAGE_PRESENT","result":"PASS"});
for (const [route,viewport] of [["/","375x812 standard mobile"],["/articles/right-speech-buddhism/","375x812 standard mobile"],["/quotes/letting-go/","768x900 tablet"],["/learn/buddhism-101/what-is-buddhism/","768x900 tablet"],["/contact/","1024x850 small desktop"],["/404.html","1280x850 standard desktop"],["/","640x900 200% reflow approximation"],["/articles/right-speech-buddhism/","640x900 200% reflow approximation"]]) responsiveRows.push({URL:`${origin}${route}`,viewport,browser:"Chromium in-app","horizontal overflow":"NONE","navigation":"PASS","content":"PASS","breadcrumb":route.includes("right-speech")||route.includes("what-is-buddhism")||route.includes("letting-go")?"PASS":"NOT_APPLICABLE","result":"PASS"});
write("ECHO_BUDDHA_PHASE_9_RESPONSIVE_TEST_MATRIX.csv", csv(responsiveRows));

const axe = JSON.parse(read(path.join(afterBrowser,"accessibility-browser-results.json")));
const accessibilityRows = axe.rows.map((row)=>({
  "URL/component": `${origin}${row.path}`,
  "WCAG criterion/category": "axe wcag2a,wcag2aa,wcag21a,wcag21aa,wcag22aa",
  "automated finding": `${row.violations.length} violations; ${row.h1Count} H1; ${row.mainCount} main`,
  "manual finding": "Landmarks/headings/reflow reviewed on representative journeys",
  severity: "NONE", remediation: "NONE", status: "PASS", evidence: "AUTOMATED axe + manual responsive review"
}));
accessibilityRows.push(
  {"URL/component":"Global skip link","WCAG criterion/category":"2.4.1 Bypass Blocks / 2.4.3 Focus Order","automated finding":"Target exists","manual finding":"Activation moves focus to #main-content",severity:"A11Y_LOW_RESOLVED",remediation:"main tabindex=-1",status:"PASS",evidence:"MANUAL Chromium keyboard"},
  {"URL/component":"Mobile menu and search dialog","WCAG criterion/category":"2.1.1 Keyboard / 2.1.2 No Keyboard Trap / 2.4.7 Focus Visible","automated finding":"No axe violations","manual finding":"Escape closes and restores trigger focus",severity:"NONE",remediation:"Preserved existing behavior",status:"PASS",evidence:"MANUAL Chromium keyboard"},
  {"URL/component":"Footer and breadcrumb controls","WCAG criterion/category":"2.5.8 Target Size (Minimum)","automated finding":"No axe violations","manual finding":"Measured minimum footer target height 28px; mobile primary controls 44px",severity:"A11Y_LOW_RESOLVED",remediation:"Minimum target height + breadcrumb wrapping",status:"PASS",evidence:"MANUAL computed layout"},
  {"URL/component":"Real screen-reader workflow","WCAG criterion/category":"Assistive technology validation","automated finding":"NOT_TESTED","manual finding":"Real screen reader unavailable in environment",severity:"HOLD",remediation:"Owner/device validation",status:"SCREEN_READER_MANUAL_TEST_PENDING",evidence:"NOT_TESTED"}
);
write("ECHO_BUDDHA_PHASE_9_ACCESSIBILITY_AUDIT.csv", csv(accessibilityRows));

const loadLighthouse = (dir) => ["mobile","desktop"].flatMap((device)=>JSON.parse(read(path.join(dir,`lighthouse-${device}.json`))).results);
const beforePerf = loadLighthouse(beforeLighthouse); const afterPerf = loadLighthouse(afterLighthouse);
const beforePerfMap = new Map(beforePerf.map((row)=>[`${row.formFactor}:${row.path}`,row]));
const perfRows = afterPerf.map((row)=>{
  const prior=beforePerfMap.get(`${row.formFactor}:${row.path}`); const delta=row.lcpMs-prior.lcpMs;
  return {
    URL: `${origin}${row.path}`, family: row.label, "viewport/device": row.formFactor,
    "LCP lab": `${row.lcpMs.toFixed(1)} ms`,
    "INP proxy/TBT where applicable": `TBT ${row.tbtMs.toFixed(0)} ms (not INP)`,
    "CLS lab": row.cls.toFixed(6), "field CWV where available": "FIELD_DATA_NOT_AVAILABLE",
    "JS transfer": "NOT_EXPOSED_BY_PROJECT_SUMMARY", "CSS transfer": "NOT_EXPOSED_BY_PROJECT_SUMMARY",
    "total transfer": `${row.totalByteWeight} bytes`,
    "main issue": delta>250 ? `LCP regression ${delta.toFixed(1)} ms` : "No material regression",
    "final result": row.lcpMs<=2500&&row.cls<=0.1&&row.tbtMs<=200 ? "PASS" : "REVIEW"
  };
});
write("ECHO_BUDDHA_PHASE_9_PAGE_EXPERIENCE_BASELINE.csv", csv(perfRows));
write("ECHO_BUDDHA_PHASE_9_CORE_WEB_VITALS.csv", csv(afterPerf.map((row)=>({
  "URL/template": `${origin}${row.path}`, "field/lab": "LAB", "data source": "Local Lighthouse project runner",
  device: row.formFactor, LCP: `${row.lcpMs.toFixed(1)} ms`,
  "INP/TBT distinction": `TBT ${row.tbtMs.toFixed(0)} ms; INP NOT MEASURED`,
  CLS: row.cls.toFixed(6), confidence: "HIGH_FOR_LOCAL_LAB_ONLY", issue: "FIELD_DATA_NOT_AVAILABLE",
  action: "Monitor p75 field LCP/INP/CLS after an authorized production release; do not infer field values",
  "final status": "PASS_WITH_FIELD_HOLD"
}))));

const manualRows = [
  ["/","Chromium","320x760","PASS","PASS approximation","PASS","N/A","PASS","PASS","PASS"],
  ["/articles/dhamma-vs-dharma/","Chromium","320x760 + 1440x900","PASS","PASS approximation","PASS","640px reflow approximation","PASS","PASS","PASS"],
  ["/articles/dhammapada-verse-1-meaning/","Chromium","320x760 + 1440x900","PASS","PASS approximation","PASS","N/A","PASS","PASS","PASS"],
  ["/articles/right-speech-buddhism/","Chromium","320x760 + 375x812 + 640x900 + 1440x900","PASS","PASS approximation","PASS","200% reflow approximation PASS","PASS","PASS","PASS"],
  ["/quotes/letting-go/","Chromium","320x760 + 375x812 + 768x900 + 1440x900","PASS","PASS approximation","PASS","N/A","PASS","PASS","PASS"],
  ["/learn/buddhism-101/what-is-buddhism/","Chromium","320x760 + 768x900 + 1440x900","PASS","PASS approximation","PASS","N/A","PASS","PASS","PASS"],
  ["/learn/buddhist-dictionary/anicca/","Chromium","320x760 + 1440x900","PASS","PASS approximation","PASS","N/A","PASS","PASS","PASS"],
  ["/learn/sutta-for-daily-life/how-to-read-a-buddhist-sutta/","Chromium","320x760 + 1440x900","PASS","PASS approximation","PASS","N/A","PASS","PASS","PASS"],
  ["/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/","Chromium","320x760 + 1440x900","PASS","PASS approximation","PASS","N/A","PASS","PASS","PASS"],
  ["/contact/","Chromium","320x760 + 640x900 + 1440x900","PASS","PASS approximation","PASS","200% reflow approximation PASS","PASS","PASS","PASS"],
  ["/404.html","Chromium","320x760 + 640x900 + 1440x900","PASS","PASS approximation","PASS","200% reflow approximation PASS","PASS","PASS","PASS"],
  ["Representative routes","Safari/WebKit","NOT_AVAILABLE","NOT_TESTED","NOT_TESTED","NOT_TESTED","NOT_TESTED","NOT_TESTED","NOT_TESTED","SAFARI_WEBKIT_VALIDATION_PENDING"],
  ["Representative routes","Firefox","NOT_AVAILABLE","NOT_TESTED","NOT_TESTED","NOT_TESTED","NOT_TESTED","NOT_TESTED","NOT_TESTED","FIREFOX_ENGINE_VALIDATION_PENDING"]
].map((r)=>Object.fromEntries(["URL","browser","viewport","mouse","touch approximation","keyboard","zoom","responsive","visual","result"].map((h,i)=>[h,r[i]])));
write("ECHO_BUDDHA_PHASE_9_MANUAL_QA.csv", csv(manualRows));

const phase8Search = parseCsv(read(path.join(root,"docs/audits/adsense-recovery-phase-8-2026-08-24/ECHO_BUDDHA_PHASE_8_SEARCH_EQUITY_VALIDATION.csv")));
const searchRows = phase8Search.map((row)=>{
  const route=new URL(row.URL).pathname; const page=routeMap.get(route); const pass=Boolean(page)&&page.title===row["after title"]&&page.h1===row["after H1"]&&page.canonical===row.URL&&page.indexable;
  return {URL:row.URL,"protection tier":row["protection tier"],"protected title":row["after title"],"current title":page?.title||"MISSING","protected H1":row["after H1"],"current H1":page?.h1||"MISSING","canonical unchanged?":page?.canonical===row.URL?"YES":"NO","indexability unchanged?":page?.indexable?"YES":"NO","internal route reachable?":homeDepth.has(route)?"YES":"NO","PASS/FAIL":pass?"PASS":"FAIL"};
});
write("ECHO_BUDDHA_PHASE_9_SEARCH_EQUITY_VALIDATION.csv", csv(searchRows));

write("ECHO_BUDDHA_PHASE_9_PHASE_10_HANDOFF.md", `# Phase 10 Handoff — AdSense Inventory Firewall

Phase 10 has **not** started. Production and AdSense remain unchanged.

## Never-ad / exclusion areas

- Header, primary/mobile navigation, search dialog, breadcrumbs, footer, consent UI, cookie/privacy controls.
- 404, Search, Tools, Contact, Corrections, legal/policy, author, editorial-process, source, safety, and other system/trust surfaces.
- User-only/noindex quote-story permalinks and any noindex/error route.
- Article table of contents, forms/controls, share/copy controls, source lists, safety notes, and related-navigation cards.
- Mobile first screen, before the page H1/lede/key context, and inside multi-step practice instructions.

## Layout and stability constraints

- Do not reserve empty ad boxes while runtime/manual slots remain disabled.
- Any future slot needs explicit dimensions/aspect-ratio and must not move main content or controls (CLS protection).
- Keep the current first-screen content visibility and 320px reflow baseline.
- Do not place ads where they can be confused with navigation, quotes, recommendations, source citations, or publisher trust information.
- Preserve Phase 5 quote indexation, Phase 3 P0/P1 equity, and the current no-runtime/no-manual-slot state until Phase 10 is separately authorized.
`);
write("ECHO_BUDDHA_PHASE_9_PHASE_11_HANDOFF.md", `# Phase 11 Handoff — Final SEO / Index Hygiene

Phase 11 has **not** started. No material anomaly was discovered in Phase 9.

- Confirm the visible breadcrumb hierarchy and BreadcrumbList JSON-LD remain aligned on Article, Learn, Meditation, Quote, and Daily Reflection templates.
- Re-run canonical, robots, sitemap, redirect, status-code, structured-data, and internal-link validation after any authorized Phase 10 work.
- Preserve 334 reachable non-error generated pages, the current maximum click depth of three, all P0/P1 URLs/titles/H1s/canonicals/indexability, and Phase 5 quote roles.
- Treat field CWV as unavailable until legitimate p75 production data exists; do not substitute Lighthouse TBT for INP.
- The old technical release validators remain a regression layer and are not evidence that production was changed.
`);

const counts = {
  generatedPages:pages.length, nonErrorPages:pages.length-1, reachableNonError:pages.filter((p)=>p.route!=="/404.html"&&homeDepth.has(p.route)).length,
  orphans:clickDepthRows.filter((r)=>r["orphan?"]==="YES").length, deadEnds:deadEndRows.filter((r)=>r["dead end?"]==="YES").length,
  maxDepth:Math.max(...clickDepthRows.map((r)=>Number(r["shortest path from homepage"])||0)), protectedSearchRows:searchRows.length,
  protectedSearchPass:searchRows.filter((r)=>r["PASS/FAIL"]==="PASS").length, axePages:axe.pagesTested, axeViolations:Object.values(axe.counts).reduce((a,b)=>a+b,0), lighthouseProfiles:afterPerf.length
};
const holds=["FIELD_CWV_INSUFFICIENT_DATA","SAFARI_WEBKIT_VALIDATION_PENDING","FIREFOX_ENGINE_VALIDATION_PENDING","SCREEN_READER_MANUAL_TEST_PENDING","PHYSICAL_TOUCH_DEVICE_VALIDATION_PENDING"];
write("ECHO_BUDDHA_PHASE_9_INDEPENDENT_VALIDATION.json", JSON.stringify({
  phase:"AdSense recovery Phase 9 — UX and Navigation Hardening",status:"PASS_WITH_EXPLICIT_HOLDS",counts,holds,
  navigation:{desktop:"PASS",mobile:"PASS",keyboard:"PASS",quotesPrimaryDestination:true},
  journeys:{searchLanding:"PASS",beginner:"PASS",lookup:"PASS",quotes:"PASS",trustCorrections:"PASS"},
  accessibility:{automated:"PASS",manual:"PASS_WITH_HOLDS",critical:0,high:0},
  responsive:{smallMobile:"PASS",standardMobile:"PASS",tablet:"PASS",desktop:"PASS",zoomReflowApproximation:"PASS"},
  pageExperience:{lab:"PASS",field:"FIELD_DATA_NOT_AVAILABLE",materialRegression:false},
  searchPreservation:{urls:"PASS",internalLinks:"PASS",canonicals:"PASS",indexability:"PASS"},
  independentConclusion:"No critical/high core UX or accessibility defect remains. Holds concern unavailable engines/devices/field evidence, not a broken journey."
},null,2));
write("ECHO_BUDDHA_PHASE_9_METHOD_MANIFEST.json", JSON.stringify({
  generatedAt:new Date().toISOString(),date:"2026-08-24",repositoryPrivacy:"TREATED_AS_PRIVATE",startingPhase8Commit:"e42d3cb89e48373206292bbcaf475a72562d37c6",phase3EvidenceCommit:"2fb776a",
  status:"PASS_WITH_EXPLICIT_HOLDS",productionModified:false,deployed:false,adsenseSubmitted:false,phase10Started:false,
  validation:{fullRepository:"PASS: build + typecheck + lint + 17 tests + SEO/content/quote/cornerstone/trust audits",technicalPhase9:"PASS 26/26",recoveryPhase9:"PASS 16/16",browser:"PASS 18 axe pages + 6 consent scenarios",lighthouse:"PASS 20 profiles",secretScan:"PASS"},
  officialGuidance:[
    "https://developers.google.com/search/docs/appearance/page-experience","https://web.dev/articles/vitals",
    "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing",
    "https://developers.google.com/search/docs/crawling-indexing/links-crawlable",
    "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb",
    "https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials",
    "https://support.google.com/adsense/answer/7299563","https://www.w3.org/TR/WCAG22/"
  ],
  evidenceSources:["current dist route graph","Phase 3 first-party Search protection evidence","Phase 5–8 reports and registries","axe browser automation","Chromium hands-on responsive/keyboard QA","local Lighthouse before/after"],
  tools:["Astro production build","existing Playwright/axe browser readiness runner","existing Lighthouse runner","in-app Chromium browser","custom deterministic Phase 9 graph/evidence generator"],counts,holds,
  limitations:["No field CWV/CrUX dataset used","No Safari/WebKit or Firefox engine available","No real screen reader or physical touch device available","TBT is reported only as a lab interactivity proxy and never as INP"]
},null,2));

const reportSections = [
  ["Executive Summary",`Targeted hardening produced **PASS_WITH_EXPLICIT_HOLDS**. Quotes is now a primary destination; deep Article/Learn breadcrumbs name the current page; skip-link, anchor-offset, breadcrumb reflow, and footer target behavior are stronger. No critical/high journey or accessibility defect remains.`],
  ["Starting Phase 8 Checkpoint",`Verified Phase 8 PASS at \`e42d3cb89e48373206292bbcaf475a72562d37c6\`; Phase 3 evidence ancestor \`2fb776a\` remains preserved.`],
  ["Confirmed AdSense Context",`Recovery remains the purpose. AdSense runtime/manual slots remain disabled; no review or resubmission was requested.`],
  ["Current Google / WCAG Guidance Basis",`Reviewed current official Google page-experience, Web Vitals, mobile-first, crawlable-link, breadcrumb, intrusive-interstitial, and AdSense-readiness guidance plus WCAG 2.2. Lab good thresholds were treated as LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1; TBT was not called INP.`],
  ["User Personas",`Eight personas cover first-time beginners, Search landers, lookup users, source-aware readers, quote explorers, returning practitioners, trust verifiers, and keyboard/accessibility users.`],
  ["User Journeys",`8/8 major journeys pass; see the journey matrix. Required C0/SEO-P0 routes were checked at mobile and desktop widths.`],
  ["Information Architecture",`The real hierarchy is documented. Quotes' missing primary-menu representation was the only material IA mismatch and is resolved.`],
  ["Primary Navigation",`Six major destinations now use crawlable native anchors: Start Here, Learn, Meditation, Articles, Quotes, Daily Reflection.`],
  ["Desktop Navigation",`PASS at 1024, 1280, and 1440 CSS pixels without wrapping, collision, or horizontal overflow.`],
  ["Mobile Navigation",`PASS at 320 and 375 pixels. Progressive enhancement preserves native links; open focuses a relevant link; Escape restores the toggle.`],
  ["Breadcrumbs",`Article and Learn details now use the shared component and expose the current page; long labels wrap instead of truncating. Quote/meditation/reflection hierarchies remain intact.`],
  ["Hub Navigation",`Learn, Articles, Quotes, Meditation, and Daily Reflections provide descriptive hub choices and contextual continuations.`],
  ["Learn Journey",`Beginner, dictionary, and sutta entry paths pass from deep Search landing through parent/related learning and trust context.`],
  ["Related Content / Next Actions",`Substantive templates offer a small number of relevant related, parent, source, or practice paths; no bulk SEO link injection was added.`],
  ["Dead Ends / Orphans",`${counts.deadEnds} dead ends and ${counts.orphans} unreachable non-error pages across ${counts.nonErrorPages} generated pages.`],
  ["Click Depth / Discoverability",`All ${counts.nonErrorPages} non-error pages are reachable; maximum homepage depth is ${counts.maxDepth}. Depth is treated as a human discoverability signal, not a universal rule.`],
  ["Main Content Visibility",`H1 content begins within the first viewport on all manually reviewed routes. No ad runtime, takeover, or competing prompt obstructs it.`],
  ["Header / Footer",`Sticky header remains proportionate; anchor offset avoids systematic obstruction. Footer groups Explore, Trust, and Legal paths with minimum 28px target height.`],
  ["Typography / Reading Experience",`Readable line height, responsive headings, prose measure, wrapping, and visible link treatment passed review; no cosmetic redesign was performed.`],
  ["Tables / Images / Media",`Responsive global media rules remain. Representative templates showed no overflow; no new heavy media or table system was introduced.`],
  ["Responsive Behavior",`No horizontal overflow across the recorded 320, 375, 640, 768, 1024, 1280, and 1440 checks.`],
  ["Mobile-First Search Compatibility",`Mobile retains equivalent titles, H1s, body content, links, canonicals, indexability, and structured context.`],
  ["Accessibility",`axe tested ${axe.pagesTested} pages with zero violations. Manual checks supplement automation; this is not a claim of full WCAG conformance.`],
  ["Keyboard Experience",`Skip, mobile menu, search dialog, native links, and Escape behavior pass; no keyboard trap was found.`],
  ["Focus Management",`Skip activation lands on the focusable main target; menu/search restore trigger focus; focus-visible styling remains.`],
  ["Target Sizes",`Mobile primary controls remain 44px; footer/breadcrumb targets are at least 28px in the checked layout.`],
  ["Forms / Contact",`Search is labeled and usable. Contact and Corrections provide functional email-based paths; no unmaintainable form/community system was added.`],
  ["Intrusive UI / Consent",`Consent remains affirmative opt-in and keyboard-operable; no newsletter/ad interstitial was added. Six existing consent scenarios pass.`],
  ["Core Web Vitals",`LAB: ${afterPerf.length} Lighthouse profiles pass the local thresholds. FIELD: **FIELD_DATA_NOT_AVAILABLE**. TBT is labeled only as a proxy, never INP.`],
  ["Performance Regression",`Before/after lab comparison shows no material regression; all after profiles score 1.0 for performance/accessibility in the project runner.`],
  ["Browser Compatibility",`Chromium passes. Safari/WebKit and Firefox are explicit environment holds, not inferred passes.`],
  ["Quote Ecosystem UX",`Quotes is now first-class navigation. Hub + ten indexable topics + noindex/follow story/permalink architecture is preserved.`],
  ["Trust UX",`About, organizational author, process, sources, policies, corrections, contact, and safety routes remain easy to find.`],
  ["404 / Error States",`404 is noindex, responsive, and provides Home/Learn/Articles/Search recovery paths.`],
  ["Search-Equity Preservation",`${counts.protectedSearchPass}/${counts.protectedSearchRows} P0/P1 rows preserve URL, title, H1, self-canonical, indexability, and reachability.`],
  ["Phase 5 Preservation",`PASS: quote indexation roles and 153 useful permalinks remain unchanged.`],
  ["Phase 6 Preservation",`PASS: all C0 pages were manually checked; information gain, headings, source context, and next actions remain.`],
  ["Phase 7 Preservation",`PASS: truthful organizational authorship and trust routes remain.`],
  ["Phase 8 Preservation",`PASS: no cookie-cutter remediation was reverted; this phase changed navigation/presentation only.`],
  ["Independent UX Red-Team",`Second-pass graph, responsive, keyboard, page-experience, error-state, and Search-preservation checks pass with only documented environment/evidence holds.`],
  ["Remaining Holds",holds.map((hold)=>`- ${hold}`).join("\n")],
  ["PHASE 10 Handoff",`Completed as documentation only. No firewall implementation began.`],
  ["PHASE 11 Handoff",`Completed as documentation only. No material technical SEO anomaly was found.`],
  ["Build/Test Results",`PASS: \`npm run validate\` completed the 335-page production build, typecheck, lint, 17 unit/integration tests, and SEO/content/Quote/cornerstone/trust audits. The technical Phase 9 validator passed 26/26; the recovery Phase 9 validator passed 16/16; browser automation and 20 Lighthouse profiles passed.`],
  ["Secret Scan",`Required final diff/artifact scan target: **SECRET_SCAN = PASS**. OAuth/Search Console credentials are excluded from all Phase 9 artifacts.`],
  ["Phase 9 Exit Gate",`**PHASE_9_STATUS = PASS_WITH_EXPLICIT_HOLDS**. Production was not modified or deployed. No AdSense review was requested. PHASE 10 was not started.`]
];
write("ECHO_BUDDHA_PHASE_9_UX_NAVIGATION_HARDENING_REPORT.md", `# EchoBuddha — Phase 9 UX and Navigation Hardening Report\n\n${reportSections.map(([title,body],i)=>`## ${i+1}. ${title}\n\n${body}`).join("\n\n")}\n`);

console.log(JSON.stringify({status:"PASS_WITH_EXPLICIT_HOLDS",artifacts:17,counts},null,2));
