import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const site = "https://echobuddha.com";
const outputDir = path.join(root, "docs/audits/echo-buddha-governance-implementation");
const failures = [];
const warnings = [];

const walk = (dir, matcher, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) walk(filePath, matcher, out);
    else if (matcher(filePath)) out.push(filePath);
  }
  return out;
};

const routeFromHtml = (filePath) => {
  const rel = path.relative(dist, filePath).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
};

const stripBlocks = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ");

const textContent = (html) => stripBlocks(html)
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const classify = (route) => {
  if (route.startsWith("/articles/category/")) return "articleCategory";
  if (route.startsWith("/articles/") && route !== "/articles/") return "article";
  if (route.startsWith("/quotes/") && route.split("/").filter(Boolean).length === 3) return "quoteStory";
  if (route.startsWith("/quotes/") && route !== "/quotes/") return "quoteCategory";
  if (route.startsWith("/daily-reflections/") && route !== "/daily-reflections/" && route !== "/daily-reflections/today/") return "daily";
  if (route.startsWith("/learn/") && route.split("/").filter(Boolean).length === 3) return "learning";
  if (route.startsWith("/learn/") && route !== "/learn/") return "learningHub";
  if (route.startsWith("/meditation/") && route !== "/meditation/") return "meditation";
  if (["/about/", "/contact/", "/editorial-policy/", "/privacy-policy/", "/terms-of-use/", "/disclaimer/", "/authors/echo-buddha-editorial/"].includes(route)) return "policy";
  if (["/", "/learn/", "/articles/", "/quotes/", "/daily-reflections/", "/meditation/", "/mindful-living/", "/start-here/", "/tools/"].includes(route)) return "hub";
  return "other";
};

if (!fs.existsSync(dist)) {
  failures.push("Missing dist directory. Run npm run build before npm run audit:seo.");
} else {
  const htmlFiles = walk(dist, (filePath) => filePath.endsWith(".html"));
  const allFiles = walk(dist, () => true);
  const routes = new Set(htmlFiles.map(routeFromHtml));
  const assets = new Set(allFiles.map((filePath) => `/${path.relative(dist, filePath).split(path.sep).join("/")}`));
  const sitemapPath = path.join(dist, "sitemap.xml");
  const sitemapXml = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
  const sitemapRoutes = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  const pages = [];
  const hrefs = [];
  const brokenInternalLinks = [];
  const imageIssues = [];
  const structuredDataIssues = [];
  const duplicateMap = (key) => new Map();
  const titles = duplicateMap("title");
  const descriptions = duplicateMap("description");

  for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, "utf8");
    const route = routeFromHtml(filePath);
    const cleaned = stripBlocks(html);
    const title = html.match(/<title>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
    const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1]?.trim() ?? "";
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i)?.[1]?.trim() ?? "";
    const noindex = /<meta\s+name=["']robots["'][^>]*noindex/i.test(html);
    const h1s = [...cleaned.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gis)].map((match) => match[1].replace(/<[^>]*>/g, "").trim());
    const words = (textContent(html).match(/\b[A-Za-z][A-Za-z'’-]*\b/g) ?? []).length;
    const schemaTypes = [];
    const schemaScripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

    if (!title) failures.push(`${route} is missing a title.`);
    if (!description) failures.push(`${route} is missing a meta description.`);
    if (h1s.length !== 1) failures.push(`${route} has ${h1s.length} H1 elements.`);
    if (!canonical && route !== "/404.html") failures.push(`${route} is missing a canonical URL.`);
    if (canonical && route !== "/404.html") {
      const expected = new URL(route, site).toString();
      if (canonical !== expected) failures.push(`${route} canonical mismatch: ${canonical} expected ${expected}`);
    }
    if (title) titles.set(title, [...(titles.get(title) ?? []), route]);
    if (description) descriptions.set(description, [...(descriptions.get(description) ?? []), route]);

    for (const match of schemaScripts) {
      try {
        const parsed = JSON.parse(match[1]);
        for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
          const type = Array.isArray(item["@type"]) ? item["@type"].join("+") : item["@type"];
          schemaTypes.push(type ?? "unknown");
          if (
            item.url
            && typeof item.url === "string"
            && item.url.startsWith(site)
            && item.url !== site
            && !item.url.endsWith("/")
            && !item.url.endsWith(".xml")
          ) {
            structuredDataIssues.push(`${route} structured-data URL may not match trailing-slash policy: ${item.url}`);
          }
          if (item.datePublished && item.dateModified && item.dateModified < item.datePublished) {
            structuredDataIssues.push(`${route} has dateModified before datePublished.`);
          }
        }
      } catch {
        structuredDataIssues.push(`${route} has invalid JSON-LD.`);
      }
    }

    for (const match of cleaned.matchAll(/<a\b[^>]*\shref=["']([^"']+)["']/gi)) {
      const href = match[1];
      hrefs.push({ from: route, href });
      if (href.startsWith("/") && !href.startsWith("//")) {
        const pathname = new URL(href, site).pathname;
        if (!routes.has(pathname) && !assets.has(pathname)) {
          brokenInternalLinks.push({ from: route, href, pathname });
        }
      }
    }

    for (const match of cleaned.matchAll(/<img\b([^>]*)>/gi)) {
      const attrs = match[1];
      const src = attrs.match(/\ssrc=["']([^"']+)["']/i)?.[1];
      const altMatch = attrs.match(/\salt=["']([^"']*)["']/i);
      if (!altMatch) imageIssues.push(`${route} has an image without alt text.`);
      if (src?.startsWith("/")) {
        const pathname = new URL(src, site).pathname;
        if (!assets.has(pathname)) imageIssues.push(`${route} references missing local image ${src}.`);
      }
    }

    pages.push({ path: route, type: classify(route), noindex, title, description, canonical, words, h1Count: h1s.length, schemaTypes });
  }

  for (const [title, routesForTitle] of titles) {
    if (routesForTitle.length > 1) failures.push(`Duplicate title "${title}" on ${routesForTitle.join(", ")}`);
  }
  for (const [description, routesForDescription] of descriptions) {
    if (routesForDescription.length > 1) failures.push(`Duplicate description "${description}" on ${routesForDescription.join(", ")}`);
  }

  for (const issue of structuredDataIssues) failures.push(issue);
  for (const issue of imageIssues) failures.push(issue);
  for (const link of brokenInternalLinks) failures.push(`Broken internal link from ${link.from} to ${link.href}`);

  const indexablePages = pages.filter((page) => !page.noindex);
  const noindexInSitemap = sitemapRoutes.filter((route) => pages.find((page) => page.path === route)?.noindex);
  const indexableNotSitemap = indexablePages.map((page) => page.path).filter((route) => !sitemapRoutes.includes(route));
  const sitemapNotBuilt = sitemapRoutes.filter((route) => !routes.has(route));
  for (const route of noindexInSitemap) failures.push(`Noindex URL appears in sitemap: ${route}`);
  for (const route of indexableNotSitemap) failures.push(`Indexable page missing from sitemap: ${route}`);
  for (const route of sitemapNotBuilt) failures.push(`Sitemap URL does not map to a built HTML route: ${route}`);

  const inbound = new Map([...routes].map((route) => [route, 0]));
  for (const link of hrefs) {
    if (link.href.startsWith("/") && !link.href.startsWith("//")) {
      const pathname = new URL(link.href, site).pathname;
      if (inbound.has(pathname)) inbound.set(pathname, inbound.get(pathname) + 1);
    }
  }
  const lowInbound = indexablePages
    .map((page) => ({ path: page.path, type: page.type, inbound: inbound.get(page.path) ?? 0 }))
    .filter((item) => item.path !== "/" && item.inbound <= 2)
    .sort((a, b) => a.inbound - b.inbound || a.path.localeCompare(b.path));
  if (lowInbound.length > 0) warnings.push(`${lowInbound.length} indexable pages have two or fewer detected inbound static links.`);

  const thinReview = indexablePages
    .filter((page) => page.words < 350)
    .map((page) => ({
      path: page.path,
      type: page.type,
      words: page.words,
      decision: ["policy", "hub", "articleCategory", "learningHub"].includes(page.type)
        ? "Keep with documented navigational/trust purpose unless product owner chooses expansion."
        : "Editorial review required; improve, consolidate, or noindex if standalone value is weak."
    }))
    .sort((a, b) => a.words - b.words || a.path.localeCompare(b.path));

  const schemaCounts = {};
  const pageTypeCounts = {};
  for (const page of pages) {
    pageTypeCounts[page.type] = (pageTypeCounts[page.type] ?? 0) + 1;
    for (const type of page.schemaTypes) schemaCounts[type] = (schemaCounts[type] ?? 0) + 1;
  }

  const hiddenOutput = allFiles
    .map((filePath) => path.relative(dist, filePath))
    .filter((relative) => relative.split(path.sep).some((part) => part.startsWith(".")));
  if (hiddenOutput.length > 0) failures.push(`Hidden files in generated output: ${hiddenOutput.join(", ")}`);

  const manifestPath = path.join(dist, "site.webmanifest");
  if (!fs.existsSync(manifestPath)) failures.push("Generated site.webmanifest is missing.");
  else {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      for (const field of ["name", "short_name", "start_url", "display", "icons"]) {
        if (!manifest[field]) failures.push(`Manifest missing ${field}.`);
      }
      for (const icon of manifest.icons ?? []) {
        if (icon.src?.startsWith("/") && !assets.has(new URL(icon.src, site).pathname)) {
          failures.push(`Manifest references missing icon ${icon.src}.`);
        }
      }
    } catch {
      failures.push("Generated site.webmanifest is invalid JSON.");
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "url-inventory.json"), `${JSON.stringify(pages, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, "thin-page-review.json"), `${JSON.stringify(thinReview, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, "low-inbound-review.json"), `${JSON.stringify(lowInbound, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, "structured-data-matrix.json"), `${JSON.stringify({ schemaCounts, pageTypeCounts }, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, "final-validation-summary.json"), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    indexableCount: indexablePages.length,
    noindexCount: pages.length - indexablePages.length,
    sitemapCount: sitemapRoutes.length,
    pageTypeCounts,
    schemaCounts,
    lowInboundCount: lowInbound.length,
    thinReviewCount: thinReview.length,
    failures,
    warnings
  }, null, 2)}\n`);
}

if (warnings.length > 0) {
  console.warn("SEO audit warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (failures.length > 0) {
  console.error("SEO audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SEO audit passed.");
