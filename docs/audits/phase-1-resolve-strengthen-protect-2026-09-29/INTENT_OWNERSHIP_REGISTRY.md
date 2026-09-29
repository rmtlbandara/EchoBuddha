# Intent Ownership Registry Guide

The machine-readable source of truth is available as `INTENT_OWNERSHIP_REGISTRY.json` and `INTENT_OWNERSHIP_REGISTRY.csv`. It contains one record for every current sitemap URL: 165 records for 165 indexable routes.

## Protected broad owners

| Cluster | Broad owner | Priority routes |
|---|---|---:|
| Beginner Meditation | `/meditation/meditation-for-beginners/` | 11 |
| Four Noble Truths | `/learn/four-noble-truths/` | 6 |
| Noble Eightfold Path | `/learn/eightfold-path/` | 7 |
| Buddhism for Beginners | `/learn/buddhism-for-beginners/` | 9 |
| Impermanence / Anicca | `/learn/buddhism-101/what-is-impermanence/` | 5 |
| Loving-kindness / Mettā | `/meditation/loving-kindness-meditation/` | 6 |

Each protected cluster declares exactly one broad owner. Narrow practices may own their own bounded intent—for example, `/meditation/walking-meditation/` owns the concise walking method—without competing for the cluster-wide first-meditation job.

## Registry interpretation

- `owns`, `doesNotOwn`, and `uniqueInformationGain` answer why a URL deserves to exist independently.
- `ownerUrl` records the page that a support route must help readers reach. All 44 priority relationships are verified from rendered crawlable links.
- `primaryOwner` is reserved for the six broad cluster owners.
- GSC fields use repository evidence through 2026-08-21. `NO_VISIBLE_PAGE_ROW` and `NOT_AVAILABLE_IN_LATEST_REPOSITORY_EVIDENCE` do not mean zero demand.
- `queryOverlap` remains `PENDING_FRESH_QUERY_PAGE_EVIDENCE` until authenticated current query-by-page evidence is available.
- Every current route remains indexable, in the sitemap, and self-canonical.

The registry deliberately governs intent and user jobs rather than banning shared Buddhist terminology.
