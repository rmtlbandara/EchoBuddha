import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const slug = "appreciative-joy-when-comparison-hurts";
const route = `/articles/${slug}/`;
const published = "2026-11-14";
const readable = "November 14, 2026";
const read = route => fs.readFileSync(`dist${route}index.html`, "utf8");
const cards = html => [...html.matchAll(/<article\b[^>]*class="[^"]*\barticle-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/g)].map(match => match[0]);
const schemas = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1]));

test("first-published Appreciative Joy date renders on main and category cards", () => {
  // Provenance: November 14 production receipt, not a Git import/review timestamp.
  for (const listing of ["/articles/", "/articles/category/practice/"]) {
    const listingCards = cards(read(listing));
    const matches = listingCards.filter(card => card.includes(`href="${route}"`));
    assert.equal(matches.length, 1, listing);
    assert.ok(listingCards[0].includes(`href="${route}"`), "Newest verified publication appears first: " + listing);
    assert.match(matches[0], new RegExp(`<time datetime="${published}"[^>]*>${readable}</time>`), listing);
  }
});

test("visible article publication date, semantic time, schema and social metadata agree", () => {
  const html = read(route);
  const hero = html.slice(html.indexOf("<header", html.indexOf("<main")), html.indexOf("</header>", html.indexOf("<main")));
  assert.match(hero, new RegExp(`Published <time datetime="${published}"[^>]*>${readable}</time>`));
  const article = schemas(html).find(item => [item["@type"]].flat().includes("Article"));
  assert.ok(article, "Article schema must exist");
  assert.equal(article.datePublished, published);
  assert.equal(article.dateModified, published, "The original review/content date remains independently established");
  assert.match(html, new RegExp(`<meta property="article:published_time" content="${published}"`));
  assert.match(html, new RegExp(`<meta property="article:modified_time" content="${published}"`));
});

test("every listing card preserves the publication date exposed by its article", () => {
  const listingCards = cards(read("/articles/"));
  assert.equal(listingCards.length, 49);
  let previous = "9999-12-31";
  for (const card of listingCards) {
    const target = card.match(/href="(\/articles\/[^/]+\/)"/)?.[1];
    assert.ok(target, "A published article card must have a working detail target");
    const article = schemas(read(target)).find(item => [item["@type"]].flat().includes("Article"));
    assert.ok(article, target);
    const time = card.match(/<time datetime="([^"]+)"[^>]*>([^<]+)<\/time>/);
    if (article.datePublished) {
      assert.ok(article.datePublished <= previous, "All Articles must remain newest first: " + target);
      previous = article.datePublished;
      assert.equal(time?.[1], article.datePublished, target);
      const expected = new Intl.DateTimeFormat("en", {month:"long",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(`${article.datePublished}T00:00:00Z`));
      assert.equal(time[2], expected, target);
    } else {
      assert.equal(time, null, "Unknown historical dates must stay absent");
    }
  }
});
