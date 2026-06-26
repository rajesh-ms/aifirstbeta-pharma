import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = async (f) =>
  JSON.parse(await readFile(new URL(`../public/fixtures/${f}`, import.meta.url)));

test('candidates.json has 7 advanced candidates with the enriched schema', async () => {
  const { candidates } = await load('candidates.json');
  assert.equal(candidates.length, 7);
  for (const c of candidates) {
    for (const k of ['id', 'name', 'format', 'target', 'germline', 'cdrh3',
                     'sequenceSnippet', 'metrics', 'liabilities', 'predictedBy',
                     'triageStatus', 'stage4Reason']) {
      assert.ok(k in c, `candidate ${c.id} missing ${k}`);
    }
    assert.equal(typeof c.germline.vh, 'string');
    assert.equal(typeof c.germline.jh, 'string');
    assert.match(c.germline.vh, /^IG[HKL]V/);
    assert.equal(typeof c.cdrh3, 'string');
    assert.equal(typeof c.metrics.kdNm, 'number');
    assert.equal(typeof c.metrics.developabilityScore, 'number');
    assert.equal(typeof c.metrics.interfaceScore, 'number');
    assert.equal(typeof c.metrics.immunogenicity.score, 'number');
    assert.ok(Array.isArray(c.metrics.tapFlags));
    assert.ok(Array.isArray(c.liabilities));
    assert.ok(Array.isArray(c.predictedBy) && c.predictedBy.length >= 1);
    assert.equal(c.triageStatus, 'advanced');
  }
});

test('canned-stage1 matches the /api/target-id body and carries citations + simulated provenance', async () => {
  const s1 = await load('canned-stage1.json');
  assert.equal(s1.stage, 1);
  for (const k of ['name', 'mechanism', 'evidence', 'confidence',
                   'recommendation', 'recommendationText', 'citations']) {
    assert.ok(k in s1.target, `target missing ${k}`);
  }
  assert.ok(Array.isArray(s1.target.evidence));
  assert.ok(Array.isArray(s1.target.citations) && s1.target.citations.length >= 3);
  assert.ok(s1.target.citations.every(c => /^https:\/\//.test(c.url)));
  assert.equal(s1.provenance.mode, 'simulated');
  assert.equal(typeof s1.provenance.model, 'string');
  assert.equal(typeof s1.provenance.tokens.total, 'number');
});

test('canned-stage5 matches the /api/rank body with per-entry scores, citations + provenance', async () => {
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
    assert.equal(typeof r.scores.affinity, 'number');
    assert.equal(typeof r.method, 'string');
  }
  assert.equal(typeof s5.overallRecommendation, 'string');
  assert.ok(Array.isArray(s5.citations) && s5.citations.length >= 1);
  assert.equal(s5.provenance.mode, 'simulated');
  assert.equal(typeof s5.provenance.tokens.total, 'number');
});

test('no fixture or UI source contains the bogus reg ref "Annex 22"', async () => {
  const files = [
    '../public/index.html',
    '../public/js/app.js',
    '../public/fixtures/canned-stage5.json',
    '../README.md'
  ];
  for (const f of files) {
    const text = await readFile(new URL(f, import.meta.url), 'utf8');
    assert.ok(!/Annex 22/.test(text), `${f} still contains "Annex 22"`);
  }
});

test('scenario has verified targetRefs, cited market, per-stage methods, and references', async () => {
  const s = await load('scenario-pvrig.json');
  assert.equal(s.program.targetRefs.uniprot, 'Q6DKI7');
  assert.equal(s.program.targetRefs.pdb, '8X6B');
  assert.equal(s.program.market.usLoeYear, 2028);
  assert.equal(s.program.market.fy2024RevenueUsdB, 29.5);
  for (const stage of s.stages) {
    assert.ok(Array.isArray(stage.methods) && stage.methods.length >= 1, `stage ${stage.id} methods`);
    assert.ok(Array.isArray(stage.dataSources) && stage.dataSources.length >= 1, `stage ${stage.id} dataSources`);
  }
  assert.ok(Array.isArray(s.references) && s.references.length >= 5);
  for (const r of s.references) {
    assert.equal(typeof r.label, 'string');
    assert.match(r.url, /^https:\/\//);
  }
  assert.ok(s.references.some(r => /Q6DKI7/.test(r.url)));
  assert.ok(s.references.some(r => /NCT03667716/.test(r.url)));
});
