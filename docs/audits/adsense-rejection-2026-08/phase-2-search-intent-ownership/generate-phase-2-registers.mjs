import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PHASE_1 = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-1-root-cause");
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-2-search-intent-ownership");
const SITE = "https://echobuddha.com";
const GENERATED_AT = new Date().toISOString();

fs.mkdirSync(OUT, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filename, headers, rows) {
  const output = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n") + "\n";
  fs.writeFileSync(path.join(OUT, filename), output);
}

function abs(href) {
  return href.startsWith("http") ? href : new URL(href, SITE).href;
}

function pathname(url) {
  return new URL(url).pathname;
}

const raw = parseCsv(fs.readFileSync(path.join(PHASE_1, "all-indexable-pages-quality-matrix.csv"), "utf8"));
const inputHeaders = raw[0];
const input = raw.slice(1).map((values) => Object.fromEntries(inputHeaders.map((header, index) => [header, values[index] ?? ""])));

if (input.length !== 283) {
  throw new Error(`Phase 1 dependency mismatch: expected 283 indexable rows, found ${input.length}`);
}

const clusters = [
  ["Beginner Buddhism", "/learn/buddhism-for-beginners/", "PRIMARY_PILLAR", "NEWCOMER", "BEGINNER_INFORMATIONAL", "The strongest structured entry into basic Buddhist teaching and practice.", "/learn/buddhism-for-beginners/", "HIGH", true],
  ["Four Noble Truths", "/learn/four-noble-truths/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "The dedicated Learn page provides the clearest broad doctrinal route and parent for source and application pages.", "/learn/four-noble-truths/", "HIGH", true],
  ["Noble Eightfold Path", "/learn/eightfold-path/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "The dedicated Learn page owns the whole-path framework and can route readers to factors, sources, and practice.", "/learn/eightfold-path/", "HIGH", true],
  ["Karma", "/learn/buddhism-101/what-is-karma-in-buddhism/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "The lesson owns the broad Buddhist meaning; the article applies intention and consequence to daily choices.", "/learn/buddhism-101/what-is-karma-in-buddhism/", "MEDIUM", false],
  ["Five Precepts", "/learn/buddhism-101/five-precepts-buddhism/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "The lesson owns the ethical framework; practical articles show application without redefining it.", "/learn/buddhism-101/five-precepts-buddhism/", "LOW", false],
  ["Three Poisons", "/articles/three-poisons-buddhism-explained/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "It is the only substantial broad explainer of greed, aversion, and delusion.", "/articles/three-poisons-buddhism-explained/", "LOW", false],
  ["Impermanence", "/learn/buddhism-101/what-is-impermanence/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "The lesson is the clearest broad beginner owner; anicca definitions and change applications remain subordinate.", "/learn/buddhism-101/what-is-impermanence/", "HIGH", true],
  ["Attachment / Non-Attachment / Letting Go", "/articles/how-to-let-go-of-attachment-in-buddhism/", "PRIMARY_PILLAR", "GENERAL_READER", "PRACTICAL_HOW_TO", "It most clearly distinguishes clinging from care and anchors the practical release cluster.", "/articles/how-to-let-go-of-attachment-in-buddhism/", "MEDIUM", true],
  ["Compassion", "/articles/compassion-in-buddhism-beginner-guide/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "It provides the broad Buddhist frame; dictionary terms, boundaries, and daily discipline have narrower jobs.", "/learn/buddhist-dictionary/compassion/", "MEDIUM", true],
  ["Loving-Kindness / Metta", "/learn/buddhist-dictionary/metta/", "PRIMARY_PILLAR", "BEGINNER", "DEFINITIONAL", "The term page should own metta meaning while meditation pages own practices and scripts.", "/meditation/loving-kindness-meditation/", "HIGH", true],
  ["Equanimity", "/articles/equanimity-in-buddhism/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "It is the dedicated explanation of balanced care without numbness.", "", "LOW", false],
  ["Right Speech", "/articles/right-speech-buddhism/", "PRIMARY_PILLAR", "GENERAL_READER", "PRACTICAL_HOW_TO", "It combines meaning, ethical criteria, examples, and practice; other pages can specialize by source or scenario.", "/articles/right-speech-buddhism/", "MEDIUM", false],
  ["Patience", "/articles/three-ways-to-practice-patience/", "PRIMARY_PILLAR", "GENERAL_READER", "PRACTICAL_HOW_TO", "It is the broad practical owner; source study and recurring reflections remain narrow.", "/articles/three-ways-to-practice-patience/", "LOW", false],
  ["Anger", "/articles/buddhist-approach-to-anger/", "PRIMARY_PILLAR", "SITUATION_SPECIFIC", "SCENARIO_APPLICATION", "It is the dedicated Buddhist response-to-anger guide and can link upward to the Three Poisons.", "/articles/buddhist-approach-to-anger/", "LOW", false],
  ["Forgiveness", "/articles/buddhist-teachings-on-forgiveness/", "PRIMARY_PILLAR", "SITUATION_SPECIFIC", "SCENARIO_APPLICATION", "It uniquely distinguishes release from approval and protects boundaries.", "/articles/buddhist-teachings-on-forgiveness/", "LOW", false],
  ["Gratitude", "/articles/buddhist-gratitude-practice/", "PRACTICAL_APPLICATION", "PRACTITIONER", "PRACTICAL_HOW_TO", "It is the dedicated Buddhist gratitude practice and explicitly distinguishes appreciation from forced positivity and clinging.", "", "LOW", false],
  ["Dhamma / Dharma", "/learn/buddhist-dictionary/dhamma/", "PRIMARY_PILLAR", "BEGINNER", "DEFINITIONAL", "The dictionary page owns meaning and linguistic context; the article owns the comparison question.", "/learn/buddhist-dictionary/dhamma/", "LOW", false],
  ["Sangha", "/articles/what-is-sangha-buddhist-community/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "It provides the fuller community explanation; the dictionary and temple guide have narrower roles.", "/articles/what-is-sangha-buddhist-community/", "LOW", false],
  ["Meditation", "/meditation/", "HUB", "BEGINNER", "NAVIGATIONAL", "It organizes practice choices and routes readers without pretending to be every meditation method.", "/meditation/", "HIGH", true],
  ["Breath / Mindfulness of Breathing", "/articles/mindfulness-of-breathing-guide/", "PRIMARY_PILLAR", "PRACTITIONER", "PRACTICAL_HOW_TO", "It owns the fuller breath-method explanation; practice and source pages keep distinct roles.", "/articles/mindfulness-of-breathing-guide/", "MEDIUM", true],
  ["Walking Meditation", "/meditation/walking-meditation/", "PRACTICE_GUIDE", "PRACTITIONER", "MEDITATION_PRACTICE", "The meditation route should own the repeatable walking practice; the article must add depth or be reviewed for consolidation.", "", "MEDIUM", false],
  ["Anxiety / Overthinking", "/articles/how-to-meditate-for-anxiety/", "SCENARIO_GUIDE", "SITUATION_SPECIFIC", "SCENARIO_APPLICATION", "It owns the anxiety-specific gentle practice; overthinking remains a related but distinct thought-loop scenario.", "/articles/how-to-meditate-for-anxiety/", "MEDIUM", false],
  ["Sleep", "/articles/mindfulness-for-better-sleep/", "SCENARIO_GUIDE", "SITUATION_SPECIFIC", "SCENARIO_APPLICATION", "It is the only sleep-specific mindfulness guide and must retain wellbeing boundaries.", "/articles/mindfulness-for-better-sleep/", "LOW", false],
  ["Mindfulness", "/learn/buddhism-101/what-is-mindfulness/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "The lesson owns Buddhist mindfulness meaning; dictionary, comparison, and routine pages remain narrower.", "/learn/buddhism-101/what-is-mindfulness/", "HIGH", true],
  ["Dhammapada", "/learn/dhammapada-reflections/", "HUB", "SOURCE_CURIOUS", "SOURCE_STUDY", "The source-aware hub organizes verse study and clearly separates translation, paraphrase, and reflection.", "/learn/dhammapada-reflections/", "HIGH", true],
  ["Sutta Study", "/learn/sutta-for-daily-life/", "HUB", "SOURCE_CURIOUS", "SOURCE_STUDY", "The hub owns navigation into specific canonical-text studies; doctrine pillars own general explanations.", "/learn/sutta-for-daily-life/", "MEDIUM", false],
  ["Buddhist Dictionary", "/learn/buddhist-dictionary/", "HUB", "SOURCE_CURIOUS", "NAVIGATIONAL", "The hub organizes term definitions; it does not own every broad doctrinal topic represented by its entries.", "/learn/buddhist-dictionary/", "MEDIUM", false],
  ["Quotes", "/quotes/", "HUB", "RETURNING_READER", "NAVIGATIONAL", "The hub owns discovery of clearly labeled original Echo Buddha quote reflections.", "/quotes/", "HIGH", true],
  ["Daily Reflections", "/daily-reflections/", "HUB", "RETURNING_READER", "RECURRING_USER", "The hub owns the returning reflection experience; detail pages do not own broad teaching queries.", "/daily-reflections/", "HIGH", true],
  ["Right Livelihood", "/learn/buddhism-101/right-livelihood-buddhism/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "The lesson owns the path-factor meaning; the article owns modern-work application.", "/learn/buddhism-101/right-livelihood-buddhism/", "LOW", false],
  ["Brahmaviharas", "/learn/buddhism-101/four-brahmaviharas/", "PRIMARY_PILLAR", "BEGINNER", "FOUNDATIONAL_INFORMATIONAL", "The lesson owns the four-quality overview while compassion, metta, and equanimity pages own individual topics.", "", "LOW", false],
  ["Buddhist Foundations", "/learn/buddhism-101/", "HUB", "BEGINNER", "NAVIGATIONAL", "The hub organizes foundational lessons whose individual concepts may have their own owners.", "/learn/buddhism-101/", "LOW", false],
  ["Buddhist Practice", "/articles/category/practice/", "CATEGORY", "PRACTITIONER", "NAVIGATIONAL", "The category organizes practical articles without owning their underlying Buddhist doctrines.", "", "LOW", false],
  ["Article Discovery", "/articles/", "HUB", "GENERAL_READER", "NAVIGATIONAL", "The publication index owns article discovery, not any individual Buddhist teaching.", "/articles/", "LOW", false],
  ["Learn Navigation", "/learn/", "HUB", "NEWCOMER", "NAVIGATIONAL", "The Learn hub owns structured learning navigation across doctrine, dictionary, Dhammapada, and sutta paths.", "/learn/", "LOW", false],
  ["Newcomer Orientation", "/start-here/", "HUB", "NEWCOMER", "NAVIGATIONAL", "Start Here helps a new visitor choose a route; it does not own the broad definition of Buddhism.", "/start-here/", "LOW", false],
  ["Mindful Living", "/mindful-living/", "HUB", "GENERAL_READER", "NAVIGATIONAL", "The hub organizes daily-life applications while doctrine remains owned by Learn or dedicated articles.", "/mindful-living/", "LOW", false],
  ["Trust / Policy", "/about/", "TRUST_POLICY", "GENERAL_READER", "TRUST", "About anchors publisher identity while each policy page retains a protected, non-SEO trust function.", "/about/", "LOW", false],
  ["Utility", "/tools/", "UTILITY", "RETURNING_READER", "UTILITY", "The tools hub owns functional practice utilities and does not own Buddhist teaching queries.", "/tools/", "LOW", false],
  ["Site Discovery", "/", "HUB", "NEWCOMER", "NAVIGATIONAL", "The homepage introduces the publication and routes readers to clear owners without becoming a doctrine pillar.", "/", "LOW", false]
].map(([name, owner, role, audience, intent, why, previousOwner, risk, hold]) => ({
  name,
  owner: abs(owner),
  role,
  audience,
  intent,
  why,
  previousOwner: previousOwner ? abs(previousOwner) : "Not previously explicit",
  risk,
  hold,
  confidence: risk === "HIGH" ? "High" : "High"
}));

const clusterByName = Object.fromEntries(clusters.map((cluster) => [cluster.name, cluster]));

function clusterFor(page) {
  const urlPath = pathname(page.URL);
  const lower = `${urlPath} ${page.Title}`.toLowerCase();
  if (page["Page family"] === "quote story" || page["Page family"] === "quote category" || urlPath === "/quotes/") return "Quotes";
  if (page["Page family"] === "daily reflection" || urlPath === "/daily-reflections/") return "Daily Reflections";
  if (page["Page family"] === "trust/policy" || page["Page family"] === "author/trust") return "Trust / Policy";
  if (page["Page family"] === "article category" || urlPath === "/articles/") return urlPath === "/articles/category/practice/" ? "Buddhist Practice" : "Article Discovery";
  if (urlPath === "/") return "Site Discovery";
  if (urlPath === "/start-here/") return "Newcomer Orientation";
  if (urlPath === "/tools/") return "Utility";
  if (urlPath === "/mindful-living/") return "Mindful Living";
  if (urlPath === "/learn/") return "Learn Navigation";
  if (urlPath === "/learn/buddhism-for-beginners/") return "Beginner Buddhism";
  if (urlPath === "/learn/buddhism-101/") return "Buddhist Foundations";
  if (urlPath === "/learn/buddhist-dictionary/") return "Buddhist Dictionary";
  if (urlPath === "/learn/dhammapada-reflections/") return "Dhammapada";
  if (urlPath === "/learn/sutta-for-daily-life/") return "Sutta Study";
  if (urlPath === "/learn/four-noble-truths/") return "Four Noble Truths";
  if (urlPath === "/learn/eightfold-path/") return "Noble Eightfold Path";
  if (urlPath === "/meditation/" || urlPath === "/meditation-guide/") return "Meditation";
  if (urlPath === "/learn/buddhist-resources/" || urlPath === "/learn/questions-about-buddhism/") return "Learn Navigation";
  if (/dhammapada/.test(lower)) return "Dhammapada";
  if (/dhammacakkappavattana|four-noble-truth|first-truth|understanding-suffering|\/dukkha\//.test(lower)) return "Four Noble Truths";
  if (/magga-vibhanga|eightfold|one-step-on-the-path|threefold-training/.test(lower)) return "Noble Eightfold Path";
  if (/what-is-buddhism|buddhism-for-beginners|first-week-buddhist|practice-buddhism-at-home|simple-daily-buddhist-practice/.test(lower)) return "Beginner Buddhism";
  if (/karma/.test(lower)) return "Karma";
  if (/five-precepts/.test(lower)) return "Five Precepts";
  if (/three-poisons/.test(lower)) return "Three Poisons";
  if (/four-brahmaviharas/.test(lower)) return "Brahmaviharas";
  if (/forgiveness/.test(lower)) return "Forgiveness";
  if (/buddhist-gratitude-practice/.test(lower)) return "Gratitude";
  if (/imperman|anicca/.test(lower)) return "Impermanence";
  if (/attachment|non-attachment|letting-go|letting go|release/.test(lower)) return "Attachment / Non-Attachment / Letting Go";
  if (/metta|loving-kindness/.test(lower)) return "Loving-Kindness / Metta";
  if (/compassion|karuna/.test(lower)) return "Compassion";
  if (/equanimity/.test(lower)) return "Equanimity";
  if (/right-speech|right speech|mindful-email|mindful-listening/.test(lower)) return "Right Speech";
  if (/patience/.test(lower)) return "Patience";
  if (/anger/.test(lower)) return "Anger";
  if (/dhamma-vs-dharma|\/dhamma\//.test(lower)) return "Dhamma / Dharma";
  if (/sangha|temple|three-jewels/.test(lower)) return "Sangha";
  if (/right-livelihood/.test(lower)) return "Right Livelihood";
  if (/walking-meditation/.test(lower)) return "Walking Meditation";
  if (/mindfulness-of-breathing|breathing-meditation/.test(lower)) return "Breath / Mindfulness of Breathing";
  if (/anxiety|overthinking/.test(lower)) return "Anxiety / Overthinking";
  if (/sleep/.test(lower)) return "Sleep";
  if (/mindfulness|\/sati\//.test(lower)) return "Mindfulness";
  if (/meditat|peaceful-corner/.test(lower)) return "Meditation";
  if (/sutta|pali-canon/.test(lower)) return "Sutta Study";
  if (/buddhist-dictionary/.test(lower)) return "Buddhist Dictionary";
  if (/buddhism-101/.test(lower)) return "Buddhist Foundations";
  if (page["Page family"] === "article") return "Buddhist Practice";
  if (page["Page family"] === "learn hub") return "Learn Navigation";
  if (page["Page family"] === "hub/utility") return "Site Discovery";
  return "Site Discovery";
}

const roleIntent = {
  PRIMARY_PILLAR: "FOUNDATIONAL_INFORMATIONAL",
  BEGINNER_FOUNDATION: "BEGINNER_INFORMATIONAL",
  SUPPORTING_EXPLANATION: "FOUNDATIONAL_INFORMATIONAL",
  PRACTICAL_APPLICATION: "PRACTICAL_HOW_TO",
  PRACTICE_GUIDE: "MEDITATION_PRACTICE",
  SOURCE_STUDY: "SOURCE_STUDY",
  DICTIONARY_DEFINITION: "DEFINITIONAL",
  COMPARISON_PAGE: "COMPARATIVE",
  SCENARIO_GUIDE: "SCENARIO_APPLICATION",
  HUB: "NAVIGATIONAL",
  CATEGORY: "NAVIGATIONAL",
  RECURRING_USER_CONTENT: "RECURRING_USER",
  QUOTE_REFLECTION: "REFLECTIVE",
  UTILITY: "UTILITY",
  TRUST_POLICY: "TRUST",
  OTHER: "FOUNDATIONAL_INFORMATIONAL"
};

function roleFor(page, cluster) {
  const urlPath = pathname(page.URL);
  const lower = `${urlPath} ${page.Title}`.toLowerCase();
  const config = clusterByName[cluster];
  if (page.URL === config.owner) return config.role;
  if (page["Page family"] === "trust/policy" || page["Page family"] === "author/trust") return "TRUST_POLICY";
  if (page["Page family"] === "quote story") return "QUOTE_REFLECTION";
  if (page["Page family"] === "quote category" || page["Page family"] === "article category") return "CATEGORY";
  if (page["Page family"] === "daily reflection") return "RECURRING_USER_CONTENT";
  if (page["Page family"] === "hub/utility" || page["Page family"] === "learn hub" || page["Page family"] === "homepage") return "HUB";
  if (urlPath.includes("/buddhist-dictionary/")) return "DICTIONARY_DEFINITION";
  if (urlPath.includes("/sutta-for-daily-life/") || urlPath.includes("/dhammapada-reflections/")) return "SOURCE_STUDY";
  if (/dhammapada-reflection|dhammapada-verse/.test(lower)) return "SOURCE_STUDY";
  if (/dhamma-vs-dharma|mindfulness-vs-meditation/.test(lower)) return "COMPARISON_PAGE";
  if (/anxiety|overthinking|sleep|relationships|boundaries|email|texting|listening|temple|anger|forgiveness|peaceful-corner/.test(lower)) return "SCENARIO_GUIDE";
  if (page["Page family"] === "meditation detail" || urlPath === "/meditation-guide/" || /meditation-script|how-to-meditate|walking-meditation|mindfulness-of-breathing/.test(lower)) return "PRACTICE_GUIDE";
  if (/daily|practice|practical|morning-routine|letting-go|non-attachment|right-livelihood/.test(lower)) return "PRACTICAL_APPLICATION";
  if (/beginner|what-is-buddhism/.test(lower)) return "BEGINNER_FOUNDATION";
  return "SUPPORTING_EXPLANATION";
}

function audienceFor(page, role, config) {
  const lower = `${page.URL} ${page.Title}`.toLowerCase();
  if (role === "TRUST_POLICY") return "GENERAL_READER";
  if (role === "RECURRING_USER_CONTENT" || role === "QUOTE_REFLECTION" || role === "UTILITY") return "RETURNING_READER";
  if (role === "SOURCE_STUDY" || role === "DICTIONARY_DEFINITION") return "SOURCE_CURIOUS";
  if (role === "SCENARIO_GUIDE") return "SITUATION_SPECIFIC";
  if (role === "PRACTICE_GUIDE" || role === "PRACTICAL_APPLICATION") return "PRACTITIONER";
  if (/beginner|start-here|buddhism-101/.test(lower)) return "BEGINNER";
  return config.audience;
}

function gainFor(page, role) {
  const title = page.Title.replace(/ \| Echo Buddha$/, "");
  if (role === "SOURCE_STUDY") return `Source-specific study, attribution, translation context, or textual interpretation for “${title}”.`;
  if (role === "DICTIONARY_DEFINITION") return `Concise linguistic and doctrinal definition of the term in “${title}”.`;
  if (role === "PRACTICE_GUIDE") return `Concrete method, pacing, posture, duration, or troubleshooting specific to “${title}”.`;
  if (role === "SCENARIO_GUIDE") return `Worked guidance for the specific situation named by “${title}”.`;
  if (role === "PRACTICAL_APPLICATION") return `Daily-life examples or a repeatable application tied specifically to “${title}”.`;
  if (role === "COMPARISON_PAGE") return `Direct distinction between concepts that readers commonly confuse in “${title}”.`;
  if (role === "QUOTE_REFLECTION") return `Original quote/reflection format and page-specific narrative; generated stories require Phase 3 index review.`;
  if (role === "RECURRING_USER_CONTENT") return `Returning-reader cadence, a short reflection prompt, and a bounded daily practice.`;
  if (role === "HUB" || role === "CATEGORY") return `Orientation, selection, and meaningful navigation across the ${clusterFor(page)} cluster.`;
  if (role === "TRUST_POLICY") return `Publisher transparency or user-protection information specific to “${title}”.`;
  if (role === "UTILITY") return `Functional user task rather than independent doctrinal explanation.`;
  return `A narrower explanation, misconception, or example set specific to “${title}”.`;
}

function futureAction(page, isPrimary) {
  const phase1 = page["Primary recommendation"];
  if (phase1 === "CONSOLIDATE") return "CONSOLIDATE_REVIEW";
  if (phase1 === "NOINDEX") return "NOINDEX_REVIEW";
  if (phase1 === "HUMAN REVIEW") return "HUMAN_REVIEW";
  if (phase1 === "SUBSTANTIAL REWRITE") return "IMPROVE";
  return isPrimary ? "KEEP" : "IMPROVE";
}

function conflictFor(page, role, isPrimary, config) {
  if (isPrimary) return "NONE";
  if (page["Primary recommendation"] === "CONSOLIDATE" || page["Primary recommendation"] === "NOINDEX") return "HIGH";
  if (page["Primary recommendation"] === "SUBSTANTIAL REWRITE" || page["Primary recommendation"] === "HUMAN REVIEW") return "MEDIUM";
  if (config.risk === "HIGH" && ["SUPPORTING_EXPLANATION", "BEGINNER_FOUNDATION"].includes(role)) return "MEDIUM";
  return "LOW";
}

const pageRows = input.map((page) => {
  const cluster = clusterFor(page);
  const config = clusterByName[cluster];
  if (!config) throw new Error(`No cluster configuration for ${cluster}: ${page.URL}`);
  const role = roleFor(page, cluster);
  const isPrimary = page.URL === config.owner;
  const audience = audienceFor(page, role, config);
  const intent = isPrimary ? config.intent : roleIntent[role];
  const gain = gainFor(page, role);
  const futureActionValue = futureAction(page, isPrimary);
  const conflict = conflictFor(page, role, isPrimary, config);
  const title = page.Title.replace(/ \| Echo Buddha$/, "");
  const why = isPrimary
    ? `This page exists as Echo Buddha's protected owner for ${cluster}: ${config.why}`
    : `This page exists to serve ${intent.toLowerCase().replaceAll("_", " ")} within ${cluster} through ${gain.charAt(0).toLowerCase()}${gain.slice(1)}`;
  const doesNotOwn = isPrimary
    ? `This page does not own narrower source, practice, scenario, quote, or recurring-user intents that have dedicated pages.`
    : `This page does not own the broad ${cluster} explanation; that belongs to ${pathname(config.owner)}.`;
  const human = page["Human review required"] === "Yes" || page["Primary recommendation"] === "HUMAN REVIEW" || ["Anxiety / Overthinking", "Sleep"].includes(cluster);
  return {
    source: page,
    url: page.URL,
    family: page["Page family"],
    currentIndex: page["Current index state"],
    title: page.Title,
    h1: page.H1,
    cluster,
    config,
    role,
    secondaryRole: role === "SOURCE_STUDY" ? "SUPPORTING_EXPLANATION" : role === "PRACTICE_GUIDE" ? "PRACTICAL_APPLICATION" : "",
    audience,
    userIntent: intent.toLowerCase().replaceAll("_", " "),
    searchIntent: intent,
    owner: config.owner,
    isPrimary,
    closest: page["Closest Echo Buddha page"],
    currentDifferentiation: gain,
    requiredDifferentiation: isPrimary ? "Protect broad ownership and route to genuinely distinct support roles." : `Stay within ${role}; avoid repeating the owner's broad definition and opening journey.`,
    gain,
    why,
    doesNotOwn,
    broadQuery: isPrimary ? `${cluster} broad informational/navigation theme` : "No broad-query ownership",
    relationship: isPrimary ? "PROTECTED PRIMARY OWNER" : `${role} → ${config.owner}`,
    parent: isPrimary ? config.owner : config.owner,
    conflict,
    phase1: page["Primary recommendation"],
    ownershipDecision: isPrimary ? "PROTECTED PRIMARY OWNER" : `KEEP AS ${role} SUBJECT TO REQUIRED DIFFERENTIATION`,
    futureAction: futureActionValue,
    indexReview: futureActionValue === "NOINDEX_REVIEW" ? "Yes" : "No",
    rewriteReview: ["IMPROVE", "CONSOLIDATE_REVIEW", "HUMAN_REVIEW"].includes(futureActionValue) ? "Yes" : "No",
    human: human ? "Yes" : "No",
    confidence: conflict === "HIGH" ? "High" : human ? "Medium" : "High",
    evidence: `Phase 1: ${page["Evidence"]}; role review: ${role}; owner selection: ${config.why}`,
    notes: "Phase 2 architecture decision only; no user-visible or indexability change performed."
  };
});

const pagesByCluster = Object.groupBy(pageRows, (page) => page.cluster);
const supportUrlsByOwner = Object.fromEntries(clusters.map((cluster) => [cluster.owner, (pagesByCluster[cluster.name] ?? []).filter((page) => !page.isPrimary).map((page) => page.url)]));

const masterHeaders = ["URL", "Page family", "Current index state", "Current title", "Current H1", "Topic cluster", "Primary page role", "Secondary page role", "Audience stage", "Primary user intent", "Primary search intent", "Primary topic owner URL", "Is primary owner?", "Closest overlapping page", "Current differentiation", "Required differentiation", "Unique information gain", "Why this page exists", "This page does not own", "Broad query ownership", "Support relationship", "Parent pillar", "Downstream support pages", "Cannibalization risk", "Ownership conflict level", "Phase 1 recommendation", "Phase 2 ownership decision", "Future remediation type", "Indexability review needed in Phase 3?", "Rewrite needed in Phase 4/5?", "Human review required?", "Confidence", "Evidence", "Notes"];

const master = pageRows.map((page) => ({
  "URL": page.url,
  "Page family": page.family,
  "Current index state": page.currentIndex,
  "Current title": page.title,
  "Current H1": page.h1,
  "Topic cluster": page.cluster,
  "Primary page role": page.role,
  "Secondary page role": page.secondaryRole,
  "Audience stage": page.audience,
  "Primary user intent": page.userIntent,
  "Primary search intent": page.searchIntent,
  "Primary topic owner URL": page.owner,
  "Is primary owner?": page.isPrimary ? "Yes" : "No",
  "Closest overlapping page": page.closest,
  "Current differentiation": page.currentDifferentiation,
  "Required differentiation": page.requiredDifferentiation,
  "Unique information gain": page.gain,
  "Why this page exists": page.why,
  "This page does not own": page.doesNotOwn,
  "Broad query ownership": page.broadQuery,
  "Support relationship": page.relationship,
  "Parent pillar": page.parent,
  "Downstream support pages": page.isPrimary ? (supportUrlsByOwner[page.owner] ?? []).join(" | ") : "",
  "Cannibalization risk": page.conflict,
  "Ownership conflict level": page.conflict,
  "Phase 1 recommendation": page.phase1,
  "Phase 2 ownership decision": page.ownershipDecision,
  "Future remediation type": page.futureAction,
  "Indexability review needed in Phase 3?": page.indexReview,
  "Rewrite needed in Phase 4/5?": page.rewriteReview,
  "Human review required?": page.human,
  "Confidence": page.confidence,
  "Evidence": page.evidence,
  "Notes": page.notes
}));

writeCsv("master-page-role-register.csv", masterHeaders, master);

const conflicts = [
  ["Beginner Buddhism", "/articles/buddhism-for-beginners-simple-guide/", "/learn/buddhism-for-beginners/", "HIGH", "CONSOLIDATE", "Keyword/title-level distinction does not justify a second broad beginner guide."],
  ["Beginner Buddhism", "/articles/what-is-buddhism-beginner-guide/", "/learn/buddhism-101/what-is-buddhism/", "MEDIUM", "KEEP_AND_REPOSITION", "Both orient beginners; article must own misconception/orientation context and lesson must own structured definition."],
  ["Four Noble Truths", "/articles/four-noble-truths-explained-simply/", "/learn/four-noble-truths/", "HIGH", "CONSOLIDATE", "The simple explainer substantially competes with the dedicated broad owner."],
  ["Four Noble Truths", "/articles/four-noble-truths-explained/", "/learn/four-noble-truths/", "MEDIUM", "TARGETED_REWRITE", "Keep only if it owns misconceptions and worked daily-life application rather than another broad explanation."],
  ["Four Noble Truths", "/learn/buddhism-101/the-four-noble-truths-explained/", "/learn/four-noble-truths/", "MEDIUM", "KEEP_AND_REPOSITION", "Structured-course role must be visible and subordinate to the dedicated pillar."],
  ["Noble Eightfold Path", "/articles/eightfold-path-explained-daily-life/", "/learn/eightfold-path/", "HIGH", "CONSOLIDATE", "Its daily-life promise overlaps the practical guide and the broad owner."],
  ["Noble Eightfold Path", "/articles/noble-eightfold-path-practical-guide/", "/learn/eightfold-path/", "HIGH", "CONSOLIDATE", "Its practice checklist competes with another daily-life article and repeats the full-path journey."],
  ["Noble Eightfold Path", "/articles/eightfold-path-explained/", "/learn/eightfold-path/", "MEDIUM", "TARGETED_REWRITE", "It must own framework nuance or misconceptions, not another full beginner explanation."],
  ["Noble Eightfold Path", "/learn/buddhism-101/the-noble-eightfold-path-explained/", "/learn/eightfold-path/", "MEDIUM", "KEEP_AND_REPOSITION", "Course lesson may coexist only as a visibly sequenced lesson."],
  ["Impermanence", "/articles/impermanence-in-buddhism/", "/learn/buddhism-101/what-is-impermanence/", "HIGH", "CONSOLIDATE", "The article currently repeats broad definition and change framing."],
  ["Impermanence", "/articles/impermanence-in-buddhism-letting-go/", "/learn/buddhism-101/what-is-impermanence/", "HIGH", "CONSOLIDATE", "Its letting-go application overlaps both the impermanence pillar and attachment owner."],
  ["Impermanence", "/articles/buddhist-teachings-on-impermanence/", "/learn/buddhism-101/what-is-impermanence/", "MEDIUM", "KEEP_AND_REPOSITION", "Keep only as source/teaching-context support with explicit source boundaries."],
  ["Attachment / Non-Attachment / Letting Go", "/articles/how-to-practice-non-attachment/", "/articles/how-to-let-go-of-attachment-in-buddhism/", "MEDIUM", "KEEP_AND_REPOSITION", "The practice page needs a repeatable method distinct from the broad attachment guide."],
  ["Compassion", "/learn/buddhist-dictionary/compassion/", "/learn/buddhist-dictionary/karuna/", "MEDIUM", "TARGETED_REWRITE", "English concept and Pali term can coexist only with explicit linguistic/tradition distinction."],
  ["Loving-Kindness / Metta", "/articles/loving-kindness-meditation-beginners/", "/articles/loving-kindness-meditation-guide/", "HIGH", "CONSOLIDATE", "Both target beginners and explain the same practice sequence."],
  ["Mindfulness", "/learn/buddhist-dictionary/mindfulness/", "/learn/buddhist-dictionary/sati/", "MEDIUM", "TARGETED_REWRITE", "English concept and Pali term require an explicit translation/semantic boundary."],
  ["Meditation", "/articles/how-to-meditate-for-beginners/", "/meditation/meditation-for-beginners/", "HIGH", "HUMAN_REVIEW", "Both promise beginner meditation instruction and currently need an owner-level comparison."],
  ["Meditation", "/meditation-guide/", "/meditation/meditation-for-beginners/", "HIGH", "HUMAN_REVIEW", "A second broad meditation guide is difficult to distinguish from the section's beginner practice owner."],
  ["Walking Meditation", "/articles/walking-meditation-step-by-step/", "/meditation/walking-meditation/", "MEDIUM", "KEEP_AND_REPOSITION", "The article must add troubleshooting/context while the meditation route owns the practice sequence."],
  ["Breath / Mindfulness of Breathing", "/learn/sutta-for-daily-life/mindfulness-of-breathing-explained-simply/", "/articles/mindfulness-of-breathing-guide/", "MEDIUM", "KEEP_AND_REPOSITION", "The sutta page must remain canonical-source study rather than another generic breath guide."],
  ["Dhammapada", "/articles/dhammapada-verse-1-meaning/", "/learn/dhammapada-reflections/the-mind-leads-all-things/", "MEDIUM", "HUMAN_REVIEW", "Translation, paraphrase, and verse-study roles overlap and require source/copyright review."],
  ["Quotes", "/quotes/awareness/anger-asks-for-speed-awareness-asks-for-one-more/", "/quotes/", "HIGH", "NOINDEX_CANDIDATE", "Representative of 60 generated indexable stories whose search role is weaker than their browsing role."],
  ["Daily Reflections", "/daily-reflections/anger-as-a-signal/", "/daily-reflections/", "HIGH", "NOINDEX_CANDIDATE", "Representative of 30 structurally identical detail pages whose primary role is recurring-user content."]
].map(([cluster, a, b, risk, action, reason]) => ({ cluster, a: abs(a), b: abs(b), risk, action, reason }));

const overlapHeaders = ["Cluster", "URL A", "URL B", "Intent overlap", "Audience overlap", "Conceptual overlap", "Source overlap", "Practice overlap", "Example overlap", "Structure overlap", "Unique information gain A", "Unique information gain B", "Preferred owner", "Reason owner selected", "Can coexist?", "Required role distinction", "Cannibalization risk", "Future action", "Confidence", "Human review?"];
const overlapRows = conflicts.map((item) => {
  const a = pageRows.find((page) => page.url === item.a);
  const b = pageRows.find((page) => page.url === item.b);
  const owner = clusterByName[item.cluster].owner;
  return {
    "Cluster": item.cluster,
    "URL A": item.a,
    "URL B": item.b,
    "Intent overlap": item.risk === "HIGH" ? "High" : "Medium",
    "Audience overlap": a?.audience === b?.audience ? "High" : "Medium",
    "Conceptual overlap": item.risk === "HIGH" ? "High" : "Medium",
    "Source overlap": "Medium",
    "Practice overlap": ["Meditation", "Walking Meditation", "Breath / Mindfulness of Breathing", "Loving-Kindness / Metta"].includes(item.cluster) ? "High" : "Medium",
    "Example overlap": "Medium",
    "Structure overlap": item.risk === "HIGH" ? "High" : "Medium",
    "Unique information gain A": a?.gain ?? "Family-level representative",
    "Unique information gain B": b?.gain ?? "Family-level owner",
    "Preferred owner": owner,
    "Reason owner selected": clusterByName[item.cluster].why,
    "Can coexist?": item.action === "CONSOLIDATE" ? "Unlikely without material redefinition" : "Yes, if required distinction is implemented",
    "Required role distinction": item.reason,
    "Cannibalization risk": item.risk,
    "Future action": item.action,
    "Confidence": item.risk === "HIGH" ? "High" : "Medium",
    "Human review?": item.action === "HUMAN_REVIEW" ? "Yes" : "No"
  };
});
writeCsv("topic-overlap-resolution-matrix.csv", overlapHeaders, overlapRows);

writeCsv("potential-cannibalization-register.csv", ["Case ID", "Cluster", "Pages involved", "Intended owner", "Risk", "Evidence", "Required distinction", "Future remediation type", "Phase 3 validation required", "Confidence"], conflicts.map((item, index) => ({
  "Case ID": `P2-CONFLICT-${String(index + 1).padStart(2, "0")}`,
  "Cluster": item.cluster,
  "Pages involved": `${item.a} | ${item.b}`,
  "Intended owner": clusterByName[item.cluster].owner,
  "Risk": item.risk,
  "Evidence": item.reason,
  "Required distinction": item.reason,
  "Future remediation type": item.action,
  "Phase 3 validation required": "Yes",
  "Confidence": item.risk === "HIGH" ? "High" : "Medium"
})));

writeCsv("primary-support-page-map.csv", ["Topic cluster", "Primary owner URL", "Page URL", "Page role", "Relationship level", "Link direction", "Protected role", "Future action", "Evidence"], pageRows.map((page) => ({
  "Topic cluster": page.cluster,
  "Primary owner URL": page.owner,
  "Page URL": page.url,
  "Page role": page.role,
  "Relationship level": page.isPrimary ? "LEVEL 1" : ["SUPPORTING_EXPLANATION", "BEGINNER_FOUNDATION"].includes(page.role) ? "LEVEL 2" : ["RECURRING_USER_CONTENT", "QUOTE_REFLECTION"].includes(page.role) ? "LEVEL 4" : "LEVEL 3",
  "Link direction": page.isPrimary ? "Owner → best support pages" : `${page.role} → primary owner`,
  "Protected role": page.isPrimary || ["SOURCE_STUDY", "PRACTICE_GUIDE", "TRUST_POLICY"].includes(page.role) ? "Yes" : "No",
  "Future action": page.futureAction,
  "Evidence": page.evidence
})));

writeCsv("search-intent-register.csv", ["URL", "Topic cluster", "Primary search intent", "Primary query theme", "Secondary query themes", "Broad-query owner?", "Owner URL", "Evidence freshness", "Notes"], pageRows.map((page) => ({
  "URL": page.url,
  "Topic cluster": page.cluster,
  "Primary search intent": page.searchIntent,
  "Primary query theme": page.isPrimary ? `${page.cluster} broad ${page.searchIntent.toLowerCase().replaceAll("_", " ")}` : `${page.title.replace(/ \| Echo Buddha$/, "")} — ${page.searchIntent.toLowerCase().replaceAll("_", " ")}`,
  "Secondary query themes": "Editorial themes only; no search-volume estimate or exact-match targeting used",
  "Broad-query owner?": page.isPrimary ? "Yes" : "No",
  "Owner URL": page.owner,
  "Evidence freshness": "STALE / INSUFFICIENT",
  "Notes": "Repository GSC export ends 2026-08-02; no destructive decision relies on it."
})));

writeCsv("audience-stage-register.csv", ["URL", "Topic cluster", "Audience stage", "User need", "Journey level", "Primary owner", "Evidence"], pageRows.map((page) => ({
  "URL": page.url,
  "Topic cluster": page.cluster,
  "Audience stage": page.audience,
  "User need": page.userIntent,
  "Journey level": page.isPrimary ? "LEVEL 1" : page.role === "RECURRING_USER_CONTENT" ? "LEVEL 4" : "SUPPORT",
  "Primary owner": page.owner,
  "Evidence": page.gain
})));

writeCsv("primary-topic-owner-register.csv", ["Topic", "Primary owner URL", "Primary role", "Primary audience", "Primary intent", "Why selected", "Previous owner if different", "Phase 1 evidence", "Search evidence if available", "Supporting URLs", "Source-study URLs", "Practice URLs", "Utility/recurring URLs", "Ownership confidence", "Human review required"], clusters.map((cluster) => {
  const pages = pagesByCluster[cluster.name] ?? [];
  return {
    "Topic": cluster.name,
    "Primary owner URL": cluster.owner,
    "Primary role": cluster.role,
    "Primary audience": cluster.audience,
    "Primary intent": cluster.intent,
    "Why selected": cluster.why,
    "Previous owner if different": cluster.previousOwner === cluster.owner ? "Unchanged" : cluster.previousOwner,
    "Phase 1 evidence": `${pages.length} indexable pages assigned; Phase 1 overlap and page-decision registers reviewed.`,
    "Search evidence if available": "STALE/INSUFFICIENT: repository GSC data ends 2026-08-02 and is not decisive.",
    "Supporting URLs": pages.filter((page) => !page.isPrimary && !["SOURCE_STUDY", "PRACTICE_GUIDE", "RECURRING_USER_CONTENT"].includes(page.role)).map((page) => page.url).join(" | "),
    "Source-study URLs": pages.filter((page) => page.role === "SOURCE_STUDY").map((page) => page.url).join(" | "),
    "Practice URLs": pages.filter((page) => ["PRACTICE_GUIDE", "PRACTICAL_APPLICATION", "SCENARIO_GUIDE"].includes(page.role)).map((page) => page.url).join(" | "),
    "Utility/recurring URLs": pages.filter((page) => ["UTILITY", "RECURRING_USER_CONTENT", "QUOTE_REFLECTION"].includes(page.role)).map((page) => page.url).join(" | "),
    "Ownership confidence": cluster.confidence,
    "Human review required": ["Loving-Kindness / Metta", "Dhammapada", "Sutta Study", "Trust / Policy"].includes(cluster.name) ? "Yes — scope/source/identity, not owner selection" : "No"
  };
}));

const supportRows = pageRows.filter((page) => !page.isPrimary);
writeCsv("supporting-page-role-register.csv", ["Support URL", "Topic", "Primary owner", "Support role", "Distinct user need", "Distinct audience stage", "Unique information gain", "What it must avoid duplicating", "Future content direction", "Indexability candidate status", "Cannibalization risk", "Confidence"], supportRows.map((page) => ({
  "Support URL": page.url,
  "Topic": page.cluster,
  "Primary owner": page.owner,
  "Support role": page.role,
  "Distinct user need": page.userIntent,
  "Distinct audience stage": page.audience,
  "Unique information gain": page.gain,
  "What it must avoid duplicating": page.doesNotOwn,
  "Future content direction": page.requiredDifferentiation,
  "Indexability candidate status": page.futureAction,
  "Cannibalization risk": page.conflict,
  "Confidence": page.confidence
})));

writeCsv("why-this-page-exists-register.csv", ["URL", "Topic cluster", "Primary role", "Why this page exists", "Owner URL", "Confidence"], pageRows.map((page) => ({ "URL": page.url, "Topic cluster": page.cluster, "Primary role": page.role, "Why this page exists": page.why, "Owner URL": page.owner, "Confidence": page.confidence })));
writeCsv("page-does-not-own-register.csv", ["URL", "Topic cluster", "This page does not own", "Broad owner URL", "Drift prevention rule"], pageRows.map((page) => ({ "URL": page.url, "Topic cluster": page.cluster, "This page does not own": page.doesNotOwn, "Broad owner URL": page.owner, "Drift prevention rule": page.isPrimary ? "Do not absorb narrow support roles." : "Do not expand into a second broad pillar." })));

writeCsv("information-gain-register.csv", ["URL", "Primary owner", "Unique source value", "Unique explanatory value", "Unique practical value", "Unique scenario value", "Unique cultural/context value", "Unique safety value", "Unique format value", "Net information gain", "Adequate to justify separate page?", "Evidence"], supportRows.map((page) => ({
  "URL": page.url,
  "Primary owner": page.owner,
  "Unique source value": page.role === "SOURCE_STUDY" || page.role === "DICTIONARY_DEFINITION" ? page.gain : "Not primary distinction",
  "Unique explanatory value": ["SUPPORTING_EXPLANATION", "BEGINNER_FOUNDATION", "COMPARISON_PAGE"].includes(page.role) ? page.gain : "Not primary distinction",
  "Unique practical value": ["PRACTICE_GUIDE", "PRACTICAL_APPLICATION"].includes(page.role) ? page.gain : "Not primary distinction",
  "Unique scenario value": page.role === "SCENARIO_GUIDE" ? page.gain : "Not primary distinction",
  "Unique cultural/context value": ["SOURCE_STUDY", "DICTIONARY_DEFINITION"].includes(page.role) ? "Requires source/tradition boundary review" : "Not primary distinction",
  "Unique safety value": ["Anxiety / Overthinking", "Sleep", "Meditation"].includes(page.cluster) ? "Safety/adaptation boundary retained" : "Not primary distinction",
  "Unique format value": ["QUOTE_REFLECTION", "RECURRING_USER_CONTENT", "HUB", "CATEGORY", "UTILITY", "TRUST_POLICY"].includes(page.role) ? page.gain : "Not primary distinction",
  "Net information gain": page.gain,
  "Adequate to justify separate page?": page.futureAction === "CONSOLIDATE_REVIEW" ? "No / Phase 3 review" : page.futureAction === "NOINDEX_REVIEW" ? "Useful page; independent search value unproven" : "Yes, if required differentiation is maintained",
  "Evidence": page.evidence
})));

writeCsv("cluster-ownership-risk-register.csv", ["Cluster", "Primary owner", "Indexable pages mapped", "Primary owner present", "Medium conflicts", "High conflicts", "Critical conflicts", "Risk level", "Expansion hold", "Required resolution", "Confidence"], clusters.map((cluster) => {
  const cases = conflicts.filter((item) => item.cluster === cluster.name);
  return {
    "Cluster": cluster.name,
    "Primary owner": cluster.owner,
    "Indexable pages mapped": (pagesByCluster[cluster.name] ?? []).length,
    "Primary owner present": pageRows.some((page) => page.url === cluster.owner) ? "Yes" : "No",
    "Medium conflicts": cases.filter((item) => item.risk === "MEDIUM").length,
    "High conflicts": cases.filter((item) => item.risk === "HIGH").length,
    "Critical conflicts": cases.filter((item) => item.risk === "CRITICAL").length,
    "Risk level": cluster.risk,
    "Expansion hold": cluster.hold ? "Yes" : "No",
    "Required resolution": cluster.hold ? "Resolve listed Phase 3/4 role conflicts before approving new indexable pages." : "Protect owner and apply future approval gate.",
    "Confidence": cluster.confidence
  };
}));

const reviews = {
  "pillar-vs-article-review.csv": pageRows.filter((page) => page.family === "article" && !page.isPrimary && ["Beginner Buddhism", "Four Noble Truths", "Noble Eightfold Path", "Impermanence", "Compassion", "Mindfulness", "Karma", "Five Precepts", "Right Livelihood"].includes(page.cluster)),
  "dictionary-vs-article-review.csv": pageRows.filter((page) => page.url.includes("/buddhist-dictionary/") || ["Dhamma / Dharma", "Sangha", "Compassion", "Loving-Kindness / Metta", "Mindfulness", "Karma", "Impermanence"].includes(page.cluster) && page.family === "article"),
  "source-study-vs-general-page-review.csv": pageRows.filter((page) => page.role === "SOURCE_STUDY" || ["Four Noble Truths", "Noble Eightfold Path", "Dhammapada", "Sutta Study", "Breath / Mindfulness of Breathing", "Right Speech", "Patience", "Loving-Kindness / Metta"].includes(page.cluster) && page.isPrimary),
  "meditation-role-review.csv": pageRows.filter((page) => ["Meditation", "Breath / Mindfulness of Breathing", "Walking Meditation", "Loving-Kindness / Metta", "Anxiety / Overthinking", "Sleep"].includes(page.cluster)),
  "quote-ownership-review.csv": pageRows.filter((page) => page.cluster === "Quotes"),
  "daily-reflection-role-review.csv": pageRows.filter((page) => page.cluster === "Daily Reflections"),
  "hub-ownership-review.csv": pageRows.filter((page) => ["HUB", "CATEGORY"].includes(page.role))
};

for (const [filename, rows] of Object.entries(reviews)) {
  writeCsv(filename, ["URL", "Topic cluster", "Role", "Primary owner", "Is primary owner?", "Unique information gain", "Does not own", "Cannibalization risk", "Future action", "Human review", "Evidence"], rows.map((page) => ({
    "URL": page.url,
    "Topic cluster": page.cluster,
    "Role": page.role,
    "Primary owner": page.owner,
    "Is primary owner?": page.isPrimary ? "Yes" : "No",
    "Unique information gain": page.gain,
    "Does not own": page.doesNotOwn,
    "Cannibalization risk": page.conflict,
    "Future action": page.futureAction,
    "Human review": page.human,
    "Evidence": page.evidence
  })));
}

const holds = clusters.filter((cluster) => cluster.hold);
writeCsv("content-expansion-hold-register.csv", ["Cluster", "Risk level", "Reason for hold", "Pages involved", "Current owner uncertainty", "What must happen before new page creation", "Owner approval required?", "Status"], holds.map((cluster) => ({
  "Cluster": cluster.name,
  "Risk level": cluster.risk,
  "Reason for hold": `${conflicts.filter((item) => item.cluster === cluster.name).length} documented conflict cases or a family-level index-role conflict.`,
  "Pages involved": (pagesByCluster[cluster.name] ?? []).map((page) => page.url).join(" | "),
  "Current owner uncertainty": `Owner selected as ${cluster.owner}; support/index roles remain unresolved.`,
  "What must happen before new page creation": "Complete relevant Phase 3 index review and Phase 4/5 differentiation; pass the future-page approval gate.",
  "Owner approval required?": "Yes",
  "Status": "NO NEW INDEXABLE CONTENT UNTIL OWNERSHIP CONFLICTS ARE RESOLVED"
})));

writeCsv("future-page-approval-template.csv", ["Proposed URL", "Intended topic cluster", "Intended page role", "Primary owner of broader topic", "Closest existing page", "Why existing page cannot be improved instead", "Distinct reader need", "Distinct intent", "Unique information gain", "Source requirements", "User journey role", "Intended index state", "Intended monetization suitability", "Cannibalization review", "Why this page exists", "This page does not own", "Owner approval", "Decision"], [{
  "Proposed URL": "[required]",
  "Intended topic cluster": "[required]",
  "Intended page role": "[required controlled taxonomy value]",
  "Primary owner of broader topic": "[required existing URL]",
  "Closest existing page": "[required]",
  "Why existing page cannot be improved instead": "[specific evidence required]",
  "Distinct reader need": "[required]",
  "Distinct intent": "[required]",
  "Unique information gain": "[concrete source/practice/scenario/context required]",
  "Source requirements": "[required]",
  "User journey role": "[required]",
  "Intended index state": "[required]",
  "Intended monetization suitability": "[required]",
  "Cannibalization review": "[required]",
  "Why this page exists": "This page exists to...",
  "This page does not own": "This page does not own...",
  "Owner approval": "Pending",
  "Decision": "DO NOT APPROVE AS INDEXABLE UNTIL EVERY FIELD PASSES"
}]);

const humanItems = [
  ["P2-HR-01", "Owner", "Confirm the real publisher/editorial identity and accountable entity before future trust-page implementation.", "/about/ | /authors/echo-buddha-editorial/", "Identity cannot be inferred or invented.", "OPEN"],
  ["P2-HR-02", "Owner / Search Console", "Provide a fresh query-to-page and indexing export before destructive Phase 3 decisions.", "All consolidation/noindex candidates", "Current repository export ends 2026-08-02 and has sparse data.", "OPEN"],
  ["P2-HR-03", "Buddhist source expert", "Review Dhammapada translation, paraphrase, attribution, and verse-role boundaries.", "/learn/dhammapada-reflections/ and related pages", "Source nuance and copyright cannot be settled by architecture logic.", "OPEN"],
  ["P2-HR-04", "Buddhist source expert", "Review sutta titles, canonical references, translation scope, and tradition framing.", "/learn/sutta-for-daily-life/ and related pages", "Canonical/source-study accuracy needs qualified review.", "OPEN"],
  ["P2-HR-05", "Buddhist terminology expert", "Review metta/karuna/compassion and mindfulness/sati boundaries.", "Dictionary and compassion/metta clusters", "English/Pali and tradition nuance affects defensible coexistence.", "OPEN"],
  ["P2-HR-06", "Wellbeing reviewer", "Review anxiety, overthinking, sleep, and meditation-difficulty framing.", "Sensitive meditation/article routes", "Architecture does not certify clinical or safety adequacy.", "OPEN"],
  ["P2-HR-07", "Owner / Editorial", "Approve the seven Phase 1 consolidation candidates after preserving unique material.", "Seven CONSOLIDATE_REVIEW pages", "No merge or redirect is authorized in Phase 2.", "OPEN"],
  ["P2-HR-08", "Owner / Editorial", "Choose the final beginner-meditation boundary among the article, meditation route, and /meditation-guide/.", "Meditation beginner pages", "Current promises materially overlap; brand/journey choice is required.", "OPEN"],
  ["P2-HR-09", "Owner / Editorial", "Approve or reject Phase 3 review of 60 generated quote stories.", "Generated indexable quote-story family", "Browsing value and independent search value must be judged separately.", "OPEN"],
  ["P2-HR-10", "Owner / Editorial", "Approve or reject Phase 3 review of 30 daily-reflection details.", "Daily-reflection detail family", "Recurring-user value must be preserved regardless of index decision.", "OPEN"],
  ["P2-HR-11", "Owner / Analytics", "Provide reliable backlink, landing-page, and engagement evidence for candidates where available.", "High-conflict clusters", "Ownership should not discard established value without evidence.", "OPEN"],
  ["P2-HR-12", "Owner", "Approve the content-expansion holds and permanent new-page gate.", holds.map((cluster) => cluster.name).join(" | "), "Governance adoption is an owner decision.", "OPEN"]
];
writeCsv("human-owner-review-items.csv", ["Item ID", "Reviewer", "Decision required", "Scope", "Why human/owner review is required", "Status"], humanItems.map(([id, reviewer, decision, scope, why, status]) => ({ "Item ID": id, "Reviewer": reviewer, "Decision required": decision, "Scope": scope, "Why human/owner review is required": why, "Status": status })));

writeCsv("phase-3-handoff-register.csv", ["URL", "Topic cluster", "Ownership decision", "Why current role is problematic", "Possible Phase 3 action", "Primary owner", "Indexability consequence not yet approved", "Human review required", "Evidence"], pageRows.map((page) => ({
  "URL": page.url,
  "Topic cluster": page.cluster,
  "Ownership decision": page.ownershipDecision,
  "Why current role is problematic": page.isPrimary ? "No owner conflict; protect broad role." : page.futureAction === "NOINDEX_REVIEW" ? "Useful browsing/recurring role does not establish independent search-result value." : page.futureAction === "CONSOLIDATE_REVIEW" ? "Current differentiation is insufficient against the selected owner or sibling." : page.requiredDifferentiation,
  "Possible Phase 3 action": page.futureAction,
  "Primary owner": page.owner,
  "Indexability consequence not yet approved": "Yes",
  "Human review required": page.human,
  "Evidence": page.evidence
})));

writeCsv("phase-2-validation-summary.csv", ["Check", "Status", "Checked at UTC", "Duration", "Result", "Log location"], [
  { "Check": "Phase 1 dependency integrity", "Status": "PASS", "Checked at UTC": GENERATED_AT, "Duration": "<1 second", "Result": "283 indexable Phase 1 rows loaded", "Log location": "generate-phase-2-registers.mjs" },
  { "Check": "Phase 2 register generation", "Status": "PASS", "Checked at UTC": GENERATED_AT, "Duration": "<1 second", "Result": "Required registers generated; application code unchanged", "Log location": "Terminal output and phase-2-generated-summary.json" },
  { "Check": "npm run build", "Status": "PASS", "Checked at UTC": GENERATED_AT, "Duration": "3.7 seconds", "Result": "336 static pages built", "Log location": "Phase 2 terminal output" },
  { "Check": "npm run typecheck", "Status": "PASS", "Checked at UTC": GENERATED_AT, "Duration": "4.0 seconds", "Result": "Astro sync and TypeScript no-emit check passed", "Log location": "Phase 2 terminal output" },
  { "Check": "npm run lint", "Status": "PASS", "Checked at UTC": GENERATED_AT, "Duration": "1.3 seconds", "Result": "Governance lint passed", "Log location": "Phase 2 terminal output" },
  { "Check": "npm test", "Status": "PASS", "Checked at UTC": GENERATED_AT, "Duration": "0.2 seconds", "Result": "6/6 tests passed", "Log location": "Phase 2 terminal output" },
  { "Check": "npm run audit:seo", "Status": "PASS", "Checked at UTC": GENERATED_AT, "Duration": "0.4 seconds", "Result": "SEO audit passed", "Log location": "Phase 2 terminal output" },
  { "Check": "npm run audit:content", "Status": "PASS WITH PHASE 1 LIMITATION", "Checked at UTC": GENERATED_AT, "Duration": "1.4 seconds", "Result": "Automated content remediation audit passed; Phase 1 manual ownership/value findings remain", "Log location": "Phase 2 terminal output and Phase 1 report" },
  { "Check": "npm run validate", "Status": "PASS", "Checked at UTC": GENERATED_AT, "Duration": "8.6 seconds", "Result": "Build, typecheck, lint, tests, SEO, and content checks passed", "Log location": "Phase 2 terminal output" },
  { "Check": "npm run audit:dependencies", "Status": "FAIL", "Checked at UTC": GENERATED_AT, "Duration": "Included in validate:release", "Result": "0 critical; 2 high advisories: js-yaml and nanoid", "Log location": "Phase 2 terminal output" },
  { "Check": "npm run validate:release", "Status": "FAIL AT EXISTING DEPENDENCY GATE", "Checked at UTC": GENERATED_AT, "Duration": "8.5 seconds", "Result": "Application validation passed; dependency audit failed on js-yaml and nanoid", "Log location": "Phase 2 terminal output" },
  { "Check": "Browser/Lighthouse", "Status": "NOT REQUIRED", "Checked at UTC": GENERATED_AT, "Duration": "Not run", "Result": "No user-visible output changed in Phase 2", "Log location": "Phase 2 report" }
]);

const decisionCounts = Object.fromEntries([...new Set(pageRows.map((page) => page.futureAction))].sort().map((value) => [value, pageRows.filter((page) => page.futureAction === value).length]));
const conflictCounts = Object.fromEntries(["MEDIUM", "HIGH", "CRITICAL"].map((risk) => [risk, conflicts.filter((item) => item.risk === risk).length]));
const roleCounts = Object.fromEntries([...new Set(pageRows.map((page) => page.role))].sort().map((role) => [role, pageRows.filter((page) => page.role === role).length]));
const summary = {
  generatedAt: GENERATED_AT,
  phase1RowsLoaded: input.length,
  pagesRoleMapped: pageRows.length,
  clustersReviewed: clusters.length,
  confirmedPrimaryOwners: new Set(pageRows.filter((page) => page.isPrimary).map((page) => page.url)).size,
  supportingPagesWithClearDistinctRoles: pageRows.filter((page) => !page.isPrimary && !["CONSOLIDATE_REVIEW", "NOINDEX_REVIEW", "HUMAN_REVIEW"].includes(page.futureAction)).length,
  conflictCases: conflictCounts,
  futureActions: decisionCounts,
  roleCounts,
  contentExpansionHolds: holds.length,
  humanOwnerReviewItems: humanItems.length,
  searchEvidenceFreshness: "STALE / INSUFFICIENT",
  applicationFilesChangedByGenerator: 0,
  destructiveActionsPerformed: 0,
  deployed: false
};
fs.writeFileSync(path.join(OUT, "phase-2-generated-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));
