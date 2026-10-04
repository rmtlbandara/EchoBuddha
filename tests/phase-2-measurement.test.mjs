import test from "node:test";
import assert from "node:assert/strict";
import {
  CLUSTERS,
  PHASE_1,
  WATCHLIST,
  aggregateRows,
  daysInclusive,
  normalizeQuery,
  queryFamily,
  routeFromUrl
} from "../scripts/phase-2-measurement-lib.mjs";

test("Phase 2 clean windows are exactly 28 days and exclude the transition date", () => {
  assert.equal(daysInclusive(PHASE_1.preStart, PHASE_1.preEnd), 28);
  assert.equal(daysInclusive(PHASE_1.postStart, PHASE_1.postEnd), 28);
  assert.equal(PHASE_1.transitionDayPt, "2026-09-28");
  assert.notEqual(PHASE_1.transitionDayPt, PHASE_1.preEnd);
  assert.notEqual(PHASE_1.transitionDayPt, PHASE_1.postStart);
});

test("all 13 watchlist URLs map to one of six declared owners", () => {
  assert.equal(WATCHLIST.length, 13);
  assert.equal(new Set(WATCHLIST.map((item) => item.url)).size, 13);
  const owners = new Set(CLUSTERS.map((cluster) => cluster.owner));
  assert.equal(CLUSTERS.length, 6);
  assert.ok(WATCHLIST.every((item) => owners.has(item.owner)));
});

test("query families normalize explicit broad variants but preserve unmapped raw meaning", () => {
  assert.equal(queryFamily("What are the 4 Noble Truths?"), "four_noble_truths");
  assert.equal(queryFamily("Eight-fold path for daily life"), "eightfold_path");
  assert.equal(queryFamily("Aniccā meaning"), "impermanence_anicca");
  assert.equal(queryFamily("Mettā phrases"), "loving_kindness_metta");
  assert.equal(queryFamily("Buddhism for a new beginner"), "buddhism_for_beginners");
  assert.equal(queryFamily("first meditation session"), "beginner_meditation");
  assert.equal(queryFamily("meaning of dukkha"), "unmapped:meaning of dukkha");
  assert.equal(normalizeQuery("  Mettā—Practice! "), "metta practice");
});

test("metric aggregation weights average position by impressions", () => {
  const result = aggregateRows([
    { clicks: 1, impressions: 10, position: 2 },
    { clicks: 2, impressions: 30, position: 6 }
  ]);
  assert.equal(result.clicks, 3);
  assert.equal(result.impressions, 40);
  assert.equal(result.ctr, 0.075);
  assert.equal(result.position, 5);
});

test("canonical URLs normalize to repository routes", () => {
  assert.equal(routeFromUrl("https://echobuddha.com/learn/four-noble-truths/"), "/learn/four-noble-truths/");
  assert.equal(routeFromUrl("/articles/example"), "/articles/example/");
});
