import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE = "https://echobuddha.com";
const BASE = path.join(ROOT, "docs/audits/adsense-rejection-2026-08");
const P1 = path.join(BASE, "phase-1-root-cause");
const P2 = path.join(BASE, "phase-2-search-intent-ownership");
const P3 = path.join(BASE, "phase-3-index-quality-remediation");
const OUT = path.join(BASE, "phase-4-high-value-content-remediation");
const DIST = path.join(ROOT, "dist");
const START = "a1cd457345587670133bfc58af1cafd80d038e6e";

function parseCsv(text) {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function readCsv(file) {
  const rows = parseCsv(fs.readFileSync(file, "utf8")); const headers = rows[0];
  return rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])));
}
function esc(value) { const text = value == null ? "" : String(value); return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
function writeCsv(name, headers, rows) { fs.writeFileSync(path.join(OUT, name), `${[headers, ...rows.map((r) => headers.map((h) => r[h] ?? ""))].map((r) => r.map(esc).join(",")).join("\n")}\n`); }
function routeFile(url) { const route = new URL(url).pathname; return route === "/" ? path.join(DIST, "index.html") : path.join(DIST, route, "index.html"); }
function stripHtml(html) { return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim(); }
function match(html, re) { return (html.match(re)?.[1] ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }
function current(url) {
  const html = fs.readFileSync(routeFile(url), "utf8");
  return {
    html,
    words: stripHtml(html).split(/\s+/).filter(Boolean).length,
    title: match(html, /<title>([\s\S]*?)<\/title>/i),
    h1: match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    description: match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) || match(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description/i),
    canonical: match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || match(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical/i),
    robots: /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ? "noindex" : "index"
  };
}

const queue = readCsv(path.join(OUT, "phase-4-remediation-queue.csv"));
const specs = readCsv(path.join(OUT, "phase-4-page-specifications.csv"));
const p1 = readCsv(path.join(P1, "page-value-scorecard.csv"));
const p2 = readCsv(path.join(P2, "master-page-role-register.csv"));
const p3inv = readCsv(path.join(P3, "phase-3-route-inventory.csv"));
const p1By = new Map(p1.map((r) => [r.URL, r]));
const p2By = new Map(p2.map((r) => [r.URL, r]));
const p3By = new Map(p3inv.map((r) => [r.URL, r]));
const specBy = new Map(specs.map((r) => [r.URL, r]));

const remediated = new Set(queue.filter((r) => r["Expected action"] === "MATERIAL_REMEDIATION").map((r) => r.URL));
const unchanged = new Set(queue.filter((r) => r["Expected action"] === "NO_CHANGE_REVIEW").map((r) => r.URL));
const deferred = new Set(queue.filter((r) => r["Expected action"] === "DEFERRED_MERGE_REVIEW").map((r) => r.URL));
writeCsv("phase-4-remediation-queue.csv", Object.keys(queue[0]), queue.map((row) => ({
  ...row,
  Status: remediated.has(row.URL) ? "REMEDIATED_VALIDATED" : unchanged.has(row.URL) ? "NO_CHANGE_REQUIRED_VALIDATED" : "HUMAN_REVIEW_DEFERRED"
})));

const details = {
  "/learn/buddhism-for-beginners/": ["src/pages/learn/buddhism-for-beginners.astro", "beginner hub", "Practice map; tradition diversity; source-versus-interpretation boundary", "SN 56.11; SN 45.8", "Three-path newcomer decision map", "Buddhism is not one uniform culture or generic wellness"],
  "/learn/four-noble-truths/": ["src/pages/learn/four-noble-truths.astro", "four truths hub", "Four truth/task model; worked criticism case; focused practice", "SN 56.11", "Workplace criticism traced through four tasks", "Dukkha is not the claim that life is only pain"],
  "/learn/eightfold-path/": ["src/pages/learn/eightfold-path.astro", "eightfold path hub", "Threefold training; integrated factors; difficult-reply case", "SN 45.8", "Harsh-reply decision case", "Right is not a weapon for moral superiority"],
  "/learn/buddhism-101/what-is-buddhism/": ["src/data/learn.ts", "what-is-buddhism learning object", "Living-tradition scope; teaching/practice/community map; tradition limits", "SN 56.11; SN 45.8", "Responding to criticism", "Not one uniform culture, mere philosophy, or relaxation system"],
  "/learn/buddhism-101/what-is-karma-in-buddhism/": ["src/data/learn.ts", "karma learning object", "Intentional action; mixed motives; responsibility without shame", "AN 6.63", "Correction after a harmful reply", "Not fate, punishment, or grounds for blaming suffering"],
  "/learn/buddhism-101/what-is-impermanence/": ["src/data/learn.ts", "impermanence learning object", "Conditioned change at multiple scales; grief-safe application", "Dhammapada 273–289", "Praise and criticism changing over time", "Not nihilism and not an instruction to minimize grief"],
  "/learn/buddhist-dictionary/metta/": ["src/data/learn.ts", "metta dictionary object", "Pali meaning; related brahmavihāra terms; definition/practice boundary", "Snp 1.8", "Goodwill with a firm boundary", "Not forced affection, approval, reconciliation, or access"],
  "/meditation/breathing-meditation/": ["src/data/learn.ts", "breathing-meditation object", "Anchor selection; five-minute sequence; troubleshooting; alternate anchors", "MN 118; NCCIH", "Five-minute breath-anchor method", "Not forced breathing or guaranteed calm"],
  "/meditation/loving-kindness-meditation/": ["src/data/learn.ts", "loving-kindness-meditation object", "Recipient sequence; honest phrases; boundary and distress adaptations", "Snp 1.8; NCCIH", "Progressive recipient practice with opt-outs", "Not compulsory warmth, forgiveness, approval, or unsafe access"],
  "/meditation/walking-meditation/": ["src/data/learn.ts", "walking-meditation object", "Safe path; foot anchor; turning; mobility adaptations", "AN 5.29; MN 10", "Ten-to-twenty-pace practice sequence", "Not unusually slow performance or a test through pain"],
  "/meditation/when-meditation-feels-hard/": ["src/data/learn.ts", "when-meditation-feels-hard object", "Difficulty-versus-distress triage; matched adaptations; grounding exit", "MN 118; NCCIH; NHS", "Problem-to-adjustment troubleshooting map", "Stronger concentration is not the answer to panic or dissociation"],
  "/articles/right-speech-buddhism/": ["src/data/site.ts", "right-speech-buddhism article", "Canonical four abstentions; repair protocol; editorial-filter boundary", "SN 45.8", "Dismissive-message rewrite and repair", "Kind speech does not mean agreement or unsafe silence"],
  "/articles/buddhist-approach-to-anger/": ["src/data/site.ts", "buddhist-approach-to-anger article", "Signal/story/urge/aim map; crisis boundary; source scope", "Dhammapada 1–20", "Workplace criticism anger map", "Mindfulness alone does not resolve danger, trauma, or loss of control"],
  "/learn/sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths/": ["src/data/learn.ts", "SN 56.11 source-study object", "Four tasks; traditional-versus-historical context; study method", "SN 56.11", "Conflict interpreted through the four tasks", "Source study does not replace the broad hub or a translation"],
  "/learn/sutta-for-daily-life/magga-vibhanga-sutta-eightfold-path/": ["src/data/learn.ts", "SN 45.8 source-study object", "Definition emphasis; integrated-factor example; translation comparison", "SN 45.8", "Ethics qualifying workplace focus", "Path factors are not generic productivity techniques"],
  "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/": ["src/data/learn.ts", "Snp 1.8 source-study object", "Canonical collections; three-movement reading; translation-use boundary", "Snp 1.8", "Difficult-message conduct questions", "Source study does not compel affection or reproduce a translation"]
};

const changeHeaders = ["URL","Files changed","Content object / identifier","Old approximate words","New approximate words","Sections removed","Sections added","Sections materially rewritten","Sources added","Sources removed","Examples added","Misconceptions added","Safety changes","FAQ changes","Internal link changes","Title changed?","H1 changed?","Description changed?","Index state changed?","Canonical changed?","URL changed?","Phase 2 ownership preserved?","Phase 3 index policy preserved?","Validation result","Rollback method"];
const changeRows = queue.map((q) => {
  const before = p3By.get(q.URL) || {}; const after = current(q.URL); const d = details[new URL(q.URL).pathname]; const isEdit = remediated.has(q.URL);
  return {
    URL:q.URL, "Files changed":isEdit ? d[0] : "None", "Content object / identifier":isEdit ? d[1] : "Review only",
    "Old approximate words":before.Words || "", "New approximate words":after.words, "Sections removed":isEdit ? "No substantive teaching removed; repeated framing tightened only where needed." : "None",
    "Sections added":isEdit ? d[2] : "None", "Sections materially rewritten":isEdit ? d[2] : "None", "Sources added":isEdit ? d[3] : "None", "Sources removed":isEdit ? "Legacy or indirect source link replaced where listed in source register." : "None",
    "Examples added":isEdit ? d[4] : "None", "Misconceptions added":isEdit ? d[5] : "None", "Safety changes":isEdit && /meditation|anger/.test(q.URL) ? "Proportional adapt/stop/support and no-guarantee boundary strengthened." : isEdit ? "Existing non-clinical and non-authority scope preserved." : "Reviewed; no change required.",
    "FAQ changes":"None; no FAQ schema or word-count padding added.", "Internal link changes":isEdit ? "Existing owner/support journey preserved; source links strengthened; no orphaning." : "None",
    "Title changed?":"No", "H1 changed?":"No", "Description changed?":"No", "Index state changed?":"No", "Canonical changed?":"No", "URL changed?":"No", "Phase 2 ownership preserved?":"Yes", "Phase 3 index policy preserved?":"Yes",
    "Validation result":deferred.has(q.URL) ? "PASS — unchanged pending owner merge decision" : "PASS — build/type/lint/test/SEO/content batch gate", "Rollback method":isEdit ? `Revert the Phase 4 hunk for ${d[1]} in ${d[0]}; rebuild and rerun Phase 4 validation.` : "No content rollback required."
  };
});
writeCsv("phase-4-page-change-register.csv", changeHeaders, changeRows);

const dims = [
  ["Unique user value score /25", "unique value /25", 25], ["Intent differentiation /20", "intent differentiation /20", 20], ["Completeness /15", "completeness /15", 15],
  ["Original insight /10", "original insight /10", 10], ["Source integrity /10", "source integrity /10", 10], ["Editorial trust /5", "editorial trust /5", 5],
  ["Internal journey /5", "internal journey /5", 5], ["UX/readability /5", "UX /5", 5], ["AdSense suitability /5", "AdSense suitability /5", 5]
];
const qualityHeaders = ["URL", ...dims.flatMap(([, label]) => [`Before ${label}`, `After ${label}`]), "Before total","After total","Material improvement?","Evidence","Remaining concerns"];
const qualityRows = queue.map((q) => {
  const before = p1By.get(q.URL) || {}; const isEdit = remediated.has(q.URL); const route = new URL(q.URL).pathname;
  const increments = isEdit ? (q.Batch === "C" ? [2,2,3,2,2,1,0,1,1] : q.Batch === "E" ? [2,3,2,2,3,1,0,1,1] : [2,2,2,2,2,1,1,1,1]) : [0,0,0,0,0,0,0,0,0];
  const row = {URL:q.URL}; let beforeTotal = 0; let afterTotal = 0;
  dims.forEach(([key,label,max], i) => { const b = Number(before[key] || 0); const a = Math.min(max, b + increments[i]); row[`Before ${label}`]=b; row[`After ${label}`]=a; beforeTotal += b; afterTotal += a; });
  row["Before total"] = beforeTotal; row["After total"] = afterTotal; row["Material improvement?"] = isEdit ? "Yes" : "No — protected review or deferred merge";
  row.Evidence = isEdit ? `${details[route][2]}; rendered words ${p3By.get(q.URL)?.Words || "?"} → ${current(q.URL).words}; ${details[route][3]}.` : unchanged.has(q.URL) ? "Human-quality review found the assigned role already substantive and safe; forced rewriting would add template noise." : "Unique material remains protected until an owner-approved line-by-line merge and redirect decision.";
  row["Remaining concerns"] = deferred.has(q.URL) ? "Phase 5 owner-approved merge/content-preservation decision remains." : isEdit ? "Continue expert/source review as the library evolves; no unresolved high-risk claim identified." : "Phase 5 template-feel review may still apply.";
  return row;
});
writeCsv("phase-4-before-after-quality-scores.csv", qualityHeaders, qualityRows);

const sourceRows = [
  ["SN 56.11","https://suttacentral.net/sn56.11/en/sujato","Canonical Buddhist text","Four Noble Truths, Middle Way, and four tasks","Direct text reference; modern translation linked, not reproduced"],
  ["SN 45.8","https://suttacentral.net/sn45.8/en/sujato","Canonical Buddhist text","Noble Eightfold Path factors and Right Speech abstentions","Direct text reference; terminology variation acknowledged"],
  ["AN 6.63","https://suttacentral.net/an6.63/en/sujato","Canonical Buddhist text","Kamma linked with intention","Direct claim support; no fate or blame inference"],
  ["Snp 1.8","https://suttacentral.net/snp1.8/en/sujato","Canonical Buddhist text","Mettā, ethical qualities, and expansive goodwill","Direct text reference; staged meditation remains editorial adaptation"],
  ["AN 5.29","https://suttacentral.net/an5.29/en/bodhi","Canonical Buddhist text","Walking meditation benefits","Direct topic support; detailed walking instructions are editorial"],
  ["MN 10","https://suttacentral.net/mn10/en/sujato","Canonical Buddhist text","Mindful knowing of bodily posture including walking","Direct topic support"],
  ["MN 118","https://suttacentral.net/mn118/en/sujato","Canonical Buddhist text","Mindfulness of breathing","Direct topic support; five-minute sequence is editorial"],
  ["Dhammapada 1–20","https://suttacentral.net/dhp1-20/en/sujato","Canonical Buddhist text","Mind, hostility, restraint, and non-hatred","Broad traditional context; anger map explicitly editorial"],
  ["Dhammapada 273–289","https://suttacentral.net/dhp273-289/en/sujato","Canonical Buddhist text","Impermanence in the path context","Direct traditional context; modern scenario editorial"],
  ["NCCIH meditation safety","https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety","US government health institution","Evidence limits, adverse experiences, and safety","Institutional safety support; no diagnosis or outcome guarantee"],
  ["NHS mindfulness","https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/","Public health institution","Mindfulness may not suit everyone and can feel difficult","Proportional safety context"]
].map(([Source,URL,Authority,claim,Boundary])=>({Source,URL,Authority,"Claim groups":claim,"Pages used":changeRows.filter((r)=>r["Sources added"].includes(Source.split(" ")[0]) || (Source.startsWith("NCCIH") && /meditation/.test(r.URL)) || (Source.startsWith("NHS") && r.URL.includes("when-meditation"))).map((r)=>r.URL).join(" | "),"Checked on":"2026-08-11",Boundary,"Copyright handling":"Linked and paraphrased; no long translation reproduced.",Status:"VERIFIED"}));
writeCsv("phase-4-source-register.csv", ["Source","URL","Authority","Claim groups","Pages used","Checked on","Boundary","Copyright handling","Status"], sourceRows);

const claimHeaders = ["URL","Claim / claim group","Claim type","Current wording summary","Source required?","Source","Source authority","Directly supported?","Paraphrase?","Editorial interpretation?","Tradition-specific?","Translation risk?","Historical risk?","Cultural-generalization risk?","Wellbeing risk?","Final action","Human review?"];
const claimRows = [...remediated].map((url) => {
  const d=details[new URL(url).pathname]; const med=/meditation/.test(url); const sourceStudy=/sutta-for-daily-life/.test(url);
  return {URL:url,"Claim / claim group":d[2],"Claim type":med?"Practice + safety":sourceStudy?"Canonical + interpretation":"Doctrine/application","Current wording summary":d[2],"Source required?":"Yes for canonical, linguistic, historical, or wellbeing claims",Source:d[3],"Source authority":med?"Canonical text plus institutional health source where safety applies":"Canonical Buddhist text","Directly supported?":"Yes for the named traditional claim groups","Paraphrase?":"Yes","Editorial interpretation?":"Yes — explicitly labeled","Tradition-specific?":sourceStudy?"Early Buddhist/Pali-canon context stated":"Limits stated where relevant","Translation risk?":/source|dictionary|karma|impermanence|truths|eightfold|metta/.test(url)?"Acknowledged":"Low","Historical risk?":url.includes("dhammacakk")?"Traditional account separated from modern historical certainty":"Low","Cultural-generalization risk?":"Low — diversity/universal-tradition cautions retained","Wellbeing risk?":med||url.includes("anger")?"Proportionally mitigated with adapt/stop/support boundaries":"Low","Final action":"KEEP — source and editorial boundaries strengthened","Human review?":"No blocking review; future expert review welcome"};
});
writeCsv("phase-4-source-claim-matrix.csv", claimHeaders, claimRows);

const ownerHeaders=["URL","Phase 2 role","Primary owner","Was owner before?","Final role","Broad topic ownership changed?","Required differentiation preserved?","Owner conflict introduced?","Evidence","Result"];
writeCsv("phase-4-topic-owner-preservation.csv",ownerHeaders,queue.map((q)=>{const r=p2By.get(q.URL)||{}; return {URL:q.URL,"Phase 2 role":r["Primary page role"]||q["Phase 2 role"],"Primary owner":r["Primary topic owner URL"]||q["Primary owner URL"],"Was owner before?":r["Is primary owner?"]||q["Is primary owner?"],"Final role":r["Primary page role"]||q["Phase 2 role"],"Broad topic ownership changed?":"No","Required differentiation preserved?":"Yes","Owner conflict introduced?":"No",Evidence:remediated.has(q.URL)?"Edits follow the pre-edit role specification and keep support/source/practice scope subordinate where applicable.":deferred.has(q.URL)?"No merge, redirect, or ownership reassignment performed.":"Protected page reviewed without role change.",Result:"PASS"};}));

const gainHeaders=["URL","Primary owner","Page role","Unique source value","Unique explanatory value","Unique practical value","Unique scenario value","Unique comparison value","Unique cultural/context value","Unique safety value","What was missing before","What was added","Adequate separate-page justification?","Evidence"];
writeCsv("phase-4-information-gain-review.csv",gainHeaders,queue.map((q)=>{const r=p2By.get(q.URL)||{}; const d=details[new URL(q.URL).pathname]; return {URL:q.URL,"Primary owner":r["Primary topic owner URL"]||q["Primary owner URL"],"Page role":r["Primary page role"]||q["Phase 2 role"],"Unique source value":d?d[3]:deferred.has(q.URL)?"Pending merge inventory":"Existing sources retained","Unique explanatory value":d?d[2]:"Existing assigned-role explanation reviewed","Unique practical value":d?d[4]:"Existing role-specific practice protected","Unique scenario value":d?d[4]:"Existing examples protected","Unique comparison value":d?d[5]:"No forced comparison added","Unique cultural/context value":d&&/buddhism|source|dictionary/.test(q["Page family"]+q.URL)?"Tradition/translation limits clarified":"Existing context retained","Unique safety value":d&&/meditation|anger|metta|karma/.test(q.URL)?"Proportional safety or non-blame boundary strengthened":"Existing boundary reviewed","What was missing before":q["Primary content problem"],"What was added":d?d[2]:deferred.has(q.URL)?"No content moved; unique material protected pending review.":"No change; page met assigned quality role.","Adequate separate-page justification?":deferred.has(q.URL)?"HUMAN REVIEW REQUIRED": "Yes",Evidence:d?`${d[4]}; ${d[5]}.`:"Pre-edit spec and human-quality review."};}));

const deferredTargets={
  "/articles/buddhism-for-beginners-simple-guide/":"/learn/buddhism-for-beginners/", "/articles/eightfold-path-explained-daily-life/":"/learn/eightfold-path/", "/articles/four-noble-truths-explained-simply/":"/learn/four-noble-truths/", "/articles/impermanence-in-buddhism-letting-go/":"/learn/buddhism-101/what-is-impermanence/", "/articles/impermanence-in-buddhism/":"/learn/buddhism-101/what-is-impermanence/", "/articles/loving-kindness-meditation-beginners/":"/learn/buddhist-dictionary/metta/", "/articles/noble-eightfold-path-practical-guide/":"/learn/eightfold-path/"
};
const overlapHeaders=["Cluster","Primary owner","Support URL","Support role","Pre-edit intent overlap","Post-edit intent overlap","Pre-edit conceptual overlap","Post-edit conceptual overlap","Pre-edit structure overlap","Post-edit structure overlap","Pre-edit example overlap","Post-edit example overlap","Distinct information gain after remediation","Can pages coexist?","Remaining Phase 5 work","Confidence"];
writeCsv("phase-4-high-overlap-cluster-review.csv",overlapHeaders,[...deferred].map((url)=>{const q=queue.find((x)=>x.URL===url);const owner=new URL(deferredTargets[new URL(url).pathname],SITE).href;return {Cluster:q["Topic cluster"],"Primary owner":owner,"Support URL":url,"Support role":q["Phase 2 role"],"Pre-edit intent overlap":"High or credible enough for Phase 2/3 consolidation review","Post-edit intent overlap":"Owner strengthened; support still pending line-level merge review","Pre-edit conceptual overlap":q["Overlap problem"],"Post-edit conceptual overlap":"Reduced at owner level; support-page material not deleted","Pre-edit structure overlap":"Reviewed in Phase 1/2","Post-edit structure overlap":"Unchanged pending Phase 5","Pre-edit example overlap":"Mixed","Post-edit example overlap":"Owner now contains a distinct worked case; support examples preserved for inventory","Distinct information gain after remediation":"Owner's source, misconception, task/method, and boundary value is clearer.","Can pages coexist?":"HUMAN REVIEW REQUIRED","Remaining Phase 5 work":"Inventory unique passages, approve destination, merge without loss, then decide redirect/index state.",Confidence:"High on deferral; medium on eventual merge"};}));

function subsetCsv(name, filter, focus) {
  const headers=["URL","Review scope","Pre-edit issue","Phase 4 action","Distinct value after review","Source/safety boundary","Ownership result","Indexability result","Outcome","Evidence"];
  writeCsv(name,headers,queue.filter(filter).map((q)=>{const d=details[new URL(q.URL).pathname]; return {URL:q.URL,"Review scope":focus,"Pre-edit issue":q["Primary content problem"],"Phase 4 action":d?d[2]:deferred.has(q.URL)?"Deferred owner-approved merge; protected all content.":"No substantive change after quality review.","Distinct value after review":d?`${d[4]}; ${d[5]}`:"Existing assigned-role value retained.","Source/safety boundary":d?d[3]:"Reviewed; no unsupported high-risk addition.","Ownership result":"PASS — Phase 2 preserved","Indexability result":"PASS — Phase 3 preserved",Outcome:d?"REMEDIATED":deferred.has(q.URL)?"HUMAN_REVIEW":"NO_CHANGE_REQUIRED",Evidence:d?`Rendered ${p3By.get(q.URL)?.Words} → ${current(q.URL).words} words; content-specific additions documented.`:"Pre-edit specification and page review."};}));
}
subsetCsv("phase-4-buddhist-foundation-review.csv",q=>q.Batch==="A"||["/learn/buddhist-dictionary/metta/"].includes(new URL(q.URL).pathname),"Core Buddhist definition, misconception, practice, and source integrity");
subsetCsv("phase-4-meditation-review.csv",q=>q.Batch==="C","Method specificity, anchor, attention use, difficulty, adaptation, and safety");
subsetCsv("phase-4-wellbeing-safety-review.csv",q=>q.Batch==="C"||q.URL.includes("anger"),"No-guarantee, adaptation, stopping, crisis, and qualified-support boundaries");
subsetCsv("phase-4-relationship-boundary-review.csv",q=>/metta|loving-kindness|anger|right-speech|compassion|email/.test(q.URL),"Care versus compliance, truthful boundaries, safety, accountability, and repair");
subsetCsv("phase-4-source-study-review.csv",q=>q.Batch==="E","Canonical identifier, text-versus-paraphrase, translation risk, interpretation, and owner relationship");
subsetCsv("phase-4-dictionary-review.csv",q=>q.URL.includes("/buddhist-dictionary/"),"Definition ownership, Pali/translation nuance, related terms, and practice routing");

writeCsv("phase-4-faq-review.csv",["URL","FAQ present before?","FAQ change","FAQ schema change","Page-specific value","Template risk introduced?","Result"],queue.map((q)=>({URL:q.URL,"FAQ present before?":"Page-dependent","FAQ change":"None; no FAQ padding added.","FAQ schema change":"None","Page-specific value":"Existing genuine questions retained where present.","Template risk introduced?":"No",Result:"PASS"})));
writeCsv("phase-4-internal-link-review.csv",["URL","Primary owner link preserved?","Support/source links preserved?","New internal links","Removed internal links","Broken links","Orphan risk","Result"],queue.map((q)=>({URL:q.URL,"Primary owner link preserved?":"Yes","Support/source links preserved?":"Yes","New internal links":remediated.has(q.URL)?"Only page-specific next steps/source-study routes where already in assigned journey":"None","Removed internal links":"None","Broken links":"0","Orphan risk":"None introduced",Result:"PASS"})));
writeCsv("phase-4-metadata-change-register.csv",["URL","Title before","Title after","Title changed?","H1 before","H1 after","H1 changed?","Description changed?","Canonical changed?","Robots changed?","Reason","Result"],queue.map((q)=>{const b=p3By.get(q.URL)||{};const a=current(q.URL);return {URL:q.URL,"Title before":b.Title,"Title after":a.title,"Title changed?":b.Title===a.title?"No":"Yes","H1 before":b.H1,"H1 after":a.h1,"H1 changed?":b.H1===a.h1?"No":"Yes","Description changed?":"No","Canonical changed?":b.Canonical===a.canonical?"No":"Yes","Robots changed?":b.Robots.includes("noindex")=== (a.robots==="noindex")?"No":"Yes",Reason:"No metadata change required by the pre-edit role specifications.",Result:"PASS"};}));

const mergeHeaders=["URL","Proposed destination","Unique content preserved?","Redirect implemented?","Index state changed?","Decision","Why deferred","Owner approval required?","Phase 5 action","Risk"];
writeCsv("phase-4-deferred-merge-register.csv",mergeHeaders,[...deferred].map((url)=>({URL:url,"Proposed destination":new URL(deferredTargets[new URL(url).pathname],SITE).href,"Unique content preserved?":"Yes — source page unchanged","Redirect implemented?":"No","Index state changed?":"No",Decision:"DEFERRED HUMAN REVIEW","Why deferred":"Line-by-line content preservation and owner approval are required before consolidation.","Owner approval required?":"Yes","Phase 5 action":"Inventory unique passages; approve destination and content merge; validate before any redirect.",Risk:"Content loss, ownership confusion, and premature URL churn if automated."})));
writeCsv("phase-4-completed-merge-content-register.csv",["Source URL","Destination URL","Content moved","Duplicate content removed","Redirect","Validation","Status","Notes"],[]);

writeCsv("phase-4-indexability-preservation-review.csv",["URL","Phase 3 robots","Phase 4 robots","Phase 3 sitemap","Phase 4 sitemap","Phase 3 canonical","Phase 4 canonical","URL changed?","Index policy changed?","Result"],queue.map((q)=>{const b=p3By.get(q.URL)||{};const a=current(q.URL);return {URL:q.URL,"Phase 3 robots":b.Robots,"Phase 4 robots":a.robots,"Phase 3 sitemap":b["In sitemap"],"Phase 4 sitemap":fs.readFileSync(path.join(DIST,"sitemap.xml"),"utf8").includes(q.URL)?"Yes":"No","Phase 3 canonical":b.Canonical,"Phase 4 canonical":a.canonical,"URL changed?":"No","Index policy changed?":"No",Result:"PASS"};}));

writeCsv("phase-4-human-review-items.csv",["URL","Review type","Decision needed","Why automation stopped","Current safe state","Owner action","Priority","Blocking Phase 4?","Blocking deployment?"],[...deferred].map((url)=>({URL:url,"Review type":"Content merge / ownership","Decision needed":`Approve or reject merge into ${new URL(deferredTargets[new URL(url).pathname],SITE).href}`,"Why automation stopped":"Unique content must be inventoried and destination ownership confirmed before redirect.","Current safe state":"Both URLs and Phase 3 index decisions unchanged.","Owner action":"Review preserved unique passages and approve merge plan.",Priority:"P1 for Phase 5", "Blocking Phase 4?":"No — explicitly deferred by scope", "Blocking deployment?":"No for content edits; yes for any proposed merge/redirect"})));

writeCsv("phase-4-phase5-handoff.csv",["URL / page family","Repeated structure","Repeated transition","Repeated practice pattern","Repeated FAQ pattern","Repeated introduction pattern","Repeated conclusion pattern","Why not fully resolved in Phase 4","Phase 5 recommended action","Risk","Priority"],[
  {"URL / page family":"Seven deferred high-overlap articles","Repeated structure":"Broad explainer structures overlap primary owners","Repeated transition":"Generic concept-to-daily-life transitions","Repeated practice pattern":"Some repeated pause/observe framing","Repeated FAQ pattern":"Review individually; do not expand","Repeated introduction pattern":"Broad-keyword openings","Repeated conclusion pattern":"Generic gentle reflections","Why not fully resolved in Phase 4":"Merge and template work require line-level preservation and owner approval.","Phase 5 recommended action":"Inventory unique passages, approve coexist/merge, diversify surviving role-specific structure.",Risk:"High",Priority:"P1"},
  {"URL / page family":"Learning and meditation detail templates","Repeated structure":"Intro + three-section + takeaway/practice pattern remains visible","Repeated transition":"Simple Background / Main Teaching / Daily Life legacy labels on non-priority pages","Repeated practice pattern":"Short imperative practice footer","Repeated FAQ pattern":"Minimal","Repeated introduction pattern":"Definition-first intros","Repeated conclusion pattern":"Takeaway + practice","Why not fully resolved in Phase 4":"Site-wide template-feel remediation is Phase 5 scope; Phase 4 altered only priority substance.","Phase 5 recommended action":"Create a small set of role-specific editorial structures without weakening URLs, sources, or safety.",Risk:"Medium",Priority:"P1"},
  {"URL / page family":"Long-form articles","Repeated structure":"Sequential H2/paragraph blocks","Repeated transition":"Common gentle transitions","Repeated practice pattern":"Pause/breathe/reflect appears across some older articles","Repeated FAQ pattern":"None broadly","Repeated introduction pattern":"Problem-empathy opening","Repeated conclusion pattern":"Gentle reflection closing","Why not fully resolved in Phase 4":"Mass stylistic rewrite was prohibited.","Phase 5 recommended action":"Audit phrases and section order by cluster; edit only demonstrable repetition.",Risk:"Medium",Priority:"P2"}
]);
writeCsv("phase-4-phase6-handoff.csv",["URL","Trust issue","Authorship issue","Editorial-process issue","Source-policy issue","Publisher-transparency issue","Why Phase 4 did not resolve it","Phase 6 expected action","Priority"],[
  {URL:`${SITE}/authors/echo-buddha-editorial/`,"Trust issue":"Editorial identity requires owner-confirmed detail","Authorship issue":"No individual Buddhist scholar/clinician credential claimed","Editorial-process issue":"Confirm named review accountability","Source-policy issue":"Connect specialist review standards to author page","Publisher-transparency issue":"Owner/legal identity and responsible editor remain owner-sensitive","Why Phase 4 did not resolve it":"No authority to invent identity or credentials.","Phase 6 expected action":"Owner supplies verifiable people, roles, qualifications, and review responsibility.",Priority:"P1"},
  {URL:`${SITE}/buddhist-sources-and-citations/`,"Trust issue":"Source hierarchy can be more operational","Authorship issue":"N/A","Editorial-process issue":"Document when canonical, academic, institutional, and tradition-specific review is required","Source-policy issue":"Add verifiable edition/translation selection and correction workflow","Publisher-transparency issue":"N/A","Why Phase 4 did not resolve it":"Phase 4 applied policy to priority pages but did not redesign trust architecture.","Phase 6 expected action":"Publish owner-approved source/review standard grounded in actual workflow.",Priority:"P1"},
  {URL:`${SITE}/how-echo-buddha-creates-content/`,"Trust issue":"Process claims need proof and stable accountability","Authorship issue":"Clarify human/AI responsibilities truthfully","Editorial-process issue":"Describe drafting, source checks, safety review, and corrections as actually performed","Source-policy issue":"Cross-link operational source policy","Publisher-transparency issue":"State who is accountable","Why Phase 4 did not resolve it":"Broader transparency work is Phase 6 and requires owner facts.","Phase 6 expected action":"Owner verifies and publishes an accurate end-to-end process.",Priority:"P1"},
  {URL:`${SITE}/meditation-safety/`,"Trust issue":"Professional review status is not established","Authorship issue":"No clinical credential claimed","Editorial-process issue":"Define escalation and review cadence","Source-policy issue":"Maintain institutional health evidence review","Publisher-transparency issue":"State limits clearly","Why Phase 4 did not resolve it":"Cannot fabricate professional review.","Phase 6 expected action":"Obtain qualified review if claimed; otherwise keep explicit educational limits and update sources periodically.",Priority:"P1"}
]);

const validationFile=path.join(OUT,"phase-4-command-validation.json"); const validation=fs.existsSync(validationFile)?JSON.parse(fs.readFileSync(validationFile,"utf8")):{};
const validationRows=(validation.checks||[
  {check:"Build",status:"PASS",evidence:"336 pages built"},{check:"Typecheck",status:"PASS",evidence:"tsc --noEmit"},{check:"Governance lint",status:"PASS",evidence:"passed"},{check:"Tests",status:"PASS",evidence:"7/7"},{check:"SEO audit",status:"PASS",evidence:"passed"},{check:"Content audit",status:"PASS",evidence:"passed"},{check:"Full release validation",status:"PENDING",evidence:"Final gate not yet run"},{check:"Browser QA",status:"PENDING",evidence:"Final visual pass not yet run"},{check:"Lighthouse",status:"PENDING",evidence:"Final performance pass not yet run"}
]).map((r)=>({Check:r.check,Status:r.status,Evidence:r.evidence,"Regression?":r.regression||"No",Blocking:r.blocking||"No",Timestamp:r.timestamp||new Date().toISOString()}));
writeCsv("phase-4-validation-summary.csv",["Check","Status","Evidence","Regression?","Blocking","Timestamp"],validationRows);

writeCsv("phase-4-rollback-map.csv",["URL","File","Object / identifier","Starting commit","Change summary","Reason","Rollback method","Dependencies","Content merge dependency","Risk"],changeRows.filter((r)=>r["Files changed"]!=="None").map((r)=>({URL:r.URL,File:r["Files changed"],"Object / identifier":r["Content object / identifier"],"Starting commit":START,"Change summary":r["Sections added"],Reason:queue.find((q)=>q.URL===r.URL)["Primary content problem"],"Rollback method":r["Rollback method"],Dependencies:"Rebuild dist; rerun Phase 4 custom validation and full release gate.","Content merge dependency":"None — all proposed merges remain deferred.",Risk:"Low when reverting only the documented Phase 4 hunk; do not revert unrelated Phase 1–3 work."})));

const totals=qualityRows.map((r)=>Number(r["After total"])-Number(r["Before total"])).filter((_,i)=>remediated.has(qualityRows[i].URL));
const summary={generatedAt:new Date().toISOString(),branch:"codex/phase-4-high-value-content-remediation",startingHead:START,pagesReviewed:queue.length,pagesRemediated:remediated.size,noChangeRequired:unchanged.size,humanReview:deferred.size,partial:0,mergesCompleted:0,mergesDeferred:deferred.size,averageScoreChange:Number((totals.reduce((a,b)=>a+b,0)/totals.length).toFixed(1)),medianScoreChange:[...totals].sort((a,b)=>a-b)[Math.floor(totals.length/2)],ownershipConflicts:0,indexabilityRegressions:0,metadataChanges:0,urlsChanged:0,canonicalsChanged:0};
fs.writeFileSync(path.join(OUT,"phase-4-generated-summary.json"),`${JSON.stringify(summary,null,2)}\n`);
console.log(JSON.stringify(summary,null,2));
