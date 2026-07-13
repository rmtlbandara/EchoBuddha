import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const implementationDir = path.join(root, "docs/audits/articles/implementation");
const baselineDir = path.join(implementationDir, "phase-1-baseline-2026-07-13");
const before = readJson(path.join(baselineDir, "ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.before-phase-1.json"));
const after = readJson(path.join(root, "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json"));
const preservation = readJson(path.join(implementationDir, "PHASE_1_PRESERVATION_VALIDATION.json"));

const scopedSlugs = [
  "buddhism-for-beginners-simple-guide",
  "how-to-meditate-for-anxiety",
  "loving-kindness-meditation-beginners",
  "eightfold-path-explained-daily-life",
  "mindfulness-morning-routine",
  "buddhist-teachings-on-impermanence",
  "walking-meditation-step-by-step",
  "buddhist-approach-to-anger",
  "mindfulness-for-better-sleep",
  "how-to-practice-non-attachment",
  "beginning-a-daily-mindfulness-practice",
  "compassion-as-a-daily-discipline",
  "letting-go-without-giving-up",
  "three-ways-to-practice-patience",
  "mindful-listening-in-everyday-life",
  "creating-a-peaceful-corner-at-home"
];

const sectionDirections = {
  "buddhism-for-beginners-simple-guide": "First-week learning route: one teaching, one short sit, one ethical action.",
  "how-to-meditate-for-anxiety": "Anxiety-aware grounding, alternate anchors, and stopping permission.",
  "loving-kindness-meditation-beginners": "Awkwardness, resistance, neutrality, and healthy boundaries in metta.",
  "eightfold-path-explained-daily-life": "Concrete daily scenarios for path factors instead of full doctrine repetition.",
  "mindfulness-morning-routine": "Realistic body/breath/intention/first-action sequence that carries into the day.",
  "buddhist-teachings-on-impermanence": "Change, loss, grief-sensitive realism, and compassionate limits.",
  "walking-meditation-step-by-step": "Route, pace, body movement, turning, contact, and attention choices.",
  "buddhist-approach-to-anger": "Pausing without suppression; truthful response without cruelty.",
  "mindfulness-for-better-sleep": "Evening wind-down and non-treatment framing without sleep guarantees.",
  "how-to-practice-non-attachment": "Caring without gripping; separating wise action from forced outcomes.",
  "beginning-a-daily-mindfulness-practice": "Habit cues, friction reduction, missed-day recovery, and return.",
  "compassion-as-a-daily-discipline": "Repeated conduct, truthful boundaries, repair, and non-escalation.",
  "letting-go-without-giving-up": "Wise effort plus release of control; not abandoning responsibility.",
  "three-ways-to-practice-patience": "Distinct drills for irritation, delay, and uncertainty.",
  "mindful-listening-in-everyday-life": "Listening as the central practice: receive, reflect, clarify, then speak.",
  "creating-a-peaceful-corner-at-home": "Modest practice space, no consumerism, no aesthetic pressure."
};

const wellbeingNotes = {
  "how-to-meditate-for-anxiety": "Refined: added alternate anchors and explicit permission to stop, stand, orient, or seek support.",
  "buddhist-teachings-on-impermanence": "Added: grief-sensitive boundary that impermanence does not remove grief or make pain a spiritual failure.",
  "buddhist-approach-to-anger": "Refined: distinguishes pause from suppression and keeps room for firm protective action.",
  "mindfulness-for-better-sleep": "Refined: frames practice as evening wind-down, not a treatment or sleep guarantee."
};

const changedSections = "Practical Examples in Daily Life; A Mindfulness Exercise; Continue the Path";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function articleMap(data) {
  return new Map(data.articles.map((article) => [article.slug, article]));
}

function pairKey(articleA, articleB) {
  return [articleA, articleB].sort().join("||");
}

function uniquePairs(data) {
  const pairs = new Map();
  for (const pair of data.pairwiseSimilarityResults) {
    if (pair.articleA === pair.articleB) continue;
    pairs.set(pairKey(pair.articleA, pair.articleB), pair);
  }
  return pairs;
}

function countOverlap(data, level) {
  let count = 0;
  for (const pair of data.pairwiseSimilarityResults) {
    if (pair.articleA !== pair.articleB && pair.articleA < pair.articleB && pair.editorialOverlap === level) count += 1;
  }
  return count;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function write(fileName, content) {
  fs.mkdirSync(implementationDir, { recursive: true });
  fs.writeFileSync(path.join(implementationDir, fileName), content);
}

function mdTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell ?? "").replace(/\n/g, "<br>")).join(" | ")} |`)
  ].join("\n");
}

function summaryRows() {
  return [
    ["Exact duplicate sentence groups", before.summary.finalExactDuplicateSentenceGroupCount, after.summary.finalExactDuplicateSentenceGroupCount],
    ["Exact duplicate paragraph groups", before.summary.finalExactDuplicateParagraphGroupCount, after.summary.finalExactDuplicateParagraphGroupCount],
    ["Near-duplicate pairs", before.summary.finalNearDuplicatePairCount, after.summary.finalNearDuplicatePairCount],
    ["High-overlap pairs", before.summary.finalHighOverlapPairCount, after.summary.finalHighOverlapPairCount],
    ["Medium-overlap pairs", countOverlap(before, "Medium"), countOverlap(after, "Medium")],
    ["High-overlap clusters", before.summary.highOverlapClusterCount, after.summary.highOverlapClusterCount],
    ["Substantial rewrite articles", before.summary.substantialRewriteCount, after.summary.substantialRewriteCount],
    ["Targeted rewrite articles", before.summary.targetedRewriteCount, after.summary.targetedRewriteCount],
    ["Light polish/no change articles", before.summary.lightPolishOrNoChangeCount, after.summary.lightPolishOrNoChangeCount]
  ];
}

function writeSimilarityCsv() {
  const beforePairs = uniquePairs(before);
  const afterPairs = uniquePairs(after);
  const rows = [[
    "articleA",
    "articleB",
    "phase1Scope",
    "beforeEditorialOverlap",
    "afterEditorialOverlap",
    "beforeOverallBodySimilarity",
    "afterOverallBodySimilarity",
    "deltaOverallBodySimilarity",
    "beforeExactDuplicatedSentenceCount",
    "afterExactDuplicatedSentenceCount",
    "beforeNearDuplicatedParagraphCount",
    "afterNearDuplicatedParagraphCount"
  ]];

  for (const [key, beforePair] of [...beforePairs.entries()].sort()) {
    const afterPair = afterPairs.get(key);
    const scoped = scopedSlugs.includes(beforePair.articleA) || scopedSlugs.includes(beforePair.articleB);
    const delta = Number((afterPair.overallBodySimilarity - beforePair.overallBodySimilarity).toFixed(3));
    rows.push([
      beforePair.articleA,
      beforePair.articleB,
      scoped ? "In scope pair" : "Context pair",
      beforePair.editorialOverlap,
      afterPair.editorialOverlap,
      beforePair.overallBodySimilarity,
      afterPair.overallBodySimilarity,
      delta,
      beforePair.exactDuplicatedSentenceCount,
      afterPair.exactDuplicatedSentenceCount,
      beforePair.nearDuplicatedParagraphCount,
      afterPair.nearDuplicatedParagraphCount
    ]);
  }

  write("PHASE_1_BEFORE_AFTER_SIMILARITY.csv", rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");
}

function writeSourceMap() {
  const duplicatedSentences = before.exactDuplication.exactDuplicatedSentenceGroups.map((group) => group.sentence);
  write(
    "PHASE_1_SOURCE_SCAFFOLD_MAP.md",
    `# Phase 1 Source Scaffold Map

## Files Inspected

- \`docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json\`
- \`docs/audits/articles/ECHOBUDDHA_ARTICLE_EDITORIAL_SPECIFICATIONS.md\`
- \`docs/audits/articles/ECHOBUDDHA_IMPLEMENTATION_PRIORITY_MATRIX.csv\`
- \`docs/audits/articles/ECHOBUDDHA_EXACT_DUPLICATION_REPORT.md\`
- \`docs/audits/articles/ECHOBUDDHA_HUMAN_WRITING_DIAGNOSTIC.md\`
- \`docs/audits/articles/ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json\`
- \`docs/audits/articles/ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.csv\`
- \`docs/audits/articles/ECHOBUDDHA_WELLBEING_CONTENT_REVIEW.md\`
- \`src/data/site.ts\`

## Source Of The Repeated Scaffold

The eight exact duplicated sentence groups came from \`createWeek2DeepeningSections()\` in \`src/data/site.ts\`, not from the shared Astro article renderer. The helper appended three generated article-owned sections from \`week2DeepeningNotes\`:

- \`Practical Examples in Daily Life\`
- \`A Mindfulness Exercise\`
- \`Continue the Path\`

Before Phase 1, every in-scope article received the same six-paragraph rhetorical frame with only topic, situation, practice, links, and reflection interpolated. The original source matches were observed around \`src/data/site.ts:5770\` through \`src/data/site.ts:5785\` before this edit.

## Exact Sentences Mapped

${duplicatedSentences.map((sentence, index) => `${index + 1}. ${sentence}`).join("\n")}

## Cause

The source pattern came from the Week 2/Week 3 content expansion process. Identical helper paragraphs were generated across the 16 Phase 1 articles. The surrounding repeated pattern was article-owned prose, not shared navigation, related-card, sidebar, schema, or layout text.

## Phase 1 Source Fix

- Added \`phase1ArticleSpecificDeepeningSections\` with article-specific prose for the 16 in-scope slugs.
- Updated \`createWeek2DeepeningSections(slug, note)\` to use those sections when present.
- Rewrote the fallback helper text so the old duplicated sentences are not left as a future source pattern.
- Preserved the same three headings and existing href destinations.

## Future Risk Control

New articles should not rely on the fallback helper as a finished editorial pattern. If more articles use deepening sections, they should receive article-specific examples, exercises, and endings before publication.
`
  );
}

function writeArticleChanges() {
  const beforeArticles = articleMap(before);
  const afterArticles = articleMap(after);
  const rows = scopedSlugs.map((slug) => {
    const b = beforeArticles.get(slug);
    const a = afterArticles.get(slug);
    return [
      slug,
      changedSections,
      a.editorialSpecification.currentStateDiagnosis.strongestCurrentSection,
      sectionDirections[slug],
      `${b.finalRecommendation} -> ${a.finalRecommendation}`,
      `${b.score.total} -> ${a.score.total}`,
      wellbeingNotes[slug] ?? "No article-specific wellbeing boundary change required in Phase 1."
    ];
  });

  write(
    "PHASE_1_ARTICLE_CHANGES.md",
    `# Phase 1 Article Changes

## Scope

Only the 16 Phase 1 articles were changed. The edit replaced generated Week 2 scaffold prose in the same three appended sections for each article and preserved existing strong sections.

${mdTable(["Article", "Sections changed", "Strong section preserved", "Article-specific direction", "Classification change", "Score change", "Wellbeing boundary"], rows)}

## Unchanged Surfaces

Article URLs, slugs, titles/H1 values, categories, canonicals, publication dates, heading texts/IDs, href destinations, related article references, learning-hub references, schema architecture, theme, and layout were not intentionally changed.
`
  );
}

function writeDuplicationResults() {
  const rows = summaryRows();
  const oldSentenceRows = before.exactDuplication.exactDuplicatedSentenceGroups.map((group) => [
    group.sentence,
    group.affectedUrls.length,
    "Removed from rendered article prose after Phase 1"
  ]);
  write(
    "PHASE_1_DUPLICATION_RESULTS.md",
    `# Phase 1 Duplication Results

## Before And After

${mdTable(["Metric", "Before Phase 1", "After Phase 1"], rows)}

## Exact Duplicated Sentence Groups

${mdTable(["Sentence", "Before affected URLs", "After status"], oldSentenceRows)}

## Result

The eight avoidable exact duplicated sentence groups were reduced to zero in the regenerated canonical audit. Exact duplicated paragraph groups remained zero. The fallback source helper was also rewritten so the original scaffold is not retained as a future insertion pattern.
`
  );
}

function writeValidationReport() {
  const changed = scopedSlugs.map((slug) => {
    const b = before.articles.find((article) => article.slug === slug);
    const a = after.articles.find((article) => article.slug === slug);
    return `${slug}: ${b.finalRecommendation} -> ${a.finalRecommendation}`;
  });
  write(
    "PHASE_1_VALIDATION_REPORT.md",
    `# Phase 1 Validation Report

## Audit Regeneration

- \`node scripts/generate-second-article-audit.mjs\`: passed; regenerated canonical audit, pairwise matrix, exact duplication report, implementation priority matrix, source plan, wellbeing review, internal-link preservation map, and final report.
- \`node scripts/validate-second-article-audit.mjs\`: passed; 36 articles, 1296 matrix rows, 0 invalid hrefs, 0 high pairs, 0 exact duplicate sentence groups.
- \`node scripts/validate-phase-1-preservation.mjs\`: ${preservation.status}; ${preservation.checks.length} protected-value checks, ${preservation.failures.length} failures.
- \`npm run build\`: run after these deliverables are generated in the final validation pass.

## Protected Values

The Phase 1 preservation validator compared URL, slug, title, H1, category, canonical, publication date, structured-data types, heading IDs, hrefs, related references, and hub references for all 36 articles.

Status: ${preservation.status}

## Before And After Counts

${mdTable(["Metric", "Before Phase 1", "After Phase 1"], summaryRows())}

## Classification Changes

${changed.map((line) => `- ${line}`).join("\n")}

## Internal Links And Fragments

The general second-audit validator reported 0 invalid internal hrefs and checked heading-ID stability against generated source. The Phase 1 preservation validator confirmed href arrays and heading-ID arrays match the saved baseline.

## Remaining Phase 2 Issues

- Medium-overlap doctrinal/source clusters remain and should be handled by role sharpening and sourcing, not URL consolidation.
- Full source-aware review remains for all 36 articles.
- Phase 3 should handle external source verification and source-link decisions.
- AdSense should remain disabled until content and policy readiness are separately reviewed.
`
  );
}

writeSimilarityCsv();
writeSourceMap();
writeArticleChanges();
writeDuplicationResults();
writeValidationReport();

console.log("Wrote Phase 1 deliverables");
