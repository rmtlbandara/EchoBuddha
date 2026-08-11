import axeSource from "axe-core";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const root = process.cwd();
const outDir = process.env.AUDIT_OUT_DIR
  ? path.resolve(root, process.env.AUDIT_OUT_DIR)
  : path.join(root, "docs/audits/final-readiness-remediation");
fs.mkdirSync(outDir, { recursive: true });

const chromePath = process.env.CHROME_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4321";
const consentKey = "echo_buddha_privacy_consent";
const consentVersion = "2026-07-21";
const analyticsId = "G-6QB396HNKN";

const pages = [
  "/",
  "/start-here/",
  "/articles/four-noble-truths-explained-simply/",
  "/learn/buddhism-101/what-is-mindfulness/",
  "/learn/",
  "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/",
  "/quotes/mindfulness/",
  "/daily-reflections/one-honest-breath/",
  "/daily-reflections/today/",
  "/meditation/breathing-meditation/",
  "/search/",
  "/tools/",
  "/about/",
  "/contact/",
  "/editorial-policy/",
  "/privacy-policy/",
  "/missing-audit-url/"
].filter((pagePath) => !(process.env.AUDIT_SKIP_EXPECTED_404 && pagePath === "/missing-audit-url/"));

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

function requestKind(url) {
  if (url.includes("googletagmanager.com/gtag/js")) return "gtag-script";
  if (url.includes("google-analytics.com") || url.includes("/g/collect")) return "ga-collect";
  if (url.includes("adsbygoogle") || url.includes("pagead2.googlesyndication.com")) return "adsense";
  return "other";
}

async function withBrowser(callback) {
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  try {
    return await callback(browser);
  } finally {
    await browser.close();
  }
}

async function runConsentChecks(browser) {
  const results = {
    model: "Analytics defaults accepted without auto-opening the popup, matching current owner-approved repository behavior.",
    scenarios: []
  };

  const firstContext = await browser.newContext();
  const firstRequests = [];
  const firstPage = await firstContext.newPage();
  firstPage.on("request", (request) => firstRequests.push(request.url()));
  await firstPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const firstPreference = await firstPage.evaluate((key) => localStorage.getItem(key), consentKey);
  const panelOpen = await firstPage.locator("[data-consent-panel]").evaluate((node) => node.dataset.open);
  const firstCookies = await firstContext.cookies();
  results.scenarios.push({
    name: "first visit default accepted",
    pass: Boolean(firstPreference?.includes('"analytics":true')) && panelOpen === "false",
    details: {
      preference: firstPreference,
      panelOpen,
      gtagScriptRequests: firstRequests.filter((url) => requestKind(url) === "gtag-script").length,
      analyticsCollectionRequests: firstRequests.filter((url) => requestKind(url) === "ga-collect").length,
      adsenseRequests: firstRequests.filter((url) => requestKind(url) === "adsense").length,
      analyticsCookieCount: firstCookies.filter((cookie) => cookie.name.startsWith("_ga") || cookie.name === "_gid").length
    }
  });
  await firstContext.close();

  const rejectContext = await browser.newContext();
  await rejectContext.addInitScript(({ key, version }) => {
    localStorage.setItem(key, JSON.stringify({ analytics: false, version, updatedAt: new Date().toISOString() }));
  }, { key: consentKey, version: consentVersion });
  const rejectRequests = [];
  const rejectPage = await rejectContext.newPage();
  rejectPage.on("request", (request) => rejectRequests.push(request.url()));
  await rejectPage.goto(`${baseUrl}/privacy-policy/`, { waitUntil: "networkidle" });
  const rejectPreference = await rejectPage.evaluate((key) => localStorage.getItem(key), consentKey);
  results.scenarios.push({
    name: "return visit after rejection",
    pass: Boolean(rejectPreference?.includes('"analytics":false')) &&
      rejectRequests.filter((url) => ["gtag-script", "ga-collect"].includes(requestKind(url))).length === 0,
    details: {
      preference: rejectPreference,
      analyticsRequests: rejectRequests.filter((url) => ["gtag-script", "ga-collect"].includes(requestKind(url))).length,
      adsenseRequests: rejectRequests.filter((url) => requestKind(url) === "adsense").length
    }
  });

  await rejectPage.locator("[data-privacy-settings]").first().click();
  await rejectPage.locator("[data-consent-accept]").click();
  await rejectPage.waitForTimeout(700);
  const acceptPreference = await rejectPage.evaluate((key) => localStorage.getItem(key), consentKey);
  const acceptRequestCount = rejectRequests.filter((url) => requestKind(url) === "gtag-script").length;
  results.scenarios.push({
    name: "accept analytics from privacy settings",
    pass: Boolean(acceptPreference?.includes('"analytics":true')) && acceptRequestCount === 1,
    details: { preference: acceptPreference, gtagScriptRequests: acceptRequestCount }
  });

  await rejectPage.locator("[data-privacy-settings]").first().click();
  await rejectPage.keyboard.press("Tab");
  await rejectPage.keyboard.press("Enter");
  await rejectPage.waitForTimeout(300);
  const withdrawalPreference = await rejectPage.evaluate((key) => localStorage.getItem(key), consentKey);
  const withdrawalCookies = await rejectContext.cookies();
  results.scenarios.push({
    name: "keyboard withdrawal through reopened settings",
    pass: Boolean(withdrawalPreference?.includes('"analytics":false')),
    details: {
      preference: withdrawalPreference,
      analyticsCookieCount: withdrawalCookies.filter((cookie) => cookie.name.startsWith("_ga") || cookie.name === "_gid").length
    }
  });
  await rejectContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobileContext.addInitScript(({ key, version }) => {
    localStorage.setItem(key, JSON.stringify({ analytics: false, version, updatedAt: new Date().toISOString() }));
  }, { key: consentKey, version: consentVersion });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await mobilePage.locator("[data-menu-toggle]").click();
  const navVisible = await mobilePage.locator("#main-navigation").isVisible();
  await mobilePage.locator("[data-privacy-settings]").first().click();
  const acceptFocused = await mobilePage.evaluate(() => document.activeElement?.matches("[data-consent-accept]"));
  await mobilePage.keyboard.press("Escape");
  const closed = await mobilePage.locator("[data-consent-panel]").evaluate((node) => node.dataset.open === "false");
  results.scenarios.push({
    name: "mobile navigation and consent keyboard escape",
    pass: navVisible && acceptFocused && closed,
    details: { navVisible, acceptFocused, closed }
  });
  await mobileContext.close();

  results.pass = results.scenarios.every((scenario) => scenario.pass);
  return results;
}

async function runAccessibilityChecks(browser) {
  const rows = [];
  for (const pagePath of pages) {
    const context = await browser.newContext({
      viewport: pagePath === "/" ? { width: 390, height: 844 } : { width: 1280, height: 900 }
    });
    await context.addInitScript(({ key, version }) => {
      localStorage.setItem(key, JSON.stringify({ analytics: false, version, updatedAt: new Date().toISOString() }));
    }, { key: consentKey, version: consentVersion });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${pagePath}`, { waitUntil: "networkidle" });
    await page.addScriptTag({ content: axeSource.source });
    const result = await page.evaluate(async () => window.axe.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] }
    }));
    const h1Count = await page.locator("h1").count();
    const mainCount = await page.locator("main").count();
    rows.push({
      path: pagePath,
      h1Count,
      mainCount,
      violations: result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact || "unknown",
        nodes: violation.nodes.length,
        help: violation.help
      }))
    });
    await context.close();
  }

  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0, unknown: 0 };
  for (const row of rows) {
    for (const violation of row.violations) {
      counts[violation.impact] = (counts[violation.impact] || 0) + violation.nodes;
    }
  }
  return {
    pagesTested: rows.length,
    counts,
    rows,
    pass: counts.critical === 0 && counts.serious === 0
  };
}

let preview;
try {
  if (!process.env.AUDIT_BASE_URL) {
    preview = startPreview();
    await waitForPreview();
  }
  const { consentResults, accessibilityResults } = await withBrowser(async (browser) => ({
    consentResults: await runConsentChecks(browser),
    accessibilityResults: await runAccessibilityChecks(browser)
  }));

  fs.writeFileSync(path.join(outDir, "consent-browser-results.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseUrl,
    analyticsId,
    ...consentResults
  }, null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "accessibility-browser-results.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseUrl,
    ...accessibilityResults
  }, null, 2) + "\n");

  if (!consentResults.pass || !accessibilityResults.pass) {
    console.error("Browser readiness check failed.");
    process.exit(1);
  }
  console.log("Browser readiness check passed.");
} finally {
  preview?.kill("SIGTERM");
}
