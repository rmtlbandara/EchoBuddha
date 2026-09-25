import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  buddhistQuestions,
  getBuddhistQuestionPath,
  getBuddhistQuestionReadTime
} from "../src/data/buddhistQuestions.ts";
import { formatPublicationDate } from "../src/utils/publicationMetadata.ts";
import { MONETIZATION_ROUTE_REGISTRY } from "../src/data/monetization-route-registry.mjs";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const questionRoutes = buddhistQuestions.map(getBuddhistQuestionPath);
const releaseDates = ["2026-09-02", "2026-09-02", "2026-09-14", "2026-09-14", "2026-09-20", "2026-09-24"];

test("controlled Buddhist question collection contains exactly six complete, unique records", () => {
  assert.equal(buddhistQuestions.length, 6);
  assert.deepEqual(buddhistQuestions.map((question) => question.number), [1, 2, 3, 4, 5, 6]);
  assert.equal(new Set(buddhistQuestions.map((question) => question.slug)).size, 6);
  assert.equal(new Set(buddhistQuestions.map((question) => question.title)).size, 6);
  for (const [index, question] of buddhistQuestions.entries()) {
    assert.ok(question.description.trim());
    assert.ok(question.shortAnswer.length >= 2);
    assert.ok(question.sections.length >= 6);
    assert.ok(question.sources.length >= 2);
    assert.equal(question.publishedDate, releaseDates[index]);
    assert.equal(question.modifiedDate, releaseDates[index]);
    assert.ok(!Number.isNaN(Date.parse(`${question.publishedDate}T00:00:00Z`)));
    assert.ok(!Number.isNaN(Date.parse(`${question.modifiedDate}T00:00:00Z`)));
    assert.ok(question.modifiedDate >= question.publishedDate);
    assert.match(getBuddhistQuestionReadTime(question), /^\d+ min read$/);
    assert.doesNotMatch(JSON.stringify(question), /placeholder|coming soon|lorem ipsum/i);
  }
  assert.equal(
    buddhistQuestions[2].sources.filter((source) => source.sourceType === "Theravāda canonical hagiography").length,
    2,
    "Q3 Apadāna sources must not be presented as early discourses"
  );
  assert.deepEqual(
    buddhistQuestions[4].sources.map((source) => source.sourceType),
    ["Theravāda narrative/commentary", "Cultural heritage / history", "Museum / art history"],
    "Q5 must preserve the traditional, heritage, and art-history source layers"
  );
  assert.deepEqual(
    buddhistQuestions[5].sources.map((source) => source.sourceType),
    ["Early Buddhist discourse", "Theravāda commentary", "Museum / art history", "Museum / art history"],
    "Q6 must preserve the early-discourse, commentary, and art-history source layers"
  );
  assert.equal(buddhistQuestions[5].title, "Can Buddha Images Represent the Buddha If the Tathāgata Is Called Appaṭimo?");
  assert.equal(buddhistQuestions[5].seoTitle, "What Does Appaṭimo Mean for Buddha Images? | Echo Buddha");
  assert.equal(
    buddhistQuestions[5].description,
    "Does appaṭimo mean Buddha images are invalid? Explore AN 1.174, Theravāda commentary, the limits of exact likeness, and how Buddha images function as representations."
  );
  assert.doesNotMatch(JSON.stringify(buddhistQuestions[5]), /brahmin.*measur|measure.*brahmin/i);
  const learnSource = read("src/data/learn.ts");
  const existingFaqSource = learnSource.split("export const questionsAboutBuddhism = [")[1].split("export const resourceGroups")[0];
  assert.equal((existingFaqSource.match(/\n\s{4}question:/g) ?? []).length, 10, "the existing compact FAQ set must remain intact");
});

test("only the six explicitly approved public question detail routes are generated", () => {
  const detailRoot = path.join(root, "dist/learn/questions-about-buddhism");
  const generated = fs.readdirSync(detailRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `/learn/questions-about-buddhism/${entry.name}/`)
    .sort();
  assert.deepEqual(generated, [...questionRoutes].sort());
  assert.deepEqual(questionRoutes, [
    "/learn/questions-about-buddhism/did-buddha-order-buddha-images/",
    "/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/",
    "/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/",
    "/learn/questions-about-buddhism/why-no-buddha-statue-at-jetavana/",
    "/learn/questions-about-buddhism/why-bodhi-tree-planted-at-jetavana/",
    "/learn/questions-about-buddhism/appatimo-and-buddha-images/"
  ]);
  assert.equal(generated.some((route) => /(?:question|q)-?\d*[7-9]|(?:question|q)-?[1-9]\d+/i.test(route)), false);
});

test("question navigation is the exact bounded Q1-to-Q6 chain", () => {
  const navigation = buddhistQuestions.map((question) => ({
    previous: question.previous?.href ?? null,
    next: question.next?.href ?? null
  }));
  assert.deepEqual(navigation, [
    { previous: null, next: questionRoutes[1] },
    { previous: questionRoutes[0], next: questionRoutes[2] },
    { previous: questionRoutes[1], next: questionRoutes[3] },
    { previous: questionRoutes[2], next: questionRoutes[4] },
    { previous: questionRoutes[3], next: questionRoutes[5] },
    { previous: questionRoutes[4], next: null }
  ]);
});

test("all six question pages resolve with truthful dates, canonical Article metadata, and exact navigation", () => {
  for (const [index, route] of questionRoutes.entries()) {
    const html = read(`dist${route}index.html`);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://echobuddha.com${escapeRegex(route)}"`));
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i);
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /"@type":"BreadcrumbList"/);
    assert.match(html, new RegExp(`"datePublished":"${releaseDates[index]}"`));
    assert.match(html, new RegExp(`"dateModified":"${releaseDates[index]}"`));
    assert.match(html, /By <a href="\/authors\/echo-buddha-editorial\/" rel="author"[^>]*>Echo Buddha Editorial<\/a>/);
    assert.match(html, new RegExp(`<time datetime="${releaseDates[index]}"[^>]*>${formatPublicationDate(releaseDates[index])}</time>`));
    assert.match(html, new RegExp(escapeRegex(getBuddhistQuestionReadTime(buddhistQuestions[index]))));
    assert.doesNotMatch(html, /Prepared by/);
    assert.doesNotMatch(html, />Updated <time/);
    assert.doesNotMatch(html, /"@type":"FAQPage"/);
    assert.match(html, /rel="author"[^>]*>Echo Buddha Editorial/);
    assert.match(html, /Sources and Context/);
    assert.match(html, /Selected References/);
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    if (index > 0) assert.match(html, new RegExp(escapeRegex(questionRoutes[index - 1])));
    if (index < questionRoutes.length - 1) assert.match(html, new RegExp(escapeRegex(questionRoutes[index + 1])));
    if (index === questionRoutes.length - 1) assert.doesNotMatch(html, /Next question/);
    assert.doesNotMatch(html, /pagead2\.googlesyndication|adsbygoogle|google_ad_client|class="[^"]*ad-slot/i);
  }
  const detailTemplate = read("src/pages/learn/questions-about-buddhism/[slug].astro");
  assert.doesNotMatch(detailTemplate, /publishedDate="2026-09-02"|modifiedDate="2026-09-02"|datePublished: "2026-09-02"|dateModified: "2026-09-02"/);
});

test("question short answers render trusted inline emphasis instead of escaped HTML", () => {
  const q6Html = read("dist/learn/questions-about-buddhism/appatimo-and-buddha-images/index.html");
  assert.match(q6Html, /In AN 1\.174, <i>appaṭimo<\/i> appears with several terms/);
  assert.doesNotMatch(q6Html, /&lt;i&gt;appaṭimo&lt;\/i&gt;/);
});

test("hub, internal search, and sitemap discover all six question pages exactly once", () => {
  const hub = read("dist/learn/questions-about-buddhism/index.html");
  const sitemap = read("dist/sitemap.xml");
  const searchIndex = JSON.parse(read("dist/search-index.json"));
  for (const [index, route] of questionRoutes.entries()) {
    assert.match(hub, new RegExp(escapeRegex(route)));
    assert.equal((sitemap.match(new RegExp(`https://echobuddha.com${escapeRegex(route)}`, "g")) ?? []).length, 1);
    assert.match(sitemap, new RegExp(`<loc>https://echobuddha.com${escapeRegex(route)}</loc><lastmod>${releaseDates[index]}</lastmod>`));
    assert.equal(searchIndex.filter((item) => item.url === route).length, 1);
  }
  assert.equal(searchIndex.length, 329);
});

test("homepage curates exactly the first three deeper questions in the intended journey position", () => {
  const homepage = read("dist/index.html");
  const returnSection = homepage.indexOf("Come Back for One Useful Moment");
  const deeperSection = homepage.indexOf('<section class="section deeper-questions"');
  const aboutSection = homepage.indexOf("A Calm, Accountable Publication");

  assert.ok(returnSection >= 0 && deeperSection > returnSection && aboutSection > deeperSection);

  const deeperSectionHtml = homepage.slice(deeperSection, aboutSection);
  assert.equal((deeperSectionHtml.match(/<article class="surface question-card"/g) ?? []).length, 3);
  assert.match(deeperSectionHtml, /Source-aware study/);
  assert.match(deeperSectionHtml, /Deeper Questions About Buddhist Tradition/);
  assert.match(deeperSectionHtml, /Explore all deeper questions/);
  assert.match(deeperSectionHtml, /\/learn\/questions-about-buddhism\/#deeper-questions-heading/);
  assert.equal((deeperSectionHtml.match(/class="question-card__meta"/g) ?? []).length, 3);

  for (const [index, route] of questionRoutes.slice(0, 3).entries()) {
    assert.match(deeperSectionHtml, new RegExp(escapeRegex(route)));
    const question = buddhistQuestions[index];
    assert.match(
      deeperSectionHtml,
      new RegExp(`<time datetime="${question.publishedDate}"[^>]*>${formatPublicationDate(question.publishedDate)}</time>`)
    );
    assert.match(deeperSectionHtml, new RegExp(escapeRegex(getBuddhistQuestionReadTime(question))));
  }
  for (const route of questionRoutes.slice(3)) {
    assert.doesNotMatch(deeperSectionHtml, new RegExp(escapeRegex(route)));
  }

  const homepageSource = read("src/pages/index.astro");
  assert.match(homepageSource, /\.question-card h3 a \{[^}]*text-decoration: none;/s);
  assert.match(homepageSource, /<h3><a href=\{getBuddhistQuestionPath\(question\)\}>\{question\.title\}<\/a><\/h3>/);
});

test("all six question routes remain conservative Learn-detail monetization holds", () => {
  for (const route of questionRoutes) {
    assert.deepEqual(MONETIZATION_ROUTE_REGISTRY[route], {
      state: "HOLD_MANUAL_REVIEW",
      family: "LEARN_DETAIL",
      indexable: true,
      reason: "INDEXABLE_SUBSTANTIVE_ROUTE_NOT_EXPLICITLY_APPROVED"
    });
  }
  assert.equal(Object.keys(MONETIZATION_ROUTE_REGISTRY).length, 350);
});
