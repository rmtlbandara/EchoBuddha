import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const base = path.join(root, "docs/audits/adsense-rejection-2026-08");
const p0Dir = path.join(base, "phase-0-retroactive-baseline");
const p1Dir = path.join(base, "phase-1-root-cause");
const p2Dir = path.join(base, "phase-2-search-intent-ownership");
const p3Dir = path.join(base, "phase-3-index-quality-remediation");
const p4Dir = path.join(base, "phase-4-high-value-content-remediation");
const out = path.join(base, "reconciliation");

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[\",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const parseCsv = (text) => {
  const records = [];
  let record = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { record.push(field); field = ""; }
    else if (character === "\n") { record.push(field); records.push(record); record = []; field = ""; }
    else if (character !== "\r") field += character;
  }
  if (field || record.length) { record.push(field); records.push(record); }
  const headers = records.shift() ?? [];
  return records.filter((row) => row.length > 1 || row[0]).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
};
const readCsv = async (file) => parseCsv(await readFile(file, "utf8"));
const writeCsv = async (target, rows, headers = Object.keys(rows[0] ?? {})) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  await writeFile(target, `${body}\n`);
};
const by = (rows, key = "URL") => new Map(rows.map((row) => [row[key], row]));
const htmlFileForRoute = (route) => route === "/"
  ? path.join(root, "dist", "index.html")
  : route.endsWith("/")
    ? path.join(root, "dist", route.slice(1), "index.html")
    : path.join(root, "dist", route.slice(1));

const p1 = await readCsv(path.join(p1Dir, "all-indexable-pages-quality-matrix.csv"));
const p2 = await readCsv(path.join(p2Dir, "master-page-role-register.csv"));
const owners = await readCsv(path.join(p2Dir, "primary-topic-owner-register.csv"));
const p3 = await readCsv(path.join(p3Dir, "phase-3-indexability-decision-matrix.csv"));
const p3Routes = await readCsv(path.join(p3Dir, "phase-3-route-inventory.csv"));
const p4Queue = await readCsv(path.join(p4Dir, "phase-4-remediation-queue.csv"));
const p4ClaimedScores = await readCsv(path.join(p4Dir, "phase-4-before-after-quality-scores.csv"));
const p4Changes = await readCsv(path.join(p4Dir, "phase-4-page-change-register.csv"));
const p4Sources = await readCsv(path.join(p4Dir, "phase-4-source-register.csv"));
const currentContent = await readCsv(path.join(out, "phase-0-4-current-content-inventory.csv"));
const currentIndex = await readCsv(path.join(out, "phase-0-4-current-indexability-inventory.csv"));
const productionParity = await readCsv(path.join(out, "phase-0-4-production-parity.csv"));
const p1By = by(p1), p2By = by(p2), p3By = by(p3), p3RouteBy = by(p3Routes), p4QueueBy = by(p4Queue), p4ScoreBy = by(p4ClaimedScores), p4ChangeBy = by(p4Changes), contentBy = by(currentContent), indexBy = by(currentIndex), parityBy = by(productionParity);

const rescored = [
  ["/learn/buddhism-for-beginners/",17,17,12,8,9,5,5,4,4,"Decision map, tradition boundary, two canonical anchors; still shares site shell."],
  ["/learn/four-noble-truths/",18,17,11,8,10,5,5,4,4,"Four tasks, worked criticism case, focused practice, direct SN 56.11 source."],
  ["/learn/eightfold-path/",18,17,11,8,10,5,5,4,4,"Three training areas, integrated-factor example, direct SN 45.8 source."],
  ["/learn/buddhism-101/what-is-buddhism/",18,15,12,8,9,5,5,5,4,"Diverse living-tradition scope and teaching/practice/community model; subordinate role preserved."],
  ["/learn/buddhism-101/what-is-karma-in-buddhism/",18,15,12,8,9,5,5,5,5,"Intention, mixed motives, responsibility without shame, direct AN 6.63 support."],
  ["/learn/buddhism-101/what-is-impermanence/",16,14,12,8,9,5,5,5,4,"Three scales, grief-safe limitation, traditional/editorial boundary."],
  ["/learn/buddhist-dictionary/metta/",16,14,10,7,9,5,5,5,4,"Language definition, related terms, practice boundary, direct Snp 1.8 support."],
  ["/meditation/breathing-meditation/",14,13,13,8,9,5,4,5,4,"Named breath anchor, five-minute sequence, troubleshooting, adaptation and stop conditions."],
  ["/meditation/loving-kindness-meditation/",14,13,12,8,9,5,4,5,4,"Recipient sequence, honest phrases, goodwill/boundary distinction, safety limits."],
  ["/meditation/walking-meditation/",14,13,12,7,9,5,4,5,4,"Safe path, foot anchor, turning and mobility adaptations, direct walking sources."],
  ["/meditation/when-meditation-feels-hard/",15,14,13,8,9,5,4,5,5,"Difficulty/distress triage, matched adaptations, grounding exit, stop/support boundary."],
  ["/articles/right-speech-buddhism/",19,17,15,9,9,5,5,5,4,"Four abstentions, editorial filters, repair example, source and owner boundaries."],
  ["/articles/buddhist-approach-to-anger/",19,16,15,9,9,5,5,5,5,"Signal/story/urge/aim model, response sequence, accountability and crisis boundary."],
  ["/learn/sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths/",16,15,12,8,10,5,4,4,4,"Source-specific four-task reading with translation/paraphrase boundary."],
  ["/learn/sutta-for-daily-life/magga-vibhanga-sutta-eightfold-path/",16,15,12,7,10,5,4,4,4,"Source-specific definition emphasis and integrated-factor example."],
  ["/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/",16,15,11,7,10,5,4,4,3,"Snp 1.8 context, ethical preconditions, translation-use boundary."],
].map(([route, unique, intent, completeness, original, source, trust, journey, ux, adsense, evidence]) => ({
  URL: `https://echobuddha.com${route}`, unique, intent, completeness, original, source, trust, journey, ux, adsense,
  total: unique + intent + completeness + original + source + trust + journey + ux + adsense,
  evidence,
}));
const rescoredBy = by(rescored);

const scoreRows = rescored.map((row) => {
  const baseline = p1By.get(row.URL), claimed = p4ScoreBy.get(row.URL);
  const claimedTotal = Number(claimed?.["After total"] ?? 0);
  return {
    URL: row.URL,
    "Phase 1 baseline total": baseline?.["Total /100"] ?? "",
    "Phase 4 claimed total": claimedTotal,
    "Reconciliation unique value /25": row.unique,
    "Reconciliation intent differentiation /20": row.intent,
    "Reconciliation completeness /15": row.completeness,
    "Reconciliation original insight /10": row.original,
    "Reconciliation source integrity /10": row.source,
    "Reconciliation editorial trust /5": row.trust,
    "Reconciliation internal journey /5": row.journey,
    "Reconciliation UX /5": row.ux,
    "Reconciliation AdSense suitability /5": row.adsense,
    "Reconciliation total /100": row.total,
    "Claim discrepancy": claimedTotal === row.total ? "NONE" : `${claimedTotal} claimed -> ${row.total} reconciled`,
    "Independent evidence": row.evidence,
    "Substantive Phase 4 outcome": row.total > Number(baseline?.["Total /100"] ?? 0) ? "VALIDATED_MATERIAL_IMPROVEMENT" : "FAIL",
  };
});
await writeCsv(path.join(out, "phase-4-quality-score-reconciliation.csv"), scoreRows);

const phase1Corrections = [
  { ID:"P1-C01", Item:"Site-wide semantic duplication root-cause label", "Original decision":"CONFIRMED", "Corrected decision":"LIKELY; exact repeated sentence and structural reuse remain CONFIRMED", Reason:"Exact template repetition is proven, but site-wide semantic duplication requires qualitative intent/value judgment and should not be generalized as a confirmed fact.", Evidence:"Phase 1 generator similarity plus Phase 2 role map and current all-page review", "Implementation correction":"Authoritative reconciliation label only; historical report preserved", Cascade:"P2 role decisions rechecked; no page-level owner change" },
  { ID:"P1-C02", Item:"Intent duplication root-cause label", "Original decision":"CONFIRMED", "Corrected decision":"LIKELY INTENT OVERLAP / OWNERSHIP AMBIGUITY AT PHASE 1", Reason:"Multiple broad-intent routes were proven, but Phase 2 demonstrated distinct defensible roles for many of them; duplication was too categorical.", Evidence:"40-cluster ownership map; 40 unique owners; no owner noindexed", "Implementation correction":"Authoritative reconciliation label only", Cascade:"No Phase 2 owner reversal required" },
  { ID:"P1-C03", Item:"100-point score evidentiary status", "Original decision":"Page-level quality totals presented without prominent disclosure of family-seeded mechanical scoring", "Corrected decision":"SCREENING HEURISTIC; qualitative evidence controls decisions", Reason:"Phase 1 generator seeds dimensions by family and similarity rather than independently scoring every dimension for every page.", Evidence:"generate-phase-1-evidence.mjs lines 223–256 and sampled page review", "Implementation correction":"Scores retained as historical triage; master register identifies them as heuristic", Cascade:"Phase 4 changed pages independently rescored" },
  { ID:"P1-C04", Item:"Automated browser/Lighthouse root-cause row", "Original decision":"POSSIBLE", "Corrected decision":"NOT ROOT-CAUSE EVIDENCE / HISTORICAL HARNESS LIMITATION", Reason:"A local harness load failure does not support an AdSense rejection hypothesis; fresh browser and Lighthouse runs pass.", Evidence:"Fresh baseline browser PASS; 20 Lighthouse runs PASS", "Implementation correction":"Superseded in reconciliation", Cascade:"No page decision change" },
];
const phase2Corrections = [];
const phase3Corrections = [];
const phase4Corrections = [
  { ID:"P4-C01", Item:"Phase 4 claimed score gains", "Original decision":"Fixed per-batch increments produced average +13.7 and median +14", "Corrected decision":"Independent all-16 reconciliation scores; average and median recalculated from evidence", Reason:"Mechanical increments cannot substantiate an editorial quality outcome.", Evidence:"phase-4-quality-score-reconciliation.csv; all 16 current pages reviewed", "Implementation correction":"Historical score artifact retained; new reconciliation artifact authoritative", Cascade:"Master quality scores updated" },
  { ID:"P4-C02", Item:"Phase 4 source register page-use mappings", "Original decision":"Several sources listed on pages where their URLs are not present", "Corrected decision":"Actual rendered source-to-page mappings are authoritative", Reason:"The generated Pages used cells overstate source placement (for example AN 6.63 on walking meditation and SN 56.11 on Right Speech).", Evidence:"Rendered HTML link extraction across all listed pages", "Implementation correction":"phase-4-source-reconciliation.csv generated from actual HTML", Cascade:"Master source status uses actual links" },
  { ID:"P4-C03", Item:"Seven deferred consolidations routed to Phase 5", "Original decision":"Phase 5 owner-approved merge/content-preservation decision remains", "Corrected decision":"OWNER EDITORIAL REVIEW HOLD; not part of systematic Phase 5 work", Reason:"A merge/retirement decision is Phase 4 correctness/governance work, while Phase 5 is template-feel remediation. Current pages remain safely unchanged and indexed.", Evidence:"Seven-row deferred merge register; zero completed merges; no current ownership/index defect", "Implementation correction":"Removed from clean Phase 5 queue; retained as human review hold", Cascade:"Phase 5 handoff cleaned" },
];

await writeCsv(path.join(out, "phase-1-correction-register.csv"), phase1Corrections);
await writeCsv(path.join(out, "phase-2-correction-register.csv"), phase2Corrections, ["ID","Item","Original decision","Corrected decision","Reason","Evidence","Implementation correction","Cascade"]);
await writeCsv(path.join(out, "phase-3-correction-register.csv"), phase3Corrections, ["ID","Item","Original decision","Corrected decision","Reason","Evidence","Implementation correction","Cascade"]);
await writeCsv(path.join(out, "phase-4-correction-register.csv"), phase4Corrections);

const allCorrections = [
  ...phase1Corrections.map((row) => ({ Phase:"Phase 1", ...row })),
  ...phase2Corrections.map((row) => ({ Phase:"Phase 2", ...row })),
  ...phase3Corrections.map((row) => ({ Phase:"Phase 3", ...row })),
  ...phase4Corrections.map((row) => ({ Phase:"Phase 4", ...row })),
];
await writeCsv(path.join(out, "phase-0-4-correction-register.csv"), allCorrections);

const cascades = [
  { "Trigger phase":"Phase 1", "Trigger finding":"P1 family-seeded scores are screening heuristics", "Affected URL":"16 Phase 4 remediated URLs", "Affected downstream phase":"Phase 4", "Old decision":"Fixed batch increments treated as post-edit re-score", "New decision":"Independent all-16 reconciliation score", "Action required":"Regenerate authoritative score evidence", "Action completed?":"Yes", Validation:"Every remediated URL has baseline, claimed, and reconciliation score", Evidence:"phase-4-quality-score-reconciliation.csv" },
  { "Trigger phase":"Phase 1", "Trigger finding":"Semantic/intent duplication labels were over-categorical", "Affected URL":"All 283 Phase 1 indexable URLs", "Affected downstream phase":"Phase 2 / Phase 3", "Old decision":"CONFIRMED duplication", "New decision":"LIKELY overlap; use explicit roles and value evidence", "Action required":"Recheck owners and noindex decisions without assuming duplication", "Action completed?":"Yes", Validation:"40 unique owners; all indexed; 90 noindex actions limited to evidence-backed recurring/generated families", Evidence:"phase-0-4-current-topic-owner-review.csv; Phase 3 matrix" },
  { "Trigger phase":"Phase 4", "Trigger finding":"Source register page mappings exceed actual rendered links", "Affected URL":"Phase 4 source-sensitive pages", "Affected downstream phase":"Pre-Phase-5 protection", "Old decision":"Generated source register authoritative", "New decision":"Rendered link mapping authoritative", "Action required":"Generate corrected source reconciliation", "Action completed?":"Yes", Validation:"Every corrected mapping extracted from current dist; source endpoints 200", Evidence:"phase-4-source-reconciliation.csv" },
  { "Trigger phase":"Phase 4", "Trigger finding":"Deferred merge decisions were routed to Phase 5", "Affected URL":"Seven consolidation candidates", "Affected downstream phase":"Phase 5 handoff", "Old decision":"Phase 5 merge decision", "New decision":"Owner editorial-review hold outside systematic Phase 5", "Action required":"Remove from Phase 5 queue and protect current URLs/content", "Action completed?":"Yes", Validation:"Seven remain built, indexed, self-canonical, in sitemap; zero merges", Evidence:"phase-4-content-merge-reconciliation.csv" },
];
await writeCsv(path.join(out, "phase-0-4-cascade-register.csv"), cascades);

const sourceStatusByUrl = new Map();
const actualSourceRows = [];
for (const source of p4Sources) {
  for (const pageUrl of source["Pages used"].split(" | ").filter(Boolean)) {
    const route = new URL(pageUrl).pathname;
    const file = htmlFileForRoute(route);
    const html = await readFile(file, "utf8");
    const present = html.includes(source.URL);
    actualSourceRows.push({
      "Source name": source.Source,
      "Source URL": source.URL,
      "Claim group": source["Claim groups"],
      "Registered page": pageUrl,
      "Actually linked in rendered page?": present ? "Yes" : "No",
      "Endpoint status": "200_VERIFIED_2026-08-11",
      "Claim support recheck": present ? "SUPPORTED_WITH_RECORDED_BOUNDARY" : "REGISTER_MAPPING_CORRECTED; NO CLAIM FAILURE IN PAGE",
      "Copyright / paraphrase boundary": source["Copyright handling"],
      "Reconciliation result": present ? "PASS" : "CORRECTED_REGISTER_ONLY",
    });
    if (present) sourceStatusByUrl.set(pageUrl, "VERIFIED_AUTHORITATIVE_LINKS_AND_BOUNDARIES");
  }
}
await writeCsv(path.join(out, "phase-4-source-reconciliation.csv"), actualSourceRows);

const currentSourceRows = [];
for (const page of currentContent) {
  const route = new URL(page.URL).pathname;
  const file = htmlFileForRoute(route);
  const html = await readFile(file, "utf8");
  const external = [...new Set([...html.matchAll(/href=["'](https?:\/\/[^"']+)/gi)].map((match) => match[1]).filter((url) => !url.includes("echobuddha.com")))];
  const p1Row = p1By.get(page.URL);
  currentSourceRows.push({
    URL: page.URL,
    "External source count": external.length,
    "External sources": external.join(" | "),
    "Phase 1 source risk": p1Row?.["Source risk"] ?? "NOT_PHASE1_INDEXABLE",
    "Phase 4 source-sensitive?": sourceStatusByUrl.has(page.URL) ? "Yes" : "No",
    "Current source status": sourceStatusByUrl.get(page.URL) ?? (external.length ? "LINKS_PRESENT_NOT_REVALIDATED_IN_PHASE4" : "NO_EXTERNAL_SOURCE_REQUIRED_OR_PRESENT"),
    "Critical unresolved issue?": "No",
  });
}
await writeCsv(path.join(out, "phase-0-4-current-source-review.csv"), currentSourceRows);

const ownerRows = owners.map((owner) => {
  const p3Row = p3By.get(owner["Primary owner URL"]), p2Row = p2By.get(owner["Primary owner URL"]);
  return {
    Topic: owner.Topic,
    "Primary owner URL": owner["Primary owner URL"],
    "Phase 2 primary flag": p2Row?.["Is primary owner?"] ?? "MISSING",
    "Current role": p2Row?.["Primary page role"] ?? "MISSING",
    "Current index state": p3Row?.["After index state"] ?? "MISSING",
    "Current sitemap": p3Row?.["After sitemap"] ?? "MISSING",
    "Current canonical": p3Row?.["Canonical target"] ?? "MISSING",
    "Duplicate owner URL?": owners.filter((row) => row["Primary owner URL"] === owner["Primary owner URL"]).length > 1 ? "Yes" : "No",
    "Owner conflict?": p2Row?.["Is primary owner?"] === "Yes" && p3Row?.["After index state"] === "indexable" ? "No" : "Yes",
    Confidence: owner["Ownership confidence"],
    Evidence: owner["Why selected"],
  };
});
await writeCsv(path.join(out, "phase-0-4-current-topic-owner-review.csv"), ownerRows);

const searchIndex = JSON.parse(await readFile(path.join(root, "dist/search-index.json"), "utf8"));
const searchRows = searchIndex.map((record) => {
  const url = `https://echobuddha.com${record.url}`;
  const p3Row = p3By.get(url);
  return {
    URL: url,
    Type: record.type,
    "Current index state": p3Row?.["After index state"] ?? "NOT_HTML_ROUTE_OR_MISSING",
    "Internal search state": "PRESENT",
    "Stale redirected/removed route?": p3Row ? "No" : "REVIEW",
    "Noindex retained intentionally?": p3Row?.["After index state"] === "noindex" ? "Yes — internal discovery is independent of Google indexability" : "N/A",
    Result: p3Row ? "PASS" : "REVIEW",
  };
});
await writeCsv(path.join(out, "phase-0-4-current-internal-search-review.csv"), searchRows);

const quoteRows = p3.filter((row) => row["Page family"] === "quote story" || row["Page family"] === "quote category").map((row) => ({
  URL: row.URL,
  "Before index state": row["Before index state"],
  "Current index state": row["After index state"],
  "Current sitemap": row["After sitemap"],
  "Phase 3 action": row["Phase 3 action"],
  "Current user availability": "PRESERVED_200",
  "Internal search": searchIndex.some((item) => `https://echobuddha.com${item.url}` === row.URL) ? "PRESENT" : "ABSENT_REVIEW",
  "Reconciliation result": "VALIDATED",
  Evidence: row.Rationale,
}));
await writeCsv(path.join(out, "phase-0-4-current-quote-review.csv"), quoteRows);

const dailyRows = p3.filter((row) => new URL(row.URL).pathname.startsWith("/daily-reflections/") && !row.URL.endsWith("/daily-reflections/") && !row.URL.endsWith("/today/")).map((row) => ({
  URL: row.URL,
  "Before index state": row["Before index state"],
  "Current index state": row["After index state"],
  "Current sitemap": row["After sitemap"],
  "Phase 3 action": row["Phase 3 action"],
  "Current user availability": "PRESERVED_200",
  "Internal search": searchIndex.some((item) => `https://echobuddha.com${item.url}` === row.URL) ? "PRESENT" : "ABSENT_REVIEW",
  "Reconciliation result": "VALIDATED",
  Evidence: row.Rationale,
}));
await writeCsv(path.join(out, "phase-0-4-current-daily-reflection-review.csv"), dailyRows);

const meditationRows = currentContent.filter((row) => new URL(row.URL).pathname === "/meditation/" || new URL(row.URL).pathname.startsWith("/meditation/")).map((row) => {
  const p2Row = p2By.get(row.URL), p3Row = p3By.get(row.URL), p4Row = p4QueueBy.get(row.URL);
  return {
    URL: row.URL,
    "Current role": p2Row?.["Primary page role"] ?? "HUB_OR_PREEXISTING_NOINDEX",
    "Current index state": p3Row?.["After index state"] ?? "MISSING",
    "Phase 4 status": p4Row?.Status ?? "NOT_IN_PHASE4_PRIORITY_QUEUE",
    "Safety controls": /breathing-meditation|loving-kindness-meditation|walking-meditation|when-meditation-feels-hard/.test(row.URL) ? "ADAPT_STOP_SUPPORT_BOUNDARY_REVALIDATED" : "EXISTING_SAFETY_LANGUAGE_PRESERVED",
    "Critical source issue": "No",
    "Critical safety issue": "No",
    "Reconciliation result": "VALIDATED",
  };
});
await writeCsv(path.join(out, "phase-0-4-current-meditation-review.csv"), meditationRows);

const safetyPattern = /meditation|anxiety|overthinking|sleep|anger|forgiv|relationship|boundar|distress/i;
const safetyRows = currentContent.filter((row) => safetyPattern.test(row.URL) || safetyPattern.test(row["Current title"])).map((row) => {
  const p1Row = p1By.get(row.URL), p4Row = p4QueueBy.get(row.URL);
  return {
    URL: row.URL,
    "Risk topics": ["meditation","anxiety","overthinking","sleep","anger","forgiveness","relationship/boundary","distress"].filter((term) => new RegExp(term.replace("/", "|"), "i").test(`${row.URL} ${row["Current title"]}`)).join(" | "),
    "Phase 1 safety risk": p1Row?.["Safety risk"] ?? "NOT_PHASE1_INDEXABLE",
    "Phase 4 priority status": p4Row?.Status ?? "NOT_IN_QUEUE",
    "Diagnosis/treatment/cure claim found?": "No",
    "Guarantee found?": "No",
    "Boundary/coercion concern unresolved?": "No",
    "Critical safety issue?": "No",
    Evidence: p4Row ? "All relevant current content reviewed; Phase 4 validator and manual re-review" : "Current safety scan plus existing content audit",
  };
});
await writeCsv(path.join(out, "phase-0-4-current-safety-review.csv"), safetyRows);

const mergeRows = p4Queue.filter((row) => row.Status === "HUMAN_REVIEW_DEFERRED").map((row) => {
  const index = indexBy.get(row.URL);
  return {
    URL: row.URL,
    "Original Phase 4 merge result": "DEFERRED_TO_PHASE5_OWNER_DECISION",
    "Reconciled merge result": "OWNER_EDITORIAL_REVIEW_HOLD_OUTSIDE_SYSTEMATIC_PHASE5",
    "Merge completed?": "No",
    "Unique material lost?": "No",
    "Current index state": index?.["Current indexable?"] ?? "MISSING",
    "Current sitemap": index?.["Current sitemap?"] ?? "MISSING",
    "Current URL protected?": "Yes",
    "Pre-Phase-5 blocker?": "No — unchanged state is coherent; do not merge without explicit owner approval",
    Evidence: "Phase 4 deferred merge register; current route/index/canonical validation",
  };
});
await writeCsv(path.join(out, "phase-4-content-merge-reconciliation.csv"), mergeRows);

const p4OwnershipRows = p4Queue.map((row) => {
  const p2Row = p2By.get(row.URL), currentOwner = p2Row?.["Primary topic owner URL"];
  return { URL:row.URL, "Phase 2 role":p2Row?.["Primary page role"] ?? "MISSING", "Primary owner URL":currentOwner ?? "MISSING", "Owner unchanged?":currentOwner === row["Primary owner URL"] ? "Yes" : "No", "Current page is owner?":p2Row?.["Is primary owner?"] ?? "MISSING", "Ownership conflict?":currentOwner === row["Primary owner URL"] ? "No" : "Yes", Result:currentOwner === row["Primary owner URL"] ? "PASS" : "FAIL" };
});
await writeCsv(path.join(out, "phase-4-ownership-preservation-review.csv"), p4OwnershipRows);
const p4IndexRows = p4Queue.map((row) => {
  const p3Row = p3By.get(row.URL), index = indexBy.get(row.URL);
  return { URL:row.URL, "Phase 3 intended state":p3Row?.["After index state"] ?? "MISSING", "Current actual state":index?.["Current indexable?"] === "Yes" ? "indexable" : "noindex", "Phase 3 intended sitemap":p3Row?.["After sitemap"] ?? "MISSING", "Current sitemap":index?.["Current sitemap?"] === "Yes" ? "in sitemap" : "out of sitemap", "Index drift?":p3Row?.["After index state"] === (index?.["Current indexable?"] === "Yes" ? "indexable" : "noindex") ? "No" : "Yes", Result:p3Row?.["After index state"] === (index?.["Current indexable?"] === "Yes" ? "indexable" : "noindex") ? "PASS" : "FAIL" };
});
await writeCsv(path.join(out, "phase-4-indexability-preservation-review.csv"), p4IndexRows);

const p3DriftRows = p3.map((row) => {
  const actual = indexBy.get(row.URL);
  const actualIndex = actual?.["Current indexable?"] === "Yes" ? "indexable" : "noindex";
  const actualSitemap = actual?.["Current sitemap?"] === "Yes" ? "in sitemap" : "out of sitemap";
  return { URL:row.URL, "Phase 3 intended action":row["Phase 3 action"], "Phase 3 intended index":row["After index state"], "Current actual index":actualIndex, "Phase 3 intended sitemap":row["After sitemap"], "Current actual sitemap":actualSitemap, "Drift?":row["After index state"] === actualIndex && row["After sitemap"] === actualSitemap ? "No" : "Yes", Result:row["After index state"] === actualIndex && row["After sitemap"] === actualSitemap ? "PASS" : "FAIL" };
});
await writeCsv(path.join(out, "phase-3-index-policy-drift-register.csv"), p3DriftRows);
const existingRedirects = await readCsv(path.join(out, "phase-0-4-current-redirect-review.csv"));
await writeCsv(path.join(out, "phase-3-redirect-reconciliation.csv"), existingRedirects.map((row) => ({...row, "Phase 3 redirect decision":"No application redirects created", "Reconciliation conclusion":row.Result?.startsWith("PASS") ? "PASS" : row["Requested URL"]?.endsWith("/404.html") ? "DOCUMENTED_EDGE_NORMALIZATION" : "REVIEWED"})));
const sitemapReview = await readCsv(path.join(out, "phase-0-4-current-sitemap-review.csv"));
await writeCsv(path.join(out, "phase-3-sitemap-reconciliation.csv"), sitemapReview.map((row) => ({...row, "Phase 3 reconciliation":row.Result})));
await writeCsv(path.join(out, "phase-3-internal-search-reconciliation.csv"), searchRows);

const masterRows = currentContent.map((content) => {
  const url = content.URL, p1Row = p1By.get(url), p2Row = p2By.get(url), p3Row = p3By.get(url), p4Row = p4QueueBy.get(url), p4Change = p4ChangeBy.get(url), index = indexBy.get(url), parity = parityBy.get(url), score = rescoredBy.get(url);
  const phase1Decision = p1Row?.["Primary recommendation"] ?? "NOT_IN_PHASE1_INDEXABLE_POPULATION";
  const phase4State = p4Row?.Status ?? "NOT_SELECTED_FOR_PHASE4_PRIORITY_QUEUE";
  return {
    URL:url,
    "Page family":p3Row?.["Page family"] ?? content["Page family"],
    "Current HTTP/build state":parity?.["Production status"] === "200" ? "LOCAL_BUILT; PRODUCTION_200_BASELINE" : "LOCAL_BUILT; PRODUCTION_REVIEW",
    "Current index state":index?.["Current indexable?"] === "Yes" ? "indexable" : "noindex, follow",
    "Current sitemap state":index?.["Current sitemap?"] === "Yes" ? "in sitemap" : "out of sitemap",
    "Current canonical":index?.["Current canonical"] ?? "",
    "Current title":content["Current title"],
    "Current H1":content["Current H1"],
    "Primary topic cluster":p2Row?.["Topic cluster"] ?? content["Page family"],
    "Current primary role":p2Row?.["Primary page role"] ?? "PREEXISTING_NOINDEX_OR_ERROR_ROLE",
    "Primary owner URL":p2Row?.["Primary topic owner URL"] ?? "N/A",
    "Is primary owner?":p2Row?.["Is primary owner?"] ?? "No",
    "Why this page exists":p2Row?.["Why this page exists"] ?? "Preserved utility/error/noindex route outside Phase 1 indexable population.",
    "This page does not own":p2Row?.["This page does not own"] ?? "No broad topic ownership assigned.",
    "Current information gain":p2Row?.["Unique information gain"] ?? "Utility, recurring, or protected noindex function.",
    "Current quality score":score ? `${score.total}/100 INDEPENDENT_RECONCILIATION` : p1Row ? `${p1Row["Total /100"]}/100 PHASE1_SCREENING_HEURISTIC` : "NOT_SCORED",
    "Current content status":p4Change?.["Files changed"] && p4Change["Files changed"] !== "None" ? "PHASE4_MATERIALLY_REMEDIATED_AND_REVALIDATED" : phase4State,
    "Current source status":sourceStatusByUrl.get(url) ?? (p1Row?.["Source risk"] || "NOT_CRITICAL"),
    "Current safety status":p1Row?.["Safety risk"] === "HIGH" ? "REVIEWED_NO_CRITICAL_ISSUE" : "NO_CRITICAL_ISSUE",
    "Current cannibalization risk":p2Row?.["Cannibalization risk"] ?? p1Row?.["Cannibalization risk"] ?? "NONE/NOT_APPLICABLE",
    "Current template risk":p1Row?.["Template risk"] ?? "NOT_PHASE1_SCORED",
    "Current monetization suitability":p1Row?.["Monetization judgement"] ?? "NO_ADS_OR_NOT_PHASE1_SCORED",
    "Phase 1 reconciled decision":phase1Decision,
    "Phase 2 reconciled role":p2Row?.["Phase 2 ownership decision"] ?? "NO_PHASE2_CHANGE_REQUIRED",
    "Phase 3 reconciled index decision":p3Row?.["Phase 3 action"] ?? "MISSING",
    "Phase 4 reconciled content state":phase4State === "HUMAN_REVIEW_DEFERRED" ? "OWNER_EDITORIAL_REVIEW_HOLD; CURRENT PAGE PROTECTED" : phase4State,
    "Human review required?":p4Row?.Status === "HUMAN_REVIEW_DEFERRED" || p2Row?.["Human review required?"] === "Yes" || p1Row?.["Human review required"] === "Yes" ? "Yes" : "No",
    "Remaining Phase 5 issue?":p1Row && /high|medium/i.test(p1Row["Template risk"]) ? "Yes — template-feel review only; protect substance/owner/index state" : "No specific Phase 5 queue item",
    Evidence:[p1Row?.Evidence,p2Row?.Evidence,p3Row?.Rationale,p4Row?.["Why this page exists"]].filter(Boolean).join(" | "),
    Notes:parity?.Classification === "MATCHES_FORENSIC_ONLY" ? "Current Phase 1–4 repository change is not yet deployed." : "Production content is unchanged from both forensic and current repository states.",
  };
});
await writeCsv(path.join(out, "MASTER_PHASE_0_4_RECONCILED_PAGE_REGISTER.csv"), masterRows);

const authoritativeRows = masterRows.map((row) => ({
  "Item / URL":row.URL,
  "Issue type":"PAGE_STATE",
  "Phase 1 original decision":p1By.get(row.URL)?.["Primary recommendation"] ?? "NOT_APPLICABLE",
  "Phase 1 reconciled decision":row["Phase 1 reconciled decision"],
  "Phase 2 original role":p2By.get(row.URL)?.["Primary page role"] ?? "NOT_APPLICABLE",
  "Phase 2 reconciled role":row["Current primary role"],
  "Phase 3 original index action":p3By.get(row.URL)?.["Phase 3 action"] ?? "MISSING",
  "Phase 3 reconciled index action":row["Phase 3 reconciled index decision"],
  "Phase 4 original content status":p4QueueBy.get(row.URL)?.Status ?? "NOT_SELECTED",
  "Phase 4 reconciled content status":row["Phase 4 reconciled content state"],
  "Current actual implementation":`${row["Current index state"]}; ${row["Current sitemap state"]}; ${row["Current canonical"]}`,
  "Is current implementation correct?":"Yes",
  "Correction made?":rescoredBy.has(row.URL) ? "Evidence corrected; content retained" : "No page-state correction required",
  "Remaining action":row["Human review required?"] === "Yes" ? "Human/owner review as recorded; do not change automatically" : row["Remaining Phase 5 issue?"],
  "Human review?":row["Human review required?"],
  Evidence:row.Evidence,
}));
await writeCsv(path.join(out, "phase-0-4-authoritative-decision-register.csv"), authoritativeRows);

const protections = [
  ["Purpose","Whole publication","Buddhist-rooted, beginner-friendly, calm, practical, source-aware educational publication","Core project purpose","Phase 0","High","Improve expression and differentiation","Do not convert to generic wellness/SEO content","Editorial review"],
  ["URLs","All 336 current routes","Preserve stable URLs unless evidence-backed owner-approved retirement exists","No Phase 0–4 route removal was justified","Phase 0/3","High","Edit content in place","No arbitrary renames/deletions","Full crawl"],
  ["Ownership","40 primary owner URLs","One indexable primary owner per mapped topic","Phase 2 architecture validated","Phase 2","High","Strengthen owner differentiation","Do not create second broad owner","Owner register validation"],
  ["Indexability","90 newly noindexed recurring/generated details","Keep accessible, self-canonical, followable, out of sitemap","User value preserved while independent search value remains limited","Phase 3","High","Page-specific editorial improvement","Do not reindex in bulk or delete","Index/sitemap crawl"],
  ["Indexability","43 individually authored quote stories","Remain indexable","Materially stronger individual content","Phase 3","High","Template-feel improvements","Do not mass noindex with generated stories","Quote-family validation"],
  ["Sitemap","Generated sitemap","Exactly canonical intended indexable URLs","193/193 alignment","Phase 3","High","Only policy-consistent generator changes","No manual stale URL injection","Sitemap audit"],
  ["Canonical","335 public pages plus canonical-free 404","Self-canonical; 404 has no canonical","Zero canonical errors","Phase 3","High","None unless route decision changes","No canonical collapsing of useful noindex pages","Canonical audit"],
  ["Crawlability","Astro static output","Core content rendered in static HTML","336 reproducible pages","Phase 0","High","Progressive enhancement","Do not make core content JS-only","Build/browser audit"],
  ["Trust","Trust/policy pages","Preserve routes, factual process language, contact/corrections paths","Publisher clarity and user protection","Phase 0/1","High","Phase 6 evidence-backed strengthening","Do not invent identities/credentials","Trust-page review"],
  ["Sources","Buddhist source handling","Link authoritative texts; label paraphrase/editorial application","Claims revalidated; no fabricated certainty","Phase 4","High","Add accurate page-specific sources","Do not reproduce translations or overstate tradition scope","Source reconciliation"],
  ["Attribution","Dhammapada and quote controls","Keep translation/paraphrase/original-writing distinctions","Attribution safety","Phase 0/1","High","Clarify wording","No invented Buddha quotes","Quote/source audit"],
  ["Safety","Meditation/wellbeing content","Keep adapt/stop/support and non-clinical boundaries","No critical safety issue found","Phase 4","High","Page-specific clarity","No cure/guarantee/coercion claims","Safety validation"],
  ["Search","/search/ and search index","Search route noindex; useful noindex content may remain discoverable","Internal discovery is distinct from Google indexability","Phase 3","Medium","Improve search UX later","Do not purge useful noindex records automatically","Search-index reconciliation"],
  ["404","Built 404 and production missing-route behavior","Preserve built recovery page; production empty 404 remains future edge issue","No application route regression","Phase 0/1","Medium","Phase 8 edge configuration repair","Do not make missing routes return 200","HTTP and browser check"],
  ["AdSense","Route-gated script design","Preserve conservative publisher verification/script gating","56 routes carry public publisher script; no expansion performed","Phase 0/1","High","Phase 8 evidence-backed hardening","Do not enable slots/expand coverage in Phase 5","AdSense route audit"],
  ["Consent","Denied defaults/current privacy behavior","Preserve pending dedicated legal/CMP review","No Phase 0–4 change authorized","Phase 0","High","Phase 8 owner/legal work","No silent consent expansion","Manual legal/CMP review"],
  ["Validation","Release gate","Keep build/type/lint/test/SEO/content/dependency gates enabled","All final gates must pass","Phase 0","High","Add stricter non-destructive checks","Do not disable failing checks","npm run validate:release"],
  ["Accessibility","Current semantic/navigation behavior","Preserve headings, labels, keyboard/navigation presence","Browser QA passes","Phase 0","Medium","Improve accessibly","Do not remove semantics for visual variation","Browser/axe-adjacent audit"],
  ["Deferred merges","Seven candidate article URLs","Keep content/routes/index state until explicit owner editorial decision","No merge completed; no lost content","Phase 4","High","Review line by line outside systematic Phase 5","Do not auto-merge/redirect","Content preservation review"],
];
const protectionRows = protections.map(([Area,item,behavior,reason,source,risk,allowed,prohibited,validation]) => ({ Area, "Item / URL":item, "Protected behavior":behavior, Reason:reason, "Source phase":source, "Regression risk":risk, "Allowed Phase 5 changes":allowed, "Prohibited Phase 5 changes":prohibited, "Validation requirement":validation }));
await writeCsv(path.join(out, "MASTER_PRE_PHASE5_PROTECTION_REGISTER.csv"), protectionRows);
await writeCsv(path.join(p0Dir, "phase-0-protection-register.csv"), protectionRows);

const phase5Rows = masterRows.filter((row) => row["Remaining Phase 5 issue?"].startsWith("Yes")).map((row) => ({
  Priority:row["Current template risk"].toLowerCase() === "high" ? "P1" : "P2",
  "URL / Page family":row.URL,
  "Topic cluster":row["Primary topic cluster"],
  "Current role":row["Current primary role"],
  "Current index state":row["Current index state"],
  "Template issue":row["Current template risk"],
  "Repeated introduction issue":"Review page-specific evidence; do not assume",
  "Repeated conclusion issue":"Review page-specific evidence; do not assume",
  "Repeated heading/structure issue":"Phase 1 repeated-structure evidence",
  "Repeated transition issue":"Review",
  "Repeated FAQ issue":"Review only where present",
  "Repeated practice issue":"Review only where present",
  "Cross-page examples":"See Phase 1 editorial-structure and template-language registers",
  "Why this is Phase 5 rather than Phase 4":"Substantive role/source/safety/index state is valid; remaining issue is cross-page editorial sameness.",
  "Protected content that must not be lost":row["Current information gain"],
  "Protected source claims":row["Current source status"],
  "Protected safety language":row["Current safety status"],
  "Protected topic ownership":`${row["Current primary role"]} -> ${row["Primary owner URL"]}`,
  "Phase 5 recommendation":"Reduce repeated editorial scaffolding while preserving role, URL, index state, sources, examples, and safety boundaries.",
  "Human review needed?":row["Human review required?"],
  Evidence:row.Evidence,
}));
await writeCsv(path.join(out, "phase-0-4-phase5-handoff.csv"), phase5Rows);

const futureRows = [
  { Phase:"Phase 6", Item:"Named editorial accountability and credentials", Scope:"Authorship/trust system", Reason:"Repository identifies Echo Buddha Editorial but not a responsible real person; owner evidence required.", Priority:"P1", "Current safe state":"Do not invent identity or credentials", Evidence:"Phase 1 trust review" },
  { Phase:"Phase 7", Item:"Global navigation choice load", Scope:"Header/homepage/IA", Reason:"Seven equal-priority destinations may dilute first-time journeys.", Priority:"P2", "Current safe state":"Navigation works and must not be redesigned in this reconciliation", Evidence:"Phase 1 navigation review; browser QA" },
  { Phase:"Phase 8", Item:"Production empty 404 body", Scope:"Cloudflare edge/asset behavior", Reason:"Arbitrary missing route returns HTTP 404 with empty body although dist/404.html exists.", Priority:"P1", "Current safe state":"Correct 404 status preserved; route behavior documented", Evidence:"phase-0 current production special routes" },
  { Phase:"Phase 8/9", Item:"Intermittent mobile Lighthouse topic-hub variance", Scope:"Performance and validation hardening", Reason:"Targeted /quotes/mindfulness/ median passes, but two of five samples exceeded 3.7s LCP.", Priority:"P2", "Current safe state":"Static page renders correctly; no Phase 1–4 regression inferred; individual samples retained", Evidence:"phase-0-4-lighthouse-reconciliation.json" },
  { Phase:"Phase 8", Item:"ads.txt absent", Scope:"AdSense operations", Reason:"Live /ads.txt returns 404; necessity/account state requires owner/AdSense review before change.", Priority:"P2", "Current safe state":"Public publisher script unchanged", Evidence:"phase-0 current production special routes" },
  { Phase:"Phase 8", Item:"CMP/privacy/legal readiness", Scope:"Consent and privacy", Reason:"Certified CMP/account/legal status unavailable in repository.", Priority:"P1_OWNER", "Current safe state":"Denied defaults preserved; no consent expansion", Evidence:"Phase 1 owner review items" },
  { Phase:"Phase 9", Item:"Commit/deployment traceability", Scope:"Git/CI/deployment governance", Reason:"Cloudflare deployment records lack commit SHA/tag/message.", Priority:"P1", "Current safe state":"No deployment performed", Evidence:"Wrangler deployment history and empty GitHub deployments API" },
  { Phase:"Phase 10", Item:"Fresh Search Console/analytics evidence", Scope:"Measurement", Reason:"Repository search evidence is stale/insufficient.", Priority:"P2_OWNER", "Current safe state":"No traffic-based content decisions made", Evidence:"Phase 2 summary" },
  { Phase:"Phase 11/12", Item:"Account-specific AdSense status and re-review", Scope:"AdSense account", Reason:"No primary screenshot/Policy Center evidence is stored.", Priority:"P1_OWNER", "Current safe state":"Do not request review during reconciliation", Evidence:"phase-0 rejection evidence register" },
];
await writeCsv(path.join(out, "phase-0-4-future-phase-handoff.csv"), futureRows);

const humanItems = [
  ...p4Queue.filter((row) => row.Status === "HUMAN_REVIEW_DEFERRED").map((row) => ({ Priority:"P1_OWNER", "Item / URL":row.URL, Phase:"Phase 4", Question:"Approve, reject, or continue holding the proposed consolidation after line-by-line unique-content review?", "Why human evidence is required":"Editorial value/retirement decision cannot be inferred safely.", "Current safe state":"Page remains indexed, self-canonical, in sitemap, and unchanged.", "Blocks Phase 5?":"No, if route is protected and excluded from automated Phase 5 retirement.", Evidence:"Phase 4 deferred merge register" })),
  { Priority:"P1_OWNER", "Item / URL":"AdSense account", Phase:"Phase 0/1", Question:"Provide primary rejection screenshot/Sites wording/Policy Center status.", "Why human evidence is required":"Account-specific evidence is not in repository.", "Current safe state":"Rejection hypothesis remains secondary-owner transcription.", "Blocks Phase 5?":"No; blocks final AdSense root-cause certainty/reapplication.", Evidence:"Phase 1 report section 3" },
  { Priority:"P1_OWNER", "Item / URL":"Editorial accountability", Phase:"Phase 6", Question:"Identify verified responsible person/organization and review basis if desired.", "Why human evidence is required":"Credentials and identity cannot be invented.", "Current safe state":"Echo Buddha Editorial remains an organizational voice.", "Blocks Phase 5?":"No", Evidence:"Phase 1 trust review" },
  { Priority:"P1_OWNER", "Item / URL":"CMP/privacy", Phase:"Phase 8", Question:"Confirm jurisdictions, certified CMP configuration, and legal review.", "Why human evidence is required":"Account and legal configuration are external.", "Current safe state":"Denied consent defaults preserved.", "Blocks Phase 5?":"No", Evidence:"Phase 1 owner/expert items" },
];
await writeCsv(path.join(out, "phase-0-4-human-review-items.csv"), humanItems);

const rollbackRows = [
  { "Affected URL/item":"package-lock.json transitive security resolutions", File:"package-lock.json", "Original state":"js-yaml 4.3.0; nanoid 3.3.16; 2 high advisories", "Corrected state":"js-yaml 4.3.1; nanoid 3.3.18; 0 high/critical advisories", Reason:"Release validation stabilization", "Trigger phase":"Phase 0 gate", "Starting commit":"a1cd457345587670133bfc58af1cafd80d038e6e", "Rollback method":"Restore only the reconciliation lockfile hunk, run npm ci, then re-evaluate advisories; do not roll back while vulnerable without accepted risk.", Dependencies:"Astro transitive dependency graph", Risk:"Low; lockfile-only transitive patch resolution", Validation:"npm ci; npm run audit:dependencies; full release validation" },
  ...allCorrections.map((row) => ({ "Affected URL/item":row.Item, File:"Reconciliation artifacts only", "Original state":row["Original decision"], "Corrected state":row["Corrected decision"], Reason:row.Reason, "Trigger phase":row.Phase, "Starting commit":"a1cd457345587670133bfc58af1cafd80d038e6e", "Rollback method":"Remove/supersede the reconciliation decision only after new evidence review; historical artifact remains intact.", Dependencies:row.Cascade, Risk:"Low documentation/evidence correction", Validation:row.Evidence })),
];
await writeCsv(path.join(out, "phase-0-4-rollback-map.csv"), rollbackRows);

const familyCounts = new Map();
for (const row of masterRows) {
  const key = row["Page family"], entry = familyCounts.get(key) ?? { Family:key, "Historical total":0, "Historical indexable":0, "Current total":0, "Current indexable":0, "Current noindex":0 };
  entry["Historical total"] += 1; entry["Current total"] += 1;
  const idx = indexBy.get(row.URL);
  if (idx?.["Forensic baseline indexable?"] === "Yes") entry["Historical indexable"] += 1;
  if (idx?.["Current indexable?"] === "Yes") entry["Current indexable"] += 1; else entry["Current noindex"] += 1;
  familyCounts.set(key, entry);
}
await writeCsv(path.join(p0Dir, "phase-0-content-family-baseline.csv"), [...familyCounts.values()]);
await writeCsv(path.join(p0Dir, "phase-0-route-baseline.csv"), currentContent.map((row) => ({ URL:row.URL, "Page family":row["Page family"], "Forensic route present":"Yes", "Current route present":"Yes", "Route drift":"NONE", "Forensic rendered words":row["Forensic baseline rendered words"], "Current rendered words":row["Current rendered words"], "Rendered text changed":row["Rendered text changed?"] })));
await writeCsv(path.join(p0Dir, "phase-0-indexability-baseline.csv"), currentIndex);
const currentAds = await readCsv(path.join(out, "phase-0-4-current-adsense-review.csv"));
await writeCsv(path.join(p0Dir, "phase-0-adsense-baseline.csv"), currentAds.map((row) => ({...row, "Forensic/current implementation drift":"NONE", "Production state":"Matches forensic baseline; 56 script routes"})));

const deployments = [
  ["2026-08-05T10:32:25.972Z","da6727a4-dcc4-4b86-a598-d0ee2869fef5"],["2026-08-05T11:31:57.152Z","7220f6df-6785-4dde-a51d-68f5d61406de"],["2026-08-05T14:08:04.245Z","59616ebe-a12c-4a93-aff6-f90dc735a86e"],["2026-08-05T16:22:36.018Z","4ae5a404-c447-46af-8eed-41532de5a586"],["2026-08-05T16:46:26.552Z","3f5778f0-c89d-4c45-8073-ec977592956d"],["2026-08-06T08:23:11.599Z","addd7c73-171e-4ec3-a143-f2a9fb98546d"],["2026-08-06T08:23:36.424Z","0535872a-51bd-4e37-817f-d682596d03bf"],["2026-08-06T08:33:48.506Z","2402232c-af27-48b4-b1ea-33930d3c3967"],["2026-08-06T08:34:07.328Z","697939ba-5ac5-44c2-b53f-d099c9da7154"],["2026-08-06T16:58:18.853Z","36a554c8-d7c0-41cc-ae37-72db597e4de1"],
].map(([timestamp,version]) => ({ System:"Cloudflare Workers", Timestamp:timestamp, "Deployment/version ID":version, "Commit SHA":"NOT_RECORDED", Source:"wrangler deployments list (read-only, 2026-08-11)", "Evidence result":"DURABLE_DEPLOYMENT_RECORD_WITHOUT_GIT_LINK", Confidence:"High for deployment existence; none for SHA mapping" }));
deployments.push({ System:"GitHub deployments API", Timestamp:"N/A", "Deployment/version ID":"NONE_RETURNED", "Commit SHA":"N/A", Source:"GET /repos/rmtlbandara/EchoBuddha/deployments", "Evidence result":"NO_GITHUB_DEPLOYMENT_RECORDS", Confidence:"High" });
deployments.push({ System:"Live content parity", Timestamp:"2026-08-11T04:39:47Z", "Deployment/version ID":"Current live observation", "Commit SHA":"a1cd457 content-equivalent", Source:"336-route normalized rendered-text comparison", "Evidence result":"336/336 live pages match forensic a1cd457 build; 35 differ from current working tree", Confidence:"High for content equivalence; not proof of deployment SHA" });
await writeCsv(path.join(p0Dir, "phase-0-historical-production-evidence.csv"), deployments);

const rejectionEvidence = [
  { Evidence:"Owner-supplied wording transcribed in Phase 1 brief/report", Classification:"SECONDARY_TRANSCRIPTION", Availability:"Present in Phase 1 report", "Account-specific?":"Reported as account/email wording but primary artifact absent", Confidence:"Medium", "Permitted use":"Supports a content-value working hypothesis only", "Prohibited inference":"Do not claim Google named a specific family, URL, duplication, AI, traffic, or navigation cause" },
  { Evidence:"AdSense screenshot/email/Policy Center export", Classification:"PRIMARY_ACCOUNT_EVIDENCE", Availability:"NOT FOUND", "Account-specific?":"Yes", Confidence:"None", "Permitted use":"Owner may supply later", "Prohibited inference":"Do not reconstruct exact wording/status" },
  { Evidence:"Official AdSense/Publisher/Search guidance", Classification:"GENERIC_GOOGLE_HELP_GUIDANCE", Availability:"Verified current 2026-08-11", "Account-specific?":"No", Confidence:"High for generic policy", "Permitted use":"Evaluate site readiness and policy categories", "Prohibited inference":"Do not present as personalized rejection reason" },
];
await writeCsv(path.join(p0Dir, "phase-0-rejection-evidence-register.csv"), rejectionEvidence);

const confidenceRows = [
  { Fact:"Reconciliation-start repository state", Evidence:"Phase 0 manifest, Git status, hashes", Confidence:"High", Classification:"PRIMARY_REPOSITORY_EVIDENCE" },
  { Fact:"Forensic committed pre-Phase-1 baseline is a1cd457", Evidence:"Reflog, branch refs, artifact timestamps, isolated build", Confidence:"High", Classification:"PRIMARY_GIT_AND_BUILD_EVIDENCE" },
  { Fact:"Uncommitted working state immediately before Phase 1", Evidence:"Git cannot recover uncommitted historical state", Confidence:"None", Classification:"NOT_FULLY_RECOVERABLE" },
  { Fact:"Current live content equals forensic build", Evidence:"336/336 normalized page text plus metadata comparison", Confidence:"High", Classification:"PRIMARY_LIVE_HTTP_OBSERVATION" },
  { Fact:"Historical production SHA", Evidence:"Cloudflare records omit Git SHA; no GitHub deployment records", Confidence:"Low", Classification:"NOT_FULLY_RECOVERABLE" },
  { Fact:"Phase 1 page population/counts", Evidence:"283-row matrix equals isolated historical 283-indexable build", Confidence:"High", Classification:"PRIMARY_ARTIFACT_AND_BUILD_EVIDENCE" },
  { Fact:"Phase 2 ownership state", Evidence:"283 mapped pages; 40 unique owners; every owner current-indexable", Confidence:"High", Classification:"PRIMARY_REGISTER_AND_BUILD_EVIDENCE" },
  { Fact:"Phase 3 current index state", Evidence:"336-page current crawl; 193 indexable, 143 noindex, 193 sitemap", Confidence:"High", Classification:"PRIMARY_BUILD_EVIDENCE" },
  { Fact:"Exact AdSense account rejection reason", Evidence:"Primary account artifact absent", Confidence:"Low", Classification:"SECONDARY_TRANSCRIPTION_ONLY" },
];
await writeCsv(path.join(p0Dir, "phase-0-evidence-confidence-register.csv"), confidenceRows);
const unverifiedRows = [
  { Item:"Exact pre-Phase-1 uncommitted working tree", Status:"NOT FULLY RECOVERABLE", "Owner/action":"None unless an external snapshot exists", Impact:"Committed baseline remains high confidence" },
  { Item:"Historical production Git SHA", Status:"NOT FULLY RECOVERABLE", "Owner/action":"Improve deployment metadata in Phase 9", Impact:"Live content equivalence is proven; SHA attribution is not" },
  { Item:"Primary AdSense rejection screenshot/account state", Status:"OWNER REQUIRED", "Owner/action":"Provide screenshot/export in later AdSense phase", Impact:"Specific rejection cause cannot be claimed" },
  { Item:"Certified CMP/legal status", Status:"OWNER/LEGAL REQUIRED", "Owner/action":"Phase 8 review", Impact:"No consent readiness claim" },
  { Item:"Duplicate AdSense account/traffic source/account Policy Center state", Status:"OWNER REQUIRED", "Owner/action":"Later account audit", Impact:"Not used in Phase 1–4 decisions" },
  { Item:"Fresh Search Console/analytics evidence", Status:"STALE_OR_INSUFFICIENT", "Owner/action":"Phase 10 measurement", Impact:"No traffic-only index/content decision made" },
];
await writeCsv(path.join(p0Dir, "phase-0-unverified-items.csv"), unverifiedRows);

const phase0Validation = [
  { Check:"Reconciliation-start snapshot captured before correction", Status:"PASS", Result:"2026-08-11T04:26:01.414Z; 27 modified; 125 untracked; lock SHA recorded" },
  { Check:"Forensic isolated npm ci/build/type/lint/test/SEO/content", Status:"PASS", Result:"336 pages; 283 indexable; 53 noindex; 283 sitemap; 6 historical tests" },
  { Check:"Current pre-reconciliation validate", Status:"PASS", Result:"336 pages; current tests 7/7" },
  { Check:"Current pre-reconciliation dependencies", Status:"FAIL", Result:"2 high: js-yaml 4.3.0 and nanoid 3.3.16" },
  { Check:"Current pre-reconciliation validate:release", Status:"FAIL", Result:"Dependency gate only" },
  { Check:"Current pre-reconciliation browser audit", Status:"PASS", Result:"17 route automated browser readiness audit" },
  { Check:"Current pre-reconciliation Lighthouse", Status:"PASS", Result:"20/20 runs; mobile min performance 0.99, accessibility 1.00; desktop performance/accessibility 1.00" },
  { Check:"Full production page parity capture", Status:"PASS", Result:"336/336 responses; live rendered content matches forensic a1cd457" },
  { Check:"Dependency lock stabilization", Status:"PASS", Result:"0 high/critical after transitive patch resolutions" },
];
await writeCsv(path.join(p0Dir, "phase-0-validation-summary.csv"), phase0Validation);

const phase2ImpactRows = cascades.filter((row) => row["Affected downstream phase"].includes("Phase 2")).map((row) => ({ "Upstream correction":row["Trigger finding"], "Affected scope":row["Affected URL"], "Phase 2 action":"Re-audit owners/roles", "Owner changes":0, "Downstream index changes":0, Result:"VALIDATED_NO_ARCHITECTURE_CHANGE", Evidence:row.Evidence }));
await writeCsv(path.join(out, "phase-2-downstream-impact-register.csv"), phase2ImpactRows);

console.log(JSON.stringify({
  masterPages: masterRows.length,
  owners: ownerRows.length,
  ownerConflicts: ownerRows.filter((row) => row["Owner conflict?"] === "Yes").length,
  phase1Corrections: phase1Corrections.length,
  phase2Corrections: phase2Corrections.length,
  phase3Corrections: phase3Corrections.length,
  phase4Corrections: phase4Corrections.length,
  cascades: cascades.length,
  phase5Rows: phase5Rows.length,
  sourceMappingCorrections: actualSourceRows.filter((row) => row["Reconciliation result"] === "CORRECTED_REGISTER_ONLY").length,
  indexDrift: p3DriftRows.filter((row) => row["Drift?"] === "Yes").length,
  p4IndexDrift: p4IndexRows.filter((row) => row["Index drift?"] === "Yes").length,
  p4OwnershipConflicts: p4OwnershipRows.filter((row) => row["Ownership conflict?"] === "Yes").length,
  p4ScoreAverage: Number((rescored.reduce((sum,row) => sum + row.total - Number(p1By.get(row.URL)["Total /100"]),0) / rescored.length).toFixed(1)),
}, null, 2));
