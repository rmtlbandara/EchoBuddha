import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const historicalRoot = process.env.ECHO_BUDDHA_FORENSIC_WORKTREE;
const outputDir = path.join(root, "docs/audits/adsense-rejection-2026-08/reconciliation");
const phase0Dir = path.join(root, "docs/audits/adsense-rejection-2026-08/phase-0-retroactive-baseline");

if (!historicalRoot) throw new Error("Set ECHO_BUDDHA_FORENSIC_WORKTREE.");

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[\",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const writeCsvAt = async (target, rows, headers = Object.keys(rows[0] ?? {})) => {
  const body = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
  await writeFile(target, `${body}\n`);
};
const decode = (text) => text
  .replaceAll("&nbsp;", " ").replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'")
  .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
const cleanText = (html) => decode(html
  .replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replaceAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
  .replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim());
const first = (html, regex) => decode((html.match(regex)?.[1] ?? "").replaceAll(/<[^>]+>/g, " ").replaceAll(/\s+/g, " ").trim());
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const walk = async (dir) => {
  const files = [];
  for (const entry of await readdir(dir)) {
    const absolute = path.join(dir, entry);
    const info = await stat(absolute);
    files.push(...(info.isDirectory() ? await walk(absolute) : [absolute]));
  }
  return files;
};
const routeForFile = (base, file) => {
  const relative = path.relative(base, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
};
const localPage = async (base, route) => {
  const file = route === "/" ? path.join(base, "index.html") : route.endsWith("/") ? path.join(base, route.slice(1), "index.html") : path.join(base, route.slice(1));
  const html = await readFile(file, "utf8");
  const text = cleanText(html);
  return {
    title: first(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    h1: first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
    robots: first(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i) || "index, follow (implicit)",
    canonical: first(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i),
    textHash: sha256(text),
    words: text ? text.split(/\s+/).length : 0,
  };
};

const htmlFiles = (await walk(dist)).filter((file) => file.endsWith(".html")).sort();
const routes = htmlFiles.map((file) => routeForFile(dist, file));
const currentLocal = new Map();
const historicalLocal = new Map();
for (const route of routes) {
  currentLocal.set(route, await localPage(dist, route));
  historicalLocal.set(route, await localPage(path.join(historicalRoot, "dist"), route));
}

const fetchOne = async (route) => {
  const requestUrl = `https://echobuddha.com${route}`;
  const startedAt = Date.now();
  try {
    const response = await fetch(requestUrl, {
      redirect: "follow",
      headers: { "user-agent": "EchoBuddha-Reconciliation-Audit/1.0 (+site-owner validation)" },
      signal: AbortSignal.timeout(30000),
    });
    const html = await response.text();
    const text = cleanText(html);
    const publisherIds = [...new Set([...html.matchAll(/ca-pub-\d+/g)].map((match) => match[0]))];
    const scripts = [...html.matchAll(/<script\b[^>]*src=["']([^"']*(?:adsbygoogle|googlesyndication)[^"']*)["'][^>]*>/gi)].map((match) => match[1]);
    return {
      route,
      requestUrl,
      status: response.status,
      finalUrl: response.url,
      redirected: response.url === requestUrl ? "No" : "Yes",
      contentType: response.headers.get("content-type") ?? "",
      cacheControl: response.headers.get("cache-control") ?? "",
      server: response.headers.get("server") ?? "",
      title: first(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      h1: first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i),
      robots: first(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i) || (response.status === 200 && /text\/html/.test(response.headers.get("content-type") ?? "") ? "index, follow (implicit)" : "N/A"),
      canonical: first(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i),
      words: text ? text.split(/\s+/).length : 0,
      textHash: sha256(text),
      htmlHash: sha256(html),
      adsenseScriptCount: scripts.length,
      adsenseScriptUrls: scripts.join(" | "),
      publisherIds: publisherIds.join(" | "),
      elapsedMs: Date.now() - startedAt,
      error: "",
    };
  } catch (error) {
    return { route, requestUrl, status: "ERROR", finalUrl: "", redirected: "N/A", contentType: "", cacheControl: "", server: "", title: "", h1: "", robots: "", canonical: "", words: 0, textHash: "", htmlHash: "", adsenseScriptCount: 0, adsenseScriptUrls: "", publisherIds: "", elapsedMs: Date.now() - startedAt, error: error.message };
  }
};

const production = [];
const concurrency = 12;
for (let offset = 0; offset < routes.length; offset += concurrency) {
  production.push(...await Promise.all(routes.slice(offset, offset + concurrency).map(fetchOne)));
  if ((offset / concurrency) % 5 === 0) console.log(`Fetched ${Math.min(offset + concurrency, routes.length)}/${routes.length}`);
}

const specialTargets = [
  "http://echobuddha.com/",
  "https://www.echobuddha.com/",
  "https://echobuddha.com/this-route-must-not-exist-phase-0-4/",
  "https://echobuddha.com/robots.txt",
  "https://echobuddha.com/sitemap.xml",
  "https://echobuddha.com/ads.txt",
];
const specialRows = [];
for (const requestUrl of specialTargets) {
  try {
    const response = await fetch(requestUrl, { redirect: "manual", headers: { "user-agent": "EchoBuddha-Reconciliation-Audit/1.0 (+site-owner validation)" }, signal: AbortSignal.timeout(30000) });
    const body = await response.text();
    specialRows.push({
      "Requested URL": requestUrl,
      Status: response.status,
      Location: response.headers.get("location") ?? "",
      "Content-Type": response.headers.get("content-type") ?? "",
      "Body SHA-256": sha256(body),
      "Body bytes": Buffer.byteLength(body),
      "Body preview": cleanText(body).slice(0, 240),
      Error: "",
    });
  } catch (error) {
    specialRows.push({ "Requested URL": requestUrl, Status: "ERROR", Location: "", "Content-Type": "", "Body SHA-256": "", "Body bytes": 0, "Body preview": "", Error: error.message });
  }
}

const parity = production.map((row) => {
  const current = currentLocal.get(row.route);
  const historical = historicalLocal.get(row.route);
  const productionMatchesCurrent = row.status === 200 && row.textHash === current.textHash;
  const productionMatchesHistorical = row.status === 200 && row.textHash === historical.textHash;
  const fieldsMatchCurrent = row.title === current.title && row.h1 === current.h1 && row.robots === current.robots && row.canonical === current.canonical;
  const fieldsMatchHistorical = row.title === historical.title && row.h1 === historical.h1 && row.robots === historical.robots && row.canonical === historical.canonical;
  const fullCurrentMatch = productionMatchesCurrent && fieldsMatchCurrent;
  const fullHistoricalMatch = productionMatchesHistorical && fieldsMatchHistorical;
  return {
    URL: row.requestUrl,
    "Production status": row.status,
    "Production final URL": row.finalUrl,
    "Current repo title/H1/robots/canonical match?": fieldsMatchCurrent ? "Yes" : "No",
    "Production rendered text matches current repo?": productionMatchesCurrent ? "Yes" : "No",
    "Production rendered text matches forensic a1cd457?": productionMatchesHistorical ? "Yes" : "No",
    "Production fully matches current repo?": fullCurrentMatch ? "Yes" : "No",
    "Production fully matches forensic a1cd457?": fullHistoricalMatch ? "Yes" : "No",
    "Production title": row.title,
    "Current title": current.title,
    "Forensic title": historical.title,
    "Production H1": row.h1,
    "Current H1": current.h1,
    "Production robots": row.robots,
    "Current robots": current.robots,
    "Forensic robots": historical.robots,
    "Production canonical": row.canonical,
    "Current canonical": current.canonical,
    "AdSense script count": row.adsenseScriptCount,
    "Publisher IDs": row.publisherIds,
    Classification: fullCurrentMatch && fullHistoricalMatch
      ? "MATCHES_CURRENT_AND_FORENSIC"
      : fullCurrentMatch
        ? "MATCHES_CURRENT_ONLY"
        : fullHistoricalMatch
          ? "MATCHES_FORENSIC_ONLY"
          : fieldsMatchCurrent
            ? "STRUCTURAL_MATCH_TEXT_DRIFT"
            : "PRODUCTION_REPOSITORY_DRIFT",
  };
});

const productionRows = production.map((row) => ({
  URL: row.requestUrl,
  Status: row.status,
  "Final URL": row.finalUrl,
  Redirected: row.redirected,
  "Content-Type": row.contentType,
  "Cache-Control": row.cacheControl,
  Server: row.server,
  Title: row.title,
  H1: row.h1,
  Robots: row.robots,
  Canonical: row.canonical,
  "Rendered words": row.words,
  "Rendered text SHA-256": row.textHash,
  "HTML SHA-256": row.htmlHash,
  "AdSense script count": row.adsenseScriptCount,
  "AdSense script URLs": row.adsenseScriptUrls,
  "Publisher IDs": row.publisherIds,
  "Elapsed ms": row.elapsedMs,
  Error: row.error,
  "Evidence class": "PRIMARY_LIVE_HTTP_OBSERVATION",
  "Observation time": new Date().toISOString(),
}));

await writeCsvAt(path.join(phase0Dir, "phase-0-current-production-baseline.csv"), productionRows);
await writeCsvAt(path.join(phase0Dir, "phase-0-current-production-special-routes.csv"), specialRows);
await writeCsvAt(path.join(outputDir, "phase-0-4-production-parity.csv"), parity);

const redirectRows = [
  ...production.filter((row) => row.redirected === "Yes").map((row) => ({ "Requested URL": row.requestUrl, Status: row.status, "Final URL / Location": row.finalUrl, Category: "HTML_ROUTE_FOLLOWED_REDIRECT", Result: "REVIEW" })),
  ...specialRows.map((row) => ({ "Requested URL": row["Requested URL"], Status: row.Status, "Final URL / Location": row.Location, Category: "SPECIAL_ROUTE_MANUAL_REDIRECT_CHECK", Result: row.Status >= 300 && row.Status < 400 ? "PASS_REDIRECT" : row["Requested URL"].includes("this-route-must-not-exist") && row.Status === 404 ? "PASS_404" : row["Requested URL"].endsWith("robots.txt") || row["Requested URL"].endsWith("sitemap.xml") || row["Requested URL"].endsWith("ads.txt") ? "PASS_RESOURCE_RESPONSE_RECORDED" : "REVIEW" })),
];
await writeCsvAt(path.join(outputDir, "phase-0-4-current-redirect-review.csv"), redirectRows);

const summary = {
  capturedAt: new Date().toISOString(),
  routesRequested: production.length,
  status200: production.filter((row) => row.status === 200).length,
  errors: production.filter((row) => row.status === "ERROR").length,
  redirectedHtmlRoutes: production.filter((row) => row.redirected === "Yes").length,
  matchesCurrentRepositoryText: parity.filter((row) => row["Production rendered text matches current repo?"] === "Yes").length,
  matchesForensicBaselineText: parity.filter((row) => row["Production rendered text matches forensic a1cd457?"] === "Yes").length,
  fullyMatchesCurrentRepository: parity.filter((row) => row["Production fully matches current repo?"] === "Yes").length,
  fullyMatchesForensicBaseline: parity.filter((row) => row["Production fully matches forensic a1cd457?"] === "Yes").length,
  matchesCurrentAndForensic: parity.filter((row) => row.Classification === "MATCHES_CURRENT_AND_FORENSIC").length,
  matchesCurrentOnly: parity.filter((row) => row.Classification === "MATCHES_CURRENT_ONLY").length,
  matchesForensicOnly: parity.filter((row) => row.Classification === "MATCHES_FORENSIC_ONLY").length,
  structuralMatchTextDrift: parity.filter((row) => row.Classification === "STRUCTURAL_MATCH_TEXT_DRIFT").length,
  productionRepositoryDrift: parity.filter((row) => row.Classification === "PRODUCTION_REPOSITORY_DRIFT").length,
  productionIndexable: production.filter((row) => row.status === 200 && !/noindex/i.test(row.robots)).length,
  productionNoindex: production.filter((row) => row.status === 200 && /noindex/i.test(row.robots)).length,
  adsenseScriptRoutes: production.filter((row) => row.adsenseScriptCount > 0).length,
  publisherIds: [...new Set(production.flatMap((row) => row.publisherIds.split(" | ").filter(Boolean)))],
  specialRoutes: specialRows,
};
await writeFile(path.join(phase0Dir, "phase-0-current-production-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
