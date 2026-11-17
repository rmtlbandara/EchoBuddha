# Echo Buddha social publishing reliability: final report, November 2026

Written Nov 17, 2026, 20:30–21:30 Asia/Colombo. Each verdict below is separate. Nothing here claims more than was checked live.

## Verdicts

| Area | Verdict |
|---|---|
| Backlog through Nov 17 | **Recovered, with one owner-gated item.** Every due item is public and verified, except Pin 3 (waits on the owner's native approval, eligible from Nov 18 01:26) and the Nov 15 Story (left the schedule; can't be proven, see below). |
| Persistent infrastructure | **Partial.** Facebook, YouTube, Medium and Instagram Stories and carousels run in the platforms' own schedulers, without Claude Code. The four Instagram Reels (Nov 19, 23, 26, 30) are still notification-assisted manual publishing. No autonomous Reel publisher exists yet. |
| Authentication | **No change, nothing new claimed.** Pinterest: EchoBuddha app 1631004, verified. Instagram: echobuddha confirmed in the browser tonight. No Meta app or Instagram API token exists for Echo Buddha, so no API authentication is claimed. |
| Monitoring | **Built, independent of Claude Code.** The new `Publication Watch` GitHub Actions workflow runs three times daily on GitHub's servers. It is read-only and holds no credentials. |
| GitHub | **Clean.** The records and monitoring PR merges after CI. The six open PRs (#9, #14, #55, #56, #79, #95) are unrelated dependency updates and were left open as instructed. |
| Long-term readiness | **Not yet autonomous for Instagram Reels.** The route to API publishing is documented below. It needs owner-only steps, and the AI label must be validated before any Reel moves to it. |

## 1. Live state at 20:32, Nov 17

- `main` at `d2a411a` (PR #116), not branch-protected. No wrangler. Cloudflare untouched.
- Pinterest tool: hold **on**, worker **off**. Pins 1 and 2 published and verified. Pin 3 drafted, not published.
- Instagram account in the browser: echobuddha.

## 2. Fixed tonight

| Item | Result | Evidence |
|---|---|---|
| Nov 17 Story (handbook reading path) | Published and verified | Live at `instagram.com/stories/echobuddha/` at 20:34, aged "4m", on echobuddha |
| Instagram Story archiving | **On** | Settings > Archiving and downloading > "Save story to archive" turned on and still on after a reload |

Archiving fixes the root cause behind the unprovable Nov 15 Story. From now on, every Story stays in the private archive after 24 hours and can be checked there.

The Nov 15 Story stays `PUBLISHED_UNVERIFIED`. It was not reposted, and no evidence was made up for it.

## 3. Root causes of the November misses

| Failure | Cause | Fix |
|---|---|---|
| Instagram Reels late (Nov 12, 15, 16) | Claude Code session crons fire only while that session is open and idle | Platform schedulers where they keep the AI label; GitHub reminder before each manual Reel |
| Nov 15 Story unprovable | Story archiving was off | Archiving turned on (above) |
| Wrong Instagram account (Nov 15) | Browser signed into nimblegridgames | Account check is step 0 of every job; nothing was published while wrong |
| Pinterest delays | Remediation hold, plus the classifier refusing gate edits | Owner applied v4 as administrator; native per-Pin approval; hold unchanged |

## 4. Publication Watch (new)

**Files:**

- `.github/workflows/publication-watch.yml`
- `scripts/publication-watch.mjs`
- `docs/marketing/2026-11/publication-watch.json` (30 items, Nov 17–30)
- `tests/publication-watch.test.mjs` (8 tests)

**Runs (Colombo time):**

| Time | Checks |
|---|---|
| 19:15 | Reminder for any manual Instagram Reel due within 90 minutes |
| 20:10 | YouTube public check through oEmbed: HTTP 200 means public. A scheduled Short gave 403 in testing |
| 15:00 | Anything due 18 or more hours ago that the ledger on `main` still doesn't show as verified |

**How the alert works:** a failed run is the alert. GitHub emails a failed scheduled run to the account that last changed the schedule, which is the owner who merges this PR. That is GitHub's default, and the owner's notification settings could not be checked.

The repo's governance validator allows workflows `contents: read` only. Opening issues would need `issues: write`, so the watch fails the run instead of opening an issue. The control was not loosened.

**Limits:**

- It sees only what is recorded on `main`. A publication that happened but isn't recorded yet still alerts.
- It cannot see Instagram or Facebook without logging in.
- It expires on Dec 2.
- It never publishes anything.

The earlier cloud routine `trig_01LJyPwtwy7n2WA9KpudBBTz` (daily YouTube check) is now redundant. Disable it after Nov 30.

## 5. Instagram API route (not built; owner-only steps)

The Instagram Graph API can publish Reels: create a container with `media_type=REELS` and a public `video_url`, then call `media_publish`. Meta's June 2026 changelog adds an `is_ai_generated` field.

Three things are missing, and an agent can't supply them:

1. **A Meta app for Echo Buddha.** None exists among the 14 apps on the account. The owner creates it and grants `instagram_business_content_publish` for echobuddha.
2. **A long-lived token.** The owner stores it as a GitHub Actions secret or in the macOS Keychain. Claude must never see, paste or commit it.
3. **Public hosting for the video files**, for example on echobuddha.com. That means a website deploy, which needs its own governed release.

**Validation gate before any Reel moves to the API:** the first API publish must be a real, already-approved Reel, not test content. Its public page must show "AI content", checked signed out. If the label is missing, that Reel goes back to native publishing and the API route stays closed.

A scheduler for it would be a GitHub Actions job with `contents: read`, using the secret. It would retry only after reading back the container status, never blindly.

## 6. Still on the owner

| When (Colombo) | Item | What it needs |
|---|---|---|
| Nov 18, from 01:26 | Pinterest Pin 3, Five Minutes, No Cushion | Run `node scripts/november-exception3-publish.mjs 3` in `tools/pinterest-mcp` and click Approve in the native dialog, then run `november-exception3-verify.mjs 3`. A Claude session job opens it at 08:47 if that session is open. |
| Nov 19, 23, 26, 30 at 20:00 | Instagram Reels (karma, five minutes, gratitude, December) | Publish natively on echobuddha with the AI label on, using the files and captions in `.artifacts/marketing-2026-11/ig-reels/`. Publication Watch reminds at 19:15. Claude session jobs run at 20:02 only if that session is open. |
| Before Nov 28 | Nov 28 practice video | A human listen to the final cut |
| After each publication | Ledger | Append a verified row on `main`, or Publication Watch alerts the next day |

## 7. Controls kept

- Pinterest: hold on, worker off, native per-Pin approval, pacing (6 hours apart, at most 2 in 24 hours) and Nov 30 expiry all unchanged. The 13 legacy Pins are untouched.
- Nothing published through nimblegridgames or app 1629796.
- No secrets committed.
- No security control loosened.
- No test content posted.
- No website or Cloudflare change.
