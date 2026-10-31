# Official policy research

Observed October 30, 2026 (Asia/Colombo). These are policy and documentation observations, not authenticated account findings or a certification of site compliance. The interpretations below guide the recovery work; Google's AdSense decision remains separate from Search indexing and this repository's internal rubric.

## Content value and site readiness

| Official source | Applicable finding and consequence |
| --- | --- |
| [AdSense site not ready](https://support.google.com/adsense/answer/12176698) | Follow the stated readiness issue and check actual accessibility and policy compliance before requesting another review. A site-level decision does not establish the defect on each URL. |
| [Make sure pages are ready](https://support.google.com/adsense/answer/7299563) | Original material relevant to the audience, a usable layout, and understandable navigation matter. Comments are a suggestion, not an approval requirement. The recovery should improve existing reader journeys and distinct value. |
| [AdSense Program Policies](https://support.google.com/adsense/answer/48182) | Artificial impressions/clicks and encouragement to interact with ads are prohibited. Keep the advertising gates disabled; do not generate engagement to manufacture reader interest. |
| [Screens without publisher content](https://support.google.com/publisherpolicies/answer/11112688) | Low-value screens, unfinished screens, and behavioral/navigation-only screens are unsuitable ad inventory. Automated content needs review or curation. Intentionally noindexed pages still require editorial consideration; noindex does not certify content value. |
| [Replicated content](https://support.google.com/publisherpolicies/answer/11190248) | Copied, embedded, or lightly reworded material needs real additional publisher value. Commentary and curation must help the reader. Synonym replacement does not fix the problem. Citation alone is insufficient. |
| [People-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | Evaluate original insight, completeness for the actual question, accurate headings, reliable sources, and clear responsibility. Google explicitly rejects a preferred-word-count premise. Cosmetic freshness and bulk additions/removals do not establish usefulness. |
| [Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) | Scaled content abuse concerns purpose and lack of value regardless of how the pages were created. Repeating a format is a review signal, not automatic evidence of a violation. Examine the individual page's contribution. |
| [Generative AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) | AI can assist research and structure, but generated content and metadata need factual review and accuracy. Explain creation methods when useful. Neither use of AI nor model self-review establishes expert oversight. The retrieved page displays an October 1, 2026 update. |

No source above establishes an approval-guaranteeing word count, traffic number, or internal quality-score cutoff. A 0–4 audit rubric is an editorial aid, never a representation of Google's algorithm. A named human, credentials, or a monastic reviewer must not be invented to satisfy a trust checklist.

## Indexing, delivery, and evidence

| Official source | Applicable finding and consequence |
| --- | --- |
| [Canonical signals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) | Redirects and canonical link annotations are strong signals; sitemap inclusion is weaker. Use consistent canonical URLs without promising Google's selection. |
| [Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) | Sitemaps aid discovery. They do not guarantee crawling or indexing. Compare generated inventory, sitemap membership, internal links, and actual engine observations separately. |
| [Noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing) | A crawler must reach a page to see its noindex. Do not robots-block intentionally noindexed quote/reflection details merely to remove them from reports. Older indexed states may lag a changed directive. |
| [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) | Markup must describe relevant visible content honestly. Valid JSON is insufficient when claims, identities, dates, or reviews are misleading. The retrieved page displays a July 10, 2026 update. |
| [Page experience](https://developers.google.com/search/docs/appearance/page-experience) | Consider the whole experience. Lab performance and automated accessibility are useful evidence with limits, rather than content-value or approval guarantees. |
| [Ads.txt crawl troubleshooting](https://support.google.com/adsense/answer/7679060) | Verify root-domain reachability, HTTP status, robots access, syntax, and HTTP/HTTPS behavior. Reporting may lag, particularly with few ad requests. Do not remove a correct file or activate ads to force recognition. A browser request using a crawler-like user agent does not verify a genuine Google crawler's WAF access. |
| [IndexNow protocol](https://www.indexnow.org/documentation) | HTTP 200 means receipt; 202 indicates receipt while key validation is pending. Neither means indexed. Retain canonical-only notifications after verified deployment through the established workflow. |
| [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a) | The official search result was available, but direct web-tool opens repeatedly timed out. Discovery/freshness guidance was visible in that extract. Do not claim a complete fresh reading of the page. Existing policy-aligned canonical, sitemap, original-content, and crawlability controls should remain; authenticated Bing observations require separate evidence. |

## Privacy and accessibility

[Consent mode documentation](https://support.google.com/analytics/answer/9976101) distinguishes communicating a consent state from obtaining consent. Some consent-mode configurations transmit cookieless pings after denial; that does not authorize replacing Echo Buddha's existing stricter opt-in loading with such behavior. Preserve its current contract and test requests before and after consent.

[Publisher CMP requirements](https://support.google.com/adsense/answer/13554116) address personalized advertising in the EEA, UK, and Switzerland and explain the limits of Google's certification. This recovery does not activate ads or certify future advertising consent. Any activation needs its separately governed review.

[WCAG reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) supports a 320 CSS-pixel check for ordinary vertically scrolling content, with appropriate two-dimensional exceptions. [Text resizing guidance](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) calls for 200% text sizing without losing content or functionality. Passing a viewport or axe check is not complete accessibility certification.

## Research limitations

The [Search Console Sitemaps API resource](https://developers.google.com/webmaster-tools/v1/sitemaps), retrieved October 30, explicitly marks `contents[].indexed` as deprecated and says not to use it. A returned zero therefore cannot establish zero indexed pages. The `submitted` field counts URLs within that sitemap content type, while errors and warnings concern sitemap processing. Compare actual URL Inspection and dashboard indexing evidence separately.

Official documentation can change after these observations. This research does not provide live Search Console, Bing, GA4, AdSense, Cloudflare, or GitHub account access. Those must be evidenced by the release/audit lead. The Bing direct-fetch limitation is explicit; it must not be replaced with invented quotations or undocumented platform requirements.
