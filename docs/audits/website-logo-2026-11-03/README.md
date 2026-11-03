# Official website logo correction

The owner selected the existing circular Echo Buddha wordmark as the canonical website identity and authorized deployment after verification. `public/images/publisher-logo.svg` is authoritative. Both that SVG and the existing 512×512 PNG are byte-for-byte unchanged. Their SHA-256 digests are `13f24544103874c58018a1b014e388f3d3e0503eb7f59d64cc35d18b459891cd` and `0138e1ad25916b28e8932273a364fd723c3c05ef85be1563991111c56eba36f7` respectively.

Shared desktop/mobile header and footer now use `PUBLISHER_LOGO`. They retain an accessible home-link name, decorative empty image alternatives, fixed square display dimensions and uncropped proportions. The illustration remains supporting editorial imagery. External platform assets were not modified.

Browser PNG/ICO, Apple touch, 192px/512px webmanifest icons and five existing social preview PNGs derive from the original vector. The generator reads the canonical SVG instead of recreating or overwriting it. The homepage WebSite entity references the canonical Organization, whose existing logo and social identities remain intact; Article publisher entities use that same identity. Page-specific editorial sharing imagery remains unchanged.

Local verification passed: full release gate, all 98 tests, SEO contracts, 18-page accessibility audit with zero violations, consent checks, six manifest icons, three ICO entries, 357 generated HTML pages, eight viewport widths and seven additional mobile routes. Twenty Lighthouse runs scored 100 accessibility, 87–100 mobile performance and 92–100 desktop performance; mobile CLS was at most 0.001735 and desktop CLS was zero. Detailed results are in `LOCAL_VERIFICATION.json`.

Responsive limitation: the unchanged homepage hero illustration overflows at 860px and 861px. The same overflow was reproduced with the prior branding layout restored in the browser DOM. Logo bounds and navigation pass; the unrelated editorial-image layout issue is recorded, not counted as a successful page-wide overflow check.

The historical measurement records are preserved. This is a brand presentation correction with no editorial content, public route, canonical, index-state or owner change. Preserve the latest substantive observation window and consolidation hold. Production status and exact deployment evidence will be recorded after the governed workflow and live verification complete.
