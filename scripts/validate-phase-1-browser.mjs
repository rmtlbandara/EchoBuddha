import axeSource from "axe-core";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const auditDir = path.join(root, "docs", "audits", "phase-1-resolve-strengthen-protect-2026-09-29");
const previewPort = "4399";
const baseUrl = process.env.AUDIT_BASE_URL || `http://127.0.0.1:${previewPort}`;
const chromePath = process.env.CHROME_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const consentKey = "echo_buddha_privacy_consent";
const consentVersion = "2026-08-13";
const generatedAt = "2026-09-29T00:00:00.000Z";

const routes = [
  ["/articles/how-to-meditate-for-beginners/", "Beginner Meditation"],
  ["/articles/four-noble-truths-explained-simply/", "Four Noble Truths"],
  ["/articles/eightfold-path-explained-daily-life/", "Noble Eightfold Path"],
  ["/articles/buddhism-for-beginners-simple-guide/", "Buddhism for Beginners"],
  ["/articles/impermanence-in-buddhism-letting-go/", "Impermanence / Anicca"],
  ["/articles/loving-kindness-meditation-guide/", "Loving-kindness / Mettā"],
  ["/articles/noble-eightfold-path-practical-guide/", "Numbered TOC regression"],
  ["/meditation/meditation-for-beginners/", "Meditation detail safety regression"],
  ["/meditation-guide/", "Comprehensive meditation reference"]
];

const viewports = [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "desktop", width: 1280, height: 900, isMobile: false }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};
const preview = process.env.AUDIT_BASE_URL ? null : http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", baseUrl).pathname);
  const relative = pathname === "/" ? "index.html" : pathname.endsWith("/") ? `${pathname.slice(1)}index.html` : pathname.slice(1);
  const file = path.resolve(root, "dist", relative);
  if (!file.startsWith(path.resolve(root, "dist") + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mimeTypes[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(response);
});

async function waitForPreview() {
  if (preview) await new Promise((resolve, reject) => preview.once("error", reject).listen(Number(previewPort), "127.0.0.1", resolve));
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if ((await fetch(baseUrl)).ok) return;
    } catch {
      // The preview process is still starting.
    }
    await sleep(250);
  }
  throw new Error(`Preview did not start at ${baseUrl}`);
}

async function stopPreview() {
  if (!preview?.listening) return;
  await new Promise((resolve) => preview.close(resolve));
}

const rows = [];
let browser;
try {
  await waitForPreview();
  browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      reducedMotion: "reduce"
    });
    await context.route(/https:\/\/(?:www\.googletagmanager\.com|(?:[^/]+\.)?google-analytics\.com|pagead2\.googlesyndication\.com)\//, (route) => route.abort("blockedbyclient"));
    await context.addInitScript(({ key, version }) => {
      localStorage.setItem(key, JSON.stringify({ analytics: false, version, updatedAt: "2026-09-29T00:00:00.000Z" }));
      window.__phase1Cls = 0;
      window.__phase1Lcp = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__phase1Cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.__phase1Lcp = entries.at(-1)?.startTime ?? window.__phase1Lcp;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    }, { key: consentKey, version: consentVersion });

    for (const [route, cluster] of routes) {
      const page = await context.newPage();
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 15_000 });
      await page.waitForLoadState("load");
      await page.waitForTimeout(150);
      await page.addScriptTag({ content: axeSource.source });
      const axe = await page.evaluate(async () => window.axe.run(document, {
        resultTypes: ["violations"],
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }
      }));
      const rendered = await page.evaluate(() => ({
        h1Count: document.querySelectorAll("h1").length,
        mainCount: document.querySelectorAll("main").length,
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? "",
        horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        emptyAltImages: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
        cls: window.__phase1Cls ?? 0,
        fcpMs: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0,
        lcpMs: window.__phase1Lcp ?? 0,
        tocLinkCount: document.querySelectorAll('.toc a[href^="#"]').length,
        visibleFaq: /Frequently asked questions/i.test(document.body.innerText),
        faqPageSchema: document.documentElement.innerHTML.includes('"@type":"FAQPage"'),
        howToSchema: document.documentElement.innerHTML.includes('"@type":"HowTo"')
      }));
      const seriousViolations = axe.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
      const expectedCanonical = `https://echobuddha.com${route}`;
      const pass = response?.status() === 200 && rendered.h1Count === 1 && rendered.mainCount === 1 && rendered.title &&
        rendered.canonical === expectedCanonical && rendered.horizontalOverflowPx <= 1 && rendered.emptyAltImages === 0 &&
        rendered.brokenImages === 0 && rendered.cls < 0.1 && rendered.fcpMs > 0 && rendered.fcpMs < 1_800 &&
        rendered.lcpMs > 0 && rendered.lcpMs < 2_500 && seriousViolations.length === 0 &&
        !rendered.faqPageSchema && !rendered.howToSchema;
      rows.push({
        route,
        cluster,
        viewport: viewport.name,
        statusCode: response?.status() ?? 0,
        ...rendered,
        criticalOrSeriousAxeViolations: seriousViolations.map((violation) => `${violation.id}:${violation.nodes.length}`),
        pass
      });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser?.close();
  await stopPreview();
}

const result = {
  generatedAt,
  status: rows.every((row) => row.pass) ? "PASS" : "FAIL",
  routesTested: routes.length,
  viewportsTested: viewports.length,
  totalRenderedChecks: rows.length,
  rows
};

fs.mkdirSync(auditDir, { recursive: true });
fs.writeFileSync(path.join(auditDir, "UX_MOBILE_VALIDATION.json"), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(auditDir, "UX_MOBILE_VALIDATION.md"), `# UX and Mobile Validation\n\nStatus: **${result.status}**  \nChecked: 2026-09-29\n\nNine representative routes cover all six remediated clusters plus the numbered-TOC, meditation-safety, and comprehensive-guide template changes. Each route was rendered at 390 × 844 and 1280 × 900.\n\n## Results\n\n- Rendered route/viewport combinations: ${rows.length}\n- HTTP/canonical/title/H1/main checks: ${rows.filter((row) => row.statusCode === 200 && row.canonical === `https://echobuddha.com${row.route}` && row.title && row.h1Count === 1 && row.mainCount === 1).length}/${rows.length}\n- Horizontal-overflow failures: ${rows.filter((row) => row.horizontalOverflowPx > 1).length}\n- Broken or missing-alt images: ${rows.reduce((sum, row) => sum + row.brokenImages + row.emptyAltImages, 0)}\n- Critical/serious axe violations: ${rows.reduce((sum, row) => sum + row.criticalOrSeriousAxeViolations.length, 0)}\n- Layout-shift threshold failures (CLS ≥ 0.1): ${rows.filter((row) => row.cls >= 0.1).length}\n- FCP/LCP threshold failures (FCP ≥ 1.8s or LCP ≥ 2.5s): ${rows.filter((row) => !row.fcpMs || !row.lcpMs || row.fcpMs >= 1_800 || row.lcpMs >= 2_500).length}\n- Obsolete FAQPage/HowTo schema observed: ${rows.filter((row) => row.faqPageSchema || row.howToSchema).length}\n\nLocal paint measurements are regression gates, not field Core Web Vitals. Production CWV should continue to be monitored after deployment.\n\n## Route matrix\n\n| Cluster / regression | Route | Mobile | Desktop |\n|---|---|---:|---:|\n${routes.map(([route, cluster]) => `| ${cluster} | \`${route}\` | ${rows.find((row) => row.route === route && row.viewport === "mobile")?.pass ? "PASS" : "FAIL"} | ${rows.find((row) => row.route === route && row.viewport === "desktop")?.pass ? "PASS" : "FAIL"} |`).join("\n")}\n`);

for (const row of rows) console.log(`${row.pass ? "PASS" : "FAIL"} ${row.viewport.padEnd(7)} ${row.route}`);
if (result.status !== "PASS") {
  console.error(`Phase 1 browser validation failed for ${rows.filter((row) => !row.pass).length}/${rows.length} rendered combinations.`);
  process.exit(1);
}
console.log(`Phase 1 browser validation passed: ${rows.length}/${rows.length} rendered combinations.`);
