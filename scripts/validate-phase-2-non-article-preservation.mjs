import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "docs", "audits", "non-articles", "implementation", "phase-2");
const ORIGINAL = path.join(ROOT, "docs", "audits", "non-articles", "ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json");
const PHASE2_BASELINE = path.join(OUT_DIR, "baseline", "ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json");
const FINAL = path.join(OUT_DIR, "final", "ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json");

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function byRoute(data) {
  return new Map(data.urls.map((entry) => [entry.route, entry]));
}

function stable(value) {
  return JSON.stringify(value ?? null);
}

function sorted(value = []) {
  return [...value].sort();
}

function setDiff(left = [], right = []) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

function sameSet(left = [], right = []) {
  return setDiff(left, right).length === 0 && setDiff(right, left).length === 0;
}

function pushFailure(failures, route, field, before, after, message) {
  failures.push({ route, field, before, after, message });
}

function pushIntentional(intentionalChanges, route, field, before, after, reason) {
  intentionalChanges.push({ route, field, before, after, reason });
}

function compareStrictPreservation(label, beforeMap, afterMap, options = {}) {
  const failures = [];
  const warnings = [];
  const intentionalChanges = [];
  const beforeRoutes = sorted([...beforeMap.keys()]);
  const afterRoutes = sorted([...afterMap.keys()]);

  for (const route of setDiff(beforeRoutes, afterRoutes)) {
    pushFailure(failures, route, "routeSet", true, false, `${label}: route was removed`);
  }
  for (const route of setDiff(afterRoutes, beforeRoutes)) {
    pushFailure(failures, route, "routeSet", false, true, `${label}: route was added`);
  }

  for (const route of beforeRoutes.filter((item) => afterMap.has(item))) {
    const before = beforeMap.get(route);
    const after = afterMap.get(route);

    for (const field of ["url", "slug", "canonical"]) {
      if ((before[field] ?? "") !== (after[field] ?? "")) {
        pushFailure(failures, route, field, before[field], after[field], `${label}: ${field} changed`);
      }
    }

    const missingHeadingIds = setDiff(before.headingIds ?? [], after.headingIds ?? []);
    if (missingHeadingIds.length) {
      pushFailure(failures, route, "headingIds", before.headingIds, after.headingIds, `${label}: existing heading IDs were removed`);
    }

    const missingHrefs = setDiff(before.hrefs ?? [], after.hrefs ?? []);
    if (missingHrefs.length) {
      pushFailure(failures, route, "hrefs", missingHrefs, after.hrefs, `${label}: existing internal href destinations were removed`);
    }

    if (stable(before.categoriesAndCollections) !== stable(after.categoriesAndCollections)) {
      pushFailure(
        failures,
        route,
        "categoriesAndCollections",
        before.categoriesAndCollections,
        after.categoriesAndCollections,
        `${label}: category or collection relationship changed`
      );
    }

    for (const field of [
      "inboundLinks",
      "relatedContentReferences",
      "articleReferences",
      "learningHubReferences",
      "quoteReferences",
      "toolReferences"
    ]) {
      const beforeList = before.contentRelationships?.[field] ?? [];
      const afterList = after.contentRelationships?.[field] ?? [];
      const existingRemoved = setDiff(beforeList, afterList);
      const changed = options.allowRelationshipAdditions ? existingRemoved.length > 0 : !sameSet(beforeList, afterList);
      if (changed) {
        pushFailure(
          failures,
          route,
          `contentRelationships.${field}`,
          beforeList,
          afterList,
          `${label}: content relationship set changed`
        );
      }
    }

    if ("sitemapMembership" in before && before.sitemapMembership !== after.sitemapMembership) {
      pushFailure(failures, route, "sitemapMembership", before.sitemapMembership, after.sitemapMembership, `${label}: sitemap membership changed`);
    }

    if ("internalSearchMembership" in before && before.internalSearchMembership !== after.internalSearchMembership) {
      const allowed = options.allowSearchAdditions && before.internalSearchMembership === false && after.internalSearchMembership === true;
      if (allowed) {
        pushIntentional(intentionalChanges, route, "internalSearchMembership", before.internalSearchMembership, after.internalSearchMembership, "Phase 1 intentionally added selected non-article routes to internal search.");
      } else {
        pushFailure(failures, route, "internalSearchMembership", before.internalSearchMembership, after.internalSearchMembership, `${label}: internal search membership changed`);
      }
    }

    const beforeSchema = before.schemaTypes ?? [];
    const afterSchema = after.schemaTypes ?? [];
    const schemaChanged = !sameSet(beforeSchema, afterSchema);
    const todaySchemaCorrection =
      route === "/daily-reflections/today/" &&
      beforeSchema.includes("Article") &&
      !afterSchema.includes("Article") &&
      afterSchema.includes("WebPage");
    const originalSchemaAddOnly = options.allowSchemaAdditions && setDiff(beforeSchema, afterSchema).length === 0;
    if (schemaChanged && todaySchemaCorrection) {
      pushIntentional(intentionalChanges, route, "schemaTypes", beforeSchema, afterSchema, "Phase 2 intentionally reclassified the recurring Today utility route from Article to WebPage.");
    } else if (schemaChanged && originalSchemaAddOnly) {
      pushIntentional(intentionalChanges, route, "schemaTypes", beforeSchema, afterSchema, "Earlier implementation added structured-data support without removing existing schema types.");
    } else if (schemaChanged) {
      pushFailure(failures, route, "schemaTypes", beforeSchema, afterSchema, `${label}: schema type set changed`);
    }

    if (stable(before.dateValues) !== stable(after.dateValues)) {
      pushFailure(failures, route, "dateValues", before.dateValues, after.dateValues, `${label}: date values changed`);
    }
  }

  return {
    label,
    beforeRoutes: beforeRoutes.length,
    afterRoutes: afterRoutes.length,
    passed: failures.length === 0,
    failures,
    warnings,
    intentionalChanges
  };
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const original = byRoute(readJson(ORIGINAL));
  const phase2Baseline = byRoute(readJson(PHASE2_BASELINE));
  const final = byRoute(readJson(FINAL));

  const phase2 = compareStrictPreservation("Phase 2 baseline to final", phase2Baseline, final);
  const originalToFinal = compareStrictPreservation("Original pre-implementation to final", original, final, {
    allowSearchAdditions: true,
    allowSchemaAdditions: true,
    allowRelationshipAdditions: true
  });

  const result = {
    checkedAt: new Date().toISOString(),
    passed: phase2.passed && originalToFinal.passed,
    phase2BaselineToFinal: phase2,
    originalPreImplementationToFinal: originalToFinal,
    summary: {
      phase2RoutesBefore: phase2.beforeRoutes,
      phase2RoutesAfter: phase2.afterRoutes,
      originalRoutesBefore: originalToFinal.beforeRoutes,
      finalRoutesAfter: originalToFinal.afterRoutes,
      failures: phase2.failures.length + originalToFinal.failures.length,
      warnings: phase2.warnings.length + originalToFinal.warnings.length,
      intentionalChanges: phase2.intentionalChanges.length + originalToFinal.intentionalChanges.length
    }
  };

  writeFileSync(path.join(OUT_DIR, "PHASE_2_PRESERVATION_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result.summary, null, 2));
  if (!result.passed) process.exitCode = 1;
}

main();
