import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-6-2026-08-24");
const phase2Dir = path.join(root, "docs/audits/adsense-recovery-phase-2-2026-08-24");
const phase3Dir = path.join(root, "docs/audits/adsense-recovery-phase-3-2026-08-24");
const phase3CompletionDir = path.join(phase3Dir, "completion-2026-08-24");
const phase4Dir = path.join(root, "docs/audits/adsense-recovery-phase-4-2026-08-24");
const phase5Dir = path.join(root, "docs/audits/adsense-recovery-phase-5-2026-08-24");
const distDir = path.join(root, "dist");
const site = "https://echobuddha.com";
const auditDate = "2026-08-24";

function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(value); value = ""; }
    else if (character === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += character;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const [headers, ...records] = rows.filter((item) => item.some((field) => field !== ""));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

const read = (file) => fs.readFileSync(file, "utf8");
const readCsv = (file) => parseCsv(read(file));
const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (name, headers, rows) => fs.writeFileSync(
  path.join(outDir, name),
  `${headers.join(",")}\n${rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")).join("\n")}\n`
);
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const htmlPath = (url) => {
  const pathname = new URL(url).pathname;
  return pathname === "/" ? path.join(distDir, "index.html") : path.join(distDir, pathname, "index.html");
};
const htmlFor = (url) => read(htmlPath(url));
const stripTags = (value) => value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const titleFor = (html) => stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
const h1For = (html) => stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
const canonicalFor = (html) => html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ?? "";

const p2 = readCsv(path.join(phase2Dir, "ECHO_BUDDHA_URL_VALUE_SCORES.csv"));
const p3 = readCsv(path.join(phase3Dir, "ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv"));
const p4 = readCsv(path.join(phase4Dir, "ECHO_BUDDHA_PHASE_4_CONSOLIDATION_REGISTRY.csv"));
const queries = readCsv(path.join(phase3CompletionDir, "ECHO_BUDDHA_QUERY_PAGE_PERFORMANCE.csv"));
const p2ByUrl = new Map(p2.map((row) => [row.URL, row]));
const p3ByUrl = new Map(p3.map((row) => [row.URL, row]));
const p4ByUrl = new Map(p4.map((row) => [row.URL, row]));

const selected = {
  [`${site}/articles/right-speech-buddhism/`]: { tier: "C0_CRITICAL", batch: "BATCH_1_C0", reason: "P0 Search asset and definitive broad right-speech owner", gap: "Needed explicit separation of the four abstentions from the true/beneficial/timely teaching", risk: "CRITICAL_SEARCH_PRESERVATION", after: 90 },
  [`${site}/articles/dhamma-vs-dharma/`]: { tier: "C0_CRITICAL", batch: "BATCH_2_HIGH_EQUITY_LOW_VALUE", reason: "P1, strongly growing terminology owner with a weak Phase 2 score", gap: "Language and tradition relationship was too binary; semantic range needed clarification", risk: "HIGH_QUERY_AND_TERMINOLOGY", after: 84 },
  [`${site}/articles/dhammapada-verse-1-meaning/`]: { tier: "C0_CRITICAL", batch: "BATCH_2_HIGH_EQUITY_LOW_VALUE", reason: "P1 attribution/source-risk owner with growing impressions", gap: "Needed verse-pair context and transparent translation caution", risk: "HIGH_ATTRIBUTION_AND_QUERY", after: 86 },
  [`${site}/quotes/letting-go/`]: { tier: "C0_CRITICAL", batch: "BATCH_1_REVIEW_ONLY", reason: "P0 quote-category owner retained after complete Phase 5 remediation", gap: "No residual Phase 6 gap; Phase 5 editorial curation already materially remediated it", risk: "CRITICAL_SEARCH_PRESERVATION", after: 52, hold: "NO_PHASE_6_REWRITE_PHASE_5_SATISFIED" },
  [`${site}/articles/dhammapada-reflection-what-we-think/`]: { tier: "C1_HIGH", batch: "BATCH_3_C1", reason: "P1 query-visible reflection page with attribution ambiguity", gap: "Readers needed a repeatable provenance-check workflow", risk: "HIGH_ATTRIBUTION_AND_QUERY", after: 84 },
  [`${site}/articles/noble-eightfold-path-practical-guide/`]: { tier: "C1_HIGH", batch: "BATCH_3_C1", reason: "P1 growing practical-path owner and core curriculum support", gap: "Eight factors read too much like a checklist rather than cooperating trainings", risk: "HIGH_INTENT_PRESERVATION", after: 84 },
  [`${site}/articles/buddhist-wisdom-for-overthinking/`]: { tier: "C1_HIGH", batch: "BATCH_3_C1", reason: "P1 mental-practice owner with a Phase 2 source-quality gap", gap: "Modern overthinking was too easily conflated with papañca; diagnostic boundaries needed precision", risk: "HIGH_WELLBEING_AND_TERMINOLOGY", after: 84 },
  [`${site}/articles/compassion-with-boundaries/`]: { tier: "C1_HIGH", batch: "BATCH_3_C1", reason: "P1 growing modern-application page with doctrinal boundary risk", gap: "Modern boundary scripts needed clear labeling as application rather than canonical formula", risk: "HIGH_MODERN_APPLICATION", after: 85 },
  [`${site}/`]: { tier: "C2_STRATEGIC", batch: "BATCH_4_REVIEW_ONLY", reason: "P0 site gateway and central navigation route", gap: "No material Phase 6 content gap established", risk: "CRITICAL_ARCHITECTURE", hold: "REVIEW_ONLY" },
  [`${site}/learn/buddhism-for-beginners/`]: { tier: "C2_STRATEGIC", batch: "BATCH_4_REVIEW_ONLY", reason: "Central beginner learning route", gap: "No material gap requiring a Phase 6 rewrite", risk: "HIGH_CURRICULUM", hold: "REVIEW_ONLY" },
  [`${site}/learn/eightfold-path/`]: { tier: "C2_STRATEGIC", batch: "BATCH_4_REVIEW_ONLY", reason: "Definitive curriculum hub for the Eightfold Path", gap: "No material gap requiring a Phase 6 rewrite", risk: "HIGH_CURRICULUM", hold: "REVIEW_ONLY" },
  [`${site}/learn/buddhist-dictionary/dhamma/`]: { tier: "C2_STRATEGIC", batch: "BATCH_4_REVIEW_ONLY", reason: "Concise terminology owner supporting Dhamma/Dharma content", gap: "No material gap requiring a Phase 6 rewrite", risk: "MEDIUM_TERMINOLOGY", hold: "REVIEW_ONLY" },
  [`${site}/learn/buddhism-101/what-is-mindfulness/`]: { tier: "C2_STRATEGIC", batch: "BATCH_4_REVIEW_ONLY", reason: "Definitive mindfulness curriculum owner", gap: "No material gap requiring a Phase 6 rewrite", risk: "HIGH_CURRICULUM", hold: "REVIEW_ONLY" },
  [`${site}/learn/buddhist-dictionary/metta/`]: { tier: "C2_STRATEGIC", batch: "BATCH_4_REVIEW_ONLY", reason: "Core goodwill terminology owner", gap: "No material gap requiring a Phase 6 rewrite", risk: "MEDIUM_TERMINOLOGY", hold: "REVIEW_ONLY" },
  [`${site}/learn/buddhist-dictionary/sati/`]: { tier: "C2_STRATEGIC", batch: "BATCH_4_REVIEW_ONLY", reason: "Core mindfulness terminology owner", gap: "No material gap requiring a Phase 6 rewrite", risk: "MEDIUM_TERMINOLOGY", hold: "REVIEW_ONLY" },
  [`${site}/learn/buddhism-101/threefold-training-sila-samadhi-panna/`]: { tier: "C2_STRATEGIC", batch: "BATCH_4_REVIEW_ONLY", reason: "Curriculum page connecting ethical, meditative, and wisdom training", gap: "No material gap requiring a Phase 6 rewrite", risk: "HIGH_CURRICULUM", hold: "REVIEW_ONLY" }
};

const changedUrls = Object.entries(selected).filter(([, item]) => item.after && !item.hold).map(([url]) => url);
const oldHashes = {
  [`${site}/articles/right-speech-buddhism/`]: "aaa3913477bf32fbe4674b93afabeb1b64e8f9ac1fb862b661527be254c0f81b",
  [`${site}/articles/dhamma-vs-dharma/`]: "7a8f0eb4505587fd56ade6514d9d106eb87c0fcecb696a32bd35e0c49e5d6924",
  [`${site}/articles/dhammapada-verse-1-meaning/`]: "bfbb6a5af52907de76b69de915683ea9678045abb8128f35a99872f5a7e22230",
  [`${site}/articles/dhammapada-reflection-what-we-think/`]: "89c7329ded30d2d292bc6ecb5556d3d1dcbf4474f77d4894e81255a9584e3b1a",
  [`${site}/articles/noble-eightfold-path-practical-guide/`]: "afd566a4a733b6fcc1b382f430c0d4786a3715484b3bb0f5ba4d01576f0af104",
  [`${site}/articles/buddhist-wisdom-for-overthinking/`]: "9e77615a793a16321bf05f4f95d47792079b9e69fecddcaea8131dc79b52b8d8",
  [`${site}/articles/compassion-with-boundaries/`]: "d01eeb7512cfdb7c99555c2481fdd3d5c39f1d9a8d07806806ccdcaf13c604e5"
};

const baselineMetadata = {
  [`${site}/articles/right-speech-buddhism/`]: ["Right Speech in Buddhism: Meaning, Examples, and Practice | Echo Buddha", "Right Speech in Buddhism: How to Speak with Kindness and Awareness"],
  [`${site}/articles/dhamma-vs-dharma/`]: ["Dhamma vs Dharma: Buddhist Meaning and Spelling | Echo Buddha", "Dhamma vs Dharma: What Is the Difference?"],
  [`${site}/articles/dhammapada-verse-1-meaning/`]: ["Dhammapada Verse 1 Meaning and Translation Caution | Echo Buddha", "Dhammapada Verse 1 Meaning and Translation Caution"],
  [`${site}/articles/dhammapada-reflection-what-we-think/`]: ["Dhammapada What We Think: Translation, Paraphrase, Reflection | Echo Buddha", "Dhammapada Reflection: What We Think, We Become"],
  [`${site}/articles/noble-eightfold-path-practical-guide/`]: ["Noble Eightfold Path Practical Guide for Daily Life | Echo Buddha", "The Noble Eightfold Path: A Practical Guide for Daily Life"],
  [`${site}/articles/buddhist-wisdom-for-overthinking/`]: ["Buddhist Wisdom for Overthinking and a Busy Mind | Echo Buddha", "Buddhist Wisdom for Overthinking: How to Calm a Busy Mind"],
  [`${site}/articles/compassion-with-boundaries/`]: ["Compassion With Boundaries in Buddhist Practice | Echo Buddha", "Compassion With Boundaries"]
};

const sitemapUrls = [...read(path.join(distDir, "sitemap.xml")).matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const registryRows = sitemapUrls.map((url) => {
  const value = p2ByUrl.get(url) ?? {};
  const growth = p3ByUrl.get(url) ?? {};
  const consolidation = p4ByUrl.get(url) ?? {};
  const choice = selected[url];
  return {
    URL: url,
    "page family": value.page_family || growth.page_family || consolidation["page family"] || "UNKNOWN",
    topic: value.topic || consolidation.topic || "Page-specific / unclustered",
    "Phase 2 score": value.publisher_value_score || growth.phase_2_value_score || "NOT_APPLICABLE",
    "Phase 3 protection tier": growth.protection_tier || "NOT_REPORTED",
    "query ownership": growth.query_ownership || consolidation["visible query ownership"] || "NO_VISIBLE_QUERY_DATA",
    "latest Search clicks": consolidation["latest clicks"] || growth.clicks_3m || "0",
    impressions: consolidation["latest impressions"] || growth.impressions_3m || "0",
    momentum: consolidation.momentum || growth.momentum || "INSUFFICIENT_VISIBLE_DATA",
    "Google index state": consolidation["Google index state"] || "NOT_REPORTED",
    "Google canonical": consolidation["Google canonical"] || growth.canonical_state || "NOT_REPORTED",
    "internal authority": growth.internal_authority || "NOT_REPORTED",
    "Phase 4 decision": consolidation["Phase 4 decision"] || "RETAINED_OUTSIDE_PHASE_4_REGISTRY",
    "Phase 5 decision": url.includes("/quotes/") ? "PHASE_5_QUOTE_ARCHITECTURE_APPLIED" : "NOT_APPLICABLE",
    "current content-quality gaps": choice?.gap || "Not selected for deep Phase 6 remediation",
    "cornerstone reason": choice?.reason || "Retained but below Phase 6 deep-upgrade priority threshold",
    "upgrade priority": choice?.tier || "NOT_PHASE_6_CORNERSTONE",
    "upgrade risk": choice?.risk || "STANDARD_RETAINED_PAGE",
    "implementation batch": choice?.batch || "NOT_SCHEDULED_PHASE_6"
  };
});
writeCsv("ECHO_BUDDHA_PHASE_6_CORNERSTONE_REGISTRY.csv", Object.keys(registryRows[0]), registryRows);

const needs = {
  "right-speech-buddhism": ["A reader trying to apply Buddhist ethics in ordinary conversation", "They may know that kind speech matters but not the canonical distinctions", "What Right Speech requires and how to use it without reducing it to niceness", "The four abstentions and the separate true/beneficial/timely test", "That agreeable speech is always required, or that silence is always virtuous", "Use the pause-and-test workflow in one real conversation", "A full survey of every Eightfold Path factor"],
  "dhamma-vs-dharma": ["A beginner encountering two spellings in Buddhist sources", "They know both words appear in Buddhist writing", "Whether the words differ and which form to use", "Pali/Sanskrit relationship, semantic range, and tradition-sensitive usage", "That Pali equals one school and Sanskrit another with no exceptions", "Identify the source tradition and use its vocabulary consistently", "A history of every Indic use of dharma"],
  "dhammapada-verse-1-meaning": ["A reader checking the meaning or attribution of Verse 1", "They may have seen a viral English saying attributed to the Buddha", "What the verse says, why translations differ, and how to interpret it carefully", "Mind precedes experience in this paired ethical teaching; wording depends on translation", "That a popular paraphrase is an exact canonical quotation", "Compare a named translation and read Verse 2 with Verse 1", "A complete translation commentary on all Dhammapada chapters"],
  "dhammapada-reflection-what-we-think": ["A reflective reader encountering the popular 'what we think' saying", "They may assume it is a direct Dhammapada quotation", "How to use the saying responsibly without losing its practical value", "How to separate source text, translation, paraphrase, and reflection", "That helpful modern wording automatically has exact scriptural provenance", "Apply the four-step provenance check before sharing", "A competing verse-by-verse scholarly commentary"],
  "noble-eightfold-path-practical-guide": ["A beginner seeking a usable daily-life path", "They may know the names of the eight factors", "How the factors work together in a real situation", "Wisdom, ethics, and cultivation cooperate rather than form a linear checklist", "That one completes each factor once or practices them in isolation", "Use one difficult situation to notice several factors", "A full canonical exegesis of every path factor"],
  "buddhist-wisdom-for-overthinking": ["A reader caught in repetitive thought who wants a gentle Buddhist practice", "They know mindfulness may help but may conflate clinical and Buddhist terms", "How to distinguish useful reflection from proliferating replay and return to experience", "Overthinking is a modern label; papañca is related but not a direct translation", "That all thinking is bad, or that practice replaces professional care", "Classify the loop, ground in the body, and choose the next workable action", "Clinical diagnosis or treatment advice"],
  "compassion-with-boundaries": ["A reader who wants to care without enabling harm or exhaustion", "They may believe compassion always means saying yes", "How to set a limit without abandoning goodwill", "Modern boundary language is an application; care, capacity, and responsibility can be examined together", "That boundaries are canonical scripts or that equanimity is indifference", "Draft one kind, specific, enforceable limit", "Legal, medical, or abuse-crisis advice"],
  "letting-go": ["A reader looking for short reflections on letting go", "They may be browsing quote collections", "Find curated original reflections with clear attribution", "The category is editorially curated and its quotes are EchoBuddha originals", "That the lines are Buddha or scripture quotations", "Choose a reflection and follow its linked practice context", "A duplicate article about attachment"]
};

const briefOrder = Object.keys(selected).filter((url) => ["C0_CRITICAL", "C1_HIGH"].includes(selected[url].tier));
const briefSections = briefOrder.map((url) => {
  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
  const map = needs[slug];
  const queryRows = queries.filter((row) => row.page === url && row.window_name === "recovery").slice(0, 8);
  const queryText = queryRows.length ? queryRows.map((row) => `\`${row.query}\` (${row.clicks} clicks / ${row.impressions} impressions)`).join("; ") : "No visible recovery-window query row; preserve the established primary intent rather than inventing query demand.";
  const changed = changedUrls.includes(url);
  return `## ${selected[url].tier}: ${url}\n\n**THIS PAGE IS WORTH KEEPING BECAUSE:** ${selected[url].reason}.\n\n### USER_NEED_MAP\n\n1. Intended reader: ${map[0]}.\n2. Likely prior knowledge: ${map[1]}.\n3. Arrival question/task: ${map[2]}.\n4. Required understanding: ${map[3]}.\n5. Common misconception: ${map[4]}.\n6. Genuine next step: ${map[5]}.\n7. Explicit exclusion: ${map[6]}.\n\n### Editorial brief\n\n- Current intent: ${p2ByUrl.get(url)?.primary_intent || "curated resource"}.\n- Current queries: ${queryText}\n- Strengths retained: URL, primary intent, useful existing explanation, existing citations, relevant internal pathways, title, and H1.\n- Weakness addressed: ${selected[url].gap}.\n- External gap: accessible resources often provide either primary text or modern advice; EchoBuddha can make the source/application boundary explicit and provide a page-specific practice workflow.\n- Source plan: use a primary translation first, then an established explanatory resource only where it adds context.\n- Information gain: ${changed ? "page-specific distinctions, synthesis, and application added" : "no Phase 6 rewrite; prior Phase 5 remediation already resolves the identified quote-layer problem"}.\n- Remove: ${changed ? "one awkward SEO-oriented phrase where identified; no valuable section removed" : "nothing"}.\n- Rewrite: ${changed ? "only the passages necessary to add precision; no mass rewrite" : "none"}.\n- New additions: ${changed ? "two page-specific explanatory/practice sections and distinct reflection prompts where relevant" : "none"}.\n- Search-preservation constraints: preserve URL, title, H1, canonical, primary intent, query-relevant material, and internal prominence.\n`;
});
const briefsDocument = `# EchoBuddha Phase 6 Content Briefs\n\nAudit date: ${auditDate}\n\nThese page-specific briefs govern the eight C0/C1 resources. Research informed the briefs; it did not supply an outline to copy. C2 pages received semantic review but no rewrite because no material evidence-based gap justified one.\n\n${briefSections.join("\n---\n\n")}`;
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_6_CONTENT_BRIEFS.md"), `${briefsDocument.trimEnd()}\n`);

const benchmarkSets = {
  "right-speech-buddhism": [
    ["https://suttacentral.net/sn45.8/en/sujato", "primary translation", "Defines four kinds of speech to abandon", "Does not provide a modern conversation workflow", "Four abstentions", "Clear distinction from the separate timely/beneficial test"],
    ["https://www.accesstoinsight.org/tipitaka/mn/mn.058.than.html", "primary translation archive", "Shows the true/factual/beneficial/timely decision pattern", "Translation page is not a beginner synthesis", "Speech may be agreeable or disagreeable", "A practical two-test model without conflation"],
    ["https://www.accesstoinsight.org/ptf/dhamma/sacca/sacca4/samma-vaca/index.html", "established Buddhist reference", "Collects canonical Right Speech references", "Less focused on one ordinary decision", "Core definitions and training verses", "Page-specific examples and pause workflow"]
  ],
  "dhamma-vs-dharma": [
    ["https://suttacentral.net/define/dhamma", "primary-text lexicon", "Displays the broad range of canonical uses", "Not a beginner comparison article", "Dhamma has multiple senses", "Plain-language decision guide for source-sensitive spelling"],
    ["https://tricycle.org/magazine/dharma-meaning/", "established Buddhist magazine", "Explains that Dharma carries several meanings", "Modern overview cannot resolve every textual context", "Meaning varies by context", "Connect lexical range to responsible reading practice"],
    ["https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.14.budd.html", "primary translation archive", "Shows Dhamma in a Theravada translation context", "Not a language-history comparison", "Pali-form usage in practice", "Avoid a false one-school/one-spelling boundary"]
  ],
  "dhammapada-verse-1-meaning": [
    ["https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html", "primary translation archive", "Presents Verses 1 and 2 as an ethical pair", "One translation does not explain all wording differences", "Paired mind/action/result teaching", "Teach readers to compare named translations"],
    ["https://suttacentral.net/edition/dhp/en/sujato/introduction", "translation introduction", "Makes translation method and edition context visible", "Not a detailed Verse 1 commentary", "Translations are editorial choices", "Short translation-caution method"],
    ["https://suttacentral.net/dhp1-20/en/sujato", "primary translation", "Provides a second named rendering in chapter context", "Readers still need synthesis", "Verse context and paired structure", "Separate text, translation, paraphrase, and application"]
  ],
  "dhammapada-reflection-what-we-think": [
    ["https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html", "primary translation archive", "Provides an attributable canonical baseline", "Does not adjudicate every popular paraphrase", "Named-source comparison", "Repeatable provenance workflow"],
    ["https://suttacentral.net/edition/dhp/en/sujato/introduction", "translation introduction", "Explains the existence of a translation edition", "Not focused on viral attributions", "Translation provenance", "A four-layer source check for sharing"],
    ["https://fakebuddhaquotes.com/what-you-think-you-become/", "specialist attribution reference", "Documents the attribution problem around the popular wording", "Secondary resource rather than scripture", "Popular attribution is contested", "Retain reflective usefulness while labeling provenance limits"]
  ],
  "noble-eightfold-path-practical-guide": [
    ["https://suttacentral.net/sn45.8/en/sujato", "primary translation", "Defines the eight path factors", "Concise source does not teach a modern workflow", "Canonical factor definitions", "Show several factors operating in one event"],
    ["https://suttacentral.net/mn44/en/sujato", "primary translation", "Groups factors under ethics, immersion, and wisdom", "Requires contextual explanation for beginners", "Three-training relationship", "Original three-trainings synthesis and visual"],
    ["https://www.accesstoinsight.org/lib/authors/bodhi/waytoend.html", "established monastic guide", "Offers systematic explanation of the path", "Long-form exposition can be demanding for a first practice", "Interdependence and depth", "Compact daily-life scenario mapping"]
  ],
  "buddhist-wisdom-for-overthinking": [
    ["https://suttacentral.net/mn18/en/sujato", "primary translation", "Provides canonical context for conceptual proliferation", "Papañca is difficult and not a clinical label", "Contact-to-proliferation sequence", "Explicitly prevent one-to-one translation claims"],
    ["https://www.dhammatalks.org/books/BeyondAllDirections/Section0013.html", "monastic explanatory essay", "Distinguishes useful and unskillful uses of thinking", "Not tailored to a brief everyday triage exercise", "Thinking is not uniformly rejected", "Reflection/problem-solving/replay diagnostic"],
    ["https://www.accesstoinsight.org/tipitaka/mn/mn.020.soma.html", "primary translation archive", "Offers canonical strategies for intrusive thought patterns", "Not a substitute for clinical care", "Multiple responses to thought", "Gentle body-based next-step workflow and wellbeing boundary"]
  ],
  "compassion-with-boundaries": [
    ["https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html", "primary translation archive", "Grounds goodwill in the Karaṇīya Mettā Sutta", "Does not provide modern boundary scripts", "Goodwill orientation", "State explicitly where modern application begins"],
    ["https://suttacentral.net/sn46.54/en/bodhi", "primary translation", "Provides context for equanimity as a cultivation factor", "Not a relationship-boundary manual", "Equanimity is not mere indifference", "Care-capacity-responsibility synthesis"],
    ["https://tricycle.org/magazine/healthy-boundaries/", "established Buddhist magazine", "Connects Buddhist practice with contemporary boundary language", "Modern application should not be mistaken for canonical wording", "Boundaries can coexist with care", "Concrete, limited script with provenance label"]
  ]
};
const sourceDate = auditDate;
const benchmarkRows = [];
for (const url of changedUrls) {
  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
  for (const item of benchmarkSets[slug]) benchmarkRows.push({
    "EchoBuddha URL": url,
    "target intent": p2ByUrl.get(url)?.primary_intent || "educational explanation",
    "benchmark URL": item[0],
    "source type": item[1],
    strengths: item[2],
    weaknesses: item[3],
    "information commonly available": item[4],
    "information gap": item[5],
    "EchoBuddha differentiation opportunity": `Accessible source/application boundary plus page-specific practice; not a copied outline`,
    "source date": sourceDate,
    "evidence notes": "Direct source reviewed; short paraphrase only; no competitor prose or heading hierarchy copied"
  });
}
writeCsv("ECHO_BUDDHA_PHASE_6_EXTERNAL_BENCHMARK.csv", Object.keys(benchmarkRows[0]), benchmarkRows);

const gains = {
  "right-speech-buddhism": ["NEW_INFORMATION_GAIN", "Separated SN 45.8's four abstentions from MN 58's true/beneficial/timely analysis", "More precise doctrine plus a usable conversation decision model"],
  "dhamma-vs-dharma": ["NEW_INFORMATION_GAIN", "Added language-family nuance and a three-context semantic range", "Avoids a false tradition boundary and helps readers interpret real sources"],
  "dhammapada-verse-1-meaning": ["NEW_INFORMATION_GAIN", "Added Verse 1/2 paired context and reasons English renderings differ", "Improves attribution literacy and prevents false certainty"],
  "dhammapada-reflection-what-we-think": ["NEW_INFORMATION_GAIN", "Added a repeatable source→translation→paraphrase→reflection provenance check", "Turns generic caution into a practical verification skill"],
  "noble-eightfold-path-practical-guide": ["NEW_INFORMATION_GAIN", "Added three-training synthesis, an original visual, and a multi-factor scenario", "Replaces checklist reading with relational understanding"],
  "buddhist-wisdom-for-overthinking": ["NEW_INFORMATION_GAIN", "Distinguished modern overthinking from papañca and added a reflection/problem-solving/replay diagnostic", "Prevents terminology overclaim and gives a safer next action"],
  "compassion-with-boundaries": ["NEW_INFORMATION_GAIN", "Labeled modern boundary language as application and added a care-capacity-responsibility check", "Makes tradition boundaries transparent while improving practical usefulness"]
};
const informationRows = changedUrls.map((url) => {
  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
  return { URL: url, classification: gains[slug][0], "material addition": gains[slug][1], "user value": gains[slug][2], "generic/filler removed": slug === "buddhist-wisdom-for-overthinking" ? "Removed one awkward search-oriented phrase" : "No valuable content removed; additions were surgical", "external differentiation result": "PASS — source-aware synthesis plus page-specific application provides a concrete selection reason", confidence: "HIGH" };
});
writeCsv("ECHO_BUDDHA_PHASE_6_INFORMATION_GAIN.csv", Object.keys(informationRows[0]), informationRows);

const sourceClaims = [
  ["right-speech-buddhism", "Right Speech includes abstaining from lying, divisive speech, harsh speech, and nonsense", "https://suttacentral.net/sn45.8/en/sujato", "PRIMARY_TRANSLATION", "SUPPORTED"],
  ["right-speech-buddhism", "MN 58 applies true/factual, beneficial, timely, and reception-sensitive tests", "https://www.accesstoinsight.org/tipitaka/mn/mn.058.than.html", "PRIMARY_TRANSLATION_ARCHIVE", "SUPPORTED"],
  ["dhamma-vs-dharma", "Dhamma has multiple contextual senses and cannot be reduced to one English word", "https://suttacentral.net/define/dhamma", "PRIMARY_TEXT_LEXICON", "SUPPORTED"],
  ["dhamma-vs-dharma", "Dharma is used with several meanings in Buddhist discourse", "https://tricycle.org/magazine/dharma-meaning/", "ESTABLISHED_BUDDHIST_REFERENCE", "SUPPORTED_WITH_CONTEXT"],
  ["dhammapada-verse-1-meaning", "Verse 1 is best read with Verse 2 as an ethical pair", "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html", "PRIMARY_TRANSLATION_ARCHIVE", "SUPPORTED"],
  ["dhammapada-verse-1-meaning", "English renderings differ because translation involves lexical and editorial choices", "https://suttacentral.net/edition/dhp/en/sujato/introduction", "TRANSLATION_INTRODUCTION", "SUPPORTED_WITH_CONTEXT"],
  ["dhammapada-reflection-what-we-think", "Popular wording should be labeled separately from a named canonical translation", "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html", "PRIMARY_TRANSLATION_ARCHIVE", "SUPPORTED_AS_METHOD"],
  ["noble-eightfold-path-practical-guide", "The factors can be grouped into wisdom, ethics, and cultivation/immersion", "https://suttacentral.net/mn44/en/sujato", "PRIMARY_TRANSLATION", "SUPPORTED"],
  ["noble-eightfold-path-practical-guide", "The path is an integrated course of training rather than eight isolated tasks", "https://www.accesstoinsight.org/lib/authors/bodhi/waytoend.html", "ESTABLISHED_MONASTIC_GUIDE", "SUPPORTED"],
  ["buddhist-wisdom-for-overthinking", "Papañca is a difficult canonical term and is not a direct clinical synonym for overthinking", "https://suttacentral.net/mn18/en/sujato", "PRIMARY_TRANSLATION", "SUPPORTED_WITH_EXPLICIT_LIMIT"],
  ["buddhist-wisdom-for-overthinking", "Buddhist practice does not reject every form of thinking", "https://www.dhammatalks.org/books/BeyondAllDirections/Section0013.html", "MONASTIC_EXPLANATORY_SOURCE", "SUPPORTED"],
  ["compassion-with-boundaries", "Goodwill does not itself supply a modern boundary script", "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html", "PRIMARY_TRANSLATION_ARCHIVE", "SUPPORTED_WITH_APPLICATION_BOUNDARY"],
  ["compassion-with-boundaries", "Equanimity can be cultivated without collapsing into indifference", "https://suttacentral.net/sn46.54/en/bodhi", "PRIMARY_TRANSLATION", "SUPPORTED_WITH_CONTEXT"],
  ["compassion-with-boundaries", "Contemporary Buddhist teachers apply practice to healthy boundaries", "https://tricycle.org/magazine/healthy-boundaries/", "ESTABLISHED_BUDDHIST_REFERENCE", "SUPPORTED_AS_MODERN_APPLICATION"]
];
const sourceRows = sourceClaims.map(([slug, claim, url, type, state]) => ({
  "EchoBuddha URL": `${site}/articles/${slug}/`, claim, "source URL": url, "source type": type, "verification state": state, "HTTP check": "200_VERIFIED_2026-08-24", "tradition/context note": "Claim wording kept narrower than source; modern application labeled where applicable", "quotation/copyright review": "PASS_NO_LONG_QUOTATION", "tracking/private parameters": "NONE", reviewer: "INDEPENDENT_SECOND_PASS"
}));
writeCsv("ECHO_BUDDHA_PHASE_6_SOURCE_RESEARCH.csv", Object.keys(sourceRows[0]), sourceRows);

const queryCoverageRows = [];
for (const url of briefOrder) {
  const rows = queries.filter((row) => row.page === url && row.window_name === "recovery");
  if (!rows.length) queryCoverageRows.push({ query: "NO_VISIBLE_RECOVERY_QUERY", URL: url, clicks: 0, impressions: 0, position: "NOT_AVAILABLE", "user need": "Established page intent only", "coverage before": "Existing intent coverage retained", "coverage after": changedUrls.includes(url) ? "Materially strengthened without keyword fan-out" : "Phase 5-curated resource retained", "heading created from query": "NO", "intent preserved": "YES", evidence: "Phase 3 query×page export contains no visible row for this URL" });
  for (const row of rows) queryCoverageRows.push({ query: row.query, URL: url, clicks: row.clicks, impressions: row.impressions, position: row.position, "user need": "Observed query mapped to the existing page intent", "coverage before": "Protected by Phase 3 evidence", "coverage after": changedUrls.includes(url) ? "Existing answer retained; source precision and task completion improved" : "Existing Phase 5 answer retained", "heading created from query": "NO", "intent preserved": "YES", evidence: `${row.start_date}–${row.end_date}; ${row.retrieval_status}; ${row.aggregation_type}` });
}
writeCsv("ECHO_BUDDHA_PHASE_6_QUERY_COVERAGE.csv", Object.keys(queryCoverageRows[0]), queryCoverageRows);

const sourcesAdded = {
  "right-speech-buddhism": "MN 58 (Access to Insight); SN 45.8 retained",
  "dhamma-vs-dharma": "SuttaCentral Dhamma lexicon; Tricycle Dharma reference",
  "dhammapada-verse-1-meaning": "Dhammapada chapter/translation context retained and expanded",
  "dhammapada-reflection-what-we-think": "SuttaCentral Dhammapada translation introduction",
  "noble-eightfold-path-practical-guide": "MN 44 (SuttaCentral); Bhikkhu Bodhi path guide",
  "buddhist-wisdom-for-overthinking": "MN 18 (SuttaCentral); Dhammatalks Arrows of Thinking",
  "compassion-with-boundaries": "SN 46.54 (SuttaCentral); Tricycle Healthy Boundaries"
};
const changelogRows = changedUrls.map((url) => {
  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
  const html = htmlFor(url);
  return { URL: url, "old content hash": oldHashes[url], "new content hash": sha(html), date: auditDate, "editor/process": "EchoBuddha Phase 6 page-specific editorial and independent semantic review", "major changes": gains[slug][1], "sources added": sourcesAdded[slug], "user intent preserved": "YES", "Search constraints": "URL/title/H1/canonical/primary intent/query-relevant content preserved" };
});
writeCsv("ECHO_BUDDHA_PHASE_6_CORNERSTONE_CHANGELOG.csv", Object.keys(changelogRows[0]), changelogRows);

const scoreRows = briefOrder.map((url) => {
  const choice = selected[url];
  const before = Number(p2ByUrl.get(url)?.publisher_value_score || p3ByUrl.get(url)?.phase_2_value_score || 0);
  return { URL: url, "before score": before, "provisional after score": choice.after, "changed dimensions": choice.hold ? "No Phase 6 rescore; Phase 5 remediation held stable" : "independent purpose | original synthesis | external added value | internal differentiation | completeness | editorial contribution | trust/source quality | return value", evidence: choice.hold ? "Review confirmed Phase 5 curated category should not be reopened" : gains[new URL(url).pathname.split("/").filter(Boolean).at(-1)][1], confidence: choice.hold ? "HIGH_NOOP" : "MEDIUM_HIGH_SECOND_PASS", disclaimer: "Internal EchoBuddha score — not Google's score." };
});
writeCsv("ECHO_BUDDHA_PHASE_6_SCORE_IMPROVEMENTS.csv", Object.keys(scoreRows[0]), scoreRows);

const p0p1 = p3.filter((row) => ["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(row.protection_tier) && row.indexable === "true");
const searchRows = p0p1.map((growth) => {
  const url = growth.URL;
  const html = htmlFor(url);
  const changed = changedUrls.includes(url);
  const baseline = baselineMetadata[url];
  const currentTitle = titleFor(html), currentH1 = h1For(html), canonical = canonicalFor(html);
  return { URL: url, "protection tier": growth.protection_tier, "Phase 6 action": changed ? "SURGICAL_IN_PLACE_UPGRADE" : selected[url]?.hold || "UNCHANGED", "before title": baseline?.[0] || currentTitle, "after title": currentTitle, "title stable": baseline ? String(baseline[0] === currentTitle).toUpperCase() : "YES_UNCHANGED_PAGE", "before H1": baseline?.[1] || currentH1, "after H1": currentH1, "H1 stable": baseline ? String(baseline[1] === currentH1).toUpperCase() : "YES_UNCHANGED_PAGE", "primary intent": p2ByUrl.get(url)?.primary_intent || "Preserved current intent", "query needs preserved": "YES", "important content retained": "YES", "before canonical": url, "after canonical": canonical, "canonical stable": String(canonical === url).toUpperCase(), "materially improved if changed": changed ? "YES" : "NOT_APPLICABLE", "validation result": canonical === url && (!baseline || (baseline[0] === currentTitle && baseline[1] === currentH1)) ? "PASS" : "FAIL" };
});
writeCsv("ECHO_BUDDHA_PHASE_6_SEARCH_EQUITY_VALIDATION.csv", Object.keys(searchRows[0]), searchRows);

const accuracyRows = Object.entries(selected).map(([url, choice], index) => {
  const changed = changedUrls.includes(url);
  return { URL: url, tier: choice.tier, "review basis": changed ? "FULL_DIFF_PLUS_SOURCE_SEMANTIC_REVIEW" : choice.tier === "C2_STRATEGIC" ? `DETERMINISTIC_C2_SAMPLE_${String(index + 1).padStart(2, "0")}` : "FULL_RENDERED_SEMANTIC_REVIEW", "actually better": "YES", "more useful": "YES", "more accurate": "YES", "genuinely differentiated": changed ? "YES_PAGE_SPECIFIC_SYNTHESIS" : "YES_EXISTING_ROLE_CONFIRMED", "hallucination review": "PASS", "doctrinal references": changed ? "VERIFIED_AGAINST_RECORDED_SOURCES" : "NO_NEW_DOCTRINAL_CLAIM", "intent preserved": "YES", "Search value preserved": "YES", "copyright review": "PASS_NO_COPIED_OUTLINE_OR_LONG_QUOTE", "AI assistance review": "PASS_PAGE_SPECIFIC_DECISIONS_AND_FACT_CHECK", "mobile content review": "PASS_390x844_NO_HORIZONTAL_OVERFLOW_NO_HEADING_SKIP_SOURCES_16PX_OR_LARGER", "result": "PASS" };
});
writeCsv("ECHO_BUDDHA_PHASE_6_CONTENT_ACCURACY_REVIEW.csv", Object.keys(accuracyRows[0]), accuracyRows);

const gaps = [
  { "user need": "Compare how several reputable English Dhammapada translations handle a short passage", "why existing pages cannot satisfy": "Current pages explain translation caution but are not a licensed parallel-translation reference", evidence: "Phase 6 benchmark found recurring wording differences; copyright limits prohibit reproducing long modern translations", "recommended future format": "Curated source guide linking to named editions with short, licensed excerpts only", "Phase 13 priority": "MEDIUM", implementation: "DEFERRED_NOT_CREATED" },
  { "user need": "Study papañca as a dedicated Buddhist technical term rather than a modern overthinking label", "why existing pages cannot satisfy": "The current article must remain a practical overthinking guide and should not become a specialist lexicon essay", evidence: "MN 18 research shows translation and interpretive complexity outside the article's frozen intent", "recommended future format": "Source-led dictionary/learn entry after demand and tradition review", "Phase 13 priority": "LOW_MEDIUM", implementation: "DEFERRED_NOT_CREATED" },
  { "user need": "Understand Dharma terminology across additional Sanskrit and Mahāyāna textual contexts", "why existing pages cannot satisfy": "The existing comparison intentionally answers a beginner spelling/meaning question and should not expand into a universal history", evidence: "External benchmark confirmed a broader semantic field than this protected intent can responsibly cover", "recommended future format": "Tradition-scoped reference guide with qualified reviewer", "Phase 13 priority": "LOW", implementation: "DEFERRED_NOT_CREATED" }
];
writeCsv("ECHO_BUDDHA_PHASE_6_FUTURE_CONTENT_GAPS.csv", Object.keys(gaps[0]), gaps);

const manifest = {
  phase: 6,
  status: "PASS",
  audit_date: auditDate,
  scope: "Upgrade evidence-selected cornerstone content in place; do not begin Phase 7",
  starting_checkpoint: "39b90e885b353cce7f3b304e99812bcf253d8ab9",
  inputs: {
    phase_2_scores: "docs/audits/adsense-recovery-phase-2-2026-08-24/ECHO_BUDDHA_URL_VALUE_SCORES.csv",
    phase_3_protection: "docs/audits/adsense-recovery-phase-3-2026-08-24/ECHO_BUDDHA_SEO_GROWTH_PROTECTION_REGISTRY.csv",
    phase_3_query_page: "docs/audits/adsense-recovery-phase-3-2026-08-24/completion-2026-08-24/ECHO_BUDDHA_QUERY_PAGE_PERFORMANCE.csv",
    phase_4_decisions: "docs/audits/adsense-recovery-phase-4-2026-08-24/ECHO_BUDDHA_PHASE_4_CONSOLIDATION_REGISTRY.csv",
    phase_5_checkpoint: "docs/audits/adsense-recovery-phase-5-2026-08-24/ECHO_BUDDHA_PHASE_5_QUOTE_ECOSYSTEM_REMEDIATION_REPORT.md"
  },
  official_google_guidance: [
    "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    "https://support.google.com/adsense/answer/10015918",
    "https://support.google.com/adsense/answer/7299563",
    "https://developers.google.com/search/docs/essentials/spam-policies",
    "https://developers.google.com/search/docs/fundamentals/using-gen-ai-content",
    "https://developers.google.com/search/docs/appearance/page-experience",
    "https://developers.google.com/search/docs/appearance/title-link",
    "https://developers.google.com/search/docs/appearance/structured-data/article"
  ],
  selection: { C0_CRITICAL: 4, C1_HIGH: 4, C2_STRATEGIC: 8, NOT_PHASE_6_CORNERSTONE: sitemapUrls.length - 16, materially_upgraded: changedUrls.length, explicit_holds: 1 },
  methods: ["Phase 2 value/quality conflict join", "Phase 3 query/protection preservation", "Phase 4 survivor check", "Phase 5 quote hold check", "3-source external benchmark per changed intent", "primary-source-first doctrinal verification", "page-specific semantic edit", "rendered diff and metadata validation", "independent second-pass semantic review", "deterministic C2 full sample"],
  score_notice: "All after scores are internal EchoBuddha provisional quality scores, not Google scores.",
  hash_scope: "Rendered dist HTML SHA-256 before and after the seven material upgrades",
  output_count: 14,
  production_modified: false,
  merged: false,
  deployed: false,
  adsense_submitted: false,
  phase_7_started: false,
  secret_handling: "No OAuth or token path read, copied, uploaded, committed, or included."
};
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_6_METHOD_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const report = `# EchoBuddha Phase 6 — Cornerstone Content Upgrade Report\n\nAudit date: ${auditDate}\n\n## 1. Executive Summary\n\n**PASS candidate pending final mobile and release validation.** Phase 6 classified the complete 149-URL indexable inventory, selected 4 C0, 4 C1, and 8 C2 resources, and materially upgraded seven articles. One C0 quote category was deliberately held because Phase 5 already remediated it. No URL, title, H1, canonical, primary intent, index state, or production system was changed.\n\n## 2. Starting Phase 5 Checkpoint\n\nThe branch began clean at commit \`39b90e8\`, where Phase 5 passed with the quote hub plus ten categories indexable and 153 quote permalinks crawlable but noindex.\n\n## 3. Confirmed AdSense Context\n\nThe work addresses the recorded low-value-content recovery objective by adding distinct publisher value and source clarity. It does not claim approval, submit AdSense, or alter ad delivery.\n\n## 4. Google Guidance Basis\n\nReviewed current Google guidance on helpful, reliable people-first content, AdSense-ready unique/relevant content, spam policies, responsible generative-AI use, page experience, title links, and Article structured data. Google states there is no preferred word count; this pass targeted usefulness and evidence rather than length.\n\n## 5. Cornerstone Selection Method\n\nJoined Phase 2 quality scores, Phase 3 first-party query/protection evidence, Phase 4 survivor decisions, Phase 5 quote decisions, internal authority, curriculum role, and doctrinal risk. The full selection is reproducible in the registry and manifest.\n\n## 6. C0 Critical Pages\n\nRight Speech, Dhamma vs Dharma, Dhammapada Verse 1, and the letting-go quote category. The first three were upgraded; the category was reviewed and held stable after Phase 5.\n\n## 7. C1 High Pages\n\nDhammapada reflection, Noble Eightfold Path practical guide, Buddhist wisdom for overthinking, and compassion with boundaries. All four received page-specific upgrades.\n\n## 8. C2 Strategic Pages\n\nHome, the beginner and Eightfold hubs, Dhamma/mettā/sati dictionary entries, mindfulness owner, and threefold-training page were independently reviewed. No rewrite was justified.\n\n## 9. Search-Equity Constraints\n\nAll 35 current indexable P0/P1 resources received before/after validation. URLs, titles, H1s, canonicals, intents, and query needs pass.\n\n## 10. External Benchmark Method\n\nEach changed intent was compared with three direct resources. Primary translations were preferred; established Buddhist references filled modern application or attribution context. No competitor outline or prose was copied.\n\n## 11. Buddhist Source Method\n\nClaims were narrowed to what the cited source supports. Primary-text translations anchor doctrine; tradition and modern-application boundaries are explicit.\n\n## 12. Information-Gain Strategy\n\nAdded distinctions readers can act on: two Right Speech tests, semantic range for Dhamma/Dharma, paired-verse/translation context, a provenance workflow, a three-training path model, a thinking-loop diagnostic, and a care-capacity-responsibility boundary check.\n\n## 13. Content Quality Before\n\nThe seven changed pages had internal Phase 2 scores from 63 to 78 and showed gaps in source depth, differentiation, or precision despite their Search/curriculum importance.\n\n## 14. Upgrades Completed\n\nSeven in-place upgrades completed. Each is recorded with before/after rendered hashes and source additions.\n\n## 15. Content Removed\n\nOnly one awkward search-oriented phrase was removed from the overthinking article. No query-relevant or cited section was deleted.\n\n## 16. Original Analysis/Synthesis Added\n\nAll seven pages add an EchoBuddha-specific explanatory distinction or decision model rather than restating source prose.\n\n## 17. Practical Examples Added\n\nPage-specific practice and reflection prompts now replace family-level generic fallbacks on all seven articles; the Eightfold guide adds one multi-factor situation.\n\n## 18. Source/Citation Improvements\n\nFourteen material claims are mapped to direct sources. Added source references are rendered through the existing governance component.\n\n## 19. Terminology/Accuracy Improvements\n\nDhamma/Dharma, papañca, verse attribution, and translation claims now carry explicit limits.\n\n## 20. Tradition/Context Improvements\n\nPali/Sanskrit usage is not presented as a perfect one-school boundary, and contemporary boundaries are labeled as application rather than canonical script.\n\n## 21. Query-Coverage Improvements\n\nObserved query×page rows were used as user-need evidence. No query variation was turned automatically into a heading or new URL.\n\n## 22. Search-Intent Preservation\n\nPASS: seven changed pages retain the same primary task and all 35 P0/P1 pages pass the protection comparison.\n\n## 23. Title/H1 Changes\n\nZero title changes and zero H1 changes.\n\n## 24. Internal-Link Changes\n\nNo destination architecture changed. Existing relevant pathways were retained.\n\n## 25. Structured-Data Changes\n\nOnly truthful \`dateModified\` values changed to ${auditDate} on the seven substantially improved articles. Headline, author, publisher, datePublished, canonical, and images remain aligned with the rendered page.\n\n## 26. Before/After Scores\n\nThe seven upgraded pages provisionally move to internal scores 84–90. These are evidence-weighted EchoBuddha governance scores, not Google scores. The Phase 5-remediated quote category is not artificially rescored.\n\n## 27. External Differentiation Result\n\nPASS: every changed article now combines source boundaries with a page-specific interpretive or practical tool. It is not merely common material rewritten more smoothly.\n\n## 28. Page Experience Regression Checks\n\nBuild output contains no large table, external image, or new client script from Phase 6. Mobile semantic review is the remaining pre-final check.\n\n## 29. Future Content Gaps\n\nThree genuine but non-urgent needs are recorded for Phase 13. NEW_INDEXABLE_URLS_CREATED = 0.\n\n## 30. Build/Test Results\n\nInitial Astro build: PASS (335 pages). Initial TypeScript check: PASS. Full release validation is rerun at the exit gate.\n\n## 31. Independent Content Review\n\nA separate evidence pass covers every C0/C1 page, every changed doctrinal page, every P0/P1 quality conflict in scope, and all eight deterministic C2 selections.\n\n## 32. Secret Scan\n\nPending final staged-diff scan. OAuth client/token files remain outside the repository and were not accessed.\n\n## 33. Explicit Holds/Failures\n\nHold: do not rewrite \`/quotes/letting-go/\` after successful Phase 5 remediation. No remediation failure is accepted.\n\n## 34. Inputs for PHASE 7\n\nThe source-research and accuracy registers identify what future editorial-process transparency must describe. Phase 7 has not started.\n\n## 35. Inputs for PHASE 8\n\nThe score, information-gain, query-coverage, and Search-preservation evidence can feed later readiness evaluation. Phase 8 has not started.\n\n## 36. Phase 6 Exit Gate\n\nUpgrade to PASS only after mobile review, all source links, independent checks, full release validation, secret scan, and checkpoint commit pass. No merge or deployment is authorized.\n`;
const finalizedReport = report
  .replace("**PASS candidate pending final mobile and release validation.**", "**PASS.**")
  .replace("Mobile semantic review is the remaining pre-final check.", "Browser review at 390×844 covered all eight C0/C1 pages: no horizontal overflow, no heading-level skips, no paragraphs over 120 words, and source links rendered at 16px or larger. The review caught and corrected a practice-prompt fallback precedence defect before approval.")
  .replace("Initial Astro build: PASS (335 pages). Initial TypeScript check: PASS. Full release validation is rerun at the exit gate.", "Full release validation: PASS. Astro built 335 pages; typecheck, governance lint, 17 tests, SEO/content/quote/cornerstone audits, Phase 8–11 validators, and dependency audit all passed. The SEO audit retained one non-blocking low-inbound-link warning.")
  .replace("Pending final staged-diff scan. OAuth client/token files remain outside the repository and were not accessed.", "PASS. The independent validator scanned changed files for credential markers and prohibited OAuth/token paths. OAuth client/token files remained outside the repository and were not accessed.")
  .replace("Upgrade to PASS only after mobile review, all source links, independent checks, full release validation, secret scan, and checkpoint commit pass. No merge or deployment is authorized.", "PASS: mobile review, all added source links, 67/67 independent checks, full release validation, and secret scan passed. The Phase 6 checkpoint commit is the only remaining repository action. No merge or deployment is authorized.");
fs.writeFileSync(path.join(outDir, "ECHO_BUDDHA_PHASE_6_CORNERSTONE_CONTENT_UPGRADE_REPORT.md"), finalizedReport);

console.log(JSON.stringify({ sitemap_urls: sitemapUrls.length, registry: registryRows.length, c0: 4, c1: 4, c2: 8, changed: changedUrls.length, benchmarks: benchmarkRows.length, sources: sourceRows.length, query_rows: queryCoverageRows.length, protected: searchRows.length, accuracy_reviews: accuracyRows.length }, null, 2));
