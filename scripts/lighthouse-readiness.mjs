import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const root = process.cwd();
const outDir = process.env.AUDIT_OUT_DIR
  ? path.resolve(root, process.env.AUDIT_OUT_DIR)
  : path.join(root, "docs/audits/final-readiness-remediation");
fs.mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4321";
const chromeFlags = "--headless=new --no-sandbox --disable-dev-shm-usage";
const pages = [
  ["/", "Homepage"],
  ["/articles/four-noble-truths-explained-simply/", "Cornerstone article"],
  ["/learn/buddhism-101/what-is-mindfulness/", "Learning page"],
  ["/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/", "Quote story"],
  ["/daily-reflections/one-honest-breath/", "Daily reflection"],
  ["/meditation/breathing-meditation/", "Meditation page"],
  ["/quotes/mindfulness/", "Topic hub"],
  ["/search/", "Search"],
  ["/tools/", "Tools"],
  ["/privacy-policy/", "Privacy"]
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForPreview() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep waiting.
    }
    await sleep(250);
  }
  throw new Error(`Preview server did not start at ${baseUrl}`);
}

function startPreview() {
  return spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4321"], {
    cwd: root,
    stdio: ["ignore", "ignore", "pipe"]
  });
}

function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function summarize(lhr, formFactor, pagePath, label) {
  const audit = (id) => lhr.audits[id]?.numericValue ?? "";
  const score = (category) => lhr.categories[category]?.score ?? null;
  return {
    formFactor,
    label,
    path: pagePath,
    performanceScore: score("performance"),
    accessibilityScore: score("accessibility"),
    fcpMs: audit("first-contentful-paint"),
    lcpMs: audit("largest-contentful-paint"),
    cls: audit("cumulative-layout-shift"),
    tbtMs: audit("total-blocking-time"),
    speedIndexMs: audit("speed-index"),
    totalByteWeight: audit("total-byte-weight")
  };
}

function runLighthouse(url, formFactor) {
  const args = [
    "lighthouse",
    url,
    "--quiet",
    "--output=json",
    "--only-categories=performance,accessibility",
    `--chrome-flags=${chromeFlags}`,
    formFactor === "desktop" ? "--preset=desktop" : "--form-factor=mobile"
  ];
  const result = spawnSync("npx", args, { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Lighthouse failed for ${url}`);
  }
  return JSON.parse(result.stdout);
}

let preview;
try {
  if (!process.env.AUDIT_BASE_URL) {
    preview = startPreview();
    await waitForPreview();
  }
  const mobile = [];
  const desktop = [];
  for (const [pagePath, label] of pages) {
    mobile.push(summarize(runLighthouse(`${baseUrl}${pagePath}`, "mobile"), "mobile", pagePath, label));
    desktop.push(summarize(runLighthouse(`${baseUrl}${pagePath}`, "desktop"), "desktop", pagePath, label));
  }
  fs.writeFileSync(path.join(outDir, "lighthouse-mobile.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseUrl,
    results: mobile
  }, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "lighthouse-desktop.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseUrl,
    results: desktop
  }, null, 2) + "\n");

  const rows = [...mobile, ...desktop];
  const keys = Object.keys(rows[0]);
  fs.writeFileSync(path.join(outDir, "performance-summary.csv"), [
    keys.join(","),
    ...rows.map((row) => keys.map((key) => csvEscape(row[key])).join(","))
  ].join("\n") + "\n");
  console.log("Lighthouse readiness check completed.");
} finally {
  preview?.kill("SIGTERM");
}
