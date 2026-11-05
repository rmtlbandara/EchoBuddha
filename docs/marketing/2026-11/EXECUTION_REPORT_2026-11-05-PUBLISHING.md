# Execution report, November 5, 2026: publishing cycle

Follows `EXECUTION_REPORT_2026-11-05.md`, which recorded the earlier audit session. **Result: PARTIAL. The first campaign items are public and the rest of Nov 5–8 is scheduled, except Pinterest and the Nov 6 Reels.**

## Public

| Platform | Item | Time | Link | Verification |
|---|---|---|---|---|
| Facebook | One Breath Before You Reply | 1:06 pm Colombo | https://www.facebook.com/photo/?fbid=122138523669253292&set=a.122095527099253292 | Signed-out request returned 200 with the caption; full caption and link read in the browser |
| Instagram | One Breath Story | 1:09 pm Colombo | https://www.instagram.com/stories/echobuddha/ (expires after 24 hours) | Seen in the signed-in viewer and Meta's Stories list. Not checked signed out |

## Scheduled on the platform

| Platform | Item | Time (GMT+5:30) | ID |
|---|---|---|---|
| YouTube | What Your Angriest Draft Was Trying to Say | Nov 6, 7:30 pm | BzCVR5fQ9_k |
| Facebook | Group chat scenario | Nov 7, 7:30 pm | 1135151242304399 |
| Instagram | Right Speech is not staying silent, 6 slides | Nov 7, 8:30 pm | 3689659477869851 |
| Medium | The Draft You Didn't Send Still Has Something to Tell You | Nov 8, 7:40 pm | f62f2b71f744 |
| Instagram | Angriest draft Story | Nov 8, 8:30 pm | Not shown |

## Not published

- **Pinterest:** Nov 5 and Nov 7 Pins remain blocked. See `PUBLISHING_RUNBOOK.md`.
- **Nov 6 Instagram and Facebook Reels:** can't be scheduled with an AI label. They must be published on Nov 6.

## Nov 6 Short QA

The first render, made of text cards, was replaced because the brief rules out slideshows. It now uses Episode 03's owned desk and phone scene.

| Check | Result |
|---|---|
| File | 1080×1920, 52.0 s, 30 fps, H.264 and AAC |
| Loudness | -16.3 LUFS, -1.5 dB peak (Episode 03: -16.16 LUFS) |
| Whisper base.en against script | 96% match. Differences: "eleven forty-two" heard as "1142", "unsent" as "unscent", "plainer" as "planar", "Right" as "Write" |
| Captions | Burned in, timed from measured speech segments. Separate subtitle file not uploaded |
| Copyright | Meta's check reported no issues; YouTube's was still running when scheduled |
| Disclosure | YouTube AI use set to Yes; end card and description state synthetic narration |

**Not done:** nobody has listened to this audio or watched it on a phone. "Plainer" is the word to check. Overlap to be aware of: Episode 03 also ends with a rewritten message. This episode's new idea is sorting what you know from what you added.

## Other work

- PR #87 proposes the Production Smoke correction. Open, not merged.
- No website content changed and nothing was deployed. The Right Speech resource isn't started, so outreach hasn't begun.
- Production remains `edfe72d`.
- ElevenLabs: no new credits used this cycle.

## Not started

Nov 9–30 production, the Nov 8 review, the 47-URL cohort, GA4 landing pages and Bing.
