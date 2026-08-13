import { build as esbuild } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const OUT_DIR = path.join(ROOT, "docs", "audits", "non-articles", "implementation", "phase-2");
const FINAL_DIR = path.join(OUT_DIR, "final");

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
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

function normalize(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function duplicateGroups(records, key) {
  const map = new Map();
  for (const record of records) {
    const value = normalize(record[key]);
    if (!value) continue;
    const group = map.get(value) ?? [];
    group.push(record);
    map.set(value, group);
  }
  return [...map.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([value, group]) => ({ value, routes: group.map((item) => item.route ?? item.slug ?? item.text) }));
}

function htmlForRoute(route) {
  const file = route === "/" ? path.join(DIST, "index.html") : path.join(DIST, route, "index.html");
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function hasNoindex(html) {
  return /<meta\s+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    || /<meta\s+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

function gate(name, passed, details = {}, severity = "error") {
  return { name, passed, severity, details };
}

async function main() {
  if (!existsSync(DIST)) throw new Error("dist/ is missing. Run `npm run build` before quality gates.");
  mkdirSync(OUT_DIR, { recursive: true });

  const sitemapXml = readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
  const currentSitemapRoutes = new Set(
    [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname)
  );

  const site = await importBundled("src/data/site.ts");
  const daily = await importBundled("src/data/dailyReflections.ts");
  const inventory = readJson(path.join(FINAL_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"));
  const sourcePlan = readJson(path.join(FINAL_DIR, "ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json"));
  const similarity = readJson(path.join(FINAL_DIR, "ECHOBUDDHA_NON_ARTICLE_SIMILARITY_AND_TEMPLATE_RISK.json"));
  const byRoute = new Map(inventory.map((entry) => [entry.route, entry]));
  const gates = [];

  const quoteRows = site.quotes.map((quote) => {
    const route = site.getQuoteStoryPath(quote);
    const status = site.getQuoteStatus(quote);
    return {
      route,
      text: quote.text,
      theme: quote.theme,
      status,
      indexable: site.isQuoteStoryIndexable(quote),
      html: htmlForRoute(route),
      inventory: byRoute.get(route)
    };
  });

  const duplicateQuoteText = duplicateGroups(quoteRows, "text");
  gates.push(gate("Unique quote text", duplicateQuoteText.length === 0, { duplicateGroups: duplicateQuoteText }));

  const missingQuoteRoutes = quoteRows.filter((row) => !row.html).map((row) => row.route);
  gates.push(gate("Every quote record has a generated story route", missingQuoteRoutes.length === 0, { missingRoutes: missingQuoteRoutes }));

  const missingStatusLabels = quoteRows
    .filter((row) => !row.html.includes(row.status.label) || !row.html.includes("not presented as a direct Buddha quote"))
    .map((row) => row.route);
  gates.push(gate("Every quote story has visible origin/status disclosure", missingStatusLabels.length === 0, { missingRoutes: missingStatusLabels.slice(0, 25), total: missingStatusLabels.length }));

  const quoteIndexingMismatches = quoteRows
    .map((row) => {
      const noindex = hasNoindex(row.html);
      const inSitemap = currentSitemapRoutes.has(row.route);
      if (row.indexable && noindex) return { route: row.route, issue: "indexable quote story has noindex robots" };
      if (!row.indexable && inSitemap) return { route: row.route, issue: "noindex quote story is present in sitemap" };
      if (row.indexable && !inSitemap) return { route: row.route, issue: "indexable quote story missing from sitemap" };
      return null;
    })
    .filter(Boolean);
  gates.push(gate("Quote story robots and sitemap policy", quoteIndexingMismatches.length === 0, { mismatches: quoteIndexingMismatches }));

  const misleadingQuoteMeta = quoteRows
    .filter((row) => /buddha['’]?\s+quote/i.test([row.inventory?.pageTitle, row.inventory?.h1, row.inventory?.metaDescription].join(" ")))
    .map((row) => row.route);
  gates.push(gate("Quote pages avoid direct-Buddha-quote framing", misleadingQuoteMeta.length === 0, { routes: misleadingQuoteMeta.slice(0, 25), total: misleadingQuoteMeta.length }));

  const reflectionRows = daily.dailyReflections.map((reflection) => {
    const route = `/daily-reflections/${reflection.slug}/`;
    const details = daily.getDailyReflectionDetails(reflection);
    return { ...reflection, route, details };
  });

  gates.push(gate("Unique daily reflection slugs", duplicateGroups(reflectionRows, "slug").length === 0, { duplicateGroups: duplicateGroups(reflectionRows, "slug") }));
  gates.push(gate("Unique daily reflection titles", duplicateGroups(reflectionRows, "title").length === 0, { duplicateGroups: duplicateGroups(reflectionRows, "title") }));

  const missingReflectionDetails = reflectionRows.filter((row) => !row.details).map((row) => row.route);
  gates.push(gate("Every daily reflection has Phase 2 differentiation details", missingReflectionDetails.length === 0, { missingRoutes: missingReflectionDetails }));

  const repeatedReflectionDetails = [
    ...duplicateGroups(reflectionRows.map((row) => ({ route: row.route, value: row.details?.centralObservation ?? "" })), "value"),
    ...duplicateGroups(reflectionRows.map((row) => ({ route: row.route, value: row.details?.dailyLifeSituation ?? "" })), "value"),
    ...duplicateGroups(reflectionRows.map((row) => ({ route: row.route, value: row.details?.nextStep ?? "" })), "value")
  ];
  gates.push(gate("Daily reflection differentiators are not duplicated", repeatedReflectionDetails.length === 0, { duplicateGroups: repeatedReflectionDetails }));

  const reflectionIndexingMismatches = reflectionRows
    .map((row) => {
      const html = htmlForRoute(row.route);
      if (!html) return { route: row.route, issue: "daily reflection detail route is missing" };
      if (!hasNoindex(html)) return { route: row.route, issue: "daily reflection detail is missing noindex" };
      if (currentSitemapRoutes.has(row.route)) return { route: row.route, issue: "noindex daily reflection detail is present in sitemap" };
      return null;
    })
    .filter(Boolean);
  gates.push(gate("Daily reflection robots and sitemap policy", reflectionIndexingMismatches.length === 0, { mismatches: reflectionIndexingMismatches }));

  const today = byRoute.get("/daily-reflections/today/");
  const todaySchemaOk = today?.structuredDataTypes?.includes("WebPage") && !today?.structuredDataTypes?.includes("Article");
  gates.push(gate("Today route is a WebPage utility, not Article schema", Boolean(todaySchemaOk), { schemaTypes: today?.structuredDataTypes ?? [] }));

  const todayHtml = htmlForRoute("/daily-reflections/today/");
  gates.push(gate("Today route uses UTC day-of-year language", /UTC day/i.test(todayHtml), { route: "/daily-reflections/today/" }));

  const sourceReviewNeeded = sourcePlan.filter((entry) => /needed|required/i.test(entry.recommendation) && !/Maintain/.test(entry.recommendation));
  gates.push(gate("Final source review register has no unresolved source-review blockers", sourceReviewNeeded.length === 0, { total: sourceReviewNeeded.length, sample: sourceReviewNeeded.slice(0, 10) }));

  const largestDuplicateSentenceRoutes = Math.max(...similarity.duplicateSentences.map((item) => item.routes.length));
  const largestDuplicateParagraphRoutes = Math.max(...similarity.duplicateParagraphs.map((item) => item.routes.length));
  gates.push(
    gate(
      "Residual duplication is documented for editorial follow-up",
      true,
      {
        duplicateSentenceGroupsRetained: similarity.duplicateSentences.length,
        duplicateParagraphGroupsRetained: similarity.duplicateParagraphs.length,
        largestDuplicateSentenceRoutes,
        largestDuplicateParagraphRoutes
      },
      "warning"
    )
  );

  const errors = gates.filter((item) => item.severity === "error" && !item.passed);
  const warnings = gates.filter((item) => item.severity === "warning");
  const result = {
    checkedAt: new Date().toISOString(),
    passed: errors.length === 0,
    summary: {
      gates: gates.length,
      errors: errors.length,
      warnings: warnings.length,
      quoteRecords: site.quotes.length,
      dailyReflections: daily.dailyReflections.length,
      indexableQuoteStories: quoteRows.filter((row) => row.indexable).length,
      noindexQuoteStories: quoteRows.filter((row) => !row.indexable).length
    },
    gates
  };

  writeFileSync(path.join(OUT_DIR, "PHASE_2_QUALITY_GATE_RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result.summary, null, 2));
  if (!result.passed) process.exitCode = 1;
}

main();
