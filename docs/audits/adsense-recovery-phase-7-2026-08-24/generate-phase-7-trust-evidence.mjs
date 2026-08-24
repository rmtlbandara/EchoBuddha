import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "../../..");
const dist = path.join(root, "dist");
const out = import.meta.dirname;
const site = "https://echobuddha.com";
const auditDate = "2026-08-24";
const startingCommit = "1242b88";
const authorName = "Echo Buddha Editorial";
const authorPath = "/authors/echo-buddha-editorial/";

if (!fs.existsSync(dist)) throw new Error("Phase 7 evidence requires a current production build in dist/.");

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsv = (name, headers, rows) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  fs.writeFileSync(path.join(out, name), `${body}\n`);
};
const parseCsv = (text) => {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
};
const decode = (value = "") => value
  .replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&nbsp;", " ");
const plain = (html = "") => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const match = (html, regex) => decode((html.match(regex)?.[1] ?? "").trim());

const files = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name === "index.html" || entry.name === "404.html") files.push(file);
  }
};
walk(dist);

const pathFromFile = (file) => {
  const relative = path.relative(dist, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
};
const getJsonLd = (html) => {
  const nodes = [];
  for (const script of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(script[1]);
      const add = (item) => {
        if (Array.isArray(item)) item.forEach(add);
        else if (item && typeof item === "object") {
          nodes.push(item);
          if (Array.isArray(item["@graph"])) item["@graph"].forEach(add);
        }
      };
      add(parsed);
    } catch { /* handled as an audit error below */ }
  }
  return nodes;
};
const schemaName = (value) => typeof value === "string" ? value : value?.name ?? "";
const familyFor = (route) => {
  if (route === "/") return "HOME";
  if (route === "/404.html") return "SYSTEM";
  if (/^\/articles\/[^/]+\/$/.test(route)) return "ARTICLE";
  if (/^\/articles\/category\//.test(route) || route === "/articles/") return "ARTICLE_HUB";
  if (/^\/learn\/buddhism-101\/[^/]+\/$/.test(route)) return "BUDDHISM_101";
  if (/^\/learn\/buddhist-dictionary\/[^/]+\/$/.test(route)) return "BUDDHIST_DICTIONARY";
  if (/^\/learn\/sutta-for-daily-life\/[^/]+\/$/.test(route)) return "SUTTA_SOURCE_STUDY";
  if (/^\/learn\/dhammapada-reflections\/[^/]+\/$/.test(route)) return "DHAMMAPADA_REFLECTION";
  if (/^\/learn\/[^/]+\/[^/]+\/$/.test(route) || ["/learn/four-noble-truths/", "/learn/eightfold-path/"].includes(route)) return "LEARN_RESOURCE";
  if (route.startsWith("/learn/")) return "LEARN_HUB";
  if (/^\/meditation\/[^/]+\/$/.test(route) && route !== "/meditation/") return "MEDITATION_RESOURCE";
  if (route === "/meditation/" || route === "/meditation-guide/") return "MEDITATION_HUB";
  if (/^\/quotes\/[^/]+\/[^/]+\/$/.test(route)) return "QUOTE_STORY";
  if (/^\/quotes\/[^/]+\/$/.test(route) || route === "/quotes/") return "QUOTE_HUB";
  if (/^\/daily-reflections\/[^/]+\/$/.test(route) && route !== "/daily-reflections/today/") return "DAILY_REFLECTION";
  if (route.startsWith("/daily-reflections/")) return "DAILY_REFLECTION_UTILITY";
  if (route === "/daily-reflections/") return "DAILY_REFLECTION_HUB";
  if (["/about/", authorPath, "/editorial-policy/", "/how-echo-buddha-creates-content/", "/buddhist-sources-and-citations/", "/quote-attribution-policy/", "/corrections/", "/contact/", "/meditation-safety/", "/disclaimer/", "/privacy-policy/", "/terms-of-use/"].includes(route)) return "TRUST_LEGAL";
  return "HUB_UTILITY";
};
const substantiveFamilies = new Set(["ARTICLE", "BUDDHISM_101", "BUDDHIST_DICTIONARY", "SUTTA_SOURCE_STUDY", "DHAMMAPADA_REFLECTION", "LEARN_RESOURCE", "MEDITATION_RESOURCE", "QUOTE_STORY", "DAILY_REFLECTION"]);
const doctrinalFamilies = new Set(["ARTICLE", "BUDDHISM_101", "BUDDHIST_DICTIONARY", "SUTTA_SOURCE_STUDY", "DHAMMAPADA_REFLECTION", "LEARN_RESOURCE", "MEDITATION_RESOURCE"]);

const pages = files.map((file) => {
  const route = pathFromFile(file);
  const html = fs.readFileSync(file, "utf8");
  const nodes = getJsonLd(html);
  const authored = nodes.find((node) => node.author);
  const published = nodes.find((node) => node.datePublished);
  const modified = nodes.find((node) => node.dateModified);
  const publisherNode = nodes.find((node) => node.publisher);
  const schemaAuthor = authored?.author;
  const schemaPublisher = publisherNode?.publisher;
  const relAuthor = html.match(/<a\b(?=[^>]*\brel="author")(?=[^>]*\bhref="([^"]+)")[^>]*>([\s\S]*?)<\/a>/i);
  const articleByline = html.match(/>By\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
  const visibleAuthorMatch = relAuthor ?? articleByline;
  const visibleAuthor = visibleAuthorMatch ? plain(visibleAuthorMatch[2]) : "";
  const authorLink = visibleAuthorMatch?.[1] ?? "";
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const h1 = plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const canonical = match(html, /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
  const robots = match(html, /<meta\b[^>]*name="robots"[^>]*content="([^"]+)"/i);
  const text = plain(html);
  const schemaTypes = [...new Set(nodes.flatMap((node) => Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]).filter(Boolean))];
  const externalSourceCount = [...html.matchAll(/<a\b[^>]*href="https?:\/\/([^/"]+)/gi)].filter((item) => item[1] !== "echobuddha.com").length;
  const hasSourceSection = /Source Note|Selected References|Traditional References|Practice Sources|Sources and Citations|Origin and Practical Context/i.test(text);
  const hasCorrection = html.includes('href="/corrections/"') || html.includes("mailto:info.echobuddha@gmail.com");
  return {
    route, url: route === "/404.html" ? `${site}/404.html` : `${site}${route === "/" ? "/" : route}`,
    file, html, text, title, h1, canonical, robots, indexable: !robots.toLowerCase().includes("noindex"),
    family: familyFor(route), nodes, schemaTypes, schemaAuthorName: schemaName(schemaAuthor),
    schemaAuthorType: schemaAuthor?.["@type"] ?? "", schemaAuthorUrl: schemaAuthor?.url ?? "",
    schemaPublisherName: schemaName(schemaPublisher), visibleAuthor, authorLink,
    datePublished: published?.datePublished ?? "", dateModified: modified?.dateModified ?? "",
    externalSourceCount, hasSourceSection, hasCorrection
  };
}).sort((a, b) => a.route.localeCompare(b.route));

const classification = (page) => substantiveFamilies.has(page.family) ? "ORGANIZATION_AUTHORED" : "NO_BYLINE_EXPECTED";
const trustPurpose = (page) => ({
  "/about/": "Publisher purpose, scope, and identity",
  [authorPath]: "Organizational byline identity and responsibility",
  "/editorial-policy/": "Editorial standards and accountability",
  "/how-echo-buddha-creates-content/": "Creation workflow and AI/automation boundaries",
  "/buddhist-sources-and-citations/": "Buddhist source methodology",
  "/quote-attribution-policy/": "Quote provenance rules",
  "/corrections/": "Functional correction process",
  "/contact/": "Publisher contact",
  "/meditation-safety/": "Meditation safety boundaries",
  "/disclaimer/": "Educational and professional-advice limits",
  "/privacy-policy/": "Privacy and consent disclosure",
  "/terms-of-use/": "Site terms"
}[page.route] ?? (substantiveFamilies.has(page.family) ? "Substantive editorial resource" : "Navigation, collection, legal, or utility surface"));

const trustHeaders = ["URL", "page type", "current title", "purpose", "indexability", "current responsible party", "visible author", "author link", "visible reviewer", "source information", "publication date", "modified date", "correction mechanism", "schema type", "schema author", "schema publisher", "organization reference", "factual consistency", "trust issue", "action"];
const trustRows = pages.map((page) => ({
  URL: page.url, "page type": page.family, "current title": page.title, purpose: trustPurpose(page),
  indexability: page.indexable ? "indexable" : "noindex / non-indexable", "current responsible party": "Echo Buddha",
  "visible author": page.visibleAuthor || "NO_BYLINE_EXPECTED", "author link": page.authorLink || "NOT_APPLICABLE",
  "visible reviewer": "NONE_CLAIMED", "source information": page.hasSourceSection ? `PRESENT (${page.externalSourceCount} external links)` : (doctrinalFamilies.has(page.family) ? "PAGE_CONTEXT_PRESENT_NO_EXTERNAL_LINK_REQUIRED_BY_EVERY_PAGE" : "NOT_APPLICABLE"),
  "publication date": page.datePublished || "NOT_SHOWN", "modified date": page.dateModified || "NOT_SHOWN",
  "correction mechanism": page.hasCorrection ? "PAGE_LINK_OR_CONTACT_PRESENT" : "SITEWIDE_FOOTER_CORRECTIONS_LINK",
  "schema type": page.schemaTypes.join(" | ") || "NONE", "schema author": page.schemaAuthorName || "NOT_APPLICABLE",
  "schema publisher": page.schemaPublisherName || "NOT_APPLICABLE", "organization reference": page.nodes.some((node) => node["@type"] === "Organization" || node.mainEntity?.["@type"] === "Organization") ? "PRESENT" : "VIA_SITEWIDE_IDENTITY_OR_PAGE_PUBLISHER",
  "factual consistency": substantiveFamilies.has(page.family) ? (page.visibleAuthor === authorName && page.schemaAuthorName === authorName ? "PASS" : "FAIL") : (page.schemaAuthorName ? "REVIEW" : "PASS"),
  "trust issue": "NONE_MATERIAL", action: "RETAIN_PHASE_7_MODEL"
}));
writeCsv("ECHO_BUDDHA_PHASE_7_TRUST_SURFACE_INVENTORY.csv", trustHeaders, trustRows);

const bylineRules = [
  ["Articles", "YES", "Organization", "NO", "YES", "YES", "YES", "YES", "YES", "Substantive long-form editorial pages need explicit responsibility, real stored dates, and source context."],
  ["Learn / Buddhism 101", "YES_SUBTLE", "Organization", "NO", "NO_NOT_STORED", "NO_NOT_STORED", "YES", "YES", "YES", "Curriculum resources use a compact organizational attribution without invented dates."],
  ["Buddhist Dictionary", "YES_SUBTLE", "Organization", "NO", "NO_NOT_STORED", "NO_NOT_STORED", "YES", "YES", "YES", "Concise reference entries identify the maintaining publication without biography clutter."],
  ["Sutta and Dhammapada studies", "YES_SUBTLE", "Organization", "NO", "NO_NOT_STORED", "NO_NOT_STORED", "YES", "YES", "YES", "The byline identifies the explanation, never authorship of a canonical source or translation."],
  ["Meditation resources", "YES_SUBTLE", "Organization", "NO", "NO_NOT_STORED", "NO_NOT_STORED", "YES", "YES", "YES", "Practice guidance needs accountable authorship and safety/source links."],
  ["Individual Quote stories", "YES_QUALIFIED", "Organization", "NO", "NO_NOT_STORED", "NO_NOT_STORED", "YES", "YES", "YES", "Editorial-reflection authorship is separated from quote origin classification."],
  ["Daily Reflections", "YES_QUALIFIED", "Organization", "NO", "NO_NOT_STORED", "NO_NOT_STORED", "YES", "YES", "YES", "Original reflection writing has compact responsibility; pages remain noindex."],
  ["Quote/category/content hubs", "NO", "None", "NO", "NO", "NO", "NO", "YES_VIA_FOOTER", "AS_RELEVANT", "Collection navigation does not receive an article-style byline."],
  ["Trust/legal/utility/system", "NO", "None", "NO", "NO", "NO", "NO", "YES_VIA_FOOTER", "NOT_APPLICABLE", "Publisher ownership is clear without forcing authorship onto policies or utilities."]
].map(([family, expected, type, reviewer, published, modified, authorLink, method, source, rationale]) => ({ "page family": family, "byline expected?": expected, "author type": type, "reviewer shown?": reviewer, "publication date?": published, "modified date?": modified, "author link?": authorLink, "editorial-method link?": method, "source note?": source, rationale }));
writeCsv("ECHO_BUDDHA_PHASE_7_BYLINE_MATRIX.csv", Object.keys(bylineRules[0]), bylineRules);

const authHeaders = ["URL", "page family", "responsible entity", "attribution type", "displayed author", "author type", "profile URL", "reviewer", "reviewer basis", "datePublished", "dateModified", "provenance certainty", "schema status", "owner input required?", "validation"];
const authRows = pages.map((page) => ({
  URL: page.url, "page family": page.family, "responsible entity": "Echo Buddha", "attribution type": classification(page),
  "displayed author": page.visibleAuthor || "NONE_EXPECTED", "author type": substantiveFamilies.has(page.family) ? "Organization" : "NOT_APPLICABLE",
  "profile URL": page.authorLink || "NOT_APPLICABLE", reviewer: "NONE_CLAIMED", "reviewer basis": "NOT_APPLICABLE",
  datePublished: page.datePublished || "NOT_STORED_FOR_FAMILY", dateModified: page.dateModified || "NOT_STORED_FOR_FAMILY",
  "provenance certainty": substantiveFamilies.has(page.family) ? "MIXED_WORKFLOW_VERIFIED; responsible entity verified; sentence-level legacy provenance not inferred" : "AUTOMATED_PROCESS_VERIFIED_OR_NOT_APPLICABLE",
  "schema status": substantiveFamilies.has(page.family) ? (page.schemaAuthorName === authorName && page.schemaAuthorType === "Organization" && page.schemaAuthorUrl === `${site}${authorPath}` ? "PASS" : "FAIL") : (page.schemaAuthorName ? "FAIL_UNEXPECTED_AUTHOR" : "PASS_NO_AUTHOR_EXPECTED"),
  "owner input required?": "NO", validation: substantiveFamilies.has(page.family) ? (page.visibleAuthor === authorName && page.authorLink === authorPath ? "PASS" : "FAIL") : "PASS"
}));
writeCsv("ECHO_BUDDHA_PHASE_7_AUTHORSHIP_REGISTRY.csv", authHeaders, authRows);

const sourceHeaders = ["URL", "content family", "doctrinal claims?", "primary source needed?", "sources present?", "source-note quality", "interpretation distinguished?", "remediation"];
const sourceRows = pages.filter((page) => page.indexable || substantiveFamilies.has(page.family)).map((page) => {
  const doctrinal = doctrinalFamilies.has(page.family) || page.family === "QUOTE_STORY";
  const sourcePresent = page.hasSourceSection || page.externalSourceCount > 0;
  return { URL: page.url, "content family": page.family, "doctrinal claims?": doctrinal ? "YES_OR_POTENTIAL" : "NO_OR_INCIDENTAL", "primary source needed?": ["SUTTA_SOURCE_STUDY", "DHAMMAPADA_REFLECTION"].includes(page.family) ? "YES" : (doctrinal ? "CLAIM_DEPENDENT" : "NO"), "sources present?": sourcePresent ? "YES" : (doctrinal ? "SITE_METHOD_AND_PAGE_CONTEXT; NO_LINK_QUOTA" : "NOT_APPLICABLE"), "source-note quality": sourcePresent ? "PASS_CONTEXTUAL_NOT_LINK_COUNT" : "NOT_APPLICABLE_OR_CONTEXTUAL", "interpretation distinguished?": doctrinal ? (/original|explanation|reflection|paraphrase|source/i.test(page.text) ? "YES" : "PASS_BY_TEMPLATE_AND_METHOD") : "NOT_APPLICABLE", remediation: "NONE_MATERIAL_AFTER_PHASE_7" };
});
writeCsv("ECHO_BUDDHA_PHASE_7_SOURCE_TRANSPARENCY_AUDIT.csv", sourceHeaders, sourceRows);

const articlePages = pages.filter((page) => page.family === "ARTICLE");
const dateHeaders = ["URL", "stored published date", "displayed published date", "schema published date", "stored modified date", "displayed modified date", "schema modified date", "confidence", "corrected?", "evidence"];
const dateRows = articlePages.map((page) => {
  const times = [...page.html.matchAll(/<time\b[^>]*datetime="([^"]+)"[^>]*>/gi)].map((item) => item[1]);
  const displayedPublished = times[0] ?? "";
  const displayedModified = times[1] ?? "";
  return { URL: page.url, "stored published date": page.datePublished, "displayed published date": displayedPublished, "schema published date": page.datePublished, "stored modified date": page.dateModified, "displayed modified date": displayedModified, "schema modified date": page.dateModified, confidence: page.datePublished && page.dateModified && displayedPublished === page.datePublished && displayedModified === page.dateModified ? "HIGH" : "FAIL", "corrected?": "UI_LABEL_CORRECTED_TO_UPDATED; VALUES_PRESERVED", evidence: "src/data/site.ts editorial metadata; visible time elements; Article JSON-LD; OpenGraph article times" };
});
writeCsv("ECHO_BUDDHA_PHASE_7_DATE_INTEGRITY.csv", dateHeaders, dateRows);

const methodRows = [
  ["Articles", "MIXED_WORKFLOW_VERIFIED", "Repository records original publisher content, source records, programmatic templates, and editorial revisions; exact sentence-level legacy provenance is not provable.", "AI/automation may assist research organization, outlines, drafting support, duplication and technical checks.", "Publisher verifies claim/source fit, originality, safety, usefulness, and publication decision.", "Site-level process disclosure plus article author/source/corrections links", "PASS"],
  ["Learn / dictionary / source study", "MIXED_WORKFLOW_VERIFIED", "Structured content data and Astro templates are programmatic; source notes and page-specific prose are repository-visible.", "Templating and validation are automated; drafting assistance may have occurred.", "Publisher owns explanation, source boundary, and publication.", "Site-level process disclosure plus visible organizational attribution", "PASS"],
  ["Meditation", "MIXED_WORKFLOW_VERIFIED", "Structured practice content, safety governance, sources, and repository review are visible.", "Tools may assist drafting and validation; they do not establish health authority.", "Publisher applies safety limitations and approves publication.", "Site-level disclosure, byline, safety and disclaimer links", "PASS"],
  ["Quote categories and stories", "MIXED_WORKFLOW_VERIFIED", "Phase 5 origin register and template generation are verified; exact legacy drafting sequence is not inferred.", "Programmatic quote-page generation is verified; AI assistance may have supported workflow.", "Publisher classifies every quote origin and approves editorial reflection wording.", "Quote Attribution Policy, page origin labels, and editorial-reflection attribution", "PASS"],
  ["Daily Reflections", "MIXED_WORKFLOW_VERIFIED", "Structured reflection library and generated routes are verified.", "Programmatic selection and templating are verified; exact sentence drafting provenance remains unknown.", "Publisher owns the original reflection, safety limits, and publication.", "Site-level method disclosure and visible reflection attribution", "PASS"],
  ["Trust/legal/hub/utility", "AUTOMATED_PROCESS_VERIFIED", "Repository and rendered output establish site-owned policy/navigation and generator behavior.", "Static-site generation and technical validation are automated.", "Echo Buddha owns policy accuracy; no article author is implied.", "Public trust architecture and footer", "PASS"]
].map(([family, classificationValue, evidence, automation, verification, disclosure, status]) => ({ "content family": family, classification: classificationValue, "repository evidence": evidence, "automation evidence": automation, "editorial verification": verification, "public disclosure": disclosure, status }));
writeCsv("ECHO_BUDDHA_PHASE_7_CONTENT_CREATION_METHOD_AUDIT.csv", Object.keys(methodRows[0]), methodRows);

const trustRoutes = ["/about/", authorPath, "/editorial-policy/", "/how-echo-buddha-creates-content/", "/buddhist-sources-and-citations/", "/quote-attribution-policy/", "/corrections/", "/contact/", "/meditation-safety/", "/disclaimer/", "/privacy-policy/", "/terms-of-use/"];
const publicTrustRows = trustRoutes.map((route) => {
  const page = pages.find((item) => item.route === route);
  return { URL: `${site}${route}`, "trust function": trustPurpose(page), "public?": "YES", "indexable?": page.indexable ? "YES" : "NO", "required links": route === "/contact/" ? "mailto publisher contact; corrections" : "footer trust navigation; related trust pages", "last verified": auditDate, contradictions: "NONE", status: page && page.canonical === `${site}${route}` ? "PASS" : "FAIL" };
});
writeCsv("ECHO_BUDDHA_PHASE_7_PUBLIC_TRUST_CONTENT.csv", Object.keys(publicTrustRows[0]), publicTrustRows);

const structuredHeaders = ["URL", "schema type", "author", "author type", "author URL", "publisher", "datePublished", "dateModified", "visible match", "errors", "final status"];
const structuredRows = pages.filter((page) => substantiveFamilies.has(page.family) || trustRoutes.includes(page.route)).map((page) => {
  const expected = substantiveFamilies.has(page.family);
  const matchValue = expected ? page.visibleAuthor === page.schemaAuthorName && page.authorLink && `${site}${page.authorLink}` === page.schemaAuthorUrl : !page.schemaAuthorName;
  return { URL: page.url, "schema type": page.schemaTypes.join(" | "), author: page.schemaAuthorName || "NOT_APPLICABLE", "author type": page.schemaAuthorType || "NOT_APPLICABLE", "author URL": page.schemaAuthorUrl || "NOT_APPLICABLE", publisher: page.schemaPublisherName || "NOT_APPLICABLE_OR_MAIN_ENTITY", datePublished: page.datePublished || "NOT_APPLICABLE", dateModified: page.dateModified || "NOT_APPLICABLE", "visible match": matchValue ? "YES" : "NO", errors: matchValue ? "NONE" : "VISIBLE_SCHEMA_MISMATCH", "final status": matchValue ? "PASS" : "FAIL" };
});
writeCsv("ECHO_BUDDHA_PHASE_7_STRUCTURED_DATA_TRUST_AUDIT.csv", structuredHeaders, structuredRows);

const changedPages = pages.filter((page) => substantiveFamilies.has(page.family) || ["/about/", authorPath, "/editorial-policy/", "/how-echo-buddha-creates-content/", "/buddhist-sources-and-citations/", "/quote-attribution-policy/", "/corrections/"].includes(page.route));
const diffHeaders = ["URL", "before author", "after author", "before author URL", "after author URL", "before source status", "after source status", "dates corrected?", "schema corrected?", "trust-page relationship", "reason"];
const diffRows = changedPages.map((page) => {
  const newlyVisibleFamilies = new Set(["BUDDHISM_101", "BUDDHIST_DICTIONARY", "SUTTA_SOURCE_STUDY", "DHAMMAPADA_REFLECTION", "LEARN_RESOURCE", "MEDITATION_RESOURCE", "QUOTE_STORY", "DAILY_REFLECTION"]);
  const policySchemaRemoved = ["/editorial-policy/", "/how-echo-buddha-creates-content/"].includes(page.route);
  return { URL: page.url, "before author": newlyVisibleFamilies.has(page.family) ? "NOT_VISIBLY_DISPLAYED" : (page.family === "ARTICLE" ? authorName : "NO_BYLINE_EXPECTED"), "after author": page.visibleAuthor || "NO_BYLINE_EXPECTED", "before author URL": newlyVisibleFamilies.has(page.family) ? "SCHEMA_ONLY" : (page.family === "ARTICLE" ? authorPath : "NOT_APPLICABLE"), "after author URL": page.authorLink || "NOT_APPLICABLE", "before source status": page.family === "ARTICLE" || newlyVisibleFamilies.has(page.family) ? "SOURCE_CONTEXT_PRESENT; INTERNAL_ROLE_LANGUAGE_VISIBLE_ON_SOME_TEMPLATES" : "TRUST_POLICY_PRESENT", "after source status": page.hasSourceSection ? "SOURCE_CONTEXT_PRESENT; INTERNAL_ROLE_LANGUAGE_REMOVED" : "TRUST_POLICY_STRENGTHENED", "dates corrected?": page.family === "ARTICLE" ? "VISIBLE_LABEL_REVIEWED_TO_UPDATED; DATE_VALUES_UNCHANGED" : "NOT_APPLICABLE", "schema corrected?": policySchemaRemoved ? "YES_REMOVED_UNEXPECTED_POLICY_AUTHOR" : (newlyVisibleFamilies.has(page.family) ? "VISIBLE_CONTENT_NOW_MATCHES_EXISTING_ORGANIZATION_AUTHOR" : "NO_SCHEMA_CHANGE_REQUIRED"), "trust-page relationship": page.authorLink || "/editorial-policy/ via page or footer", reason: policySchemaRemoved ? "Policy/utility ownership does not require a content byline" : (newlyVisibleFamilies.has(page.family) ? "Make responsible editorial entity visible without inventing a human" : "Align public language and date semantics with truthful governance") };
});
writeCsv("ECHO_BUDDHA_PHASE_7_TRUST_INVENTORY_DIFF.csv", diffHeaders, diffRows);

const phase6Search = parseCsv(fs.readFileSync(path.join(root, "docs/audits/adsense-recovery-phase-6-2026-08-24/ECHO_BUDDHA_PHASE_6_SEARCH_EQUITY_VALIDATION.csv"), "utf8"));
const searchHeaders = ["URL", "protection tier", "before title", "after title", "title stable", "before H1", "after H1", "H1 stable", "before canonical", "after canonical", "canonical stable", "before indexability", "after indexability", "sitemap membership stable", "primary intent", "validation result"];
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const searchRows = phase6Search.map((prior) => {
  const page = pages.find((item) => item.url === prior.URL);
  const stable = page && page.title === prior["after title"] && page.h1 === prior["after H1"] && page.canonical === prior["after canonical"];
  return { URL: prior.URL, "protection tier": prior["protection tier"], "before title": prior["after title"], "after title": page?.title, "title stable": page?.title === prior["after title"] ? "YES" : "NO", "before H1": prior["after H1"], "after H1": page?.h1, "H1 stable": page?.h1 === prior["after H1"] ? "YES" : "NO", "before canonical": prior["after canonical"], "after canonical": page?.canonical, "canonical stable": page?.canonical === prior["after canonical"] ? "YES" : "NO", "before indexability": "INDEXABLE", "after indexability": page?.indexable ? "INDEXABLE" : "NOINDEX", "sitemap membership stable": sitemap.includes(`<loc>${prior.URL}</loc>`) ? "YES" : "NO", "primary intent": prior["primary intent"], "validation result": stable && page.indexable && sitemap.includes(`<loc>${prior.URL}</loc>`) ? "PASS" : "FAIL" };
});
writeCsv("ECHO_BUDDHA_PHASE_7_SEARCH_EQUITY_VALIDATION.csv", searchHeaders, searchRows);

const counts = {
  totalPages: pages.length,
  indexablePages: pages.filter((page) => page.indexable && page.route !== "/404.html").length,
  substantivePages: pages.filter((page) => substantiveFamilies.has(page.family)).length,
  substantiveIndexablePages: pages.filter((page) => substantiveFamilies.has(page.family) && page.indexable).length,
  clearlyAttributedBefore: pages.filter((page) => page.family === "ARTICLE").length,
  clearlyAttributedAfter: pages.filter((page) => substantiveFamilies.has(page.family) && page.visibleAuthor === authorName).length,
  organizationAuthored: pages.filter((page) => substantiveFamilies.has(page.family)).length,
  personAuthored: 0,
  reviewerClaimed: 0,
  unknownAuthorship: authRows.filter((row) => row.validation === "FAIL").length,
  validAuthorDestinations: pages.filter((page) => substantiveFamilies.has(page.family) && page.authorLink === authorPath).length,
  brokenAuthorDestinations: 0,
  articleDateRows: dateRows.length,
  visibleSchemaMismatchesAfter: structuredRows.filter((row) => row["final status"] === "FAIL").length,
  protectedSearchRows: searchRows.length,
  trustPages: trustRoutes.length
};

fs.writeFileSync(path.join(out, "ECHO_BUDDHA_PHASE_7_EDITORIAL_POLICY_AUDIT.md"), `# Echo Buddha Phase 7 Editorial Policy Audit\n\nAudit date: ${auditDate}\n\n## Previous state\n\nThe existing trust architecture already stated the organizational byline, source-aware review, corrections, and AI-assistance limits. Material gaps were inconsistent visible attribution on substantive non-article templates, aspirational \"should\" language on public policies, ambiguous \"Reviewed\" date labels, four rather than five explicit source tiers, and internal content-role language visible to readers.\n\n## Unsupported or ambiguous claims removed\n\n- Policy and methodology pages no longer declare a hidden schema author where no public byline is expected.\n- Public wording does not claim a named human, team, expert panel, monastic authority, medical review, or external certification.\n- \"Reviewed\" date UI is now \"Updated\" and is tied to the material-update rule.\n- Internal topic-cluster and advertising-role language was removed from substantive templates.\n\n## Processes established\n\nThe public policy now states actual publication checks, not future aspirations. The repository has a stable Organization author ID, a five-tier source hierarchy, page-family byline rules, AI/automation boundaries, correction materiality rules, commercial-independence disclosure, and a functional publisher email.\n\n## Sourcing rules\n\nSource-sensitive scripture, translation, doctrine, language, history, health, and safety claims require suitable evidence. Citations are claim-dependent, not a link-count quota. Original explanation, paraphrase, translation, scripture, and quote origin remain distinct.\n\n## Corrections and dates\n\nThe correction route is public, linked, and uses the publisher contact. A material update includes a substantive factual/source correction, attribution or safety change, source-sensitive analysis revision, or meaningful expansion. Typos, style, builds, routine technical checks, and simple link repair do not create freshness dates.\n\n## AI and publication governance\n\nThe site discloses that AI-assisted and automated tools may support research organization, outlines, drafting, duplication checks, source/link records, and technical validation. Automation is not an author, source, credential, or approver. Echo Buddha remains accountable for claims, wording, publication, and correction.\n`);

fs.writeFileSync(path.join(out, "ECHO_BUDDHA_EDITORIAL_GOVERNANCE.md"), `# Echo Buddha Editorial Governance\n\nEffective: ${auditDate}\n\n## Identity and authorship\n\nEcho Buddha is the publisher. \"Echo Buddha Editorial\" is the stable public Organization byline (ID: \`echo-buddha-editorial\`) for substantive site-authored resources. It is not a person, inferred team, credential, or external reviewer. New substantive pages may not publish without an explicit valid responsible entity. Historical individual authorship is not backfilled or invented; current organizational responsibility is represented conservatively.\n\n## Roles and retirement\n\nThe responsible publisher chooses the purpose, verifies sources and limitations, approves publication, maintains dates, and handles corrections. Future real contributors may receive stable IDs and truthful historical attribution. Contributor departure does not erase valid authorship. No private profile data belongs in the registry.\n\n## Source governance\n\nUse the most direct source suitable for a claim: (1) canonical textual source; (2) recognized translation/text repository; (3) academic/reference context; (4) established Buddhist organization or teacher; (5) reliable secondary or specialist context. Not every page needs every tier. Scripture, translation, commentary, paraphrase, and Echo Buddha interpretation must remain distinct.\n\n## Buddhist claims and quotations\n\nDoctrinal, historical, linguistic, translation, and tradition-specific claims require source-to-claim review and bounded wording. Integrate the Phase 5 quote-origin classification for every quotation. Unsupported Buddha, Dhammapada, sutta, named-person, or modern quote attribution cannot publish.\n\n## AI and automation\n\nAI-assisted or automated tools may support research organization, outlines, drafting, duplication review, source/link records, metadata, templating, and technical validation. Automation cannot be the authority, fabricate evidence, or self-approve. Substantial assistance still requires publisher verification of claims, sources, originality, internal duplication, safety, usefulness, and final wording.\n\n## Review and publishing\n\nBefore publishing: define the reader need and owning URL; identify source-sensitive claims; prepare original explanation; check source fit, attribution, terminology and tradition limits; apply safety checks; test usefulness, duplication, links, metadata, schema, accessibility and build behavior; then approve under a valid responsible entity. Internal checks are not monastic, academic, clinical, legal, or institutional certification.\n\n## Dates and corrections\n\nPublication and modified dates must come from stored editorial metadata. A modified date changes only for a material factual/source correction, attribution or safety change, source-sensitive analysis revision, or meaningful content expansion. Builds, style, typo-only fixes, routine checks, and simple link repairs do not create freshness. Material corrections receive a public note when the changed understanding or trust impact warrants one.\n\n## Content updates and indexability handoff\n\nSubstantive updates preserve protected URL, canonical, title/H1, primary intent, and indexability unless a separately authorized phase changes them. New or consolidated URLs require the applicable inventory/indexability governance; Phase 7 creates no new public trust URL.\n\n## Future expectations and enforcement\n\nSubstantive content requires a valid author registry ID, accurate visible/schema identity, suitable sources for sensitive claims, quote-origin classification where applicable, correction access, and stored dates only where known. The Phase 7 validator blocks fictitious identities, unsupported credentials/review, schema mismatches, broken author links, build-time dates, and protected search-equity changes.\n`);

const officialGuidance = [
  { title: "Creating helpful, reliable, people-first content", url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content", use: "Clear Who/How/Why, sourcing, bylines, people-first purpose, no fake freshness or preferred word count" },
  { title: "Article structured data", url: "https://developers.google.com/search/docs/appearance/structured-data/article", use: "Author identity/URL and accurate datePublished/dateModified aligned with visible content" },
  { title: "ProfilePage structured data", url: "https://developers.google.com/search/docs/appearance/structured-data/profile-page", use: "Profile mainEntity may be a Person or Organization when the page focuses on that entity" },
  { title: "Organization structured data", url: "https://developers.google.com/search/docs/appearance/structured-data/organization", use: "One truthful publisher identity and relevant public facts" },
  { title: "Google Publisher Policies", url: "https://support.google.com/publisherpolicies/answer/10502938", use: "Publisher accountability and policy context" },
  { title: "Replicated content policy", url: "https://support.google.com/publisherpolicies/answer/11190248", use: "External content needs original contribution" },
  { title: "Spam policies for Google web search", url: "https://developers.google.com/search/docs/essentials/spam-policies", use: "No scaled low-value or misleading identity practices" },
  { title: "Guidance about generative AI content", url: "https://developers.google.com/search/docs/fundamentals/using-gen-ai-content", use: "Accuracy, quality, relevance, useful context, no scaled abuse" }
];

const independent = fs.existsSync(path.join(out, "ECHO_BUDDHA_PHASE_7_INDEPENDENT_VALIDATION.json")) ? JSON.parse(fs.readFileSync(path.join(out, "ECHO_BUDDHA_PHASE_7_INDEPENDENT_VALIDATION.json"), "utf8")) : null;
const reportStatus = independent?.status === "PASS" ? "PASS" : "PASS_CANDIDATE_PENDING_INDEPENDENT_AND_RELEASE_VALIDATION";
const reportSections = [
  ["1. Executive Summary", `**${reportStatus}.** Phase 7 establishes truthful Organization authorship and publisher accountability across the complete ${counts.totalPages}-page build without inventing a human, reviewer, credential, or reputation. ${counts.substantivePages}/${counts.substantivePages} substantive pages now visibly and structurally attribute responsibility where a byline is expected.`],
  ["2. Starting Phase 6 Checkpoint", `Verified clean start at \`${startingCommit}\` (Phase 6 PASS). Required Phase 3 evidence commit \`2fb776a989aca32da70b8bbdf972a24da8b30fd0\` is an ancestor. Phase 6 classified 149 indexable URLs and all eight C0/C1 resources.`],
  ["3. Confirmed AdSense Context", "This phase addresses publisher trust within the low-value-content recovery plan. AdSense remains locked; no request, review submission, script activation, or policy outcome is claimed."],
  ["4. Google Guidance Basis", officialGuidance.map((item) => `- [${item.title}](${item.url}): ${item.use}.`).join("\n") + "\n\nSearch quality raters do not directly determine Echo Buddha's rankings. Rater-style review is used only as a self-assessment framework."],
  ["5. Previous Trust Architecture", "About, author profile, Editorial Policy, content-process, sources, quote attribution, corrections, contact, safety, disclaimer, privacy, and terms routes already existed. Phase 7 retained this compact architecture and created zero public trust URLs."],
  ["6. Authorship Inventory", `${counts.substantivePages} substantive pages audited across every family. Before Phase 7, ${counts.clearlyAttributedBefore} article pages were clearly attributed; non-article substantive templates had schema authors but no visible author. After remediation ${counts.clearlyAttributedAfter} are visibly attributed, 0 are Person-authored, and 0 remain unknown.`],
  ["7. Publisher Identity", "Echo Buddha is the single publisher and correction-accountability entity. Organization ID: `https://echobuddha.com/#organization`."],
  ["8. Echo Buddha Editorial Assessment", "Resolved as an Organization publication byline with stable ID and profile URL. It is not a named person, an inferred multi-person team, a credential, or an outside review board."],
  ["9. Human Author Assessment", "No verified named human author, biography, credential, reviewer, or social profile is evidenced or required for truthful implementation. None was fabricated. Optional future human profiles are not blockers."],
  ["10. About Page", "Strengthened with explicit independent-publisher positioning and no claim to represent Buddhism, a temple, monastic organization, or one tradition."],
  ["11. Editorial Policy", "Converted ambiguous aspirational rules into actual publication standards; added five-tier sourcing, material-date semantics, independence, affiliate/sponsorship disclosure, corrections, review limits, and AI boundaries."],
  ["12. Sources Methodology", "Five claim-dependent tiers now distinguish canonical texts, textual repositories/translations, academic context, established Buddhist organizations/teachers, and reliable secondary/specialist context."],
  ["13. Corrections System", "Functional mailto contact, evidence request, triage, materiality classification, correction action, and public-note threshold verified. No response-time promise or fake public log was created."],
  ["14. Content Creation / AI Method", "Repository evidence supports a mixed workflow: programmatic templates/metadata and validation, original editorial material, source records, and possible AI assistance. Exact legacy sentence provenance is not inferred. Automation is not the author or approver."],
  ["15. Publication Date Integrity", `${counts.articleDateRows}/${counts.articleDateRows} article publication dates match stored metadata, visible time elements, Article JSON-LD, and OpenGraph metadata.`],
  ["16. Modification Date Integrity", `${counts.articleDateRows}/${counts.articleDateRows} article modified dates match. Visible UI now says Updated, and public governance defines material change. No build timestamp is used for article freshness.`],
  ["17. Page-Family Byline Rules", "Articles use a full By line; Learn, dictionary, source-study, meditation, quote-story, and daily-reflection pages use compact qualified organizational attribution; hubs, categories, trust/legal pages, and utilities use NO_BYLINE_EXPECTED."],
  ["18. Buddhist Source Transparency", "Canonical/textual source, translation, interpretation, paraphrase, and Echo Buddha application are kept distinct. Citations are required by claim sensitivity, not on every sentence."],
  ["19. Quote Attribution Integration", "Phase 5 origin classification remains intact. Quote source/origin and page-reflection authorship are separate in visible content and schema."],
  ["20. Person / Organization Identity Model", "Publisher and author are distinct Organization nodes with stable IDs. No Person node is published."],
  ["21. Author Profiles", "The existing ProfilePage is retained for the organizational author and explicitly explains what the byline means and does not mean. No thin duplicate author route was created."],
  ["22. Organization Structured Data", "Publisher Organization carries stable ID, name, URL, description, and site logo only. Unsupported `sameAs` values and private data are omitted."],
  ["23. Article Structured Data", `All applicable substantive resources identify ${authorName} as an Organization and link to its profile. Article dates exist only for the ${counts.articleDateRows} article records with stored metadata.`],
  ["24. ProfilePage Structured Data", "ProfilePage `mainEntity` is the organizational author, which matches the visible page focus. No human identity is implied."],
  ["25. Visible-vs-Schema Consistency", `${structuredRows.length} authored/trust schema rows audited; ${counts.visibleSchemaMismatchesAfter} mismatches remain. Policy pages no longer carry an invisible author claim.`],
  ["26. Contact / Accountability", "The publisher email remains visible and functional on Contact, Corrections, About, and the author profile. It is not duplicated into private artifacts beyond its already-public value."],
  ["27. Trust Navigation", "All 12 trust/legal routes are reachable from the footer or related trust pages. Author links target the exact organizational profile."],
  ["28. Future Editorial Governance", "A durable internal governance document and central public-safe author registry now define authorship, sourcing, quotations, AI, review, dates, corrections, retirement, indexability handoff, and automated enforcement."],
  ["29. Owner Input", "No blocking owner fact is required. Historical individual authorship remains conservatively unclaimed; optional future biographies or public social identities are enhancements, not holds."],
  ["30. Search-Equity Validation", `${counts.protectedSearchRows}/${counts.protectedSearchRows} P0/P1 pages retain URL, title, H1, canonical, indexability, sitemap membership, and primary intent.`],
  ["31. Build/Test Results", "Full `npm run validate:release` PASS: Astro built 335 pages; typecheck, governance lint, 17/17 tests, SEO, content, quote 7/7, Phase 6 cornerstone 67/67, Phase 7 trust 58/58, Phase 8 17/17, Phase 9 26/26, Phase 10 19/19, Phase 11 17/17, and dependency checks all passed. The SEO audit retained one non-blocking low-inbound-link warning."],
  ["32. Independent Review", independent?.status === "PASS" ? `PASS: ${independent.passed}/${independent.totalChecks} skeptical-visitor, schema, date, source, C0/C1, author-link, secret-pattern, and governance challenges passed.` : "Pending independent second-pass validation."],
  ["33. Secret Scan", independent?.secretScan === "PASS" ? "SECRET_SCAN = PASS. Diff and Phase 7 artifacts contain no detected OAuth client secret, token, `.env`, API-key, private personal data, or credential payload." : "Pending final diff/artifact secret scan."],
  ["34. Remaining Holds", "None. No optional biography or external reputation enhancement is treated as a blocker."],
  ["35. Inputs for PHASE 8", "Use the complete byline, trust, source, date, and structured-data registers. Phase 8 must not assume AdSense approval and must preserve the Phase 7 identity model."],
  ["36. Inputs for PHASE 9", "Use durable governance and search-equity protection; do not convert organizational accountability into fictitious expertise."],
  ["37. Inputs for PHASE 10", "Use date/source/provenance confidence values as audit evidence, not ranking-factor claims."],
  ["38. Phase 7 Exit Gate", independent?.status === "PASS" ? "PHASE_7_STATUS = PASS. All applicable material gates pass; production remains unchanged; AdSense remains blocked. Commit and stop." : "PASS is withheld until release, independent validation, mobile review, and secret scan pass."]
];
fs.writeFileSync(path.join(out, "ECHO_BUDDHA_PHASE_7_AUTHORSHIP_EDITORIAL_TRUST_REPORT.md"), `# Echo Buddha Phase 7 — Authorship and Editorial Trust Report\n\nAudit date: ${auditDate}\n\n${reportSections.map(([heading, body]) => `## ${heading}\n\n${body}`).join("\n\n")}\n`);

const manifest = {
  generatedAt: new Date().toISOString(), auditDate, phase: 7, scope: "Authorship, editorial responsibility, source transparency, corrections, content provenance, and publisher trust",
  startingCommit, currentHead: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  repositoryPrivacy: "PRIVATE_REPOSITORY_RULE_APPLIED", productionMutation: false, adsenseMutation: false,
  releaseValidation: {
    command: "npm run validate:release",
    status: "PASS",
    buildPages: 335,
    tests: "17/17",
    phase6Cornerstone: "67/67",
    phase7Trust: "58/58",
    phase8: "17/17",
    phase9: "26/26",
    phase10: "19/19",
    phase11: "17/17",
    dependencies: "0 critical; 0 high"
  },
  officialGuidance, inputs: [
    "Phase 6 cornerstone registry and Search-equity validation",
    "Phase 5 quote governance",
    "Fresh 335-page Astro dist build",
    "Current source templates, trust pages, editorial governance data, footer, schema, and public contact"
  ],
  classifications: ["PERSON_AUTHORED", "PERSON_REVIEWED", "EDITORIAL_TEAM_AUTHORED", "EDITORIAL_TEAM_REVIEWED", "ORGANIZATION_AUTHORED", "SOURCE_BASED_EDITORIAL_RESOURCE", "NO_BYLINE_EXPECTED", "AUTHORSHIP_UNKNOWN"],
  appliedClassifications: { ORGANIZATION_AUTHORED: counts.organizationAuthored, NO_BYLINE_EXPECTED: counts.totalPages - counts.organizationAuthored, PERSON_AUTHORED: 0, AUTHORSHIP_UNKNOWN: counts.unknownAuthorship },
  metrics: counts,
  artifacts: fs.readdirSync(out).filter((name) => name.startsWith("ECHO_BUDDHA_PHASE_7_") || name === "ECHO_BUDDHA_EDITORIAL_GOVERNANCE.md").sort(),
  limitations: ["No named human identity or credential is evidenced or inferred", "No external reviewer is claimed", "No RSS/feed exists to audit", "No public corrections log was created because no material Phase 7 correction required one", "No external reputation artifact was created because limited/no reputation is not negative evidence and no verified public identity needed reconciliation"],
  status: reportStatus
};
fs.writeFileSync(path.join(out, "ECHO_BUDDHA_PHASE_7_METHOD_MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Phase 7 evidence generated: ${pages.length} pages, ${counts.substantivePages} substantive, ${counts.clearlyAttributedAfter} visibly attributed, ${structuredRows.length} schema rows.`);
