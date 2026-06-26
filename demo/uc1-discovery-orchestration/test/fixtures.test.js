import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = async (f) =>
  JSON.parse(await readFile(new URL(`../public/fixtures/${f}`, import.meta.url)));

test('candidates.json has 7 advanced candidates with the required schema', async () => {
  const { candidates } = await load('candidates.json');
  assert.equal(candidates.length, 7);
  for (const c of candidates) {
    for (const k of ['id', 'name', 'target', 'sequenceSnippet', 'kdNm',
                     'developabilityScore', 'interfaceScore', 'toxFlags',
                     'triageStatus', 'stage4Reason']) {
      assert.ok(k in c, `candidate ${c.id} missing ${k}`);
    }
    assert.equal(typeof c.kdNm, 'number');
    assert.equal(typeof c.developabilityScore, 'number');
    assert.equal(typeof c.interfaceScore, 'number');
    assert.ok(Array.isArray(c.toxFlags));
    assert.equal(c.triageStatus, 'advanced');
  }
});

test('canned-stage1 matches the /api/target-id success body', async () => {
  const s1 = await load('canned-stage1.json');
  assert.equal(s1.stage, 1);
  for (const k of ['name', 'mechanism', 'evidence', 'confidence',
                   'recommendation', 'recommendationText']) {
    assert.ok(k in s1.target, `target missing ${k}`);
  }
  assert.ok(Array.isArray(s1.target.evidence));
});

test('canned-stage5 matches the /api/rank success body and references real candidate ids', async () => {
  const s5 = await load('canned-stage5.json');
  const { candidates } = await load('candidates.json');
  const ids = new Set(candidates.map(c => c.id));
  assert.equal(s5.stage, 5);
  assert.equal(s5.ranking.length, candidates.length);
  assert.deepEqual([...s5.ranking].sort((a, b) => a.rank - b.rank).map(r => r.rank),
                   candidates.map((_, i) => i + 1));
  for (const r of s5.ranking) {
    assert.ok(ids.has(r.id), `ranking references unknown id ${r.id}`);
    assert.equal(typeof r.rationale, 'string');
  }
  assert.equal(typeof s5.overallRecommendation, 'string');
});
