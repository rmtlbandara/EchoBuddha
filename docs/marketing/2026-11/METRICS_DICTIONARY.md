# November 2026 metrics dictionary

Report these five groups separately. Always state the denominator, date window, timezone, sample size, data lag and any consent or attribution limit. Numeric growth goals are hypotheses, and small samples can't support causal claims.

## 1. Publishing completion

| Metric | Definition |
|---|---|
| Completion rate | Items at `PUBLISHED_VERIFIED` ÷ approved items due so far |
| Duplicate count | Same asset fingerprint live twice on one platform. Target 0 |
| Working-link rate | Published items whose owned link returns 200 with a clean canonical. Target 100% |

### Status values

| Status | Meaning |
|---|---|
| `READY` | Asset and text complete, not on the platform as public or scheduled. A Meta draft is still `READY` |
| `SCHEDULED` | Accepted by the platform's own scheduler, with time and timezone recorded |
| `PUBLISHED_VERIFIED` | Public URL or ID reopened and confirmed |
| `FAILED_LIVE_VERIFY` | A post was attempted, but the public item can't be confirmed. Reconcile before retrying |
| `FAILED_QA` | Failed editorial, safety or technical review |
| `HOLD_SOURCE_REVIEW` | A claim can't yet be verified against its source |
| `BLOCKED_AUTH` | No authenticated session available |
| `BLOCKED_PLATFORM_PERMISSION` | A platform, tool or permission gate prevents the action |

## 2. Website outcomes (GA4, consented data only)

| Metric | Definition | Limit |
|---|---|---|
| Engaged sessions | GA4 engaged sessions | Consent-dependent; owner visits may be included |
| Campaign sessions | Sessions with `utm_campaign=eb_nov_2026` | Undercounts in-app browsers and unlinked mentions |
| Returning users | GA4 returning users | Reset by cleared cookies or a new device |
| Practice-tool actions | Existing tool events | Not evidence of practice or benefit |

## 3. Search discovery

| Metric | Definition | Limit |
|---|---|---|
| GSC clicks, impressions, CTR, position | Finalized days only | Compare matched, complete windows; recent days are provisional |
| Index states | GSC Page indexing report | Report date lags; publication doesn't cause short-term index change |
| Bing | Clicks, crawl and index states | IndexNow acceptance is not indexing |

Material deployments reset the observation window; see `docs/measurement-interventions.md`.

## 4. Social quality

| Platform | Primary | Secondary | Do not treat as success on its own |
|---|---|---|---|
| Pinterest | Outbound clicks, saves | Pin clicks | Impressions, monthly views |
| YouTube | Average % viewed, stayed-to-watch, site sessions | Watch time | Views. Average % above 100 reflects looping |
| Instagram | Saves, shares, profile-to-site behaviour | Reach | Likes |
| Facebook | Viewers, watch time, thoughtful comments, link clicks | Shares | Reach (Meta states it was retired after Oct 31, 2026) |
| Medium | Reads, read ratio, referrals | Presentations | Views alone |

## 5. Trusted distribution

| Metric | Definition | Does not count |
|---|---|---|
| Unique referring domains | Independently observed domains linking editorially | Echo Buddha's own social profiles or Medium |
| Earned placements | A link or mention seen live | Sent outreach, or an unconfirmed reply |

## Reporting cadence

Baseline Nov 5. Operational check Nov 8. Campaign reviews Nov 15 and 22. Final report Nov 30.
