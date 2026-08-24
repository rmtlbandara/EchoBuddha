# EchoBuddha Phase 2 Scoring Calibration

Generated: 2026-08-24T03:26:15.950Z

The calibration set was selected before corpus-wide interpretation to cover a cornerstone, an overlapping article, Learn, Dictionary, quote story, quote category, hub, reflection/practice surface, and tool. Scores shown are reconciled outputs from the same fixed weights used for all 182 pages.

| Role | URL | Score | Class | Calibration finding |
|---|---|---:|---|---|
| LEARN_GUIDE | [/learn/four-noble-truths/](https://echobuddha.com/learn/four-noble-truths/) | 88 | STRONG_KEEP_CANDIDATE | Evidence was read against the page's actual educational/practice role. |
| ARTICLE | [/articles/four-noble-truths-explained-simply/](https://echobuddha.com/articles/four-noble-truths-explained-simply/) | 61 | MAJOR_REVIEW_CANDIDATE | Independent purpose was challenged against the declared owner rather than keyword uniqueness. |
| BUDDHISM_101 | [/learn/buddhism-101/what-is-mindfulness/](https://echobuddha.com/learn/buddhism-101/what-is-mindfulness/) | 85 | STRONG_KEEP_CANDIDATE | Evidence was read against the page's actual educational/practice role. |
| DICTIONARY_ENTRY | [/learn/buddhist-dictionary/dhamma/](https://echobuddha.com/learn/buddhist-dictionary/dhamma/) | 81 | KEEP_ENHANCE_CANDIDATE | Concise lookup completeness was protected; sourcing and contextual utility mattered, not length. |
| QUOTE_STORY | [/quotes/wisdom/difficult-people-and-boundaries/](https://echobuddha.com/quotes/wisdom/difficult-people-and-boundaries/) | 47 | CONSOLIDATION_INDEXATION_REVIEW_CANDIDATE | Original quote/story value was separated from very-high template perception and substantive similarity. |
| QUOTE_CATEGORY | [/quotes/mindfulness/](https://echobuddha.com/quotes/mindfulness/) | 52 | MAJOR_REVIEW_CANDIDATE | Legitimate navigation purpose was protected without treating navigation as long-form editorial depth. |
| LEARN_HUB | [/learn/](https://echobuddha.com/learn/) | 54 | MAJOR_REVIEW_CANDIDATE | Legitimate navigation purpose was protected without treating navigation as long-form editorial depth. |
| DAILY_REFLECTION_HUB | [/daily-reflections/](https://echobuddha.com/daily-reflections/) | 73 | KEEP_ENHANCE_CANDIDATE | Legitimate navigation purpose was protected without treating navigation as long-form editorial depth. |
| TOOL | [/tools/](https://echobuddha.com/tools/) | 76 | KEEP_ENHANCE_CANDIDATE | Evidence was read against the page's actual educational/practice role. |

## Calibration conclusions

- The model separates source-study authority and practical information gain from generic topical coverage.
- Quote-story scores are not determined by original quote wording; repeated publishing grammar, independent purpose, external information gain, and internal similarity materially affect them.
- Hubs/categories can have valid user purpose while still carrying `NAVIGATION_DOMINANT_SURFACE` and later monetization review.
- No weights changed after full-corpus scoring. Any future weight change requires recomputing every URL.
