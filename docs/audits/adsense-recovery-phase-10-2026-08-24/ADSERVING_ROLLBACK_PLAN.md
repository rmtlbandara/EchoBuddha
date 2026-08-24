# Ad-Serving Rollback Plan

Trigger on any policy concern, wrong-route request, CMP failure, overlay activation, layout shift, accidental-click risk, excessive density or unexplained traffic.

1. Set `servingEnabled=false` first.
2. Set `runtimeScriptEnabled=false` and `manualSlotsEnabled=false`; keep Auto Ads false.
3. Confirm the built output has zero AdSense runtime URLs and slot elements.
4. Disable relevant account-side formats/campaign behavior and preserve evidence.
5. Roll back only through the governed exact-version deployment workflow if code rollback is required.
6. Re-run the Phase 10 firewall, privacy, browser, SEO and network validations.
7. Do not re-enable until root cause, owner approval and new evidence are recorded.

Verification metadata and ads.txt may remain unless the publisher relationship itself is being revoked.
