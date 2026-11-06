# November 2026 publishing runbook

How items actually get published. Status values are in `METRICS_DICTIONARY.md`; the record of what happened is `PUBLICATION_LEDGER.csv`, which is append-only: the latest row for a retry key is its current state.

## Disclosure rule (owner, Nov 5)

No repetitive production disclaimers in ordinary social copy. That covers fictional-scene notes, "not a quotation", AI-assistance lines and blanket safety lines.

- **AI use:** the platform's own label. Keep it on for synthetic-narration Reels and YouTube's AI use field. Don't add optional labels to simple graphics.
- **Keep in the text when it's true and useful:** source attribution and translator credit, a note that an application is modern when the post could be read as a teaching, and a safety line when the topic involves abuse, coercion, threats, self-harm, vulnerability or a meditation practice.
- **Medium:** the disclosure stays in the first two paragraphs.
- **Don't** delete and re-upload to remove on-image text. Provenance belongs in internal records.

## Coverage by platform

Checked in the live tools on Nov 5, 2026.

| Item | Route | Runs unattended? | Notes |
|---|---|---|---|
| Facebook image or text post | Meta Business Suite scheduler | Yes | Composer defaults to Facebook and Instagram; remove one |
| Instagram image or carousel | Meta Business Suite scheduler | Yes | Alt text per slide in Edit photos |
| Instagram Story (image) | Meta Business Suite scheduler | Yes | Add link was disabled in Suite on Nov 5 |
| YouTube Short or video | YouTube Studio scheduler | Yes | AI use field is set during upload |
| Medium essay | Medium Schedule for later | Yes | Publishes within 5 minutes of the time |
| Facebook Reel with synthetic narration | Facebook's own editor at facebook.com/reels/create | Yes, label unconfirmed | Seven scheduled on Nov 6 with Add AI label on at save. A scheduled Reel's page can't be read until it goes live, so check the label after the Nov 9 Reel publishes; if it's missing, fix it with Edit reel, then check the other six. Business Suite's Reel flow has no label control |
| Instagram Reel with synthetic narration | Instagram's native editor on the day | **No** | Has Add AI label but no scheduling. Set the crop to Original; it defaults to square |
| Pinterest Pin | Echo Buddha Pinterest tool | **No** | Remediation hold stays on. The narrow exception's two Pins are both published. Later Pins need a new exception and the owner's native approval. Three are ready in `PINTEREST_QUEUE_2026-11-06.md` |

A one-off Claude session can't act on later days. Anything marked "No" needs someone, or a new session, on that date.

## Publishing an item

1. Read the ledger, then the platform's live, scheduled and draft lists. Match by account, ID, caption and asset. Don't retry an uncertain post until the live inventory has been checked.
2. Confirm the account and destination. Clear unwanted cross-posting and leave Boost off.
3. After typing a caption, move focus away and read the text back. Meta's composer has dropped the end of captions on three occasions, including part of a safety line and the AI disclosure.
4. Publish or schedule on the platform.
5. Verify. **Scheduled:** the item appears in the platform's own scheduled list with the right time. **Published:** reopen the public URL and confirm the destination link works.
6. Append a ledger row with the ID, time and evidence.

## Time

Use Asia/Colombo (GMT+5:30). Meta and YouTube were both using it on Nov 5. Medium shows the scheduled time in UTC in its Stories list.

## Permission boundaries

| Blocked action | Exact result | Boundary | Status |
|---|---|---|---|
| Facebook Publish, first session | Denied as an unrequested commit in a connected app | Claude Code session classifier. Not Meta: the account, role and login were fine | Resolved Nov 5. The same click succeeded once the owner's brief named this post |
| PR #86 merge | Denied as a merge without review | Claude Code session classifier | Owner merged it. No rule added |
| Pinterest Pin | `remediation_hold: true`; exception hard-coded to two expired drafts | Echo Buddha tool's own control, plus owner-only native approval | Open. Needs an owner decision |
| Meta Reel with AI label | No control in the Suite flow | Platform capability | Open. Publish natively on the day |
| Instagram Story link | Add link disabled in Suite | Platform capability in Suite | Open. On-image search prompt used instead |
| Bing Webmaster | Signed-out page | Authentication | Open. Owner sign-in needed |

No persistent permission rule was added. Publishing succeeded when the request was explicit, so a broad rule isn't needed yet.

## Voice

Echo Buddha uses the ElevenLabs default voice "Sarah" with Eleven v4 from Episode 04 on, without further switching. Episodes 01–03 keep their Kokoro voice. Reasons: the owner made the account available for this, and the rendered episode can be checked but the Kokoro voice's warmth was never certified either. A person should compare them by ear once and overrule this if Kokoro sounds better.

Rights: ElevenLabs states that paid plans include commercial use, including YouTube, and that all paid plans carry a commercial license except for Beta Services. Eleven v4 has been generally available since Sep 28, 2026, and no beta label was found, but the Beta Services terms were not read directly. ElevenLabs also says v4 is under continuous development, so its behaviour may shift over time.

## Verifying Nov 6–8 without republishing

Do not edit or re-post any of these unless the check fails. Append what you find to the ledger.

| When (Colombo) | Item | Check |
|---|---|---|
| Nov 6, after 7:30 pm | YouTube `BzCVR5fQ9_k` | Studio shows Public; signed-out page plays; AI label and description present; no notices |
| Nov 7, after 7:30 pm | Facebook group chat post, ID 1135151242304399 | Published list; permalink; caption ends on the guide link with no disclaimer; link returns 200 |
| Nov 7, after 8:30 pm | Instagram carousel, ID 3689659477869851 | Six slides in order; alt text; profile shows it once |
| Done Nov 5 | Speak, Pause or Choose Pin | Published ahead of its calendar date with the owner's native approval, ID 995717798891840153 |
| Nov 8, after 7:45 pm | Medium `f62f2b71f744` | Public URL; disclosure in the opening lines; no paywall; links work. Medium can return 504s, so retry reads before concluding anything |
| Nov 8, after 8:30 pm | Instagram Story | Visible on the account; the essay it mentions is live first |

## November Shorts: status

The owner listened to all seven and recorded approval on Nov 6 (`OWNER_AUDIO_QA_APPROVED`). They are scheduled in YouTube Studio; see the ledger. A new Short still needs a person to listen before scheduling. Whisper and loudness checks aren't a listening review.

The Nov 28 practice video (`PSewPrBQB18`) uses a narration file the owner listened to on Nov 6 and reported no problem with. The silences between sections were added after that, so the finished cut itself hasn't been listened to; the ledger row says so.

If a scheduled item didn't go out, check the platform's scheduled and published lists before doing anything else.

## Editing live captions

- **Facebook Reels:** More, then Edit reel. The save takes about 25 seconds. Leaving the page earlier loses it, and the page gives little warning, so wait for the dialog to close and read the caption back.
- **Meta scheduled posts:** Post details, then the top menu, then Edit post. The composer ignores a selection made only by script. Use `cmd+Down`, extend to the paragraph boundary, then `Delete`. The button is labelled Schedule, and it keeps the existing time.
- **YouTube Studio:** expanding Show more marks the page as changed with nothing edited. Read the AI use field there and leave, and don't press Save unless you meant to change something.

## Interrupted browser sessions

Clicks queued when the browser extension disconnects can land on whatever page opens next. After any disconnect, take a screenshot and check the live list before continuing.
