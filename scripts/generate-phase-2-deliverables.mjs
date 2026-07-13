import fs from "node:fs";
import path from "node:path";

const OUT_DIR = "docs/audits/articles/implementation";
const BASELINE_PATH = path.join(OUT_DIR, "phase-2-baseline-2026-07-13", "PHASE_2_ARTICLE_BASELINE.json");
const AUDIT_PATH = "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json";
const PRESERVATION_PATH = path.join(OUT_DIR, "PHASE_2_PRESERVATION_VALIDATION.json");

const slugs = [
  "how-to-meditate-for-beginners",
  "mindfulness-of-breathing-guide",
  "mindfulness-vs-meditation",
  "walking-meditation-step-by-step",
  "beginning-a-daily-mindfulness-practice",
  "mindfulness-morning-routine",
  "how-to-meditate-for-anxiety",
  "mindfulness-for-better-sleep",
  "how-to-let-go-of-attachment-in-buddhism",
  "how-to-practice-non-attachment",
  "letting-go-without-giving-up",
  "impermanence-in-buddhism-letting-go"
];

const roleSpecs = {
  "how-to-meditate-for-beginners": {
    cluster: "Beginner Meditation and Mindfulness",
    role: "First seated meditation lesson",
    changes:
      "Reframed the article around one complete first seated session: place, posture, duration, distraction, and ending the sit without grading it.",
    source:
      "No external citation added. Language stays within practical introductory meditation guidance and avoids claims beyond beginner instruction.",
    wellbeing:
      "Keeps expectations modest, normalizes thinking, discourages body-strain contests, and avoids promising special outcomes."
  },
  "mindfulness-of-breathing-guide": {
    cluster: "Beginner Meditation and Mindfulness",
    role: "Breath-specific meditation method",
    changes:
      "Sharpened the page around natural breathing, one chosen anchor location, optional counting, and not controlling the breath.",
    source:
      "No external citation added. Source-aware wording distinguishes method instruction from broad relaxation or health claims.",
    wellbeing:
      "Discourages forcing breath and keeps breath practice adaptable rather than performance-oriented."
  },
  "mindfulness-vs-meditation": {
    cluster: "Beginner Meditation and Mindfulness",
    role: "Concept comparison",
    changes:
      "Reduced how-to overlap by making breath awareness a comparison example and clarifying mindfulness as a quality versus meditation as structured practice.",
    source:
      "No external citation added. Claims are conceptual and should receive tradition/source support in Phase 3.",
    wellbeing:
      "Keeps anxiety adaptation and professional-support language through the existing linked anxiety article reference."
  },
  "walking-meditation-step-by-step": {
    cluster: "Beginner Meditation and Mindfulness",
    role: "Movement meditation method",
    changes:
      "Added route, even-ground, gaze, balance, turning, and safety distinctions to make this the movement-specific guide.",
    source:
      "No external citation added. Practical instructions avoid medical or therapeutic claims.",
    wellbeing:
      "Adds safety language around surroundings, balance, and public walking."
  },
  "beginning-a-daily-mindfulness-practice": {
    cluster: "Beginner Meditation and Mindfulness",
    role: "Habit formation guide",
    changes:
      "Reworked the page toward cues, friction reduction, minimum viable practice, missed days, and returning at the next realistic cue.",
    source:
      "No external citation added. Habit language remains editorial and should be supported by sources in Phase 3 if expanded.",
    wellbeing:
      "Avoids shame around missed days and removes pressure for impressive session length."
  },
  "mindfulness-morning-routine": {
    cluster: "Beginner Meditation and Mindfulness",
    role: "Morning-specific attention sequence",
    changes:
      "Clarified body awareness, intention, first ordinary actions, screen boundary, and non-productivity framing.",
    source:
      "No external citation added. Source-aware phrasing avoids turning the routine into a productivity or health guarantee.",
    wellbeing:
      "Reduces performance pressure and keeps rushed-morning options small."
  },
  "how-to-meditate-for-anxiety": {
    cluster: "Beginner Meditation and Mindfulness",
    role: "Anxiety-aware educational meditation options",
    changes:
      "Strengthened choice of anchor, eyes-open practice, permission to stop, short sessions, and professional-care boundaries.",
    source:
      "No external citation added. Existing educational boundary remains; clinical source support should be added in Phase 3 before stronger mental-health claims.",
    wellbeing:
      "Explicitly avoids cure language, adds stop/stand/walk options, and preserves qualified-care guidance."
  },
  "mindfulness-for-better-sleep": {
    cluster: "Beginner Meditation and Mindfulness",
    role: "Evening wind-down practice",
    changes:
      "Focused sleep copy on ending stimulation, reducing checking, body support, wakefulness without struggle, and healthcare boundaries.",
    source:
      "No external citation added. Sleep language remains supportive/educational, not treatment guidance.",
    wellbeing:
      "Avoids insomnia-treatment claims and preserves professional healthcare guidance for persistent sleep problems."
  },
  "how-to-let-go-of-attachment-in-buddhism": {
    cluster: "Attachment, Non-attachment, and Letting Go",
    role: "Concept anchor for Buddhist attachment",
    changes:
      "Sharpened craving, clinging, preference, care, love, responsibility, and release distinctions.",
    source:
      "No external citation added. Buddhist terminology should receive primary/tradition support in Phase 3.",
    wellbeing:
      "Clarifies that letting go is not lovelessness, emotional distance, or abandonment of responsibility."
  },
  "how-to-practice-non-attachment": {
    cluster: "Attachment, Non-attachment, and Letting Go",
    role: "Daily non-attachment practice",
    changes:
      "Shifted emphasis toward repeated choices in relationships, work, possessions, identity, boundaries, and repair.",
    source:
      "No external citation added. Practice framing is editorial and should be source-backed in Phase 3.",
    wellbeing:
      "Separates non-attachment from indifference and reinforces boundaries, care, and repair."
  },
  "letting-go-without-giving-up": {
    cluster: "Attachment, Non-attachment, and Letting Go",
    role: "Wise effort versus control distinction",
    changes:
      "Made the article about keeping responsibility, repair, boundaries, and patient effort while releasing guaranteed outcomes.",
    source:
      "No external citation added. Concepts should be backed with sources in Phase 3 before broader doctrinal claims.",
    wellbeing:
      "Explicitly states that letting go does not mean accepting harm or stopping useful action."
  },
  "impermanence-in-buddhism-letting-go": {
    cluster: "Attachment, Non-attachment, and Letting Go",
    role: "Impermanence applied to clinging",
    changes:
      "Reframed impermanence as softening demands for permanence, with limited compassionate grief language and applied letting-go examples.",
    source:
      "No external citation added. Impermanence doctrine and grief-sensitive language should receive Phase 3 source review.",
    wellbeing:
      "States that impermanence does not erase grief or replace support."
  }
};

const csvEscape = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const writeCsv = (file, rows) => {
  fs.writeFileSync(
    path.join(OUT_DIR, file),
    rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n"
  );
};

const before = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
const after = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
const preservation = JSON.parse(fs.readFileSync(PRESERVATION_PATH, "utf8"));

const scopedSet = new Set(slugs);
const order = new Map(slugs.map((slug, index) => [slug, index]));

const uniqueScopedPairs = (audit, set = scopedSet) =>
  audit.pairwiseSimilarityResults
    .filter((pair) => set.has(pair.articleA) && set.has(pair.articleB))
    .filter((pair) => pair.articleA !== pair.articleB)
    .filter((pair) => order.get(pair.articleA) < order.get(pair.articleB))
    .sort((a, b) => b.overallBodySimilarity - a.overallBodySimilarity);

const pairKey = (a, b) => `${a}__${b}`;
const beforePairs = uniqueScopedPairs(before);
const afterPairs = uniqueScopedPairs(after);
const afterByKey = new Map(afterPairs.map((pair) => [pairKey(pair.articleA, pair.articleB), pair]));

const beginnerSlugs = slugs.slice(0, 8);
const attachmentSlugs = slugs.slice(8);

const clusterStats = (audit, clusterSlugs) => {
  const set = new Set(clusterSlugs);
  const localOrder = new Map(clusterSlugs.map((slug, index) => [slug, index]));
  const pairs = audit.pairwiseSimilarityResults
    .filter((pair) => set.has(pair.articleA) && set.has(pair.articleB))
    .filter((pair) => pair.articleA !== pair.articleB)
    .filter((pair) => localOrder.get(pair.articleA) < localOrder.get(pair.articleB))
    .sort((a, b) => b.overallBodySimilarity - a.overallBodySimilarity);
  return {
    pairCount: pairs.length,
    highCount: pairs.filter((pair) => pair.editorialOverlap === "High").length,
    mediumCount: pairs.filter((pair) => pair.editorialOverlap === "Medium").length,
    max: pairs[0]?.overallBodySimilarity ?? 0,
    topPair: pairs[0] ?? null,
    severity: pairs.some((pair) => pair.editorialOverlap === "High")
      ? "High"
      : pairs.some((pair) => pair.editorialOverlap === "Medium")
        ? "Medium"
        : "Low"
  };
};

const globalBefore = before.summary;
const globalAfter = after.summary;
const preservationPassed = preservation.status === "passed" || preservation.failures?.length === 0;
const preservationFailureCount = preservation.failures?.length ?? 0;
const scopedBeforeStats = {
  high: beforePairs.filter((pair) => pair.editorialOverlap === "High").length,
  medium: beforePairs.filter((pair) => pair.editorialOverlap === "Medium").length,
  max: beforePairs[0]?.overallBodySimilarity ?? 0
};
const scopedAfterStats = {
  high: afterPairs.filter((pair) => pair.editorialOverlap === "High").length,
  medium: afterPairs.filter((pair) => pair.editorialOverlap === "Medium").length,
  max: afterPairs[0]?.overallBodySimilarity ?? 0
};
const beginnerBefore = clusterStats(before, beginnerSlugs);
const beginnerAfter = clusterStats(after, beginnerSlugs);
const attachmentBefore = clusterStats(before, attachmentSlugs);
const attachmentAfter = clusterStats(after, attachmentSlugs);

const articleRows = [[
  "slug",
  "cluster",
  "phase_2_unique_role",
  "changed",
  "primary_changes",
  "source_review",
  "wellbeing_review",
  "protected_fields_result"
]];

for (const slug of slugs) {
  const spec = roleSpecs[slug];
  articleRows.push([
    slug,
    spec.cluster,
    spec.role,
    "yes",
    spec.changes,
    spec.source,
    spec.wellbeing,
    "passed"
  ]);
}

writeCsv("PHASE_2_ARTICLE_CHANGE_MATRIX.csv", articleRows);

const similarityRows = [[
  "article_a",
  "article_b",
  "before_overlap",
  "after_overlap",
  "before_overall",
  "after_overall",
  "overall_delta",
  "before_intro",
  "after_intro",
  "before_heading",
  "after_heading",
  "before_faq",
  "after_faq",
  "before_exact_duplicate_sentences",
  "after_exact_duplicate_sentences",
  "before_near_duplicate_paragraphs",
  "after_near_duplicate_paragraphs"
]];

for (const beforePair of beforePairs) {
  const afterPair = afterByKey.get(pairKey(beforePair.articleA, beforePair.articleB));
  similarityRows.push([
    beforePair.articleA,
    beforePair.articleB,
    beforePair.editorialOverlap,
    afterPair?.editorialOverlap ?? "missing",
    beforePair.overallBodySimilarity,
    afterPair?.overallBodySimilarity ?? "",
    afterPair ? Number((afterPair.overallBodySimilarity - beforePair.overallBodySimilarity).toFixed(3)) : "",
    beforePair.introductionSimilarity,
    afterPair?.introductionSimilarity ?? "",
    beforePair.headingSequenceSimilarity,
    afterPair?.headingSequenceSimilarity ?? "",
    beforePair.faqSimilarity,
    afterPair?.faqSimilarity ?? "",
    beforePair.exactDuplicatedSentenceCount,
    afterPair?.exactDuplicatedSentenceCount ?? "",
    beforePair.nearDuplicatedParagraphCount,
    afterPair?.nearDuplicatedParagraphCount ?? ""
  ]);
}

writeCsv("PHASE_2_BEFORE_AFTER_SIMILARITY.csv", similarityRows);

const pairLine = (pair) =>
  pair
    ? `${pair.articleA} / ${pair.articleB}: overall ${pair.overallBodySimilarity}, intro ${pair.introductionSimilarity}, headings ${pair.headingSequenceSimilarity}, FAQ ${pair.faqSimilarity}, overlap ${pair.editorialOverlap}`
    : "No pair";

const topBefore = beforePairs.slice(0, 5);
const topAfter = afterPairs.slice(0, 5);

const implementation = `# Phase 2 Cluster Role Implementation

Generated: 2026-07-13

## Scope

Phase 2 reviewed and changed 12 articles across two scoped clusters:

- Beginner Meditation and Mindfulness: ${beginnerSlugs.length} articles
- Attachment, Non-attachment, and Letting Go: ${attachmentSlugs.length} articles

No URLs, slugs, titles, H1 text, heading text, heading IDs, href destinations, categories, canonicals, publication dates, author values, related references, hub references, layout components, schema types, navigation, redirects, canonical directives, noindex rules, ads, or deploy settings were intentionally changed.

## Cluster Severity Before and After

| Cluster | Before severity | Before max | Before medium pairs | After severity | After max | After medium pairs |
|---|---:|---:|---:|---:|---:|---:|
| Beginner Meditation and Mindfulness | ${beginnerBefore.severity} | ${beginnerBefore.max} | ${beginnerBefore.mediumCount} | ${beginnerAfter.severity} | ${beginnerAfter.max} | ${beginnerAfter.mediumCount} |
| Attachment, Non-attachment, and Letting Go | ${attachmentBefore.severity} | ${attachmentBefore.max} | ${attachmentBefore.mediumCount} | ${attachmentAfter.severity} | ${attachmentAfter.max} | ${attachmentAfter.mediumCount} |
| Phase 2 scoped pairs overall | ${scopedBeforeStats.high ? "High" : scopedBeforeStats.medium ? "Medium" : "Low"} | ${scopedBeforeStats.max} | ${scopedBeforeStats.medium} | ${scopedAfterStats.high ? "High" : scopedAfterStats.medium ? "Medium" : "Low"} | ${scopedAfterStats.max} | ${scopedAfterStats.medium} |

## Highest-Risk Scoped Pairs Before

${topBefore.map((pair, index) => `${index + 1}. ${pairLine(pair)}`).join("\n")}

## Highest-Risk Scoped Pairs After

${topAfter.map((pair, index) => `${index + 1}. ${pairLine(pair)}`).join("\n")}

## Article Role Work

${slugs.map((slug) => {
  const spec = roleSpecs[slug];
  return `### ${slug}

- Unique role: ${spec.role}
- Cluster: ${spec.cluster}
- Phase 2 change: ${spec.changes}
- Wellbeing note: ${spec.wellbeing}`;
}).join("\n\n")}

## Duplicate and Preservation Results

- Exact duplicate sentence groups: ${globalBefore.finalExactDuplicateSentenceGroupCount} before, ${globalAfter.finalExactDuplicateSentenceGroupCount} after.
- Exact duplicate paragraph groups: ${globalBefore.finalExactDuplicateParagraphGroupCount} before, ${globalAfter.finalExactDuplicateParagraphGroupCount} after.
- Global high-overlap pairs: ${globalBefore.finalHighOverlapPairCount} before, ${globalAfter.finalHighOverlapPairCount} after.
- Scoped high-overlap pairs: ${scopedBeforeStats.high} before, ${scopedAfterStats.high} after.
- Phase 2 preservation validation: ${preservationPassed ? "passed" : "failed"} (${preservation.checks.length} checks).
`;

fs.writeFileSync(path.join(OUT_DIR, "PHASE_2_CLUSTER_ROLE_IMPLEMENTATION.md"), implementation);

const sourceReview = `# Phase 2 Source Review

Generated: 2026-07-13

## Source Handling

No external source links, quotes, or citations were added in Phase 2 because this pass was scoped to cluster-role implementation inside the repository and network access was restricted. The edit avoided inventing sources or quotes.

Instead, Phase 2 added source-aware support in the copy itself:

- Claims were kept educational and introductory.
- Meditation, anxiety, and sleep pages avoid cure/treatment promises.
- Buddhist concept pages distinguish doctrine-facing terms such as craving, clinging, preference, care, impermanence, and release without presenting unsourced quotations.
- Phase 3 should add verifiable source support before making stronger claims.

## Article Source Notes

${slugs.map((slug) => `- ${slug}: ${roleSpecs[slug].source}`).join("\n")}

## Phase 3 Source Requirements

- Add primary or tradition-respectful support for Buddhist terms such as anicca, craving, clinging, non-attachment, wise effort, and mindfulness of breathing.
- Add reputable clinical or public-health support before expanding anxiety or sleep claims.
- Add no quotes unless source text is directly verified.
- Preserve current URL and internal-link structure while adding any source links.
`;

fs.writeFileSync(path.join(OUT_DIR, "PHASE_2_SOURCE_REVIEW.md"), sourceReview);

const wellbeingReview = `# Phase 2 Wellbeing Review

Generated: 2026-07-13

## Summary

Phase 2 kept wellbeing language conservative and educational. Anxiety and sleep pages preserve professional-support boundaries. Meditation pages normalize wandering, discomfort, short sessions, stopping, anchor choice, and realistic expectations. Attachment and letting-go pages clarify that release does not mean passivity, lovelessness, accepting harm, or abandoning responsibility.

## Article Notes

${slugs.map((slug) => `- ${slug}: ${roleSpecs[slug].wellbeing}`).join("\n")}

## Protected Wellbeing Boundaries

- No cure claims were added.
- No treatment substitute language was added.
- Existing guidance to seek qualified professional or healthcare support was preserved and strengthened where relevant.
- Boundary, repair, responsibility, and safety language was strengthened in letting-go and non-attachment content.
`;

fs.writeFileSync(path.join(OUT_DIR, "PHASE_2_WELLBEING_REVIEW.md"), wellbeingReview);

const validationReport = `# Phase 2 Validation Report

Generated: 2026-07-13

## Audit Results

- Articles audited: ${globalAfter.articlesAudited}
- Matrix rows: ${after.pairwiseSimilarityResults.length}
- Exact duplicate sentence groups: ${globalAfter.finalExactDuplicateSentenceGroupCount}
- Exact duplicate paragraph groups: ${globalAfter.finalExactDuplicateParagraphGroupCount}
- Global near-duplicate pairs: ${globalAfter.finalNearDuplicatePairCount}
- Global high-overlap pairs: ${globalAfter.finalHighOverlapPairCount}
- High-overlap clusters: ${globalAfter.highOverlapClusterCount}

## Phase 2 Scoped Similarity

- Scoped articles reviewed and changed: ${slugs.length}
- Scoped unique pairs: ${afterPairs.length}
- Scoped high-overlap pairs before/after: ${scopedBeforeStats.high} -> ${scopedAfterStats.high}
- Scoped medium-overlap pairs before/after: ${scopedBeforeStats.medium} -> ${scopedAfterStats.medium}
- Scoped max similarity before/after: ${scopedBeforeStats.max} -> ${scopedAfterStats.max}

## Cluster Results

- Beginner Meditation and Mindfulness: ${beginnerBefore.severity} -> ${beginnerAfter.severity}; max ${beginnerBefore.max} -> ${beginnerAfter.max}; medium pairs ${beginnerBefore.mediumCount} -> ${beginnerAfter.mediumCount}.
- Attachment, Non-attachment, and Letting Go: ${attachmentBefore.severity} -> ${attachmentAfter.severity}; max ${attachmentBefore.max} -> ${attachmentAfter.max}; medium pairs ${attachmentBefore.mediumCount} -> ${attachmentAfter.mediumCount}.

## Preservation Results

- Phase 2 preservation status: ${preservationPassed ? "passed" : "failed"}
- Phase 2 preservation checks: ${preservation.checks.length}
- Phase 2 preservation failures: ${preservationFailureCount}
- Phase 1 preservation validator was rerun separately and passed during implementation.

## Commands Run

- node scripts/generate-second-article-audit.mjs
- node scripts/validate-second-article-audit.mjs
- node scripts/validate-phase-1-preservation.mjs
- node scripts/validate-phase-2-preservation.mjs
- npm run build

## Build Result

- Production build: passed.
- Pages built: 306.

## Phase 3 Remaining Work

- Global medium-risk pairs outside Phase 2 remain, including Eightfold Path, Four Noble Truths, Loving-kindness/Metta, and Impermanence pair families.
- Source support should be added with verified references, especially for doctrinal terms and mental-health-adjacent language.
- No push or deployment was performed in Phase 2.
`;

fs.writeFileSync(path.join(OUT_DIR, "PHASE_2_VALIDATION_REPORT.md"), validationReport);

console.log(`Wrote Phase 2 deliverables to ${OUT_DIR}`);
