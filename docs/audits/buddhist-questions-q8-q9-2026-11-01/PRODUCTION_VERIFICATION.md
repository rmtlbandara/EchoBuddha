# Q8 and Q9 production verification

Status: pending exact-SHA production deployment.

The implementation is not considered released until the merged main SHA passes hosted validation, the manual production workflow deploys that same SHA, `/release.json` reports it, both new canonicals return 200 with the expected metadata and navigation, sitemap/search counts are 167/332, ads remain absent, and the workflow evidence records successful smoke and IndexNow notification acceptance.

Rollback reference before release: serving SHA `1ed945581f6802046f8d3245e0480f5c58dabc2c`, Cloudflare deployment `2c067402-d43f-4aac-9ae3-6821e4da2be2`, version `911d7db1-fbed-4451-9761-bd4d6da17364`.
