import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root=process.cwd();
const dist=path.join(root,"dist");
const audit=path.join(root,"docs/audits/adsense-recovery-phase-9-2026-08-24");
const origin="https://echobuddha.com";
const required=[
  "ECHO_BUDDHA_PHASE_9_USER_JOURNEY_MATRIX.csv","ECHO_BUDDHA_PHASE_9_INFORMATION_ARCHITECTURE.md","ECHO_BUDDHA_PHASE_9_NAVIGATION_AUDIT.csv",
  "ECHO_BUDDHA_PHASE_9_CLICK_DEPTH.csv","ECHO_BUDDHA_PHASE_9_DEAD_END_AUDIT.csv","ECHO_BUDDHA_PHASE_9_MAIN_CONTENT_VISIBILITY.csv",
  "ECHO_BUDDHA_PHASE_9_RESPONSIVE_TEST_MATRIX.csv","ECHO_BUDDHA_PHASE_9_ACCESSIBILITY_AUDIT.csv","ECHO_BUDDHA_PHASE_9_PAGE_EXPERIENCE_BASELINE.csv",
  "ECHO_BUDDHA_PHASE_9_CORE_WEB_VITALS.csv","ECHO_BUDDHA_PHASE_9_MANUAL_QA.csv","ECHO_BUDDHA_PHASE_9_SEARCH_EQUITY_VALIDATION.csv",
  "ECHO_BUDDHA_PHASE_9_PHASE_10_HANDOFF.md","ECHO_BUDDHA_PHASE_9_PHASE_11_HANDOFF.md","ECHO_BUDDHA_PHASE_9_INDEPENDENT_VALIDATION.json",
  "ECHO_BUDDHA_PHASE_9_METHOD_MANIFEST.json","ECHO_BUDDHA_PHASE_9_UX_NAVIGATION_HARDENING_REPORT.md"
];
const read=(file)=>fs.readFileSync(path.isAbsolute(file)?file:path.join(root,file),"utf8");
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>{const file=path.join(dir,entry.name);return entry.isDirectory()?walk(file):[file];});
const routeFor=(file)=>{const relative=path.relative(dist,file).split(path.sep).join("/");return relative==="index.html"?"/":relative==="404.html"?"/404.html":`/${relative.replace(/index\.html$/,"")}`;};
const parseCsv=(value)=>{
  const rows=[];let row=[],field="",quoted=false;
  for(let i=0;i<value.length;i+=1){const c=value[i];if(quoted){if(c==='"'&&value[i+1]==='"'){field+='"';i+=1;}else if(c==='"')quoted=false;else field+=c;}else if(c==='"')quoted=true;else if(c===","){row.push(field);field="";}else if(c==="\n"){row.push(field);rows.push(row);row=[];field="";}else if(c!=="\r")field+=c;}
  if(field||row.length){row.push(field);rows.push(row);}const [headers,...body]=rows.filter((item)=>item.some(Boolean));return body.map((cells)=>Object.fromEntries(headers.map((header,index)=>[header,cells[index]||""])));
};
const checks=[];
const check=(name,fn)=>{try{const evidence=fn();checks.push({name,pass:true,evidence:String(evidence)});}catch(error){checks.push({name,pass:false,evidence:error.message});}};

check("17 required artifacts are present and substantive",()=>{assert.equal(required.filter((name)=>!fs.existsSync(path.join(audit,name))||fs.statSync(path.join(audit,name)).size<100).length,0);return "17/17";});
check("Primary report has all 46 exact ordered sections",()=>{const report=read(path.join(audit,required.at(-1)));const headings=[...report.matchAll(/^## (\d+)\. /gm)].map((m)=>Number(m[1]));assert.deepEqual(headings,Array.from({length:46},(_,i)=>i+1));assert.match(report,/PHASE_9_STATUS = PASS_WITH_EXPLICIT_HOLDS/);return "46/46";});
check("Independent result is honest and preserves stop conditions",()=>{const result=JSON.parse(read(path.join(audit,"ECHO_BUDDHA_PHASE_9_INDEPENDENT_VALIDATION.json")));assert.equal(result.status,"PASS_WITH_EXPLICIT_HOLDS");assert.equal(result.counts.orphans,0);assert.equal(result.counts.deadEnds,0);assert.equal(result.counts.axeViolations,0);assert.equal(result.searchPreservation.urls,"PASS");return `${result.counts.nonErrorPages} reachable; ${result.holds.length} explicit holds`;});
check("Quotes is a crawlable primary destination",()=>{const header=read("src/components/Header.astro");assert.match(header,/href:\s*"\/quotes\/",\s*label:\s*"Quotes"/);const home=read(path.join(dist,"index.html"));assert.match(home,/aria-label="Main navigation"[\s\S]*?<a[^>]+href="\/quotes\/"/);return "native <a href=/quotes/>";});
check("Skip target and sticky-anchor protection are present",()=>{assert.match(read("src/layouts/Layout.astro"),/<main id="main-content" tabindex="-1">/);const css=read("src/styles/global.css");assert.match(css,/scroll-padding-top:\s*6rem/);assert.match(css,/scroll-margin-top:\s*6rem/);return "focusable main + 6rem anchor clearance";});
check("Deep Article and Learn breadcrumbs include current page",()=>{const files=walk(dist).filter((file)=>file.endsWith(".html"));const targets=files.filter((file)=>{const route=routeFor(file);return /^\/articles\/[^/]+\/$/.test(route)||/^\/learn\/[^/]+\/[^/]+\/$/.test(route);});const failures=targets.filter((file)=>{const html=read(file);return !/aria-label="Breadcrumb"/.test(html)||!/aria-current="page"/.test(html);});assert.deepEqual(failures,[]);return `${targets.length}/${targets.length}`;});
check("All non-error routes remain human-reachable with depth <=3",()=>{const rows=parseCsv(read(path.join(audit,"ECHO_BUDDHA_PHASE_9_CLICK_DEPTH.csv")));assert.equal(rows.length,334);assert.equal(rows.filter((r)=>r["orphan?"]!=="NO").length,0);assert.ok(Math.max(...rows.map((r)=>Number(r["shortest path from homepage"])))<=3);return "334/334; max depth 3";});
check("No generated content dead ends remain",()=>{const rows=parseCsv(read(path.join(audit,"ECHO_BUDDHA_PHASE_9_DEAD_END_AUDIT.csv")));assert.equal(rows.length,334);assert.equal(rows.filter((r)=>r.status!=="PASS").length,0);return "334/334";});
check("P0/P1 Search equity is exact",()=>{const rows=parseCsv(read(path.join(audit,"ECHO_BUDDHA_PHASE_9_SEARCH_EQUITY_VALIDATION.csv")));assert.equal(rows.length,19);assert.equal(rows.filter((r)=>r["PASS/FAIL"]!=="PASS").length,0);return "19/19";});
check("Internal links resolve",()=>{const files=walk(dist);const htmlFiles=files.filter((file)=>file.endsWith(".html"));const routes=new Set(htmlFiles.map(routeFor));const resources=new Set(files.map((file)=>`/${path.relative(dist,file).split(path.sep).join("/")}`));const failures=[];for(const file of htmlFiles){const source=routeFor(file);for(const match of read(file).matchAll(/\shref=["']([^"'#]+)["']/gi)){const href=match[1];if(!href.startsWith("/")&&!href.startsWith(origin))continue;const route=new URL(href,origin).pathname;const normalized=route==="/404/"?"/404.html":route;if(!routes.has(normalized)&&!resources.has(normalized)&&!resources.has(`${normalized}index.html`))failures.push(`${source} -> ${route}`);}}assert.deepEqual([...new Set(failures)],[]);return "0 broken internal links";});
check("Canonicals and indexability did not drift",()=>{const rows=parseCsv(read(path.join(audit,"ECHO_BUDDHA_PHASE_9_SEARCH_EQUITY_VALIDATION.csv")));assert.equal(rows.filter((r)=>r["canonical unchanged?"]!=="YES"||r["indexability unchanged?"]!=="YES").length,0);return "19 protected routes exact";});
check("Automated accessibility and consent evidence pass",()=>{const axe=JSON.parse(read("/tmp/echobuddha-phase9-after/accessibility-browser-results.json"));const consent=JSON.parse(read("/tmp/echobuddha-phase9-after/consent-browser-results.json"));assert.equal(axe.pass,true);assert.deepEqual(axe.counts,{critical:0,serious:0,moderate:0,minor:0,unknown:0});assert.equal(consent.pass,true);return `${axe.pagesTested} axe pages; ${consent.scenarios.length} consent scenarios`;});
check("Lab page experience has no material regression",()=>{const rows=parseCsv(read(path.join(audit,"ECHO_BUDDHA_PHASE_9_PAGE_EXPERIENCE_BASELINE.csv")));assert.equal(rows.length,20);assert.equal(rows.filter((r)=>r["final result"]!=="PASS").length,0);assert.ok(rows.every((r)=>r["field CWV where available"]==="FIELD_DATA_NOT_AVAILABLE"));return "20/20 lab profiles; field unavailable";});
check("Earlier recovery phase checkpoints remain green",()=>{for(const phase of [5,6,7,8]){const file=path.join(root,`docs/audits/adsense-recovery-phase-${phase}-2026-08-24/ECHO_BUDDHA_PHASE_${phase}_INDEPENDENT_VALIDATION.json`);const result=JSON.parse(read(file));assert.equal(result.status,"PASS");}return "Phase 5/6/7/8 independent checkpoints PASS";});
check("No production/deployment surface was modified",()=>{const changed=execFileSync("git",["diff","--name-only"],{cwd:root,encoding:"utf8"}).trim().split("\n").filter(Boolean);const forbidden=changed.filter((file)=>file.startsWith(".github/workflows/")||["wrangler.jsonc","public/_headers","public/robots.txt","public/ads.txt"].includes(file));assert.deepEqual(forbidden,[]);return "0 deployment/production-control files";});
check("Phase 9 secret scan passes",()=>{const files=[...walk(audit),...execFileSync("git",["diff","--name-only"],{cwd:root,encoding:"utf8"}).trim().split("\n").filter(Boolean).map((file)=>path.join(root,file)).filter((file)=>fs.existsSync(file)&&fs.statSync(file).isFile())];const patterns=[/client_secret\s*["':=]+\s*[A-Za-z0-9_-]{8,}/i,/refresh_token\s*["':=]+\s*[A-Za-z0-9_/-]{8,}/i,/ya29\.[A-Za-z0-9_-]+/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];const hits=[];for(const file of new Set(files)){const value=read(file);if(patterns.some((pattern)=>pattern.test(value)))hits.push(path.relative(root,file));}assert.deepEqual(hits,[]);return "SECRET_SCAN = PASS";});

const pass=checks.every((item)=>item.pass);
console.log(JSON.stringify({phase:"AdSense recovery Phase 9",status:pass?"PASS_WITH_EXPLICIT_HOLDS":"FAIL",checks,pass},null,2));
if(!pass)process.exitCode=1;
