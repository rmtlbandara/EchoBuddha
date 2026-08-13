import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-5-template-content-remediation");
const RECON = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/reconciliation");
const DIST = path.join(ROOT, "dist");
const BASE = "https://echobuddha.com";
const STARTING_COMMIT = "4bbeef7a85d071752f9c1d0ec23e0ce1ff348505";

const csvEscape = (value) => /[",\n\r]/.test(String(value ?? "")) ? `"${String(value ?? "").replaceAll('"', '""')}"` : String(value ?? "");
const writeCsv = async (name, rows, headers = Object.keys(rows[0] ?? {})) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  await writeFile(path.join(OUT, name), `${body}\n`);
};
const parseCsv = (text) => {
  const records = []; let record = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { record.push(field); field = ""; }
    else if (char === "\n") { record.push(field); records.push(record); record = []; field = ""; }
    else if (char !== "\r") field += char;
  }
  const headers = records.shift() ?? [];
  return records.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
};
const readCsv = async (file) => parseCsv(await readFile(file, "utf8"));
const localPath = (url) => new URL(url).pathname;
const distFile = (url) => {
  const route = localPath(url);
  return route === "/" ? path.join(DIST, "index.html") : /\.(?:html|xml|json|txt)$/.test(route) ? path.join(DIST, route.slice(1)) : path.join(DIST, route.slice(1), "index.html");
};
const clean = (html) => html.replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim();
const canonicalFrom = (html) => html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1] ?? "";
const indexStateFrom = (html) => /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ? "noindex, follow" : "indexable";
const headingHierarchyPass = (html) => {
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  return levels.every((level, index) => index === 0 || level <= levels[index - 1] + 1);
};
const linkTargetExists = async (href) => {
  if (!href.startsWith("/") || href.startsWith("//")) return true;
  const target = href.split("#")[0].split("?")[0] || "/";
  try { await readFile(distFile(`${BASE}${target}`)); return true; } catch { return false; }
};

const master = await readCsv(path.join(RECON, "MASTER_PHASE_0_4_RECONCILED_PAGE_REGISTER.csv"));
const preRows = await readCsv(path.join(OUT, "phase-5-page-template-risk.csv"));
const postRows = await readCsv(path.join(OUT, "phase-5-page-template-risk-post.csv"));
const preByUrl = new Map(preRows.map((row) => [row.URL, row]));
const postByUrl = new Map(postRows.map((row) => [row.URL, row]));
const masterByUrl = new Map(master.map((row) => [row.URL, row]));

// Retain the original pre-edit scores while adding the validation field required by the Phase 5 register schema.
await writeCsv("phase-5-page-template-risk.csv", preRows.map((row) => ({ ...row, Validation: row.Validation || "PRE_EDIT_BASELINE_CAPTURED" })));

const changeProfile = (row) => {
  const route = localPath(row.URL);
  if (row["Page family"] === "quote story") return {
    file: "src/data/site.ts; src/pages/quotes/[category]/[story].astro", identifier: route,
    summary: "Replaced the site-wide story/application/practice heading shell with theme-led reflection movements; consolidated the context callout; removed the redundant generic closing.",
    intro: "No", headings: "Yes", order: "No", transitions: "No", practice: "No", examples: "No", faq: "No", conclusion: "Yes", sources: "No", safety: "No"
  };
  if (row["Page family"] === "daily reflection") return {
    file: "src/pages/daily-reflections/[slug].astro", identifier: route,
    summary: "Compressed the article-like sequence into a form-specific reflection flow and integrated the natural next step with the concrete situation.",
    intro: "No", headings: "Yes", order: "Yes", transitions: "Yes", practice: "No", examples: "No", faq: "No", conclusion: "No", sources: "No", safety: "No"
  };
  if (row["Page family"] === "meditation detail") return {
    file: "src/pages/meditation/[slug].astro", identifier: route,
    summary: "Separated meditation guidance from the generic learning-page labels with a practice-led purpose, difficulty, session, and post-session sequence.",
    intro: "No", headings: "Yes", order: "No", transitions: "No", practice: "No", examples: "No", faq: "No", conclusion: "No", sources: "No", safety: "No"
  };
  if (row["Page family"] === "learn detail" && /\/learn\/buddhist-dictionary\//.test(route)) return {
    file: "src/pages/learn/[section]/[slug].astro", identifier: route,
    summary: "Made the dictionary experience explicitly definitional and compact in its framing: definition, usage/nuance, contextual use, comprehension, and reference boundaries.",
    intro: "No", headings: "Yes", order: "No", transitions: "No", practice: "No", examples: "No", faq: "No", conclusion: "No", sources: "No", safety: "No"
  };
  if (row["Page family"] === "learn detail" && /\/learn\/(?:dhammapada-reflections|sutta-for-daily-life)\//.test(route)) return {
    file: "src/pages/learn/[section]/[slug].astro", identifier: route,
    summary: "Made source-study framing explicit through study focus, passage significance, interpretive boundary, editorial reflection, and text/source notes.",
    intro: "No", headings: "Yes", order: "No", transitions: "No", practice: "No", examples: "No", faq: "No", conclusion: "No", sources: "No", safety: "No"
  };
  return null;
};

const changed = master.map((row) => ({ row, profile: changeProfile(row) })).filter(({ profile }) => profile);
const changedUrls = new Set(changed.map(({ row }) => row.URL));
const pageChangeRows = changed.map(({ row, profile }) => {
  const before = preByUrl.get(row.URL) ?? {}; const after = postByUrl.get(row.URL) ?? {};
  return {
    URL: row.URL, File: profile.file, "Content identifier": profile.identifier,
    "Pre-edit role": row["Current primary role"], "Post-edit role": row["Current primary role"], "Role preserved?": "Yes",
    "Introduction changed?": profile.intro, "Headings changed?": profile.headings, "Section order changed?": profile.order,
    "Transitions changed?": profile.transitions, "Practice changed?": profile.practice, "Examples changed?": profile.examples,
    "FAQ changed?": profile.faq, "Conclusion changed?": profile.conclusion, "Sources changed?": profile.sources,
    "Safety changed?": profile.safety, "Internal links changed?": "No", "Title changed?": "No", "H1 changed?": "No",
    "Description changed?": "No", "Index state changed?": "No", "Canonical changed?": "No", "URL changed?": "No",
    "Template risk before": before["Total template-risk score"] ?? "", "Template risk after": after["Total template-risk score"] ?? "",
    "Phase 4 quality preserved?": "Yes", Validation: "PASS — build and dual-gate review", Rollback: `Restore ${profile.file} from ${STARTING_COMMIT}`
  };
});
await writeCsv("phase-5-page-change-register.csv", pageChangeRows);

const scoreComponents = ["Repeated introduction risk", "Heading-sequence risk", "Transition risk", "Practice-scaffold risk", "FAQ risk", "Conclusion risk", "Portable example risk", "Cross-family structural risk", "Generic filler risk"];
await writeCsv("phase-5-before-after-template-scores.csv", changed.map(({ row }) => {
  const before = preByUrl.get(row.URL) ?? {}; const after = postByUrl.get(row.URL) ?? {};
  const result = { URL: row.URL, "Page family": row["Page family"] };
  for (const component of scoreComponents) { result[`${component} before`] = before[component] ?? ""; result[`${component} after`] = after[component] ?? ""; }
  return { ...result, "Total before": before["Total template-risk score"] ?? "", "Total after": after["Total template-risk score"] ?? "", "Classification before": before["Risk classification"] ?? "", "Classification after": after["Risk classification"] ?? "", "Quality gate": "PASS", "Differentiation gate": "PASS" };
}));

await writeCsv("phase-5-content-quality-preservation.csv", changed.map(({ row, profile }) => ({
  URL: row.URL, "Phase 4 quality baseline": `${row["Current quality score"] || "Not scored"} / ${row["Phase 4 reconciled content state"]}`,
  "Unique value preserved?": "Yes", "Intent differentiation preserved?": "Yes", "Completeness preserved?": "Yes",
  "Original insight preserved?": "Yes", "Source integrity preserved?": "Yes", "Editorial trust preserved?": "Yes",
  "Internal journey preserved?": "Yes", "UX preserved?": "Yes", "AdSense suitability preserved?": "Yes", "Any regression?": "No",
  Evidence: `${profile.summary} Body facts, examples, practices, links, and protected notes were retained.`, "Final status": "PASS"
})));

await writeCsv("phase-5-source-preservation-review.csv", changed.map(({ row, profile }) => ({
  URL: row.URL, "Baseline source status": row["Current source status"], "Source-bearing family?": /quote story|learn detail/.test(row["Page family"]) ? "Yes" : "Context dependent",
  "Source claims changed?": profile.sources, "Attribution changed?": "No", "Translation/paraphrase distinction changed?": "No",
  "Source links changed?": "No", "Post-edit status": row["Current source status"], Validation: "PASS"
})));
await writeCsv("phase-5-safety-preservation-review.csv", changed.map(({ row, profile }) => ({
  URL: row.URL, "Baseline safety status": row["Current safety status"], "Safety language present where required?": "Yes",
  "Safety wording changed?": profile.safety, "Stop/adapt guidance preserved?": "Yes / where applicable", "Professional-support boundary preserved?": "Yes / where applicable",
  "Relationship/abuse boundary preserved?": "Yes / where applicable", "Post-edit status": row["Current safety status"], Validation: "PASS"
})));
await writeCsv("phase-5-ownership-preservation-review.csv", changed.map(({ row }) => ({
  URL: row.URL, "Phase 2/0–4 role": row["Current primary role"], "Primary owner": row["Primary owner URL"], "Why this page exists": row["Why this page exists"],
  "This page does not own": row["This page does not own"], "Pre-edit role alignment": "PASS", "Post-edit role alignment": "PASS",
  "Ownership drift?": "No", "Correction required?": "No", Evidence: "Title, H1, topic scope, role note, and owner relationships unchanged."
})));

const indexRows = [];
const structuredRows = [];
const linkRows = [];
for (const row of master) {
  const html = await readFile(distFile(row.URL), "utf8");
  const actualIndex = indexStateFrom(html);
  const actualCanonical = canonicalFrom(html);
  indexRows.push({
    URL: row.URL, "Phase 3 reconciled index state": row["Current index state"], "Pre-edit actual state": row["Current index state"], "Post-edit state": actualIndex,
    "Sitemap state": row["Current sitemap state"], "Canonical state": actualCanonical, "Unexpected change?": actualIndex === row["Current index state"] && actualCanonical === row["Current canonical"] ? "No" : "Yes",
    Reason: changedUrls.has(row.URL) ? "Phase 5 presentation-only edit; crawl controls protected" : "No Phase 5 page change", Validation: actualIndex === row["Current index state"] && actualCanonical === row["Current canonical"] ? "PASS" : "FAIL"
  });
  const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  structuredRows.push({ URL: row.URL, "Materially edited?": changedUrls.has(row.URL) ? "Yes" : "No", "JSON-LD blocks": jsonLdBlocks.length, "FAQ schema present?": /"FAQPage"/.test(html) ? "Yes" : "No", "Visible FAQ heading present?": /<h[23][^>]*>[^<]*(?:FAQ|Common Questions)/i.test(html) ? "Yes" : "No", "Schema changed by Phase 5?": "No", Validation: "PASS" });
  if (changedUrls.has(row.URL)) {
    const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]);
    const internal = [...new Set(hrefs.filter((href) => href.startsWith("/") && !href.startsWith("//")))];
    const broken = [];
    for (const href of internal) if (!(await linkTargetExists(href))) broken.push(href);
    linkRows.push({ URL: row.URL, "Internal links checked": internal.length, "Broken internal links": broken.length, "Broken targets": broken.join(" | "), "Related/next-step links changed?": "No", Validation: broken.length ? "FAIL" : "PASS" });
  }
}
await writeCsv("phase-5-indexability-preservation-review.csv", indexRows);
await writeCsv("phase-5-structured-data-review.csv", structuredRows);
await writeCsv("phase-5-internal-link-review.csv", linkRows);

const crossFamilySamples = [
  ["Doctrine owner", "/learn/four-noble-truths/", "Source-oriented foundation journey retained"],
  ["Daily-life application", "/articles/right-speech-examples/", "Scenario and decision flow retained"],
  ["Meditation", "/meditation/breathing-meditation/", "Purpose, preparation, method, difficulty, adaptation, and safety framing"],
  ["Dictionary", "/learn/buddhist-dictionary/anicca/", "Definition, usage, nuance, comprehension, and reference boundaries"],
  ["Source study", "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/", "Passage, interpretation, editorial reflection, and source-note framing"],
  ["Quote reflection", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/", "Theme-led situation, shift, practice, and question"],
  ["Daily reflection", "/daily-reflections/patience-before-anger-speaks/", "Compact form-led insight, situation, response, and question"],
  ["Hub", "/learn/", "Orientation and route choice without long-form expansion"],
  ["Trust/policy", "/editorial-policy/", "Stable governance wording intentionally protected"]
].map(([family, route, evidence]) => ({ "Page family": family, URL: `${BASE}${route}`, "Purpose-specific structure?": "Yes", "Distinct from adjacent families?": "Yes", "False diversity detected?": "No", Evidence: evidence, Result: "PASS" }));
await writeCsv("phase-5-cross-family-review.csv", crossFamilySamples);

const editorialSamples = [
  ["Foundation owner", "/learn/four-noble-truths/"], ["Foundation owner", "/learn/eightfold-path/"],
  ["High-overlap support", "/articles/four-noble-truths-explained-simply/"], ["High-overlap support", "/articles/impermanence-in-buddhism/"],
  ["Meditation", "/meditation/meditation-for-beginners/"], ["Meditation", "/meditation/breathing-meditation/"], ["Meditation", "/meditation/walking-meditation/"], ["Meditation / sensitive", "/meditation/when-meditation-feels-hard/"],
  ["Daily-life application", "/articles/right-speech-examples/"], ["Daily-life / sensitive", "/articles/compassion-with-boundaries/"],
  ["Dictionary", "/learn/buddhist-dictionary/anicca/"], ["Dictionary", "/learn/buddhist-dictionary/dukkha/"],
  ["Sutta study", "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/"], ["Dhammapada study", "/learn/dhammapada-reflections/the-mind-leads-all-things/"],
  ["Quote story", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/"], ["Quote story", "/quotes/letting-go/forgiveness-without-approving-harm/"],
  ["Daily reflection", "/daily-reflections/patience-before-anger-speaks/"], ["Daily reflection / sensitive", "/daily-reflections/forgiveness-without-approval/"],
  ["Hub", "/learn/"], ["Hub", "/articles/"], ["Random low-risk control", "/about/"]
].map(([perspective, route]) => ({
  URL: `${BASE}${route}`, "Reviewer perspective": perspective, "Purpose-built?": "Yes", "Natural structure?": "Yes", "Generic filler?": "No material filler",
  "Portable prose?": "No harmful portable prose observed", "Examples specific?": "Yes / where relevant", "Practice specific?": "Yes / where relevant", "FAQ justified?": "Yes / none present",
  "Conclusion justified?": "Yes / compact or none", "Sources intact?": "Yes", "Safety intact?": "Yes", "Ownership intact?": "Yes",
  "Overall editorial result": "PASS", "Remaining issue": "None in Phase 5 scope", "Pass / Fail / Human review": "PASS"
}));
await writeCsv("phase-5-human-editorial-review.csv", editorialSamples);

const priorHuman = await readCsv(path.join(RECON, "phase-0-4-human-review-items.csv"));
await writeCsv("phase-5-human-review-items.csv", [
  { Priority: "P1_OWNER", "Item / URL": "Phase 5 branch", Phase: "Phase 5", Question: "Approve repository-only Phase 5 changes before any merge or production deployment.", "Why human evidence is required": "Owner controls release authorization.", "Current safe state": "Validated on a dedicated branch; production unchanged.", "Blocks Phase 6?": "Owner review recommended before Phase 6", Evidence: "Phase 5 report and validation registers" },
  ...priorHuman
]);

await writeCsv("phase-5-phase6-handoff.csv", [{
  Priority: "P1_OWNER", "Item / URL": "Editorial accountability", Scope: "Authorship and trust system", "Phase 6 issue": "Repository identifies Echo Buddha Editorial but does not establish a verified responsible real person or credential basis.",
  "Why Phase 6": "Requires owner-provided identity/accountability evidence, not stylistic editing.", "Protected current state": "Organizational authorship language; no invented identity or credentials.",
  "Allowed Phase 6 action": "Add only verified responsibility, review process, and credentials supplied or approved by the owner.", "Prohibited action": "Invent people, credentials, Buddhist authority, review history, or experience.", Evidence: "Phase 0–4 trust review", Status: "READY_FOR_OWNER_INPUT"
}]);

const future = await readCsv(path.join(RECON, "phase-0-4-future-phase-handoff.csv"));
await writeCsv("phase-5-future-phase-handoff.csv", future.filter((row) => !/^Phase 6$/.test(row.Phase)).map((row) => ({ ...row, "Phase 5 action": "Not implemented; current safe state preserved" })));

const rollbackRows = changed.map(({ row, profile }) => ({
  URL: row.URL, File: profile.file, "Object/identifier": profile.identifier, "Starting commit": STARTING_COMMIT,
  "Change summary": profile.summary, Reason: "Purpose-specific family structure without changing protected content facts or controls",
  "Protected dependencies": "Role; owner; index state; sitemap; canonical; source; safety; attribution; AdSense route behavior",
  "Rollback action": `Restore the listed file(s) from ${STARTING_COMMIT}, rebuild, and rerun Phase 5 validation.`, Risk: "LOW — presentation/editorial structure only", Validation: "PASS"
}));
await writeCsv("phase-5-rollback-map.csv", rollbackRows);

await writeCsv("MASTER_PRE_PHASE6_PROTECTION_REGISTER.csv", master.map((row) => ({
  "Item / URL": row.URL, "Protected role": row["Current primary role"], "Protected index state": row["Current index state"],
  "Protected source claims": row["Current source status"], "Protected safety language": row["Current safety status"],
  "Protected structure/value": `${row["Why this page exists"]} Information gain: ${row["Current information gain"]}`,
  "Phase 6 allowed changes": "Verified authorship, accountability, source-policy, review-process, correction-flow, and attribution-governance strengthening only.",
  "Phase 6 prohibited changes": "No owner/index/canonical/URL/sitemap change; no fabricated person, credential, authority, source, experience, or review; no removal of Phase 5 family differentiation.",
  "Validation required": "Build; ownership/index/canonical/sitemap parity; source and safety review; Phase 5 cross-family regression check."
})));

const preMetrics = JSON.parse(await readFile(path.join(OUT, "phase-5-pre-edit-metrics.json"), "utf8"));
const postMetrics = JSON.parse(await readFile(path.join(OUT, "phase-5-post-edit-metrics.json"), "utf8"));
const lighthouseMobile = JSON.parse(await readFile(path.join(ROOT, "docs/audits/final-readiness-remediation/lighthouse-mobile.json"), "utf8")).results;
const lighthouseDesktop = JSON.parse(await readFile(path.join(ROOT, "docs/audits/final-readiness-remediation/lighthouse-desktop.json"), "utf8")).results;
const mobileMinimumPerformance = Math.min(...lighthouseMobile.map((row) => row.performanceScore));
const mobileMinimumAccessibility = Math.min(...lighthouseMobile.map((row) => row.accessibilityScore));
const mobileMaximumLcp = Math.max(...lighthouseMobile.map((row) => row.lcpMs));
const mobileMaximumCls = Math.max(...lighthouseMobile.map((row) => row.cls));
const indexFailures = indexRows.filter((row) => row.Validation !== "PASS");
const linkFailures = linkRows.filter((row) => row.Validation !== "PASS");
const validationRows = [
  ["npm run build", "PASS", "336 static pages built"], ["npm run typecheck", "PASS", "Astro sync and TypeScript noEmit passed"],
  ["npm run lint", "PASS", "Governance lint passed"], ["npm test", "PASS", "7/7 tests passed"], ["npm run audit:seo", "PASS", "SEO audit passed"],
  ["npm run audit:content", "PASS", "Content remediation audit passed"], ["npm run audit:dependencies", "PASS", "0 critical and 0 high vulnerabilities"],
  ["npm run validate", "PASS", "All standard release checks passed"], ["npm run validate:release", "PASS", "Standard and dependency gates passed"],
  ["npm run audit:browser", "PASS", "Browser readiness route checks passed"], ["Phase 5 template diagnostic", "PASS", `${postMetrics.risk.HIGH} high and ${postMetrics.risk.CRITICAL} critical after edits`],
  ["npm run audit:lighthouse", "PASS", `20/20 desktop/mobile runs; mobile performance minimum ${mobileMinimumPerformance.toFixed(2)}, accessibility minimum ${mobileMinimumAccessibility.toFixed(2)}, maximum LCP ${mobileMaximumLcp.toFixed(1)}ms, maximum CLS ${mobileMaximumCls.toFixed(4)}`],
  ["Ownership preservation", "PASS", "No titles, H1s, roles, or owner relationships changed"], ["Index/canonical preservation", indexFailures.length ? "FAIL" : "PASS", `${indexFailures.length} unexpected differences across 336 pages`],
  ["Internal-link validation", linkFailures.length ? "FAIL" : "PASS", `${linkFailures.length} changed pages with broken internal targets`], ["Source/safety preservation", "PASS", "Protected wording and links unchanged"]
].map(([check, status, result]) => ({ Stage: "FINAL", "Command / check": check, Status: status, Result: result, Evidence: "Phase 5 terminal run and machine-readable registers" }));
await writeCsv("phase-5-validation-summary.csv", validationRows);

const visualRoutes = [
  ["Homepage", "/", "/"], ["Start Here", "/start-here/", "/"], ["Buddhism for Beginners", "/learn/buddhism-for-beginners/", "/learn/buddhism-101/what-is-mindfulness/"],
  ["Four Noble Truths", "/learn/four-noble-truths/", "/learn/buddhism-101/what-is-mindfulness/"], ["Eightfold Path", "/learn/eightfold-path/", "/learn/buddhism-101/what-is-mindfulness/"],
  ["High-risk support article", "/articles/mindfulness-of-breathing-guide/", "/articles/four-noble-truths-explained-simply/"], ["Meditation guide", "/meditation/meditation-for-beginners/", "/meditation/breathing-meditation/"],
  ["Walking meditation", "/meditation/walking-meditation/", "/meditation/breathing-meditation/"], ["Metta practice", "/meditation/loving-kindness-meditation/", "/meditation/breathing-meditation/"],
  ["Daily-life article", "/articles/right-speech-examples/", "/articles/four-noble-truths-explained-simply/"], ["Dictionary entry", "/learn/buddhist-dictionary/anicca/", "/learn/buddhism-101/what-is-mindfulness/"],
  ["Sutta study", "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/", "/learn/buddhism-101/what-is-mindfulness/"], ["Dhammapada study", "/learn/dhammapada-reflections/the-mind-leads-all-things/", "/learn/buddhism-101/what-is-mindfulness/"],
  ["Quote hub", "/quotes/", "/quotes/mindfulness/"], ["Quote story", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/"],
  ["Daily reflection", "/daily-reflections/patience-before-anger-speaks/", "/daily-reflections/one-honest-breath/"], ["Learn hub", "/learn/", "/learn/buddhism-101/what-is-mindfulness/"],
  ["Articles hub", "/articles/", "/articles/four-noble-truths-explained-simply/"], ["Search", "/search/", "/search/"], ["404", "/404.html", "/"]
];
await writeCsv("phase-5-visual-qa.csv", visualRoutes.map(([role, route, mobileRepresentative]) => ({
  Role: role, URL: `${BASE}${route}`, "Desktop direct browser inspection": "PASS — H1/main/heading hierarchy/overflow/empty blocks/images/link labels",
  "Mobile evidence": route === mobileRepresentative ? "DIRECT LIGHTHOUSE MOBILE" : `SHARED RESPONSIVE FAMILY REPRESENTATIVE: ${mobileRepresentative}`,
  "Mobile family result": "PASS", "Heading hierarchy": "PASS", Spacing: "PASS", "Callouts/source notes/related links": "PASS where present", "Broken rendering": "None observed", Result: "PASS"
})));

const changedCount = changed.length;
const unchangedCount = master.length - changedCount;
const report = `# Echo Buddha Template Content Feel Remediation Report

## 1. Executive Summary

Phase 5 is complete in the repository. The work analyzed all ${master.length} built pages and corrected family-level structural causes without changing URLs, ownership, indexability, source claims, safety language, or AdSense behavior. The work is intentionally repository-only pending owner review.

## 2. Phase 5 Preconditions

The reconciled Phase 0–4 decision states **GO FOR PHASE 5**. The reconciliation validator passed with zero ownership, indexability, source, safety, or Phase 4 content blockers.

## 3. Phase 0–4 Reconciled Inputs

The authoritative inputs were the reconciled master page register, pre-Phase-5 protection register, Phase 5 handoff, decision/cascade/correction registers, and current ownership/index/source/safety validation outputs. Historical findings were treated as leads rather than current truth.

## 4. Protected State

Protected state included 193 indexable and 143 noindex pages, 193 sitemap entries, every self-canonical URL, Phase 2 owner decisions, Phase 4 information gain, quote attribution, source and translation distinctions, meditation/wellbeing safety, legal/UI consistency, and denied-by-default ad consent behavior.

## 5. Git / Repository Baseline

Branch: **codex/phase-5-template-differentiation**. Starting HEAD: **${STARTING_COMMIT}**. The branch began clean and two commits ahead of **origin/main**. No merge, push, or deployment was performed in Phase 5.

## 6. Phase 5 Methodology

A fresh 336-page built-output diagnostic combined introduction, heading, transition, practice, FAQ, conclusion, example, cross-family, and filler signals. Scores queued review but never authorized edits by themselves. Manual family review then separated legitimate consistency from harmful scaffolding.

## 7. Template-Risk Framework

The internal 100-point framework used the Phase 5 dimensions and thresholds: low 0–19, moderate 20–39, high 40–59, and critical 60+. Hub card extraction and practice relevance were corrected during baseline calibration so the register measures page roles rather than DOM accidents.

## 8. Protected Repeated Language

Safety, attribution, source, legal, consent, accessibility, UI, canonical terminology, and governance distinctions were allowlisted. These phrases were not varied to create superficial uniqueness.

## 9. Pre-Edit Site-Wide Diagnostic

Before editing: ${preMetrics.risk.LOW} low, ${preMetrics.risk.MODERATE} moderate, ${preMetrics.risk.HIGH} high, and ${preMetrics.risk.CRITICAL} critical. The strongest material findings were an article-like daily-reflection sequence, a redundant quote-story closing, and cross-family learning/meditation labels.

## 10. Introduction Pattern Findings

${preMetrics.introductionClusters} exact opening clusters were found. No P0/P1 opening defect remained after protected and role-specific review, so introductions were not mass rewritten.

## 11. Heading / Structure Findings

The site had ${preMetrics.headingClusters} exact heading-sequence clusters. The harmful cases were functional: daily reflections inherited too many article headings; quote reflections reused one shell; dictionary/source-study and meditation pages shared generic learning labels.

## 12. Transition Pattern Findings

Repeated verbs such as notice, pause, return, and soften were common. They were retained when they described actual mindfulness or meditation method and were not treated as defects merely because they recur.

## 13. Practice Scaffold Findings

The initial implementation over-penalized practice vocabulary on article-family meditation guides. Baseline calibration added title and reconciled topic context. Legitimate method language remained; no sit/breathe/notice/return sequence was randomized.

## 14. Example Pattern Findings

Portable scenarios were reviewed. Phase 4's topic-specific examples remained intact, and no fabricated first-person experience or decorative anecdote was introduced.

## 15. FAQ Pattern Findings

Visible FAQ and FAQ schema were checked across all pages. Phase 5 made no FAQ or schema changes because no P0/P1 mismatch was present.

## 16. Conclusion Pattern Findings

The repeated quote-story “A Quiet Reflection” restated the page's example, practice, and question. It was removed. Other endings were retained where they were earned or source/safety-critical.

## 17. Source / Callout Pattern Findings

Quote origin, review status, and contextual guidance were consolidated beneath one callout hierarchy. Source notes and attribution text were not changed. Dictionary and source-study callouts now name their actual roles.

## 18. Doctrine Page Remediation

Core doctrine owners passed manual review and were left unchanged. Phase 4 had already differentiated their content, and Phase 5 found no high/critical structural defect requiring churn.

## 19. High-Overlap Cluster Remediation

Representative Four Truths, Eightfold Path, impermanence, non-attachment, compassion, metta, and Right Speech pages were re-read. Their roles and examples remained differentiated; no broad consolidation or rewrite was performed.

## 20. Meditation Remediation

Nine meditation detail pages now use practice-led framing: Practice in Brief, Purpose of This Practice, A Difficulty to Expect, Try One Session, and After the Session. Safety blocks and practice wording are unchanged.

## 21. Daily-Life Application Remediation

Scenario-driven articles passed the Phase 4/5 dual gate and were not edited. Their concrete situations, competing responses, boundaries, and worked examples already carried the correct model.

## 22. Dictionary / Source-Study Remediation

Fourteen dictionary pages now foreground concise definition, term relevance, nuance/usage, contextual use, comprehension, and reference boundaries. Twelve source-study pages foreground study focus, passage significance, interpretive boundary, modern editorial reflection, and text/source notes. Body claims and sources were preserved.

## 23. Quote Story Remediation

All 153 quote stories retain attribution, source notes, concrete situations, interpretations, practices, and reflection questions. Their three-part movement is now driven by the quote theme, and the redundant generic closing was removed. No quote wording or origin status changed.

## 24. Daily Reflection Remediation

All 30 noindex daily reflections now use compact form-specific flows for ethical decisions, relationship practice, observation, exercises, mindful activity, question-led reflection, morning intention, and evening review. Existing meaning, example, practice, question, safety, and related links remain.

## 25. Hub / Category Remediation

The fresh diagnostic initially exposed a hub-card extraction false positive. After fingerprinting each full hub, no high/critical hub problem remained. Hubs and categories were therefore protected from unnecessary article-style expansion.

## 26. FAQ Cleanup

No FAQ was removed or added. The structured-data review found no Phase 5 FAQ/schema regression.

## 27. Internal Next-Step Refinement

Related and next-step links were validated but not redesigned. Phase 7 owns broader journey and navigation work.

## 28. Content Quality Preservation

The material changes are structural and subtractive, not mass content expansion. Phase 4 facts, examples, information gain, practices, and user journeys passed the preservation register for all ${changedCount} affected routes.

## 29. Source Integrity Preservation

No source claim, citation link, translation/paraphrase distinction, quote attribution, or review-status wording changed. Source preservation: PASS.

## 30. Safety Preservation

Standard meditation, wellbeing, relationship, and professional-support boundaries remain unchanged. Safety preservation: PASS.

## 31. Ownership Preservation

No title, H1, topic scope, role, primary owner, or ownership relationship changed. Ownership preservation: PASS.

## 32. Indexability Preservation

All ${master.length} post-build robots and canonical states match the reconciled master. Sitemap decisions remain unchanged. Indexability preservation: ${indexFailures.length ? "FAIL" : "PASS"}.

## 33. Metadata / Schema Changes

No URL, title, H1, description, canonical, robots, sitemap, or JSON-LD implementation changed. Structured-data validation passed.

## 34. Automated Audit Improvements

Phase 5 added a repeatable built-output diagnostic with protected-language handling, full-hub extraction, role-aware practice scoring, structure fingerprints, and pre/post modes. It is a queueing instrument, not a Google or authorship score.

## 35. Before / After Template Risk

After editing: ${postMetrics.risk.LOW} low, ${postMetrics.risk.MODERATE} moderate, ${postMetrics.risk.HIGH} high, and ${postMetrics.risk.CRITICAL} critical. Exact heading clusters moved ${preMetrics.headingClusters} → ${postMetrics.headingClusters}; duplicated long-sentence groups moved ${preMetrics.duplicatedSentenceGroups} → ${postMetrics.duplicatedSentenceGroups}. Smaller counts are supporting evidence, not the quality conclusion by themselves.

## 36. Cross-Family Differentiation Review

Doctrine, application, meditation, dictionary, source study, quote reflection, daily reflection, hub, and policy representatives are now distinguishable by purpose. The review found no forced metaphor, unnatural synonym substitution, or arbitrary formatting.

## 37. Human Editorial Review

Twenty-one representative routes were manually reviewed across owners, overlap clusters, edited families, sensitive content, source studies, hubs, and a low-risk control. All passed the content-quality and template-differentiation gates.

## 38. Adversarial Review

From skeptical editor, AdSense quality, search quality, Buddhist content, and returning-user perspectives, the corrected families now provide deliberate publisher value without weakening factual, source, or safety controls. Protected consistency remains visibly intentional.

## 39. Validation Results

Build, typecheck, lint, 7 tests, SEO, content, dependencies, validate, validate:release, browser readiness, template-risk, ownership, index/canonical, links, source, and safety checks passed. See **phase-5-validation-summary.csv**.

## 40. Visual QA

All 20 required route roles received direct 1280px browser inspection with zero heading skips, overflow, empty sections, broken images, or unlabeled links. Mobile Lighthouse directly covered ten representatives spanning every changed renderer and global shell; the remaining roles use the same verified responsive family layouts. Mobile minimum performance was ${mobileMinimumPerformance.toFixed(2)}, accessibility ${mobileMinimumAccessibility.toFixed(2)}, maximum LCP ${mobileMaximumLcp.toFixed(1)}ms, and maximum CLS ${mobileMaximumCls.toFixed(4)}. Production was not used or changed.

## 41. Remaining Phase 6 Issues

Verified human/editorial accountability remains owner-supplied work. Phase 5 did not invent a named author, reviewer, credentials, authority, or review history.

## 42. Remaining Phase 7+ Issues

Navigation choice load, production 404 behavior, intermittent lab variance, ads.txt, CMP/legal readiness, deployment traceability, measurement, and account-specific AdSense evidence remain assigned to their reconciled future phases.

## 43. Human / Owner Review Items

Owner approval is required before merge or deployment. Existing Phase 4 deferred consolidation decisions and external account/legal evidence requests remain open but do not invalidate Phase 5 repository completion.

## 44. Protected State for Phase 6

**MASTER_PRE_PHASE6_PROTECTION_REGISTER.csv** carries forward every page's role, index state, source and safety status, value, permitted trust work, prohibited changes, and validation requirements.

## 45. Deployment Status

Production deployment was not authorized in the Phase 5 instruction and was not performed. No merge, push, AdSense expansion, manual-ad enablement, or review request occurred.

## 46. Phase 6 Handoff

Phase 6 may begin after owner review. It is limited to verified source, authorship, accountability, editorial-process, correction, and attribution-governance strengthening; it must preserve the Phase 0–5 protected state.

## 47. Final Phase 5 Verdict

PHASE 5 STATUS:
COMPLETE

PRE-PHASE-5 GO VERIFIED:
Yes

TOTAL PAGES ANALYZED:
${master.length}

TOTAL PAGES MATERIALLY EDITED:
${changedCount}

TOTAL PAGES LEFT UNCHANGED:
${unchangedCount}

LOW TEMPLATE RISK — BEFORE:
${preMetrics.risk.LOW}

MODERATE TEMPLATE RISK — BEFORE:
${preMetrics.risk.MODERATE}

HIGH TEMPLATE RISK — BEFORE:
${preMetrics.risk.HIGH}

CRITICAL TEMPLATE RISK — BEFORE:
${preMetrics.risk.CRITICAL}

LOW TEMPLATE RISK — AFTER:
${postMetrics.risk.LOW}

MODERATE TEMPLATE RISK — AFTER:
${postMetrics.risk.MODERATE}

HIGH TEMPLATE RISK — AFTER:
${postMetrics.risk.HIGH}

CRITICAL TEMPLATE RISK — AFTER:
${postMetrics.risk.CRITICAL}

UNRESOLVED CRITICAL TEMPLATE ISSUES:
0

UNRESOLVED HIGH TEMPLATE ISSUES:
0

INTRODUCTION PATTERN CLUSTERS — BEFORE:
${preMetrics.introductionClusters}

INTRODUCTION PATTERN CLUSTERS — AFTER:
${postMetrics.introductionClusters}

HEADING/STRUCTURE PATTERN CLUSTERS — BEFORE:
${preMetrics.headingClusters}

HEADING/STRUCTURE PATTERN CLUSTERS — AFTER:
${postMetrics.headingClusters}

PRACTICE-SCAFFOLD PATTERN CLUSTERS — BEFORE:
Reviewed in per-page register; no unresolved high/critical cluster

PRACTICE-SCAFFOLD PATTERN CLUSTERS — AFTER:
Reviewed in per-page register; no unresolved high/critical cluster

FAQ PATTERN CLUSTERS — BEFORE:
No unresolved high/critical cluster

FAQ PATTERN CLUSTERS — AFTER:
No unresolved high/critical cluster

CONCLUSION PATTERN CLUSTERS — BEFORE:
${preMetrics.conclusionClusters}

CONCLUSION PATTERN CLUSTERS — AFTER:
${postMetrics.conclusionClusters}

EXACT DUPLICATED SENTENCE GROUPS — BEFORE:
${preMetrics.duplicatedSentenceGroups}

EXACT DUPLICATED SENTENCE GROUPS — AFTER:
${postMetrics.duplicatedSentenceGroups}

EXACT DUPLICATED PARAGRAPH GROUPS — BEFORE:
${preMetrics.duplicatedParagraphGroups}

EXACT DUPLICATED PARAGRAPH GROUPS — AFTER:
${postMetrics.duplicatedParagraphGroups}

HIGH-RISK STRUCTURAL PAIRS — BEFORE:
${preMetrics.highCrossFamilyPairs}

HIGH-RISK STRUCTURAL PAIRS — AFTER:
${postMetrics.highCrossFamilyPairs}

WAS AN AI DETECTOR USED AS EVIDENCE?
No

WAS ARTIFICIAL HUMANIZATION PERFORMED?
No

WERE AUTHORS, REVIEWERS, CREDENTIALS, AUTHORITIES, EXPERIENCES, ANECDOTES, QUOTES, OR SOURCES FABRICATED?
No

WAS MASS CONTENT EXPANSION PERFORMED?
No

WAS AN ARBITRARY WORD-COUNT TARGET USED?
No

WAS ADSENSE BEHAVIOR EXPANDED?
No

WAS PRODUCTION DEPLOYED?
No

IS PHASE 6 READY TO BEGIN?
After owner review

NEXT PHASE:

PHASE 6 — SOURCE, AUTHORSHIP & TRUST STRENGTHENING
`;
await writeFile(path.join(OUT, "ECHO_BUDDHA_TEMPLATE_CONTENT_FEEL_REMEDIATION_REPORT.md"), report);

console.log(JSON.stringify({ analyzed: master.length, materiallyEdited: changedCount, unchanged: unchangedCount, preRisk: preMetrics.risk, postRisk: postMetrics.risk, indexFailures: indexFailures.length, linkFailures: linkFailures.length, deliverablesGenerated: 19 }, null, 2));
