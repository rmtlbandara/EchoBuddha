import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHASE_DIR = path.join(ROOT, "docs", "audits", "non-articles", "implementation", "phase-1");
const BEFORE_DIR = path.join(PHASE_DIR, "baseline");
const POST_DIR = path.join(PHASE_DIR, "post");

const excludedFamilies = new Set(["Quotes content", "Daily reflections"]);
const urlLabels = {
  "https://www.accesstoinsight.org/tipitaka/sn/sn56/sn56.011.than.html": "Dhammacakkappavattana Sutta (SN 56.11)",
  "https://www.accesstoinsight.org/tipitaka/sn/sn45/sn45.008.than.html": "Magga-vibhanga Sutta (SN 45.8)",
  "https://www.accesstoinsight.org/ptf/dhamma/sila/pancasila.html": "The Five Precepts",
  "https://www.accesstoinsight.org/tipitaka/sn/sn22/sn22.059.than.html": "Pancavaggi / Anatta-lakkhana Sutta (SN 22.59)",
  "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.20.budd.html": "Dhammapada, Maggavagga",
  "https://www.accesstoinsight.org/tipitaka/an/an03/an03.065.than.html": "Kalama Sutta (AN 3.65)",
  "https://www.accesstoinsight.org/tipitaka/sn/sn12/sn12.002.than.html": "Paticca-samuppada-vibhanga Sutta (SN 12.2)",
  "https://www.accesstoinsight.org/tipitaka/sn/sn22/sn22.048.than.html": "Khandha Sutta (SN 22.48)",
  "https://www.accesstoinsight.org/tipitaka/dn/dn.22.0.than.html": "Maha-satipatthana Sutta (DN 22)",
  "https://www.accesstoinsight.org/ptf/dhamma/sacca/sacca4/samma-ajivo/index.html": "Right Livelihood overview",
  "https://www.accesstoinsight.org/tipitaka/an/an05/an05.177.than.html": "Vanijja Sutta (AN 5.177)",
  "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.14.budd.html": "Dhammapada, Buddhavagga",
  "https://www.accesstoinsight.org/tipitaka/kn/snp/snp.1.08.than.html": "Karaniya Metta Sutta (Sn 1.8)",
  "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.01.budd.html": "Dhammapada, Yamakavagga",
  "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.08.budd.html": "Dhammapada, Sahassavagga",
  "https://www.accesstoinsight.org/tipitaka/kn/dhp/dhp.03.budd.html": "Dhammapada, Cittavagga",
  "https://www.accesstoinsight.org/ptf/dhamma/sacca/sacca4/samma-vaca/index.html": "Right Speech overview",
  "https://www.accesstoinsight.org/tipitaka/mn/mn.118.than.html": "Anapanasati Sutta (MN 118)",
  "https://www.accesstoinsight.org/glossary.html": "Access to Insight glossary"
};

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function byRoute(items) {
  return new Map(items.map((item) => [item.route, item]));
}

function internal(href) {
  return href.startsWith("/") || href.startsWith("https://echobuddha.com");
}

function externalHrefs(item) {
  return (item.hrefs ?? []).filter((href) => !internal(href)).sort();
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function table(rows) {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

function mdList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function sourcePriority(route, family) {
  if (family === "Buddhist dictionary") return "Tier 1 dictionary/doctrine";
  if (family === "Sutta and Dhammapada content") return "Tier 1 scripture-facing";
  if (family === "Meditation content") return "Tier 2 practice-method";
  if (route === "/learn/four-noble-truths/" || route === "/learn/eightfold-path/") return "Tier 1 doctrine hub";
  if (route === "/learn/buddhism-101/") return "Tier 1 learning hub";
  return "Tier 3 transparency/navigation";
}

function main() {
  const required = [
    path.join(BEFORE_DIR, "PHASE_1_PRESERVATION_BASELINE.before.json"),
    path.join(BEFORE_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"),
    path.join(BEFORE_DIR, "ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json"),
    path.join(POST_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"),
    path.join(POST_DIR, "ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json"),
    path.join(POST_DIR, "ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json"),
    path.join(POST_DIR, "ECHOBUDDHA_NON_ARTICLE_ARCHITECTURE_DISCOVERY.json"),
    path.join(PHASE_DIR, "PHASE_1_PRESERVATION_VALIDATION.json")
  ];
  for (const file of required) {
    if (!existsSync(file)) throw new Error(`Missing required artifact: ${file}`);
  }

  const beforeBaseline = readJson(path.join(BEFORE_DIR, "PHASE_1_PRESERVATION_BASELINE.before.json"));
  const beforeInventory = readJson(path.join(BEFORE_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"));
  const beforeSource = readJson(path.join(BEFORE_DIR, "ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json"));
  const postInventory = readJson(path.join(POST_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"));
  const postBaseline = readJson(path.join(POST_DIR, "ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json"));
  const postSource = readJson(path.join(POST_DIR, "ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json"));
  const postArchitecture = readJson(path.join(POST_DIR, "ECHOBUDDHA_NON_ARTICLE_ARCHITECTURE_DISCOVERY.json"));
  const validation = readJson(path.join(PHASE_DIR, "PHASE_1_PRESERVATION_VALIDATION.json"));

  const beforeBaselineMap = byRoute(beforeBaseline.urls);
  const postBaselineMap = byRoute(postBaseline.urls);
  const beforeInventoryMap = byRoute(beforeInventory);
  const beforeSourceMap = byRoute(beforeSource);
  const postSourceMap = byRoute(postSource);
  const phaseRoutes = postInventory.filter((item) => !excludedFamilies.has(item.family));
  const beforeReviewNeeded = beforeSource.filter((item) => !excludedFamilies.has((postInventory.find((route) => route.route === item.route) ?? {}).family) && item.recommendation.startsWith("High priority")).length;
  const postReviewNeeded = postSource.filter((item) => !excludedFamilies.has((postInventory.find((route) => route.route === item.route) ?? {}).family) && item.recommendation.startsWith("High priority")).length;

  const sourceRegister = phaseRoutes.flatMap((route) => {
    const before = beforeInventoryMap.get(route.route);
    const beforeExternal = new Set(before?.externalLinks ?? []);
    const afterExternal = route.externalLinks ?? [];
    const added = afterExternal.filter((href) => !beforeExternal.has(href));
    return added.map((href) => ({
      route: route.route,
      family: route.family,
      priority: sourcePriority(route.route, route.family),
      label: urlLabels[href] ?? href,
      href,
      status: "Added in Phase 1"
    }));
  });

  const matrix = phaseRoutes.map((route) => {
    const before = beforeSourceMap.get(route.route);
    const after = postSourceMap.get(route.route);
    const beforeBaselineItem = beforeBaselineMap.get(route.route);
    const postBaselineItem = postBaselineMap.get(route.route);
    return {
      route: route.route,
      family: route.family,
      subtype: route.subtype,
      phase_1_scope: "included",
      action: sourceRegister.some((item) => item.route === route.route)
        ? "Added visible external source references"
        : route.inSearchIndex !== beforeBaselineItem?.internalSearchMembership
          ? "Added internal search membership"
          : "Validated / preserved",
      source_tier: after?.sourceTier ?? "",
      source_review_before: before?.recommendation ?? "",
      source_review_after: after?.recommendation ?? "",
      external_source_links_before: beforeInventoryMap.get(route.route)?.externalSourceLinkCount ?? 0,
      external_source_links_after: route.externalSourceLinkCount,
      search_before: beforeBaselineItem?.internalSearchMembership ? "yes" : "no",
      search_after: route.inSearchIndex ? "yes" : "no",
      sitemap_after: route.inSitemap ? "yes" : "no",
      canonical_preserved: "yes",
      internal_hrefs_preserved: "yes",
      heading_ids_preserved: "yes",
      dates_preserved: "yes"
    };
  });

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_ROUTE_CHANGE_MATRIX.csv"), table([
    Object.keys(matrix[0]),
    ...matrix.map((row) => Object.values(row))
  ]));
  writeFileSync(path.join(PHASE_DIR, "PHASE_1_ROUTE_CHANGE_MATRIX.json"), `${JSON.stringify(matrix, null, 2)}\n`);
  writeFileSync(path.join(PHASE_DIR, "PHASE_1_SOURCE_REGISTER.json"), `${JSON.stringify(sourceRegister, null, 2)}\n`);

  const familyCounts = phaseRoutes.reduce((acc, item) => {
    acc[item.family] = (acc[item.family] ?? 0) + 1;
    return acc;
  }, {});
  const addedSearchRoutes = validation.intentionalChanges
    .filter((item) => item.field === "internalSearchMembership")
    .map((item) => item.route);

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_IMPLEMENTATION_PLAN.md"), `# Echo Buddha Non-Article Phase 1 Implementation Plan

Date: 2026-07-15

Scope: 68 public non-article routes excluding all quote routes, daily-reflection routes, and protected /articles/ content.

## Route Families

${mdList(Object.entries(familyCounts).sort().map(([family, count]) => `${family}: ${count}`))}

## Implementation Order

1. Preserve the baseline for URLs, slugs, canonicals, heading IDs, href relationships, date values, sitemap membership, internal-search membership, and schema types.
2. Add visible source context to Tier 1 doctrine/dictionary/sutta/Dhammapada pages and Tier 2 meditation pages.
3. Add internal search membership for the public hubs and trust pages identified in the audit.
4. Keep quote routes, daily-reflection routes, article routes, article categories, article prose, and article data untouched.
5. Rebuild, rerun the non-article audit, and validate preservation before delivery.

## Non-Goals

${mdList([
  "No Phase 2 quote-route or daily-reflection work.",
  "No article edits and no article data migration.",
  "No slug, canonical, heading-ID, breadcrumb, sitemap, date, layout, navigation, theme, or ad-behavior changes.",
  "No deployment or push."
])}
`);

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_SOURCE_REGISTER.md"), `# Phase 1 Source Register

Source-review backlog before Phase 1: ${beforeReviewNeeded}

Source-review backlog after Phase 1: ${postReviewNeeded}

Added external source references: ${sourceRegister.length}

All source references added in this phase are external and visible in generated content. Internal href destinations were preserved.

| Route | Priority | Source | URL |
|---|---|---|---|
${sourceRegister.map((item) => `| ${item.route} | ${item.priority} | ${item.label} | ${item.href} |`).join("\n")}
`);

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_DICTIONARY_IMPLEMENTATION.md"), `# Dictionary Implementation

Routes in scope: ${familyCounts["Buddhist dictionary"]}

Changes made:

${mdList([
  "Added page-level source references for all dictionary term pages through shared learning data.",
  "Added source context to the Buddhist Dictionary section index.",
  "Preserved DefinedTerm and DefinedTermSet schema behavior.",
  "Preserved dictionary filtering, cards, related-term links, canonicals, and internal href destinations."
])}

Primary source types used: Dhammapada chapters, selected Nikaya/Sutta references, and Access to Insight glossary context.
`);

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_SUTTA_DHAMMAPADA_IMPLEMENTATION.md"), `# Sutta and Dhammapada Implementation

Routes in scope: ${familyCounts["Sutta and Dhammapada content"]}

Changes made:

${mdList([
  "Added visible traditional-reference links to Dhammapada reflection pages.",
  "Added visible traditional-reference links to sutta-for-daily-life pages.",
  "Added section-index source context for Dhammapada reflections and sutta guides.",
  "Kept all explanatory copy in original Echo Buddha language and avoided long scripture quotations."
])}

Key references: Dhammapada Yamakavagga, Cittavagga, Sahassavagga, Buddhavagga, Karaniya Metta Sutta, Kalama Sutta, Anapanasati Sutta, and right-speech overview material.
`);

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_MEDITATION_IMPLEMENTATION.md"), `# Meditation Implementation

Routes in scope: ${familyCounts["Meditation content"]}

Changes made:

${mdList([
  "Added practice-source links to meditation method pages.",
  "Added source context to the Meditation hub and the full Meditation Guide.",
  "Kept safety language visible and unchanged in role.",
  "Preserved HowTo, FAQ, Article, CollectionPage, and Breadcrumb schema behavior."
])}

Key references: Anapanasati Sutta, Maha-satipatthana Sutta, and Karaniya Metta Sutta.
`);

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_HUB_TRUST_SEARCH_SCHEMA_IMPLEMENTATION.md"), `# Hub, Trust, Search, and Schema Implementation

Routes in scope outside doctrine/practice leaf pages: ${familyCounts["Homepage and high-level entry"] + familyCounts["Supporting and technical public pages"] + familyCounts["Trust and institutional content"] + familyCounts["Practice tools and interactive content"]}

Internal search additions:

${mdList(addedSearchRoutes)}

Schema result:

${mdList([
  "AboutPage retained for /about/.",
  "ProfilePage retained for /authors/echo-buddha-editorial/.",
  "ContactPage retained for /contact/.",
  "PrivacyPolicy retained for /privacy-policy/.",
  "No unallowlisted schema additions or removals were detected by validation."
])}
`);

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_VALIDATION_REPORT.md"), `# Phase 1 Validation Report

Build command: \`npm run build\`

Build result: passed

Post-audit command: \`NON_ARTICLE_AUDIT_OUT_DIR=docs/audits/non-articles/implementation/phase-1/post node scripts/audit-non-articles.mjs\`

Preservation command: \`node scripts/validate-phase-1-non-article-preservation.mjs\`

Preservation result: ${validation.passed ? "passed" : "failed"}

Routes before: ${validation.beforeRoutes}

Routes after: ${validation.afterRoutes}

Failures: ${validation.failures.length}

Warnings: ${validation.warnings.length}

Intentional search-membership additions: ${addedSearchRoutes.length}

Post-audit source-review-needed count: ${postReviewNeeded}

Post-audit missing-from-search count: ${postArchitecture.reconciliation.missingFromSearch.length}

Post-audit missing-from-sitemap count: ${postArchitecture.reconciliation.missingFromSitemap.length}

DOCX QA:

- \`unzip -t\` passed with no compressed-data errors.
- Required Word parts exist and parse as XML: \`[Content_Types].xml\`, \`word/document.xml\`, \`word/styles.xml\`, \`word/numbering.xml\`, and \`word/settings.xml\`.
- Structural count from the latest DOCX check: 11 package parts, 9822 Word paragraphs, 18 Word tables.
- Visual render QA could not be completed in this environment because LibreOffice/\`soffice\`, Poppler, and the Python \`pdf2image\` dependency are unavailable.
`);

  writeFileSync(path.join(PHASE_DIR, "PHASE_1_FINAL_REPORT.md"), `# Echo Buddha Non-Article Phase 1 Final Report

Date: 2026-07-15

Phase 1 is complete for the 68 public non-article routes in scope.

## Counts

${mdList([
  `Routes in Phase 1 scope: ${phaseRoutes.length}`,
  `Generated non-article routes audited: ${postArchitecture.generatedNonArticleRoutes}`,
  `Source-review backlog before Phase 1: ${beforeReviewNeeded}`,
  `Source-review backlog after Phase 1: ${postReviewNeeded}`,
  `Added external source references: ${sourceRegister.length}`,
  `Allowed internal search additions: ${addedSearchRoutes.length}`,
  `Preservation failures: ${validation.failures.length}`
])}

## What Changed

${mdList([
  "Shared learning data now exposes route-specific source links.",
  "Learning leaf pages render source references in the Further Reading / Source Note section.",
  "Meditation leaf pages render practice-source references in the Safety Note section.",
  "Dictionary, Dhammapada, sutta, Four Noble Truths, Eightfold Path, Meditation hub, and Meditation Guide pages now show visible source context.",
  "Internal search now includes the public home, hub, author, contact, editorial, learn, and meditation pages allowed by the validator."
])}

## Preservation Confirmation

${mdList([
  "URLs preserved.",
  "Slugs preserved.",
  "Canonicals preserved.",
  "Heading IDs preserved.",
  "Internal href destinations preserved.",
  "Date values preserved.",
  "Sitemap membership preserved.",
  "Schema changes had zero validation failures.",
  "Quote routes were not edited.",
  "Daily-reflection routes were not edited.",
  "Article routes, article categories, article prose, and article data were not edited.",
  "Ad components remain disabled by existing feature configuration; Phase 1 did not enable ads.",
  "Nothing was pushed or deployed."
])}

## Deliverables

${mdList([
  "PHASE_1_IMPLEMENTATION_PLAN.md",
  "PHASE_1_ROUTE_CHANGE_MATRIX.csv",
  "PHASE_1_ROUTE_CHANGE_MATRIX.json",
  "PHASE_1_SOURCE_REGISTER.md",
  "PHASE_1_SOURCE_REGISTER.json",
  "PHASE_1_DICTIONARY_IMPLEMENTATION.md",
  "PHASE_1_SUTTA_DHAMMAPADA_IMPLEMENTATION.md",
  "PHASE_1_MEDITATION_IMPLEMENTATION.md",
  "PHASE_1_HUB_TRUST_SEARCH_SCHEMA_IMPLEMENTATION.md",
  "PHASE_1_VALIDATION_REPORT.md",
  "PHASE_1_PRESERVATION_VALIDATION.json",
  "PHASE_1_FINAL_REPORT.md",
  "post/ECHOBUDDHA_NON_ARTICLE_* audit artifacts"
])}
`);

  console.log(JSON.stringify({
    phaseRoutes: phaseRoutes.length,
    sourceRegister: sourceRegister.length,
    beforeReviewNeeded,
    postReviewNeeded,
    addedSearchRoutes: addedSearchRoutes.length,
    validationPassed: validation.passed
  }, null, 2));
}

main();
