# Contact migration — November 11, 2026

Status: implemented and verified in the candidate build; live acceptance is recorded separately in PRODUCTION_RELEASE_VERIFICATION.md.

The owner explicitly requires one public address, **info@echobuddha.com**, and confirms a personally successful mailbox test. That statement is accepted as operational evidence. No independent inbox delivery test was available in this execution; this is a test limitation, with no evidence that the mailbox is broken.

`SITE.contactEmail` is the authoritative public configuration. It replaces the separate editorial and support properties. Contact, About, Corrections, Editorial Policy, Privacy Policy and Terms use that field. The organizational identity and ContactPoint schema use it too. The Contact page presents one destination covering general, editorial, source, correction, privacy, accessibility, copyright and website inquiries. Repeated sections and duplicate mail links were removed.

The ContactPage Organization has one ContactPoint covering the legitimate inquiry categories; its root email is the same mailto destination. The organizational author profile already resolves through shared identity metadata. Privacy and Terms display their actual November 11 revision and matching sitemap lastmod. Original publication dates and unrelated lastmods remain intact.

The regression in `tests/governance.test.mjs` recursively checks **src, public and dist**, including JavaScript, JSON, SVG, error output and binary asset bytes converted to text. It rejects the retired address case-insensitively and any other Echo Buddha address, and verifies the approved address and ContactPoint model. Fresh independent inspection found only info@echobuddha.com in 357 generated HTML files, including 404, with 18 rendered text/schema occurrences. The focused suite passed 12/12 before the integrated 106/106 suite passed.

November 11 DNS inspection returned Zoho MX priorities 10/20/50 for mx.zoho.com, mx2.zoho.com and mx3.zoho.com, plus the existing Zoho SPF include. No MX, SPF, DKIM, DMARC, Cloudflare Email Routing or mailbox configuration was changed. DNS establishes routing configuration; the owner's successful test supplies the delivery evidence. Historical audits retain the formerly used address. They are archival repository records, not public build inputs.

Post-release acceptance must check the immutable uploaded dist and live pages, all public mailto and email JSON-LD values, and the served SHA. A passed local test does not itself certify public deployment. See [release verification](PRODUCTION_RELEASE_VERIFICATION.md) and [publisher trust](ASSET_RIGHTS_AND_PUBLISHER_TRUST.md).
