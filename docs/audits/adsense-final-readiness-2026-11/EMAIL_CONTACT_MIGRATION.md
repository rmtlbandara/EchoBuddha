# Contact migration — November 11, 2026

**Status: deployed and accepted in production** at `bb44ff95fbba3e312a2a76b6f49a65a35cd2c551`, merged through [PR 103](https://github.com/rmtlbandara/EchoBuddha/pull/103). [Production workflow 43037973572](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43037973572) succeeded; Cloudflare version `672b2829-0760-4d5f-b715-0c6b163e867e` was verified at 100% traffic. See [release verification](PRODUCTION_RELEASE_VERIFICATION.md).

The owner explicitly requires one public address, **info@echobuddha.com**, and confirms a personally successful mailbox test. That statement is accepted as operational delivery evidence. This execution did not independently inspect the inbox or send a test message; DNS and public-page checks must not be described as an independent delivery test.

## Public configuration and schema

`SITE.contactEmail` is the authoritative public configuration, replacing separate editorial and support properties. Contact, About, Corrections, Editorial Policy, Privacy Policy and Terms use it. The organizational identity and ContactPoint schema use it too; the organizational author profile resolves through shared identity metadata. The Contact page presents one destination for general, editorial, correction, source, copyright, privacy, accessibility and website inquiries. Repeated contact sections and duplicate mail links were removed.

The ContactPage Organization has one ContactPoint covering those legitimate inquiry categories; its root email uses the same mailto destination. Independent schema inspection confirmed that the single ContactPoint and text contactType accurately describe the shared destination. Privacy and Terms display their actual November 11 revision and matching sitemap lastmod. Original publication dates and unrelated lastmods remain intact.

## Completed acceptance

The regression in `tests/governance.test.mjs` recursively checks **src, public and dist**, including JavaScript, JSON, SVG, error documents and binary asset bytes decoded as text. It rejects the retired address case-insensitively and any other Echo Buddha address, and verifies the approved destination and ContactPoint model. Independent local inspection found only the approved address in 357 generated HTML files, including 404, with 18 rendered text/schema occurrences. The focused suite passed 12/12 before the integrated 106/106 suite passed.

Production acceptance then verified the complete uploaded artifact against live delivery: **all 835 public files were checked, including 357 HTML documents with the 404 document included**. The scan of all 835 decoded public responses found `info@echobuddha.com` as the only public Echo Buddha address and found no retired address. This scope includes public script, JSON, SVG, CSS, error and other asset responses; it is broader than checking the visible Contact page alone. Decoding a binary asset as text is a leak-screening method, not proof that a binary image contains no visually encoded text.

Of the 835 public responses, 834 were byte-identical to the immutable artifact. The sole transformed response was `robots.txt`: an unchanged Cloudflare-managed prefix plus the exact source policy. It contained no contact address. The two non-public configuration files were excluded explicitly, rather than counted as successful public responses. Source and live contact values, mailto links and JSON-LD therefore have both regression coverage and release-parity evidence. Raw production evidence is `.artifacts/adsense-final-readiness-2026-11/production/full-artifact-live-parity.json`; its summary records the released SHA, 357 checked HTML files and the single approved contact.

The live browser suite included the Contact page within 33 directly checked routes, with all 142 responsive and 66 axe checks passing across that route set. Live consent testing passed 9/9 scenarios; its accessibility companion checked 18 routes with zero recorded axe violations. These suite totals are not per-Contact-page counts or proof of mailbox receipt.

## Delivery configuration and operational limits

November 11 DNS inspection returned unchanged Zoho MX priorities 10/20/50 for `mx.zoho.com`, `mx2.zoho.com` and `mx3.zoho.com`, plus the existing Zoho SPF include. No MX, SPF, DKIM, DMARC, Cloudflare Email Routing or mailbox configuration was changed. DNS confirms routing configuration; the owner's successful inbox test supplies the accepted delivery evidence. The migration changes the public destination and labels without claiming new delivery infrastructure or a guaranteed response time.

Historical audits retain the former address as archival repository evidence and are not public build inputs. Public production acceptance found no leak of that address. The subsequent [monitor 43038320353](https://github.com/rmtlbandara/EchoBuddha/actions/runs/43038320353) passed 15/15 checks and reported VERIFIED_LIVE for the same SHA, grounded in deployment `7712624440` and status `21953030283`.

The migration is complete for the observed production release. Continuing inbox operation remains an owner responsibility; this document supplies neither a human legal approval nor an assertion that every future release will preserve these results. See [publisher trust](ASSET_RIGHTS_AND_PUBLISHER_TRUST.md) for the broader evidence and its limits.
