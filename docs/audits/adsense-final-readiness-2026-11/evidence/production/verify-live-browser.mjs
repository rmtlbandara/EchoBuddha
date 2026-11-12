import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright-core';
import axe from 'axe-core';
const origin = 'https://echobuddha.com';
const publicOrigin = 'https://echobuddha.com';
const output = '.artifacts/adsense-final-readiness-2026-11/production/browser/';
fs.mkdirSync(output,{recursive:true});
const routes = ["/articles/beginning-a-daily-mindfulness-practice/", "/articles/compassion-in-buddhism-beginner-guide/", "/articles/compassion-as-a-daily-discipline/", "/articles/walking-meditation-step-by-step/", "/articles/buddhist-teachings-on-impermanence/", "/articles/mindfulness-of-breathing-guide/", "/articles/right-livelihood-modern-life/", "/articles/right-speech-buddhism/", "/learn/buddhist-handbook/qualities-of-a-lay-buddhist/", "/learn/buddhism-101/the-noble-eightfold-path-explained/", "/learn/buddhism-101/three-marks-of-existence/", "/learn/buddhism-101/threefold-training-sila-samadhi-panna/", "/learn/sutta-for-daily-life/magga-vibhanga-sutta-eightfold-path/", "/learn/sutta-for-daily-life/mindfulness-of-breathing-explained-simply/", "/learn/sutta-for-daily-life/right-speech-in-daily-life/", "/learn/dhammapada-reflections/better-than-a-thousand-empty-words/", "/learn/dhammapada-reflections/peace-comes-from-a-trained-mind/", "/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/", "/meditation/meditation-for-beginners/", "/meditation/loving-kindness-meditation/", "/quotes/practice/eightfold-path-daily-choices/", "/quotes/wisdom/right-speech-with-kindness/", "/daily-reflections/metta-for-a-difficult-person/", "/daily-reflections/speech-can-reduce-suffering/", "/daily-reflections/", "/learn/buddhist-resources/", "/contact/", "/about/", "/corrections/", "/editorial-policy/", "/privacy-policy/", "/terms-of-use/", "/"];
const tested = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const homepage = [];
  await page.route(/googletagmanager|google-analytics|doubleclick|googlesyndication/, route => route.abort());
  for (const route of routes) {
    const response = await page.goto(origin + route);
    assert.equal(response.status(), 200, route);
    assert.equal(await page.locator('main h1').count(), 1, route);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), publicOrigin + route, route);
    const widths = route === '/' ? [320, 390, 640, 768, 819, 820, 821, 834, 853, 912, 980, 1024, 1280, 1440] : [320, 390, 820, 1440];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width, route + ' ' + width);
      if (route === '/') {
        await page.waitForFunction(() => {
          const picture = document.querySelector('.hero-visual');
          const image = picture.querySelector('img');
          return getComputedStyle(picture).display === 'none' || (image.complete && image.naturalWidth > 0);
        }, null, {timeout: 10000});
        const geometry = await page.evaluate(() => {
          const picture = document.querySelector('.hero-visual');
          const grid = document.querySelector('.hero-grid').getBoundingClientRect();
          const image = picture.querySelector('img');
          return {
            visible: getComputedStyle(picture).display !== 'none',
            pictureRight: picture.getBoundingClientRect().right,
            gridRight: grid.right,
            imageLoaded: image.complete && image.naturalWidth > 0,
            logo: document.querySelector('header img')?.getAttribute('src'),
          };
        });
        assert.ok(geometry.gridRight <= width + 1 && geometry.pictureRight <= width + 1, 'Homepage hero is contained');
        if (geometry.visible) assert.ok(geometry.imageLoaded, 'Visible homepage hero loaded');
        assert.ok(geometry.logo, 'Header brand image is present');
        homepage.push({ width, ...geometry });
      }
    }
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('main'), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }
      })).violations.map(v => v.id));
      assert.deepEqual(violations, [], route + ' ' + width);
    }
    tested.push({ route, widths, axeWidths: [320, 1440] });
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin+'/');
  await page.screenshot({path:output+'live-homepage.png'});
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin+'/contact/');
  await page.screenshot({path:output+'live-contact-mobile.png',fullPage:true});
  const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
  const liveInventory = JSON.parse(fs.readFileSync('.artifacts/adsense-final-readiness-2026-11/baseline-crawl/inventory.json', 'utf8'));
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  assert.deepEqual(urls.sort(), [...liveInventory.sitemap].sort());
  for (const route of ['/terms-and-conditions', '/terms-and-conditions/']) {
    const response = await fetch(origin + route + '?ref=remediation', { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(new URL(response.headers.get('location'), origin).pathname + new URL(response.headers.get('location'), origin).search, '/terms-of-use/?ref=remediation');
  }
  assert.equal((await fetch(origin + '/unlisted-remediation-probe-404/')).status, 404);
  const result = { tested, homepage, reflowChecks: tested.reduce((n, row) => n + row.widths.length, 0), axeChecks: tested.length * 2, sitemapUrls: urls.length, redirects: 2, genuine404: true };
  fs.writeFileSync(output + 'live-acceptance-browser.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ ...result, tested: tested.length }));
} finally {
  await browser.close();
}
