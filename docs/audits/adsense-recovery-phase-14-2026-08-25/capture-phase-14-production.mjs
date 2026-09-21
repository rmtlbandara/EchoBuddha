import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mode = process.argv[2];
if (!new Set(["predeploy", "postdeploy"]).has(mode)) throw new Error("Use predeploy or postdeploy.");
const outDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(outDir, "../../..");
const inventoryPath = path.join(root, "docs/audits/adsense-recovery-phase-11-2026-08-25/ECHO_BUDDHA_PHASE_11_URL_TECHNICAL_INVENTORY.csv");
const outputName = mode === "predeploy"
  ? "ECHO_BUDDHA_PHASE_14_PREDEPLOY_PRODUCTION_BASELINE.csv"
  : "ECHO_BUDDHA_PHASE_14_PRODUCTION_CRAWL.csv";

function parseCsv(text) {
  const rows = []; let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...records] = rows.filter((item) => item.some(Boolean));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
function writeCsv(file, rows) {
  const headers = Object.keys(rows[0] || {});
  fs.writeFileSync(file, `${[headers, ...rows.map((row) => headers.map((header) => row[header]))].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`);
}
const extract = (html, pattern) => html.match(pattern)?.[1]?.replace(/\s+/g, " ").trim() || "";
const strip = (html) => html.replace(/<script\b[\s\S]*?<\/script>/gi, " ").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const timeout = 25_000;
async function request(url, redirect = "manual") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { redirect, signal: controller.signal, headers: { "user-agent": "EchoBuddhaPhase14Audit/1.0" } });
    const body = await response.text();
    return { response, body, error: "" };
  } catch (error) {
    return { response: null, body: "", error: error?.name || "FETCH_ERROR" };
  } finally { clearTimeout(timer); }
}

const initialInventory = parseCsv(fs.readFileSync(inventoryPath, "utf8"));
if (initialInventory.length !== 344) throw new Error(`Expected immutable Phase 11 inventory to contain 344 rows; found ${initialInventory.length}.`);
const authorizedSuccessorAdditions = [
  {
    URL: "https://echobuddha.com/learn/questions-about-buddhism/did-buddha-order-buddha-images/",
    route: "/learn/questions-about-buddhism/did-buddha-order-buddha-images/",
    family: "LEARN_DETAIL",
    intended_state: "INDEXABLE_CANONICAL_200",
    expected_http_status: "200",
  },
  {
    URL: "https://echobuddha.com/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/",
    route: "/learn/questions-about-buddhism/respecting-buddha-after-parinibbana/",
    family: "LEARN_DETAIL",
    intended_state: "INDEXABLE_CANONICAL_200",
    expected_http_status: "200",
  },
  {
    URL: "https://echobuddha.com/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/",
    route: "/learn/questions-about-buddhism/is-buddha-image-only-uddesika-cetiya/",
    family: "LEARN_DETAIL",
    intended_state: "INDEXABLE_CANONICAL_200",
    expected_http_status: "200",
  },
  {
    URL: "https://echobuddha.com/learn/questions-about-buddhism/why-no-buddha-statue-at-jetavana/",
    route: "/learn/questions-about-buddhism/why-no-buddha-statue-at-jetavana/",
    family: "LEARN_DETAIL",
    intended_state: "INDEXABLE_CANONICAL_200",
    expected_http_status: "200",
  },
  {
    URL: "https://echobuddha.com/learn/questions-about-buddhism/why-bodhi-tree-planted-at-jetavana/",
    route: "/learn/questions-about-buddhism/why-bodhi-tree-planted-at-jetavana/",
    family: "LEARN_DETAIL",
    intended_state: "INDEXABLE_CANONICAL_200",
    expected_http_status: "200",
  },
];
const inventory = mode === "postdeploy"
  ? [...initialInventory, ...authorizedSuccessorAdditions]
  : initialInventory;
const expectedInventoryRows = mode === "postdeploy" ? 349 : 344;
if (inventory.length !== expectedInventoryRows) throw new Error(`Expected ${expectedInventoryRows} ${mode} inventory rows; found ${inventory.length}.`);
const sitemapFetch = await request("https://echobuddha.com/sitemap.xml", "follow");
const sitemapUrls = new Set([...sitemapFetch.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
const results = Array(inventory.length);
let cursor = 0;
async function worker() {
  for (;;) {
    const index = cursor++;
    if (index >= inventory.length) return;
    const expected = inventory[index];
    const first = await request(expected.URL, "manual");
    const status = first.response?.status || 0;
    const location = first.response?.headers.get("location") || "";
    let finalUrl = expected.URL;
    let finalStatus = status;
    let body = first.body;
    let contentType = first.response?.headers.get("content-type") || "";
    if (status >= 300 && status < 400 && location) {
      const followed = await request(new URL(location, expected.URL).href, "follow");
      finalUrl = followed.response?.url || new URL(location, expected.URL).href;
      finalStatus = followed.response?.status || 0;
      body = followed.body;
      contentType = followed.response?.headers.get("content-type") || "";
    }
    const html = /text\/html/i.test(contentType) ? body : "";
    const canonical = extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || extract(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const robots = extract(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i) || "index, follow";
    const title = extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const h1 = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "").trim();
    const schemaTypes = [...html.matchAll(/"@type"\s*:\s*(?:"([^"]+)"|\[([^\]]+)\])/g)].flatMap((match) => match[1] ? [match[1]] : [...match[2].matchAll(/"([^"]+)"/g)].map((item) => item[1]));
    const links = [...html.matchAll(/<a\b[^>]+href=["']([^"'#]+)["']/gi)].map((match) => {
      try { return new URL(match[1], finalUrl).href; } catch { return ""; }
    }).filter((url) => url.startsWith("https://echobuddha.com/"));
    const realAdSignals = (html.match(/pagead2\.googlesyndication\.com|<ins\b[^>]*class=["'][^"']*adsbygoogle|data-ad-slot=/gi) || []).length;
    const emptyAdPlaceholders = (html.match(/class=["'][^"']*(?:ad-slot|adsbygoogle|advertisement-placeholder)[^"']*["']/gi) || []).length;
    results[index] = {
      URL: expected.URL,
      route: expected.route,
      family: expected.family,
      intended_state: expected.intended_state,
      expected_http_status: expected.expected_http_status,
      actual_http_status: status,
      location,
      final_url: finalUrl,
      final_http_status: finalStatus,
      content_type: contentType,
      canonical,
      robots,
      title,
      h1,
      sitemap: sitemapUrls.has(expected.URL) ? "YES" : "NO",
      inlinks: 0,
      structured_data_types: [...new Set(schemaTypes)].join("|"),
      visible_text_chars: strip(html).length,
      real_ad_signals: realAdSignals,
      empty_ad_placeholders: emptyAdPlaceholders,
      fetch_error: first.error,
      captured_at: new Date().toISOString(),
      _links: links
    };
    if ((index + 1) % 50 === 0) console.log(`${mode} crawl scheduled: ${index + 1}/${inventory.length}`);
  }
}
await Promise.all(Array.from({ length: 12 }, () => worker()));
const inlinks = new Map(results.map((row) => [row.URL, 0]));
for (const row of results) for (const link of new Set(row._links)) if (inlinks.has(link)) inlinks.set(link, inlinks.get(link) + 1);
for (const row of results) { row.inlinks = inlinks.get(row.URL) || 0; delete row._links; }
writeCsv(path.join(outDir, outputName), results);
const summary = {
  mode,
  captured_at: new Date().toISOString(),
  inventory_rows: results.length,
  status_counts: Object.fromEntries([...new Set(results.map((row) => row.actual_http_status))].sort().map((status) => [status, results.filter((row) => row.actual_http_status === status).length])),
  sitemap_fetch_status: sitemapFetch.response?.status || 0,
  sitemap_urls: sitemapUrls.size,
  real_ad_signals: results.reduce((sum, row) => sum + row.real_ad_signals, 0),
  empty_ad_placeholders: results.reduce((sum, row) => sum + row.empty_ad_placeholders, 0),
  fetch_errors: results.filter((row) => row.fetch_error).length
};
fs.writeFileSync(path.join(outDir, `ECHO_BUDDHA_PHASE_14_${mode.toUpperCase()}_CRAWL_SUMMARY.json`), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
