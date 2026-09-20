import axeSource from "axe-core";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const root = process.cwd();
const port = process.env.BUDDHIST_QUESTIONS_AUDIT_PORT || "4321";
const baseUrl = process.env.BUDDHIST_QUESTIONS_AUDIT_BASE_URL || `http://127.0.0.1:${port}`;
const chromePath = process.env.CHROME_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const canonicalOutput = path.join(root, "docs/audits/buddhist-question-q5-2026-09-20/BROWSER_VALIDATION.json");
const artifactOutput = process.env.AUDIT_OUT_DIR
  ? path.resolve(root, process.env.AUDIT_OUT_DIR, "buddhist-questions-browser-validation.json")
  : canonicalOutput;
const consentKey = "echo_buddha_privacy_consent";
const consentVersion = "2026-08-13";
const hub = "/learn/questions-about-buddhism/";
const routes = [
  hub,
  "/learn/questions-about-buddhism/did-buddha-order-buddha-images/",
  "/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/",
  "/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/",
  "/learn/questions-about-buddhism/why-no-buddha-statue-at-jetavana/",
  "/learn/questions-about-buddhism/why-bodhi-tree-planted-at-jetavana/"
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 }
];
const expectedNavigation = {
  [routes[1]]: [routes[2]],
  [routes[2]]: [routes[1], routes[3]],
  [routes[3]]: [routes[2], routes[4]],
  [routes[4]]: [routes[3], routes[5]],
  [routes[5]]: [routes[4]]
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let preview;

async function waitForPreview() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Preview has not started yet.
    }
    await sleep(250);
  }
  throw new Error(`Preview server did not start at ${baseUrl}`);
}

async function previewIsReady() {
  try {
    const response = await fetch(baseUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function stopPreview() {
  if (!preview || preview.exitCode !== null) return;
  const exited = new Promise((resolve) => preview.once("exit", resolve));
  preview.kill("SIGTERM");
  await Promise.race([exited, sleep(3_000)]);
  if (preview.exitCode === null) preview.kill("SIGKILL");
}

try {
  if (!process.env.BUDDHIST_QUESTIONS_AUDIT_BASE_URL && !(await previewIsReady())) {
    preview = spawn(process.execPath, [path.join(root, "node_modules/astro/bin/astro.mjs"), "preview", "--host", "127.0.0.1", "--port", port], {
      cwd: root,
      stdio: ["ignore", "ignore", "inherit"]
    });
    await waitForPreview();
  }

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  const results = [];
  try {
    for (const route of routes) {
      for (const viewport of viewports) {
        const context = await browser.newContext({ viewport });
        await context.route(/https:\/\/(?:www\.googletagmanager\.com|(?:[^/]+\.)?google-analytics\.com|pagead2\.googlesyndication\.com)\//, (request) => request.abort("blockedbyclient"));
        await context.addInitScript(({ key, version }) => {
          localStorage.setItem(key, JSON.stringify({ analytics: false, version, updatedAt: new Date().toISOString() }));
        }, { key: consentKey, version: consentVersion });
        const page = await context.newPage();
        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
        await page.addScriptTag({ content: axeSource.source });
        await page.keyboard.press("Tab");
        const axe = await page.evaluate(async () => window.axe.run(document, {
          resultTypes: ["violations"],
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] }
        }));
        const pageFacts = await page.evaluate(() => {
          const ranks = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => Number(heading.tagName.slice(1)));
          const focused = document.activeElement;
          const focusStyle = focused instanceof HTMLElement ? getComputedStyle(focused) : null;
          return {
            h1Count: document.querySelectorAll("h1").length,
            headingRanks: ranks,
            horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
            replacementCharacters: (document.body.innerText.match(/�/g) || []).length,
            cardCount: document.querySelectorAll(".question-card").length,
            keyboardFocusTarget: focused instanceof HTMLElement ? `${focused.tagName.toLowerCase()}.${focused.className}` : null,
            keyboardFocusVisible: Boolean(focused && focused !== document.body && focusStyle && (
              (focusStyle.outlineStyle !== "none" && focusStyle.outlineWidth !== "0px") || focusStyle.boxShadow !== "none"
            )),
            navigationLinks: [...document.querySelectorAll(".question-navigation a")].map((link) => new URL(link.href).pathname),
            externalSourceLinks: [...document.querySelectorAll(".source-list a[target=\"_blank\"]")].map((link) => link.href)
          };
        });
        const seriousViolations = axe.violations.filter((violation) => ["critical", "serious"].includes(violation.impact));
        const headingSkips = pageFacts.headingRanks.filter((rank, index) => index > 0 && rank > pageFacts.headingRanks[index - 1] + 1);
        const expectedLinks = expectedNavigation[route] || [];
        const checks = {
          status200: response?.status() === 200,
          singleH1: pageFacts.h1Count === 1,
          noHorizontalOverflow: pageFacts.horizontalOverflow <= 1,
          noReplacementCharacters: pageFacts.replacementCharacters === 0,
          keyboardFocusVisible: pageFacts.keyboardFocusVisible,
          noHeadingSkips: headingSkips.length === 0,
          noCriticalOrSeriousAxeViolations: seriousViolations.length === 0,
          expectedHubCardCount: route !== hub || pageFacts.cardCount === 5,
          expectedNavigation: route === hub || JSON.stringify(pageFacts.navigationLinks) === JSON.stringify(expectedLinks),
          expectedQ5SourceCount: route !== routes[5] || pageFacts.externalSourceLinks.length === 3
        };
        const pass = Object.values(checks).every(Boolean);
        results.push({
          route,
          viewport,
          status: response?.status(),
          ...pageFacts,
          expectedNavigationLinks: expectedLinks,
          criticalOrSeriousViolations: seriousViolations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })),
          checks,
          pass
        });
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    routeCount: routes.length,
    viewportCount: viewports.length,
    combinations: results.length,
    criticalViolations: results.reduce((sum, result) => sum + result.criticalOrSeriousViolations.filter((item) => item.impact === "critical").length, 0),
    seriousViolations: results.reduce((sum, result) => sum + result.criticalOrSeriousViolations.filter((item) => item.impact === "serious").length, 0),
    pass: results.every((result) => result.pass),
    results
  };
  fs.mkdirSync(path.dirname(artifactOutput), { recursive: true });
  fs.writeFileSync(artifactOutput, `${JSON.stringify(report, null, 2)}\n`);
  if (artifactOutput !== canonicalOutput) {
    fs.writeFileSync(canonicalOutput, `${JSON.stringify(report, null, 2)}\n`);
  }
  if (!report.pass) {
    const failures = results.filter((result) => !result.pass).map((result) => ({
      route: result.route,
      viewport: result.viewport.name,
      failedChecks: Object.entries(result.checks).filter(([, passed]) => !passed).map(([name]) => name),
      criticalOrSeriousViolations: result.criticalOrSeriousViolations
    }));
    console.error(JSON.stringify({ failures }, null, 2));
    throw new Error(`Buddhist-question browser validation failed; inspect ${path.relative(root, artifactOutput)}`);
  }
  console.log(`Buddhist-question browser validation passed: ${results.length} route/viewport combinations, zero critical or serious accessibility violations.`);
} finally {
  await stopPreview();
}
