import fs from "node:fs";
import path from "node:path";

const ROOT=process.cwd();
const DIST=path.join(ROOT,"dist");
const P3=path.join(ROOT,"docs/audits/adsense-rejection-2026-08/phase-3-index-quality-remediation");
const OUT=path.join(ROOT,"docs/audits/adsense-rejection-2026-08/phase-4-high-value-content-remediation");

function parseCsv(text){const rows=[];let row=[],field="",quoted=false;for(let i=0;i<text.length;i+=1){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i+=1}else if(c==='"')quoted=false;else field+=c}else if(c==='"')quoted=true;else if(c===","){row.push(field);field=""}else if(c==="\n"){row.push(field.replace(/\r$/, ""));rows.push(row);row=[];field=""}else field+=c}return rows}
function readCsv(file){const rows=parseCsv(fs.readFileSync(file,"utf8"));const h=rows[0];return rows.slice(1).filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(h.map((x,i)=>[x,r[i]??""])))}
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p,out);else if(e.name.endsWith(".html"))out.push(p)}return out}
function routeFor(file){const r=path.relative(DIST,file).split(path.sep).join("/");if(r==="index.html")return "/";if(r==="404.html")return "/404.html";return `/${r.replace(/index\.html$/,"")}`}
function match(html,re){return (html.match(re)?.[1]??"").replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim()}
function noindex(html){return /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)||/<meta\s+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html)}

const pages=walk(DIST).map(file=>{const html=fs.readFileSync(file,"utf8"),route=routeFor(file);return {file,route,url:route==="/404.html"?`https://echobuddha.com/404.html`:new URL(route,"https://echobuddha.com").href,html,title:match(html,/<title>([\s\S]*?)<\/title>/i),description:match(html,/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)||match(html,/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description/i),canonical:match(html,/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)||match(html,/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i),noindex:noindex(html)}});
const byUrl=new Map(pages.map(p=>[p.url,p]));const routes=new Set(pages.map(p=>p.route));
const p3=readCsv(path.join(P3,"phase-3-route-inventory.csv"));
const sitemap=fs.readFileSync(path.join(DIST,"sitemap.xml"),"utf8");
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const failures=[];
function assert(ok,message){if(!ok)failures.push(message)}

assert(pages.length===336,`Expected 336 HTML documents, found ${pages.length}`);
assert(pages.filter(p=>!p.noindex).length===193,`Expected 193 indexable documents, found ${pages.filter(p=>!p.noindex).length}`);
assert(pages.filter(p=>p.noindex).length===143,`Expected 143 noindex documents, found ${pages.filter(p=>p.noindex).length}`);
assert(sitemapUrls.length===193,`Expected 193 sitemap URLs, found ${sitemapUrls.length}`);
for(const before of p3){const after=byUrl.get(before.URL);assert(Boolean(after),`Missing Phase 3 URL: ${before.URL}`);if(!after)continue;assert((before.Robots.includes("noindex"))===after.noindex,`Robots regression: ${before.URL}`);assert(before.Canonical===after.canonical,`Canonical regression: ${before.URL}`);assert((before["In sitemap"]==="Yes")===sitemapUrls.includes(before.URL),`Sitemap regression: ${before.URL}`)}

const broken=[];
for(const page of pages){for(const m of page.html.matchAll(/href=["']([^"']+)["']/gi)){const raw=m[1];if(!raw.startsWith("/")||raw.startsWith("//"))continue;const target=raw.split(/[?#]/)[0]||page.route;if(/\.(webp|png|jpg|jpeg|svg|ico|xml|json|css|js|pdf|webmanifest)$/i.test(target))continue;const normalized=target==="/404"?"/404.html":target.endsWith("/")||target.endsWith(".html")?target:`${target}/`;if(!routes.has(normalized))broken.push(`${page.route} -> ${raw}`)}}
assert(broken.length===0,`Broken internal links: ${broken.slice(0,10).join("; ")}`);

const indexed=pages.filter(p=>!p.noindex);const duplicates=(field)=>{const map=new Map();for(const p of indexed){const value=p[field];if(!value)continue;map.set(value,[...(map.get(value)||[]),p.route])}return [...map.entries()].filter(([,rs])=>rs.length>1)};
const duplicateTitles=duplicates("title"),duplicateDescriptions=duplicates("description");
assert(duplicateTitles.length===0,`Duplicate indexable titles: ${JSON.stringify(duplicateTitles)}`);
assert(duplicateDescriptions.length===0,`Duplicate indexable descriptions: ${JSON.stringify(duplicateDescriptions)}`);

let invalidSchema=0;for(const page of pages){for(const m of page.html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{JSON.parse(m[1])}catch{invalidSchema+=1}}}
assert(invalidSchema===0,`Invalid structured-data blocks: ${invalidSchema}`);

const requiredSources={
  "/learn/buddhism-for-beginners/":["suttacentral.net/sn56.11","suttacentral.net/sn45.8"],
  "/learn/four-noble-truths/":["suttacentral.net/sn56.11"],
  "/learn/eightfold-path/":["suttacentral.net/sn45.8"],
  "/learn/buddhism-101/what-is-buddhism/":["suttacentral.net/sn56.11"],
  "/learn/buddhism-101/what-is-karma-in-buddhism/":["suttacentral.net/an6.63"],
  "/learn/buddhism-101/what-is-impermanence/":["suttacentral.net/dhp273-289"],
  "/learn/buddhist-dictionary/metta/":["suttacentral.net/snp1.8"],
  "/meditation/breathing-meditation/":["suttacentral.net/mn118","nccih.nih.gov"],
  "/meditation/loving-kindness-meditation/":["suttacentral.net/snp1.8","nccih.nih.gov"],
  "/meditation/walking-meditation/":["suttacentral.net/an5.29","suttacentral.net/mn10"],
  "/meditation/when-meditation-feels-hard/":["nccih.nih.gov","nhs.uk"],
  "/articles/right-speech-buddhism/":["suttacentral.net/sn45.8"],
  "/articles/buddhist-approach-to-anger/":["suttacentral.net/dhp1-20"],
  "/learn/sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths/":["suttacentral.net/sn56.11"],
  "/learn/sutta-for-daily-life/magga-vibhanga-sutta-eightfold-path/":["suttacentral.net/sn45.8"],
  "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/":["suttacentral.net/snp1.8"]
};
for(const [route,needles] of Object.entries(requiredSources)){const page=pages.find(p=>p.route===route);assert(Boolean(page),`Missing remediated route: ${route}`);for(const needle of needles)assert(page?.html.includes(needle),`Missing source ${needle} on ${route}`)}

const safety={
  "/meditation/breathing-meditation/":["stop","qualified support","rather than a promised result"],
  "/meditation/loving-kindness-meditation/":["unsafe access","Stop or change practices","not a substitute"],
  "/meditation/walking-meditation/":["Pain, dizziness","situational awareness","cannot assess"],
  "/meditation/when-meditation-feels-hard/":["dissociation","emergency or crisis services","does not replace"],
  "/articles/buddhist-approach-to-anger/":["loss of control","emergency support","not a substitute"]
};
for(const [route,needles] of Object.entries(safety)){const html=pages.find(p=>p.route===route)?.html||"";for(const needle of needles)assert(html.toLowerCase().includes(needle.toLowerCase()),`Missing safety marker '${needle}' on ${route}`)}

const result={generatedAt:new Date().toISOString(),status:failures.length?"FAIL":"PASS",htmlDocuments:pages.length,indexableDocuments:indexed.length,noindexDocuments:pages.filter(p=>p.noindex).length,sitemapUrls:sitemapUrls.length,phase3UrlsCompared:p3.length,indexabilityRegressions:p3.filter(b=>{const a=byUrl.get(b.URL);return !a||(b.Robots.includes("noindex"))!==a.noindex}).length,canonicalErrors:p3.filter(b=>byUrl.get(b.URL)?.canonical!==b.Canonical).length,brokenInternalLinks:broken.length,duplicateIndexableTitles:duplicateTitles.length,duplicateIndexableDescriptions:duplicateDescriptions.length,invalidStructuredData:invalidSchema,sourcePagesChecked:Object.keys(requiredSources).length,safetyPagesChecked:Object.keys(safety).length,adsenseBehaviorExpanded:false,failures};
fs.writeFileSync(path.join(OUT,"phase-4-content-validation.json"),`${JSON.stringify(result,null,2)}\n`);
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exit(1);
