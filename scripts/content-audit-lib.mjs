// Automated diagnostics identify review work; they cannot certify editorial value.
export function stripScriptStyle(html) {
  return html.replace(/<!--[^]*?-->/g, " ")
    .replace(/<(script|style)\b[^>]*>[^]*?<\/\1>/gi, " ");
}

export function openingTags(html, tagName) {
  if (!/^[a-z][a-z0-9-]*$/i.test(tagName)) throw new Error("Expected an HTML tag name");
  // Consume complete quoted values, including an opposite quote or '>' inside.
  const pattern = new RegExp(`<${tagName}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "gi");
  return [...html.matchAll(pattern)].map(match => match[0]);
}

export function attributeValue(tag, name) {
  // Sequential consumption prevents an apparent href inside another attribute
  // from being mistaken for an actual attribute. Astro emits quoted values.
  for (const match of tag.matchAll(/\s+([\w:-]+)\s*=\s*(["'])([^]*?)\2/g)) {
    if (match[1].toLowerCase() === name.toLowerCase()) return match[3];
  }
  return undefined;
}

export function anchorHrefs(html) {
  return openingTags(stripScriptStyle(html), "a")
    .map(tag => attributeValue(tag, "href")).filter(href => href !== undefined);
}

export function metaContent(html, name) {
  const tag = openingTags(stripScriptStyle(html), "meta")
    .find(tag => attributeValue(tag, "name")?.toLowerCase() === name.toLowerCase());
  return tag ? attributeValue(tag, "content") ?? "" : "";
}

export function canonicalHref(html) {
  const tag = openingTags(stripScriptStyle(html), "link")
    .find(tag => attributeValue(tag, "rel")?.toLowerCase().split(/\s+/).includes("canonical"));
  return tag ? attributeValue(tag, "href") ?? "" : "";
}

export function quoteOriginDeclaration(html) {
  const fields = new Map();
  for (const match of stripScriptStyle(html).matchAll(/<dl\b([^>]*)>([^]*?)<\/dl>/gi)) {
    if (!attributeValue(`<dl ${match[1]}>`, "class")?.split(/\s+/).includes("origin-details")) continue;
    for (const pair of match[2].matchAll(/<dt\b[^>]*>([^]*?)<\/dt>\s*<dd\b[^>]*>([^]*?)<\/dd>/gi)) {
      fields.set(plainText(pair[1]).toLowerCase(), plainText(pair[2]));
    }
  }
  const originClassification = fields.get("origin classification") ?? "";
  const attributionWording = fields.get("attribution wording") ?? "";
  const canonicalTextReference = fields.get("scripture status") ?? "";
  return { originClassification, attributionWording, canonicalTextReference,
    declarationPresent: Boolean(originClassification && attributionWording && canonicalTextReference) };
}

export function mainContent(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
}

export function plainText(html) {
  return html
    .replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&(?:amp|quot|apos|lt|gt|nbsp);/g, value => ({ "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " })[value])
    .replace(/\s+/g, " ").trim();
}

export function editorialAction(page) {
  if (["quoteStory", "dailyReflection", "todayReflection"].includes(page.type)) return "Short-form editorial review required";
  if (["article", "learningDetail", "meditationDetail"].includes(page.type) && page.externalLinks.length === 0) return "Source verification required";
  return "Editorial review required";
}

export function lexicalTokens(text) {
  // Use the entire main content, rather than the first 500 chrome-heavy tokens.
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(word => word.length > 4));
}

export function similarityDecision(pageA, pageB, clusterA, clusterB) {
  if (clusterA && clusterA === clusterB) return "Review distinctness within mapped topic cluster";
  if (pageA.type === pageB.type && ["quoteStory", "dailyReflection"].includes(pageA.type)) return "Review short-form similarity; attribution does not establish distinctness";
  return "Review main-content overlap and reader intent";
}

export function repeatedParagraphs(pages) {
  const paragraphs = new Map();
  for (const page of pages) {
    const seen = new Set();
    for (const match of page.mainHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
      const text = plainText(match[1]);
      if (text.split(/\s+/).length < 20 || seen.has(text)) continue;
      seen.add(text);
      if (!paragraphs.has(text)) paragraphs.set(text, []);
      paragraphs.get(text).push(page.url);
    }
  }
  return [...paragraphs].filter(([, urls]) => urls.length > 1).map(([paragraph, urls]) => ({
    paragraph, pageCount: urls.length, urls: urls.join(" | "),
    disposition: "Review context; shared source, safety, navigation and attribution text may be justified"
  })).sort((a, b) => b.pageCount - a.pageCount);
}
