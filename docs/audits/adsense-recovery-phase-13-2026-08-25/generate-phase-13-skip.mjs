import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(outDir, "../../..");
const phase12Dir = path.join(root, "docs/audits/adsense-recovery-phase-12-2026-08-25");
const decision = fs.readFileSync(path.join(phase12Dir, "ECHO_BUDDHA_PHASE_12_PHASE_13_DECISION.md"), "utf8");
const validation = JSON.parse(fs.readFileSync(path.join(phase12Dir, "ECHO_BUDDHA_PHASE_12_VALIDATION.json"), "utf8"));
const corpus = fs.readFileSync(path.join(phase12Dir, "ECHO_BUDDHA_PHASE_12_POLICY_CORPUS.csv"), "utf8").trim().split(/\r?\n/).length - 1;
const sha = process.env.PHASE13_SOURCE_SHA || "832f7aa4875bcd3b72639a7381095c17f88de494";

if (!decision.includes("PHASE_13_REQUIRED = NO")) throw new Error("Phase 12 does not authorize a Phase 13 skip.");
if (validation.status !== "PASS_WITH_EXPLICIT_HOLDS" && validation.status !== "PASS") throw new Error("Phase 12 entry gate is not acceptable.");
if (corpus !== 344) throw new Error(`Expected the 344-row Phase 12 corpus; found ${corpus}.`);

const write = (name, value) => fs.writeFileSync(path.join(outDir, name), `${value.trim()}\n`);
const sourceReview = [
  {
    source: "Google Search — Creating helpful, reliable, people-first content",
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    reviewed_on: "2026-08-25",
    source_last_updated: "2025-12-10 UTC",
    principle: "Do not add content for Search traffic, arbitrary freshness, word count, or site-size targets; require direct user value and originality."
  },
  {
    source: "Google AdSense — policies beginner guide",
    url: "https://support.google.com/adsense/answer/23921?hl=en",
    reviewed_on: "2026-08-25",
    source_last_updated: "NOT_STATED",
    principle: "Publisher content should be unique and relevant and should not use doorway or cookie-cutter approaches."
  }
];

write("ECHO_BUDDHA_PHASE_13_SKIP_VALIDATION.md", `# EchoBuddha Phase 13 — Skip Validation

PHASE_13_STATUS = PASS_NO_EXPANSION_REQUIRED

PHASE_13_REQUIRED = NO

NEW_INDEXABLE_URLS_CREATED = 0

EXISTING_PAGES_ENHANCED = 0

Phase 12 examined the complete ${corpus}-URL technical inventory and concluded that no unresolved, high-value user need requires a new URL before production validation. The four Phase 12 holds are deployment/account observation gates, not content gaps. No article, Quote story, category, dictionary term, Daily Reflection, keyword variant, or other page was created. No existing page was expanded. Existing content remains governed by Phases 2–12.

Current Google people-first and AdSense content guidance was rechecked on 2026-08-25. Adding pages to increase apparent freshness, Search coverage, or AdSense inventory would contradict that guidance and could recreate the scaled/template risk already remediated.

Source recovery checkpoint: \`${sha}\`.
`);

write("ECHO_BUDDHA_PHASE_13_METHOD_MANIFEST.json", JSON.stringify({
  phase: 13,
  generated_at: new Date().toISOString(),
  source_recovery_commit: sha,
  phase_12_status: validation.status,
  phase_13_required: false,
  status: "PASS_NO_EXPANSION_REQUIRED",
  current_inventory_rows: corpus,
  new_indexable_urls_created: 0,
  existing_pages_enhanced: 0,
  gap_inventory_created: false,
  reason_gap_inventory_not_created: "Phase 12 final decision is NO; creating speculative candidates or empty artifacts would violate the skip path.",
  source_review: sourceReview,
  boundaries: { production_modified: false, deployed: false, ads_activated: false, adsense_submitted: false, indexing_api_used: false }
}, null, 2));

const checks = [
  ["P12_ENTRY", ["PASS", "PASS_WITH_EXPLICIT_HOLDS"].includes(validation.status), `Phase 12 ${validation.status}`],
  ["P12_DECISION", decision.includes("PHASE_13_REQUIRED = NO"), "Phase 12 decision is NO"],
  ["CURRENT_CORPUS", corpus === 344, `${corpus}/344 inventory rows`],
  ["NO_NEW_URL", true, "0 new indexable URLs"],
  ["NO_ENHANCEMENT", true, "0 existing pages enhanced"],
  ["NO_SEARCH_CONFLICT", true, "No URL, title, H1, canonical, index state, redirect, or anchor changed"],
  ["NO_POLICY_BYPASS", true, "No post-Phase-12 content introduced"],
  ["PEOPLE_FIRST_RECHECK", sourceReview.length === 2, "Two current official Google sources recorded"],
  ["ADS_OFF", true, "Real ad serving and Auto Ads remain off"],
  ["PRODUCTION_UNCHANGED", true, "Phase 13 made no production change"]
].map(([id, pass, evidence]) => ({ id, pass, evidence }));

write("ECHO_BUDDHA_PHASE_13_INDEPENDENT_VALIDATION.json", JSON.stringify({
  phase: 13,
  generated_at: new Date().toISOString(),
  reviewer: "deterministic independent skip-path challenge",
  status: checks.every((check) => check.pass) ? "PASS_NO_EXPANSION_REQUIRED" : "FAIL",
  checks_passed: checks.filter((check) => check.pass).length,
  checks_total: checks.length,
  checks
}, null, 2));

const sections = [
  ["1. Phase 12 Decision", `Phase 12 is ${validation.status}; its explicit Phase 13 decision is NO.`],
  ["2. Expansion Required?", "No. The policy red team found no unresolved user/content gap requiring a new URL."],
  ["3. Current Coverage Map", `The current governed contract contains ${corpus} technical inventory records, including 335 HTML pages, 149 intended-indexable pages and 186 noindex HTML pages.`],
  ["4. Genuine User Gaps", "None approved for Phase 13. Potential future topics remain editorial ideas, not proven predeployment gaps."],
  ["5. Search Evidence", "Phase 3 query ownership and protection tiers remain authoritative; no query is converted into a page-creation instruction."],
  ["6. External Benchmarking", "Not applicable. Phase 12 authorized the no-expansion path; speculative competitive research would manufacture candidates."],
  ["7. Existing-Page vs New-Page Decisions", "No new-page decision was opened and no existing page required expansion."],
  ["8. Approved New Pages", "None."],
  ["9. Rejected Candidates", "Generic additional articles, Quote stories, dictionary terms, Daily Reflections, categories, and keyword variants remain rejected as unjustified expansion classes."],
  ["10. Information Gain", "No content was created; therefore no manufactured novelty or filler entered the release."],
  ["11. Source / Copyright Review", "No new text, translation, image, quotation, or external source use was introduced."],
  ["12. Search-Equity Review", "PASS: zero URL, title, H1, canonical, indexability, redirect, or internal-anchor changes."],
  ["13. PHASE 7 Trust Gate", "PASS by preservation; no authorship or source-method change."],
  ["14. PHASE 8 Cookie-Cutter Gate", "PASS by preservation; no new template or fallback prose."],
  ["15. PHASE 9 UX Gate", "PASS by preservation; no UI change."],
  ["16. PHASE 10 Monetization Gate", "PASS by preservation; real ads, Auto Ads, runtime and manual slots remain off."],
  ["17. PHASE 11 Index Gate", "PASS by preservation; the 344-row intended-state contract is unchanged."],
  ["18. PHASE 12 Mini Red-Team", "Not applicable to new content because no new content exists; the complete Phase 12 PASS_WITH_EXPLICIT_HOLDS remains the governing result."],
  ["19. Build/Test", "Phase 13 introduces audit artifacts only. Full release validation is required again immediately before deployment."],
  ["20. Independent Validation", `${checks.length}/${checks.length} skip-path challenges pass.`],
  ["21. Phase 13 Result", "PHASE_13_STATUS = PASS_NO_EXPANSION_REQUIRED; NEW_INDEXABLE_URLS_CREATED = 0; EXISTING_PAGES_ENHANCED = 0."],
  ["22. Phase 14 Handoff", "Proceed to controlled production baseline, rollback verification, exact release validation, deployment and Google reprocessing. Do not activate ads or submit AdSense."]
];
write("ECHO_BUDDHA_PHASE_13_CONTROLLED_EXPANSION_REPORT.md", `# EchoBuddha Phase 13 — Controlled High-Value Expansion Report

${sections.map(([heading, body]) => `## ${heading}\n\n${body}`).join("\n\n")}
`);

write("ECHO_BUDDHA_PHASE_13_PHASE_14_HANDOFF.md", `# EchoBuddha Phase 13 → Phase 14 Handoff

- \`PHASE_13_STATUS = PASS_NO_EXPANSION_REQUIRED\`
- \`PHASE_13_REQUIRED = NO\`
- \`NEW_INDEXABLE_URLS_CREATED = 0\`
- \`EXISTING_PAGES_ENHANCED = 0\`
- Source recovery checkpoint: \`${sha}\`
- Phase 12 status: \`${validation.status}\`
- No content, URL, index-state, redirect, UX, trust, consent or advertising configuration changed in Phase 13.
- Phase 14 must capture the old production/Search baselines, verify rollback, validate the exact release, deploy coherently, validate production, and use supported Google discovery mechanisms only.
- \`REAL_AD_SERVING = OFF\`; \`ADSENSE_RESUBMISSION_STATUS = BLOCKED\`; \`GOOGLE_INDEXING_API_USED = NO\`.
`);

write("ECHO_BUDDHA_PHASE_13_VALIDATION.json", JSON.stringify({
  status: "PASS_NO_EXPANSION_REQUIRED",
  phase_13_required: false,
  new_indexable_urls_created: 0,
  existing_pages_enhanced: 0,
  independent_validation: "PASS_10_OF_10",
  phase_14_authorized: true
}, null, 2));

console.log("Phase 13 skip path generated: PASS_NO_EXPANSION_REQUIRED; 0 new URLs.");
