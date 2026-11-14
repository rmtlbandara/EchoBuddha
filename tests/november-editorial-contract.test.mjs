import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { mainContent, metaContent, canonicalHref } from '../scripts/content-audit-lib.mjs';
const dir = 'docs/audits/editorial-implementation-2026-11-13';
const baseline = JSON.parse(fs.readFileSync(`${dir}/PRE_RELEASE_BASELINE.json`));
const previous = JSON.parse(fs.readFileSync(`${dir}/baseline-routes.json`));
const edition = JSON.parse(fs.readFileSync(`${dir}/EDITION_ACCEPTANCE.json`));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const html = route => fs.readFileSync(route === '/404.html' ? 'dist/404.html' : `dist${route}index.html`, 'utf8');
const sitemap = new Set([...fs.readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname));
const search = JSON.parse(fs.readFileSync('dist/search-index.json'));

test('November candidate preserves every protected library body and its metadata', () => {
  assert.equal(baseline.protectedRoutes.length, 23);
  for (const expected of baseline.protectedRoutes) {
    const actual = html(expected.route);
    assert.equal(hash(mainContent(actual)), expected.mainSha256, `${expected.route}: authored body`);
    assert.equal(actual.match(/<title>(.*?)<\/title>/s)?.[1], expected.title, expected.route);
    assert.equal(metaContent(actual,'description'), expected.description, expected.route);
    assert.equal(canonicalHref(actual), expected.canonical, expected.route);
    assert.equal(/noindex/.test(metaContent(actual,'robots')), expected.noindex, expected.route);
  }
  for (const file of ['src/data/handbook.ts','src/data/buddhistQuestions.ts','src/pages/learn/buddhist-handbook/index.astro','src/pages/learn/buddhist-handbook/[slug].astro','src/pages/learn/questions-about-buddhism.astro','src/pages/learn/questions-about-buddhism/[slug].astro']) {
    assert.equal(hash(fs.readFileSync(file)), baseline.fileHashes[file], file);
  }
});

test('November inventory adds only the accepted finite routes and preserves existing index/canonical state', () => {
  const generated = fs.readdirSync('dist', {recursive:true}).filter(f=>String(f).endsWith('.html')).map(f=>'/'+String(f).replace(/index\.html$/,''));
  const before = new Set(previous.map(r=>r.route));
  assert.deepEqual(generated.filter(r=>!before.has(r)).sort(), [...edition.indexableRoutes,...edition.userPermalinks].sort());
  for (const expected of previous) {
    const actual = html(expected.route);
    if(expected.route !== '/404.html') assert.equal(canonicalHref(actual), expected.canonical, expected.route);
    assert.equal(/noindex/.test(metaContent(actual,'robots')), expected.noindex, expected.route);
  }
  for (const route of edition.indexableRoutes) {
    assert.ok(sitemap.has(route), route);
    assert.equal(search.filter(item=>item.url===route).length,1,route);
    assert.equal(canonicalHref(html(route)),'https://echobuddha.com'+route);
  }
  for (const route of edition.userPermalinks) {
    assert.equal(metaContent(html(route),'robots'),'noindex, follow',route);
    assert.ok(!sitemap.has(route),route);
    assert.equal(search.filter(item=>item.url===route).length,1,route);
  }
});

test('Verified article publication matches the release receipt while learning date provenance stays unchanged', () => {
  const fresh = html('/articles/appreciative-joy-when-comparison-hurts/');
  const schemas = [...fresh.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
  const article = schemas.find(s=>[s['@type']].flat().includes('Article'));
  assert.ok(article);
  const receipt = JSON.parse(fs.readFileSync('docs/deployments/receipts/2026-11-14-editorial-manuscript.json'));
  assert.equal(receipt.sha, '036bd282f1b112f7af4f0f3ca82c62e67286ed6a');
  assert.equal(article.datePublished, receipt.deployedAt.slice(0, 10));
  assert.equal(article.dateModified, '2026-11-14');
  assert.match(fresh, /Published\s*<time datetime="2026-11-14"/);
  for (const route of ['/learn/sutta-for-daily-life/five-remembrances-an-5-57/','/learn/sutta-for-daily-life/two-arrows-sn-36-6/','/learn/buddhist-dictionary/vedana/']) {
    assert.match(html(route), /"dateModified":"2026-11-14"/, route);
    assert.doesNotMatch(html(route), /"datePublished"/, route);
  }
});

test('New content keeps its source/application boundary and never publishes internal instructions', () => {
  const arrows = mainContent(html('/learn/sutta-for-daily-life/two-arrows-sn-36-6/'));
  assert.match(arrows,/explicitly compares bodily pain/);
  assert.match(arrows,/not a numbered model from the discourse/);
  assert.match(arrows,/This is a fictional contemporary example/);
  const joy=html('/articles/appreciative-joy-when-comparison-hurts/');
  assert.match(joy,/AN4_125\.html/);assert.match(joy,/MN62\.html/);
  assert.doesNotMatch(joy,/id="article-faq-heading"|href="#article-faq-heading"|id="key-takeaways-heading"/);
  for (const file of fs.readdirSync('dist',{recursive:true}).filter(f=>String(f).endsWith('.html'))) {
    assert.doesNotMatch(mainContent(fs.readFileSync('dist/'+file,'utf8')), /Integration note \(not for publication\)|Publishable replacement|PROPOSED_NOT_IMPLEMENTED/ , file);
  }
});

test('Editorial expansion preserves privacy, security and the disabled advertising runtime', () => {
  for(const file of ['src/components/ConsentManager.astro','src/data/ads.ts','public/_headers','public/robots.txt','src/pages/privacy-policy.astro','src/pages/terms-of-use.astro'])assert.equal(hash(fs.readFileSync(file)),baseline.fileHashes[file],file);
  const mailto=new Set();
  for(const file of fs.readdirSync('dist',{recursive:true}).filter(f=>String(f).endsWith('.html'))){
    const text=fs.readFileSync('dist/'+file,'utf8');
    for(const m of text.matchAll(/href="mailto:([^"?]+)/g))mailto.add(m[1]);
    assert.doesNotMatch(text,/pagead2\.googlesyndication|adsbygoogle|<ins[^>]+class=["'][^"']*ad-slot/i,file);
  }
  assert.deepEqual([...mailto],['info@echobuddha.com']);
});
