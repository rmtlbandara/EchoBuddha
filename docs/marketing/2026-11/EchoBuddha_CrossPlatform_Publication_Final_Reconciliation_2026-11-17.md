# Echo Buddha cross-platform reconciliation, Nov 12–17, 2026

Read live on Nov 17, 19:25–19:35 Asia/Colombo.

## A. Verdict

`PARTIAL_RECOVERY_WITH_EXTERNAL_BLOCKERS`. Everything due through Nov 17 is public except one item (Pin 3) and one item that can't be confirmed (the Nov 15 Story):

- **Pin 3:** waiting on Pinterest's pacing rule and on the owner's click in the native approval dialog.
- **Nov 15 Story:** left Meta's schedule, but there's no archive to confirm it ran.
- **Tonight's Story (8:30 pm):** still scheduled.

## B. Summary

**Already public before this run, on their scheduled times:**

| Date | Item |
|---|---|
| Nov 12 | YouTube and Facebook Reel; Instagram Reel recovered Nov 15 |
| Nov 13 | Facebook post |
| Nov 14 | Facebook post and Instagram carousel |
| Nov 15 | Pinterest Pin 1; Medium essay at 7:41 pm |
| Nov 16 | YouTube and Facebook Reel |

**Newly published in this run:**

- Pinterest Pin 2, after the owner approved it in the native dialog.
- The Nov 15 and Nov 16 Instagram Reels, published late on Nov 17. Their 8:02 pm jobs ran only inside a Claude session that wasn't open.

**Still scheduled:** the Nov 17 8:30 pm Story and all later items.

## C. Status by platform

| Platform | Due | Already public | Newly published | Still scheduled | Blocked | Verdict |
|---|---:|---:|---:|---:|---:|---|
| Facebook | 5 | 5 | 0 | 0 | 0 | Complete |
| Instagram | 7 | 3 | 2 | 1 | 0 | Two published late; Nov 15 Story unverified |
| YouTube | 2 | 2 | 0 | 0 | 0 | Complete |
| Pinterest | 3 | 1 | 1 | 0 | 1 (pacing and native approval) | Pin 3 pending |
| Medium | 1 | 1 | 0 | 0 | 0 | Complete |

## D. Items

| Date | Platform | Item | Status | Actual time (Colombo) | Evidence |
|---|---|---|---|---|---|
| Nov 12 | YouTube | Same Yes, Different Inside | Published, verified | Nov 12, 19:30:16 | https://www.youtube.com/shorts/Nm9CkdjkaA0 |
| Nov 12 | Facebook | Same Yes Reel | Published, verified | Nov 12, 19:30 | https://www.facebook.com/reel/978335534856324/ ("AI content" shown) |
| Nov 12 | Instagram | Same Yes Reel | Published late, verified | Nov 15, ~12:02 | https://www.instagram.com/reel/DfwJKoRAmfN/ |
| Nov 13 | Facebook | A Gentler Way to Respond | Published, verified | Nov 13, 19:30 | Link card points to the loving-kindness page with campaign tags |
| Nov 14 | Facebook | You Are Allowed to Stop | Published, verified | Nov 14, 19:30 | Business Suite published list |
| Nov 14 | Instagram | Stop, Adapt, Ground carousel | Published, verified | Nov 14, 20:30 | https://www.instagram.com/p/DfuelogmfGL/ |
| Nov 15 | Medium | The Fear Behind Always Saying Yes | Published, verified | Nov 15, 19:41 | https://medium.com/@EchoBuddha/the-fear-behind-always-saying-yes-4af271ff6afe |
| Nov 15 | Instagram | Before You Say Of Course Reel | Published late, verified | Nov 17, ~19:28 | https://www.instagram.com/reel/Df2F353AFmh/ |
| Nov 15 | Instagram | Story: the test from the essay | Published, unverified | Nov 15, 20:30 (scheduled) | Left the schedule; Instagram's archive is off |
| Nov 15 | Pinterest | Pin 1: Before You Say Of Course | Published, verified | Nov 15, 13:23:08 | https://www.pinterest.com/pin/995717798892136932/ |
| Nov 16 | YouTube | The Three Jewels, Without the Jargon | Published, verified | Nov 16, 19:30:37 | https://www.youtube.com/shorts/UEEpSAQ-f7I |
| Nov 16 | Facebook | Three Jewels Reel | Published, verified | Nov 16 | https://www.facebook.com/reel/1146474747914179/ ("AI content" shown) |
| Nov 16 | Instagram | Three Jewels Reel | Published late, verified | Nov 17, ~19:31 | https://www.instagram.com/reel/Df2GLkcgzJQ/ |
| Nov 17 | Pinterest | Pin 2: You Are Allowed to Stop | Published, verified | Nov 17, 19:25:37 | https://www.pinterest.com/pin/995717798892201022/ |
| Nov 17 | Instagram | Story: handbook reading path | Scheduled, verified | due 20:30 | Business Suite scheduled list |
| Pending | Pinterest | Pin 3: Five Minutes, No Cushion | Ready | earliest Nov 18, 01:26 | Prepared; native approval needed |

## E. Pinterest

- **Pins 1 and 2:** each published once and verified through both the API readback and the signed-out public page. Both were approved by the owner in the native dialog.
- **Pin 3:** its draft is prepared. It can't publish before Nov 18, 01:26, which is 6 hours after Pin 2. A session job is set for Nov 18, 08:47 to start it, and the owner has to approve it in the native dialog.
- **Controls:** the hold is on and the worker is off throughout.

## F. Instagram

All three late Reels were published through Instagram's own editor. Before each one, the account was confirmed as echobuddha, and the profile was checked for an existing copy. In the editor: Original crop, caption read back in full, AI label switch on, one Share. Every public Reel shows "AI content".

## G. YouTube and Facebook

Both Three Jewels videos are public. The Facebook AI label has now been confirmed on the Nov 9, 12 and 16 Reels.

## H. Medium

The Nov 15 essay is public, with its AI disclosure and no paywall. No duplicate was created. The Triple Gem draft is still unpublished.

## I. GitHub

| PR | Purpose | CI | Final state |
|---|---|---|---|
| #116 | Ledger rows and this report | See PR | Merge after checks pass |
| #9 | TypeScript 5.9 to 7.0 (major) | Passing | Left open: a major compiler change unrelated to publishing |
| #14 | actions/checkout 6 to 7 | **Failing** | Left open: CI fails |
| #55, #56 | GitHub Actions minor and major bumps | Passing | Left open: CI tooling, unrelated to this task |
| #79 | Grouped dev dependency updates | Passing, mergeable | Left open: unrelated maintenance; needs its own review |
| #95 | Astro 7.4.2 to 7.4.7 | Passing | Left open: a site build dependency; merging it would warrant a governed release and deploy |

No deployment is needed; this is documentation only.

## J. Quality

All posts went out on the correct accounts (Facebook Echo Buddha; Instagram echobuddha, never nimblegridgames), with the approved files and matching hashes, the AI labels in place, captions read back in full, and no duplicates.

## K. Open items

1. **Pin 3:** the owner approves the native dialog at or after Nov 18, 01:26. A session job will open it at 08:47, if this session is still open.
2. **Nov 15 Story:** no further action available. Turning on Instagram's Story archive would make future Stories provable.
3. **Instagram Reels on Nov 19, 23, 26 and 30:** each still needs this Claude session to be open on the day, or someone to publish it. No scheduler keeps the AI label.
