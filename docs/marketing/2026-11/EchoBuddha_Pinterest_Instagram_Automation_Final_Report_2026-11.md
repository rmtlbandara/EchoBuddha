# Echo Buddha: Pinterest completion and Instagram Reel automation, November 2026

Status as of Nov 17, 2026, 21:50 Asia/Colombo. This report states what was checked live and nothing more.

## A. Verdicts

| Area | Status |
|---|---|
| Pinterest Pin 3 | **Pending.** The draft is ready. Pacing allows it from Nov 18, 01:26. Publishing needs the owner's click in the native approval dialog |
| Meta app | **Done.** "Echo Buddha Publisher", app 1645292123746045, in the Echo Buddha portfolio. Development mode, Instagram use case, contact email set by the owner's choice |
| Meta authentication | **Blocked on the owner.** The system user exists, but no token has been generated or stored. The secret `META_IG_SYSTEM_USER_TOKEN` is absent |
| Meta publishing permission | **Unproven.** `instagram_basic` and `instagram_content_publish` are added to the app at Standard access. Meta's setup page says Instagram needs App Review "before your app can access live data", so only a real publish will show whether development mode can publish |
| Instagram AI disclosure | **Not validated.** `is_ai_generated` is documented (changelog, June 22, 2026). The first API Reel is the test, and later Reels need a one-time administrator check in a native dialog |
| Persistent scheduler | **Deployed, not yet publishing.** GitHub Actions in a private repo, running every 10 minutes from 19:30 to 23:20 Colombo, Nov 18–30, plus preflights at 08:00 and 18:00. It works independently of Claude Code |
| Dry-run safety | **Fixed and tested.** Manual runs can only use `preflight` or `dry-run`, and neither can write to Meta or commit state. Proven on GitHub (run 44122035334) |
| Duplicate protection | **Implemented and tested.** Intent is saved before publishing, the inventory is searched, uncertain outcomes are never retried, and only one run can execute at a time |
| Monitoring | **Active.** The publisher raises alerts as issues and failed runs; it opened issue #2, BLOCKED_AUTHENTICATION, as designed. Publication Watch in this repo now treats the Reels as API-published (PR #118) |
| GitHub | **Merged.** Publisher PR #1 (`13b3a8b`). EchoBuddha PR #117 (`5976eef`) and PR #118 (`096f391`) |
| Full Instagram autonomy | **Not claimed.** There has been no authorized production publish yet |

## B. Pinterest

| Pin | Public URL | Published (Colombo) | Native approval | Verified |
|---|---|---|---|---|
| 1. Before You Say Of Course | https://www.pinterest.com/pin/995717798892136932/ | Nov 15, 13:23:08 | Owner, native dialog | API readback and signed-out page |
| 2. You Are Allowed to Stop | https://www.pinterest.com/pin/995717798892201022/ | Nov 17, 19:25:37 | Owner, native dialog | API readback and signed-out page |
| 3. Five Minutes, No Cushion | Not published | Eligible from Nov 18, 01:26 | Pending | — |

**Controls on Nov 17 at 21:30:**

- Remediation hold: on.
- Worker: off.
- Pinterest tool tests: 125 of 125 pass.

A Claude Code session job opens the Pin 3 native dialog on Nov 18 at 08:47, if that session is running. The verdict `PINTEREST_THREE_PIN_CAMPAIGN_COMPLETE_VERIFIED` hasn't been earned yet.

## C. Instagram integration

| Item | Value |
|---|---|
| App | Echo Buddha Publisher, app 1645292123746045. Development mode. Echo Buddha portfolio 1289688473298609 |
| Login model | Unified Login: Facebook Login for Business with a system-user access token. Meta now labels the plain Facebook-login setup as legacy |
| System user | EchoBuddhaPublisher (61596805554994), Employee role |
| Business asset access | @echobuddha (17841416162016850) with the Content task only. The app with Test app only |
| Permissions requested | `instagram_basic`, `instagram_content_publish`. Not yet granted, because no token exists |
| API | `graph.facebook.com/v27.0`. Video bytes go to `rupload.facebook.com` (resumable upload), so nothing is publicly hosted |
| Authentication status | Not authenticated. Each run checks the token read-only through `GET /debug_token`: valid, app ID, both scopes, granted for @echobuddha, no expiry |
| AI disclosure | `is_ai_generated=true` on every container. The readback is checked. Public visibility of the label needs the administrator's native-dialog record |
| Public verification | Media ID, account, Reel type, exact caption, permalink format, HTTP 200 on the permalink, and the administrator AI-label record |

## D. Infrastructure

| Part | What it is |
|---|---|
| Hosting | Private repo `rmtlbandara/echobuddha-reel-publisher`. EchoBuddha is public, so it can't hold unpublished media |
| Scheduling | GitHub Actions cron with a 4-hour late window, which recovers delayed or skipped runs |
| Durable state | `state/<retry_key>.json`, committed and pushed at every transition. A push rejection fails closed |
| Secrets | One Actions secret, set by the owner. It's masked in logs, sent only in headers and redacted from errors |
| Alerts | One issue per alert kind and item, plus GitHub's failed-run notification |
| Rollback | `gh workflow disable "Reel Publisher" -R rmtlbandara/echobuddha-reel-publisher`, or set the item's `enabled` to false |
| Avoiding a race with native publishing | The 8:02 pm native jobs were cancelled. A 6:47 pm decision job picks API or native for each Reel. Before any native publish, the queue item is disabled |

## E. November Reels

| Date | Content | Mechanism | Time | State |
|---|---|---|---|---|
| Nov 19 | Karma Is Not a Scoreboard | API if the token is in place and the 18:00 preflight passes; otherwise native | 20:00 Colombo | Queued. Hash and caption verified |
| Nov 23 | Five Minutes, No Pressure | API only after the administrator's AI-label record; otherwise native | 20:00 | Queued and gated |
| Nov 26 | Gratitude Without Forcing It | Same as Nov 23 | 20:00 | Queued and gated |
| Nov 30 | One Mindful Step Into December | Same as Nov 23 | 20:00 | Queued and gated |

## F. Tests

| Suite | Result |
|---|---|
| Reel publisher | 42 of 42, locally (5 consecutive runs) and in CI on PR #1 and `main`. The suite uses a fake of the documented Graph API and a real two-clone git test |
| Publication Watch | 9 of 9 |
| EchoBuddha CI on PR #118 | Release validation and browser validation pass |
| Pinterest tool | 125 of 125 |

The publisher tests are unit tests, not proof that production works. The production capability test is the first real publish.

## G. GitHub

| PR | Merge commit | CI |
|---|---|---|
| echobuddha-reel-publisher #1 (safety fixes) | `13b3a8b23bfa054a24b0ad89c3c1ece7aed170eb` | Test: pass |
| EchoBuddha #117 (Publication Watch) | `5976eefd747fccb1299b5adb6bf0e95c811333e6` | Both checks pass |
| EchoBuddha #118 (watch Reels as API-published) | `096f391fbc55770d40185d82544d81727fd1f36f` | Both checks pass |

Dependency PRs #9, #14, #55, #56, #79 and #95 were left open, as instructed.

## H. Remaining external dependencies

| Platform | Unmet requirement | Smallest action | Safe fallback |
|---|---|---|---|
| Meta | The system-user token | The owner generates it (Never expiry, the two permissions), then runs `gh secret set META_IG_SYSTEM_USER_TOKEN --repo rmtlbandara/echobuddha-reel-publisher` | Native publishing, after disabling the queue item |
| Meta | Whether development mode can publish | Learned from the Nov 19 publish. A definite rejection leaves nothing published, and the Reel goes out natively | Same as above |
| Instagram | Proof that the public AI label shows | After Nov 19, the owner runs `npm run verify-ai-label` | Later Reels stay native |
| Pinterest | Native approval for Pin 3 | The owner clicks Approve on or after Nov 18, 01:26 | None needed: Pin 3 waits |
