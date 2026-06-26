# UC1 Demo Realism Enrichment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shipped UC1 discovery-orchestration demo read as credibly real — verified identifiers/citations, named predictor tools, richer (clearly *predicted*) candidate metrics, server-attached run-metadata on the two live calls, a clickable Sources panel, and a hash-chained audit trail — without wiring a live data backend.

**Architecture:** The app is a fixture-driven static front-end (`public/`) plus a thin Express server (`server.js`) that makes the only two real Azure calls (Stage 1, Stage 5) and otherwise returns 501; the browser owns all fallback to canned JSON. Enrichment is additive: extend the four fixtures, attach a `provenance` block server-side (mirrored in the canned fixtures so simulated ≈ live), and add four UI surfaces in `app.js`/`index.html`/`theme.css`. Node `node --test` covers fixtures + server; Playwright (`e2e.cjs`, a session artifact) covers the UI end-to-end.

**Tech Stack:** Node ≥20 ESM, Express 4, vanilla ES-module front-end, `node:test`, `node:crypto`, `crypto.subtle` (browser), Playwright (validation only).

**Reference spec:** `docs/superpowers/specs/2026-06-26-uc1-realism-enrichment-design.md`

**Working dir for all paths below:** `demo/uc1-discovery-orchestration/` (run `npm test` from here). The Playwright harness lives at the session path `C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files\e2e.cjs` and is **not** committed.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `public/fixtures/scenario-pvrig.json` | program/speed/stages/funnel content | add `program.targetRefs`, `program.market`, per-stage `methods`+`dataSources`, top-level `references[]` |
| `public/fixtures/candidates.json` | 7 antibody candidates | nest metrics, add germline/cdrh3/format/liabilities/predictedBy |
| `public/fixtures/canned-stage1.json` | simulated Target-ID payload | sharpen mechanism, add `target.citations[]` + `provenance` |
| `public/fixtures/canned-stage5.json` | simulated Rank payload | per-entry `scores`+`method`, `citations[]`, `provenance`, reg-ref fix |
| `server.js` | Express app + Azure call | `callAzureJSON` returns `{data,usage}`; attach `provenance` on live responses |
| `public/index.html` | UI shell / element-ID contract | add Sources section, provenance strips, audit section; reg-ref fix |
| `public/css/theme.css` | styling | classes for sources, rich cards, chips, liabilities, provenance, audit |
| `public/js/app.js` | front-end engine + gate | render sources/provenance/rich-cards/audit; reg-ref fix |
| `test/fixtures.test.js` | fixture-shape tests | assert new fields + a no-"Annex 22" guard |
| `test/server.test.js` | server tests | `{data,usage}` shape + `provenance` assertions |
| `e2e.cjs` (session artifact) | Playwright E2E | assert sources/provenance/cards/audit + zero "Annex 22" |

---

## Task 1: Fix the regulatory reference ("Annex 22" → Part 11 / Annex 11) + add a guard test

"Annex 22" is not a real GMP reference. Replace all 5 occurrences and lock it with a test. (`README.md` already has none.)

**Files:**
- Test: `test/fixtures.test.js` (append)
- Modify: `public/index.html:46`, `public/fixtures/canned-stage5.json:13`, `public/js/app.js:176,227,246`

- [ ] **Step 1: Write the failing guard test** — append to `test/fixtures.test.js`:

```javascript
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — the new test reports `index.html still contains "Annex 22"` (and others).

- [ ] **Step 3: Replace all 5 occurrences**

In `public/index.html` line 46, replace `Annex 22 · Part 11 / ALCOA+` with:
```html
21 CFR Part 11 · EU GMP Annex 11 · ALCOA+
```

In `public/fixtures/canned-stage5.json` line 13, replace `(Annex 22)` with:
```
(21 CFR Part 11 · EU GMP Annex 11)
```

In `public/js/app.js` line 176, replace `Four-eyes control (Annex 22):` with:
```
Four-eyes control (21 CFR Part 11 · EU GMP Annex 11):
```

In `public/js/app.js` line 227, replace `(Annex 22 / Part 11)` with:
```
(21 CFR Part 11 · EU GMP Annex 11)
```

In `public/js/app.js` line 246, replace `two-person gate · Annex 22` with:
```
two-person gate · Part 11 / Annex 11
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all 19 tests green (18 prior + 1 new guard).

- [ ] **Step 5: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/index.html demo/uc1-discovery-orchestration/public/fixtures/canned-stage5.json demo/uc1-discovery-orchestration/public/js/app.js demo/uc1-discovery-orchestration/test/fixtures.test.js
git commit -m "fix(uc1-demo): replace bogus 'Annex 22' with 21 CFR Part 11 / EU GMP Annex 11" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2: Enrich `scenario-pvrig.json` with verified refs, market, per-stage methods, and a sources list

**Files:**
- Test: `test/fixtures.test.js` (append)
- Modify: `public/fixtures/scenario-pvrig.json`

- [ ] **Step 1: Write the failing test** — append to `test/fixtures.test.js`:

```javascript
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot read properties of undefined (reading 'uniprot')`.

- [ ] **Step 3: Replace `public/fixtures/scenario-pvrig.json` with the enriched version**

```json
{
  "program": {
    "title": "Next-Gen IO Antibody — PVRIG / CD112R",
    "subtitle": "Refilling the pipeline after Keytruda",
    "target": "PVRIG (CD112R)",
    "alternateTarget": "CCR8",
    "targetRefs": {
      "uniprot": "Q6DKI7",
      "ligand": "CD112 / Nectin-2 (Q92692)",
      "pdb": "8X6B",
      "axis": "DNAM-1 (CD226) / TIGIT"
    },
    "market": {
      "drug": "Keytruda (pembrolizumab)",
      "fy2024RevenueUsdB": 29.5,
      "shareOfPharmaPct": 46,
      "usLoeYear": 2028,
      "citation": "Merck FY2024 results"
    }
  },
  "speed": {
    "traditionalYears": 6,
    "acceleratedMonths": 18,
    "speedMultiplier": 4,
    "yearsSaved": 4.5
  },
  "funnel": { "generated": 240, "advanced": 7 },
  "references": [
    { "label": "PVRIG / CD112R — UniProt Q6DKI7", "url": "https://www.uniprot.org/uniprotkb/Q6DKI7" },
    { "label": "CD112 / Nectin-2 ligand — UniProt Q92692", "url": "https://www.uniprot.org/uniprotkb/Q92692" },
    { "label": "PVRIG·Nectin-2 complex — PDB 8X6B (X-ray 2.0 Å)", "url": "https://www.rcsb.org/structure/8X6B" },
    { "label": "COM701 anti-PVRIG Phase 1 — NCT03667716", "url": "https://clinicaltrials.gov/study/NCT03667716" },
    { "label": "Merck FY2024 results (Keytruda revenue & US LOE)", "url": "https://www.merck.com/news/merck-announces-fourth-quarter-and-full-year-2024-financial-results/" }
  ],
  "stages": [
    { "id": 1, "key": "target-id", "label": "Target ID", "icon": "🎯",
      "traditional": "6–12 mo", "accelerated": "6 min", "animationMs": 2400, "real": true,
      "headline": "Validate PVRIG as the next-gen checkpoint",
      "methods": ["Azure OpenAI (gpt-4o · JSON mode)", "curated evidence retrieval"],
      "dataSources": ["UniProt Q6DKI7", "PDB 8X6B", "ClinicalTrials NCT03667716"] },
    { "id": 2, "key": "gen-design", "label": "Gen design", "icon": "🧬",
      "traditional": "12–18 mo", "accelerated": "2 hr", "animationMs": 2600, "real": false,
      "headline": "240 candidate antibody sequences generated",
      "methods": ["IgLM / RFantibody (de novo VH/VL)", "germline-guided sampling"],
      "dataSources": ["OAS antibody repertoires", "IMGT germline reference"] },
    { "id": 3, "key": "structure", "label": "Structure & binding", "icon": "🔬",
      "traditional": "6–9 mo", "accelerated": "45 min", "animationMs": 2400, "real": false,
      "headline": "Predicted antibody–antigen interfaces",
      "methods": ["AlphaFold-Multimer", "IgFold", "Rosetta / FoldX ΔG"],
      "dataSources": ["PDB 8X6B template"] },
    { "id": 4, "key": "triage", "label": "In-silico triage", "icon": "⚖️",
      "traditional": "weeks", "accelerated": "90 min", "animationMs": 2200, "real": false,
      "headline": "Developability + manufacturability narrows 240 → 7",
      "methods": ["Therapeutic Antibody Profiler (TAP)", "Aggrescan3D", "NetMHCII / IEDB"],
      "dataSources": ["IEDB immunogenicity sets", "developability rule-sets"] },
    { "id": 5, "key": "rank", "label": "Rank → human gate", "icon": "👥",
      "traditional": "weeks", "accelerated": "8 min", "animationMs": 2600, "real": true,
      "headline": "Ranked shortlist for the four-eyes gate",
      "methods": ["Azure OpenAI (gpt-4o · JSON mode)", "multi-objective weighting"],
      "dataSources": ["Stage 1–4 predicted metrics"] }
  ]
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — new scenario test green; `timing.test.js` (locked speed/stage assertions) still green.

- [ ] **Step 5: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/fixtures/scenario-pvrig.json demo/uc1-discovery-orchestration/test/fixtures.test.js
git commit -m "feat(uc1-demo): ground scenario in verified refs, cited market, per-stage methods + sources" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: Enrich `candidates.json` (germline, CDR-H3, nested predicted metrics, liabilities) + update the rank prompt

Metrics move under `metrics`; `toxFlags` becomes structured `liabilities`. Update the one consumer in `app.js` is deferred to Task 8 — but the rank prompt in `server.js` and the fixtures test change here.

**Files:**
- Test: `test/fixtures.test.js` (replace the candidates test)
- Modify: `public/fixtures/candidates.json`, `server.js:30-31` (rank prompt wording)

- [ ] **Step 1: Replace the candidates test** in `test/fixtures.test.js` — swap the existing `candidates.json has 7 advanced candidates…` test (lines 8-23) for:

```javascript
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `candidate AB-014 missing format`.

- [ ] **Step 3: Replace `public/fixtures/candidates.json`**

```json
{
  "candidates": [
    { "id": "AB-014", "name": "PVR-014", "format": "IgG1", "target": "PVRIG (CD112R)",
      "germline": { "vh": "IGHV3-23", "jh": "IGHJ4", "vl": "IGKV1-39", "jl": "IGKJ1" },
      "cdrh3": "ARDRGYSSGWYFDY",
      "sequenceSnippet": "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMS",
      "metrics": { "kdNm": 2.1, "kdMethod": "predicted SPR-equivalent", "tmC": 71.4, "pI": 8.2, "hmwPct": 1.8,
        "developabilityScore": 89, "interfaceScore": 0.84,
        "immunogenicity": { "score": 0.18, "method": "NetMHCII / IEDB", "highRiskEpitopes": 0 }, "tapFlags": [] },
      "liabilities": [],
      "predictedBy": ["IgFold", "AlphaFold-Multimer", "TAP", "Aggrescan3D", "NetMHCII"],
      "triageStatus": "advanced", "stage4Reason": "High interface confidence, clean liabilities" },
    { "id": "AB-031", "name": "PVR-031", "format": "IgG1", "target": "PVRIG (CD112R)",
      "germline": { "vh": "IGHV1-69", "jh": "IGHJ6", "vl": "IGKV3-20", "jl": "IGKJ2" },
      "cdrh3": "ARENYYGSGSYYNAFDI",
      "sequenceSnippet": "QVQLQESGPGLVKPSETLSLTCTVSGGSISSYYWS",
      "metrics": { "kdNm": 3.4, "kdMethod": "predicted SPR-equivalent", "tmC": 73.1, "pI": 7.6, "hmwPct": 1.2,
        "developabilityScore": 85, "interfaceScore": 0.80,
        "immunogenicity": { "score": 0.22, "method": "NetMHCII / IEDB", "highRiskEpitopes": 0 }, "tapFlags": [] },
      "liabilities": [],
      "predictedBy": ["IgFold", "AlphaFold-Multimer", "TAP", "Aggrescan3D", "NetMHCII"],
      "triageStatus": "advanced", "stage4Reason": "Strong developability, low aggregation propensity" },
    { "id": "AB-052", "name": "PVR-052", "format": "IgG4", "target": "PVRIG (CD112R)",
      "germline": { "vh": "IGHV3-30", "jh": "IGHJ4", "vl": "IGLV2-14", "jl": "IGLJ2" },
      "cdrh3": "AKDLRGAFDY",
      "sequenceSnippet": "EVQLLESGGGLVQPGGSLRLSCAASGFTFSNAWMS",
      "metrics": { "kdNm": 4.0, "kdMethod": "predicted SPR-equivalent", "tmC": 69.8, "pI": 7.1, "hmwPct": 2.4,
        "developabilityScore": 82, "interfaceScore": 0.78,
        "immunogenicity": { "score": 0.27, "method": "NetMHCII / IEDB", "highRiskEpitopes": 1 }, "tapFlags": [] },
      "liabilities": [],
      "predictedBy": ["IgFold", "AlphaFold-Multimer", "TAP", "Aggrescan3D", "NetMHCII"],
      "triageStatus": "advanced", "stage4Reason": "Balanced affinity/stability profile" },
    { "id": "AB-067", "name": "PVR-067", "format": "IgG1", "target": "PVRIG (CD112R)",
      "germline": { "vh": "IGHV1-46", "jh": "IGHJ5", "vl": "IGKV1-5", "jl": "IGKJ4" },
      "cdrh3": "ARGYNWNDGFDP",
      "sequenceSnippet": "QVQLVQSGAEVKKPGASVKVSCKASGYTFTSYGIS",
      "metrics": { "kdNm": 5.6, "kdMethod": "predicted SPR-equivalent", "tmC": 68.2, "pI": 8.5, "hmwPct": 2.1,
        "developabilityScore": 80, "interfaceScore": 0.75,
        "immunogenicity": { "score": 0.31, "method": "NetMHCII / IEDB", "highRiskEpitopes": 1 }, "tapFlags": [] },
      "liabilities": [ { "motif": "NG", "type": "deamidation", "region": "CDR-H2", "pos": 55, "severity": "low" } ],
      "predictedBy": ["IgFold", "AlphaFold-Multimer", "TAP", "Aggrescan3D", "NetMHCII"],
      "triageStatus": "advanced", "stage4Reason": "Good affinity; one monitorable sequence liability" },
    { "id": "AB-090", "name": "PVR-090", "format": "IgG1", "target": "PVRIG (CD112R)",
      "germline": { "vh": "IGHV3-23", "jh": "IGHJ3", "vl": "IGKV4-1", "jl": "IGKJ1" },
      "cdrh3": "AKGYSSSWYAFDI",
      "sequenceSnippet": "EVQLVESGGGLVKPGGSLRLSCAASGFTFSSYWMH",
      "metrics": { "kdNm": 6.9, "kdMethod": "predicted SPR-equivalent", "tmC": 70.5, "pI": 7.9, "hmwPct": 1.9,
        "developabilityScore": 78, "interfaceScore": 0.72,
        "immunogenicity": { "score": 0.24, "method": "NetMHCII / IEDB", "highRiskEpitopes": 0 }, "tapFlags": [] },
      "liabilities": [],
      "predictedBy": ["IgFold", "AlphaFold-Multimer", "TAP", "Aggrescan3D", "NetMHCII"],
      "triageStatus": "advanced", "stage4Reason": "Clean profile, moderate predicted affinity" },
    { "id": "AB-118", "name": "PVR-118", "format": "IgG4", "target": "PVRIG (CD112R)",
      "germline": { "vh": "IGHV4-39", "jh": "IGHJ4", "vl": "IGLV1-44", "jl": "IGLJ3" },
      "cdrh3": "ARHGDSSGWYFDL",
      "sequenceSnippet": "QVQLQESGPGLVKPSQTLSLTCTVSGGSISSGGYSW",
      "metrics": { "kdNm": 8.3, "kdMethod": "predicted SPR-equivalent", "tmC": 67.0, "pI": 6.8, "hmwPct": 3.1,
        "developabilityScore": 76, "interfaceScore": 0.70,
        "immunogenicity": { "score": 0.35, "method": "NetMHCII / IEDB", "highRiskEpitopes": 2 }, "tapFlags": ["elevated %HMW"] },
      "liabilities": [],
      "predictedBy": ["IgFold", "AlphaFold-Multimer", "TAP", "Aggrescan3D", "NetMHCII"],
      "triageStatus": "advanced", "stage4Reason": "Acceptable developability; weaker interface" },
    { "id": "AB-203", "name": "PVR-203", "format": "IgG1", "target": "PVRIG (CD112R)",
      "germline": { "vh": "IGHV3-9", "jh": "IGHJ6", "vl": "IGKV2-28", "jl": "IGKJ2" },
      "cdrh3": "AKDSSGYYYGMDV",
      "sequenceSnippet": "EVQLVESGGGLVQPGRSLRLSCAASGFTFDDYAMH",
      "metrics": { "kdNm": 11.0, "kdMethod": "predicted SPR-equivalent", "tmC": 66.4, "pI": 8.8, "hmwPct": 2.7,
        "developabilityScore": 74, "interfaceScore": 0.68,
        "immunogenicity": { "score": 0.29, "method": "NetMHCII / IEDB", "highRiskEpitopes": 1 }, "tapFlags": [] },
      "liabilities": [ { "motif": "M", "type": "oxidation", "region": "CDR-H3", "pos": 101, "severity": "low" } ],
      "predictedBy": ["IgFold", "AlphaFold-Multimer", "TAP", "Aggrescan3D", "NetMHCII"],
      "triageStatus": "advanced", "stage4Reason": "Backup candidate; monitor oxidation site" }
  ]
}
```

- [ ] **Step 4: Update the rank prompt** in `server.js` — replace the `'Lower kdNm is stronger; …non-empty toxFlags are penalties. '` line (line 31) with:

```javascript
      'Each candidate has metrics: lower metrics.kdNm is stronger; higher developabilityScore and interfaceScore are better; ' +
      'lower immunogenicity.score is better; non-empty liabilities and metrics.tapFlags are penalties. ' +
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — enriched-candidates test green; `server.test.js` rank-prompt `/json/` assertion still green (the word "JSON" remains later in the prompt).

- [ ] **Step 6: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/fixtures/candidates.json demo/uc1-discovery-orchestration/server.js demo/uc1-discovery-orchestration/test/fixtures.test.js
git commit -m "feat(uc1-demo): enrich candidates with germline, CDR-H3, predicted metrics + liabilities" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Enrich `canned-stage1.json` (sharper mechanism, citations, provenance)

**Files:**
- Test: `test/fixtures.test.js` (extend the canned-stage1 test)
- Modify: `public/fixtures/canned-stage1.json`

- [ ] **Step 1: Extend the stage-1 test** — replace the existing `canned-stage1 matches…` test (lines 25-33) with:

```javascript
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `target missing citations`.

- [ ] **Step 3: Replace `public/fixtures/canned-stage1.json`**

```json
{
  "stage": 1,
  "latencyMs": 0,
  "target": {
    "name": "PVRIG (CD112R)",
    "mechanism": "Inhibitory receptor on T and NK cells that binds CD112 (Nectin-2) and competes with the activating receptor DNAM-1 (CD226). Blocking PVRIG releases the CD226 brake and restores cytotoxic anti-tumor activity, complementary to PD-1 and to TIGIT blockade in the same nectin/PVR axis.",
    "evidence": [
      "PVRIG / CD112R (UniProt Q6DKI7) is an emerging next-generation checkpoint with no failed Merck program attached.",
      "Structurally validated: PVRIG·Nectin-2 complex solved by X-ray at 2.0 Å (PDB 8X6B).",
      "Clinically explored by COM701 (anti-PVRIG) ± nivolumab in Phase 1 (NCT03667716), validating target relevance and combinability."
    ],
    "citations": [
      { "label": "PVRIG / CD112R — UniProt Q6DKI7", "url": "https://www.uniprot.org/uniprotkb/Q6DKI7" },
      { "label": "PVRIG·Nectin-2 — PDB 8X6B", "url": "https://www.rcsb.org/structure/8X6B" },
      { "label": "COM701 Phase 1 — NCT03667716", "url": "https://clinicaltrials.gov/study/NCT03667716" }
    ],
    "confidence": 0.78,
    "recommendation": "go",
    "recommendationText": "Advance PVRIG as the lead next-gen IO target; structure-enabled antibody design recommended."
  },
  "provenance": {
    "model": "gpt-4o",
    "deployment": "merck-uc1-gpt4o",
    "apiVersion": "2024-10-21",
    "promptTemplate": "target-id@v1.3",
    "promptHash": "sha256:7f3a1c9e22b40d18",
    "temperature": 0.2,
    "seed": 7,
    "tokens": { "prompt": 1180, "completion": 372, "total": 1552 },
    "latencyMs": 2143,
    "requestId": "f1e2a3b4-0000-4a5b-8c6d-7e8f90123456",
    "timestamp": "2026-06-26T12:00:00.000Z",
    "grounding": "retrieval over curated PVRIG evidence pack",
    "mode": "simulated"
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/fixtures/canned-stage1.json demo/uc1-discovery-orchestration/test/fixtures.test.js
git commit -m "feat(uc1-demo): sharpen PVRIG mechanism + add citations and simulated provenance to stage 1" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: Enrich `canned-stage5.json` (per-entry scores, citations, provenance)

**Files:**
- Test: `test/fixtures.test.js` (extend the canned-stage5 test)
- Modify: `public/fixtures/canned-stage5.json`

- [ ] **Step 1: Extend the stage-5 test** — replace the existing `canned-stage5 matches…` test (lines 35-48) with:

```javascript
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot read properties of undefined (reading 'affinity')`.

- [ ] **Step 3: Replace `public/fixtures/canned-stage5.json`** (note: reg ref already corrected in Task 1; keep it correct here)

```json
{
  "stage": 5,
  "latencyMs": 0,
  "ranking": [
    { "id": "AB-014", "rank": 1, "method": "multi-objective weighted (predicted)",
      "scores": { "affinity": 0.95, "developability": 0.89, "immunogenicity": 0.91, "manufacturability": 0.88 },
      "rationale": "Best predicted affinity (KD 2.1 nM) and highest interface confidence with a clean developability profile." },
    { "id": "AB-031", "rank": 2, "method": "multi-objective weighted (predicted)",
      "scores": { "affinity": 0.90, "developability": 0.85, "immunogenicity": 0.88, "manufacturability": 0.90 },
      "rationale": "Strong, well-balanced profile; low aggregation propensity supports manufacturability." },
    { "id": "AB-052", "rank": 3, "method": "multi-objective weighted (predicted)",
      "scores": { "affinity": 0.86, "developability": 0.82, "immunogenicity": 0.79, "manufacturability": 0.83 },
      "rationale": "Solid affinity/stability balance; IgG4 backbone suits a checkpoint mechanism." },
    { "id": "AB-090", "rank": 4, "method": "multi-objective weighted (predicted)",
      "scores": { "affinity": 0.78, "developability": 0.78, "immunogenicity": 0.86, "manufacturability": 0.84 },
      "rationale": "Clean liabilities; affinity moderate but developable." },
    { "id": "AB-067", "rank": 5, "method": "multi-objective weighted (predicted)",
      "scores": { "affinity": 0.81, "developability": 0.80, "immunogenicity": 0.72, "manufacturability": 0.80 },
      "rationale": "Good affinity offset by a monitorable deamidation site (NG, CDR-H2)." },
    { "id": "AB-118", "rank": 6, "method": "multi-objective weighted (predicted)",
      "scores": { "affinity": 0.70, "developability": 0.76, "immunogenicity": 0.66, "manufacturability": 0.71 },
      "rationale": "Acceptable developability with a weaker predicted interface and elevated %HMW." },
    { "id": "AB-203", "rank": 7, "method": "multi-objective weighted (predicted)",
      "scores": { "affinity": 0.62, "developability": 0.74, "immunogenicity": 0.77, "manufacturability": 0.79 },
      "rationale": "Viable backup; oxidation liability (Met, CDR-H3) warrants monitoring." }
  ],
  "overallRecommendation": "Advance AB-014 and AB-031 to wet-lab confirmation; hold AB-052 as backup. Human approval required before any wet-lab commitment (21 CFR Part 11 · EU GMP Annex 11).",
  "citations": [
    { "label": "Therapeutic Antibody Profiler (developability)", "url": "https://opig.stats.ox.ac.uk/webapps/sabdab-sabpred/sabpred/tap" },
    { "label": "IEDB (immunogenicity reference)", "url": "https://www.iedb.org/" }
  ],
  "provenance": {
    "model": "gpt-4o",
    "deployment": "merck-uc1-gpt4o",
    "apiVersion": "2024-10-21",
    "promptTemplate": "rank@v1.1",
    "promptHash": "sha256:9c44e0b8d1a72f63",
    "temperature": 0.2,
    "seed": 7,
    "tokens": { "prompt": 1605, "completion": 488, "total": 2093 },
    "latencyMs": 2671,
    "requestId": "a7b8c9d0-1111-4e2f-93a4-b5c6d7e8f901",
    "timestamp": "2026-06-26T12:00:09.000Z",
    "grounding": "retrieval over curated PVRIG evidence pack",
    "mode": "simulated"
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all fixture tests green, including the Task-1 "no Annex 22" guard.

- [ ] **Step 5: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/fixtures/canned-stage5.json demo/uc1-discovery-orchestration/test/fixtures.test.js
git commit -m "feat(uc1-demo): add per-candidate scores, citations and simulated provenance to stage 5" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: Attach server-side `provenance` to the two live Azure responses

The server measures latency, reads token usage from the Azure `usage` field, and stamps `requestId`/`timestamp` — so the REAL payloads carry genuine run-metadata. `callAzureJSON` must surface `usage`, so its return shape changes from the parsed object to `{ data, usage }`.

**Files:**
- Test: `test/server.test.js` (update 3 tests)
- Modify: `server.js`

- [ ] **Step 1: Update `server.test.js` for the new shapes** — make these four edits:

(a) In `callAzureJSON builds the Azure URL…` test, change the `fetchImpl` return and the result assertions:

```javascript
  const fetchImpl = async (url, opts) => {
    captured = { url, opts };
    return { ok: true, json: async () => ({ choices: [{ message: { content: '{"x":1}' } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } }) };
  };
  const out = await callAzureJSON({ system: 's', user: 'u' }, { fetchImpl });
  assert.deepEqual(out.data, { x: 1 });
  assert.equal(out.usage.total_tokens, 15);
```

(b) In `POST /api/rank returns a live-shaped body…`, return `{ data, usage }` and assert provenance:

```javascript
  const fakeAzure = async () => ({
    data: { ranking: [{ id: 'AB-014', rank: 1, rationale: 'top' }], overallRecommendation: 'advance AB-014' },
    usage: { prompt_tokens: 1000, completion_tokens: 200, total_tokens: 1200 }
  });
```
and after the existing assertions add:
```javascript
    assert.equal(body.provenance.mode, 'live');
    assert.equal(body.provenance.tokens.total, 1200);
    assert.equal(typeof body.provenance.model, 'string');
    assert.match(body.provenance.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.ok(body.provenance.requestId.length >= 8);
```

(c) In `POST /api/target-id returns a live stage-1 body…`, wrap the fake and assert provenance:

```javascript
  const fakeAzure = async () => ({
    data: { name: 'PVRIG (CD112R)', mechanism: 'inhibitory receptor', evidence: ['a', 'b', 'c'],
      confidence: 0.78, recommendation: 'go', recommendationText: 'advance' },
    usage: { prompt_tokens: 900, completion_tokens: 150, total_tokens: 1050 }
  });
```
and after the existing assertions add:
```javascript
    assert.equal(body.provenance.tokens.total, 1050);
    assert.equal(body.provenance.promptTemplate, 'target-id@v1.3');
```

(d) The `POST /api/rank returns 502 when the azure caller throws` test is unchanged (it throws before destructuring).

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — `body.provenance` is undefined / `out.data` is undefined.

- [ ] **Step 3: Update `server.js`**

Add to the top imports (after line 4):
```javascript
import { randomUUID, createHash } from 'node:crypto';
```

Replace the `callAzureJSON` return (lines 54-55) so it surfaces usage:
```javascript
  const data = await resp.json();
  return { data: JSON.parse(data.choices[0].message.content), usage: data.usage || null };
```

Add a provenance builder and rewrite `makeHandler` (replace lines 58-69):
```javascript
const PROMPT_TEMPLATE = { 1: 'target-id@v1.3', 5: 'rank@v1.1' };

function buildProvenance({ stage, prompt, usage, started }) {
  const u = usage || {};
  const hash = createHash('sha256').update(`${prompt.system}\n${prompt.user}`).digest('hex').slice(0, 16);
  return {
    model: process.env.AZURE_OPENAI_MODEL || 'gpt-4o',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
    promptTemplate: PROMPT_TEMPLATE[stage],
    promptHash: `sha256:${hash}`,
    temperature: 0.2,
    seed: 7,
    tokens: { prompt: u.prompt_tokens || 0, completion: u.completion_tokens || 0, total: u.total_tokens || 0 },
    latencyMs: Date.now() - started,
    requestId: randomUUID(),
    timestamp: new Date().toISOString(),
    grounding: 'retrieval over curated PVRIG evidence pack',
    mode: 'live'
  };
}

function makeHandler({ stage, buildPrompt, shape, azureCall }) {
  return async (req, res) => {
    if (!azureConfigured()) return res.status(501).json({ error: 'azure-not-configured' });
    const started = Date.now();
    const prompt = buildPrompt(req.body);
    try {
      const { data, usage } = await azureCall(prompt);
      res.json({
        mode: 'live', stage, latencyMs: Date.now() - started,
        ...shape(data),
        provenance: buildProvenance({ stage, prompt, usage, started })
      });
    } catch (err) {
      res.status(502).json({ error: String(err.message || err) });
    }
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all server tests green; live bodies now include `provenance`.

- [ ] **Step 5: Commit**

```bash
git add demo/uc1-discovery-orchestration/server.js demo/uc1-discovery-orchestration/test/server.test.js
git commit -m "feat(uc1-demo): attach run provenance (model, tokens, latency, requestId) to live Azure responses" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 7: Add UI containers + styles (Sources panel, provenance strips, audit section)

This task only adds DOM scaffolding and CSS. `app.js` populates them in Task 8. Verified visually + by Task 9 E2E.

**Files:**
- Modify: `public/index.html`, `public/css/theme.css`

- [ ] **Step 1: Add provenance strips inside the payloads** — in `public/index.html` replace the payloads block (lines 65-68) with:

```html
      <div class="payloads">
        <div><h4>Stage 1 — /api/target-id</h4><div id="prov-stage1" class="prov"></div><pre id="payload-stage1">—</pre></div>
        <div><h4>Stage 5 — /api/rank</h4><div id="prov-stage5" class="prov"></div><pre id="payload-stage5">—</pre></div>
      </div>
```

- [ ] **Step 2: Add the Sources section and the Audit section** — in `public/index.html`, replace the gate + summary block (lines 71-75) with:

```html
    <!-- Sources & evidence (visible in both lenses) -->
    <section id="sources" class="sources" aria-label="Sources and evidence">
      <h3>Sources &amp; evidence <small>curated &amp; verified — not model-generated</small></h3>
      <ul id="sources-list" class="sources-list"></ul>
    </section>

    <!-- Human gate -->
    <section id="gate" class="gate" hidden></section>

    <!-- Tamper-evident audit trail -->
    <section id="audit" class="audit" hidden></section>

    <!-- Final summary -->
    <section id="summary" class="summary" hidden></section>
```

- [ ] **Step 3: Append the new styles** to `public/css/theme.css`:

```css
/* sources */
.sources{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;margin-top:18px}
.sources h3{margin:0 0 10px;font-size:15px;color:var(--navy)}
.sources h3 small{font-weight:400;color:var(--muted);font-size:12px}
.sources-list{margin:0;padding-left:18px;display:grid;gap:6px;font-size:13px}
.sources-list a{color:var(--ms-blue);text-decoration:none}
.sources-list a:hover{text-decoration:underline}
/* provenance strip */
.prov{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.prov-item{font-size:11px;background:#eef3fb;border:1px solid var(--line);border-radius:6px;padding:2px 7px;color:var(--ink)}
.prov-item b{color:var(--muted);font-weight:600;margin-right:4px;text-transform:uppercase;letter-spacing:.03em;font-size:10px}
/* rich candidate cards */
.shortlist .cand{display:grid;gap:4px}
.cand-head{font-size:14px}
.cand-head .fmt{font-size:11px;color:var(--muted);margin-left:6px}
.cand-meta{font-size:12px;color:var(--muted)}
.cand-meta code{background:#eef3fb;border-radius:4px;padding:1px 5px;font-size:11px}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
.chip{font-size:11px;background:#eef3fb;border:1px solid var(--line);border-radius:999px;padding:2px 8px}
.liabilities{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
.liability{font-size:11px;border-radius:999px;padding:2px 8px}
.liability.clean{background:#dff3e6;color:var(--good);border:1px solid #a8d8bb}
.liability.low{background:#fff4d6;color:var(--sim);border:1px solid #e8d28a}
.liability.medium,.liability.high{background:#fde2e2;color:#b42318;border:1px solid #f3b4b4}
.rationale{font-size:12px;color:var(--ink);margin-top:2px}
/* audit */
.audit{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;margin-top:18px}
.audit h3{margin:0 0 10px;font-size:15px;color:var(--navy)}
.audit h3 small{font-weight:400;color:var(--muted);font-size:12px}
.audit-list{margin:0;padding-left:18px;display:grid;gap:6px;font-size:12px}
.audit-list .ts{font-variant-numeric:tabular-nums;color:var(--muted)}
.audit-list .role{color:var(--muted)}
.audit-list .hash{background:#0f1b2a;color:#cfe3ff;border-radius:4px;padding:1px 6px;font-size:11px}
```

- [ ] **Step 4: Sanity-check there are no test regressions**

Run: `npm test`
Expected: PASS — HTML/CSS aren't unit-tested; this confirms nothing else broke.

- [ ] **Step 5: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/index.html demo/uc1-discovery-orchestration/public/css/theme.css
git commit -m "feat(uc1-demo): add sources panel, provenance strips, audit section + styles" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 8: Render sources, provenance, rich candidate cards, and the hash-chained audit trail in `app.js`

**Files:**
- Modify: `public/js/app.js`
- Validated by: Task 9 E2E (no unit harness for the DOM layer)

- [ ] **Step 1: Add `audit` to run-state** — in `public/js/app.js`, add a field to the `run` object (after `trace: []` on line 15, changing it to `trace: [],`):

```javascript
  trace: [],
  audit: []
```

- [ ] **Step 2: Render the Sources panel on init** — add a call inside `init()` right after `renderPipeline();` (line 39):

```javascript
  renderPipeline();
  renderSources();
  wireControls();
```

and add this function after `renderPipeline()` (after line 55):

```javascript
function renderSources() {
  const refs = run.scenario.references || [];
  $('#sources-list').innerHTML = refs.map((r) =>
    `<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.label)}</a></li>`
  ).join('');
}
```

- [ ] **Step 3: Add a provenance renderer** — add after `renderSources()`:

```javascript
function renderProvenance(sel, res) {
  const el = $(sel);
  if (!el) return;
  const p = res && res.provenance;
  if (!p) { el.innerHTML = ''; return; }
  const items = [
    ['model', p.model],
    ['api', p.apiVersion],
    ['prompt', p.promptTemplate],
    ['tokens', p.tokens ? p.tokens.total : '—'],
    ['latency', `${p.latencyMs != null ? p.latencyMs : (res.latencyMs ?? '—')} ms`],
    ['req', String(p.requestId || '').slice(0, 8)],
    ['mode', p.mode || res.mode]
  ];
  el.innerHTML = items.map(([k, v]) => `<span class="prov-item"><b>${esc(k)}</b>${esc(v)}</span>`).join('');
}
```

- [ ] **Step 4: Call `renderProvenance` where the two payloads are set** — in `startRun()`, update the Stage 1 and Stage 5 branches.

For Stage 1, after `$('#payload-stage1').textContent = JSON.stringify(res, null, 2);` (line 131) add:
```javascript
      renderProvenance('#prov-stage1', res);
```

For Stage 5, after `$('#payload-stage5').textContent = JSON.stringify(res, null, 2);` (line 140) add:
```javascript
      renderProvenance('#prov-stage5', res);
```

And in `onSendBack(role)`, after `$('#payload-stage5').textContent = JSON.stringify(run.rankResult, null, 2);` (line 220) add:
```javascript
  renderProvenance('#prov-stage5', run.rankResult);
```

- [ ] **Step 5: Replace `shortlistHtml()` with the rich-card version** — replace the whole function (lines 157-165) with:

```javascript
function metricChips(c) {
  const m = c.metrics || {};
  const chips = [];
  if (m.kdNm != null) chips.push(`KD ${esc(m.kdNm)} nM`);
  if (m.tmC != null) chips.push(`Tm ${esc(m.tmC)}°C`);
  if (m.hmwPct != null) chips.push(`%HMW ${esc(m.hmwPct)}`);
  if (m.immunogenicity) chips.push(`immuno ${esc(m.immunogenicity.score)}`);
  return chips.map((t) => `<span class="chip">${t}</span>`).join('');
}

function liabilityBadges(c) {
  const ls = c.liabilities || [];
  if (!ls.length) return `<span class="liability clean">no flagged liabilities</span>`;
  return ls.map((l) =>
    `<span class="liability ${esc(l.severity)}">${esc(l.type)} · ${esc(l.region)} ${esc(l.motif)}@${esc(l.pos)}</span>`
  ).join('');
}

function shortlistHtml() {
  return `<div class="shortlist">` + run.rankResult.ranking
    .slice().sort((a, b) => a.rank - b.rank).map((r) => {
      const c = candidateById(r.id) || { name: r.id, metrics: {}, germline: {} };
      const g = c.germline || {};
      const m = c.metrics || {};
      return `<div class="row">
        <span class="rank">#${r.rank}</span>
        <div class="cand">
          <div class="cand-head"><strong>${esc(c.name)}</strong><span class="fmt">${esc(c.format || '')}</span></div>
          <div class="cand-meta">germline ${esc(g.vh || '—')}/${esc(g.jh || '—')} · CDR-H3 <code>${esc(c.cdrh3 || '—')}</code></div>
          <div class="chips">${metricChips(c)}</div>
          <div class="liabilities">${liabilityBadges(c)}</div>
          <div class="rationale">${esc(r.rationale)}</div>
        </div>
        <span class="kd">KD ${esc(m.kdNm != null ? m.kdNm : '—')} nM</span>
      </div>`;
    }).join('') + `</div>`;
}
```

- [ ] **Step 6: Add the audit trail (hash-chained)** — add these helpers after `addTrace()` (after line 81):

```javascript
async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function addAudit(actor, role, action, reason) {
  const prevHash = run.audit.length ? run.audit[run.audit.length - 1].hash : 'GENESIS';
  const entry = { actor, role, action, reason: reason || '', ts: new Date().toISOString() };
  entry.hash = await sha256Hex(prevHash + JSON.stringify(entry));
  run.audit.push(entry);
  renderAudit();
}

function renderAudit() {
  const el = $('#audit');
  el.hidden = false;
  el.innerHTML = `<h3>Audit trail <small>21 CFR Part 11 · EU GMP Annex 11 · ALCOA+ · hash-chained</small></h3>` +
    `<ol class="audit-list">` + run.audit.map((e) =>
      `<li><span class="ts">${esc(e.ts)}</span> <b>${esc(e.actor)}</b> <span class="role">(${esc(e.role)})</span> — ${esc(e.action)}` +
      `${e.reason ? ` · <em>${esc(e.reason)}</em>` : ''} <code class="hash">${esc(e.hash.slice(0, 12))}</code></li>`
    ).join('') + `</ol>`;
}
```

- [ ] **Step 7: Wire audit entries into the gate actions** — make the three gate handlers async and log audit entries.

Replace `onReviewerRecommend` (lines 187-191):
```javascript
async function onReviewerRecommend() {
  run.gate.reviewer = 'recommend';
  addTrace('Reviewer (Dr. A. Rao): recommended advancing the shortlist.');
  await addAudit('Dr. A. Rao', 'Reviewer', 'recommended advancing the shortlist', '');
  renderApproverStep();
}
```

Replace the body of `onSendBack(role)` — add the audit call just before `renderReviewerStep();` (line 222):
```javascript
  await addAudit(role === 'Reviewer' ? 'Dr. A. Rao' : 'Dr. M. Chen', role, 'sent back for reconsideration', 'simulated alternate re-rank');
  renderReviewerStep();
```
and change the function signature on line 206 to `async function onSendBack(role) {`.

Replace `onApproverApprove` (lines 225-231):
```javascript
async function onApproverApprove() {
  run.gate.approver = 'approve';
  addTrace('Approver (Dr. M. Chen): approved → candidates released to wet-lab. Decision traced (21 CFR Part 11 · EU GMP Annex 11).');
  await addAudit('Dr. M. Chen', 'Approver', 'approved → released to wet-lab', '');
  stopClock();
  setStatus('approved');
  showSummary();
}
```

- [ ] **Step 8: Manual smoke test** — start the server and click through once.

Run (async):
```
cd demo/uc1-discovery-orchestration; $env:PORT='3300'; node server.js
```
Open `http://localhost:3300`, click **Run discovery**, send back once, recommend, approve. Confirm: Sources panel lists 5 links; technical lens shows provenance strips on both payloads; gate cards show germline + CDR-H3 + chips + liability badges; the Audit section lists 3 hash-chained entries; summary shows "Part 11 / Annex 11". Stop the server when done (`Stop-Process -Id <PID>`).

- [ ] **Step 9: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/js/app.js
git commit -m "feat(uc1-demo): render sources, run-metadata, rich candidate cards, hash-chained audit" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 9: Extend the Playwright E2E and run the full validation matrix

The harness is a session artifact at `C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files\e2e.cjs` (not committed). Add realism assertions and run it against the local server.

**Files:**
- Modify: `e2e.cjs` (session path above)

- [ ] **Step 1: Add Sources assertions** — in `e2e.cjs`, after the stage REAL-badge checks (after line 44), insert:

```javascript
  // 2b) Sources panel grounded in real, verifiable links
  const srcCount = await page.locator('#sources-list li a').count();
  check('sources panel lists >= 5 links', srcCount >= 5, String(srcCount));
  const srcHtml = await page.locator('#sources-list').innerHTML();
  check('sources cite UniProt Q6DKI7', /Q6DKI7/.test(srcHtml), 'no Q6DKI7');
  check('sources cite trial NCT03667716', /NCT03667716/.test(srcHtml), 'no NCT');
```

- [ ] **Step 2: Assert rich candidate cards** — in the gate Step-1 block, after the `top candidate before send-back is PVR-014` check (after line 75), insert:

```javascript
  const cardHtml = await page.locator('#gate .shortlist .row:first-child').innerHTML();
  check('card shows germline (IGHV)', /IGHV/.test(cardHtml), cardHtml.slice(0, 120));
  check('card shows CDR-H3 sequence', /CDR-H3/.test(cardHtml) && /<code>[A-Z]{6,}<\/code>/.test(cardHtml), 'no cdr-h3');
  check('card shows a metric chip (Tm)', /Tm\s/.test(cardHtml), 'no Tm chip');
```

- [ ] **Step 3: Assert provenance strips** — in the technical-lens block after send-back, after the `stage-1 payload present` check (after line 93), insert:

```javascript
  const prov1 = await page.textContent('#prov-stage1');
  check('stage-1 provenance shows model + mode', /model/i.test(prov1) && /(simulated|live)/i.test(prov1), prov1);
  const prov5 = await page.textContent('#prov-stage5');
  check('stage-5 provenance shows tokens', /tokens/i.test(prov5), prov5);
```

- [ ] **Step 4: Assert the audit trail** — after the Approver→summary block, after the `summary: lead candidate PVR-031 released` check (after line 113), insert:

```javascript
  // 7b) Tamper-evident audit trail logged the four-eyes decisions
  const auditTxt = await page.textContent('#audit');
  check('audit logs Reviewer recommend', /Dr\. A\. Rao/.test(auditTxt) && /recommended advancing/.test(auditTxt), auditTxt.slice(0, 120));
  check('audit logs Approver approve', /Dr\. M\. Chen/.test(auditTxt) && /approved/.test(auditTxt));
  const auditHashes = await page.locator('#audit .hash').count();
  check('audit entries are hash-chained (>= 3)', auditHashes >= 3, String(auditHashes));
```

- [ ] **Step 5: Assert zero "Annex 22" anywhere on the page** — after the audit checks, insert:

```javascript
  const fullHtml = await page.content();
  check('no "Annex 22" anywhere on the page', !/Annex 22/.test(fullHtml));
  check('summary cites Part 11 / Annex 11', /(Part 11|Annex 11)/.test(await page.textContent('#summary')));
```

- [ ] **Step 6: Start the server and run the E2E**

Start (async):
```
cd demo/uc1-discovery-orchestration; $env:PORT='3300'; node server.js
```
Run:
```
$env:NODE_PATH='C:\Users\rajeshsingh\AppData\Roaming\npm\node_modules'; $env:BASE_URL='http://localhost:3300'; $env:SHOT_DIR='C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files'; node 'C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files\e2e.cjs'
```
Expected: `ALL PASS` (≈44 checks, exit 0). Fix any failure before continuing. Stop the server afterward (`Stop-Process -Id <PID>`).

- [ ] **Step 7: Run the static-subpath variant** (mirrors GitHub Pages `/uc1-demo/`)

Start the static host (async) and run E2E against the subpath:
```
$env:ROOT='C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\rajesh-ms-cautious-spork\demo\uc1-discovery-orchestration\public'; $env:PORT='3399'; node 'C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files\static-server.cjs'
```
```
$env:NODE_PATH='C:\Users\rajeshsingh\AppData\Roaming\npm\node_modules'; $env:BASE_URL='http://localhost:3399/uc1-demo/'; $env:SHOT_DIR='C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files'; node 'C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files\e2e.cjs'
```
Expected: `ALL PASS`. (Sources/audit/provenance work identically; provenance shows `simulated` via canned fixtures.) Stop the host afterward.

> No commit in this task — `e2e.cjs` is a session artifact, not part of the repo.

---

## Task 10: Redeploy to GitHub Pages and update PR #6

**Files:** none in-repo; deploys `public/` to the `gh-pages` branch under `/uc1-demo/`.

- [ ] **Step 1: Confirm a clean tree and full local green**

```bash
cd demo/uc1-discovery-orchestration && npm test
git -C C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\rajesh-ms-cautious-spork status --short
```
Expected: tests PASS; only expected changes present.

- [ ] **Step 2: Deploy `public/*` to `gh-pages:/uc1-demo/`** via a temp worktree:

```bash
git -C C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\rajesh-ms-cautious-spork worktree add C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\gh-pages-deploy gh-pages
Copy-Item -Recurse -Force C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\rajesh-ms-cautious-spork\demo\uc1-discovery-orchestration\public\* C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\gh-pages-deploy\uc1-demo\
Remove-Item -Force C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\gh-pages-deploy\uc1-demo\fixtures\.gitkeep -ErrorAction SilentlyContinue
git -C C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\gh-pages-deploy add uc1-demo
git -C C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\gh-pages-deploy commit -m "deploy(uc1-demo): realism enrichment — provenance, sources, audit, candidate detail"
git -C C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\gh-pages-deploy push origin gh-pages
git -C C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\rajesh-ms-cautious-spork worktree remove C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\gh-pages-deploy --force
```

- [ ] **Step 3: Wait for the Pages build, then validate the live URL**

```bash
gh api repos/rajesh-ms/aifirstbeta-pharma/pages/builds/latest --jq '.status'
```
Expected: `built`. Then run the E2E against live:
```
$env:NODE_PATH='C:\Users\rajeshsingh\AppData\Roaming\npm\node_modules'; $env:BASE_URL='https://rajesh-ms.github.io/aifirstbeta-pharma/uc1-demo/'; $env:SHOT_DIR='C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files'; node 'C:\Users\rajeshsingh\.copilot\session-state\aea5fe50-dc56-4777-bb27-a25a2c0de7e9\files\e2e.cjs'
```
Expected: `ALL PASS` (Pages returns 405 for `POST /api/*`; the harness's 4xx/5xx fallback filter already treats that as benign).

- [ ] **Step 4: Push the branch and refresh PR #6**

```bash
git -C C:\gitrepos\copilot-worktrees\aifirstbeta-pharma\rajesh-ms-cautious-spork push
```
Then update the PR #6 body to note the realism-enrichment commits, the verified anchors, and that live + local + static-subpath E2E all pass (use the `update_pull_request` tool).

---

## Self-Review

**1. Spec coverage:**
- §3 verified anchors → Tasks 2, 4 (refs, citations) + Task 9 asserts Q6DKI7/NCT. ✓
- §4.1 scenario fields → Task 2. ✓ §4.2 candidates → Task 3. ✓ §4.3/§4.4 canned + provenance → Tasks 4, 5. ✓
- §5 server provenance → Task 6. ✓
- §6 "Annex 22" fix → Task 1 (+ guard test, + E2E zero-check Task 9). ✓
- §7 UI (sources, provenance strip, rich cards, audit) → Tasks 7, 8. ✓
- §9 validation (unit + E2E across server/static/live) → Tasks 1–6 tests + Task 9 + Task 10. ✓
- §8 out-of-scope (no live external fetch, no 3rd Azure call, speed math locked) → respected; `timing.test.js` untouched. ✓

**2. Placeholder scan:** No TBD/TODO; every code step shows complete content. ✓

**3. Type consistency:**
- `metrics.kdNm` used consistently in candidates fixture (T3), `shortlistHtml` (T8 reads `c.metrics.kdNm`), and rank prompt wording (T3). ✓
- `provenance` shape identical across server `buildProvenance` (T6), canned fixtures (T4/T5), and reader `renderProvenance` keys `model/apiVersion/promptTemplate/tokens.total/latencyMs/requestId/mode` (T8). ✓
- `callAzureJSON` now returns `{data,usage}`; both the default path (`makeHandler`) and tests updated (T6). ✓
- Element IDs `#sources-list/#prov-stage1/#prov-stage5/#audit` created in HTML (T7) and populated in JS (T8) and asserted in E2E (T9). ✓
- Gate handlers are `async` and `addAudit` awaited so the hash chain is ordered (T8). ✓

No gaps found.
