import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const SITE_ORIGIN = "https://echobuddha.com";
export const GSC_PROPERTY = "sc-domain:echobuddha.com";
export const AUDIT_DIR = "docs/audits/phase-2-measurement-2026-09-29";
export const PRIVATE_EVIDENCE_DIR = path.join(AUDIT_DIR, "private-evidence");
export const DEFAULT_RAW_DIR = ".artifacts/phase2-gsc/raw";

export const PHASE_1 = Object.freeze({
  mainSha: "53125d0be7f2eb517f5992c50e20c4b8c85389d6",
  contentSha: "db1da81b19bc5291829cdafd475645d79c6025f5",
  cloudflareDeploymentId: "2e0ab350-8d36-46cd-b036-55fc0bbda40a",
  deploymentUtc: "2026-09-29T02:28:06.494709Z",
  transitionDayPt: "2026-09-28",
  preStart: "2026-08-31",
  preEnd: "2026-09-27",
  postStart: "2026-09-29",
  postEnd: "2026-10-26",
  earliestDecisionReview: "2026-10-29",
  sitemapCount: 165,
  searchRecordCount: 330
});

export const CLUSTERS = Object.freeze([
  { name: "Beginner Meditation", owner: "/meditation/meditation-for-beginners/" },
  { name: "Four Noble Truths", owner: "/learn/four-noble-truths/" },
  { name: "Noble Eightfold Path", owner: "/learn/eightfold-path/" },
  { name: "Buddhism for Beginners", owner: "/learn/buddhism-for-beginners/" },
  { name: "Impermanence / Anicca", owner: "/learn/buddhism-101/what-is-impermanence/" },
  { name: "Loving-kindness / Mettā", owner: "/meditation/loving-kindness-meditation/" }
]);

export const WATCHLIST = Object.freeze([
  {
    url: "/articles/how-to-meditate-for-beginners/",
    cluster: "Beginner Meditation",
    role: "PRACTICAL_APPLICATION",
    owner: "/meditation/meditation-for-beginners/",
    informationGain: "A first-seven-days habit plan with cues, fallback sessions, obstacle planning, ethical carryover, and review."
  },
  {
    url: "/articles/four-noble-truths-explained/",
    cluster: "Four Noble Truths",
    role: "MISCONCEPTION_OR_TASK_FRAMEWORK",
    owner: "/learn/four-noble-truths/",
    informationGain: "The four truths treated as comprehension, abandoning, realization, and cultivation tasks."
  },
  {
    url: "/articles/four-noble-truths-explained-simply/",
    cluster: "Four Noble Truths",
    role: "WORKED_APPLICATION",
    owner: "/learn/four-noble-truths/",
    informationGain: "One difficult conversation worked through all four truths with boundaries and a path response."
  },
  {
    url: "/articles/eightfold-path-explained/",
    cluster: "Noble Eightfold Path",
    role: "FRAMEWORK_SUPPORT",
    owner: "/learn/eightfold-path/",
    informationGain: "How view, intention, conduct, and mental cultivation reinforce one another."
  },
  {
    url: "/articles/eightfold-path-explained-daily-life/",
    cluster: "Noble Eightfold Path",
    role: "SCENARIO_APPLICATION",
    owner: "/learn/eightfold-path/",
    informationGain: "Three modern decisions involving digital speech, work ethics, and distracted listening."
  },
  {
    url: "/articles/noble-eightfold-path-practical-guide/",
    cluster: "Noble Eightfold Path",
    role: "PRACTICAL_APPLICATION",
    owner: "/learn/eightfold-path/",
    informationGain: "A repeatable weekly self-review and seven-day experiment."
  },
  {
    url: "/articles/what-is-buddhism-beginner-guide/",
    cluster: "Buddhism for Beginners",
    role: "MISCONCEPTION_OR_TASK_FRAMEWORK",
    owner: "/learn/buddhism-for-beginners/",
    informationGain: "Corrections for category, meditation, creator-god, and non-attachment misconceptions."
  },
  {
    url: "/articles/buddhism-for-beginners-simple-guide/",
    cluster: "Buddhism for Beginners",
    role: "NAVIGATION_HUB",
    owner: "/learn/buddhism-for-beginners/",
    informationGain: "Selection among big-picture, course, practice, terminology, and community learning routes."
  },
  {
    url: "/articles/impermanence-in-buddhism/",
    cluster: "Impermanence / Anicca",
    role: "MISCONCEPTION_OR_TASK_FRAMEWORK",
    owner: "/learn/buddhism-101/what-is-impermanence/",
    informationGain: "Five harmful misunderstandings corrected without turning anicca into nihilism."
  },
  {
    url: "/articles/buddhist-teachings-on-impermanence/",
    cluster: "Impermanence / Anicca",
    role: "SOURCE_STUDY",
    owner: "/learn/buddhism-101/what-is-impermanence/",
    informationGain: "Named-source relationships, translation cautions, and a method for reading early Buddhist passages."
  },
  {
    url: "/articles/impermanence-in-buddhism-letting-go/",
    cluster: "Impermanence / Anicca",
    role: "WORKED_APPLICATION",
    owner: "/learn/buddhism-101/what-is-impermanence/",
    informationGain: "A collapsed-plan scenario moving through loss, conditions, grip, and next action."
  },
  {
    url: "/articles/loving-kindness-meditation-guide/",
    cluster: "Loving-kindness / Mettā",
    role: "TROUBLESHOOTING",
    owner: "/meditation/loving-kindness-meditation/",
    informationGain: "Troubleshooting false phrases, absent warmth, grief, anger, self-kindness, and safety."
  },
  {
    url: "/articles/loving-kindness-meditation-beginners/",
    cluster: "Loving-kindness / Mettā",
    role: "PRACTICAL_APPLICATION",
    owner: "/meditation/loving-kindness-meditation/",
    informationGain: "Criteria and situation-specific construction for honest loving-kindness phrases."
  }
]);

export const DECISION_CLASSES = Object.freeze([
  "KEEP_DISTINCT",
  "KEEP_AND_STRENGTHEN",
  "REPOSITION_FURTHER",
  "HOLD_MORE_DATA",
  "MERGE_301_CANDIDATE",
  "NOINDEX_REVIEW"
]);

export function parseCsv(text) {
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
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  while (rows.length && rows.at(-1).every((value) => value === "")) rows.pop();
  const headers = rows.shift() ?? [];
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

export function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function csvString(headers, rows) {
  return [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n") + "\n";
}

export function writeCsv(filePath, headers, rows) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, csvString(headers, rows));
}

export function readCsvIfPresent(filePath) {
  return fs.existsSync(filePath) ? parseCsv(fs.readFileSync(filePath, "utf8")) : [];
}

export function sha256File(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

export function absoluteUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return new URL(value).toString();
  return new URL(value.startsWith("/") ? value : `/${value}`, SITE_ORIGIN).toString();
}

export function routeFromUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value, SITE_ORIGIN);
    return url.pathname.endsWith("/") || path.extname(url.pathname) ? url.pathname : `${url.pathname}/`;
  } catch {
    return value;
  }
}

export function finiteNumber(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isoDateOffset(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function aggregateRows(rows) {
  let clicks = 0;
  let impressions = 0;
  let weightedPosition = 0;
  for (const row of rows) {
    const rowClicks = finiteNumber(row.clicks) ?? 0;
    const rowImpressions = finiteNumber(row.impressions) ?? 0;
    const rowPosition = finiteNumber(row.position) ?? 0;
    clicks += rowClicks;
    impressions += rowImpressions;
    weightedPosition += rowPosition * rowImpressions;
  }
  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : null,
    position: impressions > 0 ? weightedPosition / impressions : null
  };
}

export function metricDelta(before, after) {
  if (before == null || after == null) return { absolute: null, percent: null };
  const absolute = after - before;
  return { absolute, percent: before === 0 ? null : absolute / before };
}

export function formatMetric(value, digits = 2) {
  if (value == null || !Number.isFinite(Number(value))) return "DATA_REQUIRED";
  return Number(value).toFixed(digits).replace(/\.00$/, "");
}

export function normalizeQuery(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b4\b/g, "four")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const QUERY_FAMILY_RULES = Object.freeze([
  ["four_noble_truths", /\b(four|4) noble truths?\b|\bcattari ariya saccani\b/i],
  ["eightfold_path", /\b(eightfold|8 fold|eight fold) path\b|\bariya atthangika magga\b/i],
  ["buddhism_for_beginners", /\bbuddhis(m|t).*(beginner|start|new)|\b(beginner|start).*(buddhis(m|t))\b/i],
  ["impermanence_anicca", /\bimpermanen(t|ce)\b|\banicca\b/i],
  ["loving_kindness_metta", /\bloving kindness\b|\bmetta\b/i],
  ["beginner_meditation", /\b(meditat(e|ion|ing)).*(beginner|start|first)|\b(beginner|start|first).*(meditat(e|ion|ing))\b/i]
]);

export function queryFamily(query) {
  const normalized = normalizeQuery(query);
  for (const [family, pattern] of QUERY_FAMILY_RULES) {
    if (pattern.test(normalized)) return family;
  }
  return normalized ? `unmapped:${normalized}` : "unmapped:";
}

export function markdownTable(headers, rows) {
  const clean = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
  return [
    `| ${headers.map(clean).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(clean).join(" | ")} |`)
  ].join("\n");
}

export function readPhase1Registry() {
  const filePath = "docs/audits/phase-1-resolve-strengthen-protect-2026-09-29/INTENT_OWNERSHIP_REGISTRY.json";
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function daysInclusive(start, end) {
  const milliseconds = new Date(`${end}T12:00:00Z`) - new Date(`${start}T12:00:00Z`);
  return Math.floor(milliseconds / 86_400_000) + 1;
}

export function resolveRawDir() {
  return process.env.ECHOBUDDHA_PHASE2_GSC_DIR || DEFAULT_RAW_DIR;
}
