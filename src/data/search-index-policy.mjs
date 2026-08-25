import { MONETIZATION_ROUTE_REGISTRY } from "./monetization-route-registry.mjs";

export const SEARCH_INDEX_STATES = Object.freeze({
  INDEXABLE: "INDEXABLE_CANONICAL_200",
  NOINDEX: "NOINDEX_USER_PAGE_200",
  PERMANENT_REDIRECT: "PERMANENT_REDIRECT",
  TEMPORARY_REDIRECT: "TEMPORARY_REDIRECT",
  REMOVED_404: "REMOVED_404",
  REMOVED_410: "REMOVED_410",
  TECHNICAL: "TECHNICAL_ENDPOINT",
  NON_HTML: "NON_HTML_RESOURCE",
  HOLD: "HOLD_MANUAL_REVIEW"
});

export const SEARCH_REDIRECTS = Object.freeze({
  "/articles/how-to-practice-non-attachment/": "/articles/how-to-let-go-of-attachment-in-buddhism/",
  "/articles/letting-go-without-giving-up/": "/articles/how-to-let-go-of-attachment-in-buddhism/",
  "/terms-and-conditions/": "/terms-of-use/"
});

export const SEARCH_TECHNICAL_ENDPOINTS = Object.freeze({
  "/ads.txt": "text/plain",
  "/robots.txt": "text/plain",
  "/sitemap.xml": "application/xml",
  "/search-index.json": "application/json",
  "/search.js": "text/javascript"
});

const htmlPolicy = Object.fromEntries(
  Object.entries(MONETIZATION_ROUTE_REGISTRY).map(([route, value]) => [
    route === "/404.html" ? "/404" : route,
    {
      state: value.indexable
        ? SEARCH_INDEX_STATES.INDEXABLE
        : SEARCH_INDEX_STATES.NOINDEX,
      family: value.family,
      canonical: route === "/404.html" ? null : route,
      sitemap: Boolean(value.indexable) && route !== "/404.html"
    }
  ])
);

export const SEARCH_INDEX_POLICY = Object.freeze({
  ...htmlPolicy,
  "/404.html": { state: SEARCH_INDEX_STATES.TEMPORARY_REDIRECT, family: "ERROR_ALIAS", canonical: null, sitemap: false, target: "/404" },
  ...Object.fromEntries(Object.entries(SEARCH_REDIRECTS).map(([route, target]) => [
    route,
    { state: SEARCH_INDEX_STATES.PERMANENT_REDIRECT, family: "HISTORICAL_REDIRECT", canonical: null, sitemap: false, target }
  ])),
  ...Object.fromEntries(Object.entries(SEARCH_TECHNICAL_ENDPOINTS).map(([route, contentType]) => [
    route,
    { state: SEARCH_INDEX_STATES.TECHNICAL, family: "TECHNICAL", canonical: null, sitemap: false, contentType }
  ]))
});

const normalizeBuildPath = (pathname) => pathname === "/404/" ? "/404" : pathname;

export const getSearchIndexPolicy = (pathname) => SEARCH_INDEX_POLICY[normalizeBuildPath(pathname)] ?? {
  state: SEARCH_INDEX_STATES.HOLD,
  family: "UNKNOWN",
  canonical: null,
  sitemap: false
};

export const isIndexableSearchRoute = (pathname) =>
  getSearchIndexPolicy(pathname).state === SEARCH_INDEX_STATES.INDEXABLE;
