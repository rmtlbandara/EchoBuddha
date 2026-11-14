const origin = "https://echobuddha.com";

// The live sitemap is the current intended indexable cohort, not an old watchlist.
export function canonicalInspectionUrls(xml) {
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  if (!urls.length) throw new Error("Current canonical sitemap is empty");
  for (const value of urls) {
    const url = new URL(value);
    if (url.origin !== origin || url.username || url.password || url.search || url.hash || !url.pathname.endsWith("/")) {
      throw new Error("Sitemap inspection requires public same-host canonical URLs");
    }
  }
  if (new Set(urls).size !== urls.length) throw new Error("Duplicate canonical sitemap URLs");
  return urls.sort();
}

export function inspectionCohort(sitemapUrls, watchlistRoutes = []) {
  const absolute = [...sitemapUrls, ...watchlistRoutes].map(value => new URL(value, origin).href);
  for (const value of absolute) {
    const url = new URL(value);
    if (url.origin !== origin || url.username || url.password || url.search || url.hash) throw new Error("Inspection cohort must use public same-host URLs");
  }
  return [...new Set(absolute)].sort();
}

// Three read-only requests in flight; authentication/quota/outage failures stop
// new requests. Every progress snapshot includes pending/blocked URLs explicitly.
export async function inspectCanonicalCohort(urls, inspect, onProgress = () => {}) {
  const results = new Array(urls.length);
  let cursor = 0;
  let blocked = null;
  const snapshot = () => urls.map((url, index) => results[index] ?? {
    inspectionUrl: url, httpStatus: blocked ? "NOT_ATTEMPTED" : "PENDING",
    error: { status: blocked ? `COLLECTION_BLOCKED_AFTER_${blocked}` : "NOT_YET_INSPECTED" }
  });
  await onProgress(snapshot());
  await Promise.all(Array.from({ length: Math.min(3, urls.length) }, async () => {
    while (!blocked && cursor < urls.length) {
      const index = cursor++;
      const row = await inspect(urls[index]);
      results[index] = row;
      if ([401, 403, 429, "UNAVAILABLE"].includes(row.httpStatus)) blocked = row.httpStatus;
      await onProgress(snapshot());
    }
  }));
  return snapshot();
}

export async function fetchSearchEvidence(url, options = {}, { fetcher = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), maxAttempts = 4 } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let response;
    try {
      response = await fetcher(url, { ...options, signal: AbortSignal.timeout(30_000) });
    } catch {
      // Fetch errors can contain credential-bearing URLs. Never expose the error.
      if (attempt === maxAttempts - 1) throw new Error("Search evidence request unavailable after bounded transport retries");
    }
    if (response && ![429, 500, 502, 503, 504].includes(response.status)) return response;
    if (attempt === maxAttempts - 1) return response;
    const retryAfter = response?.headers.get("retry-after");
    const requestedDelay = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : 1000 * 2 ** attempt;
    await response?.body?.cancel();
    await sleep(Math.min(30_000, Math.max(1000, requestedDelay)));
  }
}

export function summarizeGoogleInspection(row) {
  const index = row.inspectionResult?.indexStatusResult;
  return {
    url: row.inspectionUrl,
    httpStatus: row.httpStatus,
    verdict: index?.verdict ?? "UNKNOWN",
    coverageState: index?.coverageState ?? "UNKNOWN",
    lastCrawlTime: index?.lastCrawlTime ?? null,
    pageFetchState: index?.pageFetchState ?? "UNKNOWN",
    robotsTxtState: index?.robotsTxtState ?? "UNKNOWN",
    indexingState: index?.indexingState ?? "UNKNOWN",
    userCanonical: index?.userCanonical ?? null,
    googleCanonical: index?.googleCanonical ?? null,
    sitemaps: index?.sitemap ?? [],
    errorStatus: row.error?.status ?? null
  };
}
