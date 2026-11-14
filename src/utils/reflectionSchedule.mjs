/** Explicit editorial schedules. Appending library records never changes either pool.
 * v1 preserves the pre-November-2026 calendar. v2 deliberately begins at the
 * 2027 UTC year boundary; future additions require a new dated schedule.
 */
export const REFLECTION_SCHEDULES = Object.freeze([
  { version: "2026-original", effectiveFrom: "0000-01-01", slugs: Object.freeze([
    "patience-before-anger-speaks",
    "one-honest-breath",
    "kindness-with-boundaries",
    "impermanence-softens-clinging",
    "listen-before-answering",
    "small-actions-shape-the-mind",
    "let-the-feeling-pass",
    "begin-again-without-shame",
    "notice-before-fixing",
    "compassion-begins-nearby",
    "one-step-on-the-path",
    "gratitude-notices-enough",
    "anger-as-a-signal",
    "letting-go-keeps-care",
    "soften-the-inner-argument",
    "metta-for-a-difficult-person",
    "thoughts-are-visitors",
    "speech-can-reduce-suffering",
    "walking-as-practice",
    "see-the-conditions",
    "morning-intention",
    "rest-without-escape",
    "forgiveness-without-approval",
    "enough-for-this-moment",
    "the-first-truth-is-kind",
    "mindful-work",
    "family-patience",
    "simple-goodwill",
    "evening-release",
    "gratitude-for-change"
]) },
  { version: "2027-editorial", effectiveFrom: "2027-01-01", slugs: Object.freeze([
    "patience-before-anger-speaks",
    "one-honest-breath",
    "kindness-with-boundaries",
    "impermanence-softens-clinging",
    "listen-before-answering",
    "small-actions-shape-the-mind",
    "let-the-feeling-pass",
    "begin-again-without-shame",
    "notice-before-fixing",
    "compassion-begins-nearby",
    "one-step-on-the-path",
    "gratitude-notices-enough",
    "anger-as-a-signal",
    "letting-go-keeps-care",
    "soften-the-inner-argument",
    "metta-for-a-difficult-person",
    "thoughts-are-visitors",
    "speech-can-reduce-suffering",
    "walking-as-practice",
    "see-the-conditions",
    "morning-intention",
    "rest-without-escape",
    "forgiveness-without-approval",
    "enough-for-this-moment",
    "the-first-truth-is-kind",
    "mindful-work",
    "family-patience",
    "simple-goodwill",
    "evening-release",
    "gratitude-for-change",
    "let-someone-help",
    "name-the-person-who-helped",
    "before-forwarding-a-claim",
    "another-persons-good-news",
    "change-your-mind-clearly",
    "a-promise-needs-an-answer",
    "leave-room-for-the-unfamiliar",
    "accept-a-correction",
    "notice-the-neutral-moment",
    "finish-the-practice-and-return"
]) }
]);

/** @param {Date} date @param {readonly string[]} availableSlugs
 * @param {readonly {version:string,effectiveFrom:string,slugs:readonly string[]}[]} schedules */
export function getScheduledReflectionSlug(date, availableSlugs, schedules = REFLECTION_SCHEDULES) {
  if (!availableSlugs.length) return undefined;
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return availableSlugs[0];
  const day = date.toISOString().slice(0, 10);
  const schedule = [...schedules].reverse().find(item => item.effectiveFrom <= day);
  if (!schedule?.slugs.length) return availableSlugs[0];
  const year = date.getUTCFullYear();
  const ordinal = Math.floor((Date.UTC(year, date.getUTCMonth(), date.getUTCDate()) - Date.UTC(year, 0, 1)) / 86400000);
  const available = new Set(availableSlugs);
  const intended = schedule.slugs[ordinal % schedule.slugs.length];
  return available.has(intended) ? intended : schedule.slugs.find(slug => available.has(slug)) ?? availableSlugs[0];
}
