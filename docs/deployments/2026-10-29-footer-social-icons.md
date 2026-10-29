# Footer social icons — verified production release

Verified October 29, 2026 (Asia/Colombo). Final status: **PASS_DEPLOYED_VERIFIED**.

The targeted footer update is merged and live at https://echobuddha.com/. Branded inline SVGs appear in the exact order Pinterest → YouTube → Facebook → Medium. LinkedIn, visible platform names and external-link arrows are absent from the social row. The heading, other footer content and publisher structured data are unchanged. No dependencies were added.

- Implementation: [PR #69](https://github.com/rmtlbandara/EchoBuddha/pull/69), squash merge `1a5e000bcccdef67ce539c82707105d50bee74dd`.
- PR CI: [40843763173](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40843763173); both mandatory checks passed without bypass.
- Exact merged-main CI: [40844136953](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40844136953); both mandatory checks passed.
- Production workflow: [40844142224](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40844142224); validation, artifact verification, deployment, smoke and IndexNow steps succeeded.
- Actual deployment time: `2026-10-29T08:44:29.589506Z` (14:14:29 Asia/Colombo).
- Cloudflare deployment: `fc131bd2-ba45-4588-9547-93beae500472`.
- Cloudflare version: `1060f158-17a9-4871-9521-b0bd94df783e`, serving 100%.
- Live serving SHA: `1a5e000bcccdef67ce539c82707105d50bee74dd`, independently read from production `/release.json`.
- Artifact: 812 file digests; aggregate SHA-256 `c533b9196fbac6f8e4fe1d939d4e51e24febced6baac045412f6c2e27424a135`.

## Verification

Fresh local release validation, hosted PR CI, exact-main CI and deployment validation passed: 88 tests, production build, type checking, the project's governance lint, SEO/content/governance contracts and dependency checks (zero high/critical advisories). The repository has no ESLint or separate formatter command; `git diff --check` passed.

Independent production smoke passed 15/15. All 351 live HTML responses, including the HTML error page, matched the immutable release manifest byte for byte; the homepage's emitted CSS/JS assets also matched. Eleven captured pre-release route/policy baselines retained their SEO head metadata, robots policy and sitemap bytes. Canonicals, indexing directives and publisher JSON-LD remain unchanged.

The live footer passed at 320, 390, 720, 768, 1024 and 1440px: exact order/URLs, visible 22px logos, 44×44px targets, keyboard tab order and focus indicators, hover color transitions, no wrapping/overlap/overflow, no axe violations and no console errors. The broader live audit passed all 18 accessibility routes with zero findings and all eight consent scenarios. Tools/search, timers, keyboard, reflow and axe checks passed in Chromium, Firefox and WebKit.

Fresh Lighthouse measurements on production covered ten routes in both mobile and desktop modes (20 checks): performance 97–100, accessibility 100 on all checks; maximum measured CLS 0.0003632681237862187. Homepage mobile performance/accessibility measured 97/100; desktop measured 100/100. These are measured live scores, separate from the earlier local results.

IndexNow returned HTTP 200 for 165 changed canonical URLs after successful smoke. Index submission does not establish indexing completion.

| Platform | Exact destination |
| --- | --- |
| Pinterest | https://www.pinterest.com/echobuddha/ |
| YouTube | https://www.youtube.com/@EchoBuddha |
| Facebook | https://www.facebook.com/EchoBuddha/ |
| Medium | https://medium.com/@echo_buddha |

## Evidence and recovery

[Machine-readable verification](../audits/footer-social-icons-2026-10-29/RELEASE_VERIFICATION.json) retains the actual identifiers, scores and verification notes. Immutable build/deployment/smoke/IndexNow evidence is attached to the production workflow. Detailed local browser logs and screenshots remain in the ignored `.artifacts/footer-social-icons/` directory.

The live hover sampler was stabilized by finishing existing smooth scrolling before reading the color transition. An initial broad browser audit stalled during shutdown; the same checks rerun with diagnostic logging passed. Neither adjustment changed production source or weakened a quality gate.

Previous verified fallback: source `e2f2dca788c2346368ab3cb104d71f10197ca085`, deployment `1a0019f3-5f65-4aa2-8772-69fa6e70861a`, version `ae9a9291-7a69-4ea0-93b2-4bbaf740a414` ([successful workflow](https://github.com/rmtlbandara/EchoBuddha/actions/runs/40730144053)). Confirm current availability and incident suitability before invoking the guarded rollback workflow. No rollback was performed.

No remaining release-related issues were identified. Later documentation-only evidence merges do not represent another deployed application. The serving SHA above remains the production identity until another explicitly verified release; the presentation-only receipt does not reset the substantive-content measurement window.
