import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { QUOTE_APPLICATIONS } from "../src/data/quoteApplications.ts";
import { quotes, getQuoteStory, getQuoteCategory, getArticlesForQuoteTheme, quoteCategories } from "../src/data/site.ts";

test("quote collections offer relevant, maintained reading paths", () => {
  for (const category of quoteCategories) {
    const articles = getArticlesForQuoteTheme(category.name);
    assert.equal(articles.length, 3, `${category.name}: curated next-reading path`);
    assert.equal(new Set(articles.map(a => a.slug)).size, 3);
  }
  assert.deepEqual(getArticlesForQuoteTheme("Impermanence").map(a => a.slug), ["impermanence-in-buddhism", "buddhist-teachings-on-impermanence", "impermanence-in-buddhism-letting-go"]);
  assert.deepEqual(getArticlesForQuoteTheme("Compassion").map(a => a.slug), ["compassion-with-boundaries", "compassion-in-buddhism-beginner-guide", "compassion-as-a-daily-discipline"]);
});

test("every concise quote permalink has its own explicit editorial application", () => {
  const concise = quotes.filter(quote => !quote.story);
  assert.deepEqual(Object.keys(QUOTE_APPLICATIONS).sort(), concise.map(quote => quote.text).sort(), "Missing or stale applications must be corrected, not replaced with generated snippets");
  for (const field of ["interpretation", "application", "question"]) {
    const seen = new Set();
    for (const quote of concise) {
      const text = QUOTE_APPLICATIONS[quote.text][field].trim();
      assert.ok(text, `${quote.text}: missing ${field}`);
      assert.ok(!seen.has(text), `${quote.text}: repeated ${field} needs explicit editorial resolution`);
      seen.add(text);
    }
  }
});

test("the built quote pages render the reviewed copy and preserve exclusion and date signals", () => {
  const read = route => fs.readFileSync(`dist${route}index.html`, "utf8");
  const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
  const decode = s => s.replaceAll("&#39;", "'").replaceAll("&quot;", '"').replaceAll("&amp;", "&");
  for (const quote of quotes) {
    const story = getQuoteStory(quote);
    const route = `/quotes/${getQuoteCategory(quote.theme).slug}/${story.slug}/`;
    const html = read(route);
    assert.match(html, /<meta name="robots" content="noindex, follow"/);
    assert.ok(!sitemap.includes(`https://echobuddha.com${route}`));
    if (quote.story) {
      assert.ok(html.includes("imagined example, not a historical Buddhist account"));
    } else {
      for (const text of Object.values(QUOTE_APPLICATIONS[quote.text])) assert.ok(decode(html).includes(text), `${route}: reviewed copy missing`);
      assert.match(html, /<time\b[^>]*datetime="2026-10-30"[^>]*>/);
      const schemas = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).flat();
      assert.ok(schemas.some(s => s["@type"] === "WebPage" && s.dateModified === "2026-10-30"));
      assert.deepEqual(story.sections, [], "Concise permalinks cannot generate fictional filler");
    }
  }
});
