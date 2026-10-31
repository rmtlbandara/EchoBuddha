# Deployment verification

**Not deployed at this candidate checkpoint.** Do not treat the branch or a passing local test as a production release.

Baseline source: main 27bca410eaec9541878a8923acdde472e283c7bd. Live baseline /release.json: 1a5e000bcccdef67ce539c82707105d50bee74dd, built October 29. The newer main commit records evidence and does not establish a newer deployed application.

Working branch: codex/adsense-content-recovery-2026-10-30. Unrelated tools/pinterest-mcp and existing other worktrees were preserved. Main branch protection was read: strict Release validation and Browser and consent validation, administrator enforcement, conversation resolution, no force pushes/deletion, zero required second-human approvals. Production restricts protected branches. The two expected environment secret names exist; values were not exposed. Authenticated Cloudflare Builds shows no competing connected Git repository.

The authorized path is local validation → PR → exact final-head hosted CI → permitted merge → exact current-main CI → Deploy Production with the full SHA → verified single artifact → Cloudflare identity → live release/smoke/crawl/parity → post-smoke canonical IndexNow handling. No emergency or direct local deployment is part of this assignment.

Previous verified fallback: source 1a5e000bcccdef67ce539c82707105d50bee74dd, deployment fc131bd2-ba45-4588-9547-93beae500472, version 1060f158-17a9-4871-9521-b0bd94df783e. Confirm availability and use the governed rollback runbook only for a serious incident. No rollback has been performed.

Actual PR/run/merge/deployment/artifact identifiers and the deployment timestamp will replace this checkpoint only when verified. A documentation-only receipt after release may advance main without changing the live serving SHA; those identities will remain explicitly distinct.
