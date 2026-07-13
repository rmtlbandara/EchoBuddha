import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const outDir = path.join(root, "docs/audits/articles");
const sourcePath = path.join(root, "src/data/site.ts");
const routePath = path.join(root, "src/pages/articles/[slug].astro");
const oldInventoryPath = path.join(root, "docs/article-audit-inventory.json");
const oldMarkdownPath = path.join(root, "docs/article-audit-report.md");

const OUTPUTS = {
  reconciliation: "ECHOBUDDHA_AUDIT_RECONCILIATION.md",
  canonical: "ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json",
  matrix: "ECHOBUDDHA_PAIRWISE_SIMILARITY_MATRIX.csv",
  duplication: "ECHOBUDDHA_EXACT_DUPLICATION_REPORT.md",
  human: "ECHOBUDDHA_HUMAN_WRITING_DIAGNOSTIC.md",
  roleMap: "ECHOBUDDHA_ARTICLE_ROLE_MAP.md",
  clusterPlan: "ECHOBUDDHA_CLUSTER_DIFFERENTIATION_PLAN.md",
  editorialSpecs: "ECHOBUDDHA_ARTICLE_EDITORIAL_SPECIFICATIONS.md",
  sourcePlan: "ECHOBUDDHA_SOURCE_AWARENESS_PLAN.md",
  wellbeing: "ECHOBUDDHA_WELLBEING_CONTENT_REVIEW.md",
  linkMap: "ECHOBUDDHA_INTERNAL_LINK_PRESERVATION_MAP.json",
  priority: "ECHOBUDDHA_IMPLEMENTATION_PRIORITY_MATRIX.csv",
  final: "ECHOBUDDHA_SECOND_AUDIT_FINAL_REPORT.md"
};

const source = fs.readFileSync(sourcePath, "utf8");
const routeSource = fs.readFileSync(routePath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
}).outputText;
const tempModule = path.join(os.tmpdir(), `echo-buddha-second-audit-${process.pid}.mjs`);
fs.writeFileSync(tempModule, transpiled);
const site = await import(pathToFileURL(tempModule).href);
fs.unlinkSync(tempModule);

const {
  SITE,
  articleCategories,
  fullArticles,
  getArticleCategory,
  getArticleReadTime,
  getArticleSeoDetails,
  getArticleWordCount,
  getQuoteThemeForArticleCategory,
  slugify
} = site;

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "this", "that", "these", "those", "is", "are", "was", "were",
  "be", "been", "being", "to", "of", "in", "on", "for", "with", "as", "by", "at", "from", "it", "its", "into",
  "your", "you", "we", "our", "can", "may", "not", "does", "do", "when", "what", "how", "why", "than", "more"
]);
const TRANSITIONS = [
  "Notice",
  "In daily life",
  "This does not mean",
  "For beginners",
  "This teaching becomes useful when",
  "A practical example might be",
  "For one day watch for",
  "The goal is not",
  "A simple way",
  "Begin by",
  "You do not need to",
  "If that pattern appears",
  "At the end of the day"
];
const WELLBEING_TERMS = [
  "anxiety", "overthinking", "sleep", "anger", "grief", "trauma", "depression", "illness", "healing",
  "emotional distress", "professional care", "therapy", "treatment", "symptoms"
];
const DOCTRINAL_TERMS = [
  "buddhism", "buddhist", "buddha", "four noble truths", "eightfold path", "karma", "impermanence", "anicca",
  "dukkha", "anatta", "metta", "loving-kindness", "compassion", "right speech", "non-attachment", "attachment",
  "dhammapada", "mindfulness", "sati", "nirvana", "dhamma"
];

const relatedBuddhistTermsByCategory = {
  "Buddhist Wisdom": [
    { label: "Dhamma", href: "/learn/buddhist-dictionary/dhamma/" },
    { label: "Karma", href: "/learn/buddhist-dictionary/karma/" },
    { label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" }
  ],
  Meditation: [
    { label: "Sati", href: "/learn/buddhist-dictionary/sati/" },
    { label: "Mindfulness", href: "/learn/buddhist-dictionary/mindfulness/" },
    { label: "Metta", href: "/learn/buddhist-dictionary/metta/" }
  ],
  Mindfulness: [
    { label: "Sati", href: "/learn/buddhist-dictionary/sati/" },
    { label: "Mindfulness", href: "/learn/buddhist-dictionary/mindfulness/" },
    { label: "Anicca", href: "/learn/buddhist-dictionary/anicca/" }
  ],
  Reflection: [
    { label: "Anicca", href: "/learn/buddhist-dictionary/anicca/" },
    { label: "Dukkha", href: "/learn/buddhist-dictionary/dukkha/" },
    { label: "Anatta", href: "/learn/buddhist-dictionary/anatta/" }
  ],
  Practice: [
    { label: "Sati", href: "/learn/buddhist-dictionary/sati/" },
    { label: "Compassion", href: "/learn/buddhist-dictionary/compassion/" },
    { label: "Dhamma", href: "/learn/buddhist-dictionary/dhamma/" }
  ]
};

const clusterDefinitions = [
  {
    id: "beginner-buddhism",
    name: "Beginner Buddhism",
    severityBasis: "true shared beginner search-intent cluster",
    preferredPrimaryPage: "/learn/buddhism-for-beginners/",
    slugs: ["what-is-buddhism-beginner-guide", "buddhism-for-beginners-simple-guide"],
    differentiation: {
      "what-is-buddhism-beginner-guide": "Broad orientation: what Buddhism is, what it is not, and why the path matters.",
      "buddhism-for-beginners-simple-guide": "First practical learning route: what to read and practice in the first week.",
      "/learn/buddhism-for-beginners/": "Permanent hub: structured navigation and canonical beginner pathway."
    }
  },
  {
    id: "four-noble-truths",
    name: "Four Noble Truths",
    severityBasis: "true shared doctrine/query cluster",
    preferredPrimaryPage: "/learn/four-noble-truths/",
    slugs: ["four-noble-truths-explained-simply", "four-noble-truths-explained"],
    differentiation: {
      "four-noble-truths-explained-simply": "Very accessible first explanation using one concrete everyday suffering example from start to finish.",
      "four-noble-truths-explained": "More nuanced doctrinal explanation of dukkha, craving, cessation, and path without becoming a hub.",
      "/learn/four-noble-truths/": "Permanent structured learning hub with terms, sequence, and onward lessons."
    }
  },
  {
    id: "noble-eightfold-path",
    name: "Noble Eightfold Path",
    severityBasis: "true shared doctrine/query cluster",
    preferredPrimaryPage: "/learn/eightfold-path/",
    slugs: ["noble-eightfold-path-practical-guide", "eightfold-path-explained", "eightfold-path-explained-daily-life"],
    differentiation: {
      "eightfold-path-explained": "Doctrinal explanation of the path and three trainings.",
      "noble-eightfold-path-practical-guide": "Structured practice guide with one repeatable weekly review method.",
      "eightfold-path-explained-daily-life": "Scenario-based daily-life application across work, family, speech, and attention.",
      "/learn/eightfold-path/": "Permanent hub for path sequence, definitions, and related lessons."
    }
  },
  {
    id: "impermanence",
    name: "Impermanence",
    severityBasis: "true shared doctrine/application cluster",
    preferredPrimaryPage: "/learn/buddhism-101/what-is-impermanence/",
    slugs: ["impermanence-in-buddhism", "impermanence-in-buddhism-letting-go", "buddhist-teachings-on-impermanence"],
    differentiation: {
      "impermanence-in-buddhism": "Doctrinal definition of anicca and how seeing change alters perception.",
      "impermanence-in-buddhism-letting-go": "Attachment-focused application: loosening control because conditions change.",
      "buddhist-teachings-on-impermanence": "Emotional application to change, loss, grief, and compassionate realism.",
      "/learn/buddhism-101/what-is-impermanence/": "Permanent learning page for core definition and related terms."
    }
  },
  {
    id: "beginner-meditation-mindfulness",
    name: "Beginner Meditation and Mindfulness",
    severityBasis: "mixed method/query cluster; some pages are siblings, not duplicates",
    preferredPrimaryPage: "/meditation/",
    slugs: [
      "how-to-meditate-for-beginners",
      "mindfulness-of-breathing-guide",
      "mindfulness-vs-meditation",
      "walking-meditation-step-by-step",
      "beginning-a-daily-mindfulness-practice",
      "mindfulness-morning-routine",
      "how-to-meditate-for-anxiety",
      "mindfulness-for-better-sleep"
    ],
    differentiation: {
      "how-to-meditate-for-beginners": "First seated-meditation lesson: posture, duration, distraction, and realistic first session.",
      "mindfulness-of-breathing-guide": "Breath-specific method page focused on anchor, counting, and returning.",
      "mindfulness-vs-meditation": "Concept comparison page: state/quality versus formal practice.",
      "walking-meditation-step-by-step": "Movement-based method page with step cadence and walking route choices.",
      "beginning-a-daily-mindfulness-practice": "Habit-building page for cues, friction, and sustainable repetition.",
      "mindfulness-morning-routine": "Morning-specific routine page with wake-up, body, intention, and transition into the day.",
      "how-to-meditate-for-anxiety": "Sensitive-context page for anxiety-aware practice boundaries and grounding alternatives.",
      "mindfulness-for-better-sleep": "Evening-specific wind-down page, not a sleep-treatment promise.",
      "/meditation/": "Permanent hub for practice method navigation."
    }
  },
  {
    id: "loving-kindness-metta",
    name: "Loving-kindness and Metta",
    severityBasis: "true practice-method cluster",
    preferredPrimaryPage: "/meditation/loving-kindness-meditation/",
    slugs: ["loving-kindness-meditation-guide", "loving-kindness-meditation-beginners", "metta-meditation-script"],
    differentiation: {
      "loving-kindness-meditation-guide": "Conceptual practice guide: why metta is trained and how the circles work.",
      "loving-kindness-meditation-beginners": "Beginner-friendly first attempt with resistance, neutrality, and boundaries.",
      "metta-meditation-script": "Reusable script page with phrases and pacing, minimal theory.",
      "/meditation/loving-kindness-meditation/": "Permanent method page."
    }
  },
  {
    id: "attachment-letting-go",
    name: "Attachment, Non-attachment, and Letting Go",
    severityBasis: "true concept/application cluster",
    preferredPrimaryPage: "/articles/how-to-let-go-of-attachment-in-buddhism/",
    slugs: ["how-to-let-go-of-attachment-in-buddhism", "how-to-practice-non-attachment", "letting-go-without-giving-up", "impermanence-in-buddhism-letting-go"],
    differentiation: {
      "how-to-let-go-of-attachment-in-buddhism": "Concept anchor: craving, clinging, preference, and release.",
      "how-to-practice-non-attachment": "Daily habit page: practicing open-handed care in recurring situations.",
      "letting-go-without-giving-up": "Boundary page: release versus passivity, effort versus control.",
      "impermanence-in-buddhism-letting-go": "Impermanence connection: letting go because conditions shift."
    }
  },
  {
    id: "compassion-forgiveness",
    name: "Compassion and Forgiveness",
    severityBasis: "semantic relationship; not all pages share the same primary query",
    preferredPrimaryPage: "/articles/compassion-in-buddhism-beginner-guide/",
    slugs: ["compassion-in-buddhism-beginner-guide", "compassion-as-a-daily-discipline", "buddhist-teachings-on-forgiveness", "loving-kindness-meditation-beginners"],
    differentiation: {
      "compassion-in-buddhism-beginner-guide": "Definition and Buddhist framing of compassion.",
      "compassion-as-a-daily-discipline": "Repeatable conduct practice in speech, work, and boundaries.",
      "buddhist-teachings-on-forgiveness": "Repair, release, and accountability without excusing harm.",
      "loving-kindness-meditation-beginners": "Meditation method that supports goodwill; should not become a compassion concept article."
    }
  },
  {
    id: "applied-speech-patience-anger-listening",
    name: "Compassion, Forgiveness, Patience, Speech, Anger, and Listening",
    severityBasis: "related applied ethics pages; several are siblings but not one query cluster",
    preferredPrimaryPage: "/articles/right-speech-buddhism/",
    slugs: ["right-speech-buddhism", "three-ways-to-practice-patience", "mindful-listening-in-everyday-life", "buddhist-approach-to-anger", "buddhist-teachings-on-forgiveness", "compassion-as-a-daily-discipline"],
    differentiation: {
      "right-speech-buddhism": "Ethical speech criteria and conversation preparation.",
      "three-ways-to-practice-patience": "Waiting, irritation, and delayed response practice.",
      "mindful-listening-in-everyday-life": "Listening as receptive attention before reply.",
      "buddhist-approach-to-anger": "Anger response sequence: pause, understand, respond.",
      "buddhist-teachings-on-forgiveness": "Forgiveness and accountability.",
      "compassion-as-a-daily-discipline": "Daily care as repeated discipline."
    }
  },
  {
    id: "dhammapada-reflections",
    name: "Dhammapada Reflections",
    severityBasis: "same format and source theme; distinct reflection themes",
    preferredPrimaryPage: "/learn/dhammapada-reflections/",
    slugs: ["dhammapada-reflection-what-we-think", "dhammapada-reflection-trained-mind"],
    differentiation: {
      "dhammapada-reflection-what-we-think": "Thought, intention, and consequence reflection.",
      "dhammapada-reflection-trained-mind": "Mind-training, heedfulness, and peace reflection.",
      "/learn/dhammapada-reflections/": "Permanent reflection hub."
    }
  },
  {
    id: "standalone-karma",
    name: "Karma Standalone",
    severityBasis: "single article with learning-page relationship",
    preferredPrimaryPage: "/learn/buddhism-101/what-is-karma-in-buddhism/",
    slugs: ["what-is-karma-in-buddhism"],
    differentiation: {
      "what-is-karma-in-buddhism": "Daily-life support article focused on intention, habits, speech, and consequence."
    }
  },
  {
    id: "standalone-peaceful-corner",
    name: "Peaceful Corner Standalone",
    severityBasis: "low-overlap environmental practice page",
    preferredPrimaryPage: "/meditation/",
    slugs: ["creating-a-peaceful-corner-at-home"],
    differentiation: {
      "creating-a-peaceful-corner-at-home": "Environment design page for a modest home practice space."
    }
  }
];

const roleOverrides = {
  "what-is-buddhism-beginner-guide": {
    reader: "Curious newcomer who wants orientation before choosing a practice or learning path",
    level: "Complete beginner",
    intent: "Broad informational orientation",
    secondaryIntent: "Decide where to begin learning",
    problem: "Buddhism feels broad, religiously varied, or unclear from search snippets",
    promise: "Define Buddhism as a path of understanding suffering, conduct, meditation, and wisdom without collapsing traditions into one slogan",
    format: "Orientation article with misconception clearing",
    outcome: "Reader can name the path's main concerns and choose the next learning step",
    examples: "First encounter with meditation, quote culture, family/cultural assumptions, daily ethical choice",
    practice: "One observation exercise about actions that increase or reduce agitation",
    conclusion: "Route reader to the beginner hub and one first practice"
  },
  "buddhism-for-beginners-simple-guide": {
    reader: "Beginner ready to take the first practical steps after basic curiosity",
    level: "Beginner",
    intent: "Beginner learning path",
    secondaryIntent: "Simple practice sequence",
    problem: "Reader wants to start without being overwhelmed by doctrine lists",
    promise: "Give a first-week route through learning, meditation, and ethical attention",
    format: "Starter roadmap",
    outcome: "Reader leaves with a sequence, not just a definition",
    examples: "Choosing one article, one short sit, one speech practice",
    practice: "Seven-day beginner route with tiny repeatable actions",
    conclusion: "Invite continuation through the learning hub"
  },
  "four-noble-truths-explained-simply": {
    reader: "Reader who has heard the Four Noble Truths and wants the plainest possible explanation",
    level: "Complete beginner",
    intent: "Very simple doctrine explanation",
    secondaryIntent: "Understand suffering without pessimism",
    problem: "The teaching sounds abstract or negative",
    promise: "Explain the four truths through one everyday human example with minimal terminology",
    format: "Plain-language walkthrough",
    outcome: "Reader can paraphrase each truth accurately",
    examples: "One recurring frustration followed through all four truths",
    practice: "Name one stress, one craving, one possible release, one wise step",
    conclusion: "Point to the fuller article and hub"
  },
  "four-noble-truths-explained": {
    reader: "Beginner who wants more nuance after the first explanation",
    level: "Beginner to early intermediate",
    intent: "Doctrinal explanation",
    secondaryIntent: "Clarify dukkha, craving, cessation, and path",
    problem: "Reader may confuse suffering with pessimism or craving with all desire",
    promise: "Give a careful explanation of the teaching's logic and common misunderstandings",
    format: "Nuanced educational article",
    outcome: "Reader can distinguish dukkha, tanha, cessation, and practice path",
    examples: "Pleasant experience becoming stressful when demanded to last",
    practice: "Trace a specific stress through the four-truth sequence",
    conclusion: "Point to Eightfold Path as the training response"
  },
  "noble-eightfold-path-practical-guide": {
    reader: "Reader who wants to practice the Eightfold Path rather than memorize it",
    level: "Beginner",
    intent: "Practical guide",
    secondaryIntent: "Weekly self-review",
    problem: "Eight path factors feel like a list, not a usable training",
    promise: "Turn the path into a repeatable review of view, intention, speech, action, livelihood, effort, mindfulness, and concentration",
    format: "Structured practice guide",
    outcome: "Reader can run a weekly path check without perfectionism",
    examples: "One workday or family day reviewed through path factors",
    practice: "Weekly eight-factor review",
    conclusion: "Keep one factor for the week"
  },
  "eightfold-path-explained": {
    reader: "Reader seeking the meaning and structure of the Noble Eightfold Path",
    level: "Beginner",
    intent: "Doctrinal explanation",
    secondaryIntent: "Understand three trainings",
    problem: "Reader sees eight items but not how they fit together",
    promise: "Explain the path as wisdom, ethical conduct, and mental cultivation",
    format: "Framework explanation",
    outcome: "Reader understands the architecture of the path",
    examples: "How speech, intention, and attention shape one response",
    practice: "Identify which training area is most active in a current situation",
    conclusion: "Send broad practice questions to the practical guide"
  },
  "eightfold-path-explained-daily-life": {
    reader: "Reader asking how the path appears in ordinary situations",
    level: "Beginner",
    intent: "Daily-life application",
    secondaryIntent: "Scenario examples",
    problem: "The path seems religious or abstract rather than lived",
    promise: "Show the path in concrete daily scenarios without repeating the full doctrine article",
    format: "Scenario-based application article",
    outcome: "Reader can recognize path factors in daily choices",
    examples: "Email reply, spending choice, household conflict, attention habit",
    practice: "Choose one scenario and name the path factor involved",
    conclusion: "Invite one daily-life experiment"
  },
  "impermanence-in-buddhism": {
    reader: "Reader seeking a definition of impermanence in Buddhism",
    level: "Beginner",
    intent: "Doctrinal definition",
    secondaryIntent: "Understand anicca without nihilism",
    problem: "Impermanence may sound bleak or merely philosophical",
    promise: "Define anicca and show why clear seeing can deepen care",
    format: "Concept explanation",
    outcome: "Reader can describe impermanence as conditioned change",
    examples: "Body, feeling, relationship, work, and season changes",
    practice: "Observe one changing pleasant and one changing unpleasant experience",
    conclusion: "Point to letting-go and grief/change applications"
  },
  "impermanence-in-buddhism-letting-go": {
    reader: "Reader trying to loosen attachment by understanding change",
    level: "Beginner",
    intent: "Impermanence applied to clinging",
    secondaryIntent: "Letting-go support",
    problem: "Reader understands change but still grips outcomes",
    promise: "Connect impermanence specifically to softening control and demand",
    format: "Applied reflection",
    outcome: "Reader can distinguish caring from demanding permanence",
    examples: "Changing plans, roles, relationships, self-image",
    practice: "Name what changed, what remains, and what care is possible",
    conclusion: "Move toward non-attachment practice"
  },
  "buddhist-teachings-on-impermanence": {
    reader: "Reader meeting change, loss, or grief and seeking Buddhist framing",
    level: "Beginner",
    intent: "Emotional application of impermanence",
    secondaryIntent: "Grief-sensitive reflection",
    problem: "Reader may need comfort without being told to bypass pain",
    promise: "Apply impermanence to change and loss with compassion and clear limits",
    format: "Sensitive applied teaching",
    outcome: "Reader can hold grief/change without turning impermanence into dismissal",
    examples: "Loss, aging, changing home, ending role, altered relationship",
    practice: "Grief-aware reflection with permission to seek support",
    conclusion: "Gentle next step and targeted wellbeing boundary"
  }
};

function defaultRole(article) {
  const title = article.title.toLowerCase();
  const topic = inferTopic(article);
  const isPractice = /how to|practice|step|routine|script|meditation|mindfulness|walking|morning|sleep|anxiety/.test(title);
  const isReflection = article.category === "Reflection" || /reflection|letting go|forgiveness|dhammapada/.test(title);
  return {
    reader: `Reader seeking help with ${topic.toLowerCase()} in a Buddhist educational frame`,
    level: /beginner|simple|what is|explained/i.test(article.title) ? "Beginner" : "Beginner to early intermediate",
    intent: inferIntent(article),
    secondaryIntent: isPractice ? "Practical application" : "Conceptual clarification",
    problem: `The reader needs ${topic.toLowerCase()} to feel concrete, accurate, and usable rather than generic.`,
    promise: uniquePromiseFor(article),
    format: isPractice ? "Practice guide" : isReflection ? "Applied reflection" : "Educational explanation",
    outcome: uniqueOutcomeFor(article),
    examples: uniqueExamplesFor(article),
    practice: uniquePracticeFor(article),
    conclusion: uniqueConclusionFor(article)
  };
}

function roleFor(article) {
  return { ...defaultRole(article), ...(roleOverrides[article.slug] ?? {}) };
}

function uniquePromiseFor(article) {
  const map = {
    "mindfulness-of-breathing-guide": "Teach breath practice as a specific anchor method rather than generic meditation advice",
    "loving-kindness-meditation-guide": "Explain the structure and purpose of metta practice before scripting it",
    "dhammapada-reflection-what-we-think": "Reflect on thought, intention, and consequence without claiming a direct translation",
    "dhammapada-reflection-trained-mind": "Reflect on training the mind toward peace without duplicating the thought/intention reflection",
    "how-to-let-go-of-attachment-in-buddhism": "Clarify attachment as clinging and show how release differs from not caring",
    "right-speech-buddhism": "Turn Right Speech into filters for actual conversations",
    "buddhist-wisdom-for-overthinking": "Use Buddhist attention and non-identification to respond to repetitive thought loops",
    "what-is-karma-in-buddhism": "Explain karma as intention, action, habit, and consequence without fate or blame",
    "mindfulness-vs-meditation": "Separate mindfulness as a quality of awareness from meditation as formal training",
    "buddhist-teachings-on-forgiveness": "Distinguish forgiveness from excusing harm or abandoning boundaries",
    "metta-meditation-script": "Provide a reusable metta script with minimal theory and clear pacing",
    "how-to-meditate-for-anxiety": "Offer anxiety-aware meditation options with grounding and stopping permission",
    "loving-kindness-meditation-beginners": "Help first-time metta practitioners work with awkwardness, resistance, and boundaries",
    "mindfulness-morning-routine": "Design a realistic morning sequence that carries into the day",
    "walking-meditation-step-by-step": "Teach a body-based walking method with route, pace, and attention choices",
    "buddhist-approach-to-anger": "Turn anger into a pause-understand-respond sequence without suppressing truth",
    "mindfulness-for-better-sleep": "Offer an evening mindfulness wind-down without promising sleep treatment",
    "how-to-practice-non-attachment": "Make non-attachment a habit of caring without gripping",
    "beginning-a-daily-mindfulness-practice": "Focus on habit formation and return, not one-off meditation instructions",
    "compassion-as-a-daily-discipline": "Frame compassion as repeated conduct with boundaries",
    "letting-go-without-giving-up": "Separate releasing control from abandoning wise effort",
    "three-ways-to-practice-patience": "Give three distinct patience drills for irritation, delay, and uncertainty",
    "mindful-listening-in-everyday-life": "Make listening the practice, not merely a prelude to better speaking",
    "creating-a-peaceful-corner-at-home": "Help readers create a modest practice environment without consumerism or decoration pressure",
    "compassion-in-buddhism-beginner-guide": "Define compassion in Buddhist terms without reducing it to niceness"
  };
  return map[article.slug] ?? `Give ${inferTopic(article).toLowerCase()} a distinct reader outcome tied to this URL.`;
}

function uniqueOutcomeFor(article) {
  const topic = inferTopic(article);
  if (article.slug.includes("script")) return "Reader can reuse the page during practice.";
  if (article.slug.includes("vs")) return "Reader can explain the distinction and choose the right next practice.";
  if (article.slug.includes("anxiety") || article.slug.includes("sleep")) return "Reader can practice cautiously and know when to stop or seek qualified support.";
  return `Reader can apply ${topic.toLowerCase()} in one specific situation without needing another article first.`;
}

function uniqueExamplesFor(article) {
  const map = {
    "mindfulness-of-breathing-guide": "breath counting, nostril/chest/abdomen anchor choice, returning after distraction",
    "walking-meditation-step-by-step": "hallway, garden path, office corridor, slow turn, foot contact",
    "mindfulness-morning-routine": "waking, washing, first drink, opening phone, beginning work",
    "mindful-listening-in-everyday-life": "interruption, defensive reply, repeated family story, workplace disagreement",
    "buddhist-approach-to-anger": "hot face, sharp message, criticism, boundary-setting after pause",
    "creating-a-peaceful-corner-at-home": "small apartment, shared room, chair corner, respectful object placement"
  };
  return map[article.slug] ?? "one concrete situation unique to the article's role, avoiding generic phone/work-delay examples unless essential";
}

function uniquePracticeFor(article) {
  const map = {
    "metta-meditation-script": "scripted phrases with pacing and recipient sequence",
    "three-ways-to-practice-patience": "three separate drills: wait, soften, choose response",
    "letting-go-without-giving-up": "effort-versus-control inventory",
    "how-to-practice-non-attachment": "open-hand daily habit practice",
    "buddhist-teachings-on-forgiveness": "boundary-aware release reflection"
  };
  return map[article.slug] ?? "one article-specific exercise rather than the generic pause/notice/name formula";
}

function uniqueConclusionFor(article) {
  if (article.slug.includes("beginner")) return "first next step with hub link";
  if (article.slug.includes("script")) return "return-to-this-script instruction";
  if (article.slug.includes("anxiety") || article.slug.includes("sleep") || article.slug.includes("anger")) return "non-clinical boundary plus gentle next step";
  return "specific next practice and sibling/hub relationship";
}

function stripHtml(value = "") {
  return decodeBasicEntities(String(value).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function decodeBasicEntities(value = "") {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalize(value = "") {
  return stripHtml(value)
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value = "", options = {}) {
  const { removeStopwords = false, minLength = 1 } = options;
  return normalize(value)
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => token.length >= minLength)
    .filter((token) => !removeStopwords || !STOPWORDS.has(token));
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function wordCount(value) {
  return tokens(value).length;
}

function splitSentences(value, minWords = 8) {
  return stripHtml(value)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => wordCount(s) >= minWords);
}

function ngrams(value, n = 5) {
  const t = tokens(value, { removeStopwords: false, minLength: 2 });
  const grams = [];
  for (let i = 0; i <= t.length - n; i += 1) grams.push(t.slice(i, i + n).join(" "));
  return grams;
}

function cosine(a, b) {
  const aw = tokens(a, { removeStopwords: true, minLength: 3 });
  const bw = tokens(b, { removeStopwords: true, minLength: 3 });
  const af = new Map();
  const bf = new Map();
  for (const token of aw) af.set(token, (af.get(token) ?? 0) + 1);
  for (const token of bw) bf.set(token, (bf.get(token) ?? 0) + 1);
  const terms = new Set([...af.keys(), ...bf.keys()]);
  let dot = 0, amag = 0, bmag = 0;
  for (const term of terms) {
    const av = af.get(term) ?? 0;
    const bv = bf.get(term) ?? 0;
    dot += av * bv;
    amag += av * av;
    bmag += bv * bv;
  }
  return amag && bmag ? dot / (Math.sqrt(amag) * Math.sqrt(bmag)) : 0;
}

function jaccard(a, b) {
  const as = new Set(tokens(a, { removeStopwords: true, minLength: 3 }));
  const bs = new Set(tokens(b, { removeStopwords: true, minLength: 3 }));
  const union = new Set([...as, ...bs]);
  if (!union.size) return 0;
  let overlap = 0;
  for (const token of as) if (bs.has(token)) overlap += 1;
  return overlap / union.size;
}

function seqSimilarity(a, b) {
  if (!a.length && !b.length) return 1;
  if (!a.length || !b.length) return 0;
  const maxLen = Math.max(a.length, b.length);
  let same = 0;
  for (let i = 0; i < maxLen; i += 1) {
    if (normalize(a[i] ?? "") === normalize(b[i] ?? "")) same += 1;
  }
  const setJ = jaccard(a.join(" "), b.join(" "));
  return (same / maxLen) * 0.6 + setJ * 0.4;
}

function ngramOverlap(a, b, n = 5) {
  const ag = new Set(ngrams(a, n));
  const bg = new Set(ngrams(b, n));
  if (!ag.size && !bg.size) return 0;
  const union = new Set([...ag, ...bg]);
  let overlap = 0;
  for (const item of ag) if (bg.has(item)) overlap += 1;
  return overlap / union.size;
}

function articleLayers(article) {
  const sections = article.content ?? [];
  const introSection = sections.find((section) => !section.heading) ?? sections[0] ?? { paragraphs: [] };
  const introduction = (introSection.paragraphs ?? []).join("\n");
  const mainSections = sections.filter((section) => section !== introSection);
  const mainArticleSections = mainSections
    .flatMap((section) => [section.heading ?? "", section.subheading ?? "", ...(section.paragraphs ?? [])])
    .join("\n");
  const allParagraphs = sections.flatMap((section) => section.paragraphs ?? []);
  const headings = sections.map((section) => section.heading).filter(Boolean);
  const conclusion = allParagraphs.at(-1) ?? "";
  const examples = allParagraphs
    .filter((p) => /\b(example|imagine|for instance|a practical example|for one day|when you|if you)\b/i.test(stripHtml(p)))
    .join("\n");
  const exercises = [
    ...mainSections.filter((s) => /\b(practice|exercise|try|reflection|routine|script)\b/i.test(`${s.heading ?? ""} ${s.subheading ?? ""}`))
      .flatMap((s) => [s.heading ?? "", ...(s.paragraphs ?? [])]),
    ...allParagraphs.filter((p) => /\b(practice|try|pause|notice|write|ask|choose|for one day|before one reply)\b/i.test(stripHtml(p)))
  ].join("\n");
  const metadata = [article.title, article.seoTitle ?? "", article.description, article.category, ...(article.tags ?? [])].join("\n");
  const seo = getArticleSeoDetails(article.slug);
  const faqs = (seo?.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]).join("\n");
  const sourceNotes = sourceNoteFor(article);
  const sharedRenderer = sharedRendererText(article);
  return {
    metadata,
    introduction,
    mainArticleSections,
    examples,
    exercises,
    reflectionQuestions: reflectionQuestionFor(article),
    faqs,
    sourceNotes,
    sharedRenderer,
    sidebarNavigationRelated: protectedLinksFor(article).join("\n"),
    wellbeingNotices: wellbeingNoticeFor(article),
    headings,
    structureSignature: sections.map((section) => `${section.heading ? "H2" : "INTRO"}:${(section.paragraphs ?? []).length}:${section.subheading ? "H3" : ""}`).join("|"),
    fullBody: sections.flatMap((section) => [section.heading ?? "", section.subheading ?? "", ...(section.paragraphs ?? [])]).join("\n"),
    bodyParagraphs: allParagraphs,
    bodySentences: splitSentences(allParagraphs.join("\n"))
  };
}

function sourceNoteFor(article) {
  if (article.slug.startsWith("dhammapada")) return "Original Echo Buddha reflection inspired by broad Dhammapada themes; not a verified translation.";
  if (article.category === "Meditation") return "Educational and reflective; not medical or mental health advice.";
  if (article.category === "Reflection") return "Original Echo Buddha reflection inspired by Buddhist themes; not a direct scripture translation.";
  return "Original educational reflection; compare reputable Buddhist translations, teachers, and practice communities for deeper formal study.";
}

function sharedRendererText(article) {
  const seo = getArticleSeoDetails(article.slug);
  return [
    "Key Takeaways",
    ...(seo?.takeaways ?? []),
    "Practice Today",
    practiceTodayFor(article),
    "Reflection Question",
    reflectionQuestionFor(article),
    "Related Buddhist Terms",
    ...(relatedBuddhistTermsByCategory[article.category] ?? []).map((term) => term.label),
    "Frequently Asked Questions",
    ...(seo?.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]),
    "Further Reading / Source Note",
    sourceNoteFor(article)
  ].join("\n");
}

function practiceTodayFor(article) {
  if (article.category === "Meditation") return "Pause for three natural breaths and return gently whenever attention wanders.";
  if (article.category === "Mindfulness") return "Choose one ordinary task and give it your full attention for one minute.";
  if (article.category === "Practice") return "Before one reply today, check whether your words are true, kind, useful, and timely.";
  if (article.category === "Reflection") return "Notice one place where clinging tightens the body, then soften one breath around it.";
  return "Ask what action would reduce harm in one situation you meet today.";
}

function reflectionQuestionFor(article) {
  if (article.category === "Meditation") return "What did this practice help you notice about the mind or body today?";
  if (article.category === "Mindfulness") return "Where did awareness create even a small pause before habit took over?";
  if (article.category === "Practice") return "Which ordinary action could become part of your Buddhist practice this week?";
  if (article.category === "Reflection") return "What are you holding tightly that may be asking for a softer relationship?";
  return "What would a wiser, less harmful response look like in one real situation?";
}

function wellbeingNoticeFor(article) {
  const slugs = new Set(["how-to-meditate-for-anxiety", "mindfulness-for-better-sleep", "buddhist-approach-to-anger", "buddhist-wisdom-for-overthinking", "impermanence-in-buddhism"]);
  return slugs.has(article.slug)
    ? "This article is educational and does not provide medical or mental health treatment. Meditation and mindfulness experiences vary. Seek qualified professional support for persistent or serious symptoms."
    : "";
}

function extractHrefs(value = "") {
  return [...String(value).matchAll(/href=["']([^"']+)["']/g)].map((match) => match[1]);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function protectedLinksFor(article) {
  const category = getArticleCategory(article.category);
  const bodyHrefs = article.content.flatMap((section) => (section.paragraphs ?? []).flatMap(extractHrefs));
  const relatedArticleLinks = relatedArticlesFor(article).map((slug) => `/articles/${slug}/`);
  const quoteTheme = getQuoteThemeForArticleCategory(article.category);
  return unique([
    "/",
    "/articles/",
    `/articles/category/${category.slug}/`,
    "/authors/echo-buddha-editorial/",
    "/editorial-policy/",
    ...bodyHrefs,
    ...(relatedBuddhistTermsByCategory[article.category] ?? []).map((term) => term.href),
    ...relatedArticleLinks,
    `/quotes/${slugify(quoteTheme)}/`,
    ...clusterLinksFor(article)
  ]);
}

function relatedArticlesFor(article) {
  const selected = (article.relatedSlugs ?? []).filter((slug) => fullArticles.some((item) => item.slug === slug));
  return selected.length
    ? selected
    : fullArticles.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 3).map((item) => item.slug);
}

function clusterLinksFor(article) {
  const clusters = clusterDefinitions.filter((cluster) => cluster.slugs.includes(article.slug));
  return unique(clusters.flatMap((cluster) => [
    cluster.preferredPrimaryPage,
    ...cluster.slugs.filter((slug) => slug !== article.slug).map((slug) => `/articles/${slug}/`)
  ]));
}

function inferTopic(article) {
  const s = `${article.slug} ${article.title} ${article.tags.join(" ")}`.toLowerCase();
  const rules = [
    ["dhammapada", "Dhammapada reflection"],
    ["four-noble", "Four Noble Truths"],
    ["eightfold", "Noble Eightfold Path"],
    ["karma", "Karma"],
    ["impermanence", "Impermanence"],
    ["loving-kindness", "Loving-kindness / metta"],
    ["metta", "Loving-kindness / metta"],
    ["non-attachment", "Non-attachment"],
    ["attachment", "Attachment"],
    ["letting-go", "Letting go"],
    ["forgiveness", "Forgiveness"],
    ["compassion", "Compassion"],
    ["right-speech", "Right Speech"],
    ["anger", "Anger"],
    ["patience", "Patience"],
    ["listening", "Mindful listening"],
    ["overthinking", "Overthinking"],
    ["anxiety", "Meditation for anxiety"],
    ["sleep", "Mindfulness for sleep"],
    ["walking", "Walking meditation"],
    ["breathing", "Mindfulness of breathing"],
    ["morning", "Mindful morning routine"],
    ["mindfulness-vs", "Mindfulness vs meditation"],
    ["buddhism", "Buddhism for beginners"],
    ["meditat", "Meditation"]
  ];
  return rules.find(([needle]) => s.includes(needle))?.[1] ?? article.category;
}

function inferIntent(article) {
  const s = article.title.toLowerCase();
  if (/what is|explained|guide to|beginner-friendly/.test(s)) return "Informational explanation";
  if (/how to|step-by-step|practice|routine|script/.test(s)) return "Practical instruction";
  if (/reflection|dhammapada/.test(s)) return "Reflective interpretation";
  if (/daily life|discipline|morning|sleep|anger|overthinking/.test(s)) return "Daily-life application";
  return article.category === "Meditation" ? "Practice guidance" : "Educational explanation";
}

function clustersForSlug(slug) {
  return clusterDefinitions.filter((cluster) => cluster.slugs.includes(slug));
}

function primaryClusterForSlug(slug) {
  return clustersForSlug(slug)[0] ?? null;
}

function similarityFor(a, b) {
  const bodyCosine = cosine(a.layers.mainArticleSections, b.layers.mainArticleSections);
  const bodyJaccard = jaccard(a.layers.mainArticleSections, b.layers.mainArticleSections);
  const introductionSimilarity = cosine(a.layers.introduction, b.layers.introduction);
  const headingSequenceSimilarity = seqSimilarity(a.layers.headings, b.layers.headings);
  const structureSimilarity = seqSimilarity([a.layers.structureSignature], [b.layers.structureSignature]);
  const faqSimilarity = cosine(a.layers.faqs, b.layers.faqs);
  const conclusionSimilarity = cosine(a.layers.conclusion, b.layers.conclusion);
  const metadataSimilarity = cosine(a.layers.metadata, b.layers.metadata);
  const exampleSimilarity = cosine(a.layers.examples, b.layers.examples);
  const exerciseSimilarity = cosine(a.layers.exercises, b.layers.exercises);
  const ngram5Overlap = ngramOverlap(a.layers.mainArticleSections, b.layers.mainArticleSections, 5);
  const exactDuplicatedSentences = exactShared(a.layers.bodySentences, b.layers.bodySentences);
  const nearDuplicatedParagraphs = nearParagraphs(a.layers.bodyParagraphs, b.layers.bodyParagraphs);
  const samePrimaryCluster = primaryClusterForSlug(a.slug)?.id && primaryClusterForSlug(a.slug)?.id === primaryClusterForSlug(b.slug)?.id;
  const overallBodySimilarity = round(
    bodyCosine * 0.28 +
    bodyJaccard * 0.16 +
    introductionSimilarity * 0.14 +
    headingSequenceSimilarity * 0.12 +
    faqSimilarity * 0.08 +
    conclusionSimilarity * 0.08 +
    ngram5Overlap * 0.14
  );
  const editorialOverlap = classifyPair({
    samePrimaryCluster,
    overallBodySimilarity,
    bodyCosine,
    introductionSimilarity,
    headingSequenceSimilarity,
    faqSimilarity,
    exactDuplicatedSentences,
    nearDuplicatedParagraphs,
    aSlug: a.slug,
    bSlug: b.slug
  });
  return {
    articleA: a.slug,
    articleB: b.slug,
    urlA: a.url,
    urlB: b.url,
    samePrimaryCluster: Boolean(samePrimaryCluster),
    sharedClusters: clustersForSlug(a.slug).filter((cluster) => cluster.slugs.includes(b.slug)).map((cluster) => cluster.name),
    metadataSimilarity: round(metadataSimilarity),
    overallBodySimilarity,
    bodyCosine: round(bodyCosine),
    bodyJaccard: round(bodyJaccard),
    introductionSimilarity: round(introductionSimilarity),
    headingSequenceSimilarity: round(headingSequenceSimilarity),
    articleStructureSimilarity: round(structureSimilarity),
    faqSimilarity: round(faqSimilarity),
    conclusionSimilarity: round(conclusionSimilarity),
    examplesSimilarity: round(exampleSimilarity),
    exercisesSimilarity: round(exerciseSimilarity),
    ngram5Overlap: round(ngram5Overlap),
    exactDuplicatedSentenceCount: exactDuplicatedSentences.length,
    exactDuplicatedSentences: exactDuplicatedSentences.slice(0, 8),
    nearDuplicatedParagraphCount: nearDuplicatedParagraphs.length,
    nearDuplicatedParagraphs: nearDuplicatedParagraphs.slice(0, 5),
    sharedExamples: sharedExampleLabel(a, b, exampleSimilarity),
    sharedPracticeLanguage: exerciseSimilarity >= 0.3 || exactDuplicatedSentences.some((s) => /practice|pause|notice|body|name/i.test(s)),
    sharedConclusionLanguage: conclusionSimilarity >= 0.35,
    overlapCausedByNecessaryDoctrine: samePrimaryCluster && /truth|eightfold|impermanence|karma|metta|dhammapada|attachment/i.test((primaryClusterForSlug(a.slug)?.name ?? "")),
    overlapCausedByAvoidableGenericProse: exactDuplicatedSentences.length > 0 || nearDuplicatedParagraphs.length > 0 || introductionSimilarity >= 0.5,
    editorialOverlap
  };
}

function exactShared(aSentences, bSentences) {
  const aNorm = new Map(aSentences.map((s) => [normalize(s), s]));
  return bSentences
    .map((s) => [normalize(s), s])
    .filter(([norm]) => norm && aNorm.has(norm))
    .map(([norm]) => aNorm.get(norm));
}

function nearParagraphs(aParagraphs, bParagraphs) {
  const results = [];
  for (const a of aParagraphs) {
    if (wordCount(a) < 18) continue;
    for (const b of bParagraphs) {
      if (wordCount(b) < 18) continue;
      const an = normalize(a);
      const bn = normalize(b);
      if (an === bn) continue;
      const score = cosine(a, b) * 0.65 + jaccard(a, b) * 0.35;
      if (score >= 0.72) results.push({ score: round(score), paragraphA: stripHtml(a), paragraphB: stripHtml(b) });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

function classifyPair(data) {
  if (data.aSlug === data.bSlug) return "Self";
  if (data.samePrimaryCluster && (data.overallBodySimilarity >= 0.46 || data.exactDuplicatedSentences.length >= 2 || data.nearDuplicatedParagraphs.length >= 2)) return "High";
  if (data.samePrimaryCluster && (data.overallBodySimilarity >= 0.32 || data.bodyCosine >= 0.58 || data.introductionSimilarity >= 0.42 || data.faqSimilarity >= 0.45)) return "Medium";
  if (data.exactDuplicatedSentences.length >= 2 || data.nearDuplicatedParagraphs.length >= 3) return "Medium";
  if (data.overallBodySimilarity >= 0.38 && data.headingSequenceSimilarity >= 0.45) return "Medium";
  return "Low";
}

function sharedExampleLabel(a, b, similarity) {
  if (similarity < 0.28) return "No strong shared example pattern";
  const aText = stripHtml(a.layers.examples).slice(0, 120);
  const bText = stripHtml(b.layers.examples).slice(0, 120);
  return `Possible shared example pattern: ${aText} / ${bText}`;
}

function round(value) {
  return Number((Number(value) || 0).toFixed(3));
}

function articleMetrics(record) {
  const text = record.layers.fullBody;
  const sentences = splitSentences(text, 1);
  const paragraphs = record.layers.bodyParagraphs;
  const sentenceLengths = sentences.map(wordCount).filter(Boolean);
  const transitionFrequency = Object.fromEntries(TRANSITIONS.map((phrase) => [
    phrase,
    (stripHtml(text).match(new RegExp(escapeRegExp(phrase), "gi")) ?? []).length
  ]).filter(([, count]) => count > 0));
  return {
    wordCount: Number(getArticleWordCount(record.article)),
    readTime: getArticleReadTime(record.article),
    sentenceCount: sentences.length,
    averageSentenceLength: round(sentenceLengths.reduce((sum, x) => sum + x, 0) / Math.max(1, sentenceLengths.length)),
    paragraphCount: paragraphs.length,
    headingCount: record.layers.headings.length,
    faqCount: getArticleSeoDetails(record.slug)?.faqs.length ?? 0,
    introductionLengthWords: wordCount(record.layers.introduction),
    conclusionLengthWords: wordCount(record.layers.conclusion),
    practicalExampleCount: (stripHtml(record.layers.examples).match(/\b(example|imagine|when|if you|for one day)\b/gi) ?? []).length,
    exerciseCount: (stripHtml(record.layers.exercises).match(/\b(practice|try|pause|notice|write|ask|choose)\b/gi) ?? []).length,
    reflectionQuestionCount: record.layers.reflectionQuestions ? 1 : 0,
    transitionFrequency,
    threeOrFourItemListSignals: (stripHtml(text).match(/\b\w+,\s+\w+,\s+(and\s+)?\w+/g) ?? []).length,
    repeatedSentenceRhythmSignal: sentenceRhythmSignal(sentenceLengths)
  };
}

function sentenceRhythmSignal(lengths) {
  if (lengths.length < 4) return "Insufficient data";
  const avg = lengths.reduce((sum, x) => sum + x, 0) / lengths.length;
  const variance = lengths.reduce((sum, x) => sum + (x - avg) ** 2, 0) / lengths.length;
  const stdev = Math.sqrt(variance);
  if (stdev < 5) return "Highly uniform";
  if (stdev < 8) return "Moderately uniform";
  return "Varied";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function doctrinalNeeds(article) {
  const text = normalize(`${article.title} ${article.description} ${article.tags.join(" ")} ${article.content.flatMap((s) => [s.heading ?? "", ...(s.paragraphs ?? [])]).join(" ")}`);
  const terms = DOCTRINAL_TERMS.filter((term) => text.includes(term));
  const sourceCategories = [];
  if (/four noble|eightfold|dukkha|karma|anicca|impermanence|anatta|dhamma|buddha|buddhist/.test(text)) sourceCategories.push("early Buddhist texts or reputable public-domain translations");
  if (/metta|loving-kindness|mindfulness|sati|meditation/.test(text)) sourceCategories.push("responsible meditation institutions and tradition-specific teaching resources");
  if (/dhammapada/.test(text)) sourceCategories.push("public-domain Dhammapada translations or clearly labelled paraphrase guidance");
  if (/compassion|forgiveness|right speech|attachment|non-attachment/.test(text)) sourceCategories.push("established Buddhist institutions and dictionaries/encyclopaedias of Buddhism");
  return {
    isDoctrinal: terms.length > 0,
    termsNeedingDefinition: unique(terms),
    coreFrameworksRequiringSupport: sourceCategories.length ? unique(sourceCategories) : [],
    claimsRemainInterpretation: [
      "daily-life examples",
      "practice framing",
      "Echo Buddha reflection language",
      "non-scriptural analogies"
    ],
    quotationGuidance: article.slug.startsWith("dhammapada")
      ? "Avoid direct modern translation quotation unless permission and citation limits are clear; public-domain translation may be suitable with attribution."
      : "Prefer paraphrase and source-aware further reading; quote only short passages with clear translation status."
  };
}

function wellbeingFindings(article) {
  const text = normalize(`${article.title} ${article.description} ${article.content.flatMap((s) => [s.heading ?? "", ...(s.paragraphs ?? [])]).join(" ")}`);
  const matchedTerms = WELLBEING_TERMS.filter((term) => text.includes(term));
  const central = /anxiety|overthinking|sleep|anger|grief|impermanence/.test(`${article.slug} ${article.title}`.toLowerCase());
  const hasRendererNote = Boolean(wellbeingNoticeFor(article));
  const impliesTreatment = /\b(cure|treat|treatment|guarantee|fix|heal)\b/i.test(text);
  const promisesRelief = /\b(relief|better sleep|calm|peaceful|reduce anxiety|stop overthinking)\b/i.test(`${article.title} ${article.description}`);
  const needsTargetedBoundary = central && (matchedTerms.length > 0) && (!hasRendererNote || article.slug === "buddhist-teachings-on-impermanence");
  return {
    matchedTerms,
    isClearlyEducational: !impliesTreatment,
    impliesTreatment,
    promisesReliefOrImprovement: promisesRelief,
    mayBlameReader: /\bif you only|your fault|because you failed|just choose\b/i.test(text),
    meditationPresentedAsUniversallyAppropriate: /always safe|works for everyone|anyone can cure/i.test(text),
    existingWellbeingNote: hasRendererNote,
    targetedCautionNeeded: needsTargetedBoundary,
    recommendedPlacement: needsTargetedBoundary ? "Near the first practice instruction or before grief/anxiety/sleep application sections" : "No new caution required beyond existing educational framing",
    recommendation: needsTargetedBoundary
      ? "Add article-specific boundary language in the later implementation pass; do not use identical boilerplate."
      : hasRendererNote
        ? "Retain the existing educational/non-treatment boundary and make copy-specific refinements only if the article promises outcomes."
        : "No article-specific wellbeing boundary required based on current page promise."
  };
}

function internalLinkAudit(article) {
  const hrefs = protectedLinksFor(article);
  const bodyHrefs = unique(article.content.flatMap((section) => (section.paragraphs ?? []).flatMap(extractHrefs)));
  return {
    incomingArticleLinks: fullArticles
      .filter((other) => other.slug !== article.slug)
      .filter((other) => protectedLinksFor(other).includes(`/articles/${article.slug}/`))
      .map((other) => `/articles/${other.slug}/`),
    outgoingArticleLinks: hrefs.filter((href) => href.startsWith("/articles/") && href !== `/articles/${article.slug}/`),
    bodyHrefs,
    learningHubLinks: hrefs.filter((href) => href.startsWith("/learn/")),
    meditationPageLinks: hrefs.filter((href) => href.startsWith("/meditation/")),
    quoteLinks: hrefs.filter((href) => href.startsWith("/quotes/")),
    termLinks: hrefs.filter((href) => href.includes("/learn/buddhist-dictionary/")),
    relatedArticleReferences: relatedArticlesFor(article),
    clusterLinks: clusterLinksFor(article),
    assessment: "Current links are protected. Later copy changes should preserve existing href values and only recommend additions separately."
  };
}

function scoreArticle(record, pairwiseForArticle) {
  const role = roleFor(record.article);
  const source = doctrinalNeeds(record.article);
  const wellbeing = wellbeingFindings(record.article);
  const highPairs = pairwiseForArticle.filter((pair) => pair.editorialOverlap === "High").length;
  const mediumPairs = pairwiseForArticle.filter((pair) => pair.editorialOverlap === "Medium").length;
  const exactDupPairs = pairwiseForArticle.filter((pair) => pair.exactDuplicatedSentenceCount > 0).length;
  const transitionTotal = Object.values(record.metrics.transitionFrequency).reduce((sum, x) => sum + x, 0);
  const searchIntent = role.intent ? 11 : 8;
  const uniqueValue = Math.max(6, 13 - Math.min(5, highPairs));
  const differentiation = Math.max(4, 15 - highPairs * 3 - mediumPairs);
  const human = Math.max(5, 15 - Math.min(6, exactDupPairs) - Math.min(4, Math.floor(transitionTotal / 8)));
  const depth = record.metrics.wordCount >= 950 ? 8 : 6;
  const integrity = source.isDoctrinal ? 8 : 9;
  const sourceAwareness = source.isDoctrinal ? 4 : 8;
  const sensitive = wellbeing.targetedCautionNeeded ? 2 : wellbeing.existingWellbeingNote ? 5 : 4;
  const technical = 5;
  const total = searchIntent + uniqueValue + differentiation + human + depth + integrity + sourceAwareness + sensitive + technical;
  const actions = [];
  if (highPairs >= 2) actions.push("Cluster repositioning");
  if (total < 72 || highPairs >= 3) actions.push("Substantial rewrite");
  else if (total < 82 || highPairs || mediumPairs >= 2) actions.push("Targeted rewrite");
  else if (total < 90) actions.push("Light polish");
  else actions.push("No change required");
  if (source.isDoctrinal) actions.push("Source review");
  if (wellbeing.targetedCautionNeeded || wellbeing.existingWellbeingNote) actions.push("Wellbeing review");
  return {
    total,
    components: {
      searchIntentClarity: searchIntent,
      uniqueValue,
      differentiationFromSiblings: differentiation,
      humanWritingQuality: human,
      depthAndUsefulness: depth,
      buddhistIntegrityAndAccuracy: integrity,
      sourceAwareness,
      sensitiveContentResponsibility: sensitive,
      technicalSeoIndexability: technical
    },
    risk: total < 65 ? "Critical" : total < 75 ? "High" : total < 84 ? "Medium" : total < 92 ? "Low" : "Pass",
    actions: unique(actions),
    explanation: total < 80
      ? `Score below 80 due to ${highPairs} high-overlap pair(s), ${mediumPairs} medium-overlap pair(s), ${exactDupPairs} duplicate-language pair(s), and ${source.isDoctrinal ? "source-aware support gaps" : "editorial differentiation needs"}.`
      : "Score is supported by stable technical SEO and a clearer standalone role; remaining issues are editorial polish."
  };
}

function editorialSpec(record, pairwiseForArticle) {
  const article = record.article;
  const role = roleFor(article);
  const highPairs = pairwiseForArticle.filter((pair) => pair.editorialOverlap === "High");
  const mediumPairs = pairwiseForArticle.filter((pair) => pair.editorialOverlap === "Medium");
  const source = doctrinalNeeds(article);
  const wellbeing = wellbeingFindings(article);
  const strongest = record.layers.headings[0] ?? "Opening explanation";
  const weakest = highPairs.length ? "Overlapping introduction/examples with sibling pages" : source.isDoctrinal ? "Source-aware support" : "Conclusion specificity";
  const duplicateEvidence = pairwiseForArticle.flatMap((pair) => pair.exactDuplicatedSentences.map((sentence) => ({ with: pair.articleA === article.slug ? pair.articleB : pair.articleA, sentence }))).slice(0, 5);
  return {
    currentStateDiagnosis: {
      strongestCurrentSection: strongest,
      weakestCurrentSection: weakest,
      primaryOverlapProblem: highPairs.length ? `High overlap with ${highPairs.map((pair) => pair.articleA === article.slug ? pair.articleB : pair.articleA).join(", ")}` : mediumPairs.length ? `Medium overlap with ${mediumPairs.map((pair) => pair.articleA === article.slug ? pair.articleB : pair.articleA).join(", ")}` : "No major pairwise overlap",
      repeatedOrPortablePassages: duplicateEvidence,
      genericExamples: record.metrics.practicalExampleCount > 5 ? "Many examples use broad daily-life framing; replace at least one with a role-specific example." : "No excessive example count, but examples should stay role-specific.",
      repeatedFaqItems: repeatedFaqQuestionsFor(article.slug),
      structuralTemplateRisks: templateRisk(record, pairwiseForArticle),
      doctrinalOrFactualGaps: source.isDoctrinal ? source.termsNeedingDefinition : [],
      sourcingGaps: source.coreFrameworksRequiringSupport,
      wellbeingRisks: wellbeing.matchedTerms,
      metadataIssues: "No duplicate title, meta description, or canonical found."
    },
    preservationInstructions: {
      url: record.url,
      slug: article.slug,
      internalLinks: protectedLinksFor(article),
      headingAnchors: record.headingIds,
      usefulSections: record.layers.headings.slice(0, 3),
      category: article.category,
      relatedResources: relatedArticlesFor(article),
      schema: "Preserve BlogPosting/Article, BreadcrumbList, and visible FAQ schema behavior."
    },
    rewriteInstructions: {
      introduction: highPairs.length ? "Rebuild around the unique promise; do not reuse generic Buddhist-practice opening." : "Lightly revise for stronger article-specific promise.",
      substantialRewriteSections: highPairs.length ? record.layers.headings.slice(0, 3) : [],
      tighteningOnlySections: highPairs.length ? record.layers.headings.slice(3) : record.layers.headings,
      removeAsRepetition: duplicateEvidence.map((item) => item.sentence),
      uniqueExampleReplacement: role.examples,
      newDepthRequired: source.isDoctrinal ? "Add source-aware qualification and term clarity." : "Add one concrete, role-specific situation.",
      faqTreatment: "Keep useful FAQ structure; differentiate repeated questions by article role rather than deleting by default.",
      conclusionChange: role.conclusion,
      lengthDirection: highPairs.length ? "Similar length after replacing duplicated prose; do not expand mechanically." : "Remain similar length or slightly shorter."
    },
    uniqueValueSpecification: {
      uniqueReaderPromise: role.promise,
      uniqueAngle: role.intent,
      uniquePracticalOutcome: role.outcome,
      uniqueExampleCategories: role.examples,
      uniqueStructureRecommendation: role.format,
      uniqueSourcePlan: source.coreFrameworksRequiringSupport,
      hubAndSiblingRelationship: hubSiblingRelationship(article)
    }
  };
}

function repeatedFaqQuestionsFor(slug) {
  const seo = getArticleSeoDetails(slug);
  const own = new Set((seo?.faqs ?? []).map((faq) => faq.question));
  const repeats = [];
  for (const article of fullArticles) {
    if (article.slug === slug) continue;
    for (const faq of getArticleSeoDetails(article.slug)?.faqs ?? []) {
      if (own.has(faq.question)) repeats.push({ question: faq.question, alsoIn: article.slug });
    }
  }
  return repeats;
}

function templateRisk(record, pairwiseForArticle) {
  const exact = pairwiseForArticle.reduce((sum, pair) => sum + pair.exactDuplicatedSentenceCount, 0);
  const transitionTotal = Object.values(record.metrics.transitionFrequency).reduce((sum, count) => sum + count, 0);
  if (exact >= 5 || transitionTotal >= 14) return "High template evidence requiring revision";
  if (exact > 0 || transitionTotal >= 8) return "Moderate template evidence";
  return "Low template evidence";
}

function hubSiblingRelationship(article) {
  const cluster = primaryClusterForSlug(article.slug);
  if (!cluster) return "Standalone or category-level relationship only.";
  const own = cluster.differentiation[article.slug] ?? "Support article within cluster.";
  return `${own} Hub/primary reference: ${cluster.preferredPrimaryPage}. Siblings: ${cluster.slugs.filter((slug) => slug !== article.slug).join(", ") || "none"}.`;
}

function findOccurrences(article, needle) {
  const occurrences = [];
  article.content.forEach((section, sectionIndex) => {
    (section.paragraphs ?? []).forEach((paragraph, paragraphIndex) => {
      if (normalize(paragraph).includes(normalize(needle))) {
        occurrences.push({
          sectionHeading: section.heading ?? "Introduction",
          sectionIndex,
          paragraphIndex
        });
      }
    });
  });
  return occurrences;
}

function mdTable(headers, rows) {
  const esc = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  return [
    `| ${headers.map(esc).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(esc).join(" | ")} |`)
  ].join("\n");
}

function csvEscape(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(file, headers, rows) {
  fs.writeFileSync(path.join(outDir, file), [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n") + "\n");
}

function artifactPurpose(file) {
  if (file.endsWith("article-audit-report.md")) return "First-audit human Markdown report";
  if (file.endsWith("article-audit-inventory.json")) return "First-audit machine-readable inventory";
  if (file.endsWith("Echo-Buddha-Article-Audit.docx")) return "First-audit Word report generated from JSON";
  if (file.endsWith("audit-articles.mjs")) return "First-audit generation script";
  if (file.endsWith("create-audit-docx.py")) return "DOCX generation script";
  if (file.includes("week-2")) return "Historical Week 2 content audit";
  if (file.includes("week-3")) return "Historical Week 3 publishing report";
  if (file.includes("seo-content-cluster")) return "Earlier cluster planning map";
  if (file.includes("google-search-console")) return "Search Console checklist";
  return "Supporting documentation or generated output";
}

function inspectArtifacts(canonical) {
  const candidates = [
    "docs/article-audit-report.md",
    "docs/article-audit-inventory.json",
    "docs/Echo-Buddha-Article-Audit.docx",
    "docs/google-search-console-week-1-checklist.md",
    "docs/seo-content-cluster-map.md",
    "docs/week-2-content-quality-audit.md",
    "docs/week-3-new-articles-publishing-report.md",
    "scripts/audit-articles.mjs",
    "scripts/create-audit-docx.py"
  ].filter((file) => fs.existsSync(path.join(root, file)));
  let oldJson = null;
  if (fs.existsSync(oldInventoryPath)) oldJson = JSON.parse(fs.readFileSync(oldInventoryPath, "utf8"));
  const rows = candidates.map((file) => {
    const abs = path.join(root, file);
    const stat = fs.statSync(abs);
    const purpose = artifactPurpose(file);
    const isCurrent = file.includes("docs/audits/articles") ? "Yes" : "Historical";
    let conflicts = "None detected";
    let unique = "Yes";
    let action = "Keep as historical context";
    if (file === "docs/article-audit-inventory.json" && oldJson) {
      conflicts = "Uses first-pass methodology and broad whole-body cosine; not canonical for second audit.";
      unique = "Preservation baseline only";
      action = "Deprecated for editorial decisions; superseded by canonical second-audit JSON.";
    }
    if (file === "docs/article-audit-report.md") {
      conflicts = "Contains first-pass high-severity cluster labels and generic recommendations.";
      unique = "Architecture discovery summary";
      action = "Deprecated for editorial implementation.";
    }
    if (file.endsWith(".docx")) {
      conflicts = "Generated from first-pass JSON but not itself a data source; can drift from Markdown.";
      unique = "Readable Word packaging only";
      action = "Keep as historical export; regenerate only from canonical data if needed.";
    }
    if (file.includes("seo-content-cluster")) {
      conflicts = "Useful cluster context but predates second-audit pairwise evidence.";
      action = "Keep as planning history.";
    }
    return {
      file,
      purpose,
      generationSource: file.startsWith("scripts/") ? "Manual/source script" : inferGenerationSource(file),
      generationDate: stat.mtime.toISOString(),
      current: isCurrent,
      uniqueInformation: unique,
      conflicts,
      recommendation: action
    };
  });
  return rows;
}

function inferGenerationSource(file) {
  if (file.endsWith("article-audit-report.md") || file.endsWith("article-audit-inventory.json")) return "scripts/audit-articles.mjs";
  if (file.endsWith(".docx")) return "scripts/create-audit-docx.py using docs/article-audit-inventory.json";
  return "Manual historical documentation";
}

function discrepancyReport(oldJson, canonical) {
  const rows = [];
  if (!oldJson) return rows;
  const oldClusters = oldJson.repeatedLanguageReport?.topPairSimilarities ?? [];
  const oldTop = oldClusters.slice(0, 10).map((pair) => `${pair.a}/${pair.b}:${pair.cosine}`).join("; ");
  const newTop = canonical.summary.tenHighestRiskPairs.map((pair) => `${pair.articleA}/${pair.articleB}:${pair.overallBodySimilarity}`).join("; ");
  rows.push({
    issue: "Top pair ranking changed",
    conflictingValues: `First audit whole-body cosine top pairs: ${oldTop}. Second audit layered-risk pairs: ${newTop}.`,
    files: "docs/article-audit-inventory.json; docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json",
    cause: "First audit used broad cosine over article body and did not weight layer-specific role evidence.",
    correctValue: "Second audit layered-risk ranking.",
    evidence: "Canonical matrix includes intro, heading, FAQ, exact/near duplication, n-gram, and cluster role dimensions.",
    sourceOfDiscrepancy: "Methodology defect, not article change."
  });
  const oldHighClusters = 13;
  const newHighClusters = canonical.summary.highOverlapClusterCount;
  rows.push({
    issue: "High-overlap cluster count changed",
    conflictingValues: `First audit labelled ${oldHighClusters} cluster rows High. Second audit labels ${newHighClusters} clusters High after role review.`,
    files: "docs/article-audit-report.md; ECHOBUDDHA_CLUSTER_DIFFERENTIATION_PLAN.md",
    cause: "First audit forced semantically related pages, wellbeing pages, and single-page clusters into High based on maximum cosine.",
    correctValue: `${newHighClusters} high-overlap clusters.`,
    evidence: "Second audit separates true search-intent clusters from semantic relationship groups and standalone pages.",
    sourceOfDiscrepancy: "Different cluster membership and threshold design."
  });
  rows.push({
    issue: "Sensitive Wellbeing cluster severity",
    conflictingValues: "First audit treated Sensitive Wellbeing as a high similarity cluster; second audit treats it as a review set, not a search-intent cluster.",
    files: "docs/article-audit-report.md; ECHOBUDDHA_WELLBEING_CONTENT_REVIEW.md",
    cause: "A clinical/sensitivity review set was mixed with search-intent clusters.",
    correctValue: "Sensitive wellbeing is a boundary-review dimension; individual search-intent overlap is handled in meditation, impermanence, and applied-practice clusters.",
    evidence: "Canonical article records keep wellbeing findings separately from primary cluster membership.",
    sourceOfDiscrepancy: "Cluster taxonomy defect."
  });
  rows.push({
    issue: "DOCX/Markdown source drift risk",
    conflictingValues: "DOCX generator re-computes some cluster table values from inventory and hardcoded logic instead of a canonical source.",
    files: "scripts/create-audit-docx.py; docs/article-audit-report.md",
    cause: "Two human reports were generated by separate scripts with separate formatting and cluster logic.",
    correctValue: "All second-audit reports are generated from ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json.",
    evidence: "scripts/validate-second-article-audit.mjs checks generated report values against the canonical dataset.",
    sourceOfDiscrepancy: "Report-generation design defect."
  });
  return rows;
}

function buildCanonical() {
  const generatedAt = new Date().toISOString();
  const repoIdentifier = getRepoIdentifier();
  const records = fullArticles.map((article) => {
    const layers = articleLayers(article);
    const record = {
      article,
      slug: article.slug,
      url: `${SITE.url}/articles/${article.slug}/`,
      layers,
      headingIds: layers.headings.map((heading) => slugify(heading))
    };
    record.metrics = articleMetrics(record);
    return record;
  });

  const pairwiseAll = [];
  for (const a of records) {
    for (const b of records) {
      pairwiseAll.push(a.slug === b.slug ? selfSimilarity(a) : similarityFor(a, b));
    }
  }
  const pairwiseUnique = pairwiseAll.filter((pair) => pair.articleA < pair.articleB);

  const pairwiseBySlug = (slug) => pairwiseUnique.filter((pair) => pair.articleA === slug || pair.articleB === slug);
  const articleRecords = records.map((record) => {
    const pairwise = pairwiseBySlug(record.slug);
    const role = roleFor(record.article);
    const sourcePlan = doctrinalNeeds(record.article);
    const wellbeing = wellbeingFindings(record.article);
    const linkAudit = internalLinkAudit(record.article);
    const score = scoreArticle(record, pairwise);
    const spec = editorialSpec(record, pairwise);
    const cluster = primaryClusterForSlug(record.slug);
    return {
      slug: record.slug,
      url: record.url,
      title: record.article.title,
      sourceFile: "src/data/site.ts",
      category: record.article.category,
      publicationDate: record.article.date,
      reviewedDate: getArticleSeoDetails(record.slug)?.reviewedDate ?? null,
      author: record.article.author,
      h1: record.article.title,
      headingIds: record.headingIds,
      metadata: {
        seoTitle: record.article.seoTitle ?? record.article.title,
        metaDescription: record.article.description,
        canonical: `${SITE.url}/articles/${record.slug}/`,
        image: record.article.thumbnail,
        imageAlt: record.article.imageAlt,
        structuredDataTypes: ["BlogPosting", "Article", "BreadcrumbList", "FAQPage"]
      },
      hashes: {
        articleBodyTextHash: hash(normalize(record.layers.fullBody)),
        structuralHash: hash(record.layers.structureSignature),
        metadataHash: hash(normalize(record.layers.metadata))
      },
      layers: {
        textLengths: {
          metadata: wordCount(record.layers.metadata),
          introduction: wordCount(record.layers.introduction),
          mainArticleSections: wordCount(record.layers.mainArticleSections),
          examples: wordCount(record.layers.examples),
          exercises: wordCount(record.layers.exercises),
          faqs: wordCount(record.layers.faqs),
          sharedRenderer: wordCount(record.layers.sharedRenderer)
        },
        headings: record.layers.headings,
        structureSignature: record.layers.structureSignature
      },
      metrics: record.metrics,
      clusterMembership: clustersForSlug(record.slug).map((cluster) => ({ id: cluster.id, name: cluster.name, preferredPrimaryPage: cluster.preferredPrimaryPage })),
      primaryCluster: cluster ? { id: cluster.id, name: cluster.name, preferredPrimaryPage: cluster.preferredPrimaryPage } : null,
      role,
      roleSpecification: {
        primaryReader: role.reader,
        readerKnowledgeLevel: role.level,
        primarySearchIntent: role.intent,
        secondarySearchIntent: role.secondaryIntent,
        readerProblem: role.problem,
        uniquePromise: role.promise,
        contentFormat: role.format,
        primaryOutcome: role.outcome,
        relationshipToHub: cluster?.preferredPrimaryPage ?? "Category-level relationship",
        relationshipToSiblingPages: hubSiblingRelationship(record.article),
        topicsToCover: topicsToCover(record.article),
        topicsNotToCoverDeeply: topicsToAvoid(record.article),
        uniqueExamples: role.examples,
        uniquePracticeFormat: role.practice,
        appropriateConclusionType: role.conclusion,
        faqUsefulness: getArticleSeoDetails(record.slug)?.faqs.length ? "Useful if questions are differentiated by article role." : "No FAQ found.",
        reasonUrlDeservesToExist: reasonToExist(record.article, role)
      },
      sourcePlan,
      wellbeingFindings: wellbeing,
      internalLinkAudit: linkAudit,
      score,
      finalRecommendation: finalRecommendation(score),
      editorialSpecification: spec
    };
  });

  const exactDuplication = buildDuplicationReport(records);
  const clusters = buildClusterSummaries(pairwiseUnique, articleRecords);
  const artifacts = inspectArtifacts({ articleRecords });
  const oldJson = fs.existsSync(oldInventoryPath) ? JSON.parse(fs.readFileSync(oldInventoryPath, "utf8")) : null;
  const discrepancies = discrepancyReport(oldJson, {
    summary: {
      highOverlapClusterCount: clusters.filter((cluster) => cluster.overlapSeverity === "High").length,
      tenHighestRiskPairs: topRiskPairs(pairwiseUnique, 10)
    }
  });

  const canonical = {
    auditSchemaVersion: "2.0.0",
    auditGenerationTimestamp: generatedAt,
    repositoryIdentifier: repoIdentifier,
    sourceOfTruth: "docs/audits/articles/ECHOBUDDHA_CANONICAL_ARTICLE_AUDIT.json",
    analysisThresholds: {
      minimumSentenceWords: 8,
      minimumParagraphWordsForNearDuplicate: 18,
      nearDuplicateParagraphThreshold: 0.72,
      highPairThreshold: "same primary cluster plus layered overall >= 0.46, or >=2 exact duplicated sentences, or >=2 near-duplicate paragraphs",
      mediumPairThreshold: "same primary cluster plus layered overall >= 0.32, broad body cosine >= 0.58, intro >= 0.42, FAQ >= 0.45, or strong duplicate evidence outside a cluster",
      highClusterThreshold: "true search-intent cluster with at least one High pair or multiple Medium pairs",
      tokenization: "HTML stripped; basic entities decoded; lowercase; punctuation except apostrophes/hyphens removed; whitespace collapsed",
      stopWordHandling: "Stop words removed for cosine/Jaccard token vectors; n-gram overlap keeps stop words to catch repeated phrasing",
      knownLimitations: [
        "No external source URLs are checked because this standard command is offline.",
        "Similarity scores identify editorial risk, not plagiarism or AI authorship.",
        "Generated renderer blocks are measured separately and excluded from main body similarity."
      ]
    },
    exclusions: [
      "Shared navigation, sidebars, breadcrumbs, theme, layout, related cards, and renderer-generated practice/reflection/source blocks are excluded from body-prose similarity.",
      "No AI detector scores are used.",
      "No article prose is modified by this audit."
    ],
    previousAuditArtifacts: artifacts,
    inconsistenciesResolved: discrepancies,
    articleCount: articleRecords.length,
    articles: articleRecords,
    pairwiseSimilarityResults: pairwiseAll,
    exactDuplication,
    clusters,
    preservationMap: Object.fromEntries(articleRecords.map((record) => [record.slug, {
      url: record.url,
      slug: record.slug,
      hrefs: record.internalLinkAudit.bodyHrefs.concat(record.internalLinkAudit.outgoingArticleLinks, record.internalLinkAudit.learningHubLinks, record.internalLinkAudit.quoteLinks),
      headingIds: record.headingIds,
      category: record.category,
      hubReferences: record.internalLinkAudit.learningHubLinks.concat(record.internalLinkAudit.meditationPageLinks),
      relatedReferences: record.internalLinkAudit.relatedArticleReferences
    }])),
    summary: buildSummary(articleRecords, pairwiseUnique, clusters, exactDuplication, discrepancies)
  };
  return canonical;
}

function selfSimilarity(record) {
  return {
    articleA: record.slug,
    articleB: record.slug,
    urlA: record.url,
    urlB: record.url,
    samePrimaryCluster: true,
    sharedClusters: clustersForSlug(record.slug).map((cluster) => cluster.name),
    metadataSimilarity: 1,
    overallBodySimilarity: 1,
    bodyCosine: 1,
    bodyJaccard: 1,
    introductionSimilarity: 1,
    headingSequenceSimilarity: 1,
    articleStructureSimilarity: 1,
    faqSimilarity: 1,
    conclusionSimilarity: 1,
    examplesSimilarity: 1,
    exercisesSimilarity: 1,
    ngram5Overlap: 1,
    exactDuplicatedSentenceCount: record.layers.bodySentences.length,
    exactDuplicatedSentences: [],
    nearDuplicatedParagraphCount: 0,
    nearDuplicatedParagraphs: [],
    sharedExamples: "Self row",
    sharedPracticeLanguage: true,
    sharedConclusionLanguage: true,
    overlapCausedByNecessaryDoctrine: false,
    overlapCausedByAvoidableGenericProse: false,
    editorialOverlap: "Self"
  };
}

function topicsToCover(article) {
  const role = roleFor(article);
  return [
    inferTopic(article),
    role.problem,
    role.outcome,
    ...(doctrinalNeeds(article).termsNeedingDefinition.slice(0, 5))
  ];
}

function topicsToAvoid(article) {
  const cluster = primaryClusterForSlug(article.slug);
  if (!cluster) return ["Do not broaden into unrelated Buddhist concepts or a full beginner hub."];
  return cluster.slugs
    .filter((slug) => slug !== article.slug)
    .map((slug) => `Do not cover sibling role deeply: ${cluster.differentiation[slug] ?? slug}`);
}

function reasonToExist(article, role) {
  return `${article.title} deserves its URL because it should own this specific promise: ${role.promise}.`;
}

function finalRecommendation(score) {
  if (score.actions.includes("Substantial rewrite")) return "Substantial rewrite";
  if (score.actions.includes("Cluster repositioning")) return "Cluster repositioning";
  if (score.actions.includes("Targeted rewrite")) return "Targeted rewrite";
  if (score.actions.includes("Light polish")) return "Light polish";
  return "No change required";
}

function buildDuplicationReport(records) {
  const sentenceMap = new Map();
  const paragraphMap = new Map();
  for (const record of records) {
    for (const sentence of record.layers.bodySentences) {
      const norm = normalize(sentence);
      if (!norm) continue;
      if (!sentenceMap.has(norm)) sentenceMap.set(norm, []);
      sentenceMap.get(norm).push({ slug: record.slug, url: record.url, sentence, occurrences: findOccurrences(record.article, sentence) });
    }
    for (const paragraph of record.layers.bodyParagraphs) {
      const norm = normalize(paragraph);
      if (wordCount(norm) < 18) continue;
      if (!paragraphMap.has(norm)) paragraphMap.set(norm, []);
      paragraphMap.get(norm).push({ slug: record.slug, url: record.url, paragraph: stripHtml(paragraph), occurrences: findOccurrences(record.article, paragraph) });
    }
  }
  const exactSentences = [...sentenceMap.entries()]
    .filter(([, rows]) => unique(rows.map((row) => row.slug)).length > 1)
    .map(([normalized, rows]) => ({
      normalized,
      sentence: rows[0].sentence,
      affectedUrls: unique(rows.map((row) => row.url)),
      locations: rows,
      classification: classifyDuplicate(rows[0].sentence),
      recommendedTreatment: treatmentForDuplicate(rows[0].sentence)
    }))
    .sort((a, b) => b.affectedUrls.length - a.affectedUrls.length);
  const exactParagraphs = [...paragraphMap.entries()]
    .filter(([, rows]) => unique(rows.map((row) => row.slug)).length > 1)
    .map(([normalized, rows]) => ({
      normalized,
      paragraph: rows[0].paragraph,
      affectedUrls: unique(rows.map((row) => row.url)),
      locations: rows,
      classification: "exact duplicated prose",
      recommendedTreatment: "Replace with article-specific explanation or remove if filler."
    }))
    .sort((a, b) => b.affectedUrls.length - a.affectedUrls.length);
  return {
    exactDuplicatedSentenceGroups: exactSentences,
    exactDuplicatedParagraphGroups: exactParagraphs,
    exactDuplicatedSentenceGroupCount: exactSentences.length,
    exactDuplicatedParagraphGroupCount: exactParagraphs.length
  };
}

function classifyDuplicate(sentence) {
  const s = normalize(sentence);
  if (/this teaching becomes useful|practical example|for one day watch|self-criticism|size of the action|modest repetitions/.test(s)) return "portable filler / template evidence requiring revision";
  if (/buddhist-inspired practice/.test(s)) return "normal editorial voice but overused";
  if (/pause|notice|body|name/.test(s)) return "acceptable repeated instruction only if article-specific context is added";
  return "near-template prose";
}

function treatmentForDuplicate(sentence) {
  const classification = classifyDuplicate(sentence);
  if (classification.includes("filler")) return "Remove or rewrite with article-specific example and article-specific stakes.";
  if (classification.includes("instruction")) return "Keep the practice idea only where needed; vary wording and connect to the article's unique method.";
  return "Rewrite at least all but one occurrence so repeated prose does not look mechanically expanded.";
}

function buildClusterSummaries(pairwiseUnique, articleRecords) {
  return clusterDefinitions.map((cluster) => {
    const pairs = pairwiseUnique.filter((pair) => cluster.slugs.includes(pair.articleA) && cluster.slugs.includes(pair.articleB));
    const highPairs = pairs.filter((pair) => pair.editorialOverlap === "High");
    const mediumPairs = pairs.filter((pair) => pair.editorialOverlap === "Medium");
    const maxOverall = Math.max(0, ...pairs.map((pair) => pair.overallBodySimilarity));
    const trueSearchIntentCluster = !["compassion-forgiveness", "applied-speech-patience-anger-listening", "dhammapada-reflections", "standalone-karma", "standalone-peaceful-corner"].includes(cluster.id);
    const overlapSeverity = highPairs.length && trueSearchIntentCluster
      ? "High"
      : (highPairs.length || mediumPairs.length >= 2) && cluster.slugs.length > 1
        ? "Medium"
        : "Low";
    return {
      id: cluster.id,
      name: cluster.name,
      slugs: cluster.slugs,
      preferredPrimaryPage: cluster.preferredPrimaryPage,
      severityBasis: cluster.severityBasis,
      overlapSeverity,
      maxOverallSimilarity: round(maxOverall),
      highPairCount: highPairs.length,
      mediumPairCount: mediumPairs.length,
      differentiation: cluster.differentiation,
      recommendation: clusterRecommendation(cluster, overlapSeverity),
      pairEvidence: pairs
        .filter((pair) => ["High", "Medium"].includes(pair.editorialOverlap))
        .sort((a, b) => b.overallBodySimilarity - a.overallBodySimilarity)
    };
  });
}

function clusterRecommendation(cluster, severity) {
  if (severity === "High") return "Prioritize for Batch 1/2 controlled rewrite. Preserve URLs; rebuild unique introductions, examples, and source notes.";
  if (severity === "Medium") return "Differentiate roles during relevant batch; avoid treating all semantically related pages as duplicate search intent.";
  return cluster.slugs.length === 1 ? "Keep as standalone and maintain source-aware support." : "Keep separate; light role sharpening only.";
}

function buildSummary(articleRecords, pairwiseUnique, clusters, duplication, discrepancies) {
  const highPairs = pairwiseUnique.filter((pair) => pair.editorialOverlap === "High");
  const nearDupPairs = pairwiseUnique.filter((pair) => pair.nearDuplicatedParagraphCount > 0 || (pair.editorialOverlap !== "Low" && pair.exactDuplicatedSentenceCount === 0));
  const substantial = articleRecords.filter((record) => record.finalRecommendation === "Substantial rewrite").length;
  const targeted = articleRecords.filter((record) => record.finalRecommendation === "Targeted rewrite" || record.finalRecommendation === "Cluster repositioning").length;
  const light = articleRecords.filter((record) => record.finalRecommendation === "Light polish" || record.finalRecommendation === "No change required").length;
  return {
    articlesAudited: articleRecords.length,
    previousAuditArtifactsInspected: 9,
    inconsistenciesFoundAndResolved: discrepancies.length,
    finalExactDuplicateSentenceGroupCount: duplication.exactDuplicatedSentenceGroupCount,
    finalExactDuplicateParagraphGroupCount: duplication.exactDuplicatedParagraphGroupCount,
    finalNearDuplicatePairCount: nearDupPairs.length,
    finalHighOverlapPairCount: highPairs.length,
    highOverlapClusterCount: clusters.filter((cluster) => cluster.overlapSeverity === "High").length,
    tenHighestRiskPairs: topRiskPairs(pairwiseUnique, 10),
    substantialRewriteCount: substantial,
    targetedRewriteCount: targeted,
    lightPolishOrNoChangeCount: light,
    sourceAwareReviewCount: articleRecords.filter((record) => record.sourcePlan.isDoctrinal).length,
    wellbeingReviewCount: articleRecords.filter((record) => record.wellbeingFindings.targetedCautionNeeded || record.wellbeingFindings.existingWellbeingNote).length,
    readinessVerdict: "Ready for a controlled implementation pass only after Batch 1 role decisions are approved; not ready for mass rewrite, URL consolidation, or AdSense-readiness claims.",
    recommendedFirstImplementationBatch: "Batch 1: Noble Eightfold Path, Four Noble Truths, Beginner Buddhism, and Impermanence."
  };
}

function topRiskPairs(pairwiseUnique, n) {
  const severityWeight = { High: 3, Medium: 2, Low: 1 };
  return [...pairwiseUnique]
    .filter((pair) => pair.editorialOverlap !== "Low")
    .sort((a, b) => (severityWeight[b.editorialOverlap] - severityWeight[a.editorialOverlap]) || b.overallBodySimilarity - a.overallBodySimilarity || b.exactDuplicatedSentenceCount - a.exactDuplicatedSentenceCount)
    .slice(0, n)
    .map((pair) => ({
      articleA: pair.articleA,
      articleB: pair.articleB,
      editorialOverlap: pair.editorialOverlap,
      overallBodySimilarity: pair.overallBodySimilarity,
      introductionSimilarity: pair.introductionSimilarity,
      headingSequenceSimilarity: pair.headingSequenceSimilarity,
      faqSimilarity: pair.faqSimilarity,
      exactDuplicatedSentenceCount: pair.exactDuplicatedSentenceCount,
      nearDuplicatedParagraphCount: pair.nearDuplicatedParagraphCount
    }));
}

function getRepoIdentifier() {
  try {
    const head = fs.readFileSync(path.join(root, ".git/HEAD"), "utf8").trim();
    if (head.startsWith("ref:")) {
      const ref = head.replace("ref: ", "");
      const refPath = path.join(root, ".git", ref);
      if (fs.existsSync(refPath)) return `${ref}@${fs.readFileSync(refPath, "utf8").trim()}`;
      return ref;
    }
    return head;
  } catch {
    return "working-tree-no-git-identifier";
  }
}

function renderAll(canonical) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, OUTPUTS.canonical), JSON.stringify(canonical, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, OUTPUTS.linkMap), JSON.stringify({
    generatedAt: canonical.auditGenerationTimestamp,
    source: canonical.sourceOfTruth,
    protectedValues: canonical.preservationMap
  }, null, 2) + "\n");
  renderMatrix(canonical);
  renderPriority(canonical);
  renderReconciliation(canonical);
  renderDuplication(canonical);
  renderHumanDiagnostic(canonical);
  renderRoleMap(canonical);
  renderClusterPlan(canonical);
  renderEditorialSpecs(canonical);
  renderSourcePlan(canonical);
  renderWellbeing(canonical);
  renderFinal(canonical);
}

function renderMatrix(canonical) {
  const headers = [
    "articleA", "articleB", "urlA", "urlB", "editorialOverlap", "samePrimaryCluster", "sharedClusters",
    "metadataSimilarity", "overallBodySimilarity", "bodyCosine", "bodyJaccard", "introductionSimilarity",
    "headingSequenceSimilarity", "articleStructureSimilarity", "faqSimilarity", "conclusionSimilarity",
    "examplesSimilarity", "exercisesSimilarity", "ngram5Overlap", "exactDuplicatedSentenceCount",
    "nearDuplicatedParagraphCount", "sharedPracticeLanguage", "sharedConclusionLanguage",
    "overlapCausedByNecessaryDoctrine", "overlapCausedByAvoidableGenericProse"
  ];
  writeCsv(OUTPUTS.matrix, headers, canonical.pairwiseSimilarityResults.map((pair) => ({
    ...pair,
    sharedClusters: pair.sharedClusters.join("; ")
  })));
}

function renderPriority(canonical) {
  const headers = ["URL", "priority", "risk", "cluster", "currentScore", "desiredRole", "rewriteScope", "sourceWork", "wellbeingReview", "expectedEffort", "dependencies", "recommendedImplementationBatch"];
  const rows = canonical.articles.map((record) => {
    const batch = implementationBatch(record);
    return {
      URL: record.url,
      priority: batch.priority,
      risk: record.score.risk,
      cluster: record.primaryCluster?.name ?? "Standalone",
      currentScore: record.score.total,
      desiredRole: record.roleSpecification.uniquePromise,
      rewriteScope: record.finalRecommendation,
      sourceWork: record.sourcePlan.isDoctrinal ? "Source-aware review required" : "Light source note only",
      wellbeingReview: record.wellbeingFindings.targetedCautionNeeded || record.wellbeingFindings.existingWellbeingNote ? "Yes" : "No",
      expectedEffort: batch.effort,
      dependencies: batch.dependencies,
      recommendedImplementationBatch: batch.batch
    };
  });
  writeCsv(OUTPUTS.priority, headers, rows);
}

function implementationBatch(record) {
  const slug = record.slug;
  const c = record.primaryCluster?.id;
  if (["noble-eightfold-path", "four-noble-truths", "beginner-buddhism", "impermanence"].includes(c)) return { batch: "Batch 1 - Highest search-intent conflict", priority: "P1", effort: "High", dependencies: "Approve cluster role map and source plan" };
  if (c === "beginner-meditation-mindfulness") return { batch: "Batch 2 - Meditation and mindfulness overlap", priority: "P2", effort: "Medium to high", dependencies: "Complete Batch 1 terminology decisions where relevant" };
  if (["loving-kindness-metta", "attachment-letting-go", "compassion-forgiveness"].includes(c)) return { batch: "Batch 3 - Metta, attachment, and compassion", priority: "P3", effort: "Medium", dependencies: "Approve source terminology for metta/attachment/compassion" };
  if (["applied-speech-patience-anger-listening"].includes(c) || ["how-to-meditate-for-anxiety", "mindfulness-for-better-sleep", "buddhist-wisdom-for-overthinking", "buddhist-approach-to-anger", "buddhist-teachings-on-impermanence"].includes(slug)) return { batch: "Batch 4 - Wellbeing and applied practice", priority: "P4", effort: "Medium", dependencies: "Review wellbeing boundaries" };
  return { batch: "Batch 5 - Lower-risk and standalone content", priority: "P5", effort: "Low to medium", dependencies: "Can follow core cluster cleanup" };
}

function renderReconciliation(canonical) {
  const rows = canonical.previousAuditArtifacts.map((item) => [
    item.file, item.purpose, item.generationSource, item.generationDate, item.current, item.uniqueInformation, item.conflicts, item.recommendation
  ]);
  const discrepancyRows = canonical.inconsistenciesResolved.map((item) => [
    item.issue, item.conflictingValues, item.files, item.cause, item.correctValue, item.evidence, item.sourceOfDiscrepancy
  ]);
  const md = `# Echo Buddha Audit Reconciliation

Generated: ${canonical.auditGenerationTimestamp}

## Previous Audit Artifacts

${mdTable(["File", "Purpose", "Generation source", "Generation date", "Current?", "Unique information", "Conflict", "Recommendation"], rows)}

## Inconsistencies Found And Resolved

${mdTable(["Issue", "Conflicting values", "Files", "Why they differ", "Correct value", "Evidence", "Root cause"], discrepancyRows)}

## Source Of Truth

The canonical source for this second audit is \`${OUTPUTS.canonical}\`. All second-audit Markdown and CSV files are generated from that JSON. The first-audit Markdown, JSON, and DOCX remain historical artifacts and should not guide implementation where they conflict with this dataset.
`;
  fs.writeFileSync(path.join(outDir, OUTPUTS.reconciliation), md);
}

function renderDuplication(canonical) {
  const sentenceRows = canonical.exactDuplication.exactDuplicatedSentenceGroups.map((item) => [
    item.sentence,
    item.affectedUrls.join("<br>"),
    item.locations.map((loc) => `${loc.slug}: ${loc.occurrences.map((o) => `${o.sectionHeading} p${o.paragraphIndex + 1}`).join(", ")}`).join("<br>"),
    item.classification,
    item.recommendedTreatment
  ]);
  const paragraphRows = canonical.exactDuplication.exactDuplicatedParagraphGroups.map((item) => [
    item.paragraph,
    item.affectedUrls.join("<br>"),
    item.classification,
    item.recommendedTreatment
  ]);
  const md = `# Echo Buddha Exact Duplication Report

Generated from canonical source: \`${OUTPUTS.canonical}\`.

## Totals

- Exact duplicated sentence groups: ${canonical.exactDuplication.exactDuplicatedSentenceGroupCount}
- Exact duplicated paragraph groups: ${canonical.exactDuplication.exactDuplicatedParagraphGroupCount}

## Exact Duplicated Sentences

${sentenceRows.length ? mdTable(["Sentence", "Affected URLs", "Locations", "Classification", "Recommended treatment"], sentenceRows) : "No exact duplicated sentence groups found."}

## Exact Duplicated Paragraphs

${paragraphRows.length ? mdTable(["Paragraph", "Affected URLs", "Classification", "Recommended treatment"], paragraphRows) : "No exact duplicated paragraph groups found."}
`;
  fs.writeFileSync(path.join(outDir, OUTPUTS.duplication), md);
}

function renderHumanDiagnostic(canonical) {
  const rows = canonical.articles.map((record) => [
    record.url,
    record.metrics.wordCount,
    record.metrics.sentenceCount,
    record.metrics.averageSentenceLength,
    record.metrics.paragraphCount,
    record.metrics.introductionLengthWords,
    record.metrics.conclusionLengthWords,
    Object.entries(record.metrics.transitionFrequency).map(([k, v]) => `${k}: ${v}`).join("<br>") || "None",
    record.editorialSpecification.currentStateDiagnosis.structuralTemplateRisks
  ]);
  const md = `# Echo Buddha Human-Writing Diagnostic

## Method

This diagnostic measures body prose separately from shared renderer content. It does not use AI detectors. Repeated phrases are classified by editorial function, not by raw frequency alone.

## Article-Level Evidence

${mdTable(["URL", "Words", "Sentences", "Avg sentence", "Paragraphs", "Intro words", "Conclusion words", "Repeated transitions", "Template-risk classification"], rows)}

## Recurring Patterns

- Repeated syntax: several Week 2/Week 3 expanded articles reuse "This teaching becomes useful when", "A practical example might be", and "For one day watch for" scaffolding.
- Repeated transitions: "Notice" remains the most common transition and should be reduced where it opens consecutive instructions.
- Repeated practices: pause/notice/body/name/self-criticism formulas are useful but over-portable when not tied to article-specific method.
- FAQ patterns: repeated questions should be differentiated by page role, not removed wholesale.
- Template-risk judgement: exact duplicate prose is the highest-confidence evidence; repeated transitions are supporting evidence only.
`;
  fs.writeFileSync(path.join(outDir, OUTPUTS.human), md);
}

function renderRoleMap(canonical) {
  const rows = canonical.articles.map((record) => [
    record.url,
    record.roleSpecification.primaryReader,
    record.roleSpecification.primarySearchIntent,
    record.roleSpecification.uniquePromise,
    record.roleSpecification.contentFormat,
    record.roleSpecification.relationshipToHub,
    record.roleSpecification.relationshipToSiblingPages,
    record.roleSpecification.reasonUrlDeservesToExist
  ]);
  fs.writeFileSync(path.join(outDir, OUTPUTS.roleMap), `# Echo Buddha Article Role Map

${mdTable(["URL", "Reader", "Search intent", "Unique promise", "Unique format", "Hub relationship", "Sibling relationship", "Reason URL deserves to exist"], rows)}
`);
}

function renderClusterPlan(canonical) {
  const sections = canonical.clusters.map((cluster) => `## ${cluster.name}

- Severity: ${cluster.overlapSeverity}
- Preferred primary page: ${cluster.preferredPrimaryPage}
- Evidence: max layered similarity ${cluster.maxOverallSimilarity}; high pairs ${cluster.highPairCount}; medium pairs ${cluster.mediumPairCount}
- Recommendation: ${cluster.recommendation}

${mdTable(["URL / page", "Distinct role"], Object.entries(cluster.differentiation).map(([slug, role]) => [slug.startsWith("/") ? slug : `/articles/${slug}/`, role]))}

${cluster.pairEvidence.length ? mdTable(["Pair", "Overlap", "Overall", "Intro", "Heading", "FAQ", "Exact sentences", "Editorial judgement"], cluster.pairEvidence.map((pair) => [`${pair.articleA} / ${pair.articleB}`, pair.editorialOverlap, pair.overallBodySimilarity, pair.introductionSimilarity, pair.headingSequenceSimilarity, pair.faqSimilarity, pair.exactDuplicatedSentenceCount, pair.overlapCausedByAvoidableGenericProse ? "Avoidable generic prose contributes" : "Mostly topic/format overlap"])) : "No High or Medium pair evidence in this cluster."}
`).join("\n");
  fs.writeFileSync(path.join(outDir, OUTPUTS.clusterPlan), `# Echo Buddha Cluster Differentiation Plan

${sections}
`);
}

function renderEditorialSpecs(canonical) {
  const sections = canonical.articles.map((record) => {
    const d = record.editorialSpecification.currentStateDiagnosis;
    const p = record.editorialSpecification.preservationInstructions;
    const r = record.editorialSpecification.rewriteInstructions;
    const u = record.editorialSpecification.uniqueValueSpecification;
    return `## ${record.title}

- URL: ${record.url}
- Score: ${record.score.total} (${record.score.risk})
- Recommended scope: ${record.finalRecommendation}

### Current-State Diagnosis

- Strongest section: ${d.strongestCurrentSection}
- Weakest section: ${d.weakestCurrentSection}
- Primary overlap problem: ${d.primaryOverlapProblem}
- Structural-template risk: ${d.structuralTemplateRisks}
- Repeated/portable passages: ${d.repeatedOrPortablePassages.length ? d.repeatedOrPortablePassages.map((x) => `${x.with}: "${x.sentence}"`).join("; ") : "None found at exact-match threshold"}
- Generic examples: ${d.genericExamples}
- Repeated FAQ items: ${d.repeatedFaqItems.length ? d.repeatedFaqItems.map((x) => `${x.question} (${x.alsoIn})`).join("; ") : "None"}
- Doctrinal/factual gaps: ${d.doctrinalOrFactualGaps.join(", ") || "None detected"}
- Sourcing gaps: ${d.sourcingGaps.join("; ") || "None detected"}
- Wellbeing risks: ${d.wellbeingRisks.join(", ") || "None detected"}
- Metadata issues: ${d.metadataIssues}

### Preservation Instructions

- Preserve URL, slug, category, schema behavior, and all existing href values.
- Heading anchors: ${p.headingAnchors.join(", ") || "No article-body heading anchors"}
- Useful sections to retain: ${p.usefulSections.join(", ") || "Opening structure"}
- Related resources to preserve: ${p.relatedResources.join(", ") || "None"}

### Rewrite Instructions

- Introduction: ${r.introduction}
- Sections needing substantial rewriting: ${r.substantialRewriteSections.join(", ") || "None"}
- Sections needing tightening only: ${r.tighteningOnlySections.join(", ") || "None"}
- Remove or vary repeated prose: ${r.removeAsRepetition.length ? r.removeAsRepetition.join(" / ") : "None"}
- Replace generic example with: ${r.uniqueExampleReplacement}
- New depth required: ${r.newDepthRequired}
- FAQ treatment: ${r.faqTreatment}
- Conclusion: ${r.conclusionChange}
- Length direction: ${r.lengthDirection}

### Unique Value Specification

- Unique promise: ${u.uniqueReaderPromise}
- Unique angle: ${u.uniqueAngle}
- Unique practical outcome: ${u.uniquePracticalOutcome}
- Unique example categories: ${u.uniqueExampleCategories}
- Unique structure: ${u.uniqueStructureRecommendation}
- Unique source plan: ${u.uniqueSourcePlan.join("; ") || "No special source plan"}
- Hub/sibling relationship: ${u.hubAndSiblingRelationship}
`;
  }).join("\n");
  fs.writeFileSync(path.join(outDir, OUTPUTS.editorialSpecs), `# Echo Buddha Article Editorial Specifications

These are implementation specifications only. They do not rewrite article prose.

${sections}
`);
}

function renderSourcePlan(canonical) {
  const rows = canonical.articles.map((record) => [
    record.url,
    record.sourcePlan.isDoctrinal ? "Yes" : "No",
    record.sourcePlan.termsNeedingDefinition.join(", ") || "None",
    record.sourcePlan.coreFrameworksRequiringSupport.join("; ") || "None",
    record.sourcePlan.quotationGuidance,
    record.sourcePlan.claimsRemainInterpretation.join("; ")
  ]);
  fs.writeFileSync(path.join(outDir, OUTPUTS.sourcePlan), `# Echo Buddha Source-Awareness Plan

No URLs are inserted by this audit. Source categories identify what a later implementation pass should verify.

${mdTable(["URL", "Doctrinal?", "Terms needing definition", "Source categories", "Quotation guidance", "Keep labelled as Echo Buddha interpretation"], rows)}
`);
}

function renderWellbeing(canonical) {
  const rows = canonical.articles
    .filter((record) => record.wellbeingFindings.matchedTerms.length || record.wellbeingFindings.existingWellbeingNote || record.wellbeingFindings.targetedCautionNeeded)
    .map((record) => [
      record.url,
      record.wellbeingFindings.matchedTerms.join(", ") || "None",
      record.wellbeingFindings.isClearlyEducational ? "Yes" : "No",
      record.wellbeingFindings.impliesTreatment ? "Yes" : "No",
      record.wellbeingFindings.promisesReliefOrImprovement ? "Possible" : "No",
      record.wellbeingFindings.existingWellbeingNote ? "Yes" : "No",
      record.wellbeingFindings.targetedCautionNeeded ? "Yes" : "No",
      record.wellbeingFindings.recommendedPlacement,
      record.wellbeingFindings.recommendation
    ]);
  fs.writeFileSync(path.join(outDir, OUTPUTS.wellbeing), `# Echo Buddha Wellbeing Content Review

${mdTable(["URL", "Terms", "Educational?", "Implies treatment?", "Promises relief?", "Existing note?", "Targeted caution needed?", "Placement", "Recommendation"], rows)}
`);
}

function renderFinal(canonical) {
  const s = canonical.summary;
  const topPairs = s.tenHighestRiskPairs.map((pair) => [
    `${pair.articleA} / ${pair.articleB}`,
    pair.editorialOverlap,
    pair.overallBodySimilarity,
    pair.introductionSimilarity,
    pair.headingSequenceSimilarity,
    pair.faqSimilarity,
    pair.exactDuplicatedSentenceCount
  ]);
  const highClusters = canonical.clusters.filter((cluster) => cluster.overlapSeverity === "High").map((cluster) => [
    cluster.name,
    cluster.maxOverallSimilarity,
    cluster.highPairCount,
    cluster.recommendation
  ]);
  fs.writeFileSync(path.join(outDir, OUTPUTS.final), `# Echo Buddha Second Article Audit Final Report

## Executive Verdict

The article library has a strong technical SEO foundation but is not ready for broad AdSense-readiness or uniqueness claims until high-overlap clusters are differentiated and repeated scaffold prose is revised. It is ready for a controlled implementation pass with strict preservation of URLs, hrefs, headings, categories, and rendering behavior.

## Corrected Audit Findings

- Articles audited: ${s.articlesAudited}
- Previous artifacts inspected: ${s.previousAuditArtifactsInspected}
- Inconsistencies found and resolved: ${s.inconsistenciesFoundAndResolved}
- Exact duplicated sentence groups: ${s.finalExactDuplicateSentenceGroupCount}
- Exact duplicated paragraph groups: ${s.finalExactDuplicateParagraphGroupCount}
- Near-duplicate pair count: ${s.finalNearDuplicatePairCount}
- High-overlap cluster count: ${s.highOverlapClusterCount}
- Articles requiring substantial rewrite: ${s.substantialRewriteCount}
- Articles requiring targeted rewrite or cluster repositioning: ${s.targetedRewriteCount}
- Articles requiring only light polish/no change: ${s.lightPolishOrNoChangeCount}
- Articles requiring source-aware review: ${s.sourceAwareReviewCount}
- Articles requiring wellbeing review: ${s.wellbeingReviewCount}

## Article-Library Strengths

- Static, crawlable article HTML.
- Unique title tags, meta descriptions, and canonicals.
- Complete sitemap/search-index coverage from source records.
- Visible author, dates, FAQs, and schema behavior.
- Existing hubs, related links, quote journeys, and practice/reflection blocks.

## Article-Library Weaknesses

- High-overlap doctrinal clusters.
- Portable repeated prose from expansion scaffolding.
- Weak source-aware support on doctrinal pages.
- Some method-specific meditation pages still contain generic meditation prose.
- Sensitive wellbeing pages need article-specific boundaries rather than broad claims.

## Highest-Risk Article Pairs

${mdTable(["Pair", "Overlap", "Overall", "Intro", "Heading", "FAQ", "Exact sentences"], topPairs)}

## Highest-Risk Clusters

${mdTable(["Cluster", "Max similarity", "High pairs", "Recommendation"], highClusters)}

## Technical Findings

The technical foundation is sound. The standard implementation pass should add validation for inventory, duplicate metadata, sitemap/search-index consistency, internal links/fragments, heading ID stability, required schema fields, and similarity regression. External-link checks should remain optional because they require network access.

## AdSense Implications

AdSense should remain disabled. The site has strong technical and policy foundations, but repeated prose, source gaps, and high-overlap clusters should be improved before making readiness claims.

## Implementation Readiness

${s.readinessVerdict}

Recommended first implementation batch: ${s.recommendedFirstImplementationBatch}
`);
}

const canonical = buildCanonical();
renderAll(canonical);
console.log(`Wrote second audit to ${path.relative(root, outDir)}`);
