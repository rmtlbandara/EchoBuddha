import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PHASE_DIR = path.join(ROOT, "docs", "audits", "non-articles", "implementation", "phase-1");
const BEFORE = path.join(PHASE_DIR, "baseline", "PHASE_1_PRESERVATION_BASELINE.before.json");
const AFTER = path.join(PHASE_DIR, "post", "ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json");
const OUT = path.join(PHASE_DIR, "PHASE_1_PRESERVATION_VALIDATION.json");

const allowed = {
  addedExternalHrefs: true,
  addedInternalSearchMembership: [
    "/",
    "/about/",
    "/authors/echo-buddha-editorial/",
    "/contact/",
    "/editorial-policy/",
    "/learn/",
    "/learn/buddhism-101/",
    "/learn/buddhist-dictionary/",
    "/learn/dhammapada-reflections/",
    "/learn/sutta-for-daily-life/",
    "/meditation/",
    "/meditation-guide/"
  ],
  addedSchemaTypes: {
    "/about/": ["AboutPage"],
    "/authors/echo-buddha-editorial/": ["ProfilePage"],
    "/contact/": ["ContactPage"],
    "/privacy-policy/": ["PrivacyPolicy"]
  }
};

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function sameArray(a = [], b = []) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

function internal(href) {
  return href.startsWith("/") || href.startsWith("https://echobuddha.com");
}

function validate() {
  if (!existsSync(BEFORE)) throw new Error(`Missing baseline: ${BEFORE}`);
  if (!existsSync(AFTER)) throw new Error(`Missing post baseline: ${AFTER}`);

  const before = readJson(BEFORE);
  const after = readJson(AFTER);
  const beforeMap = new Map(before.urls.map((item) => [item.route, item]));
  const afterMap = new Map(after.urls.map((item) => [item.route, item]));
  const failures = [];
  const warnings = [];
  const intentionalChanges = [];

  for (const [route, item] of beforeMap) {
    const current = afterMap.get(route);
    if (!current) {
      failures.push({ route, field: "route", before: "present", after: "missing" });
      continue;
    }

    for (const field of ["url", "slug", "canonical"]) {
      if (item[field] !== current[field]) {
        failures.push({ route, field, before: item[field], after: current[field] });
      }
    }

    if (!sameArray(item.headingIds, current.headingIds)) {
      failures.push({ route, field: "headingIds", before: item.headingIds, after: current.headingIds });
    }

    const beforeInternal = item.hrefs.filter(internal);
    const afterInternal = current.hrefs.filter(internal);
    if (!sameArray(beforeInternal, afterInternal)) {
      failures.push({ route, field: "internal hrefs", before: beforeInternal, after: afterInternal });
    }

    const beforeExternal = item.hrefs.filter((href) => !internal(href));
    const afterExternal = current.hrefs.filter((href) => !internal(href));
    const removedExternal = beforeExternal.filter((href) => !afterExternal.includes(href));
    const addedExternal = afterExternal.filter((href) => !beforeExternal.includes(href));
    if (removedExternal.length) {
      failures.push({ route, field: "external hrefs removed", before: beforeExternal, after: afterExternal });
    }
    if (addedExternal.length) {
      intentionalChanges.push({ route, field: "external hrefs added", added: addedExternal });
    }

    const beforeSchemas = item.schemaTypes ?? [];
    const afterSchemas = current.schemaTypes ?? [];
    const permittedAddedSchemas = allowed.addedSchemaTypes[route] ?? [];
    const illegalRemovedSchemas = beforeSchemas.filter((schema) => !afterSchemas.includes(schema));
    const illegalAddedSchemas = afterSchemas.filter((schema) => !beforeSchemas.includes(schema) && !permittedAddedSchemas.includes(schema));
    if (illegalRemovedSchemas.length || illegalAddedSchemas.length) {
      failures.push({ route, field: "schemaTypes", before: beforeSchemas, after: afterSchemas, allowedAdded: permittedAddedSchemas });
    }
    const addedSchemas = afterSchemas.filter((schema) => !beforeSchemas.includes(schema));
    if (addedSchemas.length) {
      intentionalChanges.push({ route, field: "schemaTypes added", added: addedSchemas });
    }

    const beforeDates = item.dateValues ?? {};
    const afterDates = current.dateValues ?? {};
    if (JSON.stringify(beforeDates) !== JSON.stringify(afterDates)) {
      failures.push({ route, field: "dateValues", before: beforeDates, after: afterDates });
    }

    if (item.sitemapMembership !== current.sitemapMembership) {
      failures.push({ route, field: "sitemapMembership", before: item.sitemapMembership, after: current.sitemapMembership });
    }
    if (item.internalSearchMembership !== current.internalSearchMembership) {
      if (!item.internalSearchMembership && current.internalSearchMembership && allowed.addedInternalSearchMembership.includes(route)) {
        intentionalChanges.push({ route, field: "internalSearchMembership", before: item.internalSearchMembership, after: current.internalSearchMembership });
      } else {
        failures.push({ route, field: "internalSearchMembership", before: item.internalSearchMembership, after: current.internalSearchMembership });
      }
    }

    const beforeRelationships = item.contentRelationships ?? {};
    const afterRelationships = current.contentRelationships ?? {};
    for (const rel of ["articleReferences", "learningHubReferences", "quoteReferences", "toolReferences"]) {
      if (!sameArray(beforeRelationships[rel], afterRelationships[rel])) {
        failures.push({ route, field: rel, before: beforeRelationships[rel], after: afterRelationships[rel] });
      }
    }
  }

  for (const route of afterMap.keys()) {
    if (!beforeMap.has(route)) {
      failures.push({ route, field: "route", before: "missing", after: "present" });
    }
  }

  const result = {
    checkedAt: new Date().toISOString(),
    beforeRoutes: before.urls.length,
    afterRoutes: after.urls.length,
    passed: failures.length === 0,
    failures,
    warnings,
    intentionalChanges
  };

  writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`);
  if (!result.passed) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(result, null, 2));
}

validate();
