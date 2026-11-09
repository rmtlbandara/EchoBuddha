# Release candidate for after Nov 20, 2026

**Not built and not deployed.** The Oct 24–Nov 20 observation window resets when a material change reaches production (`docs/measurement-interventions.md`). So these changes ship together, as one release, no earlier than Nov 21. That release needs its own record in `governance/measurement-interventions.json` with the owner's authorization, the baseline SHA and baseline evidence, as that file requires. The owner's Nov 9 brief asks for this release to be prepared. It doesn't authorize a deploy before Nov 21.

## 1. Dhamma vs Dharma: description only

**Evidence** (Search Console, 28 days to Nov 6): `/articles/dhamma-vs-dharma/` had 1.29K impressions and 6 clicks, at average position 6.6.

| Query | Impressions | Clicks | Position |
|---|---|---|---|
| dhamma vs dharma | 95 | 0 | 5.0 |
| dhamma or dharma | 80 | 0 | 6.4 |
| dharma vs dhamma | 56 | 0 | 4.9 |
| dhamma and dharma difference | 43 | 0 | 5.9 |
| is dhamma and dharma the same | 37 | 0 | 5.6 |

The two "difference between…" queries account for 3 of the 6 clicks.

**Reading:** the title already matches every one of these queries, so the title isn't the problem. The searcher wants a one-line answer, and the current description withholds it ("Learn the difference…"). That can lose the click to a result whose snippet answers directly.

**Change** in `src/data/site.ts`, article `dhamma-vs-dharma`, field `description`:

- From: "Learn the difference between Dhamma and Dharma, why both spellings appear in Buddhist writing, and how beginners can read them without confusion."
- To: "Dhamma is Pali and Dharma is Sanskrit: the same word for the Buddha's teaching. Why both spellings appear, and how to read each without confusion."

Keep `title` and `seoTitle` as they are. Read the result over a full 28-day window after deployment; early days are noise.

## 2. Handbook links from Right Speech and Five Precepts

**Evidence:** the homepage and `/learn/` link to the Handbook. Right Speech, one of the site's strongest practice pages, does not. The Handbook chapter "Becoming a Lay Buddhist" has a section titled "Refuge and the Five Precepts". That's where both topics meet, which makes it the natural target.

**Changes** in `src/data/site.ts`, as one sentence each, placed in context and not in a footer list:

- **`right-speech-buddhism`**, section "How to Practice This in Daily Life": add "Right Speech is also the fourth of the Five Precepts. The Handbook chapter on [becoming a lay Buddhist](/learn/buddhist-handbook/becoming-a-lay-buddhist/) shows how that commitment fits a lay life."
- **`five-precepts-in-daily-life`**, section "The Fourth Precept Protects Speech" or "A Weekly Precept Reflection", whichever reads better in place: add "The Handbook chapter on [becoming a lay Buddhist](/learn/buddhist-handbook/becoming-a-lay-buddhist/) explains how lay followers take up the precepts alongside refuge."

No new pages, and no canonical, index or ownership changes.

## 3. Search Console follow-ups (no code)

As of Nov 6: 135 indexed, 232 not indexed.

| Reason | Pages | Action |
|---|---|---|
| Noindex, by design | 115 | None |
| Crawled, currently not indexed | 91 | Export the list and check whether any of the 47 priority URLs are in it. Those, and only those, are worth strengthening or linking |
| Discovered, currently not crawled | 14 | Check that the sitemap includes them |
| Page with redirect | 10 | None |
| Redirect error | 1 | Inspect |

The sitemap was last read on Oct 23.

## 4. GA4

Oct 9 to Nov 5: 72 active users and 65 new. The homepage had 224 views from 17 users, and Colombo is the top city. That fits owner and QA visits, but doesn't prove them. Before adding any filter, compare the same window with Colombo excluded, using a comparison and not a permanent filter. A filter that drops every Sri Lankan visitor would remove real readers too. Defining internal traffic by IP is the owner's call.

## 5. Not changing

- The Right Speech title: visible queries are too thin to support a retitle.
- AdSense: all setup steps show complete. No new review request.
