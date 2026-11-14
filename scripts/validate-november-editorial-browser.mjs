/** Browser acceptance for the finite November editorial candidate. Run after build. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import axe from 'axe-core';
import { getScheduledReflectionSlug } from '../src/utils/reflectionSchedule.mjs';
const previewPort = process.env.EDITORIAL_AUDIT_PORT || '4326';
const origin = process.env.AUDIT_BASE_URL || `http://127.0.0.1:${previewPort}`;
const out = process.env.AUDIT_OUT_DIR || '.artifacts/editorial-implementation/browser';
fs.mkdirSync(out, { recursive: true });
const root = 'docs/audits/editorial-implementation-2026-11-13';
const edition = JSON.parse(fs.readFileSync(`${root}/EDITION_ACCEPTANCE.json`));
const maintenance = JSON.parse(fs.readFileSync(`${root}/PRE_RELEASE_BASELINE.json`));
const extraRoutes = [
  '/', '/start-here/', '/learn/', '/learn/buddhism-101/', '/learn/buddhist-dictionary/',
  '/learn/dhammapada-reflections/', '/learn/sutta-for-daily-life/', '/learn/buddhist-resources/',
  '/meditation/', '/articles/', '/articles/category/practice/', '/mindful-living/',
  '/quotes/', '/quotes/wisdom/', '/daily-reflections/', '/daily-reflections/today/', '/tools/', '/search/',
  '/learn/sutta-for-daily-life/how-to-read-a-buddhist-sutta/',
  '/learn/buddhism-101/five-precepts-buddhism/', '/learn/buddhist-dictionary/anatta/',
  '/learn/buddhist-dictionary/sati/', '/learn/buddhist-dictionary/nirvana/',
  '/meditation/meditation-for-beginners/', '/meditation/meditation-posture-for-beginners/',
  '/meditation/when-meditation-feels-hard/', '/meditation/5-minute-meditation-practice/',
  '/meditation/10-minute-meditation-practice/',
  '/quotes/awareness/thoughts-are-visitors/', '/quotes/awareness/thoughts-pass-without-commanding-you/',
  '/quotes/compassion/kindness-as-quiet-practice/', '/quotes/meditation/one-honest-breath/',
  '/quotes/renewal/gentle-hope-keeps-walking/'
];
const routes = [...new Set([...edition.indexableRoutes, ...edition.userPermalinks, ...extraRoutes])];
const results = [];
let preview;
let browser;
try {
  if (!process.env.AUDIT_BASE_URL) {
    preview = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--host', '127.0.0.1', '--port', previewPort, '--ignore-lock'], { stdio: 'ignore' });
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      try { if ((await fetch(origin)).ok) { ready = true; break; } } catch { /* starting */ }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    assert.ok(ready, 'Candidate preview starts');
  }
  browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  for (const width of [320, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', locale: 'en-US' });
    const google = []; const errors = [];
    context.on('request', req => { if (/googletagmanager|google-analytics|googlesyndication/.test(req.url())) google.push(req.url()); });
    const page = await context.newPage(); page.on('pageerror', err => errors.push(err.message));
    for (const route of routes) {
      const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      const reject = page.locator('[data-consent-reject]');
      if (await reject.isVisible()) await reject.click();
      assert.equal(await page.locator('h1').count(), 1, route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, `${width}: ${route}: horizontal overflow`);
      await page.addScriptTag({ content: axe.source });
      const audit = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa'] } });
        return r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n=>n.target) }));
      });
      assert.deepEqual(audit, [], `${width}: ${route}: WCAG automated findings`);
      results.push({ width, route, status: response.status(), horizontalOverflow: overflow, axeViolations: audit.length });
      if (['/learn/sutta-for-daily-life/two-arrows-sn-36-6/','/articles/appreciative-joy-when-comparison-hurts/','/daily-reflections/'].includes(route)) {
        await page.screenshot({ path: path.join(out, `${width}-${route.split('/').filter(Boolean).at(-1)}.png`), fullPage: true });
      }
    }
    assert.deepEqual(errors, [], 'No browser exceptions');
    assert.deepEqual(google, [], 'No optional Google request before affirmative analytics consent');
    await context.close();
  }
  // Both spellings find the same accepted owner, in both search surfaces and the glossary.
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  for (const [query, route] of [['vedana','/learn/buddhist-dictionary/vedana/'],['vedanā','/learn/buddhist-dictionary/vedana/'],['metta','/learn/buddhist-dictionary/metta/'],['anatta','/learn/buddhist-dictionary/anatta/']]) {
    await page.goto(origin + '/search/');
    const reject = page.locator('[data-consent-reject]'); if(await reject.isVisible()) await reject.click();
    await page.locator('[data-search-mode="page"] [data-search-input]').fill(query);
    await page.locator(`[data-search-results] a[href='${route}']`).first().waitFor();
    await page.getByRole('button',{name:'Search',exact:true}).first().click();
    const overlay = page.locator('[data-search-overlay]');
    await overlay.locator('[data-search-input]').fill(query);
    await overlay.locator(`a[href='${route}']`).first().waitFor();
    await page.keyboard.press('Escape');
  }
  await page.goto(origin+'/tools/');
  await page.locator('[data-glossary-search]').fill('vedana');
  await page.locator("[data-glossary-output] a[href='/learn/buddhist-dictionary/vedana/']").waitFor();
  results.push({check:'Accented/unaccented owner discovery',pass:true});
  await context.close();
  // One UTC instant yields one slug across local time zones, including the year boundary while open.
  for(const timezoneId of ['Pacific/Kiritimati','America/Los_Angeles','Asia/Colombo']){
    const context=await browser.newContext({timezoneId,locale:'en-US'});const page=await context.newPage();
    await page.clock.install({time:new Date('2026-12-31T23:59:00.000Z')});
    await page.clock.pauseAt(new Date('2026-12-31T23:59:59.900Z'));
    await page.goto(origin+'/daily-reflections/today/');
    const cards=page.locator('[data-daily-reflection-card]');
    const slugs=await cards.evaluateAll(cards=>cards.map(c=>c.dataset.reflectionSlug));
    const visible=()=>page.locator('[data-daily-reflection-card]:not([hidden])');
    const expected=getScheduledReflectionSlug(new Date('2026-12-31T23:59:59.900Z'),slugs);
    assert.equal(await visible().getAttribute('data-reflection-slug'),expected,timezoneId);
    await page.clock.fastForward(300);
    assert.equal(await visible().getAttribute('data-reflection-slug'),'patience-before-anger-speaks',timezoneId+' UTC rollover');
    assert.match(await page.locator('[data-today-date]').textContent(),/January 1, 2027.*UTC/);
    const reject=page.locator('[data-consent-reject]');if(await reject.isVisible())await reject.click();
    const random=page.locator('[data-random-reflection]');await random.focus();await page.keyboard.press('Enter');
    const changed=await visible().getAttribute('data-reflection-slug');assert.notEqual(changed,'patience-before-anger-speaks');
    assert.equal(await page.locator('[data-current-reflection-link]').getAttribute('href'),'/daily-reflections/'+changed+'/');
    assert.match(await page.locator('[data-reflection-status]').textContent(),/^Selected:/);
    results.push({check:'UTC rollover, random keyboard action and full-link parity',timezoneId,pass:true});await context.close();
  }
  const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();await p.goto(origin+'/daily-reflections/today/');
  assert.equal(await p.locator('[data-daily-reflection-card]:visible').count(),1);
  assert.match(await p.locator('noscript').innerText(),/may differ.*today.s UTC date/);
  assert.equal(await p.locator('[data-random-reflection]').isDisabled(),true);
  assert.equal(await p.locator('[data-current-reflection-link]').getAttribute('href'),'/daily-reflections/patience-before-anger-speaks/');
  await p.goto(origin+'/daily-reflections/');assert.equal(await p.locator('nav[aria-label="Reflection topics"] a').count(),4);
  await p.goto(origin+'/learn/sutta-for-daily-life/how-to-read-a-buddhist-sutta/');await p.emulateMedia({media:'print'});
  assert.equal(await p.locator('#source-reading-card ol li').count(),6);
  assert.equal(await p.locator('#source-reading-card').evaluate(node=>getComputedStyle(node).breakInside),'avoid');
  results.push({check:'No-JavaScript fallback, static topic paths and printable six-step reading aid',pass:true});await nojs.close();
  fs.writeFileSync(path.join(out,'acceptance.json'),JSON.stringify({status:'PASS',generatedAt:new Date().toISOString(),origin,baselineSha:maintenance.baselineSha,routeChecks:routes.length*2,results},null,2)+'\n');
  console.log(`PASS ${routes.length*2} route/viewport checks; accented search, UTC rollover, keyboard, no-JS and print acceptance.`);
} catch(error){fs.writeFileSync(path.join(out,'acceptance-failure.json'),JSON.stringify({status:'FAIL',error:error.stack,completed:results},null,2));throw error;}finally{await browser?.close();preview?.kill("SIGTERM");}
