import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const root = process.cwd();
const auditDir = path.join(root, "docs/audits/aug-5-2026-content-quality-remediation");
const outDir = path.join(auditDir, "visual-qa");
const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4322";
const chromePath = process.env.CHROME_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const pages = [
  "/articles/dhamma-vs-dharma/",
  "/articles/visiting-a-buddhist-temple-respectfully/",
  "/articles/first-week-buddhist-practice/",
  "/articles/non-attachment-in-relationships/",
  "/articles/right-speech-examples/",
  "/articles/dhammapada-verse-1-meaning/",
  "/learn/buddhism-101/middle-way-explained-for-beginners/",
  "/learn/buddhism-101/threefold-training-sila-samadhi-panna/",
  "/learn/buddhism-101/five-hindrances-in-buddhism/",
  "/learn/buddhism-101/four-brahmaviharas/",
  "/learn/sutta-for-daily-life/dhammacakkappavattana-sutta-four-noble-truths/",
  "/learn/sutta-for-daily-life/magga-vibhanga-sutta-eightfold-path/",
  "/learn/buddhist-dictionary/sutta/",
  "/learn/buddhist-dictionary/pali-canon/",
  "/meditation/10-minute-meditation-practice/",
  "/meditation/meditation-posture-for-beginners/",
  "/meditation/when-meditation-feels-hard/",
  "/articles/mindful-email-and-texting/",
  "/articles/compassion-with-boundaries/"
];

const viewports = [
  { label: "desktop", width: 1366, height: 900 },
  { label: "mobile", width: 390, height: 844, isMobile: true }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function startPreview() {
  return spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4322"], {
    cwd: root,
    stdio: ["ignore", "ignore", "pipe"]
  });
}

async function waitForPreview() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep waiting while Astro preview starts.
    }
    await sleep(250);
  }
  throw new Error(`Preview server did not start at ${baseUrl}`);
}

function fileStem(pagePath, viewport) {
  const stem = pagePath.replace(/^\/|\/$/g, "").replaceAll("/", "__");
  return `${stem}__${viewport.label}.png`;
}

fs.mkdirSync(outDir, { recursive: true });

let preview;
const results = [];
try {
  preview = startPreview();
  await waitForPreview();
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: Boolean(viewport.isMobile)
      });

      await context.addInitScript(() => {
        localStorage.setItem("echo_buddha_privacy_consent", JSON.stringify({
          analytics: false,
          version: "2026-07-21",
          updatedAt: new Date().toISOString()
        }));
      });

      for (const pagePath of pages) {
        const page = await context.newPage();
        const response = await page.goto(`${baseUrl}${pagePath}`, { waitUntil: "networkidle" });
        const screenshot = fileStem(pagePath, viewport);
        await page.screenshot({ path: path.join(outDir, screenshot), fullPage: true });
        const metrics = await page.evaluate(() => {
          const main = document.querySelector("main");
          const text = main?.innerText || document.body.innerText || "";
          const sourceLinks = [...document.querySelectorAll("a[href^='http']")].map((link) => link.href);
          return {
            title: document.title,
            h1Count: document.querySelectorAll("h1").length,
            h1: document.querySelector("h1")?.textContent?.trim() || "",
            bodyWords: (text.match(/\b[A-Za-z][A-Za-z'’-]*\b/g) || []).length,
            sourceLinkCount: sourceLinks.length,
            hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
            hasSafetyOrSupportLanguage: /professional support|qualified support|medical|mental health|unsafe|harm|abuse|coerc/i.test(text),
            screenshotHeight: document.documentElement.scrollHeight
          };
        });
        results.push({
          path: pagePath,
          viewport: viewport.label,
          status: response?.status() ?? 0,
          screenshot,
          ...metrics,
          pass: (response?.ok() ?? false) && metrics.h1Count === 1 && !metrics.hasHorizontalOverflow
        });
        await page.close();
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
} finally {
  preview?.kill("SIGTERM");
}

const payload = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pagesTested: pages.length,
  viewportRuns: results.length,
  screenshotsDirectory: outDir,
  pass: results.every((result) => result.pass),
  results
};

fs.writeFileSync(path.join(outDir, "aug-5-visual-qa-results.json"), `${JSON.stringify(payload, null, 2)}\n`);

if (!payload.pass) {
  console.error("August 5 page visual QA found one or more failures.");
  process.exit(1);
}

console.log(`August 5 page visual QA passed for ${results.length} viewport runs.`);
