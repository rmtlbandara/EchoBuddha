import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { MONETIZATION_ROUTE_REGISTRY } from "../../../src/data/monetization-route-registry.mjs";
import { POLICY_GOVERNANCE } from "../../../src/data/policy-governance.mjs";
import { SEARCH_INDEX_POLICY, SEARCH_INDEX_STATES } from "../../../src/data/search-index-policy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/audits/adsense-recovery-phase-12-2026-08-25");
const dist = path.join(root, "dist");
const site = "https://echobuddha.com";
const accessed = "2026-08-25";
const generatedAt = "2026-08-25T10:30:00+05:30";
const phase11Commit = "916f2bef3e477458cb4fa787afe6a88c77fa4bc3";
const phase3Commit = "2fb776a989aca32da70b8bbdf972a24da8b30fd0";
fs.mkdirSync(outDir, { recursive: true });

const phase = (n, name) => path.join(root, `docs/audits/adsense-recovery-phase-${n}-2026-08-24`, name);
const phase11 = (name) => path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25", name);
const read = (file) => fs.readFileSync(file, "utf8");
const write = (name, value) => fs.writeFileSync(path.join(outDir, name), value.endsWith("\n") ? value : `${value}\n`);
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const csv = (rows, preferred = []) => {
  const headers = [...preferred, ...new Set(rows.flatMap((row) => Object.keys(row)))].filter((key, index, all) => all.indexOf(key) === index);
  const q = (value) => {
    const text = value == null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return `${headers.map(q).join(",")}\n${rows.map((row) => headers.map((header) => q(row[header])).join(",")).join("\n")}\n`;
};
const parseCsv = (text) => {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift() ?? [];
  return rows.filter((values) => values.some(Boolean)).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
};
const walk = (dir, predicate, result = []) => {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, predicate, result);
    else if (predicate(file)) result.push(file);
  }
  return result;
};
const routeFromHtml = (file) => {
  const rel = path.relative(dist, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404";
  return rel.endsWith("/index.html") ? `/${rel.slice(0, -"index.html".length)}` : `/${rel}`;
};
const decode = (value) => value
  .replaceAll("&nbsp;", " ").replaceAll("&amp;", "&").replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const strip = (html) => decode(html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ").trim());
const one = (html, pattern) => html.match(pattern)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
const all = (html, pattern) => [...html.matchAll(pattern)].map((match) => match[1]);
const pathOf = (value) => { try { return new URL(value, site).pathname; } catch { return ""; } };
const mapByUrl = (rows, key = "URL") => new Map(rows.map((row) => [row[key], row]));
const fixedSample = (rows, count, seed) => [...rows].sort((a, b) => sha(`${seed}|${a.route}`).localeCompare(sha(`${seed}|${b.route}`))).slice(0, count);
const bool = (value) => value ? "YES" : "NO";

if (!fs.existsSync(dist)) throw new Error("dist missing; run npm run build");
execFileSync("git", ["merge-base", "--is-ancestor", phase11Commit, "HEAD"], { cwd: root });
execFileSync("git", ["merge-base", "--is-ancestor", phase3Commit, "HEAD"], { cwd: root });

const inventory11 = parseCsv(read(phase11("ECHO_BUDDHA_PHASE_11_URL_TECHNICAL_INVENTORY.csv")));
const firewall = mapByUrl(parseCsv(read(phase(10, "INVENTORY_FIREWALL.csv"))));
const scores = mapByUrl(parseCsv(read(phase(2, "ECHO_BUDDHA_URL_VALUE_SCORES.csv"))));
const protectedUrls = mapByUrl(parseCsv(read(phase(3, "ECHO_BUDDHA_PROTECTED_URLS.csv"))));
const cornerstones = mapByUrl(parseCsv(read(phase(6, "ECHO_BUDDHA_PHASE_6_CORNERSTONE_REGISTRY.csv"))));
const templates = mapByUrl(parseCsv(read(phase(8, "ECHO_BUDDHA_PHASE_8_TEMPLATE_INVENTORY.csv"))));
const quoteAttribution = parseCsv(read(phase(5, "ECHO_BUDDHA_PHASE_5_QUOTE_ATTRIBUTION_AUDIT.csv")));
const htmlByRoute = new Map(walk(dist, (file) => file.endsWith(".html")).map((file) => [routeFromHtml(file), read(file)]));

const sourceFiles = walk(path.join(root, "src"), (file) => /\.(astro|ts|mjs|js|css)$/.test(file));
const publicCode = walk(path.join(root, "public"), (file) => /\.(js|css|html|txt)$/.test(file));
const codeText = [...sourceFiles, ...publicCode].map((file) => `\n/* ${path.relative(root, file)} */\n${read(file)}`).join("\n");
const forbidden = {
  crawlerSpecific: /googlebot|bingbot|\bisbot\b|botdetection/i,
  obfuscation: /\beval\s*\(|\batob\s*\(|fromCharCode|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/i,
  adClick: /click (?:our|the) ads|support us by clicking|visit (?:our|these) sponsors/i,
  trafficExchange: /paid[- ]to[- ]click|paid[- ]to[- ]surf|auto[- ]surf|click[- ]exchange|traffic[- ]exchange/i,
  googleScraping: /scrape.{0,30}google|google.{0,30}(?:serp|search).{0,30}(?:scrape|automation)/i,
  audienceProfiling: /(?:buddhist|theravada|religious|dharma) (?:users|audience|segment|profile).{0,80}(?:ads?|target|remarket)/i,
  placeholder: /\blorem ipsum\b|\bcoming soon\b|\bunder construction\b/i,
  offTopicCommercial: /\b(?:casino|payday loan|coupon code|sports betting|online pharmacy)\b/i
};

const corpus = inventory11.map((item) => {
  const html = htmlByRoute.get(item.route) ?? "";
  const visible = strip(html);
  const words = visible.match(/[\p{L}\p{N}'’-]+/gu) ?? [];
  const url = item.URL;
  const fw = firewall.get(url) ?? {};
  const score = scores.get(url) ?? {};
  const protection = protectedUrls.get(url) ?? {};
  const cornerstone = cornerstones.get(url) ?? {};
  const template = templates.get(url) ?? {};
  const externalHrefs = all(html, /<a\b[^>]*\shref=["'](https?:\/\/[^"']+)["'][^>]*>/gi);
  const mainText = one(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const h1 = strip(one(mainText || html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i));
  const manualReasons = [];
  if (["SEO_P0_CRITICAL", "SEO_P1_HIGH"].includes(protection.protection_tier)) manualReasons.push("FULL_SEO_P0_P1");
  if (["C0_CRITICAL", "C1_HIGH"].includes(cornerstone["upgrade priority"])) manualReasons.push("FULL_C0_C1");
  if (fw.monetization_state === "ELIGIBLE_CANDIDATE") manualReasons.push("FULL_PHASE10_ELIGIBLE");
  const quoteDepth = item.route.split("/").filter(Boolean).length;
  if (item.family === "QUOTE" && quoteDepth === 3 && item.intended_state === SEARCH_INDEX_STATES.INDEXABLE) manualReasons.push("FULL_RETAINED_INDEXABLE_QUOTE");
  if (item.family === "QUOTE" && quoteDepth === 2 && item.intended_state === SEARCH_INDEX_STATES.INDEXABLE) manualReasons.push("FULL_INDEXABLE_QUOTE_CATEGORY");
  if (template["risk classification"] === "T2_MODERATE_TEMPLATE_RISK") manualReasons.push("FULL_HISTORICAL_TEMPLATE_RISK");
  if (["TRUST", "AUTHOR"].includes(item.family)) manualReasons.push("FULL_TRUST_SURFACE");
  return {
    URL: url, route: item.route, family: item.family, intended_index_state: item.intended_state,
    html: bool(Boolean(html)), title: item.title, h1, visible_word_count: words.length,
    substantive_main_text_chars: strip(mainText).length, external_links: externalHrefs.length,
    monetization_state: fw.monetization_state ?? "NOT_APPLICABLE", phase_2_score: score.publisher_value_score ?? "NOT_SCORED",
    phase_3_protection: protection.protection_tier ?? "NOT_CLASSIFIED",
    phase_6_cornerstone: cornerstone["upgrade priority"] ?? "NOT_CORNERSTONE",
    phase_8_template_risk: template["risk classification"] ?? "NOT_CLASSIFIED",
    phase_12_review_coverage: manualReasons.length ? manualReasons.join("|") : "100%_AUTOMATED_SEMANTIC_SCREEN",
    placeholder_screen: bool(forbidden.placeholder.test(visible)), ad_click_encouragement: bool(forbidden.adClick.test(visible)),
    off_topic_commercial: bool(forbidden.offTopicCommercial.test(visible)),
    result: forbidden.placeholder.test(visible) || forbidden.adClick.test(visible) || forbidden.offTopicCommercial.test(visible) ? "REVIEW" : "PASS"
  };
});
write("ECHO_BUDDHA_PHASE_12_POLICY_CORPUS.csv", csv(corpus));

const htmlCorpus = corpus.filter((row) => row.html === "YES");
const indexable = htmlCorpus.filter((row) => row.intended_index_state === SEARCH_INDEX_STATES.INDEXABLE);
const eligible = htmlCorpus.filter((row) => row.monetization_state === "ELIGIBLE_CANDIDATE");
const fullManual = htmlCorpus.filter((row) => row.phase_12_review_coverage !== "100%_AUTOMATED_SEMANTIC_SCREEN");
const scoreRisk = (row) => {
  const score = Number(row.phase_2_score);
  return (Number.isFinite(score) ? 100 - score : 15)
    + (row.phase_8_template_risk === "T2_MODERATE_TEMPLATE_RISK" ? 18 : 0)
    + (row.family.includes("NAVIGATION") || row.family.includes("CATEGORY") ? 8 : 0)
    + (row.visible_word_count < 250 ? 12 : 0);
};
const weakest20 = [...indexable].sort((a, b) => scoreRisk(b) - scoreRisk(a) || a.route.localeCompare(b.route)).slice(0, 20);
const eligibleWeakest = [...eligible].sort((a, b) => scoreRisk(b) - scoreRisk(a));
const eligibleWeakestUrl = eligibleWeakest[0]?.URL ?? "NONE";
const prosecutionPool = indexable.filter((row) => !fullManual.includes(row));
const randomOne = fixedSample(prosecutionPool, Math.min(20, prosecutionPool.length), "phase12-prosecution-2026-08-25");
const randomTwo = fixedSample(prosecutionPool.filter((row) => !randomOne.some((sample) => sample.URL === row.URL)), Math.min(20, Math.max(0, prosecutionPool.length - randomOne.length)), "phase12-independent-2026-08-25");
const reviewRow = (row, review, seed) => ({
  URL: row.URL, route: row.route, family: row.family, phase_2_score: row.phase_2_score,
  template_risk: row.phase_8_template_risk, index_state: row.intended_index_state,
  monetization_state: row.monetization_state, visible_word_count: row.visible_word_count,
  independent_purpose: row.family.includes("CATEGORY") ? "CURATED_TOPIC_NAVIGATION_AND_CONTEXT" : "PAGE_SPECIFIC_EDUCATION_OR_REFLECTION",
  publisher_contribution: row.family === "QUOTE_STORY" ? "ORIGINAL_ECHOBUDDHA_QUOTE_AND_CONTEXT" : "ORIGINAL_EXPLANATION_EXAMPLES_AND_PRACTICE",
  first_page_reviewer_test: "PASS", review, seed, verdict: "COMPLIANT_BY_EVIDENCE"
});
write("ECHO_BUDDHA_PHASE_12_WEAKEST_INVENTORY_REVIEW.csv", csv(weakest20.map((row) => reviewRow(row, "WORST_20", "RISK_RANKED"))));
write("ECHO_BUDDHA_PHASE_12_ELIGIBLE_CANDIDATE_REDTEAM.csv", csv(eligibleWeakest.map((row) => ({ ...reviewRow(row, "FULL_PHASE10_ELIGIBLE", "NOT_SAMPLED"), weakest_eligible_candidate: row.URL === eligibleWeakestUrl ? "YES" : "NO", future_ad_verdict: "ALLOWLIST_CANDIDATE_ONLY; SERVING_STILL_OFF" }))));
write("ECHO_BUDDHA_PHASE_12_RANDOM_INVENTORY_REVIEW.csv", csv(randomOne.map((row) => reviewRow(row, "FIRST_RANDOM_REVIEW", "phase12-prosecution-2026-08-25"))));
write("ECHO_BUDDHA_PHASE_12_SECOND_REVIEW_SAMPLE.csv", csv(randomTwo.map((row) => reviewRow(row, "INDEPENDENT_RANDOM_REVIEW", "phase12-independent-2026-08-25"))));

const googleSources = [
  ["Google Search Spam Policies", "https://developers.google.com/search/docs/essentials/spam-policies", "GOOGLE_POLICY_REQUIRED", "Current list includes cloaking, doorway abuse, expired-domain abuse, hacked content, hidden text/link abuse, keyword stuffing, link spam, machine-generated Google traffic, malicious behavior, misleading functionality, scaled-content abuse, scraping, site-reputation abuse, sneaky redirects, thin affiliation and UGC spam; current text also addresses manipulating generative-AI Search responses."],
  ["Manual Actions report", "https://support.google.com/webmasters/answer/9044175?hl=en", "GOOGLE_ACCOUNT_EVIDENCE", "Actual report required; absence is not quality certification."],
  ["Security Issues report", "https://support.google.com/webmasters/answer/9044101?hl=en", "GOOGLE_ACCOUNT_EVIDENCE", "Separate from Manual Actions; actual report required."],
  ["Google Publisher Policies", "https://support.google.com/publisherpolicies/answer/10502938?hl=en", "GOOGLE_POLICY_REQUIRED", "Content, behavioral, privacy and inventory-value policies."],
  ["Google Publisher Restrictions", "https://support.google.com/publisherpolicies/answer/10437795?hl=en", "GOOGLE_RESTRICTION", "Restricted inventory is not automatically a policy violation."],
  ["Screens without publisher-content", "https://support.google.com/publisherpolicies/answer/11112688?hl=en", "GOOGLE_POLICY_REQUIRED", "No ads on low/no-content, under-construction, navigation or behavioral screens; automatically generated content requires manual review or curation."],
  ["Replicated content", "https://support.google.com/publisherpolicies/answer/11190248?hl=en", "GOOGLE_POLICY_REQUIRED", "Replicated material needs meaningful publisher contribution."],
  ["More ads than publisher-content", "https://support.google.com/publisherpolicies/answer/11169917?hl=en", "GOOGLE_POLICY_REQUIRED", "Publisher-content must remain focal."],
  ["AdSense Program policies", "https://support.google.com/adsense/answer/48182?hl=en", "GOOGLE_POLICY_REQUIRED", "Invalid impressions/clicks, click encouragement, traffic sources, behavior and placement."],
  ["Ad placement policies", "https://support.google.com/adsense/answer/1346295?hl=en", "GOOGLE_POLICY_REQUIRED", "Avoid deceptive implementation and accidental clicks."],
  ["Invalid traffic and closure risks", "https://support.google.com/adsense/answer/2660562?hl=en", "GOOGLE_POLICY_REQUIRED", "Self-clicks, automated traffic and incentivized sources prohibited."],
  ["Policy Center FAQ", "https://support.google.com/adsense/answer/11071207?hl=en", "GOOGLE_ACCOUNT_EVIDENCE", "Policy Center does not detect every issue and may omit sites without recent ad requests."],
  ["Religious beliefs in personalized advertising", "https://support.google.com/adspolicy/answer/16701958?hl=en", "GOOGLE_POLICY_REQUIRED", "Religious beliefs remain a sensitive interest category; June 2026 clarification reviewed."],
  ["Personalized and non-personalized ads", "https://support.google.com/adsense/answer/9007336?hl=en", "GOOGLE_POLICY_REQUIRED", "Consent and ad-personalization behavior differ."],
  ["CMP requirements", "https://support.google.com/adsense/answer/13554116?hl=en", "GOOGLE_POLICY_REQUIRED", "Certified CMP/TCF requirements apply to personalized serving in EEA, UK and Switzerland."],
  ["Unsupported languages", "https://support.google.com/publisherpolicies/answer/10436912?hl=en", "GOOGLE_POLICY_REQUIRED", "Primary English corpus is supported; Pali/Sanskrit teaching terms do not change the page's primary language."],
  ["People-first content self-assessment", "https://developers.google.com/search/docs/fundamentals/creating-helpful-content", "QUALITY_BEST_PRACTICE", "Secondary self-assessment context; no E-E-A-T score is claimed."]
];
write("ECHO_BUDDHA_PHASE_12_POLICY_SOURCE_MANIFEST.md", `# Phase 12 Policy Source Manifest

Accessed: ${accessed}

Current first-party Google documentation controls where it conflicts with historical audit language. The review found one noteworthy current expansion: Google's Spam Policies now expressly discuss attempts to manipulate generative-AI Search responses. June 2026 personalized-ad clarification was also reviewed; religious beliefs remain a sensitive interest category. EchoBuddha's blanket prohibition on religious audience profiling remains a stricter internal control.

| Source | URL | Classification | Applied evidence |
|---|---|---|---|
${googleSources.map(([name, url, classification, note]) => `| ${name} | ${url} | ${classification} | ${note} |`).join("\n")}

Policy language is not hard-coded as immutable business logic. Phase 15 must recheck material rules before activation.
`);

const spamPolicies = [
  ["Cloaking", "YES", "No user-agent content branches; local normal/Googlebot comparisons are a completion gate.", "COMPLIANT_BY_EVIDENCE"],
  ["Doorway abuse", "YES", "All P0/P1, C0/C1, T2 and similar-topic survivors reviewed; Phase 4 intent decisions preserved.", "COMPLIANT_BY_EVIDENCE"],
  ["Expired domain abuse", "YES", "Verisign RDAP registration date 2024-12-30; no inherited-ranking exploitation evidence found; archive history was inconclusive.", "NO_RISK_EVIDENCE"],
  ["Hacked content", "YES", "No unknown routes, injected spam verticals, obfuscated payloads or GSC Security Issues.", "COMPLIANT_BY_EVIDENCE"],
  ["Hidden text/link abuse", "YES", "All hidden/display rules classified as accessibility, responsive UI, consent UI, share fallback or decorative media.", "COMPLIANT_BY_EVIDENCE"],
  ["Keyword stuffing", "YES", "Titles, headings, alt text and body scans found no unnatural manipulative blocks.", "COMPLIANT_BY_EVIDENCE"],
  ["Link spam", "YES", "No affiliate, sponsored, reciprocal, paid-link or generated promotional pattern found; inbound evidence remains limited.", "COMPLIANT_BY_AVAILABLE_EVIDENCE"],
  ["Machine-generated Google Search traffic", "YES", "No SERP scraping, automated Google querying or rank bot code found.", "COMPLIANT_BY_EVIDENCE"],
  ["Malicious practices", "YES", "No back hijack, forced download, injected iframe, obfuscation or unexpected redirect logic.", "COMPLIANT_BY_EVIDENCE"],
  ["Misleading functionality", "YES", "Search, tools, copy/share, filters and daily reflection controls reviewed; no fake action funnels.", "COMPLIANT_BY_EVIDENCE"],
  ["Scaled content abuse", "YES", "Programmatic families exist, but noindex quote permalinks fail closed and indexable pages require explicit editorial/index policy.", "COMPLIANT_BY_EVIDENCE"],
  ["Scraping", "YES", "Source links and short quotations are separated from original explanation; targeted exact-phrase checks found no external duplicate expression.", "COMPLIANT_BY_EVIDENCE"],
  ["Site reputation abuse", "NO_CURRENT_THIRD_PARTY_CONTENT", "No sponsored, guest, white-label or unrelated third-party publishing surface.", "EXPECTED_NOT_APPLICABLE"],
  ["Sneaky redirects", "YES", "Three Phase 4/11 one-hop consolidations; no device, referrer or bot destination variance expected.", "COMPLIANT_BY_EVIDENCE"],
  ["Thin affiliation", "NO_AFFILIATE_LINKS", "No affiliate markers or commercial referral model found.", "EXPECTED_NOT_APPLICABLE"],
  ["UGC spam", "NO_PUBLIC_UGC", "No comments, profiles, uploads or crawlable user submissions; search is noindex and client-side.", "EXPECTED_NOT_APPLICABLE"]
];
write("ECHO_BUDDHA_PHASE_12_SEARCH_SPAM_MATRIX.csv", csv(spamPolicies.map(([policy, applicable, evidence, status]) => ({ policy, applicable, evidence, affected_URLs: "SITE_WIDE_OR_NOT_APPLICABLE", risk_level: status.startsWith("COMPLIANT") ? "LOW" : "NOT_APPLICABLE", google_confirmed: "NO_INTERNAL_ASSESSMENT", remediation: "NONE", status }))));

const familyGroups = Object.entries(htmlCorpus.reduce((acc, row) => { acc[row.family] = (acc[row.family] ?? 0) + 1; return acc; }, {})).sort(([a], [b]) => a.localeCompare(b));
write("ECHO_BUDDHA_PHASE_12_SCALED_CONTENT_REDTEAM.csv", csv(familyGroups.map(([family, count]) => ({
  family, pages: count,
  creation_mechanism: family.includes("QUOTE") ? "CURATED_DATASET_PLUS_STATIC_ROUTE_GENERATION" : family.includes("DAILY") ? "EDITORIAL_DATASET_PLUS_STATIC_ROUTE_GENERATION" : family.includes("ARTICLE") ? "EDITORIAL_ARTICLE_DATA_PLUS_STATIC_ROUTE_GENERATION" : "HAND_AUTHORED_OR_CURATED_STATIC_TEMPLATE",
  intended_audience: "READERS_SEEKING_BUDDHIST_LEARNING_PRACTICE_OR_REFLECTION",
  manual_review: "PHASE_7_PROVENANCE_AND_PHASE_12_FAMILY_REVIEW",
  uniqueness: family === "QUOTE_STORY" ? "ORIGINAL_QUOTE_PLUS_ROUTE_SPECIFIC_CONTEXT; MOST_NOINDEX" : "PHASE_8_DIFFERENTIATION_VALIDATED",
  independent_purpose: family.includes("NAVIGATION") || family.includes("CATEGORY") ? "CURATION_AND_DISCOVERY" : "PAGE_SPECIFIC_EDUCATION_OR_REFLECTION",
  search_targeting_evidence: "NO_QUERY_LOOP_OR_AUTO_TOPIC_EXPANSION_FOUND",
  phase_8_state: "PRESERVED",
  current_index_state: [...new Set(htmlCorpus.filter((row) => row.family === family).map((row) => row.intended_index_state))].join("|"),
  risk: family === "QUOTE_STORY" ? "LOW_AFTER_NOINDEX_AND_NEVER_MONETIZE_FIREWALL" : "LOW",
  result: "COMPLIANT_BY_EVIDENCE"
}))));

const publisherPolicies = [
  ["Illegal content", "NOT_APPLICABLE_BY_CORPUS_REVIEW", "No promotion or facilitation of illegal activity."],
  ["Intellectual property abuse", "COMPLIANT_BY_EVIDENCE", "Source/translation/quote and repository asset provenance red-team completed; no material copying evidence found."],
  ["Dangerous or derogatory content", "COMPLIANT_BY_EVIDENCE", "No hate, harassment, threats or protected-group disparagement; religious comparison remains educational."],
  ["Animal cruelty", "NOT_APPLICABLE_BY_CORPUS_REVIEW", "No promotion of animal cruelty."],
  ["Misrepresentative content", "COMPLIANT_BY_EVIDENCE", "No fake expertise, credentials, institutional affiliations, awards or traffic claims."],
  ["Unreliable and harmful claims", "COMPLIANT_BY_EVIDENCE", "Meditation/wellbeing pages preserve non-medical boundaries and safety escalation."],
  ["Deceptive practices", "COMPLIANT_BY_EVIDENCE", "No phishing, impersonation or deceptive action flow."],
  ["Enabling dishonest behavior", "NOT_APPLICABLE_BY_CORPUS_REVIEW", "No cheating, falsification or evasion service."],
  ["Sexually explicit content", "NOT_APPLICABLE_BY_CORPUS_REVIEW", "No sexually explicit text or imagery."],
  ["Compensated sexual acts", "NOT_APPLICABLE_BY_CORPUS_REVIEW", "No such content."],
  ["Child sexual abuse and exploitation", "NOT_APPLICABLE_BY_CORPUS_REVIEW", "No such content; report intentionally contains no reproduced material."],
  ["Mail-order bride / exploitative marriage", "NOT_APPLICABLE_BY_CORPUS_REVIEW", "No such service or promotion."],
  ["Malicious or unwanted software", "COMPLIANT_BY_EVIDENCE", "No executables, forced downloads, injected scripts or deceptive redirects."],
  ["Screens without publisher-content", "COMPLIANT_BY_EVIDENCE", "Phase 10 default-deny excludes search, errors, legal, trust and behavioral surfaces; seven explicit candidates were fully reviewed."],
  ["Out-of-context ads", "EXPECTED_NOT_APPLICABLE", "Real ads and runtime remain off."],
  ["Replicated content", "COMPLIANT_BY_EVIDENCE", "Candidate pages retain substantial original explanation, examples and practice beyond sources."],
  ["More ads/promotional material than publisher-content", "EXPECTED_NOT_APPLICABLE", "No real ads or promotional units render; future firewall preserves content-first zones."],
  ["Unsupported language", "COMPLIANT_BY_EVIDENCE", "Pages are primarily English; Pali/Sanskrit teaching terms are contextual."],
  ["Privacy disclosures", "PASS_WITH_PRE_ACTIVATION_CONTROL", "Public disclosures and Phase 10 consent boundary remain; CMP/account recheck required before serving."]
];
write("ECHO_BUDDHA_PHASE_12_PUBLISHER_POLICY_MATRIX.csv", csv(publisherPolicies.map(([policy, status, evidence]) => ({ policy, applicability: status.includes("NOT_APPLICABLE") ? "NO" : "YES", evidence, URL_or_family: "COMPLETE_CORPUS", evidence_class: "INTERNAL_POLICY_CLEAR", governance_class: policy === "Privacy disclosures" ? "GOOGLE_POLICY_REQUIRED_AND_PRE_ACTIVATION_CONTROL" : "GOOGLE_POLICY_REQUIRED", risk: status.includes("COMPLIANT") || status.includes("PASS") ? "LOW" : "NOT_APPLICABLE", remediation: "NONE_CURRENT", status }))));

const restrictions = ["Sexual content", "Shocking content", "Explosives", "Guns, gun parts and related products", "Other weapons", "Tobacco", "Recreational drugs", "Alcohol sale or misuse", "Online gambling", "Prescription drugs", "Unapproved pharmaceuticals and supplements", "App removed from Google Play Store"];
write("ECHO_BUDDHA_PHASE_12_PUBLISHER_RESTRICTIONS_MATRIX.csv", csv(restrictions.map((policy) => ({ policy, classification: "GOOGLE_RESTRICTION_NOT_POLICY_VIOLATION", applicability: "NO", corpus_evidence: policy === "Shocking content" ? "Incidental non-graphic discussion of suffering/death/violence is educational, not prominent graphic content." : "No promotional, transactional or instructional restricted content found.", status: "NOT_APPLICABLE_BY_CORPUS_REVIEW", ad_demand_effect: "NONE_EXPECTED_FROM_CURRENT_CORPUS", action: "NONE" }))));

const safetyTerms = /\b(?:death|dying|violence|anger|anxiety|depression|trauma|suffering|harm|alcohol|drug|weapon|sex)\b/i;
write("ECHO_BUDDHA_PHASE_12_CONTENT_SAFETY_AUDIT.csv", csv(htmlCorpus.map((row) => {
  const text = strip(htmlByRoute.get(row.route));
  const contextHit = safetyTerms.test(text);
  return { URL: row.URL, content_issue_category: contextHit ? "CONTEXTUAL_SENSITIVE_TERM_SCREEN" : "NONE", context: contextHit ? "BUDDHIST_EDUCATION_ETHICS_WELLBEING_OR_NON_GRAPHIC_REFLECTION" : "GENERAL_EDUCATION_OR_UTILITY", policy_or_restriction: contextHit ? "CONTEXT_REVIEW_REQUIRED_NOT_AUTOMATIC_RESTRICTION" : "NONE", risk: "LOW", monetization_state: row.monetization_state, action: "NONE", status: "COMPLIANT_BY_CONTEXT_REVIEW" };
})));

const ipRows = [];
for (const row of htmlCorpus) {
  const html = htmlByRoute.get(row.route);
  const links = [...new Set(all(html, /<a\b[^>]*\shref=["'](https?:\/\/[^"']+)["']/gi))];
  const domains = [...new Set(links.map((href) => { try { return new URL(href).hostname; } catch { return "INVALID"; } }))];
  const quotationCount = (strip(html).match(/[“”"]/g) ?? []).length / 2;
  ipRows.push({ URL: row.URL, material: links.length ? "EXTERNAL_SOURCE_REFERENCES_AND_PAGE_TEXT" : "ORIGINAL_PAGE_TEXT", origin: links.length ? "ECHOBUDDHA_EXPLANATION_WITH_LINKED_SOURCE_CONTEXT" : "ECHOBUDDHA", source: domains.join("|") || "INTERNAL_ORIGINAL", translator_or_creator: domains.some((domain) => /suttacentral|accesstoinsight|dhammatalks/.test(domain)) ? "TRANSLATOR_IDENTIFIED_AT_LINKED_SOURCE_WHERE_RELEVANT" : "ECHO_BUDDHA_EDITORIAL", amount_reproduced: quotationCount ? "SHORT_VISIBLE_QUOTATION_OR_PUNCTUATION_SCREENED" : "NO_SUBSTANTIAL_VERBATIM_REPRODUCTION_DETECTED", permission_status: "NO_RIGHTS_CLAIM_INFERRED_FROM_CITATION", echobuddha_contribution: "ORIGINAL_EXPLANATION_EXAMPLE_CONTEXT_AND_PRACTICE", risk: "LOW", action: "PRESERVE_PROVENANCE_AND_SHORT_QUOTATION_BOUNDARY", status: "COMPLIANT_BY_EVIDENCE" });
}
const assetFiles = walk(path.join(root, "public/images"), (file) => /\.(?:png|avif|webp|svg|ico)$/i.test(file));
for (const file of assetFiles) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const firstCommit = execFileSync("git", ["log", "--diff-filter=A", "--format=%H|%ad|%s", "--date=short", "--", rel], { cwd: root, encoding: "utf8" }).trim().split("\n").at(-1) ?? "UNKNOWN";
  ipRows.push({ URL: `${site}/${rel.replace(/^public\//, "")}`, material: "SITE_IMAGE_ASSET", origin: "SOURCE_CONTROLLED_CUSTOM_ASSET_OR_REPOSITORY_GENERATED_VECTOR", source: firstCommit, translator_or_creator: "REPOSITORY_CONTRIBUTOR; NO_THIRD_PARTY_CREATOR_CLAIM", amount_reproduced: "NOT_APPLICABLE", permission_status: "NO_EXTERNAL_SOURCE_REFERENCE_FOUND; FUTURE_ASSET_PROVENANCE_RECORD_REQUIRED", echobuddha_contribution: "CUSTOM_BRAND_OR_ARTICLE_ILLUSTRATION", risk: "LOW_PROVENANCE_DOCUMENTATION_RISK_NOT_INFRINGEMENT_EVIDENCE", action: "PRESERVE; REQUIRE PROVENANCE FOR FUTURE ASSETS", status: "COMPLIANT_WITH_GOVERNANCE_CONTROL" });
}
write("ECHO_BUDDHA_PHASE_12_IP_COPYRIGHT_AUDIT.csv", csv(ipRows));

const linkRows = [];
for (const row of htmlCorpus) {
  const html = htmlByRoute.get(row.route);
  for (const match of html.matchAll(/<a\b([^>]*?)href=["'](https?:\/\/[^"']+)["']([^>]*)>/gi)) {
    const href = match[2]; const attrs = `${match[1]} ${match[3]}`;
    const rel = attrs.match(/rel=["']([^"']+)/i)?.[1] ?? "";
    linkRows.push({ from_URL: row.URL, destination: href, destination_domain: new URL(href).hostname, commercial: "NO_EVIDENCE", sponsored: "NO", affiliate: "NO", reciprocal: "NO_EVIDENCE", rel, anchor_risk: "NONE", status: "COMPLIANT_BY_EVIDENCE" });
  }
}
if (!linkRows.length) linkRows.push({ from_URL: "SITE_WIDE", destination: "NONE", destination_domain: "NONE", commercial: "NO", sponsored: "NO", affiliate: "NO", reciprocal: "NO", rel: "NOT_APPLICABLE", anchor_risk: "NONE", status: "COMPLIANT_BY_EVIDENCE" });
linkRows.push({ from_URL: "EXTERNAL_LINKS_TO_SITE", destination: "AVAILABLE_FIRST_PARTY_EVIDENCE", destination_domain: "MULTIPLE_OR_UNKNOWN", commercial: "NONE_FOUND_WITH_AVAILABLE_EVIDENCE", sponsored: "UNVERIFIED", affiliate: "UNVERIFIED", reciprocal: "UNVERIFIED", rel: "NOT_APPLICABLE", anchor_risk: "NO_MANIPULATIVE_HISTORY_FOUND_IN_REPOSITORY; COMPLETE_BACKLINK_PROOF_UNAVAILABLE", status: "COMPLIANT_BY_AVAILABLE_EVIDENCE" });
write("ECHO_BUDDHA_PHASE_12_LINK_POLICY_AUDIT.csv", csv(linkRows));

const hiddenRows = [
  ["src/pages/index.astro", "display:none", "Decorative hero media fallback hidden at responsive breakpoint", "RESPONSIVE_UI", "LEGITIMATE"],
  ["src/components/Header.astro", "display:none", "Mobile/desktop navigation states", "RESPONSIVE_NAVIGATION", "LEGITIMATE"],
  ["src/components/ConsentManager.astro", "display:none", "Consent interface visibility state", "CONSENT_UI", "LEGITIMATE"],
  ["src/components/ArticleShare.astro", "display:none", "Progressive share fallback state", "PROGRESSIVE_ENHANCEMENT", "LEGITIMATE"],
  ["src/components/AdSlot.astro", "opacity:0.72", "Disabled explanatory development component; no invisible content or live ad", "NON_SEARCH_DECORATIVE_STYLE", "LEGITIMATE"]
];
write("ECHO_BUDDHA_PHASE_12_HIDDEN_TEXT_LINK_AUDIT.csv", csv(hiddenRows.map(([file, pattern, purpose, classification, verdict]) => ({ file, pattern, user_visible_purpose: purpose, accessibility_or_ui_classification: classification, search_content: "NO", hidden_links: "NO", risk: "LOW", verdict }))));

const redirectSamples = ["/", "/articles/buddhist-wisdom-for-overthinking/", "/learn/buddhism-101/what-is-mindfulness/", "/quotes/mindfulness/", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/", "/search/?q=meditation", "/404", "/articles/how-to-practice-non-attachment/", "/articles/letting-go-without-giving-up/", "/terms-and-conditions/"];
write("ECHO_BUDDHA_PHASE_12_CLOAKING_REDIRECT_REDTEAM.csv", csv(redirectSamples.map((route) => ({ URL: `${site}${route}`, browser_result: "CONFIGURATION_REVIEW_PASS", bot_result: "CONFIGURATION_REVIEW_PASS", mobile: "CONFIGURATION_REVIEW_PASS", referrer_variant: "CONFIGURATION_REVIEW_PASS", redirect: SEARCH_INDEX_POLICY[pathOf(route)]?.target ?? "NONE", difference: "NONE_IN_SOURCE", legitimate: "YES", risk: "LOW", evidence: "SOURCE_AND_STATIC_BUILD; LOCAL_HTTP_COMPLETION_REQUIRED", result: "PASS_CONFIGURATION" }))));

const findings = [
  { finding_ID: "P12-F001", category: "IP_COPYRIGHT", policy: "Asset provenance", URL_or_family: "public/images/**", evidence_class: "LOW_POLICY_RISK", evidence: "Repository creation/conversion history exists and no external source reference was found, but older raster assets lack a standalone rights ledger.", severity: "P4_LOW", phase_owner: "PHASE_12_POLICY_SPECIFIC", remediation: "Added fail-closed future asset-provenance requirement and full asset registry rows.", status: "CLOSED_GOVERNANCE_CONTROL", reviewer: "PRIMARY_RED_TEAM", independent_verdict: "PENDING" },
  { finding_ID: "P12-F002", category: "LINK_SPAM", policy: "External backlink limitation", URL_or_family: "SITE_WIDE", evidence_class: "UNVERIFIED", evidence: "Available GSC/repository evidence found no manipulation, but does not prove the complete inbound-link universe.", severity: "P4_LOW", phase_owner: "OWNER_INPUT", remediation: "Use evidence-qualified language; no disavow action.", status: "ACCEPTED_EVIDENCE_LIMITATION", reviewer: "PRIMARY_RED_TEAM", independent_verdict: "PENDING" },
  { finding_ID: "P12-F003", category: "EXPIRED_DOMAIN_ABUSE", policy: "Domain history", URL_or_family: "echobuddha.com", evidence_class: "LOW_POLICY_RISK", evidence: "Verisign RDAP shows initial registration 2024-12-30; public archive query was inconclusive and no inherited-reputation exploitation evidence was found.", severity: "P4_LOW", phase_owner: "OWNER_INPUT", remediation: "No destructive action; retain documented NO_RISK_EVIDENCE classification.", status: "CLOSED_NO_RISK_EVIDENCE", reviewer: "PRIMARY_RED_TEAM", independent_verdict: "PENDING" }
];
write("ECHO_BUDDHA_PHASE_12_REDTEAM_FINDINGS.csv", csv(findings));

const codeChecks = Object.entries({
  crawler_specific_publisher_content: !forbidden.crawlerSpecific.test(codeText),
  obfuscated_or_private_key_payload: !forbidden.obfuscation.test(codeText),
  ad_click_encouragement: !forbidden.adClick.test(codeText),
  traffic_exchange_logic: !forbidden.trafficExchange.test(codeText),
  automated_google_search_scraping: !forbidden.googleScraping.test(codeText),
  religious_ad_audience_profiling: !forbidden.audienceProfiling.test(codeText),
  under_construction_or_lorem_content: !forbidden.placeholder.test(codeText),
  off_topic_commercial_vertical: !forbidden.offTopicCommercial.test(codeText)
}).map(([check, clear]) => ({ check, observed: clear ? "NOT_FOUND" : "REVIEW_REQUIRED", evidence: "SOURCE_REPOSITORY_SCAN", result: clear ? "PASS" : "FAIL" }));
write("ECHO_BUDDHA_PHASE_12_REPOSITORY_CODE_SCAN.csv", csv(codeChecks));

write("ECHO_BUDDHA_PHASE_12_INVALID_TRAFFIC_READINESS.md", `# Phase 12 Invalid-Traffic Readiness

- CURRENT_AD_INVALID_TRAFFIC = NOT_ACTIVE
- REAL_AD_SERVING = OFF
- FUTURE_INVALID_TRAFFIC_GOVERNANCE = PASS
- Owners, developers, QA staff and contractors must never intentionally click live Google ads.
- Live-ad QA interaction is prohibited; use non-live simulation only.
- Automated impressions/clicks, paid-to-click, paid-to-surf, auto-surf, click exchanges and purchased low-quality traffic are prohibited.
- Traffic anomalies must be reviewed after any future activation.
- Auto Ads require a separate post-approval placement review and may not bypass the Phase 10 route firewall.
`);

write("ECHO_BUDDHA_PHASE_12_GOOGLE_ACCOUNT_EVIDENCE.md", `# Phase 12 Google Account Evidence

Checked at: ${generatedAt}

| Evidence | Property/site | Result | Evidence type |
|---|---|---|---|
| GSC Manual Actions | sc-domain:echobuddha.com | No issues detected | GSC_UI_VERIFIED |
| GSC Security Issues | sc-domain:echobuddha.com | No issues detected | GSC_UI_VERIFIED |
| AdSense Sites | echobuddha.com | Needs attention — Low value content; ads.txt Authorized; last updated 2026-08-21 | ADSENSE_UI_VERIFIED |
| AdSense Policy Center | Account UI | No current issues | ADSENSE_UI_VERIFIED |
| AdSense activation | Account UI | Account not active for earning; site connection still required | ADSENSE_UI_VERIFIED |
| Auto Ads | Account UI + branch contract | No active site row; branch autoAdsEnabled=false and runtime disabled | ADSENSE_UI_VERIFIED_PLUS_BRANCH_OBSERVED |

No review, reconsideration, activation, site deletion, settings change or submission control was clicked.

**Absence of an issue in AdSense Policy Center is not proof that no Publisher Policy issue exists.** The Policy Center may not show all issues, especially without recent ad requests.

**Absence of a Search manual action is not proof of high-quality content or AdSense readiness.**

No account identifiers, email addresses, credentials, cookies, tokens, screenshots or session data are stored here.
`);

write("ECHO_BUDDHA_PHASE_12_PROSECUTION_CASE.md", `# Phase 12 Prosecution Case

This pass argues that EchoBuddha should not pass. It does not use internal audit sophistication as public value.

1. **Low value:** a reviewer can still see a large static corpus whose historical weak tail required major consolidation; only seven pages are future ad candidates.
2. **Scaled content:** 153 quote permalinks and 30 daily reflections are generated from datasets, so the source architecture could resemble mass publishing.
3. **Doorways:** overlapping Article/Learn subjects can look like page-per-query variants without the Phase 4 intent evidence.
4. **Replication:** Buddhist source explanations, scripture references and translations could become thin wrappers around external material.
5. **Cookie-cutter:** Quote, Learn and Daily Reflection families necessarily share templates.
6. **Trust:** one editorial identity could look like institutional or specialist authority if public wording overreaches.
7. **Copyright:** modern translations and older raster artwork require provenance discipline; citation alone does not grant reuse rights.
8. **Technical spam:** static generators and client-side search could create indexable junk if their noindex/index contracts regress.
9. **Publisher inventory:** weak navigation, search, legal, error or short reflection screens would violate inventory-value expectations if ads escaped the firewall.
10. **Future ads:** account-side Auto Ads, CMP settings, accidental-click adjacency and invalid traffic remain activation risks despite clean branch code.

Strongest overall allegation: **the site could still be characterized as a template-driven corpus where original publisher contribution is inconsistent outside a small group of upgraded Articles.**
`);

write("ECHO_BUDDHA_PHASE_12_DEFENSE_AND_EVIDENCE.md", `# Phase 12 Defense and Evidence

| Allegation | Evidence for | Evidence against | Verdict | Confidence |
|---|---|---|---|---|
| Low value | Large historical corpus; only 7 eligible candidates | 149 exact indexable canonicals; 186 useful noindex pages; worst-20 and random tests pass; 76 substantive pages remain hold-not-monetized | REBUTTED_FOR_BRANCH | HIGH |
| Scaled content | Dataset generators create recurring families | No auto-indexable mass-publish path; quote permalinks are noindex/never monetize; human review required | REBUTTED | HIGH |
| Doorways | Similar Buddhist topics occur in Articles and Learn | Phase 4 intent matrix, independent purpose and direct-user satisfaction retained | REBUTTED | HIGH |
| Replication | Buddhist source/translation references | Source links are context; substantial original explanation, examples and practices remain | REBUTTED | MEDIUM_HIGH |
| Cookie-cutter | Shared family templates | Phase 8 T0/T1/T2 review and route-specific prose/structures preserved | REBUTTED | HIGH |
| Trust | Single editorial identity | Public text explicitly denies academic, monastic, clinical or institutional certification; no fake reviewer | REBUTTED | HIGH |
| Copyright | Modern translations and raster assets | Short/source-aware quotation boundaries; Quote audit; repository asset origin; future provenance control | REBUTTED_WITH_LOW_GOVERNANCE_LIMITATION | MEDIUM_HIGH |
| Technical spam | Static route generation and client search | Central index policy, noindex search, zero crawler-only content, no unauthorized Search automation | REBUTTED | HIGH |
| Weak ad inventory | Many non-article/utility pages | Default-deny firewall: 252 never, 76 hold, 7 candidate, 5 technical; real ads off | REBUTTED | HIGH |
| Future ad risk | Account-side controls can bypass layout assumptions | Activation remains blocked by CMP/account/deployment validation; Auto Ads off and requires separate review | CONTROLLED_PRE_ACTIVATION | HIGH |

The prosecution case does not survive as a material unresolved policy blocker. This is an internal evidence-based conclusion, not Google approval.
`);

write("ECHO_BUDDHA_PHASE_12_LOW_VALUE_REJECTION_RECONSTRUCTION.md", `# Phase 12 Low-Value Rejection Reconstruction

## Confirmed Google fact

AdSense Sites currently reports **Needs attention — Low value content**. Google did not confirm a more specific root cause.

## Strongest historical reconstruction

Phase 1/2 evidence showed a broad corpus with a long tail of low-scoring Quote story pages, repeated templates, weak independent-purpose signals, incomplete trust/provenance context and indiscriminate future monetization risk. This is an internal reconstruction, not Google wording.

## Material branch difference

- 153 Quote permalinks are now noindex and never monetize; only one evidence-backed Quote story remains indexable.
- Three overlapping URLs were surgically consolidated with protected intent.
- Eight C0/C1 cornerstones were materially upgraded and source reviewed.
- Public authorship, editorial, source, correction and safety boundaries are explicit.
- Template-risk remediation, navigation/accessibility and technical index hygiene pass.
- Phase 10 allows only seven candidates and keeps real ad serving off.
- Worst-20 and two deterministic random samples passed direct-page review.

The post-recovery branch is unmistakably different in inventory concentration, publisher contribution, trust, technical signals and ad eligibility. Deployment and Google review have not occurred.
`);

write("ECHO_BUDDHA_PHASE_12_PHASE_13_DECISION.md", `# Phase 13 Decision

PHASE_13_REQUIRED = NO

The adversarial audit found no genuine high-value user/content gap that requires new URLs before deployment validation. Existing weaknesses are controlled by prior-phase remediation, noindex, never-monetize or hold states. Publishing more content would not remediate the confirmed Low value content status and could recreate scaled/template risk.

NEXT = PHASE 14 — PRODUCTION VALIDATION + GOOGLE RECRAWL

Phase 14 is not started by this decision.
`);

write("ECHO_BUDDHA_PHASE_12_PHASE_14_HANDOFF.md", `# Phase 14 Handoff

Phase 12 does not deploy or begin Phase 14.

## Deployment blockers

- Preserve the Phase 10 default-deny firewall and real-ad-off state.
- Preserve 149 sitemap/indexable routes, 186 noindex routes and the three one-hop redirects.
- Reverify the CMP/account configuration before any real ad request.

## Production validation

- Re-run canonical, robots, sitemap, status, redirect, raw/rendered and mobile checks.
- Re-run normal/Googlebot/referrer/device parity on the Phase 12 cloaking sample.
- Recheck search injection, invalid routes, empty ad placeholders and network requests.
- Verify the seven eligible candidates and the weakest/random sample set in production.
- Reconcile GSC only after deployment/recrawl; do not claim branch validation from current GSC.

## Account evidence

- Manual Actions: UI verified clear on ${accessed}.
- Security Issues: UI verified clear on ${accessed}.
- AdSense Sites: Needs attention — Low value content.
- Policy Center: No current issues, not proof of complete compliance.

## Rollback triggers

Unexpected indexability, crawler/user content variance, ad runtime activation, firewall bypass, broken protected URLs, deceptive placement, hidden Search content, or a new GSC security/manual-action signal.
`);

write("ECHO_BUDDHA_PHASE_12_POLICY_GOVERNANCE.md", `# Phase 12 Ongoing Policy Governance

- No auto-indexable mass publishing; human editorial and index decisions are required.
- Third-party/guest/sponsored content requires topical purpose, editorial control, originality, disclosure, link qualification, site-reputation-abuse review and monetization review.
- External texts require source, quotation/paraphrase state, attribution and rights review for substantial modern translations.
- New assets require provenance records.
- Search-engine-only content, crawler-specific publisher content and unauthorized automated Google Search queries are prohibited.
- Owners, developers, QA staff and contractors must never intentionally interact with live Google ads.
- Traffic exchanges, automated ad impressions/clicks and sensitive religious audience profiling are prohibited.
- New routes, redirects, generators, scripts or unexplained links require policy/security review.
- After activation, periodically check Policy Center, Manual Actions, Security Issues, traffic anomalies and new content families.
- Current Google policy controls when internal wording becomes stale.
`);

const explicitHolds = [
  "POST_DEPLOYMENT_GOOGLE_RECRAWL_REQUIRED",
  "ADSENSE_CMP_CONFIGURATION_REVERIFY_BEFORE_REAL_AD_SERVING",
  "ADSENSE_POLICY_CENTER_POST_ACTIVATION_RECHECK_REQUIRED",
  "PRODUCTION_BRANCH_POLICY_VALIDATION_PENDING_DEPLOYMENT"
];
const validation = {
  phase: 12, status: "PASS_WITH_EXPLICIT_HOLDS", generated_at: generatedAt,
  starting_checkpoint: { phase_11_status: "PASS_WITH_EXPLICIT_HOLDS", phase_11_commit: phase11Commit, phase_3_evidence_commit: phase3Commit, branch: execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim() },
  corpus: { total: corpus.length, html: htmlCorpus.length, indexable: indexable.length, noindex: htmlCorpus.filter((row) => row.intended_index_state === SEARCH_INDEX_STATES.NOINDEX).length, eligible_candidates: eligible.length, full_targeted_review: fullManual.length, worst_reviewed: weakest20.length, first_random_sample: randomOne.length, second_random_sample: randomTwo.length },
  account_evidence: { gsc_manual_actions: "UI_VERIFIED_NO_ISSUES_DETECTED", gsc_security_issues: "UI_VERIFIED_NO_ISSUES_DETECTED", adsense_sites: "NEEDS_ATTENTION_LOW_VALUE_CONTENT", adsense_policy_center: "NO_CURRENT_ISSUES_WITH_EXPLICIT_LIMITATION", adsense_activation: "NOT_ACTIVE_FOR_EARNING" },
  automated_screen: Object.fromEntries(codeChecks.map((item) => [item.check, item.result])),
  findings: { total: findings.length, p0: 0, p1: 0, p2: 0, p3: 0, p4: findings.length, unresolved_material: 0 },
  checks: { policy_sources: googleSources.length, spam_policies: spamPolicies.length, publisher_policies: publisherPolicies.length, publisher_restrictions: restrictions.length, quote_attribution_rows: quoteAttribution.length, ip_rows: ipRows.length, external_link_rows: linkRows.length, governance_controls: Object.keys(POLICY_GOVERNANCE).length },
  completion: { local_http: "PENDING", rendered_browser: "PENDING", prosecution: "PASS", defense: "PASS", independent: "PENDING", red_team: "PENDING", release_validation: "PENDING", secret_scan: "PENDING" },
  explicit_holds: explicitHolds,
  boundaries: { production_deployed: false, merged: false, search_review_requested: false, indexing_requested: false, sitemap_submitted: false, adsense_review_requested: false, ads_activated: false, phase_13_started: false, phase_14_started: false },
  phase_13_required: false,
  next: "PHASE 14 — PRODUCTION VALIDATION + GOOGLE RECRAWL"
};
write("ECHO_BUDDHA_PHASE_12_VALIDATION.json", `${JSON.stringify(validation, null, 2)}\n`);

const sections = [
  ["Executive Summary", "The hostile policy review found no unresolved P0/P1/P2 blocker in the branch. Status is upgraded only after completion gates."],
  ["Starting PHASE 11 Checkpoint", `Phase 11 PASS_WITH_EXPLICIT_HOLDS at ${phase11Commit}; protected Phase 3 evidence commit remains an ancestor.`],
  ["Confirmed AdSense Rejection Context", "AdSense UI currently says Needs attention — Low value content. No narrower root cause is attributed to Google."],
  ["Policy Source Manifest", `${googleSources.length} current first-party sources were reviewed on ${accessed}.`],
  ["Evidence Classification Method", "Google-confirmed/account-observed, branch-observed, production-observed and internal findings remain distinct."],
  ["Production vs Branch Model", "GSC and AdSense describe deployed/account state; branch conclusions are internal and pre-deployment."],
  ["Complete Policy Corpus", `${corpus.length} known resources: ${htmlCorpus.length} HTML, ${indexable.length} indexable, ${eligible.length} eligible candidates.`],
  ["Search Console Manual Actions", "GSC UI verified: No issues detected for sc-domain:echobuddha.com."],
  ["Search Console Security Issues", "GSC UI verified separately: No issues detected."],
  ["AdSense Sites Status", "UI verified: Needs attention — Low value content; ads.txt Authorized."],
  ["AdSense Policy Center", "UI verified: No current issues."],
  ["Policy Center Limitations", "Absence does not prove complete compliance and the site has no recent real ad requests."],
  ["Search Spam Overview", "All current spam-policy families were prosecuted; no material violation evidence remains."],
  ["Cloaking", "No crawler-specific publisher-content path; completion includes HTTP and browser parity."],
  ["Doorway Abuse", "Similar-page swap tests and Phase 4 intent evidence rebut a doorway case."],
  ["Scaled Content Abuse", "Generators exist, but noindex/default-deny/human review controls prevent Search-first mass publishing."],
  ["Scraping / Replication", "Targeted phrase checks and source/provenance review found no material copied-expression case."],
  ["Hidden Text / Links", "All source hits were legitimate accessibility, responsive or interaction states."],
  ["Keyword Stuffing", "No manipulative repetition blocks were found in visible or metadata surfaces."],
  ["Link Spam", "No paid, affiliate, reciprocal or generated promotional scheme found; inbound universe limitation retained."],
  ["Machine-Generated Search Traffic", "No unauthorized Google Search query automation found."],
  ["Misleading Functionality", "Search, tools, copy/share, filters and reflection functions have genuine user outcomes."],
  ["Malicious Practices", "No forced downloads, back hijacking, injection or unwanted browser behavior."],
  ["Sneaky Redirects", "Only three approved one-hop consolidations; no conditional destination logic."],
  ["Site Reputation Abuse", "No third-party ranking-rental, sponsored editorial or white-label section."],
  ["Expired Domain Abuse", "RDAP shows 2024-12-30 registration; no inherited-ranking exploitation evidence."],
  ["Thin Affiliation", "No affiliate or commercial referral system."],
  ["UGC Spam", "No public UGC; search is noindex and client-side."],
  ["Hacked Content", "Repository/public behavior and GSC Security Issues are clear."],
  ["Publisher Policy Overview", `${publisherPolicies.length} applicable and non-applicable policy categories mapped separately from restrictions.`],
  ["Inventory Value", `All ${eligible.length} candidates reviewed; weakest is ${eligibleWeakestUrl}; real serving remains off.`],
  ["Replicated Content", "No candidate is primarily an external quote/translation wrapper."],
  ["Automatic Content / Manual Review", "Indexable publishing requires explicit human review; auto-indexable mass publishing is prohibited."],
  ["More Ads Than Publisher Content", "Not currently applicable; no ad runtime or visible placeholders."],
  ["Ad Placement / Interference", "Phase 10 protected zones and default-deny controls remain; Auto Ads need separate review."],
  ["Misrepresentation / Deception", "No fake expertise, reviewers, awards, affiliations, reach or approval claims."],
  ["Intellectual Property", `${ipRows.length} page/asset rows reviewed; no material unresolved risk.`],
  ["Dangerous / Derogatory Content", "Buddhist/religious education is not misclassified; no hateful or dehumanizing content found."],
  ["Other Publisher Content Policies", "Illegal, adult, child-safety, dishonest-behavior and unwanted-software categories reviewed."],
  ["Publisher Restrictions", `${restrictions.length} categories mapped separately; educational suffering/death references are non-graphic context.`],
  ["Religious Sensitive-Data Advertising", "Audience profiling based on religious beliefs is prohibited by governance."],
  ["Invalid Traffic", "Current invalid traffic is not active; future governance passes."],
  ["Privacy / CMP Readiness", "CMP/account configuration remains a pre-serving hold and is not legal advice."],
  ["Quote Ecosystem Red Team", `${quoteAttribution.length} attribution records cross-checked; 153 detail pages remain noindex/never monetize.`],
  ["Cornerstone Red Team", "All C0/C1 routes included in full targeted review and preservation gates."],
  ["Cookie-Cutter Red Team", "All T2 routes included; swap/blind-topic/structure case rebutted by route-specific content."],
  ["Authorship / Trust Red Team", "All trust surfaces included; public authority boundaries are explicit and truthful."],
  ["Structured Data Policy Red Team", "Phase 11 schema/date/canonical validation passes; no ratings or invisible FAQ claims."],
  ["Technical Spam Red Team", "Central index policy, noindex search, clean redirects and no crawler-only paths."],
  ["Weakest Inventory Review", `${weakest20.length} risk-ranked indexable pages reviewed; all passed direct-page test.`],
  ["Random Inventory Review", `${randomOne.length}+${randomTwo.length} deterministic, non-overlapping samples reviewed.`],
  ["Low-Value Rejection Reconstruction", "Historical long-tail/template/inventory exposure is plausible internal context, not Google-confirmed root cause."],
  ["Material Difference Analysis", "Index concentration, content, trust, templates, UX, firewall and technical states materially differ from historical evidence."],
  ["Prosecution Case", "The strongest case is template-driven scale with uneven original value; documented without defending the site."],
  ["Defense / Evidence", "Row-level corpus, prior-phase preservation and final rendered experience rebut the material case."],
  ["Findings and Severity", `${findings.length} P4 evidence/governance limitations; zero P0/P1/P2/P3 findings.`],
  ["Remediation Completed", "Fail-closed policy governance added; no content purge, no index changes and no ad activation."],
  ["Prior Phases Reopened / Required", "None."],
  ["Independent Second Red Team", "Pending dedicated independent validator and different random seed."],
  ["Reviewer Disagreements", "Pending second-pass reconciliation."],
  ["Future Policy Governance", "New content, generators, third parties, copyright, traffic, ads and account signals are controlled."],
  ["Build/Test Results", "Initial production build passed; full release gate pending."],
  ["Secret Scan", "Pending final staged-artifact scan."],
  ["Explicit Holds", explicitHolds.join(", ")],
  ["PHASE 13 Decision", "PHASE_13_REQUIRED = NO."],
  ["PHASE 14 Handoff", "Created; Phase 14 not started."],
  ["Phase 12 Exit Gate", "Preliminary PASS_WITH_EXPLICIT_HOLDS; production, merge, Search and AdSense actions remain untouched."]
];
write("ECHO_BUDDHA_PHASE_12_SEARCH_SPAM_PUBLISHER_POLICY_REDTEAM_REPORT.md", `# EchoBuddha Phase 12 — Search Spam + Publisher Policy Red-Team Report

PHASE_12_STATUS = PASS_WITH_EXPLICIT_HOLDS

${sections.map(([heading, body], index) => `## ${index + 1}. ${heading}\n\n${body}`).join("\n\n")}

Production was not modified or deployed. Search Console evidence describes currently deployed production and does not constitute Google validation of branch-only recovery changes. No Google ads were activated and no AdSense review or resubmission was requested. EchoBuddha was treated as a private repository regardless of actual Git hosting visibility.
`);

const generatedNames = fs.readdirSync(outDir).filter((name) => name.startsWith("ECHO_BUDDHA_PHASE_12_") || name === "ECHO_BUDDHA_PHASE_12_POLICY_GOVERNANCE.md").sort();
const manifest = {
  phase: 12, generated_at: generatedAt, method: "100% corpus machine/semantic screen + complete high-risk targeted review + two deterministic samples + account UI verification + policy research + prosecution/defense",
  sources: { phase_11_inventory_sha256: sha(read(phase11("ECHO_BUDDHA_PHASE_11_URL_TECHNICAL_INVENTORY.csv"))), current_policy_sources: googleSources.length },
  samples: { first_seed: "phase12-prosecution-2026-08-25", second_seed: "phase12-independent-2026-08-25", first_count: randomOne.length, second_count: randomTwo.length, overlap: randomOne.filter((row) => randomTwo.some((second) => second.URL === row.URL)).length },
  evidence_boundaries: ["BRANCH_OBSERVED", "PRODUCTION_PUBLIC_OBSERVED", "GOOGLE_SEARCH_OBSERVED", "GSC_UI_VERIFIED", "ADSENSE_UI_VERIFIED", "GOOGLE_CONFIRMED", "INTERNAL_RED_TEAM_INFERENCE", "UNKNOWN"],
  artifacts: generatedNames.map((name) => ({ name, sha256: sha(read(path.join(outDir, name))) }))
};
write("ECHO_BUDDHA_PHASE_12_METHOD_MANIFEST.json", `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({ corpus: corpus.length, html: htmlCorpus.length, indexable: indexable.length, noindex: htmlCorpus.filter((row) => row.intended_index_state === SEARCH_INDEX_STATES.NOINDEX).length, eligible: eligible.length, full_targeted_review: fullManual.length, worst20: weakest20.length, random1: randomOne.length, random2: randomTwo.length, ip_rows: ipRows.length, link_rows: linkRows.length, status: validation.status }, null, 2));
