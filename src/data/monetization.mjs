import { ADSENSE } from "./ads.ts";
import { MONETIZATION_ROUTE_REGISTRY } from "./monetization-route-registry.mjs";

export const MONETIZATION_STATES = Object.freeze({
  NEVER_MONETIZE: "NEVER_MONETIZE",
  ELIGIBLE_CANDIDATE: "ELIGIBLE_CANDIDATE",
  HOLD_MANUAL_REVIEW: "HOLD_MANUAL_REVIEW",
  TECHNICAL_NON_HTML: "TECHNICAL_NON_HTML"
});

export const AD_ZONES = Object.freeze({
  ARTICLE_AFTER_MEANINGFUL_SECTION: "ARTICLE_AFTER_MEANINGFUL_SECTION",
  LEARN_AFTER_MEANINGFUL_SECTION: "LEARN_AFTER_MEANINGFUL_SECTION"
});

export const PROTECTED_ZONE_NAMES = Object.freeze([
  "HEADER", "PRIMARY_NAVIGATION", "BREADCRUMBS", "SEARCH", "TABLE_OF_CONTENTS",
  "SHARE_CONTROLS", "COPY_CONTROLS", "FORMS", "RELATED_CONTENT", "FOOTER",
  "CONSENT_UI", "FIRST_MOBILE_VIEWPORT", "MULTI_STEP_INSTRUCTIONS", "ERROR_UI"
]);

const allowedZonesByFamily = Object.freeze({
  ARTICLE: Object.freeze([AD_ZONES.ARTICLE_AFTER_MEANINGFUL_SECTION]),
  LEARN_DETAIL: Object.freeze([AD_ZONES.LEARN_AFTER_MEANINGFUL_SECTION])
});

export function normalizeMonetizationPath(input) {
  if (typeof input !== "string" || !input.trim()) return null;
  const value = input.trim();
  if (/\0|\\|\.\.|%2f|%5c/i.test(value)) return null;

  let url;
  try {
    url = new URL(value, "https://echobuddha.com");
  } catch {
    return null;
  }
  if (url.hostname !== "echobuddha.com" || (url.protocol !== "https:" && url.protocol !== "http:")) return null;
  if (/\/{2,}/.test(url.pathname)) return null;
  if (url.pathname === "/404.html") return url.pathname;
  return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
}

export function getRegisteredMonetizationPolicy(input) {
  const pathname = normalizeMonetizationPath(input);
  if (!pathname || !Object.hasOwn(MONETIZATION_ROUTE_REGISTRY, pathname)) {
    return Object.freeze({
      pathname,
      registered: false,
      state: MONETIZATION_STATES.NEVER_MONETIZE,
      family: "UNKNOWN",
      indexable: false,
      reason: "UNKNOWN_OR_INVALID_ROUTE",
      allowedZones: Object.freeze([])
    });
  }
  const entry = MONETIZATION_ROUTE_REGISTRY[pathname];
  return Object.freeze({
    pathname,
    registered: true,
    ...entry,
    allowedZones: Object.freeze([...(allowedZonesByFamily[entry.family] || [])])
  });
}

export function getMonetizationPolicy(context = {}) {
  const registered = getRegisteredMonetizationPolicy(context.pathname);
  if (!registered.registered) return registered;
  if (context.noindex === true || registered.indexable === false) {
    return Object.freeze({ ...registered, state: MONETIZATION_STATES.NEVER_MONETIZE, reason: "NOINDEX_ROUTE" });
  }
  if (context.indexable !== true || context.reviewedPublisherContent !== true) {
    return Object.freeze({ ...registered, state: MONETIZATION_STATES.NEVER_MONETIZE, reason: "MISSING_REQUIRED_PAGE_ELIGIBILITY_METADATA" });
  }
  return registered;
}

export function isPlacementEligible(policy, zone) {
  return Boolean(
    policy
    && policy.registered
    && policy.state === MONETIZATION_STATES.ELIGIBLE_CANDIDATE
    && typeof zone === "string"
    && policy.allowedZones.includes(zone)
    && !PROTECTED_ZONE_NAMES.includes(zone)
  );
}

export function canLoadAdSenseRuntime() {
  return ADSENSE.siteApprovedForRendering === true
    && ADSENSE.servingEnabled === true
    && ADSENSE.runtimeScriptEnabled === true;
}

export function canRenderAd({ policy, zone, slotId } = {}) {
  return canLoadAdSenseRuntime()
    && ADSENSE.manualSlotsEnabled === true
    && ADSENSE.autoAdsEnabled === false
    && typeof slotId === "string"
    && ADSENSE.approvedManualSlotIds.includes(slotId)
    && isPlacementEligible(policy, zone);
}

export function classifyTechnicalResource(pathname) {
  return ["/ads.txt", "/robots.txt", "/sitemap.xml", "/search-index.json", "/search.js"].includes(pathname)
    ? MONETIZATION_STATES.TECHNICAL_NON_HTML
    : null;
}
