# Q8 and Q9 source-link QA

Checked 2026-11-01 with redirect-following HTTPS requests and browser-search verification where an institutional anti-automation response intervened.

| Question | Source | Result |
|---|---|---|
| Q8 | Pali Text Society Kathāvatthu product/bibliographic page | HTTP 200 |
| Q8 | SuttaCentral Kathāvatthu contents and Pāli text | HTTP 200 |
| Q8 | Chaṭṭha Saṅgāyana commentary to MN 142 | HTTP 200 |
| Q8 | Chaṭṭha Saṅgāyana commentary to MN 115 | HTTP 200 |
| Q8 | Metropolitan Museum of Art, Buddhism and Buddhist Art | Automated request HTTP 429; current page and relevant content independently resolved through web search on 2026-11-01; this is an institutional rate limit, not a broken source URL. The same canonical source remains used by Q1, Q6, and Q7. |
| Q9 | SuttaCentral AN 6.63 | HTTP 200 |
| Q9 | SuttaCentral AN 6.37 | HTTP 200 |
| Q9 | Access to Insight edition of Kariyawasam | HTTP 200 |
| Q9 | Ancient Buddhist Texts Ja 479 | HTTP 200 |

All nine selected-reference links are valid source destinations. Eight returned HTTP 200 to the audit client. One returned a rate-limit response to the audit client but was verified as a current public page through an independent browser-search retrieval. No source URL redirects to unrelated content.
