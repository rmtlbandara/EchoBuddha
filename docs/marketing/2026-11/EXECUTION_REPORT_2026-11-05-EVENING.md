# Execution report: Nov 5 evening cycle

Times are Asia/Colombo unless marked. Item-level evidence is in `CAPTION_CLEANUP_AUDIT_2026-11-05.csv` and `PUBLICATION_LEDGER.csv`.

## A. Cross-platform cleanup

| Platform | Inspected | Changed | Already compliant |
|---|---|---|---|
| Facebook | 5 published, 3 scheduled | 8 | 0 |
| Instagram | 2 Reels, 2 carousels, 2 Stories | 4 | 2 Stories, which have no captions |
| YouTube | 3 published, 1 scheduled, 1 channel comment | 4 descriptions | 1 comment |
| Pinterest | 17 Pins, by API | 0 | 17 |
| Medium | 11 published, 2 scheduled | 0 | 2 scheduled keep their required disclosure; see D for the 11 |

**Removed:** fictional-scene notes, "not a quotation" lines, AI-assistance lines, synthetic-narration notes and blanket safety lines.

**Kept:** translator credit and source references, modern-application notes where a post could be read as a teaching, safety lines on anger, boundaries and meditation posts, and "not a substitute for mental health care" on Episode 01.

**Not editable:** on-image text in the Nov 6 end card and the Nov 7 and Nov 11 carousel slides. Changing it would mean re-uploading, which the brief rules out.

**Not checked:** Facebook posts older than the list's 90-day window.

A first save on Facebook Episode 03 was lost when I navigated away during it. A read-back caught it; I redid the edit and verified it.

## B. AI labeling decisions

- **Kept on:** Facebook and Instagram native labels on every synthetic-narration Reel, and YouTube's AI use field (Yes) on all five Shorts.
- **Not added:** optional labels on simple graphics and text posts.
- **Limit:** signed-out YouTube HTML did not show the altered-content text, so its public display wasn't confirmed.

## C. Pinterest

Speak, Pause or Choose published with the owner's native approval as Pin 995717798891840153. API read-back matched and the signed-out page returned 200. Hold remains on and the worker off. Later Pins need a new exception, and no Pin was created for Nov 14 onward.

## D. Medium

- `4af271ff6afe` is scheduled for Nov 15, 7:40 pm: same story, no copy. Medium's list shows 2:10 PM UTC. Disclosure is in the opening lines and no paywall option appeared.
- `f62f2b71f744` is still scheduled for Nov 8, 7:40 pm.
- **Owner decision:** none of the 11 stories published Sep 27 to Oct 21 mentions AI anywhere in the page text. How they were written isn't established here, and nothing was changed. If AI was used substantially, Medium's disclosure rule would apply. No Member-only badge on the ten checked; `f015cce4f0fb` wasn't checked for it.

## E. YouTube

- `BzCVR5fQ9_k` stays scheduled for Nov 6, 7:30 pm, not rescheduled. Pronunciation: `OWNER_PRONUNCIATION_APPROVED`. Claude did not listen to it.
- `FO4xTrvAaeA` (Nov 9) is **private on owner instruction**; see the release conditions in the runbook.

| Check on `FO4xTrvAaeA` | Result |
|---|---|
| Transcript against script (Whisper) | 99% match; "checked" heard as "check" |
| Loudness and peak | -17.0 LUFS, -1.5 dBFS |
| Format | 1080x1920, 38.0 s, H.264 and AAC |
| Mobile-size frames | Burned-in subtitles and branding legible; no disclaimer on the end card |
| Studio notices at last read | None shown; the upload's check was still running at last look, so read it again |
| AI use | Yes |
| **Listening: pronunciation, naturalness, pacing, artifacts** | **Not done. Needs a person** |

## F. November content

| Date | Item | State |
|---|---|---|
| Nov 6 | YouTube Short | Scheduled |
| Nov 7 | Facebook post, Instagram carousel | Scheduled |
| Nov 8 | Medium essay, Instagram Story | Scheduled |
| Nov 9 | YouTube Short, Facebook Reel | Held for listening review |
| Nov 9 | Instagram Episode 02 | Ready; native on the day |
| Nov 10, 11, 13 | Facebook, Instagram carousel, Facebook | Scheduled |
| Nov 12 | Short and Reels | Concept only |
| Nov 14 | Facebook post, Instagram carousel | Scheduled |
| Nov 15 | Medium essay, Instagram Story | Scheduled |
| Nov 16 | Short and Reels | Not started |
| Nov 17 | Instagram Story | Scheduled |
| Nov 18 | Facebook post, Instagram carousel | Scheduled |
| Nov 19 | Short and Reels | Not started |
| Nov 20 | Facebook post, Instagram Story | Scheduled |
| Nov 21 | Instagram carousel | Scheduled |
| Nov 22 to 30 | Essay, posts, Shorts, narrated practice video | Not started |

Alt text was not set on the Nov 14, 18 and 21 carousels. Platform IDs for items scheduled this cycle weren't captured; match them by date and caption. The carousels use a plain typographic layout, so the owner may want a look at them against the creative standard.

Sources checked on SuttaCentral: AN 8.25 at segments 1.3 to 2.3, SN 56.11 at segments 2.1 to 2.4. Applying the middle way to a difficult meditation session is a modern reading.

## G. Website and growth

No site change was made and nothing was deployed.

- **Search Console, last 28 days:** 74 clicks, 4.32K impressions, 1.7% CTR, position 8.3.
- **`/articles/dhamma-vs-dharma/`:** 1.29K impressions, 6 clicks, 0.5% CTR, position 6.6. "Dhamma vs dharma" had 95 impressions and "dhamma or dharma" 80, with no clicks on either. This is the clearest case for testing the title and snippet.
- **`/articles/right-speech-buddhism/`:** 714 impressions, 1 click, position 6.8. Visible queries account for only about 26 impressions, so the data doesn't yet support a specific retitle.
- **`/daily-reflections/`:** 33 clicks from 258 impressions, the strongest click-through among the pages read.
- **GA4, Oct 8 to Nov 4:** 1,010 views from 71 active users, 14.2 views per user, with a sharp spike near Nov 3 to 4. The homepage shows 220 views from 17 users, and `/daily-reflections/today/` 184 from 26. That pattern fits owner or QA visits, though this report doesn't prove it. Don't treat views as audience growth until internal traffic is filtered. Adding that filter is an owner decision.
- **Bing:** not re-read this cycle.
- **Handbook discovery:** the homepage and `/learn/` link to it; the Right Speech page has no Handbook link. Candidate links are Right Speech and Five Precepts to the lay chapters. Group them with other changes, because a deploy resets the measurement window.
- **Outreach:** Wildmind and Tricycle drafts reviewed. They disclose AI assistance and are single, specific notes. Nothing was sent.

## H. Repository

Records only, on one scoped branch. No redeploy needed.

## I. Remaining restrictions

- Owner: listen to the Nov 9 Short and approve or reject it.
- Owner: decide on Medium disclosures for the 11 older stories.
- Owner approval needed for each Pin, plus a new exception.
- Reels with AI labels and Instagram Episode 02 need native publishing on the day, or a test of Facebook's scheduler.
- AdSense, ads and paid backlinks: untouched.
