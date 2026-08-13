# Echo Buddha Production Deployment Checklist

- [ ] The full release SHA equals current `origin/main`.
- [ ] `npm ci` and `npm run validate:release` passed for that SHA.
- [ ] Browser validation passed for relevant UX/consent changes.
- [ ] AdSense runtime remains off and manual slots remain disabled.
- [ ] Production environment secrets exist and Cloudflare token scope was owner-verified.
- [ ] Previous last-known-good SHA and Cloudflare version are recorded.
- [ ] The manual deploy workflow uses the exact SHA and validated artifact.
- [ ] Cloudflare deployment/version metadata was captured.
- [ ] Production smoke passed.
- [ ] A durable deployment record or incident follow-up is assigned.
