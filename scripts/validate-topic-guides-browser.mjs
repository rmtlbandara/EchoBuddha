import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { chromium, firefox, webkit } from "playwright-core";
import axe from "axe-core";

const origin = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4325";
const out = process.env.AUDIT_OUT_DIR || ".artifacts/topic-guide-browser";
const updated = process.env.GUIDE_EXPECT_UPDATED !== "0";
const routes = ["/learn/four-noble-truths/", "/learn/eightfold-path/", "/learn/buddhism-for-beginners/", "/learn/buddhism-101/what-is-impermanence/", "/meditation/meditation-for-beginners/", "/meditation/loving-kindness-meditation/", "/learn/buddhism-101/five-precepts-buddhism/", "/learn/buddhism-101/three-marks-of-existence/"];
const engines = { chromium, firefox, webkit };
const results = [];
let preview;
if (!process.env.AUDIT_BASE_URL) {
  preview = spawn(process.execPath, ["node_modules/astro/bin/astro.mjs", "preview", "--host", "127.0.0.1", "--port", "4325", "--ignore-lock"], { stdio: "ignore" });
  process.once("exit", () => preview.kill("SIGTERM"));
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch { /* Wait for local preview. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, "Topic guide preview did not start");
}
fs.mkdirSync(out, { recursive: true });
for (const name of (process.env.BROWSER_ENGINES || "chromium,firefox,webkit").split(",")) {
  const browser = await engines[name].launch({ headless: true });
  try {
    for (const [device, viewport] of Object.entries({ desktop: { width: 1440, height: 1000 }, tablet: { width: 768, height: 1024 }, mobile: { width: 390, height: 844 } })) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      await context.route(/googletagmanager\.com|google-analytics\.com/, route => route.abort());
      await context.addInitScript(() => localStorage.setItem("echo_buddha_privacy_consent", JSON.stringify({ analytics: false, version: "2026-08-13", updatedAt: new Date().toISOString() })));
      const page = await context.newPage();
      for (const route of routes) {
        const response = await page.goto(origin + route, { waitUntil: "domcontentloaded" });
        assert.equal(response.status(), 200, route);
        assert.equal(await page.locator("h1").count(), 1, route);
        assert.equal(await page.locator("main").count(), 1, route);
        if (updated) {
          assert.equal(await page.locator("table caption").count(), 1, route);
          assert.ok(await page.locator('th[scope="row"]').count() > 0, route);
          assert.equal(await page.locator('time[datetime="2026-10-23"]').count(), 1, `${route}: existing reference-table date`);
          if (route === "/learn/buddhism-101/five-precepts-buddhism/") {
            const updatedDate = page.locator('time[datetime="2026-10-30"]');
            assert.equal(await updatedDate.count(), 1, `${route}: approved source correction date`);
            assert.equal(await updatedDate.isVisible(), true, `${route}: source correction date visible`);
          }
          assert.ok(await page.locator(".topic-guide h3").count() > 0, route);
          // The scrollable table remains keyboard reachable even at 200% text zoom.
          await page.locator(".table-scroll").focus();
          assert.equal(await page.locator(".table-scroll").evaluate(el => el === document.activeElement), true, route);
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${device} overflow: ${route}`);
        await page.addScriptTag({ content: axe.source });
        const accessibility = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } }));
        const violations = accessibility.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
        results.push({ engine: name, device, route, status: response.status(), violations });
        if (name === "chromium" && device !== "tablet") await page.screenshot({ path: path.join(out, `${device}-${route.replaceAll("/", "_")}.png`), fullPage: true });
        assert.deepEqual(violations, [], `${name}/${device}/${route}`);
        console.log(`PASS ${name}/${device} ${route}`);
      }
      await context.close();
    }
  } finally { await browser.close(); }
}
fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ generatedAt: new Date().toISOString(), origin, updated, passed: results.length, results }, null, 2) + "\n");

preview?.kill("SIGTERM");
