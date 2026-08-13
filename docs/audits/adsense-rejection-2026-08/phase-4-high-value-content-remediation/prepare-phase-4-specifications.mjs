import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE = path.join(ROOT, "docs/audits/adsense-rejection-2026-08");
const P1 = path.join(BASE, "phase-1-root-cause");
const P2 = path.join(BASE, "phase-2-search-intent-ownership");
const P3 = path.join(BASE, "phase-3-index-quality-remediation");
const OUT = path.join(BASE, "phase-4-high-value-content-remediation");
const SITE = "https://echobuddha.com";
fs.mkdirSync(OUT, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  return rows;
}

function readCsv(file) {
  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  const headers = rows[0];
  return rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filename, headers, rows) {
  const text = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n") + "\n";
  fs.writeFileSync(path.join(OUT, filename), text);
}

const phase1 = readCsv(path.join(P1, "page-decision-register.csv"));
const phase2 = readCsv(path.join(P2, "master-page-role-register.csv"));
const phase3 = readCsv(path.join(P3, "phase-3-page-action-register.csv"));
const inventory = readCsv(path.join(P3, "phase-3-route-inventory.csv"));
const p1ByUrl = new Map(phase1.map((row) => [row.URL, row]));
const p2ByUrl = new Map(phase2.map((row) => [row.URL, row]));
const p3ByUrl = new Map(phase3.map((row) => [row.URL, row]));
const inventoryByUrl = new Map(inventory.map((row) => [row.URL, row]));

const queue = [
  ["A", 1, "/learn/buddhism-for-beginners/", "MATERIAL_REMEDIATION", "Strengthen the main beginner study map with doctrine/practice boundaries, a decision path, and clearer tradition/source limits.", "src/pages/learn/buddhism-for-beginners.astro"],
  ["A", 1, "/learn/four-noble-truths/", "MATERIAL_REMEDIATION", "Turn the thin card hub into the clear primary owner: define each truth, distinguish pain from added reactivity, explain the four tasks, and add a worked case.", "src/pages/learn/four-noble-truths.astro"],
  ["A", 1, "/learn/eightfold-path/", "MATERIAL_REMEDIATION", "Strengthen the primary path owner with threefold training, mutually supporting factors, a worked scenario, and careful meaning of right.", "src/pages/learn/eightfold-path.astro"],
  ["A", 2, "/learn/buddhism-101/what-is-buddhism/", "MATERIAL_REMEDIATION", "Clarify Buddhism as a diverse living tradition and practice path without flattening schools or presenting generic wellness.", "src/data/learn.ts"],
  ["A", 2, "/learn/buddhism-101/what-is-karma-in-buddhism/", "MATERIAL_REMEDIATION", "Ground karma in intentional action, distinguish it from fate/blame, and clarify what cannot be inferred about another person's suffering.", "src/data/learn.ts"],
  ["A", 2, "/learn/buddhism-101/what-is-impermanence/", "MATERIAL_REMEDIATION", "Explain anicca as insight into conditioned experience rather than a slogan that all loss is easy to accept.", "src/data/learn.ts"],
  ["A", 3, "/learn/buddhism-101/five-precepts-buddhism/", "NO_CHANGE_REVIEW", "Protect an already substantial ethics page; verify its voluntary-training, consent, intoxicant, repair, and non-shame framing.", "src/data/learn.ts"],
  ["A", 3, "/articles/three-poisons-buddhism-explained/", "NO_CHANGE_REVIEW", "Protect a distinct broad explainer if its roots, examples, and next steps already satisfy the role.", "src/data/site.ts"],
  ["A", 3, "/articles/what-is-sangha-buddhist-community/", "NO_CHANGE_REVIEW", "Protect the broad community owner if it already distinguishes monastic and wider community usage carefully.", "src/data/site.ts"],
  ["B", 2, "/learn/buddhist-dictionary/metta/", "MATERIAL_REMEDIATION", "Strengthen the primary metta meaning owner: Pali context, goodwill rather than sentiment, related terms, ethical boundary, and route to practice.", "src/data/learn.ts"],
  ["B", 4, "/articles/buddhism-for-beginners-simple-guide/", "DEFERRED_MERGE_REVIEW", "Inventory unique beginner material against the strengthened beginner hub; do not redirect before owner approval and content-preservation confirmation.", "src/data/site.ts"],
  ["B", 4, "/articles/eightfold-path-explained-daily-life/", "DEFERRED_MERGE_REVIEW", "Inventory daily-life examples against the strengthened Eightfold Path owner.", "src/data/site.ts"],
  ["B", 4, "/articles/four-noble-truths-explained-simply/", "DEFERRED_MERGE_REVIEW", "Inventory the simplified diagnostic framing against the strengthened Four Noble Truths owner.", "src/data/site.ts"],
  ["B", 4, "/articles/impermanence-in-buddhism-letting-go/", "DEFERRED_MERGE_REVIEW", "Inventory letting-go applications against the strengthened impermanence lesson.", "src/data/site.ts"],
  ["B", 4, "/articles/impermanence-in-buddhism/", "DEFERRED_MERGE_REVIEW", "Inventory broad impermanence explanations against the strengthened primary lesson.", "src/data/site.ts"],
  ["B", 4, "/articles/loving-kindness-meditation-beginners/", "DEFERRED_MERGE_REVIEW", "Reconcile definition, beginner practice, and full meditation method; destination choice remains owner-sensitive.", "src/data/site.ts"],
  ["B", 4, "/articles/noble-eightfold-path-practical-guide/", "DEFERRED_MERGE_REVIEW", "Inventory practical-path material against the strengthened Eightfold Path owner.", "src/data/site.ts"],
  ["C", 1, "/meditation/breathing-meditation/", "MATERIAL_REMEDIATION", "Differentiate breath awareness by anchor location, knowing long/short breath, non-control, troubleshooting, and alternate anchors.", "src/data/learn.ts"],
  ["C", 1, "/meditation/loving-kindness-meditation/", "MATERIAL_REMEDIATION", "Differentiate metta as cultivation of goodwill/intention rather than breath relaxation; include sequencing and difficult-person boundaries.", "src/data/learn.ts"],
  ["C", 1, "/meditation/walking-meditation/", "MATERIAL_REMEDIATION", "Differentiate walking through pace, contact, turning, gaze, and safe indoor/outdoor adaptation.", "src/data/learn.ts"],
  ["C", 1, "/meditation/when-meditation-feels-hard/", "MATERIAL_REMEDIATION", "Make the page a troubleshooting guide rather than another generic meditation; preserve stop/adapt/support boundaries.", "src/data/learn.ts"],
  ["C", 3, "/meditation/meditation-for-beginners/", "NO_CHANGE_REVIEW", "Protect the broad beginner method if narrower practice pages now remain subordinate.", "src/data/learn.ts"],
  ["C", 3, "/meditation/meditation-posture-for-beginners/", "NO_CHANGE_REVIEW", "Protect the posture-specific accessibility role if it avoids treating pain as progress.", "src/data/learn.ts"],
  ["D", 2, "/articles/right-speech-buddhism/", "MATERIAL_REMEDIATION", "Strengthen the broad owner with the canonical four abstentions, a truth/usefulness/timing framework, and difficult scenarios.", "src/data/site.ts"],
  ["D", 2, "/articles/buddhist-approach-to-anger/", "MATERIAL_REMEDIATION", "Add concrete anger-response sequencing, accountability, boundary action, and proportional wellbeing limits.", "src/data/site.ts"],
  ["D", 3, "/articles/compassion-with-boundaries/", "NO_CHANGE_REVIEW", "Protect its care-versus-compliance and unsafe-situation boundaries if already strong.", "src/data/site.ts"],
  ["D", 3, "/articles/mindful-email-and-texting/", "NO_CHANGE_REVIEW", "Protect its channel-specific scenarios if it remains subordinate to the Right Speech owner.", "src/data/site.ts"],
  ["E", 1, "/learn/sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths/", "MATERIAL_REMEDIATION", "Clarify canonical identifier, first-discourse context, translation/paraphrase boundary, four tasks, and relationship to the owner.", "src/data/learn.ts"],
  ["E", 1, "/learn/sutta-for-daily-life/magga-vibhanga-sutta-eightfold-path/", "MATERIAL_REMEDIATION", "Clarify SN 45.8 as an analysis text and keep its role source-specific rather than another broad path article.", "src/data/learn.ts"],
  ["E", 1, "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/", "MATERIAL_REMEDIATION", "Clarify Snp 1.8 context, ethical preconditions, translation variation, editorial practice boundary, and relationship to metta owner.", "src/data/learn.ts"],
  ["E", 3, "/articles/dhamma-vs-dharma/", "NO_CHANGE_REVIEW", "Protect the language-comparison role if it avoids pretending Dhamma/Dharma have one exhaustive English equivalent.", "src/data/site.ts"],
  ["F", 3, "/learn/dhammapada-reflections/", "NO_CHANGE_REVIEW", "Protect the source-study navigation hub; broader structural/template changes belong to Phase 5.", "src/pages/learn/[section]/index.astro"]
].map(([Batch, Priority, route, expectedAction, primaryContentProblem, sourceFile]) => ({
  Batch,
  Priority,
  route,
  URL: new URL(route, SITE).href,
  "Expected action": expectedAction,
  "Primary content problem": primaryContentProblem,
  "Source file": sourceFile
}));

const queueRows = queue.map((item) => {
  const p1 = p1ByUrl.get(item.URL) || {};
  const p2 = p2ByUrl.get(item.URL) || {};
  const p3 = p3ByUrl.get(item.URL) || {};
  return {
    Priority: `P${item.Priority}`,
    Batch: item.Batch,
    URL: item.URL,
    "Page family": p2["Page family"] || inventoryByUrl.get(item.URL)?.["Page family"] || "",
    "Topic cluster": p2["Topic cluster"] || "",
    "Phase 1 score": p1["Total /100"] || "Not scored",
    "Phase 1 problem": p1["Primary recommendation"] || "Phase 3 deferred content-preservation review",
    "Phase 2 role": p2["Primary page role"] || "",
    "Primary owner URL": p2["Primary topic owner URL"] || item.URL,
    "Is primary owner?": p2["Is primary owner?"] || "No",
    "Phase 3 index state": p3["After index state"] || "indexable",
    "Phase 3 handoff category": p3["Phase 3 action"] || "KEEP_INDEXED",
    "Why this page exists": p2["Why this page exists"] || "Protected route-specific reader journey.",
    "This page does not own": p2["This page does not own"] || "Broader roles assigned elsewhere in Phase 2.",
    "Current unique value": p2["Unique information gain"] || "",
    "Required unique value": p2["Required differentiation"] || item["Primary content problem"],
    "Primary content problem": item["Primary content problem"],
    "Source problem": item.Batch === "E" || /karma|impermanence|metta|truths|eightfold|buddhism/.test(item.route) ? "Source relationship or interpretation boundary needs explicit review." : "Verify existing source framing; do not invent authority.",
    "Overlap problem": p2["Cannibalization risk"] || (item["Expected action"] === "DEFERRED_MERGE_REVIEW" ? "HIGH" : "Review against selected owner/support role."),
    "Example problem": ["C", "D"].includes(item.Batch) ? "Needs method- or scenario-specific examples; reject interchangeable pause/breathe prose." : "Add only examples that clarify the assigned role.",
    "Practice problem": item.Batch === "C" ? "Exact anchor, attention use, expected difficulty, adaptation, and difference from other methods must be explicit." : "Practice must derive from the page concept rather than a generic calming script.",
    "Safety problem": ["C", "D"].includes(item.Batch) ? "Review stop/adapt/support or relationship-boundary language proportionally." : "No new clinical or authority claim permitted.",
    "FAQ problem": "Retain only genuine page-specific follow-up questions; no FAQ expansion for schema.",
    "Expected action": item["Expected action"],
    "Human review required": p2["Human review required?"] || (item["Expected action"] === "DEFERRED_MERGE_REVIEW" ? "Yes before redirect" : "No"),
    Status: "SPECIFIED_PRE_EDIT"
  };
});

writeCsv("phase-4-remediation-queue.csv", Object.keys(queueRows[0]), queueRows);

const specificationRows = queue.map((item) => {
  const p2 = p2ByUrl.get(item.URL) || {};
  const inv = inventoryByUrl.get(item.URL) || {};
  const isMeditation = item.Batch === "C";
  const isSource = item.Batch === "E";
  const isDeferred = item["Expected action"] === "DEFERRED_MERGE_REVIEW";
  return {
    URL: item.URL,
    "Current title": inv.Title || "",
    "Current H1": inv.H1 || "",
    "Page role": p2["Primary page role"] || "",
    Audience: p2["Audience stage"] || "",
    "Primary intent": p2["Primary user intent"] || p2["Primary search intent"] || "",
    "Primary owner": p2["Primary topic owner URL"] || item.URL,
    "Why this page exists": p2["Why this page exists"] || "Protected route-specific reader journey.",
    "This page does not own": p2["This page does not own"] || "Broader roles assigned elsewhere in Phase 2.",
    "Sections to preserve": isDeferred ? "All unique passages until a line-by-line merge is owner-approved." : "Accurate definitions, useful examples, existing safety boundaries, stable URL/title/H1, and best next-step links.",
    "Sections to strengthen": item["Primary content problem"],
    "Sections to remove": isDeferred || item["Expected action"] === "NO_CHANGE_REVIEW" ? "None before review." : "Only demonstrably generic filler or repeated explanation; preserve substantive claims.",
    "Sections to merge": isDeferred ? `Candidate content merge into ${p2["Primary topic owner URL"] || "Phase 2 owner"}; no redirect in Phase 4 without approval.` : "Merge repeated introductory context into a concise role statement where needed.",
    "New information required": item["Primary content problem"],
    "New sources required": isSource ? "Canonical identifier and translation-specific authoritative source; concise paraphrase only." : /karma|impermanence|metta|truths|eightfold|buddhism/.test(item.route) ? "Authoritative canonical/source support for claim groups and interpretation boundaries." : "Only if a factual, safety, linguistic, or historical claim needs support.",
    "New examples required": ["C", "D"].includes(item.Batch) ? "At least one method- or situation-specific worked example that could not be swapped into another page." : "Only where it materially clarifies the assigned page role.",
    "Misconceptions to address": isMeditation ? "Meditation is not forced calm; method-specific misconception from the page." : item.route.includes("karma") ? "Karma is not fate, cosmic punishment, or permission to blame suffering." : item.route.includes("metta") ? "Metta is cultivated goodwill, not compulsory affection or unsafe access." : "Only the page-specific misconception named in the remediation problem.",
    "Practice improvements": isMeditation ? "Name exact anchor/object, attention sequence, expected difficulty, adaptation, stop conditions, and next step." : "Use one concept-derived observation or decision practice; do not append generic pause/breathe advice.",
    "Safety requirements": isMeditation ? "No cure promises; short/eyes-open/alternate-anchor options; stop if distress intensifies; professional support remains compatible." : item.Batch === "D" ? "Care is not compliance; preserve accountability, boundaries, and unsafe-situation support." : "Avoid medical, universal-tradition, identity, credential, or certainty claims.",
    "Next-step links": `Support → ${p2["Primary topic owner URL"] || item.URL}; owner → no more than three genuinely distinct support/source/practice routes.`,
    "Metadata change needed?": "No by default; only if the edited role is currently misrepresented.",
    "Expected final role": p2["Primary page role"] || "Protected Phase 2 role",
    "Editor notes": `${item["Expected action"]}; source file ${item["Source file"]}; pre-edit rendered words ${inv.Words || "unknown"}. Phase 3 index policy must remain unchanged.`
  };
});
writeCsv("phase-4-page-specifications.csv", Object.keys(specificationRows[0]), specificationRows);

const snapshot = {
  capturedAt: new Date().toISOString(),
  branch: "codex/phase-4-high-value-content-remediation",
  startingHead: "a1cd457345587670133bfc58af1cafd80d038e6e",
  dependencies: { phase1: true, phase2: true, phase3: true, phase4Handoff: true },
  phase3Baseline: { htmlDocuments: 336, indexableDocuments: 193, noindexDocuments: 143, sitemapUrls: 193 },
  queue: {
    reviewed: queue.length,
    materialRemediation: queue.filter((item) => item["Expected action"] === "MATERIAL_REMEDIATION").length,
    noChangeReview: queue.filter((item) => item["Expected action"] === "NO_CHANGE_REVIEW").length,
    deferredMergeReview: queue.filter((item) => item["Expected action"] === "DEFERRED_MERGE_REVIEW").length,
    byBatch: Object.fromEntries(["A", "B", "C", "D", "E", "F"].map((batch) => [batch, queue.filter((item) => item.Batch === batch).length]))
  }
};
fs.writeFileSync(path.join(OUT, "phase-4-pre-edit-snapshot.json"), `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify(snapshot, null, 2));
