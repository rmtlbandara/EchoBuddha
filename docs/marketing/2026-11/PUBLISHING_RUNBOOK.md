# November 2026 publishing runbook

How items actually get published. Status values are in `METRICS_DICTIONARY.md`; the record of what happened is `PUBLICATION_LEDGER.csv`, which is append-only: the latest row for a retry key is its current state.

## Coverage by platform

Checked in the live tools on Nov 5, 2026.

| Item | Route | Runs unattended? | Notes |
|---|---|---|---|
| Facebook image or text post | Meta Business Suite scheduler | Yes | Composer defaults to Facebook and Instagram; remove one |
| Instagram image or carousel | Meta Business Suite scheduler | Yes | Alt text per slide in Edit photos |
| Instagram Story (image) | Meta Business Suite scheduler | Yes | Add link was disabled in Suite on Nov 5 |
| YouTube Short or video | YouTube Studio scheduler | Yes | AI use field is set during upload |
| Medium essay | Medium Schedule for later | Yes | Publishes within 5 minutes of the time |
| Reel with synthetic narration | Native editor on the day | **No** | Meta's Reel flow can schedule but has no AI label control. Instagram's native editor has the label but no scheduling (Nov 1 record). Do not schedule these undisclosed |
| Pinterest Pin | Echo Buddha Pinterest tool | **No** | Remediation hold on; each Pin needs the owner's native approval |

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
