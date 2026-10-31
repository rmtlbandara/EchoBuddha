import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium, firefox, webkit } from "playwright-core";
import axe from "axe-core";

const origin = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4321";
const out = process.env.AUDIT_OUT_DIR || ".artifacts/tools-browser";
fs.mkdirSync(out, { recursive: true });
const results = [];
let preview;
try {
  if (!process.env.AUDIT_BASE_URL) {
    preview = spawn(process.execPath, ["node_modules/astro/bin/astro.mjs", "preview", "--host", "127.0.0.1"], { stdio: "ignore" });
    let ready = false;
    for (let i = 0; i < 80; i++) {
      try { if ((await fetch(origin)).ok) { ready = true; break; } } catch { /* starting */ }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    assert.ok(ready, "Preview server starts");
  }
  const engines = (process.env.BROWSER_ENGINES || "chromium,firefox,webkit").split(",");
  for (const engine of engines) {
    const type = { chromium, firefox, webkit }[engine];
    assert.ok(type, `Known engine ${engine}`);
    const browser = await type.launch({ headless: true });
    try {
      const context = await browser.newContext({ reducedMotion: "reduce" });
      // Each HTTP-status assertion must observe a fresh response. Firefox and
      // WebKit otherwise expose304 revalidation on routes revisited by this suite.
      await context.route("**/*", route => route.continue());
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${origin}/tools/`);
      await page.locator("[data-consent-reject]").click();
      const input = page.locator("[data-glossary-search]");
      const output = page.locator("[data-glossary-output]");
      const status = page.locator("[data-glossary-status]");
      assert.equal(await status.getAttribute("role"), "status");
      for (const [query, slug] of [["metta", "metta"], ["mettā", "metta"], ["  METTĀ  ", "metta"], ["karuna", "karuna"], ["karuṇā", "karuna"], ["SATI", "sati"]]) {
        await input.fill(query);
        assert.ok(await output.locator(`a[href='/learn/buddhist-dictionary/${slug}/']`).count(), `${engine}: ${query}`);
        assert.equal(await input.evaluate(node => document.activeElement === node), true, "Search retains focus");
        assert.match(await status.textContent(), /Showing \d+ of \d+ matching terms/);
      }
      await input.fill('<img src=x onerror="window.__unsafe=true">');
      assert.equal(await output.locator("a").count(), 0);
      assert.match(await status.textContent(), /No matching terms.*clear the search/);
      assert.equal(await page.evaluate(() => Boolean(window.__unsafe)), false);
      await input.fill("");
      assert.equal(await output.locator("a").count(), 12, "Clearing restores browsing");
      assert.equal(await output.locator("a").first().evaluate(node => getComputedStyle(node).display), "grid", "Dynamically inserted results retain the existing card presentation");
      // macOS WebKit follows Safari's default Option-Tab navigation for links.
      await input.press(engine === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
      assert.equal(await page.evaluate(() => document.activeElement.closest("[data-glossary-output]") !== null), true, "Keyboard reaches results");
      await page.locator("[data-timer-start]").click();
      await page.waitForFunction(() => document.querySelector("[data-timer-display]").textContent !== "05:00");
      await page.locator("[data-timer-pause]").click();
      const paused = await page.locator("[data-timer-display]").textContent();
      await page.waitForTimeout(1100);
      assert.equal(await page.locator("[data-timer-display]").textContent(), paused);
      await page.locator("[data-timer-reset]").click();
      assert.equal(await page.locator("[data-timer-display]").textContent(), "05:00");
      await page.locator("[data-breath-start]").click();
      await page.locator("[data-breath-stop]").click();
      assert.equal(await page.locator("[data-breath-label]").textContent(), "Rest");
      await page.locator("[data-next-quote]").click();
      assert.ok((await page.locator("[data-quote-output]").textContent()).trim());
      await page.locator("[data-next-reflection]").click();
      assert.ok((await page.locator("[data-reflection-output]").textContent()).trim());
      for (const width of [320, 390, 412, 640, 768, 1024, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const geometry = await page.evaluate(() => ({ width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth }));
        assert.equal(geometry.width, width);
        assert.equal(geometry.overflow, false, `${engine}: ${width}px reflow`);
        if (width === 412) {
          const targets = await page.locator(".tool-output a").evaluateAll(nodes => nodes.map(node => {
            const box = node.getBoundingClientRect();
            return { width: box.width, height: box.height, label: node.textContent };
          }));
          assert.ok(targets.length > 0, "Generated tool links exist");
          assert.ok(targets.every(target => target.width >= 24 && target.height >= 44), "Generated tool links keep usable touch targets at412px");
        }
        if ([320, 1440].includes(width)) await page.screenshot({ path: path.join(out, `${engine}-tools-${width}.png`), fullPage: true });
        if (width === 320) {
          await input.scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(out, `${engine}-glossary-320.png`) });
        }
      }
      await page.setViewportSize({ width: 640, height: 900 });
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "200% text reflows");
      await input.fill("mettā");
      assert.ok(await output.locator("a[href='/learn/buddhist-dictionary/metta/']").count());
      await page.addScriptTag({ content: axe.source });
      const a11y = await page.evaluate(async () => window.axe.run(document.querySelector("main"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } }));
      assert.deepEqual(a11y.violations.map(item => item.id), [], `${engine}: affected-page accessibility`);
      await page.goto(`${origin}/search/?q=mett%C4%81`);
      await page.waitForFunction(() => document.querySelector('[data-search-mode="page"] [data-search-results]')?.children.length > 0);
      assert.ok(await page.locator('[data-search-mode="page"] [data-search-results] a').count());
      await page.goto(`${origin}/tools/`);
      const open = page.locator("[data-search-open]");
      await open.click();
      await page.locator("#header-search-input").fill("karuṇā");
      await page.waitForFunction(() => document.querySelector('[data-search-mode="overlay"] [data-search-results]')?.children.length > 0);
      await page.locator("#header-search-input").press("Escape");
      assert.equal(await open.evaluate(node => document.activeElement === node), true, "Overlay restores focus");
      const revisedRoutes = ["/learn/buddhist-dictionary/karuna/", "/learn/buddhist-dictionary/compassion/", "/learn/buddhist-dictionary/sati/", "/learn/buddhism-101/what-is-mindfulness/", "/meditation/5-minute-meditation-practice/", "/meditation/10-minute-meditation-practice/"];
      for (const route of revisedRoutes) {
        await page.goto(origin + route);
        assert.equal(await page.locator('time[datetime="2026-10-27"]').count(), 1, `${route}: visible substantial-update date`);
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route}: ${width}px reflow`);
        }
      }
      const contentRoutes = process.env.AUDIT_CONTENT_ROUTES
        ? JSON.parse(fs.readFileSync(process.env.AUDIT_CONTENT_ROUTES, "utf8"))
        : [
            { route: "/articles/category/buddhist-wisdom/" },
            { route: "/daily-reflections/" }
          ];
      const contentResults = [];
      for (const { route, modifiedDate } of contentRoutes) {
        const response = await page.goto(origin + route);
        assert.equal(response.status(), 200, `${route}: successful HTML response`);
        assert.equal(await page.locator("main h1").count(), 1, `${route}: one main heading`);
        if (modifiedDate) assert.equal(await page.locator(`time[datetime="${modifiedDate}"]`).count(), 1, `${route}: visible update date`);
        for (const width of [320, 390, 640, 768, 1024, 1280, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route}: ${width}px reflow`);
          if (width === 320 || width === 1440) {
            await page.addScriptTag({ content: axe.source });
            const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ["violations"] })).violations);
            assert.deepEqual(violations.map(v => v.id), [], `${route}: ${width}px axe violations`);
          }
        }
        contentResults.push({ route, widths: [320, 390, 640, 768, 1024, 1280, 1440], axeWidths: [320, 1440], axeViolations: 0 });
      }
      assert.deepEqual(errors, [], "No application errors");
      results.push({ engine, browserVersion: browser.version(), status: "PASS", widths: [320, 390, 640, 768, 1024, 1280, 1440], revisedRoutes, contentResults, textResize: "200% at 640 CSS px", axeViolations: 0, methods: "Keyboard, DOM state, live status semantics, functional timers/generators, screenshot, axe; no real screen-reader certification" });
      await context.close();
      console.log(`${engine}: tools, search, timers, keyboard, reflow, and axe PASS`);
    } finally { await browser.close(); }
  }
} finally {
  fs.writeFileSync(path.join(out, "tools-browser.json"), JSON.stringify({ generatedAt: new Date().toISOString(), origin, results }, null, 2) + "\n");
  preview?.kill("SIGTERM");
}
