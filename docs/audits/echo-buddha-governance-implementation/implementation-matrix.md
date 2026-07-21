# Echo Buddha Governance Implementation Matrix

| Finding | Current status | Files affected | Planned action | Dependencies | Validation method | Final status |
| --- | --- | --- | --- | --- | --- | --- |
| F-001 | Direct analytics removed | Consent/layout/footer/privacy/data | Consent-gate analytics and add withdrawal | Legal owner review | Lint/tests/build | Implemented |
| F-002 | Typecheck fixed | Sitemap route | Type sitemap entries explicitly | None | `npm run typecheck` | Implemented |
| F-003 | Ads still disabled | Content templates/docs | Improve weak templates and document AdSense checklist | AdSense account access | SEO audit/docs | Implemented, external review pending |
| F-004 | Validation added | Package/scripts/tests/CI | Add release commands and CI workflow | Remote CI execution | `npm run validate` | Implemented |
| F-005 | Thin review reduced | Content templates/docs | Improve weak hubs/details and document concise policy pages | Editorial owner review | SEO audit | Implemented |
| F-006 | Low inbound fixed | Learn/resources/tools | Add crawlable contextual links | None | SEO audit | Implemented |
| F-007 | Schema simplified | SEO/quote/daily templates | Reduce broad global/article schema | Rich Results external tools | SEO audit | Implemented, external verification pending |
| F-008 | Platform controlled | Docs | Document Cloudflare permanent redirect action | Cloudflare access | Production check after deploy | Owner action required |
| F-009 | Model documented | Robots/README/docs | Use edge-augmented robots model | Cloudflare access | Source/prod review | Implemented, external verification pending |
| F-010 | Baseline automated | Consent/audit/docs | Delay analytics, capture asset/static metrics | Lighthouse/PSI access | Build/audit | Implemented, external field/lab pending |
| F-011 | Accessibility improvements added | Consent/header/global CSS | Add accessible consent, reduced motion, nav keyboard handling | Browser/axe access | Build/lint/manual notes | Implemented, manual verification pending |
| F-012 | README stale fixed | README | Rewrite operational docs | None | Lint/review | Implemented |
| F-013 | OS metadata removed | `.gitignore`, source tree | Remove `.DS_Store`; prevent recurrence | None | Lint/audit | Implemented |
| F-014 | Manifest added | Manifest/layout | Add valid website manifest | None | Tests/audit | Implemented |
