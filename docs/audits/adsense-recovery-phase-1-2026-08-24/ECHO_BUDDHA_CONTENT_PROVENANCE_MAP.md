# EchoBuddha Content Provenance Map

Generated: 2026-08-24T03:01:37.618Z

No inference of AI use is made from style. Confirmed repository evidence is separated from unknown authorship history.

| Family | Source → generation → template → route | Provenance | Publication |
|---|---|---|---|
| Articles | `src/data/site.ts` → Astro static paths → article template → `/articles/[slug]/` | Structured records with authored HTML sections; historical drafting method not fully verified | Build/deploy is manual and exact-SHA gated |
| Quotes | `src/data/site.ts` quote registry → quote category/story templates → `/quotes/[category]/[slug]/` | Structured data; all records default to EchoBuddha-original classification; 43 have expanded story data | No scheduled publisher |
| Learn/dictionary/sutta/dhammapada | `src/data/learn.ts` → section/detail route builders → `/learn/.../` | Structured educational records; visible editorial governance applies | No scheduled publisher |
| Meditation | `src/data/learn.ts` → meditation static paths/template → `/meditation/[slug]/` | Structured practice guidance | No scheduled publisher |
| Daily reflections | `src/data/dailyReflections.ts` → 30 standalone noindex routes plus time-varying `/today/` | Structured recurring reflection set | Dynamic selection does not create dated URL expansion |
| Trust/editorial/legal | Authored Astro routes plus `src/data/editorialGovernance.ts` | Hand-maintained repository content | Manual deployment |

Automation inspection: scheduled workflows perform validation/smoke/dependency maintenance. No automatic public-content publishing job was observed. Runtime route generation happens only during the static build. Human-review history before repository entry is `PROVENANCE_NOT_VERIFIED` unless explicitly described by the content-process page.
