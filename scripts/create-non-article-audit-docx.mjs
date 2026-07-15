import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_DIR = process.env.NON_ARTICLE_AUDIT_DIR
  ? path.resolve(ROOT, process.env.NON_ARTICLE_AUDIT_DIR)
  : path.join(ROOT, "docs", "audits", "non-articles");
const BUILD_DIR = path.join(ROOT, "tmp", "non-article-audit-docx");
const DOCX_PATH = process.env.NON_ARTICLE_AUDIT_DOCX
  ? path.resolve(ROOT, process.env.NON_ARTICLE_AUDIT_DOCX)
  : path.join(AUDIT_DIR, "Echo-Buddha-Non-Article-Content-Audit.docx");

const DXA_TABLE_WIDTH = 9360;
const BLUE = "2E74B5";
const DARK_BLUE = "1F4D78";
const MUTED = "555555";
const LIGHT_FILL = "F2F4F7";
const CALLOUT_FILL = "F4F6F9";

function readJson(name) {
  return JSON.parse(readFileSync(path.join(AUDIT_DIR, name), "utf8"));
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function text(value) {
  return value == null || value === "" ? "" : String(value);
}

function clean(value, max = 1600) {
  const string = Array.isArray(value) ? value.join("; ") : text(value);
  return string.length > max ? `${string.slice(0, max - 1)}…` : string;
}

function yn(value) {
  return value ? "Yes" : "No";
}

function slug(name) {
  return name.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "");
}

function r(value, opts = {}) {
  const attrs = [];
  if (opts.bold) attrs.push("<w:b/>");
  if (opts.italic) attrs.push("<w:i/>");
  if (opts.color) attrs.push(`<w:color w:val="${opts.color}"/>`);
  if (opts.size) attrs.push(`<w:sz w:val="${Math.round(opts.size * 2)}"/>`);
  return `<w:r>${attrs.length ? `<w:rPr>${attrs.join("")}</w:rPr>` : ""}<w:t xml:space="preserve">${esc(value)}</w:t></w:r>`;
}

function p(value = "", opts = {}) {
  const pPr = [];
  if (opts.style) pPr.push(`<w:pStyle w:val="${opts.style}"/>`);
  if (opts.align) pPr.push(`<w:jc w:val="${opts.align}"/>`);
  if (opts.pageBreakBefore) pPr.push("<w:pageBreakBefore/>");
  if (opts.numId) {
    pPr.push(`<w:numPr><w:ilvl w:val="${opts.level ?? 0}"/><w:numId w:val="${opts.numId}"/></w:numPr>`);
  }
  if (opts.keepNext) pPr.push("<w:keepNext/>");
  if (opts.spacing) {
    const before = opts.spacing.before ?? 0;
    const after = opts.spacing.after ?? 120;
    const line = opts.spacing.line ?? 264;
    pPr.push(`<w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/>`);
  }
  const runs = Array.isArray(value) ? value : [r(value, opts.run ?? {})];
  return `<w:p>${pPr.length ? `<w:pPr>${pPr.join("")}</w:pPr>` : ""}${runs.join("")}</w:p>`;
}

function pageBreak() {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

function cell(content, width, opts = {}) {
  const fill = opts.fill ? `<w:shd w:fill="${opts.fill}"/>` : "";
  const valign = `<w:vAlign w:val="${opts.valign ?? "center"}"/>`;
  const margins = '<w:tcMar><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:start w:w="120" w:type="dxa"/><w:end w:w="120" w:type="dxa"/></w:tcMar>';
  const borders = '<w:tcBorders><w:top w:val="single" w:sz="4" w:color="D9DEE7"/><w:left w:val="single" w:sz="4" w:color="D9DEE7"/><w:bottom w:val="single" w:sz="4" w:color="D9DEE7"/><w:right w:val="single" w:sz="4" w:color="D9DEE7"/></w:tcBorders>';
  const paragraphs = Array.isArray(content)
    ? content.map((item) => typeof item === "string" ? p(item, opts.paragraph ?? {}) : item).join("")
    : p(content, opts.paragraph ?? {});
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${fill}${valign}${margins}${borders}</w:tcPr>${paragraphs}</w:tc>`;
}

function table(headers, rows, widths, opts = {}) {
  const total = widths.reduce((sum, item) => sum + item, 0);
  const scaled = widths.map((item) => Math.round((item / total) * DXA_TABLE_WIDTH));
  scaled[scaled.length - 1] += DXA_TABLE_WIDTH - scaled.reduce((sum, item) => sum + item, 0);
  const grid = scaled.map((width) => `<w:gridCol w:w="${width}"/>`).join("");
  const headerRow = `<w:tr>${headers.map((header, index) => cell(header, scaled[index], {
    fill: opts.headerFill ?? LIGHT_FILL,
    paragraph: { run: { bold: true, color: "000000", size: 9 }, spacing: { before: 0, after: 40, line: 240 } }
  })).join("")}</w:tr>`;
  const bodyRows = rows.map((row) => `<w:tr>${row.map((value, index) => cell(value, scaled[index], {
    paragraph: { run: { size: opts.fontSize ?? 8.5 }, spacing: { before: 0, after: 35, line: 230 } }
  })).join("")}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="${DXA_TABLE_WIDTH}" w:type="dxa"/><w:tblInd w:w="120" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblLook w:firstRow="1" w:noHBand="1" w:noVBand="1"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${headerRow}${bodyRows}</w:tbl>`;
}

function callout(title, body) {
  return table(["Audit Priority", "Evidence"], [[title, body]], [2100, 7260], { headerFill: CALLOUT_FILL, fontSize: 9 });
}

function bullet(value) {
  return p(value, { numId: 1, spacing: { before: 0, after: 70, line: 280 } });
}

function numbered(value) {
  return p(value, { numId: 2, spacing: { before: 0, after: 70, line: 280 } });
}

function mdToBlocks(markdown) {
  const blocks = [];
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("# ")) blocks.push(p(line.slice(2), { style: "TitleReport", pageBreakBefore: false }));
    else if (line.startsWith("## ")) blocks.push(p(line.slice(3), { style: "Heading1" }));
    else if (line.startsWith("- ")) blocks.push(bullet(line.slice(2).replaceAll("`", "")));
    else if (/^\d+\.\s+/.test(line)) blocks.push(numbered(line.replace(/^\d+\.\s+/, "")));
    else blocks.push(p(line.replaceAll("`", ""), { spacing: { before: 0, after: 90, line: 280 } }));
  }
  return blocks;
}

function kvTable(rows) {
  return table(["Field", "Value"], rows.map(([left, right]) => [left, clean(right, 3000)]), [2400, 6960], { fontSize: 9 });
}

function compactList(title, items, max = 999) {
  const blocks = [p(title, { style: "Heading3" })];
  items.slice(0, max).forEach((item) => blocks.push(bullet(item)));
  return blocks.join("");
}

function makeDocumentXml(bodyBlocks) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>
${bodyBlocks.join("\n")}
<w:sectPr>
  <w:pgSz w:w="12240" w:h="15840"/>
  <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
  <w:cols w:space="720"/>
  <w:docGrid w:linePitch="360"/>
</w:sectPr>
</w:body>
</w:document>`;
}

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="000000"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="TitleReport"><w:name w:val="Report Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="0" w:after="180" w:line="300" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:color w:val="0B2545"/><w:sz w:val="48"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="260" w:line="280" w:lineRule="auto"/></w:pPr><w:rPr><w:color w:val="${MUTED}"/><w:sz w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="160" w:line="280" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:color w:val="${BLUE}"/><w:sz w:val="32"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120" w:line="270" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:color w:val="${BLUE}"/><w:sz w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="Heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="80" w:line="260" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:color w:val="${DARK_BLUE}"/><w:sz w:val="24"/></w:rPr></w:style>
</w:styles>`;

const numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="720"/></w:tabs><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
<w:abstractNum w:abstractNumId="2"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="720"/></w:tabs><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
<w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num>
</w:numbering>`;

function writePackage(documentXml) {
  rmSync(BUILD_DIR, { recursive: true, force: true });
  mkdirSync(path.join(BUILD_DIR, "_rels"), { recursive: true });
  mkdirSync(path.join(BUILD_DIR, "word"), { recursive: true });
  mkdirSync(path.join(BUILD_DIR, "docProps"), { recursive: true });
  writeFileSync(path.join(BUILD_DIR, "[Content_Types].xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
  writeFileSync(path.join(BUILD_DIR, "_rels", ".rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
  writeFileSync(path.join(BUILD_DIR, "word", "document.xml"), documentXml);
  writeFileSync(path.join(BUILD_DIR, "word", "styles.xml"), stylesXml);
  writeFileSync(path.join(BUILD_DIR, "word", "numbering.xml"), numberingXml);
  writeFileSync(path.join(BUILD_DIR, "word", "settings.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/></w:settings>`);
  writeFileSync(path.join(BUILD_DIR, "docProps", "core.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Echo Buddha Non-Article Content Audit</dc:title><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified></cp:coreProperties>`);
  writeFileSync(path.join(BUILD_DIR, "docProps", "app.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Codex OOXML Builder</Application></Properties>`);
  rmSync(DOCX_PATH, { force: true });
  execFileSync("zip", ["-qr", DOCX_PATH, "."], { cwd: BUILD_DIR });
}

function main() {
  if (!existsSync(path.join(AUDIT_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"))) {
    throw new Error("Audit artifacts are missing. Run scripts/audit-non-articles.mjs first.");
  }

  const architecture = readJson("ECHOBUDDHA_NON_ARTICLE_ARCHITECTURE_DISCOVERY.json");
  const inventory = readJson("ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json");
  const evaluation = readJson("ECHOBUDDHA_NON_ARTICLE_ROUTE_EVALUATION.json");
  const baseline = readJson("ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json");
  const similarity = readJson("ECHOBUDDHA_NON_ARTICLE_SIMILARITY_AND_TEMPLATE_RISK.json");
  const clusters = readJson("ECHOBUDDHA_NON_ARTICLE_OVERLAP_CLUSTERS.json");
  const sourcePlan = readJson("ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json");
  const finalReport = readFileSync(path.join(AUDIT_DIR, "ECHOBUDDHA_NON_ARTICLE_FINAL_AUDIT_REPORT.md"), "utf8");

  const highSource = sourcePlan.filter((item) => item.recommendation.startsWith("High priority"));
  const familyCounts = inventory.reduce((acc, item) => {
    acc[item.family] = (acc[item.family] ?? 0) + 1;
    return acc;
  }, {});

  const blocks = [];
  blocks.push(p("Echo Buddha", { run: { bold: true, color: MUTED, size: 11 }, spacing: { before: 0, after: 80, line: 260 } }));
  blocks.push(p("Non-Article Content Audit", { style: "TitleReport" }));
  blocks.push(p("Comprehensive repository-based audit of all public non-article content systems, excluding protected /articles/ content except recommendation-only overlap context.", { style: "Subtitle" }));
  blocks.push(kvTable([
    ["Audit date", architecture.auditDate],
    ["Website", "https://echobuddha.com/"],
    ["Scope", baseline.scope],
    ["Generated non-article routes audited", architecture.generatedNonArticleRoutes],
    ["Protected article routes/categories excluded", architecture.generatedProtectedArticleRoutes],
    ["Primary deliverable", "Word report generated from JSON/CSV/Markdown audit artifacts in docs/audits/non-articles/"]
  ]));
  blocks.push(callout("Bottom line", "The wider site has strong static crawlability and a maintainable Astro content system, but long-term SEO, AdSense, and Buddhist-integrity readiness depend on source review for doctrine/practice pages and careful control of quote-story template scale."));
  blocks.push(pageBreak());

  blocks.push(p("Document Map", { style: "Heading1" }));
  [
    "Executive audit report",
    "Repository and content-system discovery",
    "Complete public non-article route inventory",
    "Content-type-aware route evaluation",
    "Preservation baseline",
    "Source-awareness plan",
    "Cross-section overlap and cannibalization clusters",
    "Human-writing and template-risk evidence",
    "Protected article overlap context",
    "Appendix index of generated audit artifacts"
  ].forEach((item) => blocks.push(bullet(item)));

  blocks.push(p("Executive Scorecard", { style: "Heading1" }));
  blocks.push(table(
    ["Area", "Evidence", "Audit Read"],
    [
      ["Crawlability", `${architecture.generatedNonArticleRoutes} non-article routes generated as static HTML; sitemap and search-index systems exist.`, "Strong foundation"],
      ["Source awareness", `${highSource.length} Tier 1/Tier 2 pages lack external source links in generated content.`, "Highest priority risk"],
      ["Template risk", `${similarity.duplicateSentences.length} exact repeated sentence patterns and ${similarity.highSimilarityPairs.length} high-similarity pairs retained in audit artifact.`, "Needs controlled editorial programme"],
      ["Article protection", `${architecture.generatedProtectedArticleRoutes} article/category routes excluded from scoring.`, "Boundary preserved"],
      ["Recurring use", "Daily reflections and tools give repeat-visit reasons; quote browsing also supports return use.", "Promising, needs uniqueness discipline"],
      ["AdSense readiness", "Static SEO foundation is good; source-light doctrine and large noindexed/generated quote-story surface are caution areas.", "Not ready for aggressive scaling"]
    ],
    [1700, 5200, 2460],
    { fontSize: 9 }
  ));

  blocks.push(p("Executive Audit Report", { style: "Heading1", pageBreakBefore: true }));
  blocks.push(...mdToBlocks(finalReport).slice(1));

  blocks.push(p("Architecture Discovery", { style: "Heading1", pageBreakBefore: true }));
  blocks.push(kvTable([
    ["Framework", architecture.framework],
    ["Rendering model", architecture.renderingModel],
    ["Generated non-article routes", architecture.generatedNonArticleRoutes],
    ["Generated protected article routes", architecture.generatedProtectedArticleRoutes],
    ["Source counts", JSON.stringify(architecture.sourceCounts)],
    ["Route sources", Object.entries(architecture.routeSources).map(([key, value]) => `${key}: ${value}`).join("; ")]
  ]));
  blocks.push(compactList("Content-system notes", architecture.contentSystemNotes));
  blocks.push(p("Reconciliation", { style: "Heading2" }));
  blocks.push(kvTable([
    ["Sitemap routes", architecture.reconciliation.sitemapRoutes],
    ["Search-index routes", architecture.reconciliation.searchIndexRoutes],
    ["Missing from sitemap", architecture.reconciliation.missingFromSitemap.join("; ") || "None"],
    ["Sitemap-only routes", architecture.reconciliation.sitemapOnlyRoutes.join("; ") || "None"],
    ["Missing from search index", architecture.reconciliation.missingFromSearch.join("; ") || "None"],
    ["Search-index-only routes", architecture.reconciliation.searchOnlyRoutes.join("; ") || "None"],
    ["Orphan pages", architecture.reconciliation.orphanPages.join("; ") || "None"]
  ]));

  blocks.push(p("Content Family Counts", { style: "Heading2" }));
  blocks.push(table(["Family", "Routes"], Object.entries(familyCounts).sort().map(([family, count]) => [family, count]), [7200, 2160]));

  blocks.push(p("Complete Route Inventory", { style: "Heading1", pageBreakBefore: true }));
  blocks.push(p("This appendix converts ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json and .csv into a Word-native table. Long metadata fields are preserved in compact form so the report remains readable.", { spacing: { before: 0, after: 100, line: 270 } }));
  blocks.push(table(
    ["Route", "Family / subtype", "Source / route file", "H1", "SEO and index state", "Links", "Audit status"],
    inventory.map((item) => [
      item.route,
      `${item.family}\n${item.subtype}`,
      `${item.sourceFile}\n${item.routeFile}`,
      item.h1,
      `Canonical: ${item.canonical}\nRobots: ${item.robots}\nSitemap: ${yn(item.inSitemap)}; Search: ${yn(item.inSearchIndex)}\nSchema: ${item.structuredDataTypes.join(", ")}`,
      `Internal: ${item.internalLinkCount}; inbound: ${item.inboundLinkCount}; external sources: ${item.externalSourceLinkCount}\nArticles: ${item.articleReferences.length}; Learn: ${item.learningHubReferences.length}; Quotes: ${item.quoteReferences.length}; Tools: ${item.toolReferences.length}`,
      item.auditStatus
    ]),
    [1500, 1550, 1900, 1300, 1700, 900, 510],
    { fontSize: 7.5 }
  ));

  blocks.push(p("Content-Type-Aware Route Evaluation", { style: "Heading1", pageBreakBefore: true }));
  blocks.push(table(
    ["Route", "Reader / intent", "Purpose", "Separate URL rationale", "Article relationship", "Recommendation"],
    evaluation.map((item) => [
      item.route,
      `${item.intendedReader}\n${item.primarySearchIntent}`,
      item.pagePurpose,
      item.reasonForSeparateUrl,
      item.relationshipWithRelevantArticles,
      item.recommendation
    ]),
    [1450, 1650, 2100, 1850, 1450, 860],
    { fontSize: 7.5 }
  ));

  blocks.push(p("Preservation Baseline", { style: "Heading1", pageBreakBefore: true }));
  blocks.push(p("This table captures the preservation baseline required before any later implementation work: route, slug, canonical, schema, heading IDs, href counts, content relationships, and date values.", { spacing: { before: 0, after: 100, line: 270 } }));
  blocks.push(table(
    ["Route", "Slug", "Canonical", "Schema", "Heading IDs", "Relationships", "Dates"],
    baseline.urls.map((item) => [
      item.route,
      item.slug,
      item.canonical,
      item.schemaTypes.join(", "),
      clean(item.headingIds.join("; "), 500),
      `Hrefs: ${item.hrefs.length}; inbound: ${item.contentRelationships.inboundLinks.length}; related: ${item.contentRelationships.relatedContentReferences.length}; articles: ${item.contentRelationships.articleReferences.length}; learn: ${item.contentRelationships.learningHubReferences.length}; quotes: ${item.contentRelationships.quoteReferences.length}; tools: ${item.contentRelationships.toolReferences.length}`,
      JSON.stringify(item.dateValues)
    ]),
    [1350, 1050, 2050, 1350, 1450, 1450, 660],
    { fontSize: 7.5 }
  ));

  blocks.push(p("Source-Awareness Plan", { style: "Heading1", pageBreakBefore: true }));
  blocks.push(callout("High-priority source review", `${highSource.length} non-article doctrine/practice pages require source review before major SEO expansion. The plan below distinguishes Tier 1 doctrinal sourcing, Tier 2 practice-method sourcing, and Tier 3 editorial transparency.`));
  blocks.push(table(
    ["Route", "Tier", "Visible source/safety section", "External links", "Claims needing support", "Recommended source type", "Recommendation"],
    sourcePlan.map((item) => [
      item.route,
      item.sourceTier,
      yn(item.visibleSourceOrSafetySection),
      item.externalSourceLinks.join("; ") || "None",
      item.claimsLikelyNeedingSupport,
      item.recommendedSourceType,
      item.recommendation
    ]),
    [1350, 1450, 850, 1200, 2050, 1650, 860],
    { fontSize: 7.2 }
  ));

  blocks.push(p("Overlap and Cannibalization Clusters", { style: "Heading1", pageBreakBefore: true }));
  blocks.push(table(
    ["Cluster", "Non-article URLs", "Protected article URLs", "Risk", "Recommendation"],
    clusters.map((item) => [
      item.cluster,
      item.nonArticleUrls.join("\n"),
      item.protectedArticleUrls.join("\n") || "None",
      item.risk,
      item.recommendation
    ]),
    [1500, 2450, 2450, 1150, 1810],
    { fontSize: 8 }
  ));

  blocks.push(p("Human-Writing and Template-Risk Evidence", { style: "Heading1", pageBreakBefore: true }));
  blocks.push(kvTable([
    ["Similarity method", similarity.method.scope],
    ["Normalization", similarity.method.normalization],
    ["Limitations", similarity.method.limitations],
    ["Layers", similarity.method.layers.join("; ")]
  ]));
  blocks.push(p("Exact Duplicated Sentences", { style: "Heading2" }));
  blocks.push(table(
    ["Repeated sentence", "Route count", "Routes"],
    similarity.duplicateSentences.map((item) => [item.text, item.routes.length, item.routes.join("\n")]),
    [3400, 850, 5110],
    { fontSize: 7.2 }
  ));
  blocks.push(p("Exact Duplicated Paragraphs", { style: "Heading2", pageBreakBefore: true }));
  blocks.push(table(
    ["Repeated paragraph", "Route count", "Routes"],
    similarity.duplicateParagraphs.map((item) => [item.text, item.routes.length, item.routes.join("\n")]),
    [3400, 850, 5110],
    { fontSize: 7.2 }
  ));
  blocks.push(p("High Similarity Pairs", { style: "Heading2", pageBreakBefore: true }));
  blocks.push(table(
    ["Left route", "Right route", "Score", "Families"],
    similarity.highSimilarityPairs.map((item) => [item.left, item.right, item.jaccard, `${item.leftFamily} / ${item.rightFamily}`]),
    [3000, 3000, 850, 2510],
    { fontSize: 7.5 }
  ));
  blocks.push(p("Protected Article Overlap Context", { style: "Heading2", pageBreakBefore: true }));
  blocks.push(p("These are recommendation-only comparisons. Protected article content and URLs remain outside the edit scope.", { spacing: { before: 0, after: 100, line: 270 } }));
  blocks.push(table(
    ["Non-article route", "Protected article route", "Protected article title", "Score", "Recommendation"],
    similarity.protectedArticleOverlap.map((item) => [
      item.nonArticleRoute,
      item.protectedArticleRoute,
      item.protectedArticleTitle,
      item.jaccard,
      item.recommendation
    ]),
    [1950, 1950, 2400, 700, 2360],
    { fontSize: 7.3 }
  ));

  blocks.push(p("Appendix: Artifact Register", { style: "Heading1", pageBreakBefore: true }));
  [
    "ECHOBUDDHA_NON_ARTICLE_ARCHITECTURE_DISCOVERY.json",
    "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json",
    "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.csv",
    "ECHOBUDDHA_NON_ARTICLE_PRESERVATION_BASELINE.json",
    "ECHOBUDDHA_NON_ARTICLE_ROUTE_EVALUATION.json",
    "ECHOBUDDHA_NON_ARTICLE_SIMILARITY_AND_TEMPLATE_RISK.json",
    "ECHOBUDDHA_NON_ARTICLE_OVERLAP_CLUSTERS.json",
    "ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json",
    "ECHOBUDDHA_NON_ARTICLE_FINAL_AUDIT_REPORT.md"
  ].forEach((item) => blocks.push(bullet(item)));
  blocks.push(callout("Preservation rule", "This Word report is documentation only. It does not modify URLs, slugs, content, headings, canonicals, hrefs, noindex rules, article content, navigation, structured data, sitemap generation, or public page behavior."));

  writePackage(makeDocumentXml(blocks));
  console.log(JSON.stringify({ docx: path.relative(ROOT, DOCX_PATH), blocks: blocks.length, routes: inventory.length }, null, 2));
}

main();
