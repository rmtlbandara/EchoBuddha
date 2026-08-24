# EchoBuddha Phase 4 Rollback Plan

Checkpoint before Phase 4: `2fb776a989aca32da70b8bbdf972a24da8b30fd0`.

## Scope

The branch retires two attachment articles into https://echobuddha.com/articles/how-to-let-go-of-attachment-in-buddhism/, strengthens that survivor, updates rendered internal links, and adds the legacy terms redirect. Production is unchanged.

## Controlled rollback

1. Revert the dedicated Phase 4 commit with a normal Git revert; do not reset or rewrite shared history.
2. Confirm the two source article objects and their sitemap routes return.
3. Confirm the survivor returns to its prior content and reviewed date.
4. Remove only the three Phase 4 redirect rules if the rollback is intentionally released.
5. Restore prior internal links and governance approval state through the same revert.
6. Run build, tests, crawl, sitemap/canonical, protected-URL, and secret checks.
7. Deploy only under a separately authorized production release.

## Search safeguard

If a later deployment shows material query, canonical, coverage, or click loss, pause further consolidation and compare the exact Phase 3 28-day baseline before deciding whether to revert.
