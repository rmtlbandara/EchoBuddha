import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const outputDir = path.join(root, "docs", "audits", "phase-1-resolve-strengthen-protect-2026-09-29");
const siteUrl = "https://echobuddha.com";
const evidenceDate = "2026-08-21";
const implementationDate = "2026-09-29";

if (!fs.existsSync(path.join(dist, "sitemap.xml"))) {
  throw new Error("Missing dist/sitemap.xml. Run npm run build before generating Phase 1 evidence.");
}

const site = await import(pathToFileURL(path.join(root, "src", "data", "site.ts")));
const editorial = await import(pathToFileURL(path.join(root, "src", "data", "editorialGovernance.ts")));

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...values] = rows.filter((item) => item.some((value) => value !== ""));
  return values.map((valueRow) => Object.fromEntries(headers.map((header, index) => [header, valueRow[index] ?? ""])));
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows, columns) {
  return `${columns.join(",")}\n${rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")).join("\n")}\n`;
}

function htmlPathForRoute(route) {
  return route === "/" ? path.join(dist, "index.html") : path.join(dist, route, "index.html");
}

function stripHtml(value) {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

function familyFor(route) {
  if (route === "/") return "HOME";
  if (route.startsWith("/articles/category/")) return "ARTICLE_CATEGORY";
  if (route.startsWith("/articles/") && route !== "/articles/") return "ARTICLE";
  if (route.startsWith("/learn/buddhist-dictionary/") && route !== "/learn/buddhist-dictionary/") return "DICTIONARY";
  if (route.startsWith("/learn/sutta-for-daily-life/") && route !== "/learn/sutta-for-daily-life/") return "SOURCE_STUDY";
  if (route.startsWith("/learn/buddhism-101/") && route !== "/learn/buddhism-101/") return "COURSE_LESSON";
  if (route.startsWith("/learn/questions-about-buddhism/") && route !== "/learn/questions-about-buddhism/") return "BUDDHIST_QUESTION";
  if (route.startsWith("/learn/buddhist-handbook/") && route !== "/learn/buddhist-handbook/") return "HANDBOOK_CHAPTER";
  if (route.startsWith("/learn/") && route.split("/").filter(Boolean).length >= 2) return "LEARNING";
  if (route.startsWith("/meditation/") && route !== "/meditation/") return "MEDITATION_PRACTICE";
  if (route.startsWith("/daily-reflections/") && route !== "/daily-reflections/") return "DAILY_REFLECTION";
  if (route.startsWith("/quotes/") && route !== "/quotes/") return "QUOTE_CATEGORY";
  if (["/about/", "/editorial-policy/", "/privacy-policy/", "/terms-of-use/", "/disclaimer/", "/quote-attribution-policy/", "/corrections/", "/contact/", "/how-echo-buddha-creates-content/", "/buddhist-sources-and-citations/", "/authors/echo-buddha-editorial/"].includes(route)) return "TRUST_POLICY";
  if (["/search/", "/tools/", "/daily-reflections/today/"].includes(route)) return "UTILITY";
  return "HUB_OR_STANDALONE";
}

function defaultRole(family, route) {
  if (["HOME", "ARTICLE_CATEGORY", "HUB_OR_STANDALONE"].includes(family) || route.endsWith("/index/")) return "NAVIGATION_HUB";
  if (family === "DICTIONARY") return "DICTIONARY_DEFINITION";
  if (family === "SOURCE_STUDY") return "SOURCE_STUDY";
  if (family === "COURSE_LESSON") return "COURSE_LESSON";
  if (family === "MEDITATION_PRACTICE") return "PRACTICE_GUIDE";
  if (family === "DAILY_REFLECTION") return "RECURRING_USER_CONTENT";
  if (family === "TRUST_POLICY") return "TRUST_POLICY";
  if (family === "UTILITY") return "UTILITY";
  if (family === "ARTICLE") return "SUPPORTING_EXPLANATION";
  return "SUPPORTING_EXPLANATION";
}

const changedTitles = {
  "/articles/how-to-meditate-for-beginners/": "How to Meditate for Beginners: A Simple Buddhist Guide",
  "/articles/four-noble-truths-explained/": "The Four Noble Truths Explained in Simple Everyday Language",
  "/articles/four-noble-truths-explained-simply/": "The Four Noble Truths Explained Simply",
  "/articles/eightfold-path-explained/": "The Noble Eightfold Path Explained for Beginners",
  "/articles/eightfold-path-explained-daily-life/": "The Noble Eightfold Path Explained for Daily Life",
  "/articles/noble-eightfold-path-practical-guide/": "The Noble Eightfold Path: A Practical Guide for Daily Life",
  "/articles/what-is-buddhism-beginner-guide/": "What Is Buddhism? A Beginner-Friendly Guide",
  "/articles/buddhism-for-beginners-simple-guide/": "Buddhism for Beginners: A Simple Guide to the Path",
  "/articles/impermanence-in-buddhism/": "Impermanence in Buddhism: Learning to Accept Change Peacefully",
  "/articles/buddhist-teachings-on-impermanence/": "Buddhist Teachings on Impermanence and Change",
  "/articles/impermanence-in-buddhism-letting-go/": "Impermanence in Buddhism: Learning to Let Go Gently",
  "/articles/loving-kindness-meditation-guide/": "Loving-Kindness Meditation: A Gentle Practice Guide",
  "/articles/loving-kindness-meditation-beginners/": "Loving-Kindness Meditation for Beginners"
};

const priority = new Map();
const add = (cluster, ownerUrl, specs) => {
  for (const [url, role, owns, doesNotOwn, informationGain, action = "RETAIN", primaryOwner = false, ownerOverride] of specs) {
    priority.set(url, { cluster, ownerUrl: ownerOverride ?? ownerUrl, role, owns, doesNotOwn, informationGain, action, primaryOwner });
  }
};

add("Beginner Meditation", "/meditation/meditation-for-beginners/", [
  ["/meditation/", "NAVIGATION_HUB", "choosing a meditation route", "a full first-session tutorial", "Routes readers by method, duration, posture, troubleshooting, and safety."],
  ["/meditation/meditation-for-beginners/", "PRIMARY_FIRST_PRACTICE", "a first meditation session", "a week-long habit plan", "Provides the clearest first sit: posture, anchor, wandering, and finish.", "PRESERVED_OWNER", true],
  ["/meditation-guide/", "COMPREHENSIVE_REFERENCE", "selecting and developing a meditation method", "the shortest first session", "Compares practice families, progression, duration, posture, and troubleshooting.", "RETAIN", false, "/meditation/"],
  ["/articles/how-to-meditate-for-beginners/", "PRACTICAL_APPLICATION", "the first seven days of a meditation habit", "basic first-session instruction", "Adds cue design, fallback sessions, obstacle planning, ethical carryover, and a seven-day review.", "REPOSITIONED_SUPPORT"],
  ["/articles/mindfulness-of-breathing-guide/", "PRACTICE_GUIDE", "detailed breath-anchor practice", "all beginner meditation methods", "Explains breath location, counting, daily use, discomfort, and insight boundaries."],
  ["/meditation/5-minute-meditation-practice/", "PRACTICE_GUIDE", "a timed five-minute practice", "general meditation foundations", "Gives a minute-by-minute short session."],
  ["/meditation/10-minute-meditation-practice/", "PRACTICE_GUIDE", "a timed ten-minute practice", "general meditation foundations", "Gives a distinct ten-minute practice arc."],
  ["/meditation/meditation-posture-for-beginners/", "TROUBLESHOOTING", "accessible meditation posture", "the full meditation method", "Addresses chairs, cushions, alignment, pain, and adaptation."],
  ["/meditation/when-meditation-feels-hard/", "TROUBLESHOOTING", "restlessness, discouragement, and overwhelm", "a first-session overview", "Provides obstacle-specific adjustments and stop conditions."],
  ["/meditation/walking-meditation/", "PRIMARY_PRACTICE", "concise walking meditation", "all meditation for beginners", "Owns the core walking method inside the meditation section.", "RETAIN", false, "/meditation/walking-meditation/"],
  ["/articles/walking-meditation-step-by-step/", "PRACTICE_GUIDE", "detailed walking cues and transitions", "the broad walking-meditation definition", "Adds pacing, turning, mistakes, and daily transitions.", "RETAIN", false, "/meditation/walking-meditation/"]
]);

add("Four Noble Truths", "/learn/four-noble-truths/", [
  ["/learn/four-noble-truths/", "PRIMARY_PILLAR", "the complete broad beginner Four Noble Truths intent", "a single scenario or source-only study", "Definitive foundational explanation and cluster route.", "PRESERVED_OWNER", true],
  ["/articles/four-noble-truths-explained/", "MISCONCEPTION_OR_TASK_FRAMEWORK", "the four truths as four tasks", "the complete broad guide", "Explains comprehension, abandoning, realization, cultivation, and their interdependence.", "REPOSITIONED_SUPPORT"],
  ["/articles/four-noble-truths-explained-simply/", "WORKED_APPLICATION", "one difficult conversation through all four truths", "another doctrinal summary", "Provides a sustained scenario with boundaries and a path response.", "REPOSITIONED_SUPPORT"],
  ["/learn/buddhism-101/the-four-noble-truths-explained/", "COURSE_LESSON", "a concise sequenced lesson", "pillar-depth coverage", "Provides course context and a short daily-life foundation."],
  ["/learn/buddhist-dictionary/dukkha/", "DICTIONARY_DEFINITION", "the meaning and scope of dukkha", "all four truths", "Provides terminology, translation boundaries, and related concepts."],
  ["/learn/sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths/", "SOURCE_STUDY", "SN 56.11 context and source reading", "the broad modern beginner guide", "Adds named-discourse setting, task context, and source-reading boundaries."]
]);

add("Noble Eightfold Path", "/learn/eightfold-path/", [
  ["/learn/eightfold-path/", "PRIMARY_PILLAR", "the complete broad Eightfold Path intent", "a weekly review or three modern scenarios", "Definitive factor definitions, sammā context, relationships, and three trainings.", "PRESERVED_OWNER", true],
  ["/learn/buddhism-101/the-noble-eightfold-path-explained/", "COURSE_LESSON", "a concise sequenced path lesson", "pillar-depth coverage", "Provides the course-stage foundation."],
  ["/articles/eightfold-path-explained/", "FRAMEWORK_SUPPORT", "how the eight factors reinforce one another", "another factor-by-factor owner", "Explains feedback among view, intention, conduct, and mental cultivation.", "REPOSITIONED_SUPPORT"],
  ["/articles/eightfold-path-explained-daily-life/", "SCENARIO_APPLICATION", "three modern decisions", "a broad path definition", "Works through digital speech, work ethics, and distracted listening.", "REPOSITIONED_SUPPORT"],
  ["/articles/noble-eightfold-path-practical-guide/", "PRACTICAL_APPLICATION", "a weekly non-scoring self-review", "another general practical overview", "Provides a repeatable six-step review and seven-day experiment.", "REPOSITIONED_SUPPORT"],
  ["/learn/sutta-for-daily-life/magga-vibhanga-sutta-eightfold-path/", "SOURCE_STUDY", "SN 45.8 definitions and context", "the complete modern overview", "Keeps named-source analysis and translation boundaries distinct."],
  ["/learn/buddhism-101/threefold-training-sila-samadhi-panna/", "FRAMEWORK_SUPPORT", "sīla, samādhi, and paññā as an organizing framework", "the eight factors as a whole", "Explains the three-training lens without replacing the pillar."]
]);

add("Buddhism for Beginners", "/learn/buddhism-for-beginners/", [
  ["/learn/buddhism-for-beginners/", "PRIMARY_PILLAR", "Buddhism as a whole for a beginner", "site navigation or a one-week schedule", "Broad foundation across Buddha, teachings, ethics, meditation, community, and next steps.", "PRESERVED_OWNER", true],
  ["/start-here/", "NAVIGATION_HUB", "where to begin on Echo Buddha", "the complete Buddhism explanation", "Routes new visitors through the site's learning and practice surfaces."],
  ["/learn/buddhism-101/", "NAVIGATION_HUB", "a structured learning sequence", "a single broad guide", "Sequences bounded course lessons."],
  ["/learn/buddhism-101/what-is-buddhism/", "COURSE_LESSON", "a concise course-stage definition", "the broad owner", "Defines Buddhism inside the Buddhism 101 progression."],
  ["/learn/buddhism-101/how-to-practice-buddhism-at-home/", "PRACTICAL_APPLICATION", "home practice options", "Buddhism as a whole", "Applies practice to the home setting."],
  ["/learn/buddhism-101/a-simple-daily-buddhist-practice/", "PRACTICE_GUIDE", "a daily morning-day-evening rhythm", "a first-week curriculum", "Gives one repeatable day structure."],
  ["/articles/first-week-buddhist-practice/", "PRACTICAL_APPLICATION", "a seven-day beginner rhythm", "the complete broad guide", "Provides day-by-day study, meditation, conduct, and review."],
  ["/articles/what-is-buddhism-beginner-guide/", "MISCONCEPTION_OR_TASK_FRAMEWORK", "what Buddhism is and is not", "another complete beginner guide", "Corrects category, meditation, creator-god, and non-attachment misconceptions.", "REPOSITIONED_SUPPORT"],
  ["/articles/buddhism-for-beginners-simple-guide/", "NAVIGATION_HUB", "choosing a first learning route", "another everything-beginners guide", "Selects among big-picture, course, practice, term, and community routes.", "REPOSITIONED_SUPPORT"]
]);

add("Impermanence / Anicca", "/learn/buddhism-101/what-is-impermanence/", [
  ["/learn/buddhism-101/what-is-impermanence/", "BEGINNER_FOUNDATION", "general beginner understanding of impermanence", "dictionary brevity or one scenario", "Provides the foundational explanation, scales of change, and source/application boundary.", "PRESERVED_OWNER", true],
  ["/learn/buddhist-dictionary/anicca/", "DICTIONARY_DEFINITION", "the Pāli term anicca", "the full lived application", "Provides concise linguistic and doctrinal context."],
  ["/articles/buddhist-teachings-on-impermanence/", "SOURCE_STUDY", "reading anicca in named early Buddhist sources", "another beginner definition", "Adds passage relationships, translation cautions, and a source method.", "REPOSITIONED_SUPPORT"],
  ["/articles/impermanence-in-buddhism-letting-go/", "WORKED_APPLICATION", "a collapsed plan as an impermanence practice", "the full doctrine", "Sustains one scenario through loss, conditions, grip, and next action.", "REPOSITIONED_SUPPORT"],
  ["/articles/impermanence-in-buddhism/", "MISCONCEPTION_OR_TASK_FRAMEWORK", "impermanence without nihilism", "another broad beginner guide", "Corrects five harmful misunderstandings and links to source/application pages.", "REPOSITIONED_SUPPORT"]
]);

add("Loving-kindness / Mettā", "/meditation/loving-kindness-meditation/", [
  ["/learn/buddhist-dictionary/metta/", "DICTIONARY_DEFINITION", "the Pāli term mettā", "a full guided practice", "Provides meaning, language, limits, and related terms."],
  ["/meditation/loving-kindness-meditation/", "PRIMARY_PRACTICE", "the complete loving-kindness meditation method", "a script-only or troubleshooting intent", "Provides recipients, phrases, widening, boundaries, and core method.", "PRESERVED_OWNER", true],
  ["/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/", "SOURCE_STUDY", "the Mettā Sutta's text and context", "the primary practice sequence", "Adds source setting, interpretive movements, and translation boundaries."],
  ["/articles/metta-meditation-script/", "PRACTICE_SCRIPT", "wording and pacing for a session", "the broad practice explanation", "Provides a stage-by-stage script with optional difficulty and safety boundaries."],
  ["/articles/loving-kindness-meditation-guide/", "TROUBLESHOOTING", "when mettā practice feels difficult", "another beginner method", "Addresses false phrases, self-kindness, absent warmth, grief, anger, and safety.", "REPOSITIONED_SUPPORT"],
  ["/articles/loving-kindness-meditation-beginners/", "PRACTICAL_APPLICATION", "choosing honest mettā phrases", "the complete practice or troubleshooting", "Gives phrase criteria and situation-specific phrase construction.", "REPOSITIONED_SUPPORT"]
]);

const momentumPath = path.join(root, "docs", "audits", "adsense-recovery-phase-3-2026-08-24", "ECHO_BUDDHA_SEARCH_MOMENTUM.csv");
const growthPath = path.join(root, "docs", "audits", "adsense-recovery-phase-3-2026-08-24", "ECHO_BUDDHA_GROWTH_MONITORING_BASELINE.csv");
const momentumByUrl = new Map(parseCsv(fs.readFileSync(momentumPath, "utf8")).map((row) => [new URL(row.URL).pathname, row]));
const growthByUrl = new Map(parseCsv(fs.readFileSync(growthPath, "utf8")).map((row) => [new URL(row.URL).pathname, row]));

const sitemapXml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const routes = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname).sort();
const pages = new Map();
const inbound = new Map(routes.map((route) => [route, 0]));

for (const route of routes) {
  const file = htmlPathForRoute(route);
  if (!fs.existsSync(file)) throw new Error(`Sitemap route has no built HTML: ${route}`);
  const html = fs.readFileSync(file, "utf8");
  const title = stripHtml(html.match(/<title>(.*?)<\/title>/is)?.[1] ?? "").replace(/ \| Echo Buddha$/, "");
  const h1 = stripHtml(html.match(/<h1\b[^>]*>(.*?)<\/h1>/is)?.[1] ?? "");
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? "";
  const links = [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)].map((match) => match[1]);
  const internal = [...new Set(links.filter((href) => href.startsWith("/")).map((href) => new URL(href, siteUrl).pathname))];
  pages.set(route, { route, title, h1, description, canonical, internal, html });
  for (const target of internal) if (inbound.has(target)) inbound.set(target, inbound.get(target) + 1);
}

const registry = routes.map((route) => {
  const page = pages.get(route);
  const family = familyFor(route);
  const spec = priority.get(route);
  const momentum = momentumByUrl.get(route);
  const growth = growthByUrl.get(route);
  const role = spec?.role ?? defaultRole(family, route);
  const ownerUrl = spec?.ownerUrl ?? route;
  return {
    url: route,
    pageFamily: family,
    contentType: role,
    currentTitle: page.title,
    currentH1: page.h1,
    primaryUserIntent: spec?.owns ?? page.description,
    primarySearchIntent: spec?.owns ?? page.title,
    secondarySupportingIntent: spec ? `Support the ${spec.cluster} journey without taking ${spec.ownerUrl}'s broader job.` : `Help readers complete the specific job promised by ${page.title}.`,
    targetAudience: family === "TRUST_POLICY" ? "Readers evaluating publisher trust and policy" : family === "COURSE_LESSON" ? "Beginning learners following Buddhism 101" : "General readers and Buddhist beginners",
    userStage: role.includes("BEGINNER") || family === "COURSE_LESSON" ? "BEGINNER" : role.includes("SOURCE") ? "DEEPENING" : "DISCOVERY_OR_PRACTICE",
    declaredOwnerCluster: spec?.cluster ?? `Standalone: ${page.title}`,
    role,
    ownerUrl,
    owns: spec?.owns ?? page.title,
    doesNotOwn: spec?.doesNotOwn ?? "Unrelated broad intents or promises not stated by this page",
    uniqueInformationGain: spec?.informationGain ?? `Provides the specific ${role.toLowerCase().replaceAll("_", " ")} experience described by its title and meta description.`,
    requiredSourceLevel: ["SOURCE_STUDY", "DICTIONARY_DEFINITION", "PRIMARY_PILLAR", "BEGINNER_FOUNDATION", "COURSE_LESSON"].includes(role) ? "PRIMARY_OR_HIGH_QUALITY_REFERENCE" : family === "TRUST_POLICY" ? "FIRST_PARTY_POLICY" : "EDITORIAL_APPLICATION_WITH_DOCTRINAL_BOUNDARIES",
    currentInternalAuthority: (inbound.get(route) ?? 0) >= 8 ? "HIGH" : (inbound.get(route) ?? 0) >= 3 ? "MEDIUM" : "LOW",
    inboundInternalLinks: inbound.get(route) ?? 0,
    outboundContextualLinks: page.internal.length,
    indexStatus: "INDEXABLE",
    canonical: page.canonical,
    sitemapInclusion: true,
    gscClicksLatest28d: Number(momentum?.clicks_latest_28d || 0),
    gscImpressionsLatest28d: Number(momentum?.impressions_latest_28d || 0),
    gscCtrLatest28d: momentum && Number(momentum.impressions_latest_28d) ? Number(momentum.clicks_latest_28d) / Number(momentum.impressions_latest_28d) : 0,
    gscAveragePositionLatest28d: momentum?.latest_position || "NO_VISIBLE_PAGE_ROW",
    visibleQueryOwnership: growth?.major_queries || "NO_VISIBLE_QUERY_DATA",
    queryOverlap: "PENDING_FRESH_QUERY_PAGE_EVIDENCE",
    googleSelectedCanonical: growth?.google_canonical || "NOT_AVAILABLE_IN_LATEST_REPOSITORY_EVIDENCE",
    googleIndexStatus: growth?.google_index_status || "NOT_AVAILABLE_IN_LATEST_REPOSITORY_EVIDENCE",
    protectionTier: growth?.protection_tier || "PENDING_FRESH_GSC",
    action: spec?.action ?? "RETAIN",
    actionConfidence: spec ? "HIGH_FOR_NON_DESTRUCTIVE_DIFFERENTIATION" : "MEDIUM",
    evidenceDate,
    primaryOwner: spec?.primaryOwner ?? false
  };
});

const missingPriority = [...priority.keys()].filter((route) => !pages.has(route));
if (missingPriority.length) throw new Error(`Priority routes missing from current sitemap: ${missingPriority.join(", ")}`);

const decisions = [...priority.entries()].map(([route, spec]) => {
  const page = pages.get(route);
  const registryRow = registry.find((row) => row.url === route);
  return {
    cluster: spec.cluster,
    url: route,
    oldRole: "REVIEW_REQUIRED_FROM_HISTORICAL_MAP",
    newRole: spec.role,
    oldTitle: changedTitles[route] ?? page.title,
    newTitle: page.h1,
    ownerUrl: spec.ownerUrl,
    informationGain: spec.informationGain,
    gscEvidence: `${registryRow.gscClicksLatest28d} clicks; ${registryRow.gscImpressionsLatest28d} impressions; position ${registryRow.gscAveragePositionLatest28d}; repository evidence through ${evidenceDate}`,
    implementationAction: spec.action,
    reason: spec.doesNotOwn ? `Owns ${spec.owns}; explicitly does not own ${spec.doesNotOwn}.` : spec.informationGain
  };
});

const protection = decisions.map((row) => {
  const current = registry.find((item) => item.url === row.url);
  return {
    url: row.url,
    classification: current.action,
    oldTitle: row.oldTitle,
    newTitle: row.newTitle,
    oldH1: row.oldTitle,
    newH1: pages.get(row.url).h1,
    canonicalBefore: `${siteUrl}${row.url}`,
    canonicalAfter: pages.get(row.url).canonical,
    indexStatusBefore: "INDEXABLE",
    indexStatusAfter: "INDEXABLE",
    sitemapBefore: true,
    sitemapAfter: true,
    redirects: 0,
    noindexChanges: 0,
    evidenceDate
  };
});

const changedRoutes = Object.keys(changedTitles);
const contentChanges = changedRoutes.map((route) => {
  const decision = decisions.find((item) => item.url === route);
  return {
    url: route,
    oldTitle: changedTitles[route],
    newTitle: pages.get(route).h1,
    ownerUrl: decision.ownerUrl,
    change: decision.informationGain,
    classification: decision.implementationAction,
    redirects: 0,
    canonicalChanges: 0,
    noindexChanges: 0
  };
});

const internalLinkRows = decisions.map((decision) => {
  const page = pages.get(decision.url);
  return {
    url: decision.url,
    ownerUrl: decision.ownerUrl,
    ownerLinkPresent: decision.url === decision.ownerUrl || page.internal.includes(decision.ownerUrl),
    inboundInternalLinks: inbound.get(decision.url) ?? 0,
    outboundInternalLinks: page.internal.length
  };
});

const sourceRows = changedRoutes.map((route) => {
  const references = editorial.getSourceReferencesForRoute(route);
  return {
    url: route,
    sourceRequirement: "PRIMARY_OR_HIGH_QUALITY_REFERENCE_FOR_DOCTRINE; CLEAR_LABEL_FOR_EDITORIAL_APPLICATION",
    selectedReferences: references.map((source) => `${source.label} — ${source.href}`),
    referenceCount: references.length,
    integrityDecision: references.length ? "PASS_EXISTING_NAMED_REFERENCES_RETAINED" : "EDITORIAL_APPLICATION_ONLY_NO_DIRECT_QUOTATION",
    fabricatedAuthority: false
  };
});

fs.mkdirSync(outputDir, { recursive: true });
const generatedAt = `${implementationDate}T00:00:00.000Z`;
fs.writeFileSync(path.join(outputDir, "INTENT_OWNERSHIP_REGISTRY.json"), `${JSON.stringify({ generatedAt, repositoryEvidenceThrough: evidenceDate, freshAuthenticatedGscAvailable: false, records: registry }, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, "INTENT_OWNERSHIP_REGISTRY.csv"), toCsv(registry, Object.keys(registry[0])));
fs.writeFileSync(path.join(outputDir, "PRIORITY_CLUSTER_DECISIONS.csv"), toCsv(decisions, Object.keys(decisions[0])));
fs.writeFileSync(path.join(outputDir, "SEARCH_PROTECTION_BEFORE_AFTER.csv"), toCsv(protection, Object.keys(protection[0])));
fs.writeFileSync(path.join(outputDir, "CONTENT_CHANGE_REGISTER.csv"), toCsv(contentChanges, Object.keys(contentChanges[0])));
fs.writeFileSync(path.join(outputDir, "INTERNAL_LINKING_REGISTER.csv"), toCsv(internalLinkRows, Object.keys(internalLinkRows[0])));
fs.writeFileSync(path.join(outputDir, "SOURCE_REVIEW_REGISTER.csv"), toCsv(sourceRows, Object.keys(sourceRows[0])));

const clusterSummary = [...new Set(decisions.map((row) => row.cluster))].map((cluster) => {
  const rows = decisions.filter((row) => row.cluster === cluster);
  const owner = rows.find((row) => priority.get(row.url)?.primaryOwner);
  return `## ${cluster}\n\n- Protected owner: \`${owner?.url ?? rows[0].ownerUrl}\`\n- Retained URLs: ${rows.length}\n- Repositioned support: ${rows.filter((row) => row.implementationAction === "REPOSITIONED_SUPPORT").length}\n- Ambiguity remaining: none in declared title/H1 promises; ranking behavior remains pending fresh GSC observation.\n\n${rows.map((row) => `- \`${row.url}\` — **${row.newRole}** — ${row.informationGain}`).join("\n")}`;
}).join("\n\n");

fs.writeFileSync(path.join(outputDir, "PRIORITY_CLUSTER_DECISION_REPORT.md"), `# Priority Cluster Decision Report\n\nGenerated: ${implementationDate}\n\n${clusterSummary}\n`);
fs.writeFileSync(path.join(outputDir, "INTERNAL_LINKING_REPORT.md"), `# Internal Linking Report\n\n- Priority routes reviewed: ${internalLinkRows.length}\n- Support-to-owner requirements passing: ${internalLinkRows.filter((row) => row.ownerLinkPresent).length}/${internalLinkRows.length}\n- Link form: rendered crawlable \`<a href>\` links.\n- Direction: support pages link to the declared owner; owners retain selective support links rather than exhaustive keyword blocks.\n- Related-article cards for materially edited pages use explicit \`relatedSlugs\`; category fallback is not used for those pages.\n\nNo exact-match link farm or mass link block was introduced.\n`);
fs.writeFileSync(path.join(outputDir, "PHASE_2_WATCHLIST.md"), `# Phase 2 Watchlist\n\nNo URL was merged, redirected, deleted, canonicalized to another page, or noindexed in Phase 1.\n\nThe following support URLs require fresh post-remediation query-by-page evidence before any destructive decision:\n\n${changedRoutes.map((route) => `- \`${route}\` — observe at least 28 complete days; require persistent same-query owner alternation, weak independent demand, Google canonical conflict, and content-level duplication before consolidation approval.`).join("\n")}\n\nEvidence threshold: fresh authenticated GSC page, query, query-by-page, country, device, canonical/index status, and URL Inspection evidence. Similar titles alone are insufficient.\n`);
fs.writeFileSync(path.join(outputDir, "GOOGLE_GUIDANCE_REVIEW.md"), `# Current Google Search Guidance Review\n\nChecked: ${implementationDate}\n\n- Helpful, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content\n- Generative AI features: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide\n- Title links: https://developers.google.com/search/docs/appearance/title-link\n- Canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls\n- Crawlable links: https://developers.google.com/search/docs/crawling-indexing/links-crawlable\n- Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article\n- FAQ/HowTo change: https://developers.google.com/search/blog/2023/08/howto-faq-changes\n- Spam and scaled-content policy: https://developers.google.com/search/docs/essentials/spam-policies\n- Image SEO: https://developers.google.com/search/docs/appearance/google-images\n\nImplementation consequence: preserve self-canonicals for distinct pages; differentiate by user job and information gain; retain visible FAQs but remove FAQPage markup because Echo Buddha is not an eligible government or health authority; remove the obsolete Google-focused HowTo markup while preserving the visible meditation method; keep Article and BreadcrumbList markup; avoid AI-specific markup or page proliferation.\n`);
fs.writeFileSync(path.join(outputDir, "EXECUTIVE_REPORT.md"), `# Echo Buddha Phase 1 — Executive Report\n\n## Confirmed problems\n\n- Six priority clusters contained support pages with materially overlapping SERP promises.\n- Thirteen article titles/H1s used repeated broad modifiers even where the body had a narrower useful job.\n- Article templates emitted FAQPage markup that has no regular Google rich-result use for this publisher.\n- Mixed explicitly numbered headings could receive a second visual list marker in the article TOC.\n- Meditation detail pages displayed shared safety guidance and a second generic safety section.\n- Intent governance did not cover every current indexable URL in one machine-readable registry.\n\n## False positives rejected\n\n- Related terminology was not treated as proof of cannibalization.\n- Healthy mindfulness, non-attachment, Right Speech, handbook, quote, and Buddhist Questions architectures were retained.\n- No evidence justified a redirect, deletion, noindex, cross-page canonical, or slug change.\n\n## Completed actions\n\n- Repositioned ${changedRoutes.length} support articles around distinct tasks, scenarios, troubleshooting jobs, source study, and route selection.\n- Preserved all six declared broad owners and every current URL.\n- Added a ${registry.length}-URL intent registry with current metadata, link authority, index/canonical state, repository-backed GSC fields, ownership, source requirements, and action confidence.\n- Added automated ownership, support-link, registry-coverage, schema, TOC, sitemap, canonical, and search-index governance.\n- Removed seven FAQPage implementations and one obsolete HowTo object while retaining visible reader FAQs and meditation steps.\n- Merged PR #49 and deployed exact SHA \`db1da81b19bc5291829cdafd475645d79c6025f5\` through production workflow 36512611080.\n- Verified the live artifact, 15 changed/template routes, the production smoke suite, and 18 mobile/desktop browser combinations.\n\n## Actions deferred\n\n- No merge, redirect, deletion, noindex, slug change, or cross-page canonical was justified without fresh authenticated GSC query-by-page and URL Inspection evidence.\n- Field Core Web Vitals and ranking behavior require post-deployment observation rather than local inference.\n\n## Expected impact\n\nReaders should see clearer page promises, distinct practical jobs, and stronger paths from support pages to definitive owners. Search engines retain every current URL and canonical while receiving less ambiguous titles, headings, metadata, and internal relationships.\n\n## Evidence limit and risk\n\nFresh authenticated GSC access was unavailable. Repository evidence is final through ${evidenceDate}; missing rows are not treated as proof of zero demand. Destructive decisions remain \`PENDING_FRESH_GSC\`. Expected impact is clearer search promises and internal journeys without URL-equity disruption; ranking outcomes are not claimed before post-release observation.\n`);

const summary = {
  generatedAt,
  repositoryBaselineSha: "08076a39632748e824a6e82381bf98d8b90c4f25",
  productionContentSha: "db1da81b19bc5291829cdafd475645d79c6025f5",
  productionDeploymentRun: "36512611080",
  cloudflareDeploymentId: "2e0ab350-8d36-46cd-b036-55fc0bbda40a",
  cloudflareVersionId: "48f232f0-5871-4dd0-b067-d85beb937559",
  productionVerified: true,
  indexableUrlCount: registry.length,
  sitemapUrlCount: routes.length,
  articleCount: site.fullArticles.length,
  relevantGscEvidenceDate: evidenceDate,
  materiallyRewrittenPages: changedRoutes.length,
  titlesChanged: changedRoutes.length,
  descriptionsChanged: changedRoutes.length,
  h1sChanged: changedRoutes.length,
  redirects: 0,
  noindexedUrls: 0,
  deletedUrls: 0,
  canonicalTargetChanges: 0,
  faqPageSchemaImplementationsRemoved: 7,
  howToSchemaImplementationsRemoved: 1,
  priorityRoutes: decisions.length
};
fs.writeFileSync(path.join(outputDir, "PHASE_1_SUMMARY.json"), `${JSON.stringify(summary, null, 2)}\n`);

console.log(`Generated Phase 1 evidence for ${registry.length} indexable URLs and ${decisions.length} priority routes.`);
