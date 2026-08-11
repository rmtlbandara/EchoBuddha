import { readFile, readdir, stat, access, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "docs/audits/adsense-rejection-2026-08");
const p0 = path.join(base, "phase-0-retroactive-baseline");
const out = path.join(base, "reconciliation");
const dist = path.join(root, "dist");

const parseCsv = (text) => {
  const records=[]; let record=[], field="", quoted=false;
  for (let i=0;i<text.length;i+=1) { const c=text[i];
    if (quoted) { if (c==='"'&&text[i+1]==='"'){field+='"';i+=1;} else if(c==='"')quoted=false; else field+=c; }
    else if(c==='"')quoted=true; else if(c===','){record.push(field);field="";} else if(c==='\n'){record.push(field);records.push(record);record=[];field="";} else if(c!=='\r')field+=c;
  }
  if(field||record.length){record.push(field);records.push(record);} const headers=records.shift()??[];
  return records.filter((row)=>row.length>1||row[0]).map((row)=>Object.fromEntries(headers.map((header,index)=>[header,row[index]??""])));
};
const readCsv = async (file) => parseCsv(await readFile(file,"utf8"));
const walk = async (dir) => { const files=[]; for(const entry of await readdir(dir)){const absolute=path.join(dir,entry);const info=await stat(absolute);files.push(...(info.isDirectory()?await walk(absolute):[absolute]));} return files; };
const routeFor = (file) => { const relative=path.relative(dist,file).split(path.sep).join('/'); if(relative==='index.html')return '/'; if(relative.endsWith('/index.html'))return `/${relative.slice(0,-10)}`; return `/${relative}`; };
const first = (html,regex)=>(html.match(regex)?.[1]??'').replace(/<[^>]+>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim();
const failures=[]; const checks=[];
const check=(name,condition,details)=>{checks.push({Check:name,Status:condition?'PASS':'FAIL',Details:details});if(!condition)failures.push(`${name}: ${details}`);};

const requiredP0=[
  'ECHO_BUDDHA_RETROACTIVE_PHASE_0_BASELINE_AND_PROTECTION.md','phase-0-current-repository-baseline.csv','phase-0-current-production-baseline.csv','phase-0-forensic-git-baseline.csv','phase-0-historical-production-evidence.csv','phase-0-route-baseline.csv','phase-0-content-family-baseline.csv','phase-0-indexability-baseline.csv','phase-0-adsense-baseline.csv','phase-0-protection-register.csv','phase-0-rejection-evidence-register.csv','phase-0-evidence-confidence-register.csv','phase-0-unverified-items.csv','phase-0-baseline-manifest.json','phase-0-validation-summary.csv'
];
const requiredReconciliation=[
  'PHASE_1_RECONCILIATION_REPORT.md','PHASE_2_RECONCILIATION_REPORT.md','PHASE_3_RECONCILIATION_REPORT.md','PHASE_4_RECONCILIATION_REPORT.md','ECHO_BUDDHA_PHASE_0_4_RECONCILIATION_AND_STABILIZATION_REPORT.md','phase-1-correction-register.csv','phase-2-correction-register.csv','phase-2-downstream-impact-register.csv','phase-3-correction-register.csv','phase-3-index-policy-drift-register.csv','phase-3-redirect-reconciliation.csv','phase-3-sitemap-reconciliation.csv','phase-3-internal-search-reconciliation.csv','phase-4-correction-register.csv','phase-4-quality-score-reconciliation.csv','phase-4-source-reconciliation.csv','phase-4-content-merge-reconciliation.csv','phase-4-ownership-preservation-review.csv','phase-4-indexability-preservation-review.csv','phase-0-4-cascade-register.csv','phase-0-4-correction-register.csv','phase-0-4-authoritative-decision-register.csv','MASTER_PHASE_0_4_RECONCILED_PAGE_REGISTER.csv','MASTER_PRE_PHASE5_PROTECTION_REGISTER.csv','phase-0-4-current-route-inventory.csv','phase-0-4-current-content-inventory.csv','phase-0-4-current-indexability-inventory.csv','phase-0-4-current-sitemap-review.csv','phase-0-4-current-canonical-review.csv','phase-0-4-current-redirect-review.csv','phase-0-4-current-internal-link-review.csv','phase-0-4-current-internal-search-review.csv','phase-0-4-current-topic-owner-review.csv','phase-0-4-current-source-review.csv','phase-0-4-current-safety-review.csv','phase-0-4-current-quote-review.csv','phase-0-4-current-daily-reflection-review.csv','phase-0-4-current-meditation-review.csv','phase-0-4-current-adsense-review.csv','phase-0-4-production-parity.csv','phase-0-4-validation-summary.csv','phase-0-4-human-review-items.csv','phase-0-4-phase5-handoff.csv','phase-0-4-future-phase-handoff.csv','phase-0-4-rollback-map.csv','phase-0-4-visual-qa.json','phase-0-4-lighthouse-reconciliation.json'
];
for(const file of requiredP0){try{await access(path.join(p0,file));}catch{failures.push(`Missing Phase 0 artifact: ${file}`);}}
for(const file of requiredReconciliation){try{await access(path.join(out,file));}catch{failures.push(`Missing reconciliation artifact: ${file}`);}}
check('Required Phase 0 artifacts',!failures.some((item)=>item.startsWith('Missing Phase 0')),`${requiredP0.length} required`);
check('Required reconciliation artifacts',!failures.some((item)=>item.startsWith('Missing reconciliation')),`${requiredReconciliation.length} required`);

const htmlFiles=(await walk(dist)).filter((file)=>file.endsWith('.html')).sort();
const knownRoutes=new Set(htmlFiles.map(routeFor));
const sitemapText=await readFile(path.join(dist,'sitemap.xml'),'utf8');
const sitemap=new Set([...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match)=>match[1]));
const pages=[]; let invalidJsonLd=0,brokenLinks=0;
for(const file of htmlFiles){const html=await readFile(file,'utf8');const route=routeFor(file);const url=`https://echobuddha.com${route}`;const robots=first(html,/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)||'index, follow';const indexable=!/noindex/i.test(robots);const canonical=first(html,/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);const title=first(html,/<title[^>]*>([\s\S]*?)<\/title>/i);const description=first(html,/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);const h1=(html.match(/<h1\b/gi)||[]).length;
  for(const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){try{JSON.parse(match[1]);}catch{invalidJsonLd+=1;}}
  for(const match of html.matchAll(/<a\b[^>]*href=["']([^"'#?]+)[^"']*["']/gi)){let href=match[1];if(href.startsWith('https://echobuddha.com'))href=href.replace('https://echobuddha.com','');if(href.startsWith('/')&&!href.includes('.')&&!href.startsWith('/search/')){const normalized=href.endsWith('/')?href:`${href}/`;if(!knownRoutes.has(normalized))brokenLinks+=1;}}
  pages.push({route,url,indexable,canonical,title,description,h1,inSitemap:sitemap.has(url)});
}
const indexable=pages.filter((page)=>page.indexable),noindex=pages.filter((page)=>!page.indexable);
const duplicates=(values)=>[...values.entries()].filter(([,list])=>list.length>1);
const titleMap=new Map(),descriptionMap=new Map(),canonicalMap=new Map();
for(const page of indexable){for(const [map,value] of [[titleMap,page.title],[descriptionMap,page.description],[canonicalMap,page.canonical]]){const list=map.get(value)||[];list.push(page.url);map.set(value,list);}}
check('HTML count',pages.length===336,`${pages.length}`);
check('Indexable count',indexable.length===193,`${indexable.length}`);
check('Noindex count',noindex.length===143,`${noindex.length}`);
check('Sitemap count',sitemap.size===193,`${sitemap.size}`);
check('Noindex URLs in sitemap',noindex.filter((page)=>page.inSitemap).length===0,`${noindex.filter((page)=>page.inSitemap).length}`);
check('Indexable URLs absent sitemap',indexable.filter((page)=>!page.inSitemap).length===0,`${indexable.filter((page)=>!page.inSitemap).length}`);
check('Canonical errors',pages.filter((page)=>page.route!=='/404.html'&&page.canonical!==page.url).length===0,`${pages.filter((page)=>page.route!=='/404.html'&&page.canonical!==page.url).length}`);
check('Duplicate canonical targets',duplicates(canonicalMap).length===0,`${duplicates(canonicalMap).length}`);
check('Duplicate indexable titles',duplicates(titleMap).length===0,`${duplicates(titleMap).length}`);
check('Duplicate indexable descriptions',duplicates(descriptionMap).length===0,`${duplicates(descriptionMap).length}`);
check('Invalid JSON-LD',invalidJsonLd===0,`${invalidJsonLd}`);
check('Broken internal links',brokenLinks===0,`${brokenLinks}`);
check('Exactly one H1 per document',pages.filter((page)=>page.h1!==1).length===0,`${pages.filter((page)=>page.h1!==1).length}`);

const master=await readCsv(path.join(out,'MASTER_PHASE_0_4_RECONCILED_PAGE_REGISTER.csv'));
const owners=await readCsv(path.join(out,'phase-0-4-current-topic-owner-review.csv'));
const drift=await readCsv(path.join(out,'phase-3-index-policy-drift-register.csv'));
const p4Scores=await readCsv(path.join(out,'phase-4-quality-score-reconciliation.csv'));
const p4Ownership=await readCsv(path.join(out,'phase-4-ownership-preservation-review.csv'));
const p4Index=await readCsv(path.join(out,'phase-4-indexability-preservation-review.csv'));
const sources=await readCsv(path.join(out,'phase-0-4-current-source-review.csv'));
const safety=await readCsv(path.join(out,'phase-0-4-current-safety-review.csv'));
const parity=await readCsv(path.join(out,'phase-0-4-production-parity.csv'));
const phase5=await readCsv(path.join(out,'phase-0-4-phase5-handoff.csv'));
check('Master register coverage',master.length===336&&new Set(master.map((row)=>row.URL)).size===336,`${master.length}/${new Set(master.map((row)=>row.URL)).size}`);
check('Primary owner integrity',owners.length===40&&owners.filter((row)=>row['Owner conflict?']==='Yes').length===0,`${owners.length} owners; ${owners.filter((row)=>row['Owner conflict?']==='Yes').length} conflicts`);
check('Phase 3 intended/actual drift',drift.filter((row)=>row['Drift?']==='Yes').length===0,`${drift.filter((row)=>row['Drift?']==='Yes').length}`);
check('Phase 4 score coverage/improvement',p4Scores.length===16&&p4Scores.every((row)=>Number(row['Reconciliation total /100'])>Number(row['Phase 1 baseline total'])),`${p4Scores.length} rows`);
check('Phase 4 ownership preservation',p4Ownership.length===32&&p4Ownership.filter((row)=>row['Ownership conflict?']==='Yes').length===0,`${p4Ownership.length} rows`);
check('Phase 4 index preservation',p4Index.length===32&&p4Index.filter((row)=>row['Index drift?']==='Yes').length===0,`${p4Index.length} rows`);
check('Critical source issues',sources.filter((row)=>row['Critical unresolved issue?']==='Yes').length===0,`${sources.filter((row)=>row['Critical unresolved issue?']==='Yes').length}`);
check('Critical safety issues',safety.filter((row)=>row['Critical safety issue?']==='Yes').length===0,`${safety.filter((row)=>row['Critical safety issue?']==='Yes').length}`);
check('Production forensic parity',parity.length===336&&parity.every((row)=>row['Production fully matches forensic a1cd457?']==='Yes'),`${parity.filter((row)=>row['Production fully matches forensic a1cd457?']==='Yes').length}/336`);
check('Production current parity documented',parity.filter((row)=>row['Production fully matches current repo?']==='Yes').length===211,`${parity.filter((row)=>row['Production fully matches current repo?']==='Yes').length}/336`);
check('Phase 5 handoff nonempty and protected',phase5.length===191&&phase5.every((row)=>row['Protected content that must not be lost']&&row['Protected topic ownership']),`${phase5.length}`);

const p0Report=await readFile(path.join(p0,'ECHO_BUDDHA_RETROACTIVE_PHASE_0_BASELINE_AND_PROTECTION.md'),'utf8');
const masterReport=await readFile(path.join(out,'ECHO_BUDDHA_PHASE_0_4_RECONCILIATION_AND_STABILIZATION_REPORT.md'),'utf8');
check('Phase 0 report sections',(p0Report.match(/^## \d+\./gm)||[]).length===27,`${(p0Report.match(/^## \d+\./gm)||[]).length}`);
check('Master report sections',(masterReport.match(/^## \d+\./gm)||[]).length===40,`${(masterReport.match(/^## \d+\./gm)||[]).length}`);
check('Final verdict present',masterReport.includes('PRE-PHASE-5 DECISION:')&&masterReport.includes('GO FOR PHASE 5'),'Exact verdict fields found');

const result={checkedAt:new Date().toISOString(),status:failures.length?'FAIL':'PASS',checks,failures,metrics:{html:pages.length,indexable:indexable.length,noindex:noindex.length,sitemap:sitemap.size,brokenLinks,invalidJsonLd,ownerConflicts:owners.filter((row)=>row['Owner conflict?']==='Yes').length,criticalSources:sources.filter((row)=>row['Critical unresolved issue?']==='Yes').length,criticalSafety:safety.filter((row)=>row['Critical safety issue?']==='Yes').length,phase4SubstantiveFailures:p4Scores.filter((row)=>row['Substantive Phase 4 outcome']==='FAIL').length,productionFullCurrent:parity.filter((row)=>row['Production fully matches current repo?']==='Yes').length,productionFullForensic:parity.filter((row)=>row['Production fully matches forensic a1cd457?']==='Yes').length}};
await writeFile(path.join(out,'phase-0-4-custom-validation.json'),`${JSON.stringify(result,null,2)}\n`);
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exitCode=1;
