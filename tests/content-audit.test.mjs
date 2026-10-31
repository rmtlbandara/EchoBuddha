import assert from "node:assert/strict";
import test from "node:test";
import { mainContent, plainText, editorialAction, lexicalTokens, similarityDecision, repeatedParagraphs, anchorHrefs, metaContent, canonicalHref, attributeValue, quoteOriginDeclaration } from "../scripts/content-audit-lib.mjs";

test("quote origin diagnostics extract actual declarations without inventing an original classification", () => {
  const html = `<dl class='origin-details'><div><dt>Origin classification</dt><dd>Traditional text paraphrase</dd></div>
    <div><dt>Attribution wording</dt><dd>A paraphrase of a named text</dd></div>
    <div><dt>Scripture status</dt><dd>Paraphrase, not a translation</dd></div></dl>`;
  assert.deepEqual(quoteOriginDeclaration(html), { originClassification: "Traditional text paraphrase", attributionWording: "A paraphrase of a named text", canonicalTextReference: "Paraphrase, not a translation", declarationPresent: true });
  assert.equal(quoteOriginDeclaration(html.replace('<dd>A paraphrase of a named text</dd>', '<dd></dd>')).declarationPresent, false);
  assert.deepEqual(quoteOriginDeclaration('<p>Original Echo Buddha writing</p>'), { originClassification: "", attributionWording: "", canonicalTextReference: "", declarationPresent: false });
  assert.equal(quoteOriginDeclaration(`<script>const template = ${JSON.stringify(html)}</script>`).declarationPresent, false);
});

test("metadata extraction retains apostrophes and supports either quote and attribute order", () => {
  const html = `<meta content="Echo Buddha's practical guidance > slogans." name='description'>
    <link href='https://echobuddha.com/learn/' rel="canonical">`;
  assert.equal(metaContent(html, "description"), "Echo Buddha's practical guidance > slogans.");
  assert.equal(canonicalHref(html), "https://echobuddha.com/learn/");
  assert.equal(metaContent("<meta name='description' content='A &quot;quoted&quot; title'>", "description"), "A &quot;quoted&quot; title");
  assert.equal(metaContent("<meta name='other' content='not a description'>", "description"), "");
});

test("link extraction ignores scripts, styles, comments and attribute-contained fake anchors", () => {
  const html = `<a title=" href='not-an-attribute' > detail" href="/reader's-guide/">Guide</a>
    <a href='/another-guide/'>Another</a><a data-href='/not-a-link/'>No href</a>
    <script>const card = "<a href='/not-rendered/'>Template</a>";</script>
    <style>/* <a href='/not-a-style-link/'> */</style>
    <!-- <a href='/not-a-comment-link/'>Comment</a> -->`;
  assert.deepEqual(anchorHrefs(html), ["/reader's-guide/", "/another-guide/"]);
  assert.equal(attributeValue(`<img alt="" src='/image.png'>`, "alt"), "");
  assert.equal(attributeValue(`<a title=" href='fake'">`, "href"), undefined);
});

test("noindex and source-link presence cannot certify editorial quality", () => {
  for (const noindex of [true, false]) {
    assert.equal(editorialAction({ type: "quoteStory", noindex, externalLinks: [] }), "Short-form editorial review required");
    assert.equal(editorialAction({ type: "learningDetail", noindex, externalLinks: [] }), "Source verification required");
    assert.equal(editorialAction({ type: "learningDetail", noindex, externalLinks: ["https://example.org/"] }), "Editorial review required");
  }
});

test("reader-content diagnostics exclude site chrome and retain text after 500 tokens", () => {
  const html = '<header>Global menu</header><main><h1>Reader question</h1><p>Answer &amp; context.</p></main><footer>Social links</footer>';
  assert.equal(plainText(mainContent(html)), "Reader question Answer & context.");
  assert.equal(plainText(mainContent("<header>Chrome only</header>")), "");
  assert.ok(lexicalTokens(`${"before ".repeat(550)}distinctive`).has("distinctive"));
});

test("role maps and original attribution cannot automatically resolve similarity", () => {
  assert.match(similarityDecision({ type: "article" }, { type: "article" }, "Metta", "Metta"), /^Review/);
  assert.match(similarityDecision({ type: "quoteStory" }, { type: "quoteStory" }), /attribution does not establish distinctness/);
});

test("paragraph review records all affected URLs without inflating within-page repeats", () => {
  const p = "A repeated paragraph with more than twenty words requires a contextual review before an editor can determine whether the shared language is useful or redundant.";
  const rows = repeatedParagraphs([{ url: "https://example.org/a/", mainHtml: `<p>${p}</p><p>${p}</p>` }, { url: "https://example.org/b/", mainHtml: `<p>${p}</p>` }]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].pageCount, 2);
  assert.match(rows[0].urls, /\/a\/.+\/b\//);
});
