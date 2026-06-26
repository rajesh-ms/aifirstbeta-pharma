import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const scenario = JSON.parse(
  await readFile(new URL('../public/fixtures/scenario-pvrig.json', import.meta.url))
);

test('speed multiplier derives from the single baseline', () => {
  const { traditionalYears, acceleratedMonths, speedMultiplier, yearsSaved } = scenario.speed;
  const expectedMultiplier = (traditionalYears * 12) / acceleratedMonths;
  const expectedYearsSaved = (traditionalYears * 12 - acceleratedMonths) / 12;
  assert.equal(speedMultiplier, expectedMultiplier);
  assert.equal(yearsSaved, expectedYearsSaved);
});

test('hero numbers match the approved 6yr -> 18mo baseline', () => {
  assert.equal(scenario.speed.traditionalYears, 6);
  assert.equal(scenario.speed.acceleratedMonths, 18);
  assert.equal(scenario.speed.speedMultiplier, 4);
  assert.equal(scenario.speed.yearsSaved, 4.5);
});

test('exactly five stages, ids 1..5, stages 1 & 5 are real', () => {
  assert.equal(scenario.stages.length, 5);
  assert.deepEqual(scenario.stages.map(s => s.id), [1, 2, 3, 4, 5]);
  assert.equal(scenario.stages.find(s => s.id === 1).real, true);
  assert.equal(scenario.stages.find(s => s.id === 5).real, true);
  assert.equal(scenario.stages.filter(s => s.real).length, 2);
});