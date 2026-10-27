# Analytics reconciliation

The original authenticated October 27 GA4 acquisition capture was reopened from
its saved source evidence. It identifies EchoBuddha account 399080910/property
542992383 and the September 29–October 26 report. The source itself contains both
values below; this is not merely an arithmetic mistake introduced by the audit's
narrative.

| Source field | Sessions |
| --- | ---: |
| Report total | 247 |
| Direct | 119 |
| Organic Search | 98 |
| AI Assistant | 13 |
| Organic Social | 11 |
| Unassigned | 6 |
| Referral | 1 |
| Arithmetic sum of displayed rows | 248 |
| Unresolved difference | 1 |

Preserve the reported total and label the row sum separately. The capture does
not establish the cause of this one-session variance. A matched raw/API export,
metric-processing metadata and the actual report configuration would be needed
to assign a cause. Do not silently change 247 to 248, remove a channel, infer
invalid traffic, or invent a conversion. This evidence gap does not block static
publishing.

Organic Search's 67 engaged sessions and displayed engagement metrics remain
historical observations. The 13 AI Assistant sessions are too small for a strong
channel conclusion. Google AI impressions, Bing citations, actual AI referrals,
ordinary organic clicks and consented reader engagement are separate measures.
Audit/owner visits may contribute to small samples; the source does not isolate
them reliably enough to quantify or remove them.

Existing Analytics requires explicit consent and minimizes query/referrer data.
The browser suite verifies no optional Google request before opt-in and safe
withdrawal. No new reader tracking, artificial event, key event or ad runtime is
added. Use real engaged reading and relevant next-step visits descriptively;
never label a generic click or audit visit as a verified learning outcome.

The existing weekly read-only search workflow remains operational and adds
bounded exact-URL Bing crawl diagnostics. New material release scope is recorded
in the append-only intervention ledger. The earlier observation window becomes
intervened on actual deployment; the next stable window is derived from its real
Pacific deployment day, with finalization checked before interpretation.
