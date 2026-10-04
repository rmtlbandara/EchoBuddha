# Private Search Console Import Guide

Authenticated raw evidence must not be committed.

## API collection

Store a read-only OAuth client and token outside the repository, then set:

`ECHOBUDDHA_GSC_CLIENT_FILE`  
`ECHOBUDDHA_GSC_TOKEN_FILE`

Run `npm run collect:phase2:gsc`. The collector requires the single `webmasters.readonly` scope and writes mode-0600 files under ignored `.artifacts/phase2-gsc/raw/`.

## CSV fallback

Copy only owner-approved Search Console exports into ignored `docs/audits/phase-2-measurement-2026-09-29/private-evidence/`. Use the filenames and headers in `import-templates/`. Keep:

- `window`: `pre`, `post`, or `context90`;
- `data_state`: `final` for decision evidence;
- `search_type`: `web`, `image`, or the exact available type;
- `week`: `W1` through `W4` for post-window query×page alternation analysis;
- full canonical page URLs;
- CTR as a decimal, not a display percentage.

Do not commit OAuth tokens, client secrets, refresh tokens, service-account keys, raw private exports, or private user-query logs.
