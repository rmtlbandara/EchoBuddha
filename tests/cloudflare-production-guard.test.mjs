import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const guard = fileURLToPath(
  new URL("../scripts/block-legacy-cloudflare-production-build.mjs", import.meta.url),
);

function runGuard(environment = {}) {
  return spawnSync(process.execPath, [guard], {
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      ...environment,
    },
  });
}

test("blocks the legacy Cloudflare production branch", () => {
  const result = runGuard({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main" });

  assert.equal(result.status, 42);
  assert.match(result.stderr, /Blocked the legacy Cloudflare Git production build/);
});

test("fails closed when Workers Builds omits its branch", () => {
  const result = runGuard({ WORKERS_CI: "1" });

  assert.equal(result.status, 42);
});

test("allows previews and governed builds", () => {
  assert.equal(
    runGuard({
      WORKERS_CI: "1",
      WORKERS_CI_BRANCH: "codex/phase-10-search-measurement",
    }).status,
    0,
  );
  assert.equal(runGuard().status, 0);
});
