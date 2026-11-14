import test from 'node:test';
import assert from 'node:assert/strict';
import { REFLECTION_SCHEDULES, getScheduledReflectionSlug } from '../src/utils/reflectionSchedule.mjs';

const original = [...REFLECTION_SCHEDULES[0].slugs];
const expanded = [...REFLECTION_SCHEDULES[1].slugs];
const choose = (date, pool = expanded) => getScheduledReflectionSlug(new Date(date), pool);

test('all 2026 UTC days retain their original selection after library growth', () => {
  for (let day = 0; day < 365; day++) {
    const date = new Date(Date.UTC(2026, 0, day + 1));
    assert.equal(getScheduledReflectionSlug(date, expanded), original[day % original.length]);
  }
});

test('appending or reordering available records cannot reshuffle scheduled dates', () => {
  for (const year of [2026, 2027, 2028]) {
    for (let day = 0; day < 366; day++) {
      const date = new Date(Date.UTC(year, 0, day + 1));
      assert.equal(getScheduledReflectionSlug(date, expanded), getScheduledReflectionSlug(date, ['future-entry', ...expanded].reverse()));
    }
  }
});

test('UTC midnight and offset representations select one consistent day', () => {
  assert.equal(choose('2026-11-13T00:00:00Z'), choose('2026-11-13T23:59:59Z'));
  assert.equal(choose('2026-11-14T05:29:59+05:30'), choose('2026-11-13T23:59:59Z'));
  assert.equal(choose('2026-11-13T16:00:00-08:00'), choose('2026-11-14T00:00:00Z'));
  assert.notEqual(choose('2026-11-13T23:59:59Z'), choose('2026-11-14T00:00:00Z'));
});

test('year rollover and leap day use the explicit calendar pool', () => {
  assert.equal(choose('2026-12-31'), original[364 % original.length]);
  assert.equal(choose('2027-01-01'), expanded[0]);
  assert.equal(choose('2028-02-28'), expanded[58 % expanded.length]);
  assert.equal(choose('2028-02-29'), expanded[59 % expanded.length]);
  assert.equal(choose('2028-03-01'), expanded[60 % expanded.length]);
});

test('invalid dates, empty schedules and unavailable records fail safely', () => {
  assert.equal(getScheduledReflectionSlug(new Date('invalid'), []), undefined);
  assert.equal(getScheduledReflectionSlug(new Date('invalid'), original), original[0]);
  assert.equal(getScheduledReflectionSlug(new Date('2027-01-01'), expanded, []), expanded[0]);
  assert.equal(getScheduledReflectionSlug(new Date('2027-01-01'), [expanded[1]]), expanded[1]);
});
