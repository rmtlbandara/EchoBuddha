import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(dir, "ECHO_BUDDHA_PHASE_3_GOOGLE_GUIDANCE_SNAPSHOT.json");
const sources = [
  { id: "GSC_PERFORMANCE", url: "https://support.google.com/webmasters/answer/17010961?hl=en", principle: "Performance analysis should emphasize clicks, impressions, pages, queries, comparisons, and change tracking rather than average position alone." },
  { id: "GSC_GROUPING", url: "https://support.google.com/webmasters/answer/17011259?hl=en", principle: "Performance data is grouped with canonical aggregation and privacy/truncation limits; dimensions cannot be cross-joined unless exported together." },
  { id: "GSC_DATA", url: "https://support.google.com/webmasters/answer/17011364?hl=en", principle: "Search Console data can be preliminary, aggregated, privacy-filtered, and limited by export/table behavior." },
  { id: "CANONICALIZATION", url: "https://developers.google.com/search/docs/crawling-indexing/canonicalization", principle: "Google selects representative canonical URLs for duplicate clusters; declared and Google-selected canonicals can differ." },
  { id: "CONSOLIDATE_DUPLICATES", url: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls", principle: "Redirects, rel=canonical, sitemaps, and internal-link consistency are canonical signals; signals should not conflict." },
  { id: "REDIRECTS", url: "https://developers.google.com/search/docs/crawling-indexing/301-redirects", principle: "Permanent redirects communicate durable URL moves; redirect targets should remain relevant and technically valid." },
  { id: "SITE_MOVES", url: "https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes", principle: "Map URLs one-to-one, change major systems separately where practical, update internal links, monitor, and retain redirects for at least a year." },
  { id: "CRAWLABLE_LINKS", url: "https://developers.google.com/search/docs/crawling-indexing/links-crawlable", principle: "Important internal links should be crawlable anchors with descriptive, relevant anchor text." },
  { id: "SITEMAPS", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap", principle: "Sitemaps should list preferred canonical URLs that the publisher wants surfaced in Search." }
];

const clean = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
const title = (html) => clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").slice(0, 240);

const capture = async (source) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const started = Date.now();
  try {
    const response = await fetch(source.url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "EchoBuddha-Private-Audit/1.0 (+https://echobuddha.com/)" } });
    const html = await response.text();
    return { ...source, http_status: response.status, accessible: response.ok, final_url: response.url, title: title(html), response_bytes: Buffer.byteLength(html), response_sha256: crypto.createHash("sha256").update(html).digest("hex"), elapsed_ms: Date.now() - started, error: "" };
  } catch (error) {
    return { ...source, http_status: 0, accessible: false, final_url: source.url, title: "", response_bytes: 0, response_sha256: "", elapsed_ms: Date.now() - started, error: error?.name === "AbortError" ? "TIMEOUT" : "FETCH_FAILED" };
  } finally {
    clearTimeout(timeout);
  }
};

const captured = [];
for (const source of sources) captured.push(await capture(source));
const snapshot = {
  schema_version: 1,
  captured_at: new Date().toISOString(),
  method: "Direct GET of current public official Google documentation; status, title, size, and SHA-256 retained without storing full third-party text.",
  privacy: "No private repository content, Search Console rows, identifiers, or analytics evidence was transmitted.",
  source_count: captured.length,
  accessible_count: captured.filter((source) => source.accessible).length,
  sources: captured
};
fs.writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(JSON.stringify({ output, source_count: snapshot.source_count, accessible_count: snapshot.accessible_count }, null, 2));
