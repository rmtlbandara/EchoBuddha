export const ADSENSE = {
  enabled: true,
  publisherId: "ca-pub-3911157640549350",
  manualSlotsEnabled: false
};

const verificationExactPaths = new Set([
  "/"
]);

const neverAdExactPaths = new Set([
  "/404.html",
  "/about/",
  "/authors/echo-buddha-editorial/",
  "/buddhist-sources-and-citations/",
  "/contact/",
  "/corrections/",
  "/daily-reflections/",
  "/daily-reflections/today/",
  "/disclaimer/",
  "/editorial-policy/",
  "/how-echo-buddha-creates-content/",
  "/learn/",
  "/meditation-guide/",
  "/meditation-safety/",
  "/mindful-living/",
  "/privacy-policy/",
  "/quote-attribution-policy/",
  "/quotes/",
  "/search/",
  "/start-here/",
  "/terms-of-use/",
  "/tools/"
]);

const neverAdPrefixes = [
  "/daily-reflections/",
  "/learn/buddhist-dictionary/",
  "/learn/dhammapada-reflections/",
  "/learn/sutta-for-daily-life/",
  "/meditation/",
  "/quotes/"
];

const sensitiveArticlePaths = new Set([
  "/articles/buddhist-approach-to-anger/",
  "/articles/buddhist-teachings-on-forgiveness/",
  "/articles/buddhist-wisdom-for-overthinking/",
  "/articles/compassion-with-boundaries/",
  "/articles/dhammapada-reflection-trained-mind/",
  "/articles/dhammapada-reflection-what-we-think/",
  "/articles/dhammapada-verse-1-meaning/",
  "/articles/how-to-meditate-for-anxiety/",
  "/articles/how-to-meditate-for-beginners/",
  "/articles/loving-kindness-meditation-beginners/",
  "/articles/loving-kindness-meditation-guide/",
  "/articles/metta-meditation-script/",
  "/articles/mindfulness-for-better-sleep/",
  "/articles/mindfulness-of-breathing-guide/",
  "/articles/non-attachment-in-relationships/",
  "/articles/walking-meditation-step-by-step/"
]);

const normalizePath = (pathname: string) => {
  const pathOnly = pathname.split("?")[0]?.split("#")[0] || "/";
  if (pathOnly === "/404.html") return pathOnly;
  return pathOnly.endsWith("/") ? pathOnly : `${pathOnly}/`;
};

export function isAdSenseAllowedPath(pathname: string, noindex = false) {
  if (noindex) return false;

  const normalized = normalizePath(pathname);
  if (verificationExactPaths.has(normalized)) return true;
  if (neverAdExactPaths.has(normalized)) return false;
  if (neverAdPrefixes.some((prefix) => normalized.startsWith(prefix))) return false;
  if (sensitiveArticlePaths.has(normalized)) return false;

  const parts = normalized.split("/").filter(Boolean);
  const isArticleDetail = parts[0] === "articles" && parts.length === 2;
  const isBuddhism101Detail =
    parts[0] === "learn"
    && parts[1] === "buddhism-101"
    && parts.length === 3
    && parts[2] !== "five-hindrances-in-buddhism";
  const isCoreLearnPage = [
    "/learn/buddhism-for-beginners/",
    "/learn/eightfold-path/",
    "/learn/four-noble-truths/"
  ].includes(normalized);

  return isArticleDetail || isBuddhism101Detail || isCoreLearnPage;
}
