import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getSearchIndexPolicy, SEARCH_INDEX_STATES } from "../src/data/search-index-policy.mjs";

const root = process.cwd();
const homepage = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
const main = homepage.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";

test("homepage communicates a descriptive purpose with one H1 and eight ordered sections", () => {
  assert.equal((main.match(/<h1\b/g) ?? []).length, 1);
  assert.match(main, /<h1\b[^>]*>Buddhist Wisdom for Everyday Life<\/h1>/);
  assert.equal((main.match(/<section\b/g) ?? []).length, 8);

  const orderedHeadings = [
    "Buddhist Wisdom for Everyday Life",
    "Choose Your Path",
    "Start With the Foundations",
    "Featured Guides",
    "Buddhist Life & Practice Handbook",
    "Pause With One Reflection",
    "Questions About Buddhist Tradition",
    "Why Readers Can Trust the Care Behind the Work"
  ];
  let previous = -1;
  for (const heading of orderedHeadings) {
    const current = main.indexOf(heading);
    assert.ok(current > previous, `${heading} should appear in the intended order`);
    previous = current;
  }
});

test("homepage metadata, canonical, indexability, and schema stay minimal and accurate", () => {
  assert.match(homepage, /<title>Buddhist Wisdom, Learning &amp; Meditation \| Echo Buddha<\/title>/);
  assert.match(homepage, /<meta name="description" content="Explore Buddhist teachings, practical meditation, and everyday application through clear, source-aware guidance for beginners and returning readers\."/);
  assert.match(homepage, /<link rel="canonical" href="https:\/\/echobuddha\.com\/"/);
  assert.doesNotMatch(homepage, /<meta name="robots" content="[^"]*noindex/i);

  const schemas = [...homepage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => {
      const value = JSON.parse(match[1]);
      return Array.isArray(value) ? value : [value];
    });
  assert.deepEqual(schemas.map((schema) => schema["@type"]), ["WebSite", "Organization"]);
  assert.doesNotMatch(homepage, /"@type":"(?:FAQPage|BreadcrumbList|ItemList)"/);
});

test("global footer exposes accessible branded icons in the requested platform order", () => {
  const socialProfiles = [
    ["Pinterest", "https://www.pinterest.com/echobuddha/"],
    ["YouTube", "https://www.youtube.com/@EchoBuddha"],
    ["Facebook", "https://www.facebook.com/EchoBuddha/"],
    ["Medium", "https://medium.com/@echo_buddha"]
  ];
  const social = homepage.match(/<nav class="footer-social" aria-labelledby="footer-social-heading"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(social);
  assert.match(social, /<h2\b[^>]*>Follow Echo Buddha<\/h2>/);
  const links = [...social.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(links.length, socialProfiles.length);
  for (const [index, [label, href]] of socialProfiles.entries()) {
    const [, tag, content] = links[index];
    const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
    assert.equal(attributes.href, href);
    assert.equal(attributes["aria-label"], `Echo Buddha on ${label}`);
    assert.ok(attributes.rel.split(" ").includes("me"));
    if (attributes.target === "_blank") {
      assert.ok(attributes.rel.split(" ").includes("noopener"));
      assert.ok(attributes.rel.split(" ").includes("noreferrer"));
    }
    assert.match(content, /<svg\b[^>]*width="22"[^>]*height="22"[^>]*aria-hidden="true"[^>]*focusable="false"/);
    assert.match(content, /<path\b[^>]*d="[^"]+"/);
    assert.equal(content.replace(/<[^>]+>/g, "").trim(), "");
  }
  assert.doesNotMatch(social, /LinkedIn|linkedin|↗/);
});

test("footer presentation preserves existing publisher structured-data identities", () => {
  const schemas = [...homepage.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => JSON.parse(match[1]));
  const publisher = schemas.find((schema) => schema["@type"] === "Organization");
  assert.deepEqual(publisher.sameAs, [
    "https://www.facebook.com/EchoBuddha/",
    "https://medium.com/@echo_buddha",
    "https://www.pinterest.com/echobuddha/",
    "https://www.linkedin.com/company/echobuddha/"
  ]);
});

test("homepage uses editorially curated guides rather than publication-date sorting", () => {
  const guideSection = main.slice(main.indexOf("Featured Guides"), main.indexOf("Buddhist Life & Practice Handbook"));
  for (const slug of [
    "right-speech-buddhism",
    "three-poisons-buddhism-explained",
    "how-to-let-go-of-attachment-in-buddhism"
  ]) {
    assert.match(guideSection, new RegExp(`/articles/${slug}/`));
  }
  assert.doesNotMatch(guideSection, /Copy article link/);
  const source = fs.readFileSync(path.join(root, "src/pages/index.astro"), "utf8");
  assert.match(source, /const featuredGuideSlugs = \[/);
  assert.doesNotMatch(source, /getPublishedTime|sort\(\(a, b\).*date/s);
});

test("homepage links are non-empty, crawlable, resolvable, and aligned with index policy", () => {
  const hrefs = [...main.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((match) => match[1]);
  assert.ok(hrefs.length > 0);
  assert.equal(hrefs.some((href) => href.trim() === ""), false);

  for (const href of new Set(hrefs)) {
    assert.match(href, /^\//, `${href} should be a normal internal path`);
    const url = new URL(href, "https://echobuddha.com");
    const route = url.pathname;
    const target = route === "/"
      ? path.join(root, "dist/index.html")
      : path.join(root, "dist", route, "index.html");
    assert.ok(fs.existsSync(target), `${href} should resolve to a built page`);
    const policy = getSearchIndexPolicy(route);
    if (policy.state === SEARCH_INDEX_STATES.NOINDEX) {
      assert.equal(route, "/daily-reflections/today/", `${route} should only be linked for a legitimate recurring-user purpose`);
    }
  }
});

test("homepage preserves the AdSense verification-only firewall and valid images", () => {
  assert.match(homepage, /<meta name="google-adsense-account" content="ca-pub-3911157640549350"/);
  assert.doesNotMatch(homepage, /pagead2\.googlesyndication|adsbygoogle|google_ad_client|class="[^"]*ad-slot/i);
  for (const [, src] of main.matchAll(/<img\b[^>]*src="([^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(root, "public", src)), `${src} should exist`);
  }
});
