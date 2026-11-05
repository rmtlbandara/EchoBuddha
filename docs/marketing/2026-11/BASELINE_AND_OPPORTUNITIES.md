# November 2026 baseline and opportunities

Captured 2026-11-05, about 12:00–12:30 Asia/Colombo (06:30–07:00 UTC). Operational dates use Asia/Colombo. Every figure below was read from a signed-in dashboard or a public endpoint at that time unless it is marked as historical. These are aggregates only; no raw exports are stored here.

## Production identity

| Item | Value | How it was checked |
|---|---|---|
| Serving SHA | `edfe72dd8fbb313f6267d1da9580be3b3e5eb671` (built 2026-11-03T14:23:18Z) | Live `/release.json` |
| `origin/main` | `4cc04d53129a7a376859498e4722678ce2469cac` | `git fetch` |
| Difference | Release records and `governance/measurement-interventions.json` only; no application files | `git diff --stat` |
| Cloudflare deployment | `d06b720f-065c-4db0-92a2-1058897cfcb8`, version `49895182-617f-4056-b44c-70bbc84af533` | Repository record only. **Not rechecked:** the Cloudflare connector needs authorization |
| Sitemap | 171 URLs, including the 12-chapter handbook plus hub (13 URLs) | Live `/sitemap.xml` |
| Footer order | Pinterest, YouTube, Facebook, Instagram, Medium; no LinkedIn | Live homepage |

### Production Smoke is failing on schedule, but the site is not down

The latest scheduled run (41828756695, 2026-11-04) passed 14 of 15 checks. The one failure is `release-identity`: the job compares the serving SHA with the newest `main` commit, and `main` is ahead by records only. Each of the last six weekly runs is marked failed; only the latest was opened. The check could compare against the last deployed commit instead, as a separate small fix. It is not a reason to deploy.

No critical link, branding or SEO breakage was found, so no site deployment was made.

## Search: Google Search Console (`sc-domain:echobuddha.com`)

Report window: Oct 6 – Nov 2, 2026 (GSC's default 28 days at capture; the latest days may not be finalized).

| Metric | Value |
|---|---|
| Clicks | 69 |
| Impressions | 4.28K |
| CTR | 1.6% |
| Average position | 8.3 |
| Mobile / desktop / tablet clicks | 39 / 26 / 4 |
| Top countries by clicks | US 37, UK 5, India 3, Sri Lanka 3 (125 countries in total) |

**Index state:** 135 indexed, 232 not indexed. The chart's visible axis ends in mid to late October, so treat this as the latest report rather than today's state.

| Not-indexed reason | Pages | Validation |
|---|---:|---|
| Excluded by `noindex` | 115 | Failed |
| Crawled, currently not indexed | 91 | Failed |
| Discovered, currently not indexed | 14 | Passed |
| Page with redirect | 10 | Failed |
| Redirect error | 1 | Not started |
| Alternate page with proper canonical | 1 | Not started |

**Other reports:** the sitemap was last read Nov 2 with 167 discovered pages, so it predates the Nov 3 snapshot of 171. No manual actions. Core Web Vitals shows no data. External links total 7, all from `medium.com`.

**URL inspection:** `/articles/mindful-email-and-texting/` is on Google and indexed. **The 47-URL cohort was not re-inspected.** Its stored result remains historical.

## Bing Webmaster: not accessible

`BLOCKED_AUTH`. The browser session shows the signed-out landing page, and a sign-in was not attempted. No Bing figure here is current.

## GA4 (account 399080910, property 542992383)

The browser opens on the NimbleGrid property by default, so check the property before reading any figure.

Window: Oct 8 – Nov 4, 2026. Figures include only what consent settings allow GA4 to record, and owner or audit visits may be included.

| Channel | Sessions | Engaged | Engagement rate |
|---|---:|---:|---:|
| Organic Search | 156 | 99 | 63.46% |
| Direct | 145 | 65 | 44.83% |
| Organic Social | 19 | 12 | 63.16% |
| AI Assistant | 7 | 4 | 57.14% |
| Organic Video | 4 | 4 | 100% |
| Unassigned | 3 | 1 | 33.33% |
| **Total** | **333** | **185** | **55.56%** |

The landing-page report could not be opened by direct link and is not captured. These samples are very small. Direct traffic has a low engagement rate and may contain owner visits.

## Stale figures compared with fresh ones

These windows overlap and differ in length or definition, so **none of these differences should be read as growth or decline**, and nothing here is attributed to a campaign.

| Measure | October figure | Fresh figure | Comparable? |
|---|---|---|---|
| GA4 sessions | 277 (Oct 2–29) | 333 (Oct 8–Nov 4) | Overlapping windows; descriptive only |
| GA4 Organic Social | 13 (Oct 2–29) | 19 (Oct 8–Nov 4) | Overlapping and small sample |
| GSC performance | 143 clicks, 11,572 impressions, 1.236% CTR, position 10.79 (90 days to Oct 28) | 69 clicks, 4.28K impressions, 1.6% CTR, position 8.3 (28 days to Nov 2) | Different lengths; do not compare |
| GSC inspection cohort (47) | 4 indexed, 29 crawled, 11 discovered, 3 unknown | Not re-inspected | No fresh value |
| Bing | About 67 clicks (Jul 30–Oct 29) | Not accessible | No fresh value |
| Canonical URLs | 165 superseded by 171 (Nov 3) | 171 | Yes |

## Social and publishing accounts

| Platform | State on Nov 5 | Notes |
|---|---|---|
| YouTube Studio | 3 public Shorts, 0 subscribers, 79 views and 0.6 watch hours (Oct 7–Nov 3) | Average view duration reads 224% on Episode 03, so a short loop is inflating it. Treat it with caution |
| Facebook | 5 followers; 3 Reels and 3 photos on record; nothing scheduled | Meta states Facebook reach is no longer available after Oct 31, 2026; use Viewers |
| Instagram | 1 post (Episode 03), 0 followers | Episodes 01 and 02 remain unpublished here |
| Pinterest | 15 created Pins, 3 followers, 4.3k monthly views | Monthly views are not clicks |
| Medium | 11 published, 1 draft, 7 presentations and 0 views so far in November | Lifetime views per story are single digits |
| AdSense | `echobuddha.com`: **Getting ready**, ads.txt Authorized, updated Oct 31 12:19 | **Differs from the repo's last record** (Needs attention / Low value content, no review submitted). Owner should confirm. Read-only; no action taken |

## Three strongest reader intents

1. **A daily reflection to return to.** `/daily-reflections/` has 31 clicks from 257 impressions, and "buddhist daily reflections" gives 10 clicks from 88 impressions. This is by far the highest click-through on the site and looks partly navigational.
2. **Dhamma or Dharma: what's the difference?** `/articles/dhamma-vs-dharma/` has 1,286 impressions and 6 clicks. The query variants ("dhamma vs dharma" 93, "dhamma or dharma" 81, "difference between…" 55 and 39) are the largest visible demand.
3. **Practical Right Speech.** `/articles/right-speech-buddhism/` has 709 impressions and 2 clicks; `/articles/right-speech-examples/` has 87 and 2; `/articles/mindful-email-and-texting/` has 42 and 3. Readers seem to arrive for applied help, which supports the Quiet Response week.

## Three real bottlenecks

1. **Search engines are declining to index much of what they crawl.** 91 crawled and 14 discovered URLs are not indexed. Some of this may be selection rather than a fault, and repeated indexing requests would not force a change. Improving distinctive value on pages that already have demand is the proportionate response.
2. **High-impression pages earn few clicks.** `/articles/dhamma-vs-dharma/` is at about 0.47% CTR and `/articles/right-speech-buddhism/` at about 0.28%. Per-page position has not been captured, so low ranking may explain part of this. Check query and position before editing titles.
3. **No independent citations are visible.** GSC lists 7 external links, all from Echo Buddha's own Medium account. These are referral links, not earned editorial links. There is nothing useful to cite yet that is distinctive, which is why the citeable asset comes before outreach.

## Open items for the owner

- Redirect error (1 URL) has not been identified.
- Pinterest local queue holds two old proposed slots: `ac9ea1c5…` (Nov 2, missed) and `2d4e8d55…` (Nov 5, no approval). They won't run. Decide whether to cancel them.
