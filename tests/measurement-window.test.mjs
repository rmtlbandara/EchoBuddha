import test from "node:test";
import assert from "node:assert/strict";
import { decisionWindowReady } from "../scripts/measurement-window.mjs";
const ready = { finalized: true, preComplete: true, postComplete: true, transitionExcluded: true, asOfDate: "2026-10-29", earliestReview: "2026-10-29", interventions: [], postStart: "2026-09-29", postEnd: "2026-10-26" };
test("future finalized rows cannot bypass the review date, missing data, or a real intervention", () => {
  assert.equal(decisionWindowReady(ready), true);
  assert.equal(decisionWindowReady({ ...ready, asOfDate: "2026-10-23" }), false);
  assert.equal(decisionWindowReady({ ...ready, postComplete: false }), false);
  assert.equal(decisionWindowReady({ ...ready, finalized: false }), false);
  assert.equal(decisionWindowReady({ ...ready, interventions: [{ status: "AUTHORIZED_FOR_RELEASE", plannedReleaseDate: "2026-10-23" }] }), false);
  assert.equal(decisionWindowReady({ ...ready, interventions: [{ status: "DEPLOYED", plannedReleaseDate: "2026-10-23" }] }), false);
  assert.equal(decisionWindowReady({ ...ready, interventions: [{ status: "CANCELLED", plannedReleaseDate: "2026-10-23" }] }), true);
});
