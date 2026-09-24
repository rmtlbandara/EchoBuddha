import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ADSENSE } from "../src/data/ads.ts";
import { MONETIZATION_ROUTE_REGISTRY } from "../src/data/monetization-route-registry.mjs";
import {
  AD_ZONES,
  MONETIZATION_STATES,
  PROTECTED_ZONE_NAMES,
  canLoadAdSenseRuntime,
  canRenderAd,
  classifyTechnicalResource,
  getMonetizationPolicy,
  getRegisteredMonetizationPolicy,
  isPlacementEligible,
  normalizeMonetizationPath
} from "../src/data/monetization.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const htmlFiles = () => fs.readdirSync(path.join(root, "dist"), { recursive: true })
  .filter((file) => String(file).endsWith(".html"))
  .map((file) => path.join(root, "dist", String(file)));

test("complete current HTML inventory has exactly one conservative registry state", () => {
  const entries = Object.entries(MONETIZATION_ROUTE_REGISTRY);
  assert.equal(entries.length, 341);
  assert.equal(new Set(entries.map(([route]) => route)).size, 341);
  assert.deepEqual(
    Object.fromEntries(Object.values(MONETIZATION_STATES).slice(0, 3).map((state) => [state, entries.filter(([, row]) => row.state === state).length])),
    { NEVER_MONETIZE: 252, ELIGIBLE_CANDIDATE: 7, HOLD_MANUAL_REVIEW: 82 }
  );
  assert.equal(entries.filter(([, row]) => row.indexable).length, 155);
  assert.equal(entries.filter(([, row]) => !row.indexable).length, 186);
  assert.equal(htmlFiles().length, entries.length);
});

test("eligible candidates are an explicit seven-page reviewed set", () => {
  const expected = [
    "/articles/buddhist-wisdom-for-overthinking/",
    "/articles/compassion-with-boundaries/",
    "/articles/dhamma-vs-dharma/",
    "/articles/dhammapada-reflection-what-we-think/",
    "/articles/dhammapada-verse-1-meaning/",
    "/articles/noble-eightfold-path-practical-guide/",
    "/articles/right-speech-buddhism/"
  ];
  const actual = Object.entries(MONETIZATION_ROUTE_REGISTRY)
    .filter(([, row]) => row.state === MONETIZATION_STATES.ELIGIBLE_CANDIDATE)
    .map(([route]) => route);
  assert.deepEqual(actual, expected);
  for (const pathname of expected) {
    const policy = getMonetizationPolicy({ pathname, indexable: true, reviewedPublisherContent: true });
    assert.equal(policy.state, MONETIZATION_STATES.ELIGIBLE_CANDIDATE);
    assert.deepEqual(policy.allowedZones, [AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION]);
  }
});

test("missing metadata, noindex, unknown, malformed, and external routes fail closed", () => {
  const candidate = "/articles/right-speech-buddhism/";
  assert.equal(getMonetizationPolicy({ pathname: candidate }).state, MONETIZATION_STATES.NEVER_MONETIZE);
  assert.equal(getMonetizationPolicy({ pathname: candidate, indexable: true }).state, MONETIZATION_STATES.NEVER_MONETIZE);
  assert.equal(getMonetizationPolicy({ pathname: candidate, indexable: true, reviewedPublisherContent: true, noindex: true }).state, MONETIZATION_STATES.NEVER_MONETIZE);
  for (const pathname of [
    "/articles/future-unreviewed/",
    "/dynamic/anything/",
    "https://example.com/articles/right-speech-buddhism/",
    "/articles/../right-speech-buddhism/",
    "//evil.example/path/"
  ]) assert.equal(getRegisteredMonetizationPolicy(pathname).state, MONETIZATION_STATES.NEVER_MONETIZE, pathname);
  assert.equal(normalizeMonetizationPath(`${candidate}?utm_source=test#section`), candidate);
});

test("required matrix routes remain never-monetize or manual-review holds", () => {
  const never = [
    "/404.html", "/search/", "/contact/", "/privacy-policy/", "/terms-of-use/", "/about/",
    "/editorial-policy/", "/quotes/mindfulness/begin-the-day-with-awareness/",
    "/daily-reflections/one-honest-breath/", "/", "/quotes/", "/learn/buddhist-dictionary/anicca/"
  ];
  for (const pathname of never) assert.equal(getRegisteredMonetizationPolicy(pathname).state, MONETIZATION_STATES.NEVER_MONETIZE, pathname);
  for (const pathname of ["/articles/what-is-buddhism-beginner-guide/", "/learn/buddhism-101/what-is-buddhism/"]) {
    assert.equal(getRegisteredMonetizationPolicy(pathname).state, MONETIZATION_STATES.HOLD_MANUAL_REVIEW, pathname);
  }
});

test("page and placement gates are independent and protected zones are denied", () => {
  const policy = getMonetizationPolicy({
    pathname: "/articles/right-speech-buddhism/",
    indexable: true,
    reviewedPublisherContent: true
  });
  assert.equal(isPlacementEligible(policy, AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION), true);
  for (const zone of PROTECTED_ZONE_NAMES) assert.equal(isPlacementEligible(policy, zone), false, zone);
  assert.equal(isPlacementEligible(policy, "UNKNOWN_ZONE"), false);
  assert.equal(isPlacementEligible(getRegisteredMonetizationPolicy("/privacy-policy/"), AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION), false);
});

test("all global delivery gates and Auto Ads stay off", () => {
  assert.equal(ADSENSE.siteApprovedForRendering, false);
  assert.equal(ADSENSE.servingEnabled, false);
  assert.equal(ADSENSE.autoAdsEnabled, false);
  assert.equal(ADSENSE.runtimeScriptEnabled, false);
  assert.equal(ADSENSE.manualSlotsEnabled, false);
  assert.deepEqual(ADSENSE.approvedManualSlotIds, []);
  assert.equal(canLoadAdSenseRuntime(), false);
  const policy = getMonetizationPolicy({ pathname: "/articles/right-speech-buddhism/", indexable: true, reviewedPublisherContent: true });
  assert.equal(canRenderAd({ policy, zone: AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION }), false);
});

test("technical resources are not treated as HTML monetization inventory", () => {
  for (const pathname of ["/ads.txt", "/robots.txt", "/sitemap.xml", "/search-index.json", "/search.js"]) {
    assert.equal(classifyTechnicalResource(pathname), MONETIZATION_STATES.TECHNICAL_NON_HTML);
  }
  assert.equal(classifyTechnicalResource("/privacy-policy/"), null);
});

test("built output has verification only: zero ad requests, units, and empty ad placeholders", () => {
  const files = htmlFiles();
  assert.equal(files.length, 341);
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(html, /pagead2\.googlesyndication|adsbygoogle|google_ad_client|<ins[^>]+class=["'][^"']*adsbygoogle/i, file);
    assert.doesNotMatch(html, /<[^>]+class=["'][^"']*\bad-slot\b/i, file);
  }
  assert.match(read("dist/index.html"), /<meta name="google-adsense-account" content="ca-pub-3911157640549350"/);
  assert.equal(read("public/ads.txt").trim(), "google.com, pub-3911157640549350, DIRECT, f08c47fec0942fa0");
});

test("templates contain no distributed ad placements or direct AdSense snippets", () => {
  const sourceFiles = fs.readdirSync(path.join(root, "src"), { recursive: true })
    .filter((file) => /\.(astro|ts|mjs|js)$/.test(String(file)))
    .map((file) => path.join(root, "src", String(file)));
  const pageSource = sourceFiles.filter((file) => file.includes(`${path.sep}pages${path.sep}`)).map((file) => fs.readFileSync(file, "utf8")).join("\n");
  const allSource = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(pageSource, /<AdSlot|import\s+AdSlot/);
  assert.doesNotMatch(allSource, /<ins[^>]+adsbygoogle|pagead2\.googlesyndication|google_ad_client/i);
});
