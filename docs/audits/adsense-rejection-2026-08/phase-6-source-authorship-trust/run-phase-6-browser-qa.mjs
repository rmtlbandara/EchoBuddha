import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "docs/audits/adsense-rejection-2026-08/phase-6-source-authorship-trust");
const SHOTS = path.join(OUT, "browser-qa-screenshots");
const BASE = "http://127.0.0.1:4321";
fs.mkdirSync(SHOTS, { recursive: true });
const routes = [
  ["Homepage", "/"], ["About", "/about/"], ["Author profile", "/authors/echo-buddha-editorial/"], ["Editorial policy", "/editorial-policy/"],
  ["Content process", "/how-echo-buddha-creates-content/"], ["Sources", "/buddhist-sources-and-citations/"], ["Quote attribution", "/quote-attribution-policy/"], ["Corrections", "/corrections/"],
  ["Contact", "/contact/"], ["Meditation safety", "/meditation-safety/"], ["Disclaimer", "/disclaimer/"], ["Privacy", "/privacy-policy/"], ["Terms", "/terms-of-use/"],
  ["Karma article", "/articles/what-is-karma-in-buddhism/"], ["Karma dictionary", "/learn/buddhist-dictionary/karma/"], ["Dhammapada study", "/learn/dhammapada-reflections/the-mind-leads-all-things/"],
  ["Sutta study", "/learn/sutta-for-daily-life/metta-sutta-explained-for-daily-life/"], ["Quote story", "/quotes/mindfulness/a-peaceful-mind-begins-with-one-honest-breath/"], ["Meditation detail", "/meditation/breathing-meditation/"]
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4321"], { cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] });
try {
  for (let i = 0; i < 80; i += 1) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(250); }
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const results = [];
  try {
    for (const [label, route] of routes) {
      for (const viewport of [{ name: "mobile", width: 390, height: 844 }, { name: "desktop", width: 1440, height: 1000 }]) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
        const errors = [];
        page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
        page.on("pageerror", (error) => errors.push(error.message));
        const response = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
        const metrics = await page.evaluate(() => ({ h1: document.querySelectorAll("h1").length, main: document.querySelectorAll("main").length, title: document.title, horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, emptyLinks: [...document.querySelectorAll("a")].filter((a) => !(a.textContent || "").trim() && !a.getAttribute("aria-label")).length }));
        const slug = route === "/" ? "home" : route.split("/").filter(Boolean).join("-");
        const screenshot = path.join(SHOTS, `${String(results.length + 1).padStart(2, "0")}-${slug}-${viewport.name}.png`);
        await page.screenshot({ path: screenshot, fullPage: true });
        const pass = response?.status() === 200 && metrics.h1 === 1 && metrics.main === 1 && !metrics.horizontalOverflow && metrics.emptyLinks === 0 && errors.length === 0;
        results.push({ label, route, viewport: viewport.name, status: response?.status(), ...metrics, consoleErrors: errors.length, screenshot: path.relative(ROOT, screenshot), result: pass ? "PASS" : "FAIL" });
        await page.close();
      }
    }
  } finally { await browser.close(); }
  const keys = Object.keys(results[0]);
  const esc = (value) => /[",\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replaceAll('"', '""')}"` : String(value ?? "");
  fs.writeFileSync(path.join(OUT, "phase-6-visual-qa.csv"), `${[keys.join(","), ...results.map((row) => keys.map((key) => esc(row[key])).join(","))].join("\n")}\n`);
  fs.writeFileSync(path.join(OUT, "phase-6-browser-qa.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), namedRoutes: routes.length, viewportRuns: results.length, pass: results.every((row) => row.result === "PASS"), results }, null, 2)}\n`);
  console.log(`Phase 6 browser QA: ${results.filter((row) => row.result === "PASS").length}/${results.length} viewport runs passed across ${routes.length} named routes.`);
  if (results.some((row) => row.result === "FAIL")) process.exit(1);
} finally { preview.kill("SIGTERM"); }
