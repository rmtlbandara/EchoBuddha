# Echo Buddha Phase 6 Pre-Edit Source, Authorship, and Trust Diagnostic

**Captured:** 2026-08-11 (Asia/Colombo)

**Branch:** `codex/phase-6-source-authorship-trust`

**Starting HEAD:** `6ee25e6e91a0730195b8850ea1a5d88ab42bbb3a`

**Origin/main:** `a1cd457345587670133bfc58af1cafd80d038e6e`

**Ahead/behind:** five ahead, zero behind

**Starting worktree:** clean
**Phase 5 ending/evidence commit:** `6ee25e6e91a0730195b8850ea1a5d88ab42bbb3a`

## 1. Current Publisher Identity

Echo Buddha is visibly presented as an educational and reflective website. `Echo Buddha` is the schema publisher and `Echo Buddha Editorial` is the public content byline. No approved legal entity, named responsible person, physical address, phone number, staff list, or external profile is established. Brand-level publishing responsibility is implied but not stated plainly enough.

## 2. Current Authorship Model

Long-form articles visibly use `Echo Buddha Editorial`; article, Learn, meditation, daily-reflection, and quote-story schema use an `Organization` author. Trust, utility, and policy pages usually have publisher-only schema. The model is viable, but the profile's “shared editorial voice” and Contact's “editorial team” can imply an unverified team. The truthful target is organizational publication authorship with explicit non-person/non-expert-team boundaries.

## 3. Current Author/Profile State

`/authors/echo-buddha-editorial/` resolves, is indexable, and describes limits on authority. It does not identify credentials or a person. It needs to explain why the byline exists, who controls publication at a non-personal level, and what review status does and does not mean.

## 4. Current Trust Pages

The protected trust system includes About, author/profile, Editorial Policy, Content Process, Buddhist Sources and Citations, Quote Attribution, Corrections, Contact, Meditation Safety, Disclaimer, Privacy, and Terms. Cross-links exist but responsibility, internal-versus-external review, source hierarchy, AI assistance, and correction ownership are not uniformly explicit.

## 5. Current Source System

`src/data/editorialGovernance.ts` contains topic roles, article source references, quote-origin governance, and a small authoritative-source list. `src/data/learn.ts` contains page-specific Learn references. Source links are rendered on source-sensitive pages. URL-as-source identity is the safest consolidation key; a second decorative registry should not be created.

## 6. Current Claim Traceability

The strongest pages pair claim groups with source notes and external references. Traceability is uneven at the governance layer because sources do not consistently carry IDs/types and route-to-claim evidence lives in more than one data module. The material mismatch found pre-edit is the use of the Kalama Sutta to support the definition of karma as intention; AN 6.63 is the direct source.

## 7. Current Quote Attribution System

Current quote records are classified as original Echo Buddha writing and explicitly deny direct Buddha/scripture attribution. The public policy describes verified quotations, paraphrases, and uncertain popular sayings, but a compact five-class policy should be made explicit and kept consistent with the data model.

## 8. Current Translation Handling

Dhammapada and sutta pages generally state that they use original explanation/paraphrase rather than reproduce modern translations. Source labels often identify the discourse and translator host. No broad modern translation reproduction was found in the pre-edit scan. Copyright/translation status still needs a route-level register.

## 9. Current Corrections Workflow

Readers have a real mailto path at `info.echobuddha@gmail.com`. The policy identifies minor and substantive changes but does not yet provide a sufficiently concrete triage, attribution/source-check, materiality, date-change, and public-note workflow.

## 10. Current Content Process

The process page describes original writing, review, sources, automation, and corrections. It does not fully enumerate the actual Phase 1–5 workflow and does not state plainly enough that AI-assisted tools may contribute to organization, outlining, drafting support, analysis, and validation while publication responsibility remains with the publisher.

## 11. Current AI/Tool Transparency

Site-level automation language exists and correctly avoids an AI-free claim. It is narrower than the repository-observed workflow. The safe change is one proportionate site-level disclosure; no repetitive page-level label is justified.

## 12. Current Safety Governance

Meditation Safety, Disclaimer, and sensitive templates preserve stop/adapt/ground/support and non-clinical language. Relationship content protects boundaries and rejects coercive forgiveness or unsafe contact. No critical safety blocker exists.

## 13. Current Structured Data Trust Signals

Visible and schema authors are organizational rather than fictional people. Author URLs resolve. Publisher is `Echo Buddha`. Some schema objects omit stable entity IDs or author URLs, and the author profile needs an explicit organizational-label description. No reviewer, credential, award, rating, or `sameAs` fabrication was found.

## 14. Trust Contradictions

1. Contact says “editorial team,” while no team is established.
2. Author profile says “shared editorial voice,” which can reinforce the same ambiguity.
3. Public “reviewed” language is carefully limited on Corrections but not explained next to the byline profile.
4. The content-process page understates observed AI-assisted work.
5. The source-policy page describes categories but not a practical hierarchy matching current routes.

## 15. Unsupported Authority Claims

No named expert, monk, teacher, clinician, scholar, credential, award, testimonial, or external reviewer is claimed. Generic references to qualified teachers/professionals are reader guidance, not site credentials. The only identity overstatement is the unsupported implication of an editorial team.

## 16. Owner Input Requirements

Owner confirmation is required before publishing any named person, legal entity, credential, external profile, location, staff/team statement, or external-review claim. Independent Phase 6 work can complete using the safe organizational-byline model.

## 17. P0/P1/P2/P3 Trust Risks

- **P0:** 0.
- **P1:** 2 — unclear accountable publisher/person boundary; karma intention source mismatch.
- **P2:** 5 — editorial-team implication; incomplete AI/process transparency; incomplete source hierarchy; corrections workflow specificity; schema entity consistency.
- **P3:** minor terminology/cross-link consistency to be handled without SEO or navigation redesign.
- **OWNER INPUT REQUIRED:** named identity, entity status, credentials, external profiles, and any real external review.

## 18. Protected State

All 336 routes, 193 indexable/143 noindex state, 193-URL sitemap, canonical URLs, Phase 2 owners, Phase 4 content value, Phase 5 differentiation, original-quote attribution, translation boundaries, safety language, consent/AdSense behavior, and existing dates are protected. Phase 6 may change only verified trust/source/process/schema wording. No deployment, push, merge, indexability change, broad navigation work, or AdSense action is authorized.
