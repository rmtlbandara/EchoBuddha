# Campaign brief: Small Moments. Deeper Wisdom. A More Mindful Life.

Window: Nov 5–30, 2026. Calendar source: `EchoBuddha_November_2026_Editorial_Calendar.csv` as supplied by the owner. The calendar lists creative intentions. It is not evidence that anything has been published; see `PUBLICATION_LEDGER.csv` for that.

## Editorial rules for every item

Each item needs one reader question, a checked source and a specific example, with a safety line where the topic calls for it. Written production disclaimers no longer go in ordinary social copy; see the disclosure rule in `PUBLISHING_RUNBOOK.md`. Echo Buddha's own writing is never attributed to the Buddha. Scenarios are never presented as real events. No invented reviewers, testimonials or outcomes. Meditation content keeps stop, adapt, ground and seek-support language and links to `/meditation-safety/`.

## Changes to the calendar after reconciliation

The theme of each week stays the same. These items would otherwise have repeated live work.

| Date | Calendar item | Conflict | Change |
|---|---|---|---|
| Nov 6 | Short: follow-up to Episode 03 | Episode 03 is live on three platforms | New story beginning where Episode 03 ends: "What Your Angriest Draft Was Trying to Say" |
| Nov 8 | Medium: what to do before pressing Send | "Before You Hit Send" and "Before You Send That Message" already exist | Essay starts after not sending: "The Draft You Didn't Send Still Has Something to Tell You" |
| Nov 9 | Short and Facebook Reel: being kind does not mean saying yes | Episode 02 has this title on YouTube and Facebook | YouTube and Facebook need a distinct boundary example. Instagram can take Episode 02 itself, since it has never run there |
| Nov 15 | Medium: why compassion is not compliance | "Compassion Needs Boundaries" already exists | Thesis must add something new; to be written around compliance as fear rather than boundaries as such |
| Nov 23–24 | Meditation Pins | Nov 2 seven-day Pin and an older first-week Pin exist | Keep the 5-minute and 2-minute visuals clearly different in title, format and destination |

## Destination choices, Nov 5–8

| Item | Destination | Why |
|---|---|---|
| One-breath post, Story and Pin | `/articles/mindful-email-and-texting/` | Indexed, self-canonical, covers digital replies; no existing Pin or Reel links to it |
| Nov 6 Short and Reels | `/articles/buddhist-approach-to-anger/` | Same owner as Episode 03, which is what the follow-up extends |
| Nov 7 carousel and Facebook post | `/articles/right-speech-buddhism/` | Owner page for silence versus avoidance |
| Nov 7 Pin | `/articles/right-speech-examples/` | Practical page; a Pin to the owner page already exists |

## Source ledger, Nov 5–8

Checked against the Bhikkhu Sujato translations on SuttaCentral on 2026-11-05. All use is paraphrase, apart from the five-factor phrase quoted and attributed in the Nov 8 essay.

| Reference | What is claimed | Check |
|---|---|---|
| SN 45.8 | Right speech is refraining from false, backbiting or divisive, harsh and nonsensical or idle speech | Confirmed at segment 5.2. Sujato renders these as "false, backbiting, harsh, or nonsensical"; the wording used follows the site's existing page and the carousel notes the variation |
| MN 58 | The Buddha knows the right time to say what is true, correct and beneficial, including when others dislike it | Confirmed at segment 8.3 |
| AN 5.198 | Well-spoken speech has five factors: "timely, true, gentle, beneficial, and loving" | Confirmed at segment 1.3 |

Modern and original, labelled as such: the one-breath practice, the know-versus-added sorting, the wise and unwise silence lists, and all scenarios.

## Candidate site improvements (not started)

Nothing here has been changed. Each needs a narrow branch and the governed release flow, and any material change resets the measurement window under `docs/measurement-interventions.md`, so they should be grouped rather than deployed one at a time.

1. `/articles/right-speech-buddhism/`: 709 impressions, 2 clicks. Check query and position first, then sharpen the answer for "Right Speech examples and meaning" intent and link to the digital page.
2. `/articles/dhamma-vs-dharma/`: 1,286 impressions, 6 clicks. Check whether the answer is stated plainly enough, early enough.
3. `/articles/mindful-email-and-texting/`: small but healthy click-through. Add a printable or embedded one-breath decision aid.
4. `/articles/compassion-with-boundaries/`: supports the Nov 9–15 week; check its link back to Right Speech.
5. `/learn/buddhist-handbook/`: add a clearer study path while keeping all 12 chapter routes.

## Proposed citeable reference asset

**A Right Speech decision guide with accessible HTML**, placed on an existing page rather than a new URL: when to speak, pause or choose a different time or channel, with the source layer for SN 45.8, MN 58 and AN 5.198 stated separately from the modern application. It would offer a plain citation line, with no badge or embed that forces a link. This is the most natural fit: the page already has demand and the source work has been checked.

Outreach waits until this exists, since there is nothing distinctive to point to before then.

## UTM convention

`utm_source` = pinterest, youtube, instagram, facebook or medium. `utm_medium` = organic_social, organic_video or referral. `utm_campaign` = eb_nov_2026. `utm_content` = a stable per-item slug starting with the date. Tagged URLs were tested on Nov 5: they return 200 and the canonical stays clean.

## Production limits to plan around

- **Video and voice:** the owner made an ElevenLabs Starter account available on Nov 5. The Nov 6 Short uses the default voice "Sarah" with Eleven v4; ffmpeg isn't installed, so it was assembled with the macOS encoder. Earlier episodes used a Kokoro voice, so pick one voice for the rest of the series. A person needs to listen before release, because Claude can't hear the audio.
- **Reels and AI labels:** the Nov 1 record found that Meta's Reel scheduler has no AI label control, and Instagram's native editor has the label but no scheduling. Any Reel with synthetic narration, including the Nov 6 Short, has to be published on the day from the native editor.
- **Scheduling:** nothing is scheduled. A one-off session cannot post on later days without a native scheduler or a separately authorized job.
