import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const root = process.cwd();
const outDir = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-7-ux-navigation");
const screenshotDir = path.join(outDir, "browser-qa-screenshots");
const baseUrl = "http://127.0.0.1:4321";
const chromePath = process.env.CHROME_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const consentKey = "echo_buddha_privacy_consent";
const consentVersion = "2026-07-21";

fs.mkdirSync(screenshotDir, { recursive: true });

const pages = [
  ["/", "homepage"],
  ["/start-here/", "start-here"],
  ["/learn/", "learn"],
  ["/learn/buddhism-for-beginners/", "beginner-learning"],
  ["/learn/four-noble-truths/", "four-noble-truths"],
  ["/learn/eightfold-path/", "eightfold-path"],
  ["/meditation/", "meditation"],
  ["/meditation/meditation-for-beginners/", "beginner-meditation"],
  ["/meditation/walking-meditation/", "walking-meditation"],
  ["/articles/", "articles"],
  ["/articles/four-noble-truths-explained-simply/", "article"],
  ["/quotes/", "quotes"],
  ["/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/", "quote-story"],
  ["/daily-reflections/", "daily-reflections"],
  ["/daily-reflections/one-honest-breath/", "daily-reflection"],
  ["/learn/buddhist-dictionary/metta/", "dictionary"],
  ["/learn/sutta-for-daily-life/kalama-sutta-and-wise-thinking/", "sutta"],
  ["/learn/dhammapada-reflections/hatred-is-not-ended-by-hatred/", "dhammapada"],
  ["/search/", "search"],
  ["/tools/", "tools"],
  ["/about/", "about"],
  ["/editorial-policy/", "editorial-policy"],
  ["/buddhist-sources-and-citations/", "sources"],
  ["/corrections/", "corrections"],
  ["/contact/", "contact"],
  ["/meditation-safety/", "meditation-safety"],
  ["/404.html", "404"]
];

const viewports = [
  [360, 800, "small-phone"],
  [390, 844, "large-phone"],
  [768, 1024, "tablet"],
  [1024, 800, "narrow-desktop"],
  [1440, 1000, "wide-desktop"]
];

const screenshotLabels = new Set([
  "homepage",
  "start-here",
  "learn",
  "meditation",
  "articles",
  "article",
  "quotes",
  "daily-reflections",
  "search",
  "about",
  "meditation-safety",
  "404"
]);

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
  throw new Error("Preview server did not start");
}

function startPreview() {
  return spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4321"], {
    cwd: root,
    stdio: ["ignore", "ignore", "pipe"]
  });
}

async function preparedContext(browser, options = {}) {
  const context = await browser.newContext(options);
  if (options.javaScriptEnabled !== false) {
    await context.addInitScript(({ key, version }) => {
      localStorage.setItem(key, JSON.stringify({ analytics: false, version, updatedAt: new Date().toISOString() }));
    }, { key: consentKey, version: consentVersion });
  }
  return context;
}

const preview = startPreview();
let browser;
const visualRows = [];
const journeyRows = [];
const interactionChecks = [];

try {
  await waitForPreview();
  browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

  for (const [width, height, viewportLabel] of viewports) {
    const context = await preparedContext(browser, { viewport: { width, height } });
    for (const [pagePath, pageLabel] of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`${baseUrl}${pagePath}`, { waitUntil: "load" });
      const metrics = await page.evaluate(() => ({
        h1Count: document.querySelectorAll("h1").length,
        mainCount: document.querySelectorAll("main#main-content").length,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        navCount: document.querySelectorAll("#main-navigation a").length,
        currentNavCount: document.querySelectorAll("#main-navigation a[aria-current]").length,
        title: document.title
      }));
      const expectedStatus = pagePath === "/404.html" ? 200 : 200;
      const pass = response?.status() === expectedStatus && metrics.h1Count === 1 && metrics.mainCount === 1 && !metrics.horizontalOverflow && metrics.navCount === 5 && errors.length === 0;
      visualRows.push({ pagePath, pageLabel, viewportLabel, width, height, status: response?.status(), ...metrics, errors, pass });
      if (screenshotLabels.has(pageLabel) && ["small-phone", "wide-desktop"].includes(viewportLabel)) {
        await page.screenshot({ path: path.join(screenshotDir, `${pageLabel}-${viewportLabel}.png`), fullPage: true });
      }
      await page.close();
    }
    await context.close();
  }

  const mobileContext = await preparedContext(browser, { viewport: { width: 390, height: 844 }, isMobile: true });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${baseUrl}/learn/four-noble-truths/`, { waitUntil: "networkidle" });
  const activeNav = await mobilePage.locator("#main-navigation a[aria-current]").textContent();
  await mobilePage.locator("[data-menu-toggle]").click();
  const focusEnteredMenu = await mobilePage.evaluate(() => document.activeElement?.closest("#main-navigation") !== null);
  await mobilePage.keyboard.press("Escape");
  const escapeReturnedFocus = await mobilePage.evaluate(() => document.activeElement?.matches("[data-menu-toggle]") === true);
  await mobilePage.locator("[data-menu-toggle]").click();
  await mobilePage.locator("main").click({ position: { x: 5, y: 5 } });
  const outsideClickClosed = await mobilePage.locator("[data-menu-toggle]").getAttribute("aria-expanded") === "false";
  interactionChecks.push({ name: "Mobile menu focus, active state, Escape, and outside click", pass: activeNav?.trim() === "Learn" && focusEnteredMenu && escapeReturnedFocus && outsideClickClosed, details: { activeNav, focusEnteredMenu, escapeReturnedFocus, outsideClickClosed } });

  const searchTrigger = mobilePage.locator("[data-search-open]");
  await searchTrigger.click();
  await mobilePage.locator("[data-search-input]").waitFor({ state: "visible" });
  await mobilePage.waitForTimeout(50);
  const searchInputFocused = await mobilePage.evaluate(() => document.activeElement?.matches("[data-search-input]") === true);
  await mobilePage.locator("[data-search-input]").fill("metta");
  await mobilePage.waitForTimeout(350);
  const mettaLabels = await mobilePage.locator("[data-search-results] .search-result__label").allTextContents();
  await mobilePage.keyboard.press("Escape");
  const searchFocusReturned = await mobilePage.evaluate(() => document.activeElement?.matches("[data-search-open]") === true);
  interactionChecks.push({
    name: "Search dialog focus and metta result distinction",
    pass: searchInputFocused && searchFocusReturned && ["Buddhist Term", "Meditation Guide", "Article"].every((type) => mettaLabels.some((label) => label.includes(type))),
    details: { searchInputFocused, searchFocusReturned, mettaLabels: [...new Set(mettaLabels)] }
  });

  await mobilePage.goto(`${baseUrl}/search/?q=phase7-no-such-topic`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(350);
  const pageSearchRoot = mobilePage.locator('[data-search-root][data-search-mode="page"]');
  const noResultsVisible = await pageSearchRoot.locator("[data-search-no-results]").isVisible();
  await pageSearchRoot.locator("[data-search-no-results] [data-search-clear]").click();
  const clearedQuery = await pageSearchRoot.locator("[data-search-input]").inputValue();
  interactionChecks.push({ name: "Search no-results recovery", pass: noResultsVisible && clearedQuery === "", details: { noResultsVisible, clearedQuery } });

  await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await mobilePage.keyboard.press("Tab");
  const skipFocused = await mobilePage.evaluate(() => document.activeElement?.matches(".skip-link") === true);
  await mobilePage.keyboard.press("Enter");
  const skipTargetedMain = await mobilePage.evaluate(() => location.hash === "#main-content");
  interactionChecks.push({ name: "Skip link keyboard path", pass: skipFocused && skipTargetedMain, details: { skipFocused, skipTargetedMain } });
  await mobileContext.close();

  const noJsContext = await preparedContext(browser, { viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(`${baseUrl}/`, { waitUntil: "load" });
  const noJsNavVisible = await noJsPage.locator("#main-navigation").isVisible();
  const noJsToggleVisible = await noJsPage.locator("[data-menu-toggle]").isVisible();
  interactionChecks.push({ name: "Mobile navigation remains usable without JavaScript", pass: noJsNavVisible && !noJsToggleVisible, details: { noJsNavVisible, noJsToggleVisible } });
  await noJsContext.close();

  const missingContext = await preparedContext(browser, { viewport: { width: 1280, height: 900 } });
  const missingPage = await missingContext.newPage();
  const missingResponse = await missingPage.goto(`${baseUrl}/phase-7-definitely-missing/`, { waitUntil: "networkidle" });
  const recoveryHrefs = await missingPage.locator(".not-found-links a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  interactionChecks.push({ name: "Actual 404 status and recovery", pass: missingResponse?.status() === 404 && ["/", "/search/", "/start-here/"].every((href) => recoveryHrefs.includes(href)), details: { status: missingResponse?.status(), recoveryHrefs } });
  await missingContext.close();

  const journeys = [
    ["Newcomer", "/", "/start-here/", "/learn/buddhism-for-beginners/"],
    ["Learn foundations", "/", "/learn/", "/learn/four-noble-truths/"],
    ["Practice", "/", "/meditation/", "/meditation/meditation-for-beginners/"],
    ["Editorial reading", "/", "/articles/", "/articles/four-noble-truths-explained-simply/"],
    ["Daily return", "/", "/daily-reflections/today/", "/daily-reflections/"],
    ["Trust verification", "/articles/four-noble-truths-explained-simply/", "/authors/echo-buddha-editorial/", "/buddhist-sources-and-citations/"],
    ["Quote reflection", "/", "/quotes/", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/"],
    ["Error recovery", "/phase-7-definitely-missing/", "/search/", "/start-here/"]
  ];
  const journeyContext = await preparedContext(browser, { viewport: { width: 1280, height: 900 } });
  for (const [name, ...stops] of journeys) {
    const journeyPage = await journeyContext.newPage();
    const statuses = [];
    for (const stop of stops) {
      const response = await journeyPage.goto(`${baseUrl}${stop}`, { waitUntil: "networkidle" });
      statuses.push(response?.status());
    }
    const pass = statuses.every((status, index) => status === (stops[index].includes("definitely-missing") ? 404 : 200));
    journeyRows.push({ name, stops, statuses, pass });
    await journeyPage.close();
  }
  await journeyContext.close();

  const visualPass = visualRows.every((row) => row.pass);
  const interactionPass = interactionChecks.every((check) => check.pass);
  const journeyPass = journeyRows.every((row) => row.pass);
  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    pass: visualPass && interactionPass && journeyPass,
    summary: {
      pages: pages.length,
      viewports: viewports.length,
      visualCombinations: visualRows.length,
      visualPassed: visualRows.filter((row) => row.pass).length,
      interactions: interactionChecks.length,
      interactionsPassed: interactionChecks.filter((row) => row.pass).length,
      journeys: journeyRows.length,
      journeysPassed: journeyRows.filter((row) => row.pass).length,
      screenshots: screenshotLabels.size * 2
    },
    interactionChecks,
    journeyRows,
    visualRows
  };
  fs.writeFileSync(path.join(outDir, "phase-7-browser-qa.json"), `${JSON.stringify(result, null, 2)}\n`);
  const headers = ["Page", "Viewport", "Width", "Height", "Status", "H1", "Main", "Overflow", "Navigation items", "Current nav", "Console errors", "Pass"];
  const csv = [headers.join(","), ...visualRows.map((row) => [row.pagePath, row.viewportLabel, row.width, row.height, row.status, row.h1Count, row.mainCount, row.horizontalOverflow, row.navCount, row.currentNavCount, row.errors.length, row.pass ? "PASS" : "FAIL"].join(","))].join("\n");
  fs.writeFileSync(path.join(outDir, "phase-7-visual-qa.csv"), `${csv}\n`);
  console.log(`Phase 7 browser QA: ${result.pass ? "PASS" : "FAIL"} (${result.summary.visualPassed}/${result.summary.visualCombinations} viewport-page checks; ${result.summary.interactionsPassed}/${result.summary.interactions} interactions; ${result.summary.journeysPassed}/${result.summary.journeys} journeys)`);
  if (!result.pass) process.exitCode = 1;
} finally {
  await browser?.close();
  preview.kill("SIGTERM");
}
