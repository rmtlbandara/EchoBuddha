# Bing and IndexNow audit

The verified apex property was inspected on November 10, 2026. Bing reported the Daily Life Mindfulness URL indexed. Its stored inspection also listed one missing image alt attribute. A separate public HTML check found two image elements, both with alt attributes. The stored report was not reproduced in the current HTML. This inspection represents one priority URL.

| Dashboard or public artifact | Observation |
|---|---|
| Submitted apex sitemap | Success with 171 URLs, last crawled November 5. |
| Discovered www sitemap | Success with 171 URLs, last crawled November 4. Live www traffic redirects to the apex. |
| Search Performance | 86 clicks and approximately 5.9K impressions for August 10–November 9. The interface rounds impressions. |
| IndexNow | Submission rows including the homepage were timestamped November 5 at 15:14 Sri Lanka time. The production receipt records 20 URLs notified with HTTP 200. Dashboard chart labels included an inconsistent January 2022 range. |
| Public manifest and key | The serving manifest returned HTTP 200 and listed 171 URLs. The public verification file matched the candidate’s protocol proof byte for byte. |

The release workflow compares the previous and new manifests and submits the changed canonical URLs after production deployment and smoke checks. The audit performed read-only checks. Candidate URLs were neither sent to IndexNow nor requested for crawl in the dashboard. An accepted notification is evidence of delivery and Bing determines crawl and index selection separately. [IndexNow protocol](https://www.indexnow.org/documentation) · [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
