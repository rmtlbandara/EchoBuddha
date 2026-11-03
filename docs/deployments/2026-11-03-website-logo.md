# Echo Buddha website logo deployment

- Deployed: November 3, 2026, 19:54:19 Asia/Colombo (14:24:19 UTC).
- Production SHA: `edfe72dd8fbb313f6267d1da9580be3b3e5eb671`.
- Implementation: https://github.com/rmtlbandara/EchoBuddha/pull/84.
- PR validation: https://github.com/rmtlbandara/EchoBuddha/actions/runs/41652516184 — release and browser/consent jobs passed.
- Merged-main validation: https://github.com/rmtlbandara/EchoBuddha/actions/runs/41652982570 — passed.
- Production workflow: https://github.com/rmtlbandara/EchoBuddha/actions/runs/41653115143 — exact-main validation, immutable artifact verification, deployment, smoke and evidence upload passed.
- Artifact: 836 files; aggregate SHA-256 `06ada004bb0a9e9d32659b5ae8fd12ca399b34c85d55e629eea185ea95102e22`.
- Cloudflare deployment: `d06b720f-065c-4db0-92a2-1058897cfcb8`.
- Cloudflare version: `49895182-617f-4056-b44c-70bbc84af533`, 100% traffic.
- Live website: https://echobuddha.com/.
- Production smoke: 15/15 passed.
- Rollback if needed: previous version `100e9335-3076-4326-9432-1ebca47f1b37` from SHA `d6c412da99f54786e4ec7a6bb9563e61cd90671f`.

The original circular wordmark SVG and PNG are unchanged. Shared desktop/mobile header and footer use the canonical asset. Browser/Apple/webmanifest icons and the five branded sharing images derive from the original vector. WebSite, Organization and publisher metadata resolve to the same identity. Existing social-platform assets and supporting editorial illustration were preserved.

Independent live verification matched SHA-256 for 16 logo/icon/preview assets, checked branding and public sharing metadata on eight representative routes, and verified logo bounds/navigation at eight viewport widths plus seven mobile routes. The live serving SHA matches the release. Local and hosted release/SEO/accessibility/consent checks passed. Local Lighthouse: 20 runs, accessibility 100, mobile performance 87–100, desktop 92–100.

A pre-existing homepage illustration overflow at 860/861px remains documented separately; logo bounds and navigation pass there. This is not represented as a passing page-wide overflow check.

Cloudflare's Worker overview still prompted connection of a Git repository, consistent with the disconnected automatic build integration. GitHub's strict required release/browser checks and both production secret names were verified without reading secret values. The deployment used the governed workflow and did not change account protections.

IndexNow HTTP 200 accepted 171 changed canonical notifications because the shared header/footer changed page bytes; acceptance is not indexing. This logo correction changes no editorial content, route, canonical, index-state or topic ownership. Preserve the latest substantive measurement window and consolidation hold. Advertising and consent controls remain unchanged.

Detailed evidence: `docs/audits/website-logo-2026-11-03/RELEASE_VERIFICATION.json`. Screenshots and raw runtime evidence remain in the ignored `.artifacts/website-logo-2026-11-03/` directory. No rollback was required.
