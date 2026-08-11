import { execFileSync } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-6-source-authorship-trust");
const START = "6ee25e6e91a0730195b8850ea1a5d88ab42bbb3a";
const parseCsv = (text) => {
  const records = []; let row = []; let field = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; } else if (c === '"') quoted = false; else field += c; }
    else if (c === '"') quoted = true; else if (c === ",") { row.push(field); field = ""; } else if (c === "\n") { row.push(field); records.push(row); row = []; field = ""; } else if (c !== "\r") field += c;
  }
  const headers = records.shift() ?? [];
  return records.filter((item) => item.some(Boolean)).map((item) => Object.fromEntries(headers.map((header, i) => [header, item[i] ?? ""])));
};
const csv = async (name) => parseCsv(await readFile(path.join(OUT, name), "utf8"));
const checks = [];
const check = (name, pass, evidence) => checks.push({ name, status: pass ? "PASS" : "FAIL", evidence });

const required = [
  "phase-6-trust-fact-register.csv", "phase-6-trust-risk-register.csv", "phase-6-publisher-identity-review.csv", "phase-6-authorship-review.csv", "phase-6-credential-verification-register.csv", "phase-6-page-family-authorship-policy.csv", "phase-6-trust-page-review.csv", "phase-6-trust-page-consistency-matrix.csv", "phase-6-content-process-review.csv", "phase-6-ai-transparency-review.csv", "phase-6-source-register-review.csv", "phase-6-source-domain-review.csv", "phase-6-source-to-page-register.csv", "phase-6-source-claim-matrix.csv", "phase-6-source-link-validation.csv", "phase-6-quote-attribution-review.csv", "phase-6-dhammapada-attribution-review.csv", "phase-6-sutta-attribution-review.csv", "phase-6-translation-copyright-review.csv", "phase-6-terminology-review.csv", "phase-6-tradition-specific-review.csv", "phase-6-editorial-interpretation-review.csv", "phase-6-corrections-review.csv", "phase-6-contact-feedback-review.csv", "phase-6-meditation-safety-trust-review.csv", "phase-6-wellbeing-authority-review.csv", "phase-6-relationship-boundary-trust-review.csv", "phase-6-structured-data-trust-review.csv", "phase-6-page-change-register.csv", "phase-6-content-quality-preservation.csv", "phase-6-template-quality-preservation.csv", "phase-6-ownership-preservation.csv", "phase-6-indexability-preservation.csv", "phase-6-safety-preservation.csv", "phase-6-human-review-items.csv", "phase-6-phase7-handoff.csv", "phase-6-future-phase-handoff.csv", "phase-6-validation-summary.csv", "phase-6-rollback-map.csv", "MASTER_PRE_PHASE7_PROTECTION_REGISTER.csv", "PHASE_6_PRE_EDIT_SOURCE_AUTHORSHIP_TRUST_DIAGNOSTIC.md", "ECHO_BUDDHA_SOURCE_AUTHORSHIP_TRUST_STRENGTHENING_REPORT.md"
];
const files = new Set(await readdir(OUT));
const missing = required.filter((file) => !files.has(file));
check("required-artifacts", missing.length === 0, missing.length ? missing.join(" | ") : `${required.length}/${required.length} present`);

const source = await readFile(path.join(ROOT, "src/data/editorialGovernance.ts"), "utf8");
const learn = await readFile(path.join(ROOT, "src/data/learn.ts"), "utf8");
const publicFiles = ["src/pages/about.astro", "src/pages/authors/echo-buddha-editorial.astro", "src/pages/editorial-policy.astro", "src/pages/how-echo-buddha-creates-content.astro", "src/pages/buddhist-sources-and-citations.astro", "src/pages/quote-attribution-policy.astro", "src/pages/corrections.astro", "src/pages/contact.astro", "src/pages/search-index.json.ts"];
const publicText = (await Promise.all(publicFiles.map((file) => readFile(path.join(ROOT, file), "utf8")))).join("\n");
const siteData = await readFile(path.join(ROOT, "src/data/site.ts"), "utf8");
check("authorship-model", /organizational publication byline/i.test(publicText) && !/editorial team|shared editorial voice/i.test(publicText), "Organizational label explicit; team implication absent");
check("publisher-accountability", /Echo Buddha remains responsible|Echo Buddha is responsible|publisher responsible/i.test(publicText) && /info\.echobuddha@gmail\.com/.test(siteData) && /SITE\.email|contactEmail/.test(publicText), "Brand accountability and real contact present");
check("credential-protection", /namedPersonPublished: false/.test(source) && /verifiedCredentials: \[\]/.test(source) && /externalReviewers: \[\]/.test(source), "No named person, credential, or reviewer data");
check("source-correction-article", /\/articles\/what-is-karma-in-buddhism\/[\s\S]{0,400}an6\.63\/en\/sujato/.test(source), "Article mapping uses AN 6.63");
check("source-correction-dictionary", /buddhist-dictionary\/karma[\s\S]{0,400}an6\.63\/en\/sujato/.test(learn), "Dictionary mapping uses AN 6.63");
check("ai-transparency", /research, (?:prepare )?outlines|organize research, outline/i.test(publicText) && /draft support|support drafting/i.test(publicText) && /remains accountable|remains responsible/i.test(publicText), "Actual assistance and accountability described");
check("attribution-policy", /Five Attribution Classes/.test(publicText) && /Unverified or unpublishable attribution/.test(publicText), "Five-class system published");
check("correction-workflow", /How a Report Is Handled/.test(publicText) && /public correction note/.test(publicText), "Concrete intake/materiality/public-note workflow");

const trust = await csv("phase-6-trust-page-review.csv");
const sourceLinks = await csv("phase-6-source-link-validation.csv");
const sourceClaims = await csv("phase-6-source-claim-matrix.csv");
const quotes = await csv("phase-6-quote-attribution-review.csv");
const dhammapada = await csv("phase-6-dhammapada-attribution-review.csv");
const suttas = await csv("phase-6-sutta-attribution-review.csv");
const translations = await csv("phase-6-translation-copyright-review.csv");
const schema = await csv("phase-6-structured-data-trust-review.csv");
const ownership = await csv("phase-6-ownership-preservation.csv");
const indexability = await csv("phase-6-indexability-preservation.csv");
const template = await csv("phase-6-template-quality-preservation.csv");
const safety = await csv("phase-6-safety-preservation.csv");
const protection = await csv("MASTER_PRE_PHASE7_PROTECTION_REGISTER.csv");
check("trust-pages", trust.length === 12 && trust.every((row) => row["Final status"] === "PASS"), `${trust.length}/12 pass`);
check("source-link-validation", sourceLinks.length >= 50 && sourceLinks.every((row) => row.Reachability !== "FAIL"), `${sourceLinks.length} URLs; ${sourceLinks.filter((row) => row.Reachability === "FAIL").length} broken`);
check("source-claim-traceability", sourceClaims.length >= 100 && sourceClaims.every((row) => row["Claim supported?"] === "Yes at the identified claim-group level"), `${sourceClaims.length} relationships`);
check("quote-attribution", quotes.length >= 150 && quotes.every((row) => row.Validation === "PASS" && row["Buddha attribution?"] === "No"), `${quotes.length} original quote stories`);
check("dhammapada-attribution", dhammapada.length === 5 && dhammapada.every((row) => row.Validation === "PASS"), `${dhammapada.length}/5 pass`);
check("sutta-attribution", suttas.length === 7 && suttas.every((row) => row.Validation === "PASS"), `${suttas.length}/7 pass`);
check("translation-boundary", translations.length === 12 && translations.every((row) => row.Validation === "PASS"), `${translations.length}/12 pass`);
check("structured-data-trust", schema.length === 336 && schema.every((row) => row.Validation === "PASS" && row["Person entity"] === "None" && row["Credential fields"] === "None" && row["Reviewer fields"] === "None"), `${schema.length}/336; no Person/credential/reviewer fields`);
check("ownership-preservation", ownership.every((row) => row.Validation === "PASS" && row["Role changed?"] === "No"), `${ownership.length} change groups`);
check("index-canonical-preservation", indexability.length === 336 && indexability.every((row) => row.Validation === "PASS" && row["Unexpected change?"] === "No"), `${indexability.length}/336`);
check("template-preservation", template.every((row) => row.Validation === "PASS" && row["Repeated trust boilerplate added?"] === "No"), `${template.length} change groups`);
check("safety-preservation", safety.length > 0 && safety.every((row) => row.Validation === "PASS" && row["Phase 6 weakened safety?"] === "No"), `${safety.length} sensitive routes`);
check("pre-phase7-protection", protection.length === 336, `${protection.length}/336`);

const distFiles = [];
const walk = async (dir) => { for (const entry of await readdir(dir, { withFileTypes: true })) entry.isDirectory() ? await walk(path.join(dir, entry.name)) : entry.name.endsWith(".html") && distFiles.push(path.join(dir, entry.name)); };
await walk(path.join(ROOT, "dist"));
const built = (await Promise.all(distFiles.map((file) => readFile(file, "utf8")))).join("\n");
check("no-fake-person-schema", !/"@type":"Person"/.test(built), "No Person JSON-LD in built site");
check("no-fake-review-schema", !/"reviewedBy"|"reviewer"|"credential"|"sameAs"/.test(built), "No reviewer, credential, or sameAs construction");
check("visible-schema-organization", /#editorial-author/.test(built) && /#organization/.test(built), "Stable author and publisher IDs present");

const report = await readFile(path.join(OUT, "ECHO_BUDDHA_SOURCE_AUTHORSHIP_TRUST_STRENGTHENING_REPORT.md"), "utf8");
const numbered = [...report.matchAll(/^## (\d+)\./gm)].map((match) => Number(match[1]));
check("report-59-sections", numbered.length === 59 && numbered.every((value, i) => value === i + 1), `${numbered.length} ordered sections`);
check("report-verdict", /PHASE 6 STATUS:\nCOMPLETE/.test(report) && /WAS PRODUCTION DEPLOYED\?\nNo/.test(report) && /IS PHASE 7 READY TO BEGIN\?\nAfter owner review/.test(report), "Complete; repository-only; Phase 7 after owner review");

const changedFiles = execFileSync("git", ["diff", "--name-only", START], { cwd: ROOT, encoding: "utf8" }).trim().split("\n").filter(Boolean);
const allowedSource = /^(?:src\/(?:components\/SEO\.astro|data\/(?:editorialGovernance|learn)\.ts|pages\/(?:about|editorial-policy|how-echo-buddha-creates-content|buddhist-sources-and-citations|quote-attribution-policy|corrections|contact|meditation-safety|disclaimer|privacy-policy|terms-of-use)\.astro|pages\/search-index\.json\.ts|pages\/authors\/echo-buddha-editorial\.astro|pages\/articles\/(?:index|\[slug\])\.astro|pages\/learn\/(?:four-noble-truths|eightfold-path)\.astro|pages\/(?:learn\/\[section\]\/\[slug\]|meditation\/\[slug\]|quotes\/\[category\]\/\[story\]|daily-reflections\/(?:\[slug\]|today))\.astro)|docs\/audits\/(?:adsense-rejection-2026-08\/phase-6-source-authorship-trust\/|content-audit\/(?:content-decision-matrix\.csv|content-family-summary\.json|content-inventory\.csv|post-remediation-summary\.json|source-register\.csv)|echo-buddha-governance-implementation\/(?:final-validation-summary\.json|thin-page-review\.json|url-inventory\.json)))/;
const unexpected = changedFiles.filter((file) => !allowedSource.test(file));
check("change-scope", unexpected.length === 0, unexpected.length ? unexpected.join(" | ") : `${changedFiles.length} changed files in Phase 6 scope`);
const adFiles = changedFiles.filter((file) => /AdSlot|Consent|ads\.txt|adsense|package(?:-lock)?\.json|astro\.config|layouts\/Layout/i.test(file));
check("adsense-unchanged", adFiles.length === 0, adFiles.length ? adFiles.join(" | ") : "No advertising, consent, dependency, or build-config mutation");

const failures = checks.filter((item) => item.status === "FAIL");
const result = { generatedAt: new Date().toISOString(), startingCommit: START, totalChecks: checks.length, passed: checks.length - failures.length, failed: failures.length, status: failures.length ? "FAIL" : "PASS", checks };
await writeFile(path.join(OUT, "phase-6-custom-validation.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
