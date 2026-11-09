# Execution report: final November reconciliation (Nov 6–9)

From `main` at `a7c7c44`. Records only; nothing on the website changed and nothing was deployed, so production stays at `dff0126`. Times are Asia/Colombo.

**Outcome: `NOVEMBER_CAMPAIGN_SCHEDULED_WITH_NATIVE_DEPENDENCIES`, with `PARTIAL_PLATFORM_PERMISSION_BLOCKERS` for Pinterest.** Everything that a platform can schedule is scheduled and matches the ledger. Eight Instagram Reels need a same-day native publish. The three approved Pins need a tool change that the session's safety controls refused.

## Reconciliation, read live on Nov 6

| Platform | Live state | Ledger |
|---|---|---|
| YouTube | 9 scheduled, 3 earlier Shorts public, no duplicates | Matches |
| Facebook and Instagram scheduler | 22 posts (16 Facebook, 6 carousels), 7 Facebook Reels, 9 Stories | Matches |
| Instagram profile | 2 Reels before Nov 7; Episode 02 never posted | Matches |
| Medium | 3 scheduled at 2:10 PM UTC, 11 published, 1 extra draft | Matches; draft below |
| Pinterest | 17 Pins: 13 legacy, 4 campaign. Hold on, worker off | Matches |

## Verified since

| Date | Item | Evidence |
|---|---|---|
| Nov 6 | YouTube `BzCVR5fQ9_k` | Public at 19:30:27; plays at 1080x1920; AI label shown; oEmbed 200 |
| Nov 7 | Facebook post `1135151242304399` | Published list, 7:30 pm, caption complete |
| Nov 7 | Instagram carousel `DfcdC95iX24` | Published list, 8:30 pm; profile shows it once |
| Nov 8 | Medium `f62f2b71f744` | Public at 19:41; disclosure in the opening lines; not Member-only |
| Nov 8 | Instagram Story | Active list, 8:30 pm |

Nov 9 and Nov 28 videos still return 403 publicly, as they should before their dates.

## YouTube

- **Every scheduled video re-read in Studio:** Scheduled, AI use Yes, not made for kids, campaign link present.
- **Copyright check:** Studio does show its state. A fresh upload showed "Checking…" in Notices, then a blank. A blank on the others therefore means no check is running and no notice exists.
- **Nov 28, replaced.** Measuring the finished cut found two problems:
  - Section 10 ("And the next one") began at full level straight out of digital silence. That's a likely click or clipped word.
  - The pauses measured about −100 dB, so the room tone was effectively absent.
- **The rebuild:** same narration take, cuts moved to the quietest point nearby, short fades, room tone at about −58 dB. Each section re-transcribes cleanly on its own.
- **Uploads:** `R-J2QM0oJcw` is scheduled for Nov 28 at 7:30 pm with a thumbnail that has no caption. `PSewPrBQB18` is private, was never public, and wasn't deleted.
- **Listening:** the owner approved the narration source. Nobody has listened to the finished cut, and no audio-capable reviewer was available. Recorded as `OWNER_GENERAL_EDITORIAL_APPROVAL` for release, not as a listening check.

## Instagram Reels

All eight have ledger rows, files, hashes and captions in `.artifacts/marketing-2026-11/ig-reels/`. Captions reuse the approved Facebook wording without links, keep the source credits (AN 6.63, SN 36.21) and the stop guidance, and add no disclaimers.

| Date, 8:00 pm | Reel |
|---|---|
| Nov 9 | Episode 02, Being Kind Doesn't Mean Saying Yes (first Instagram run) |
| Nov 12 | Same Yes, Different Inside |
| Nov 15 | Before You Say Of Course, moved from Nov 9 on Instagram only, so it doesn't repeat Episode 02's point the same night. It sits beside the Nov 15 essay on always saying yes |
| Nov 16 | The Three Jewels, Without the Jargon |
| Nov 19 | Karma Is Not a Scoreboard |
| Nov 23 | Five Minutes, No Pressure |
| Nov 26 | Gratitude Without Forcing It |
| Nov 30 | One Mindful Step Into December |

**Why they aren't scheduled.** Rechecked Nov 6: Instagram's editor has Add AI label and no scheduler, and Business Suite's Reel flow has a scheduler and no label. Meta's publishing API gained `is_ai_generated` in June 2026. Using it needs an Echo Buddha Meta app and a token, and none of the 14 apps in the developer account belongs to Echo Buddha. Creating one and its token is an owner step.

## Pinterest

The owner approved three Pins. The narrow exception that would let the tool publish them was refused by the session's safety classifier as weakening a security control. It wasn't applied or worked around.

A tested patch is ready for the owner in `.artifacts/pinterest-november-2026/nov-09-23/`, with instructions: 20 of 20 tool tests pass. It names only these three Pins, each not before its date, expiring Nov 30, in order. It keeps the hold, the native per-Pin approval and the disabled worker. None of the 17 live Pins shares a destination with them.

Two calendar concepts were not produced:
- **Nov 10 planner card:** it points to the same article as Before You Say Of Course, and the tool blocks a second Pin to one destination, so it's folded into that Pin.
- **Two-minute Pin:** its destination has no two-minute practice, and its content would duplicate the five-minute Pin.

## Facebook

All seven Reels are scheduled with the AI label set at save. Whether the label survives can't be read until the Nov 9 Reel goes live.

## Medium

- **Scheduled essays:** the three are correct, each with the AI disclosure in the opening lines and SuttaCentral references at the end.
- **Six older essays:** no provenance found, so they are unchanged.
- **"Taking Refuge in the Triple Gem" (`5df9097733de`):** kept as a draft. It's an imported copy of the site's handbook chapter, its reference list came through empty, and nothing records its provenance. Publishing it would duplicate the chapter and might need a disclosure no one can state.

## Search and measurement (read only)

- **Search Console:**
  - Last 3 months: 163 clicks, 12.4K impressions, 1.3% CTR, position 10.5.
  - Indexing: 135 indexed, 232 not indexed. Of those, 115 are noindex by design, 91 crawled but not indexed, and 14 discovered but not yet crawled.
- **Dhamma vs Dharma** (28 days): 1.29K impressions and 6 clicks at about position 5–7. Zero clicks on the exact-match queries, for example "dhamma vs dharma" with 95 impressions at position 5.0. The title already matches those queries, so the likely cause is the snippet and answer boxes, not the title. A description that answers directly is the change worth testing.
- **Held changes:** that description test and the Handbook links from Right Speech and Five Precepts. The Oct 24–Nov 20 observation window resets on a material deploy (`docs/measurement-interventions.md`), so they wait for one governed release after it.
- **GA4 (Oct 9 to Nov 5):** 72 active users, 65 new. The homepage had 224 views from 17 users, and Colombo is the top city. That's consistent with owner and QA visits but doesn't prove it, so no filter was added.
- **Bing (3 months):** 75 clicks, 5.1K impressions, 1.47% CTR. AI citations were not read and are not counted as visits.
- **AdSense:** "Getting your site ready to show ads", with all steps complete. No action taken.

## Outreach

Nothing was sent. The Wildmind and Tricycle drafts say to send only after the owner reviews each one, from a real Echo Buddha address. This session's rules also require the owner to confirm message text taken from a file before it goes out.

## Operational readiness

| Mechanism | Covers | Limit |
|---|---|---|
| Platform schedulers | All 43 scheduled items | Unattended |
| Session cron jobs | Instagram Reels and checks on Nov 9, 12, 15, 16, 19, 23, 26 and 30 | Run only while the session that made them is open and idle |
| Cloud routine `trig_01LJyPwtwy7n2WA9KpudBBTz` | Public YouTube check daily at 9:55 pm, Nov 6–30 | No sign-in. Can't see Meta, Medium drafts or Studio. Disable after Nov 30 |
| `DATED_JOBS.md` | Steps for any session or person on each date | Manual |

The safety classifier refused a local runner that would start signed-in Claude sessions on its own, and it wasn't built.
