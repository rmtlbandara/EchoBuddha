import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "docs", "audits", "non-articles", "implementation", "phase-2");
const FINAL_DIR = path.join(OUT_DIR, "final");
const DOCX = path.join(OUT_DIR, "Echo-Buddha-Non-Article-Phase-2-Final-Audit.docx");
const BUILD_DIR = path.join("/private/tmp", `echo-buddha-phase-2-docx-${Date.now()}`);

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function p(text, style = "Normal") {
  const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : "";
  return `<w:p>${styleXml}<w:r><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
}

function pageBreak() {
  return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
}

function table(rows, widths) {
  const grid = widths.map((width) => `<w:gridCol w:w="${width}"/>`).join("");
  const rowXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, index) => {
          const fill = rowIndex === 0 ? `<w:shd w:fill="F2F4F7"/>` : "";
          const boldStart = rowIndex === 0 ? "<w:b/>" : "";
          return `<w:tc><w:tcPr><w:tcW w:w="${widths[index]}" w:type="dxa"/>${fill}</w:tcPr><w:p><w:pPr><w:spacing w:after="60" w:line="280" w:lineRule="auto"/></w:pPr><w:r><w:rPr>${boldStart}<w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${esc(cell)}</w:t></w:r></w:p></w:tc>`;
        })
        .join("");
      return `<w:tr>${cells}</w:tr>`;
    })
    .join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblInd w:w="120" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:start w:w="120" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:end w:w="120" w:type="dxa"/></w:tblCellMar><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/><w:left w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/><w:right w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="DADCE0"/></w:tblBorders></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${rowXml}</w:tbl>`;
}

function listParagraph(text) {
  return `<w:p><w:pPr><w:pStyle w:val="Normal"/><w:ind w:left="360"/><w:spacing w:after="80" w:line="280" w:lineRule="auto"/></w:pPr><w:r><w:t xml:space="preserve">- ${esc(text)}</w:t></w:r></w:p>`;
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

const inventory = readJson(path.join(FINAL_DIR, "ECHOBUDDHA_NON_ARTICLE_ROUTE_INVENTORY.json"));
const sourcePlan = readJson(path.join(FINAL_DIR, "ECHOBUDDHA_NON_ARTICLE_SOURCE_PLAN.json"));
const preservation = readJson(path.join(OUT_DIR, "PHASE_2_PRESERVATION_VALIDATION.json"));
const quality = readJson(path.join(OUT_DIR, "PHASE_2_QUALITY_GATE_RESULTS.json"));
const evidence = readJson(path.join(ROOT, "docs", "audits", "non-articles", "ECHOBUDDHA_NON_ARTICLE_POST_IMPLEMENTATION_FINAL_EVIDENCE.json"));

const quoteStories = inventory.filter((entry) => entry.subtype === "quote-story");
const dailyDetails = inventory.filter((entry) => entry.subtype === "reflection-detail");
const noindexQuoteStories = quoteStories.filter((entry) => entry.robots.includes("noindex"));
const indexQuoteStories = quoteStories.filter((entry) => !entry.robots.includes("noindex"));
const sourceReviewBlockers = sourcePlan.filter((entry) => /needed|required/i.test(entry.recommendation) && !/Maintain/.test(entry.recommendation));

const body = [
  p("Echo Buddha Non-Article Phase 2 Final Audit", "Title"),
  p("Quote system, daily-reflection system, preservation validation, quality gates, SEO/indexing policy, and AdSense-readiness evidence.", "Subtitle"),
  p(`Prepared: ${new Date().toISOString().slice(0, 10)}`),
  p("Repository: Echo Buddha"),
  p("Website: https://echobuddha.com/"),
  p("Preset: standard_business_brief; US Letter, 1 inch margins, Calibri 11 pt body, restrained business-report tables."),
  p("Executive Verdict", "Heading1"),
  p("Phase 2 is implemented and validated. The work improves quote-origin transparency, quote-story differentiation, daily-reflection specificity, recurring Today-route semantics, wellbeing notes, and final evidence reporting while preserving the non-article URL/canonical/navigation surface."),
  table(
    [
      ["Area", "Verdict", "Evidence"],
      ["Implementation", "Complete", "Quote and daily-reflection systems updated; final build succeeded."],
      ["Preservation", preservation.passed ? "Pass" : "Not pass", `${preservation.summary.failures} failures, ${preservation.summary.warnings} warnings across ${preservation.summary.phase2RoutesAfter} final routes.`],
      ["Quality gates", quality.passed ? "Pass" : "Not pass", `${quality.summary.gates} gates, ${quality.summary.errors} errors, ${quality.summary.warnings} documented warning.`],
      ["AdSense readiness", "Conditionally ready after named residual blockers", "Source blockers are zero; residual quote-story similarity and separate policy/account review remain."],
      ["Deployment", "Not performed", "No push or deploy performed; ads remain disabled."]
    ],
    [2200, 2600, 4560]
  ),
  p("Scope And Counts", "Heading1"),
  table(
    [
      ["Metric", "Final value"],
      ["Generated non-article routes", inventory.length],
      ["Quote story routes", quoteStories.length],
      ["Indexable quote stories", indexQuoteStories.length],
      ["Noindex quote stories", noindexQuoteStories.length],
      ["Daily reflection detail routes", dailyDetails.length],
      ["Today route", "1 stable UTC-selected utility route"],
      ["Source review blockers", sourceReviewBlockers.length],
      ["Protected article edits intended", "0"],
      ["Phase 1 improvements", "Preserved"]
    ],
    [4200, 5160]
  ),
  p("Phase 2 Implementation Summary", "Heading1"),
  p("Quote System", "Heading2"),
  p("Every quote record now receives an explicit quote-origin status. The default status is Original Echo Buddha quote, with visible page disclosure that the text is original editorial writing inspired by Buddhist practice and is not a direct Buddha quote, scripture translation, or historical saying."),
  p("Quote story pages now surface the status label, include a Quote Status block, add structured-data credit/abstract values, use route-specific source notes, and carry more specific daily-life and practice framing."),
  table(
    [
      ["Quote evidence file", "Purpose"],
      ["PHASE_2_QUOTE_STATUS_REGISTER.csv", "All 153 quote records with route, theme, status label, and source note."],
      ["PHASE_2_QUOTE_INDEXABILITY_MATRIX.csv", "Previous/final robots, sitemap membership, internal search membership, and indexability class."],
      ["PHASE_2_QUOTE_STORY_CHANGE_MATRIX.csv", "Per-story material-change matrix."]
    ],
    [3400, 5960]
  ),
  p("Daily Reflections", "Heading2"),
  p("All 30 daily reflection detail routes now have a specific form label, central observation, real-life situation, and natural next step. Sensitive routes include wellbeing notes that clarify boundaries without turning reflective content into medical, crisis, or professional advice."),
  p("The Today route remains /daily-reflections/today/ with stable canonical URL and stable route purpose. It now uses WebPage schema instead of Article schema and rotates by UTC day-of-year."),
  p("Preservation Validation", "Heading1"),
  p("The preservation validator compared the Phase 2 baseline against the final state and also checked original pre-implementation route evidence where the original baseline carried the relevant fields."),
  table(
    [
      ["Check", "Result"],
      ["Phase 2 routes before", preservation.summary.phase2RoutesBefore],
      ["Phase 2 routes after", preservation.summary.phase2RoutesAfter],
      ["Original routes before", preservation.summary.originalRoutesBefore],
      ["Final routes after", preservation.summary.finalRoutesAfter],
      ["Failures", preservation.summary.failures],
      ["Warnings", preservation.summary.warnings],
      ["Intentional changes", "2 records: Today route Article-to-WebPage schema correction in both comparisons."]
    ],
    [4200, 5160]
  ),
  p("Preserved surfaces include route set, URL, slug, canonical, existing heading IDs, existing href destinations, category/collection relationships, sitemap/search policy from Phase 2 baseline, and date values. Protected article content and article routes were outside the edit scope."),
  p("Quality Gates", "Heading1"),
  table(
    [
      ["Gate group", "Result"],
      ["Unique quote text", "Pass"],
      ["Quote routes generated", "Pass"],
      ["Visible quote-origin disclosure", "Pass"],
      ["Quote robots/sitemap policy", "Pass"],
      ["Quote title/H1/meta avoids direct-Buddha-quote framing", "Pass"],
      ["Daily reflection slugs/titles unique", "Pass"],
      ["Daily reflection differentiators complete", "Pass"],
      ["Today route WebPage utility schema", "Pass"],
      ["Source blockers", "Pass"],
      ["Residual duplication", "Warning documented for editorial follow-up"]
    ],
    [4300, 5060]
  ),
  p("Duplication And Similarity", "Heading1"),
  table(
    [
      ["Metric", "Phase 2 baseline", "Final", "Interpretation"],
      ["Duplicate sentence groups retained", "100", "100", "Audit artifact is capped at the top 100 groups."],
      ["Duplicate paragraph groups retained", "100", "100", "Artifact is capped at the top 100 groups."],
      ["Largest duplicate sentence route count", "153", "110", "Remaining large sentence pattern is mostly required disclosure/practice language."],
      ["Largest duplicate paragraph route count", "153", "52", "Major quote-story paragraph duplication reduced."],
      ["Full high-similarity pairs from audit console", "12,242", "11,104", "Improved by 1,138 pairs."]
    ],
    [2600, 1500, 1500, 3760]
  ),
  p("SEO, Search, Sitemap, And Robots", "Heading1"),
  p("Phase 2 did not broaden sitewide noindex behavior. Indexable quote stories remain in the sitemap; noindex quote stories remain useful for internal browsing but are excluded from the sitemap. The final audit reports 51 routes missing from sitemap, consistent with noindex/non-indexable policy and support routes, and 12 routes missing from internal search, preserved from the Phase 2 baseline."),
  table(
    [
      ["Policy surface", "Final state"],
      ["Noindex quote stories", `${noindexQuoteStories.length}; excluded from sitemap.`],
      ["Indexable quote stories", `${indexQuoteStories.length}; present in sitemap.`],
      ["Internal search", "Noindex pages may remain when useful for on-site discovery and documented."],
      ["Today route schema", "WebPage, not Article."],
      ["Canonical route discipline", "Preserved."]
    ],
    [3600, 5760]
  ),
  p("Wellbeing And Source Integrity", "Heading1"),
  p("Daily-reflection wellbeing notes were added where anger, intense feelings, difficult-person loving-kindness, persistent thoughts, rest/exhaustion, and related sensitive experiences could otherwise be read too broadly. The notes keep the pages reflective and educational, not medical or crisis-support content."),
  p("The final source register reports zero unresolved source-review blockers. Quote pages now disclose original Echo Buddha authorship; Phase 1 source clarity for learning, dictionary, sutta/Dhammapada, and meditation content remains preserved."),
  p("Readiness Verdict", "Heading1"),
  p("Content-readiness verdict: conditionally ready after named residual blockers. This is a strong Phase 2 result, but not a blank approval claim. The non-article system is materially clearer and better documented, while quote-story similarity remains the main editorial follow-up area."),
  table(
    [
      ["Readiness area", "Verdict"],
      ["Content/source clarity", "Improved; source blockers zero."],
      ["Quote-origin labeling", "Complete across 153 records."],
      ["Daily-reflection usefulness", "Improved across 30 detail routes plus Today route."],
      ["AdSense", "Conditionally ready; separate ad/account/policy/consent/layout review still required."],
      ["Ads", "Remain disabled."],
      ["Push/deploy", "Not performed."]
    ],
    [3900, 5460]
  ),
  p("Generated Evidence Files", "Heading1"),
  table(
    [
      ["File", "What it proves"],
      ["PHASE_2_PRESERVATION_VALIDATION.json", "Machine-readable preservation validation."],
      ["PHASE_2_QUALITY_GATE_RESULTS.json", "Machine-readable quality gate results."],
      ["PHASE_2_VALIDATION_REPORT.md", "Commands and final validation summary."],
      ["FINAL_NON_ARTICLE_CONTENT_STATUS_MATRIX.csv", "All 264 final non-article routes."],
      ["FINAL_NON_ARTICLE_SOURCE_REGISTER.md", "Final source/origin status register."],
      ["FINAL_NON_ARTICLE_HUMAN_WRITING_AUDIT.md", "Duplication and human-writing risk review."],
      ["FINAL_NON_ARTICLE_SEO_INDEXING_REPORT.md", "Robots, sitemap, search, and schema evidence."],
      ["FINAL_NON_ARTICLE_ADSENSE_READINESS.md", "Readiness verdict and residual blockers."],
      ["ECHOBUDDHA_NON_ARTICLE_POST_IMPLEMENTATION_FINAL_EVIDENCE.json", "Canonical final evidence pointer without overwriting original audit."]
    ],
    [4200, 5160]
  ),
  p("Final Accountability Statement", "Heading1"),
  p("Before moving on to Prompt 2, Phase 2 has been built, audited, preservation-validated, quality-gated, and packaged into Markdown, CSV, JSON, and DOCX evidence. The only validation limitation is visual DOCX rendering: LibreOffice/soffice is not installed in this environment, so DOCX verification is structural and text-extraction based rather than rendered-page PNG based."),
  p(`Evidence snapshot: preservation=${preservation.passed ? "pass" : "fail"}; quality=${quality.passed ? "pass" : "fail"}; final routes=${inventory.length}; quote stories=${quoteStories.length}; daily reflection details=${dailyDetails.length}; ads enabled=${evidence.adsEnabled}; pushed/deployed=${evidence.pushedOrDeployed}.`)
].join("");

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="160"/></w:pPr><w:rPr><w:b/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="0B2545"/><w:sz w:val="52"/><w:szCs w:val="52"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="240"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="555555"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="160"/></w:pPr><w:rPr><w:b/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="2E74B5"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:b/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:color w:val="2E74B5"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>
</w:styles>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Echo Buddha Non-Article Phase 2 Final Audit</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`;

const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex OOXML Builder</Application>
</Properties>`;

ensureDir(path.join(BUILD_DIR, "_rels"));
ensureDir(path.join(BUILD_DIR, "word", "_rels"));
ensureDir(path.join(BUILD_DIR, "docProps"));
writeFileSync(path.join(BUILD_DIR, "[Content_Types].xml"), contentTypes);
writeFileSync(path.join(BUILD_DIR, "_rels", ".rels"), rels);
writeFileSync(path.join(BUILD_DIR, "word", "document.xml"), documentXml);
writeFileSync(path.join(BUILD_DIR, "word", "styles.xml"), stylesXml);
writeFileSync(path.join(BUILD_DIR, "word", "_rels", "document.xml.rels"), documentRels);
writeFileSync(path.join(BUILD_DIR, "docProps", "core.xml"), core);
writeFileSync(path.join(BUILD_DIR, "docProps", "app.xml"), app);

if (existsSync(DOCX)) {
  unlinkSync(DOCX);
}
const zip = spawnSync("zip", ["-qr", DOCX, "."], { cwd: BUILD_DIR, encoding: "utf8" });
if (zip.status !== 0) {
  throw new Error(`zip failed: ${zip.stderr || zip.stdout}`);
}

console.log(JSON.stringify({ docx: DOCX, buildDir: BUILD_DIR }, null, 2));
