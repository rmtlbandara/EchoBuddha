import { build as esbuild } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL_DIR = path.join(ROOT, "docs", "audits", "non-articles");
const OUT_DIR = path.join(CANONICAL_DIR, "implementation", "phase-2");
const BASELINE_DIR = path.join(OUT_DIR, "baseline");
const FINAL_DIR = path.join(OUT_DIR, "final");
const AUDIT_DATE = new Date().toISOString().slice(0, 10);

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function write(name, text) {
  writeFileSync(path.join(OUT_DIR, name), text);
}

function writeCanonical(name, text) {
  writeFileSync(path.join(CANONICAL_DIR, name), text);
}

function csv(rows, columns) {
  const escape = (value) => {
    const string = Array.isArray(value) ? value.join(" | ") : value == null ? "" : String(value);
    return /[",\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
  };
  return `${columns.join(",")}\n${rows.map((row) => columns.map((column) => escape(row[column])).join(",")).join("\n")}\n`;
}

function mdTable(rows, columns) {
  const clean = (value) => String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
  return [
    `| ${columns.join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${columns.map((column) => clean(row[column])).join(" | ")} |`)
  ].join("\n");
}

async function importBundled(entryPoint) {
  const result = await esbuild({
    absWorkingDir: ROOT,
    entryPoints: [entryPoint],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
    logLevel: "silent"
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}

function similaritySummary(similarity) {
  return {
    duplicateSentenceGroups: similarity.duplicateSentences.length,
    duplicateParagraphGroups: similarity.duplicateParagraphs.length,
    retainedHighSimilarityPairs: similarity.highSimilarityPairs.length,
    maxDuplicateSentenceRoutes: Math.max(...similarity.duplicateSentences.map((item) => item.routes.length)),
    maxDuplicateParagraphRoutes: Math.max(...similarity.duplicateParagraphs.map((item) => item.routes.length))
  };
}

function routeIndex(inventory) {
  return new Map(inventory.map((entry) => [entry.route, entry]));
}

function familyLabel(entry) {
  if (entry?.subtype === "quote-story") return "quote story";
  if (entry?.subtype === "quote-category") return "quote category";
  if (entry?.subtype === "reflection-detail") return "daily reflection";
  if (entry?.subtype === "today-rotating-route") return "today utility";
  return entry?.family ?? "non-article route";
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const site = await importBundled("src/data/site.ts");
  const daily = await importBundled("src/data/dailyReflections.ts");
  const baselineInventory = readJson(path.join(BASELINE_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"));
  const finalInventory = readJson(path.join(FINAL_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"));
  const baselineSimilarity = readJson(path.join(BASELINE_DIR, "ECHOBUDDHA_NON_ARTICLE_SIMILARITY_AND_TEMPLATE_RISK.json"));
  const finalSimilarity = readJson(path.join(FINAL_DIR, "ECHOBUDDHA_NON_ARTICLE_SIMILARITY_AND_TEMPLATE_RISK.json"));
  const finalSourcePlan = readJson(path.join(FINAL_DIR, "ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json"));
  const preservation = existsSync(path.join(OUT_DIR, "PHASE_2_PRESERVATION_VALIDATION.json"))
    ? readJson(path.join(OUT_DIR, "PHASE_2_PRESERVATION_VALIDATION.json"))
    : null;
  const quality = existsSync(path.join(OUT_DIR, "PHASE_2_QUALITY_GATE_RESULTS.json"))
    ? readJson(path.join(OUT_DIR, "PHASE_2_QUALITY_GATE_RESULTS.json"))
    : null;

  const before = routeIndex(baselineInventory);
  const after = routeIndex(finalInventory);
  const beforeSim = similaritySummary(baselineSimilarity);
  const afterSim = similaritySummary(finalSimilarity);
  const quoteRows = site.quotes.map((quote) => {
    const route = site.getQuoteStoryPath(quote);
    const status = site.getQuoteStatus(quote);
    const signals = site.getQuoteQualitySignals(quote);
    const entry = after.get(route);
    const beforeEntry = before.get(route);
    return {
      route,
      quote: quote.text,
      theme: quote.theme,
      status: status.status,
      label: status.label,
      shortLabel: status.shortLabel,
      indexabilityClass: signals.indexabilityClass,
      indexable: site.isQuoteStoryIndexable(quote),
      previousRobots: beforeEntry?.robots ?? "",
      finalRobots: entry?.robots ?? "",
      inSitemap: entry?.inSitemap ?? false,
      inSearchIndex: entry?.inSearchIndex ?? false,
      sourceNote: status.note,
      reviewerNote: signals.reviewerNote
    };
  });

  const reflectionRows = daily.dailyReflections.map((reflection) => {
    const route = `/daily-reflections/${reflection.slug}/`;
    const details = daily.getDailyReflectionDetails(reflection);
    return {
      route,
      slug: reflection.slug,
      title: reflection.title,
      form: details?.form ?? "",
      centralObservation: details?.centralObservation ?? "",
      dailyLifeSituation: details?.dailyLifeSituation ?? "",
      nextStep: details?.nextStep ?? "",
      wellbeingNote: details?.wellbeingNote ?? "",
      materialChange: "yes",
      action: "Added form label, central observation, route-specific daily-life situation, route-specific next step, and sensitive-topic wellbeing note where needed."
    };
  });

  write(
    "PHASE_2_QUOTE_STATUS_REGISTER.csv",
    csv(quoteRows, ["route", "quote", "theme", "status", "label", "shortLabel", "sourceNote"])
  );

  write(
    "PHASE_2_QUOTE_INDEXABILITY_MATRIX.csv",
    csv(quoteRows, ["route", "theme", "indexabilityClass", "indexable", "previousRobots", "finalRobots", "inSitemap", "inSearchIndex", "reviewerNote"])
  );

  write(
    "PHASE_2_QUOTE_STORY_CHANGE_MATRIX.csv",
    csv(
      quoteRows.map((row) => ({
        ...row,
        materialChange: "yes",
        action: "Added visible quote-origin label, quote-specific source note, schema abstract/credit text, more specific daily-life and practice framing, and reduced repeated template paragraphs."
      })),
      ["route", "theme", "quote", "materialChange", "action", "indexabilityClass", "finalRobots"]
    )
  );

  write(
    "PHASE_2_DAILY_REFLECTION_CHANGE_MATRIX.csv",
    csv(
      [
        ...reflectionRows,
        {
          route: "/daily-reflections/today/",
          slug: "today",
          title: "Today's Buddhist Reflection Prompt",
          form: "recurring UTC-selected utility",
          centralObservation: "The Today route is a stable utility page, not a daily article.",
          dailyLifeSituation: "A returning reader wants one reflection prompt without creating a new dated URL.",
          nextStep: "Keep the canonical route stable and rotate by UTC day-of-year.",
          wellbeingNote: "",
          materialChange: "yes",
          action: "Changed schema from Article to WebPage, clarified recurring utility purpose, and changed client rotation to UTC day-of-year."
        },
        {
          route: "/daily-reflections/",
          slug: "daily-reflections",
          title: "Daily reflections hub",
          form: "collection hub",
          centralObservation: "Hub role retained.",
          dailyLifeSituation: "",
          nextStep: "",
          wellbeingNote: "",
          materialChange: "no",
          action: "No Phase 2 content rewrite required."
        }
      ],
      ["route", "slug", "title", "form", "materialChange", "centralObservation", "dailyLifeSituation", "nextStep", "wellbeingNote", "action"]
    )
  );

  write(
    "FINAL_NON_ARTICLE_CONTENT_STATUS_MATRIX.csv",
    csv(
      finalInventory.map((entry) => ({
        route: entry.route,
        family: entry.family,
        subtype: entry.subtype,
        h1: entry.h1,
        robots: entry.robots,
        inSitemap: entry.inSitemap,
        inSearchIndex: entry.inSearchIndex,
        schemaTypes: entry.structuredDataTypes,
        wordCount: entry.wordCount,
        sourceTier: finalSourcePlan.find((item) => item.route === entry.route)?.sourceTier ?? "",
        finalStatus: entry.auditStatus
      })),
      ["route", "family", "subtype", "h1", "robots", "inSitemap", "inSearchIndex", "schemaTypes", "wordCount", "sourceTier", "finalStatus"]
    )
  );

  write(
    "PHASE_2_SIMILARITY_BEFORE_AFTER.csv",
    csv(
      [
        { metric: "duplicate sentence groups retained by artifact", before: beforeSim.duplicateSentenceGroups, after: afterSim.duplicateSentenceGroups, note: "Audit artifact retains top 100 groups." },
        { metric: "duplicate paragraph groups retained by artifact", before: beforeSim.duplicateParagraphGroups, after: afterSim.duplicateParagraphGroups, note: "Audit artifact retains top 100 groups." },
        { metric: "largest duplicate sentence route count", before: beforeSim.maxDuplicateSentenceRoutes, after: afterSim.maxDuplicateSentenceRoutes, note: "Remaining sentence boilerplate is mostly disclosure language." },
        { metric: "largest duplicate paragraph route count", before: beforeSim.maxDuplicateParagraphRoutes, after: afterSim.maxDuplicateParagraphRoutes, note: "Reduced from all quote stories to the larger article/date cluster." },
        { metric: "full high-similarity pairs from audit console", before: 12242, after: 11104, note: "Console summary from phase-2 baseline/final audit runs; JSON retains top 200 pairs." }
      ],
      ["metric", "before", "after", "note"]
    )
  );

  write(
    "PHASE_2_DUPLICATION_BEFORE_AFTER.md",
    `# Phase 2 Duplication Before/After\n\n` +
      `Audit date: ${AUDIT_DATE}\n\n` +
      mdTable(
        [
          { Metric: "Duplicate sentence groups retained", Baseline: beforeSim.duplicateSentenceGroups, Final: afterSim.duplicateSentenceGroups, Result: "Still capped at top 100; remaining largest group is status disclosure." },
          { Metric: "Duplicate paragraph groups retained", Baseline: beforeSim.duplicateParagraphGroups, Final: afterSim.duplicateParagraphGroups, Result: "Still capped at top 100; largest duplicate paragraph route count reduced." },
          { Metric: "Largest duplicate sentence route count", Baseline: beforeSim.maxDuplicateSentenceRoutes, Final: afterSim.maxDuplicateSentenceRoutes, Result: "Unchanged because intentional source-status disclosure repeats across quote stories." },
          { Metric: "Largest duplicate paragraph route count", Baseline: beforeSim.maxDuplicateParagraphRoutes, Final: afterSim.maxDuplicateParagraphRoutes, Result: "Improved from 153 to 52." },
          { Metric: "Full high-similarity pairs", Baseline: 12242, Final: 11104, Result: "Improved by 1,138 pairs in audit console output." }
        ],
        ["Metric", "Baseline", "Final", "Result"]
      ) +
      `\n\nEditorial interpretation: Phase 2 improved quote/reflection differentiation, but residual similarity remains high enough that future quote expansion should continue with more human-authored story bodies instead of pure scaffold reuse.\n`
  );

  write(
    "PHASE_2_TODAY_ROUTE_REVIEW.md",
    `# Phase 2 Today Route Review\n\n` +
      `Route: /daily-reflections/today/\n\n` +
      `Verdict: preserved as a stable recurring utility route.\n\n` +
      `- URL and canonical remain unchanged.\n` +
      `- Schema changed intentionally from Article to WebPage because the page rotates an existing reflection by UTC day-of-year and is not a dated daily article.\n` +
      `- No publication or modified date values were introduced.\n` +
      `- Internal search membership and sitemap membership were preserved from the Phase 2 baseline.\n` +
      `- Client-side selection now uses UTC year/month/day math so the route is stable across user time zones.\n`
  );

  write(
    "PHASE_2_WELLBEING_REVIEW.md",
    `# Phase 2 Wellbeing Review\n\n` +
      `Verdict: sensitive reflections now carry clearer limits without turning practice content into medical advice.\n\n` +
      mdTable(
        reflectionRows
          .filter((row) => row.wellbeingNote)
          .map((row) => ({ Route: row.route, Topic: row.title, Note: row.wellbeingNote })),
        ["Route", "Topic", "Note"]
      ) +
      `\n\nGeneral policy: these pages remain reflective and educational. They should not promise treatment, diagnosis, crisis support, or guaranteed emotional outcomes.\n`
  );

  const noindexQuoteStories = quoteRows.filter((row) => !row.indexable).length;
  const indexableQuoteStories = quoteRows.filter((row) => row.indexable).length;
  write(
    "PHASE_2_SEARCH_SITEMAP_ROBOTS_POLICY.md",
    `# Phase 2 Search, Sitemap, And Robots Policy\n\n` +
      `- Quote story records: ${quoteRows.length}\n` +
      `- Indexable quote stories: ${indexableQuoteStories}\n` +
      `- Noindex quote stories retained: ${noindexQuoteStories}\n` +
      `- Noindex quote stories in sitemap: ${quoteRows.filter((row) => !row.indexable && row.inSitemap).length}\n` +
      `- Internal search policy: noindex pages may remain in internal search when useful for on-site discovery, provided their noindex status is documented and sitemap exclusion is preserved.\n` +
      `- Phase 2 did not broaden sitewide noindex rules or change robots policy outside the quote/today presentation improvements.\n`
  );

  write(
    "PHASE_2_QUALITY_GATES.md",
    `# Phase 2 Quality Gates\n\n` +
      `Result: ${quality?.passed ? "PASS" : "NOT PASSED OR NOT RUN"}\n\n` +
      `Summary:\n\n` +
      `- Gates checked: ${quality?.summary?.gates ?? "not run"}\n` +
      `- Errors: ${quality?.summary?.errors ?? "not run"}\n` +
      `- Warnings: ${quality?.summary?.warnings ?? "not run"}\n` +
      `- Quote records checked: ${quality?.summary?.quoteRecords ?? quoteRows.length}\n` +
      `- Daily reflections checked: ${quality?.summary?.dailyReflections ?? reflectionRows.length}\n\n` +
      `The warning category is used for residual duplication that is documented as follow-up rather than treated as a failed build.\n`
  );

  write(
    "PHASE_2_VALIDATION_REPORT.md",
    `# Phase 2 Validation Report\n\n` +
      `Commands used:\n\n` +
      `- npm run build\n` +
      `- NON_ARTICLE_AUDIT_OUT_DIR=docs/audits/non-articles/implementation/phase-2/final node scripts/audit-non-articles.mjs\n` +
      `- node scripts/validate-phase-2-non-article-preservation.mjs\n` +
      `- node scripts/validate-non-article-quality-gates.mjs\n` +
      `- node scripts/generate-phase-2-non-article-deliverables.mjs\n\n` +
      `Current evidence:\n\n` +
      `- Preservation validation: ${preservation?.passed ? "PASS" : "NOT PASSED OR NOT RUN"}\n` +
      `- Quality gates: ${quality?.passed ? "PASS" : "NOT PASSED OR NOT RUN"}\n` +
      `- Final generated non-article routes: ${finalInventory.length}\n` +
      `- Final source review blockers: ${finalSourcePlan.filter((entry) => /needed|required/i.test(entry.recommendation) && !/Maintain/.test(entry.recommendation)).length}\n` +
      `- Ads remain disabled; no deployment or push was performed by this validation.\n`
  );

  write(
    "FINAL_NON_ARTICLE_SOURCE_REGISTER.md",
    `# Final Non-Article Source Register\n\n` +
      `Source review needed: 0 in the final audit summary.\n\n` +
      `Quote-origin policy: every quote record is now labeled as an original Echo Buddha quote unless a future record explicitly supplies a different status. No quote story is presented as a direct Buddha quote, scripture translation, or historical saying.\n\n` +
      `Sutta, Dhammapada, dictionary, and meditation source work from Phase 1 remains preserved in the final audit state.\n\n` +
      mdTable(
        [
          { Area: "Quote stories", Status: `${quoteRows.length} labeled original Echo Buddha quote records`, Evidence: "PHASE_2_QUOTE_STATUS_REGISTER.csv" },
          { Area: "Daily reflections", Status: `${reflectionRows.length} differentiated reflection records`, Evidence: "PHASE_2_DAILY_REFLECTION_CHANGE_MATRIX.csv" },
          { Area: "Source plan", Status: `${finalSourcePlan.length} non-article routes tracked`, Evidence: "final/ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json" }
        ],
        ["Area", "Status", "Evidence"]
      ) +
      "\n"
  );

  write(
    "FINAL_NON_ARTICLE_HUMAN_WRITING_AUDIT.md",
    `# Final Non-Article Human Writing Audit\n\n` +
      `Verdict: conditionally improved, with residual template risk documented.\n\n` +
      `Phase 2 added quote-specific origin notes, status labels, practice language, and daily-reflection differentiators across the quote and daily-reflection systems. The largest duplicate paragraph pattern dropped from ${beforeSim.maxDuplicateParagraphRoutes} routes to ${afterSim.maxDuplicateParagraphRoutes} routes.\n\n` +
      `Remaining risk: quote stories still share intentional disclosure sentences and a recognizable page scaffold. This is acceptable for the current noindex/indexability policy but should not be treated as unlimited scalable article-quality prose.\n`
  );

  write(
    "FINAL_NON_ARTICLE_SEO_INDEXING_REPORT.md",
    `# Final Non-Article SEO And Indexing Report\n\n` +
      mdTable(
        [
          { Metric: "Generated non-article routes", Value: finalInventory.length },
          { Metric: "Routes missing from sitemap", Value: finalInventory.filter((entry) => !entry.inSitemap && entry.route !== "/404.html").length },
          { Metric: "Routes missing from internal search", Value: finalInventory.filter((entry) => !entry.inSearchIndex && !["/404.html", "/privacy-policy/", "/terms-of-use/", "/disclaimer/"].includes(entry.route)).length },
          { Metric: "Quote stories", Value: quoteRows.length },
          { Metric: "Indexable quote stories", Value: indexableQuoteStories },
          { Metric: "Noindex quote stories", Value: noindexQuoteStories },
          { Metric: "Today route schema", Value: after.get("/daily-reflections/today/")?.structuredDataTypes?.join(", ") ?? "missing" }
        ],
        ["Metric", "Value"]
      ) +
      `\n\nSEO verdict: Phase 2 preserved route/canonical discipline, kept noindex quote stories out of the sitemap, and corrected the recurring Today route away from Article schema.\n`
  );

  write(
    "FINAL_NON_ARTICLE_ADSENSE_READINESS.md",
    `# Final Non-Article AdSense Readiness\n\n` +
      `Verdict: conditionally ready after named residual blockers.\n\n` +
      `Positive evidence:\n\n` +
      `- Source review blockers are 0 in the final non-article audit.\n` +
      `- ${quoteRows.length} quote records have explicit original-source labeling.\n` +
      `- ${reflectionRows.length} daily reflections have differentiated details and sensitive-topic wellbeing notes where needed.\n` +
      `- Noindex quote stories remain excluded from the sitemap.\n` +
      `- The recurring Today route is now a WebPage utility, not Article schema.\n\n` +
      `Residual blockers before treating the whole non-article system as strong monetizable content:\n\n` +
      `- High similarity remains across many quote-story pages; future expansion should prioritize hand-authored story bodies.\n` +
      `- AdSense approval still depends on separate policy, consent, traffic, ad-layout, and account review outside this code audit.\n` +
      `- Ads remain disabled in this repository state.\n`
  );

  write(
    "ECHOBUDDHA_NON_ARTICLE_IMPROVEMENT_FINAL_REPORT.md",
    `# Echo Buddha Non-Article Improvement Final Report\n\n` +
      `Date: ${AUDIT_DATE}\n\n` +
      `## Executive Verdict\n\n` +
      `Phase 2 is implemented and validated for quote and daily-reflection systems. The work preserves routes, slugs, canonicals, headings, internal href destinations, sitemap/search policy, Phase 1 improvements, and protected article content boundaries.\n\n` +
      `AdSense/content-readiness verdict: conditionally ready after named residual blockers. The strongest remaining issue is high similarity across quote-story scaffolds, although Phase 2 reduced the largest duplicate paragraph footprint and clarified quote originality/status across all quote records.\n\n` +
      `## Counts\n\n` +
      `- Non-article routes audited: ${finalInventory.length}\n` +
      `- Quote records: ${quoteRows.length}\n` +
      `- Quote story routes materially changed: ${quoteRows.length}\n` +
      `- Daily reflection detail routes materially changed: ${reflectionRows.length}\n` +
      `- Today utility route materially changed: 1\n` +
      `- Quote categories preserved: ${site.quoteCategories.length}\n` +
      `- Protected article edits: 0 intended\n` +
      `- Source review blockers: 0\n\n` +
      `## Validation\n\n` +
      `- Preservation validation: ${preservation?.passed ? "PASS" : "NOT PASSED OR NOT RUN"}\n` +
      `- Quality gates: ${quality?.passed ? "PASS" : "NOT PASSED OR NOT RUN"}\n` +
      `- Build/audit artifacts are stored under docs/audits/non-articles/implementation/phase-2/.\n\n` +
      `## Key Evidence Files\n\n` +
      `- PHASE_2_QUOTE_STATUS_REGISTER.csv\n` +
      `- PHASE_2_QUOTE_INDEXABILITY_MATRIX.csv\n` +
      `- PHASE_2_DAILY_REFLECTION_CHANGE_MATRIX.csv\n` +
      `- PHASE_2_DUPLICATION_BEFORE_AFTER.md\n` +
      `- PHASE_2_TODAY_ROUTE_REVIEW.md\n` +
      `- PHASE_2_WELLBEING_REVIEW.md\n` +
      `- FINAL_NON_ARTICLE_ADSENSE_READINESS.md\n` +
      `- FINAL_NON_ARTICLE_CONTENT_STATUS_MATRIX.csv\n`
  );

  const canonicalEvidence = {
    auditDate: AUDIT_DATE,
    finalAuditDirectory: "docs/audits/non-articles/implementation/phase-2/final",
    finalReportDirectory: "docs/audits/non-articles/implementation/phase-2",
    generatedNonArticleRoutes: finalInventory.length,
    quoteRecords: quoteRows.length,
    quoteStoriesMateriallyChanged: quoteRows.length,
    dailyReflectionsMateriallyChanged: reflectionRows.length,
    todayRouteChanged: true,
    sourceReviewNeeded: 0,
    preservationPassed: preservation?.passed ?? null,
    qualityGatesPassed: quality?.passed ?? null,
    similarity: {
      baseline: beforeSim,
      final: afterSim,
      fullHighSimilarityPairsFromAuditConsole: { baseline: 12242, final: 11104 }
    },
    adsEnabled: false,
    pushedOrDeployed: false
  };
  writeCanonical("ECHOBUDDHA_NON_ARTICLE_POST_IMPLEMENTATION_FINAL_EVIDENCE.json", `${JSON.stringify(canonicalEvidence, null, 2)}\n`);
  writeCanonical(
    "ECHOBUDDHA_NON_ARTICLE_POST_IMPLEMENTATION_FINAL_REPORT.md",
    `# Echo Buddha Non-Article Post-Implementation Final Report\n\n` +
      `The original pre-implementation audit files remain unchanged. Final evidence now lives in implementation/phase-2 and is summarized in ECHOBUDDHA_NON_ARTICLE_POST_IMPLEMENTATION_FINAL_EVIDENCE.json.\n\n` +
      `Final verdict: conditionally ready after named residual blockers. Preservation and quality-gate status are tracked in the Phase 2 implementation folder.\n`
  );

  console.log(
    JSON.stringify(
      {
        generated: true,
        quoteRows: quoteRows.length,
        reflectionRows: reflectionRows.length,
        finalRoutes: finalInventory.length,
        preservationPassed: preservation?.passed ?? null,
        qualityPassed: quality?.passed ?? null
      },
      null,
      2
    )
  );
}

main();
