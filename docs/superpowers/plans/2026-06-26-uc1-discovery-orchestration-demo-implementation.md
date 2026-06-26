# UC1 Discovery Orchestration — Live Demo App · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable, speed-led single-page demo of the UC1 governed discovery pipeline (PVRIG/CD112R antibody program) with two real Azure OpenAI calls, three simulated stages, and a two-step human gate.

**Architecture:** A vanilla HTML/CSS/JS single-page "command center" drives a five-stage pipeline animation, an Executive⇄Technical lens toggle, and a live speed/outcome readout. A thin Node/Express backend serves the static app and exposes two API routes (`/api/target-id`, `/api/rank`) that forward to Azure OpenAI with a server-side key. The **client owns fallback**: on any non-OK/timeout/parse failure (including a static 404 on GitHub Pages where no server exists) it loads bundled canned JSON and flips a "simulated" badge. All speed numbers derive from one timing table so the story is internally consistent.

**Tech Stack:** Node ≥ 20 (native `fetch`, `AbortSignal.timeout`, built-in `node --test`), Express 4, dotenv, ES modules (browser + server). No bundler, no front-end framework, no test framework beyond `node:test`/`node:assert`.

---

## Companion documents (read before starting)

- **Spec (source of truth):** `docs/superpowers/specs/2026-06-25-uc1-discovery-orchestration-demo-design.md`
- **Domain ground truth:** `UC1-Solution-Design.md`, `UC1-Discovery-Outcomes-Citations.md`
- All on-screen speed figures are **illustrative, benchmark-grounded** — never present them as guaranteed Merck outcomes (spec §12).

## Decisions locked in (resolving the spec review's deferred items)

These were flagged by the spec review as "resolve in the implementation plan." They are decided here; do not re-open them while implementing.

1. **Single fallback contract = client-owned.** The server returns **live** JSON only when Azure is configured and succeeds; otherwise it returns a non-2xx status (`501` not-configured, `502` Azure error). The browser's `js/azure.js` is the *only* place that falls back to canned JSON and sets `mode:'simulated'`. This makes "local server without key" and "GitHub Pages static 404" behave identically.
2. **Fixtures live under `public/fixtures/`** (not a sibling of `public/`), so the same relative `./fixtures/*.json` URLs resolve under Express *and* under a GitHub Pages subpath. This is a deliberate refinement of the spec's file tree (§9).
3. **Node ≥ 20** pinned via `engines.node` and the README (native `fetch`/`AbortSignal.timeout`).
4. **Two real Azure calls only.** Stage-5 "Send back" re-rank uses a **canned alternate** ranking (simulated) — it does not add a third real call.
5. **Speed numbers derive from one baseline:** `traditionalYears: 6`, `acceleratedMonths: 18` ⇒ `speedMultiplier: 4`, `yearsSaved: 4.5`. A test enforces this arithmetic so the hero can never drift.
6. **Two-step four-eyes gate:** a Reviewer **Recommends**, then a separate Approver **Approves**; either can **Send back**.
7. **Test layout:** add a `test/` dir and a `lib/`-free server that exports `buildApp()` and pure helpers for unit testing — a small, reasonable refinement of the spec tree.

## Final file structure

```
demo/uc1-discovery-orchestration/
  package.json            # type:module, engines.node>=20, scripts: start, test
  .env.example            # Azure OpenAI vars (real .env gitignored)
  .gitignore              # .env, node_modules
  server.js               # express: static + /api/target-id + /api/rank; exports buildApp(), azureConfigured(), callAzureJSON(), prompt builders
  public/
    index.html            # command-center shell
    css/theme.css         # deck palette / Segoe UI
    js/app.js             # run state, orchestration engine, lens toggle, clock, meters, two-step gate
    js/azure.js           # client /api calls + canned fallback (exports decideFallback, runStage)
    fixtures/
      scenario-pvrig.json # program + speed timing table (single source of truth) + stages + funnel
      candidates.json     # 7 advanced candidate objects
      canned-stage1.json  # fallback body for /api/target-id
      canned-stage5.json  # fallback body for /api/rank
  test/
    timing.test.js        # speed arithmetic consistency
    fixtures.test.js      # candidate + canned fixture shapes
    server.test.js        # route handlers: 501 no-key; 200 shape with stubbed azure caller
    fallback.test.js      # client decideFallback() truth table
  README.md               # run modes, Azure setup, manual demo checklist, Definition of Done
```

## Data contracts (used across many tasks — refer back here)

**`POST /api/target-id` → 200**
```json
{ "mode": "live", "stage": 1, "latencyMs": 1421,
  "target": { "name": "PVRIG (CD112R)", "mechanism": "string",
    "evidence": ["string", "string"], "confidence": 0.0,
    "recommendation": "go", "recommendationText": "string" } }
```

**`POST /api/rank` → 200**
```json
{ "mode": "live", "stage": 5, "latencyMs": 1888,
  "ranking": [ { "id": "AB-014", "rank": 1, "rationale": "string" } ],
  "overallRecommendation": "string" }
```

**Candidate object (`candidates.json`)**
```json
{ "id": "AB-014", "name": "string", "target": "PVRIG (CD112R)",
  "sequenceSnippet": "EVQLVESGGGLVQ…", "kdNm": 3.2,
  "developabilityScore": 86, "interfaceScore": 0.81,
  "toxFlags": [], "triageStatus": "advanced", "stage4Reason": "string" }
```

Field semantics: `kdNm` = predicted dissociation constant in nanomolar (**lower = stronger binding**); `developabilityScore` 0–100 (**higher better**); `interfaceScore` 0–1 AlphaFold-Multimer ipTM proxy (**higher better**); `toxFlags` empty = clean; `triageStatus` ∈ {`advanced`,`dropped`}.

---

## Task 1: Project scaffold

**Files:**
- Create: `demo/uc1-discovery-orchestration/package.json`
- Create: `demo/uc1-discovery-orchestration/.env.example`
- Create: `demo/uc1-discovery-orchestration/.gitignore`
- Create: `demo/uc1-discovery-orchestration/public/fixtures/.gitkeep`
- Create: `demo/uc1-discovery-orchestration/test/.gitkeep`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "uc1-discovery-orchestration-demo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "start": "node server.js",
    "test": "node --test"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Azure OpenAI — copy this file to .env and fill in to enable the two REAL calls.
# Leave AZURE_OPENAI_API_KEY blank (or delete .env) to run in fully-simulated mode.
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-10-21
PORT=3000
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
node_modules/
.env
```

- [ ] **Step 4: Create placeholder keep-files** so empty dirs commit.

Create `public/fixtures/.gitkeep` and `test/.gitkeep`, each containing a single newline.

- [ ] **Step 5: Install dependencies**

Run: `cd demo/uc1-discovery-orchestration && npm install`
Expected: `node_modules/` created; `express` and `dotenv` resolved; no vulnerabilities blocking.

- [ ] **Step 6: Commit**

```bash
git add demo/uc1-discovery-orchestration/package.json demo/uc1-discovery-orchestration/package-lock.json demo/uc1-discovery-orchestration/.env.example demo/uc1-discovery-orchestration/.gitignore demo/uc1-discovery-orchestration/public/fixtures/.gitkeep demo/uc1-discovery-orchestration/test/.gitkeep
git commit -m "chore(uc1-demo): scaffold project (package.json, env, gitignore)"
```

---

## Task 2: Scenario timing fixture + consistency test

This fixture is the **single source of truth** for every speed number. The test makes the hero arithmetic un-driftable (resolves review finding #10).

**Files:**
- Create: `demo/uc1-discovery-orchestration/public/fixtures/scenario-pvrig.json`
- Test: `demo/uc1-discovery-orchestration/test/timing.test.js`

- [ ] **Step 1: Write the failing test**

`test/timing.test.js`:
```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd demo/uc1-discovery-orchestration && node --test test/timing.test.js`
Expected: FAIL — `ENOENT` (scenario-pvrig.json does not exist yet).

- [ ] **Step 3: Create `public/fixtures/scenario-pvrig.json`**

```json
{
  "program": {
    "title": "Next-Gen IO Antibody — PVRIG / CD112R",
    "subtitle": "Refilling the pipeline after Keytruda",
    "target": "PVRIG (CD112R)",
    "alternateTarget": "CCR8"
  },
  "speed": {
    "traditionalYears": 6,
    "acceleratedMonths": 18,
    "speedMultiplier": 4,
    "yearsSaved": 4.5
  },
  "funnel": { "generated": 240, "advanced": 7 },
  "stages": [
    { "id": 1, "key": "target-id", "label": "Target ID", "icon": "🎯",
      "traditional": "6–12 mo", "accelerated": "6 min", "animationMs": 2400, "real": true,
      "headline": "Validate PVRIG as the next-gen checkpoint" },
    { "id": 2, "key": "gen-design", "label": "Gen design", "icon": "🧬",
      "traditional": "12–18 mo", "accelerated": "2 hr", "animationMs": 2600, "real": false,
      "headline": "240 candidate antibody sequences generated" },
    { "id": 3, "key": "structure", "label": "Structure & binding", "icon": "🔬",
      "traditional": "6–9 mo", "accelerated": "45 min", "animationMs": 2400, "real": false,
      "headline": "Predicted antibody–antigen interfaces" },
    { "id": 4, "key": "triage", "label": "In-silico triage", "icon": "⚖️",
      "traditional": "weeks", "accelerated": "90 min", "animationMs": 2200, "real": false,
      "headline": "Developability + manufacturability narrows 240 → 7" },
    { "id": 5, "key": "rank", "label": "Rank → human gate", "icon": "👥",
      "traditional": "weeks", "accelerated": "8 min", "animationMs": 2600, "real": true,
      "headline": "Ranked shortlist for the four-eyes gate" }
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd demo/uc1-discovery-orchestration && node --test test/timing.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/fixtures/scenario-pvrig.json demo/uc1-discovery-orchestration/test/timing.test.js
git commit -m "feat(uc1-demo): scenario timing table + consistency test"
```

---

## Task 3: Candidate + canned fixtures + shape test

**Files:**
- Create: `demo/uc1-discovery-orchestration/public/fixtures/candidates.json`
- Create: `demo/uc1-discovery-orchestration/public/fixtures/canned-stage1.json`
- Create: `demo/uc1-discovery-orchestration/public/fixtures/canned-stage5.json`
- Test: `demo/uc1-discovery-orchestration/test/fixtures.test.js`

- [ ] **Step 1: Write the failing test**

`test/fixtures.test.js`:
```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd demo/uc1-discovery-orchestration && node --test test/fixtures.test.js`
Expected: FAIL — `ENOENT` for the fixtures.

- [ ] **Step 3: Create `public/fixtures/candidates.json`**

```json
{
  "candidates": [
    { "id": "AB-014", "name": "PVR-014 (IgG1)", "target": "PVRIG (CD112R)",
      "sequenceSnippet": "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMS",
      "kdNm": 2.1, "developabilityScore": 89, "interfaceScore": 0.84,
      "toxFlags": [], "triageStatus": "advanced",
      "stage4Reason": "High interface confidence, clean liabilities" },
    { "id": "AB-031", "name": "PVR-031 (IgG1)", "target": "PVRIG (CD112R)",
      "sequenceSnippet": "QVQLQESGPGLVKPSETLSLTCTVSGGSISSYYWS",
      "kdNm": 3.4, "developabilityScore": 85, "interfaceScore": 0.80,
      "toxFlags": [], "triageStatus": "advanced",
      "stage4Reason": "Strong developability, low aggregation propensity" },
    { "id": "AB-052", "name": "PVR-052 (IgG4)", "target": "PVRIG (CD112R)",
      "sequenceSnippet": "EVQLLESGGGLVQPGGSLRLSCAASGFTFSNAWMS",
      "kdNm": 4.0, "developabilityScore": 82, "interfaceScore": 0.78,
      "toxFlags": [], "triageStatus": "advanced",
      "stage4Reason": "Balanced affinity/stability profile" },
    { "id": "AB-067", "name": "PVR-067 (IgG1)", "target": "PVRIG (CD112R)",
      "sequenceSnippet": "QVQLVQSGAEVKKPGASVKVSCKASGYTFTSYGIS",
      "kdNm": 5.6, "developabilityScore": 80, "interfaceScore": 0.75,
      "toxFlags": ["mild-deamidation"], "triageStatus": "advanced",
      "stage4Reason": "Good affinity; one monitorable sequence liability" },
    { "id": "AB-090", "name": "PVR-090 (IgG1)", "target": "PVRIG (CD112R)",
      "sequenceSnippet": "EVQLVESGGGLVKPGGSLRLSCAASGFTFSSYWMH",
      "kdNm": 6.9, "developabilityScore": 78, "interfaceScore": 0.72,
      "toxFlags": [], "triageStatus": "advanced",
      "stage4Reason": "Clean profile, moderate predicted affinity" },
    { "id": "AB-118", "name": "PVR-118 (IgG4)", "target": "PVRIG (CD112R)",
      "sequenceSnippet": "QVQLQESGPGLVKPSQTLSLTCTVSGGSISSGGYSW",
      "kdNm": 8.3, "developabilityScore": 76, "interfaceScore": 0.70,
      "toxFlags": [], "triageStatus": "advanced",
      "stage4Reason": "Acceptable developability; weaker interface" },
    { "id": "AB-203", "name": "PVR-203 (IgG1)", "target": "PVRIG (CD112R)",
      "sequenceSnippet": "EVQLVESGGGLVQPGRSLRLSCAASGFTFDDYAMH",
      "kdNm": 11.0, "developabilityScore": 74, "interfaceScore": 0.68,
      "toxFlags": ["mild-oxidation"], "triageStatus": "advanced",
      "stage4Reason": "Backup candidate; monitor oxidation site" }
  ]
}
```

- [ ] **Step 4: Create `public/fixtures/canned-stage1.json`**

```json
{
  "stage": 1,
  "latencyMs": 0,
  "target": {
    "name": "PVRIG (CD112R)",
    "mechanism": "Inhibitory receptor on T/NK cells in the DNAM-1 (CD226) axis; blocking PVRIG reactivates anti-tumor cytotoxicity, complementary to PD-1 blockade.",
    "evidence": [
      "PVRIG/CD112R is an emerging next-generation checkpoint with no failed Merck program attached.",
      "Clinically explored by COM701 (anti-PVRIG), validating the target's relevance.",
      "Complementary mechanism to anti-PD-1 (Keytruda), supporting combination strategies post-LOE."
    ],
    "confidence": 0.78,
    "recommendation": "go",
    "recommendationText": "Advance PVRIG as the lead next-gen IO target; structure-enabled antibody design recommended."
  }
}
```

- [ ] **Step 5: Create `public/fixtures/canned-stage5.json`**

```json
{
  "stage": 5,
  "latencyMs": 0,
  "ranking": [
    { "id": "AB-014", "rank": 1, "rationale": "Best predicted affinity (KD 2.1 nM) and highest interface confidence with a clean developability profile." },
    { "id": "AB-031", "rank": 2, "rationale": "Strong, well-balanced profile; low aggregation propensity supports manufacturability." },
    { "id": "AB-052", "rank": 3, "rationale": "Solid affinity/stability balance; IgG4 backbone suits a checkpoint mechanism." },
    { "id": "AB-090", "rank": 4, "rationale": "Clean liabilities; affinity moderate but developable." },
    { "id": "AB-067", "rank": 5, "rationale": "Good affinity offset by a monitorable deamidation site." },
    { "id": "AB-118", "rank": 6, "rationale": "Acceptable developability with a weaker predicted interface." },
    { "id": "AB-203", "rank": 7, "rationale": "Viable backup; oxidation liability warrants monitoring." }
  ],
  "overallRecommendation": "Advance AB-014 and AB-031 to wet-lab confirmation; hold AB-052 as backup. Human approval required before any wet-lab commitment (Annex 22)."
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd demo/uc1-discovery-orchestration && node --test test/fixtures.test.js`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/fixtures/candidates.json demo/uc1-discovery-orchestration/public/fixtures/canned-stage1.json demo/uc1-discovery-orchestration/public/fixtures/canned-stage5.json demo/uc1-discovery-orchestration/test/fixtures.test.js
git commit -m "feat(uc1-demo): candidate + canned fixtures with shape tests"
```

---

## Task 4: Backend server (`server.js`) + route tests

The server serves the static app and exposes the two real routes. It returns **live-or-error** only; the client owns fallback (Decision 1).

**Files:**
- Create: `demo/uc1-discovery-orchestration/server.js`
- Test: `demo/uc1-discovery-orchestration/test/server.test.js`

- [ ] **Step 1: Write the failing test**

`test/server.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp, azureConfigured, buildTargetIdPrompt, buildRankPrompt } from '../server.js';

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

test('azureConfigured() is false when env is missing', () => {
  delete process.env.AZURE_OPENAI_ENDPOINT;
  delete process.env.AZURE_OPENAI_API_KEY;
  delete process.env.AZURE_OPENAI_DEPLOYMENT;
  assert.equal(azureConfigured(), false);
});

test('POST /api/target-id returns 501 when Azure is not configured', async () => {
  delete process.env.AZURE_OPENAI_API_KEY;
  const app = buildApp();
  const { server, base } = await startServer(app);
  try {
    const res = await fetch(`${base}/api/target-id`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ diseaseArea: 'immuno-oncology' })
    });
    assert.equal(res.status, 501);
    const body = await res.json();
    assert.equal(body.error, 'azure-not-configured');
  } finally { server.close(); }
});

test('POST /api/rank returns a live-shaped body when the azure caller succeeds', async () => {
  process.env.AZURE_OPENAI_ENDPOINT = 'https://x.openai.azure.com';
  process.env.AZURE_OPENAI_API_KEY = 'k';
  process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
  const fakeAzure = async () => ({
    ranking: [{ id: 'AB-014', rank: 1, rationale: 'top' }],
    overallRecommendation: 'advance AB-014'
  });
  const app = buildApp({ azureCall: fakeAzure });
  const { server, base } = await startServer(app);
  try {
    const res = await fetch(`${base}/api/rank`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ target: 'PVRIG (CD112R)', candidates: [] })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.mode, 'live');
    assert.equal(body.stage, 5);
    assert.equal(typeof body.latencyMs, 'number');
    assert.equal(body.ranking[0].id, 'AB-014');
  } finally { server.close(); }
});

test('POST /api/rank returns 502 when the azure caller throws', async () => {
  process.env.AZURE_OPENAI_ENDPOINT = 'https://x.openai.azure.com';
  process.env.AZURE_OPENAI_API_KEY = 'k';
  process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4o';
  const app = buildApp({ azureCall: async () => { throw new Error('boom'); } });
  const { server, base } = await startServer(app);
  try {
    const res = await fetch(`${base}/api/rank`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ target: 'PVRIG (CD112R)', candidates: [] })
    });
    assert.equal(res.status, 502);
  } finally { server.close(); }
});

test('prompt builders mention "json" so Azure JSON mode is satisfied', () => {
  assert.match(buildTargetIdPrompt({ diseaseArea: 'io' }).user.toLowerCase(), /json/);
  assert.match(buildRankPrompt({ target: 'PVRIG', candidates: [] }).user.toLowerCase(), /json/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd demo/uc1-discovery-orchestration && node --test test/server.test.js`
Expected: FAIL — cannot import `../server.js` (module not found).

- [ ] **Step 3: Create `server.js`**

```js
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function azureConfigured() {
  return Boolean(
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_DEPLOYMENT
  );
}

export function buildTargetIdPrompt(body) {
  const { diseaseArea = 'immuno-oncology', intent = 'refill the pipeline after Keytruda', targetHint = 'PVRIG' } = body || {};
  return {
    system: 'You are a drug-discovery target-validation assistant. Respond ONLY with a JSON object.',
    user: `Validate a next-generation immuno-oncology antibody target for ${diseaseArea}. Intent: ${intent}. Candidate target: ${targetHint} (PVRIG / CD112R). ` +
      'Return a JSON object with keys: name (string), mechanism (string), evidence (array of 3 short strings), ' +
      'confidence (number 0..1), recommendation (one of "go","no-go","investigate"), recommendationText (string).'
  };
}

export function buildRankPrompt(body) {
  const { target = 'PVRIG (CD112R)', candidates = [] } = body || {};
  return {
    system: 'You are a discovery ranking assistant. Respond ONLY with a JSON object.',
    user: `Rank these antibody candidates against ${target} for advancement to wet-lab. ` +
      'Lower kdNm is stronger; higher developabilityScore and interfaceScore are better; non-empty toxFlags are penalties. ' +
      `Candidates JSON: ${JSON.stringify(candidates)}. ` +
      'Return a JSON object with keys: ranking (array of {id, rank, rationale}) covering every candidate id with unique ranks 1..N, ' +
      'and overallRecommendation (string).'
  };
}

export async function callAzureJSON({ system, user }, { fetchImpl = fetch } = {}) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, '');
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  const resp = await fetchImpl(url, {
    method: 'POST',
    headers: { 'api-key': process.env.AZURE_OPENAI_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }),
    signal: AbortSignal.timeout(8000)
  });
  if (!resp.ok) throw new Error(`azure-http-${resp.status}`);
  const data = await resp.json();
  return JSON.parse(data.choices[0].message.content);
}

function makeHandler({ stage, buildPrompt, shape, azureCall }) {
  return async (req, res) => {
    if (!azureConfigured()) return res.status(501).json({ error: 'azure-not-configured' });
    const started = Date.now();
    try {
      const out = await azureCall(buildPrompt(req.body));
      res.json({ mode: 'live', stage, latencyMs: Date.now() - started, ...shape(out) });
    } catch (err) {
      res.status(502).json({ error: String(err.message || err) });
    }
  };
}

export function buildApp({ azureCall = callAzureJSON } = {}) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));
  app.post('/api/target-id', makeHandler({
    stage: 1, buildPrompt: buildTargetIdPrompt, azureCall,
    shape: (out) => ({ target: out })
  }));
  app.post('/api/rank', makeHandler({
    stage: 5, buildPrompt: buildRankPrompt, azureCall,
    shape: (out) => ({ ranking: out.ranking, overallRecommendation: out.overallRecommendation })
  }));
  return app;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const port = process.env.PORT || 3000;
  buildApp().listen(port, () => {
    const mode = azureConfigured() ? 'LIVE Azure OpenAI' : 'SIMULATED (no Azure key)';
    console.log(`UC1 demo running at http://localhost:${port}  [mode: ${mode}]`);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd demo/uc1-discovery-orchestration && node --test test/server.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Smoke-run the server in simulated mode**

Run: `cd demo/uc1-discovery-orchestration && node server.js` (no `.env`)
Expected: logs `…[mode: SIMULATED (no Azure key)]`. Stop with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add demo/uc1-discovery-orchestration/server.js demo/uc1-discovery-orchestration/test/server.test.js
git commit -m "feat(uc1-demo): express server with two Azure routes + tests"
```

---

## Task 5: Client fallback module (`public/js/azure.js`)

Implements the single client-owned fallback contract (Decision 1). `decideFallback()` is a pure function so it can be unit-tested without a browser.

**Files:**
- Create: `demo/uc1-discovery-orchestration/public/js/azure.js`
- Test: `demo/uc1-discovery-orchestration/test/fallback.test.js`

- [ ] **Step 1: Write the failing test**

`test/fallback.test.js`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decideFallback } from '../public/js/azure.js';

test('use live response only on ok + json', () => {
  assert.equal(decideFallback({ ok: true, contentType: 'application/json; charset=utf-8' }), false);
});

test('fall back on non-ok (e.g. 501/502 from server)', () => {
  assert.equal(decideFallback({ ok: false, contentType: 'application/json' }), true);
});

test('fall back on ok-but-not-json (GitHub Pages 404 HTML, status coerced ok by host)', () => {
  assert.equal(decideFallback({ ok: true, contentType: 'text/html' }), true);
});

test('fall back when content-type is missing', () => {
  assert.equal(decideFallback({ ok: true, contentType: null }), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd demo/uc1-discovery-orchestration && node --test test/fallback.test.js`
Expected: FAIL — cannot import `../public/js/azure.js`.

- [ ] **Step 3: Create `public/js/azure.js`**

```js
// Single client-owned fallback contract.
// Live JSON is used only when the response is OK and JSON; otherwise we load
// bundled canned fixtures (works identically for a keyless local server -> 501
// and for GitHub Pages static hosting -> 404), and flag mode:'simulated'.

export function decideFallback({ ok, contentType }) {
  if (!ok) return true;
  if (!contentType || !contentType.includes('application/json')) return true;
  return false;
}

const CANNED = {
  '/api/target-id': './fixtures/canned-stage1.json',
  '/api/rank': './fixtures/canned-stage5.json'
};

async function loadCanned(apiPath) {
  const res = await fetch(CANNED[apiPath]);
  const data = await res.json();
  return { ...data, mode: 'simulated' };
}

export async function runStage(apiPath, body, { timeoutMs = 8000 } = {}) {
  try {
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (decideFallback({ ok: res.ok, contentType: res.headers.get('content-type') })) {
      return await loadCanned(apiPath);
    }
    const data = await res.json();
    return { ...data, mode: data.mode || 'live' };
  } catch {
    return await loadCanned(apiPath);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd demo/uc1-discovery-orchestration && node --test test/fallback.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full suite**

Run: `cd demo/uc1-discovery-orchestration && npm test`
Expected: PASS — all four test files (timing, fixtures, server, fallback) green.

- [ ] **Step 6: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/js/azure.js demo/uc1-discovery-orchestration/test/fallback.test.js
git commit -m "feat(uc1-demo): client fallback module with decideFallback test"
```

---

## Task 6: UI shell — `index.html` + `theme.css`

The command-center shell, styled with the deck palette (`--ms-blue #0078D4`, `--navy #1B3A5B`, `--teal #0F7B8A`, Segoe UI). Lenses are toggled by a `data-lens` attribute on `<body>`; CSS shows/hides the executive vs technical regions. UI behavior is verified manually (spec §11) plus a syntax check.

**Files:**
- Create: `demo/uc1-discovery-orchestration/public/index.html`
- Create: `demo/uc1-discovery-orchestration/public/css/theme.css`

- [ ] **Step 1: Create `public/index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>UC1 — Discovery Orchestration (Live Demo)</title>
  <link rel="stylesheet" href="./css/theme.css" />
</head>
<body data-lens="executive" data-status="idle">
  <header class="topbar">
    <div class="brand">
      <h1 id="program-title">Next-Gen IO Antibody — PVRIG / CD112R</h1>
      <p id="program-subtitle">Refilling the pipeline after Keytruda</p>
    </div>
    <div class="topbar-right">
      <span id="mode-badge" class="badge badge-live" hidden>simulated</span>
      <div class="clock" title="Live discovery clock">
        <span class="clock-label">discovery clock</span>
        <span id="clock" class="clock-value">00:00</span>
      </div>
      <div class="lens-toggle" role="group" aria-label="Lens toggle">
        <button id="lens-exec" class="lens-btn is-active" data-lens="executive">Executive</button>
        <button id="lens-tech" class="lens-btn" data-lens="technical">Technical</button>
      </div>
    </div>
  </header>

  <main>
    <!-- Hero speed band (executive) -->
    <section id="hero" class="hero exec-only">
      <div class="hero-track">
        <div class="hero-traditional"><span>Traditional discovery → clinic</span><strong id="hero-trad">4–6 years</strong></div>
        <div class="hero-ai"><span>AI-orchestrated</span><strong id="hero-ai">~18 months</strong></div>
      </div>
      <div class="hero-headline" id="hero-headline">4× faster · 4.5 yrs saved</div>
      <p class="hero-caption">Illustrative, benchmark-grounded — not a guaranteed outcome.</p>
    </section>

    <!-- Pipeline row -->
    <section class="pipeline" id="pipeline" aria-label="Discovery pipeline"></section>

    <!-- Supporting meters (executive) -->
    <section class="meters exec-only" id="meters">
      <div class="meter"><span class="meter-label">Validated candidates this cycle</span><span class="meter-value" id="funnel-value">240 → 7</span></div>
      <div class="meter"><span class="meter-label">Revenue exposure addressed</span><span class="meter-value">~46% · $29.5B</span><span class="meter-sub">Keytruda LOE (Dec 2028)</span></div>
      <div class="meter"><span class="meter-label">Decisions traced</span><span class="meter-value">100%</span><span class="meter-sub">Annex 22 · Part 11 / ALCOA+</span></div>
    </section>

    <!-- Technical lens panel -->
    <section class="technical tech-only" id="technical">
      <div class="planes">
        <span class="plane">Orchestration</span><span class="plane">Foundation models</span>
        <span class="plane">Compute</span><span class="plane">Data</span><span class="plane">Governance</span>
      </div>
      <div class="tech-badges">
        <span class="badge badge-sim">A2A / MCP · simulated</span>
        <span class="badge badge-sim">Entra Agent ID · simulated</span>
        <span class="badge badge-sim">Purview lineage · simulated</span>
        <span class="badge badge-real">Stage 1 &amp; 5 payloads · REAL</span>
      </div>
      <div class="trace-wrap">
        <h3>Agent trace <small>(simulated except the two real payloads)</small></h3>
        <ol id="trace" class="trace"></ol>
      </div>
      <div class="payloads">
        <div><h4>Stage 1 — /api/target-id</h4><pre id="payload-stage1">—</pre></div>
        <div><h4>Stage 5 — /api/rank</h4><pre id="payload-stage5">—</pre></div>
      </div>
    </section>

    <!-- Human gate -->
    <section id="gate" class="gate" hidden></section>

    <!-- Final summary -->
    <section id="summary" class="summary" hidden></section>
  </main>

  <footer class="actionbar">
    <button id="run-btn" class="primary">▶ Run discovery</button>
    <button id="reset-btn" class="ghost" hidden>Reset</button>
  </footer>

  <script type="module" src="./js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `public/css/theme.css`**

```css
:root{
  --ms-blue:#0078D4; --navy:#1B3A5B; --teal:#0F7B8A;
  --ink:#1b1b1f; --muted:#5b6470; --line:#e3e8ef; --bg:#f4f7fb; --card:#ffffff;
  --good:#107C41; --warn:#B85C00; --sim:#8a6d00;
  --font:"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font);color:var(--ink);background:var(--bg)}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;
  padding:14px 24px;background:var(--navy);color:#fff}
.brand h1{margin:0;font-size:18px;font-weight:600}
.brand p{margin:2px 0 0;font-size:13px;opacity:.85}
.topbar-right{display:flex;align-items:center;gap:16px}
.clock{display:flex;flex-direction:column;align-items:flex-end;line-height:1.1}
.clock-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;opacity:.7}
.clock-value{font-size:20px;font-variant-numeric:tabular-nums;font-weight:600}
.lens-toggle{display:flex;border:1px solid rgba(255,255,255,.4);border-radius:999px;overflow:hidden}
.lens-btn{background:transparent;color:#fff;border:0;padding:7px 14px;font:inherit;font-size:13px;cursor:pointer}
.lens-btn.is-active{background:var(--ms-blue)}
main{max-width:1080px;margin:0 auto;padding:24px}
.badge{font-size:11px;padding:3px 8px;border-radius:999px;font-weight:600}
.badge-live{background:var(--sim);color:#fff}
.badge-sim{background:#fff4d6;color:var(--sim);border:1px solid #e8d28a}
.badge-real{background:#dff3e6;color:var(--good);border:1px solid #a8d8bb}
/* lens visibility */
body[data-lens="technical"] .exec-only{display:none}
body[data-lens="executive"] .tech-only{display:none}
/* hero */
.hero{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;margin-bottom:18px}
.hero-track{display:grid;gap:8px}
.hero-traditional,.hero-ai{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-radius:10px}
.hero-traditional{background:#eef1f5;color:var(--muted)}
.hero-ai{background:linear-gradient(90deg,var(--ms-blue),var(--teal));color:#fff;width:32%;transition:width 1.2s ease}
body[data-status="running"] .hero-ai,body[data-status="gate"] .hero-ai,body[data-status="approved"] .hero-ai{width:62%}
.hero-headline{margin-top:14px;font-size:26px;font-weight:700;color:var(--navy)}
.hero-caption{margin:4px 0 0;font-size:12px;color:var(--muted)}
/* pipeline */
.pipeline{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:18px}
.stage{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;position:relative;opacity:.6;transition:opacity .3s,border-color .3s}
.stage[data-state="running"]{opacity:1;border-color:var(--ms-blue);box-shadow:0 0 0 2px rgba(0,120,212,.15)}
.stage[data-state="done"]{opacity:1}
.stage-icon{font-size:22px}
.stage-label{font-weight:600;margin:6px 0 2px;font-size:14px}
.stage-time{font-size:12px;color:var(--muted)}
.stage-time b{color:var(--teal)}
.stage-real{position:absolute;top:10px;right:10px}
.stage-headline{font-size:12px;margin-top:8px;min-height:30px;color:var(--ink)}
.spinner{width:14px;height:14px;border:2px solid var(--line);border-top-color:var(--ms-blue);border-radius:50%;display:inline-block;animation:spin .8s linear infinite;vertical-align:-2px}
@keyframes spin{to{transform:rotate(360deg)}}
/* meters */
.meters{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.meter{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px}
.meter-label{font-size:12px;color:var(--muted)}
.meter-value{font-size:24px;font-weight:700;color:var(--navy)}
.meter-sub{font-size:11px;color:var(--muted)}
/* technical */
.technical{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;display:grid;gap:16px}
.planes{display:flex;flex-wrap:wrap;gap:8px}
.plane{background:var(--navy);color:#fff;padding:6px 12px;border-radius:8px;font-size:13px}
.tech-badges{display:flex;flex-wrap:wrap;gap:8px}
.trace{margin:0;padding-left:18px;font-size:13px;color:var(--ink);max-height:200px;overflow:auto}
.trace li{margin:3px 0}
.payloads{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.payloads pre{background:#0f1b2a;color:#cfe3ff;padding:12px;border-radius:10px;font-size:11px;max-height:220px;overflow:auto;white-space:pre-wrap}
/* gate */
.gate{background:var(--card);border:2px solid var(--ms-blue);border-radius:14px;padding:20px;margin-top:18px}
.gate h2{margin:0 0 4px;font-size:18px;color:var(--navy)}
.gate .gate-step{font-size:13px;color:var(--muted);margin-bottom:12px}
.shortlist{display:grid;gap:6px;margin:12px 0}
.shortlist .row{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;padding:8px 12px;border:1px solid var(--line);border-radius:8px}
.shortlist .rank{font-weight:700;color:var(--ms-blue)}
.shortlist .kd{font-size:12px;color:var(--muted)}
.gate-actions{display:flex;gap:10px;margin-top:12px}
/* summary */
.summary{background:linear-gradient(120deg,var(--navy),var(--teal));color:#fff;border-radius:14px;padding:24px;margin-top:18px}
.summary h2{margin:0 0 12px}
.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.summary-grid div{background:rgba(255,255,255,.12);border-radius:10px;padding:14px}
.summary-grid b{display:block;font-size:24px}
/* buttons / actionbar */
.actionbar{position:sticky;bottom:0;display:flex;gap:10px;justify-content:center;padding:14px;background:rgba(244,247,251,.9);backdrop-filter:blur(4px);border-top:1px solid var(--line)}
button.primary{background:var(--ms-blue);color:#fff;border:0;border-radius:10px;padding:11px 22px;font:inherit;font-size:15px;font-weight:600;cursor:pointer}
button.ghost{background:transparent;border:1px solid var(--line);border-radius:10px;padding:11px 18px;font:inherit;cursor:pointer}
button.approve{background:var(--good);color:#fff;border:0;border-radius:10px;padding:10px 18px;font:inherit;font-weight:600;cursor:pointer}
button.sendback{background:#fff;border:1px solid var(--warn);color:var(--warn);border-radius:10px;padding:10px 18px;font:inherit;cursor:pointer}
button:disabled{opacity:.5;cursor:default}
```

- [ ] **Step 3: Verify the static page loads (manual)**

Run: `cd demo/uc1-discovery-orchestration && node server.js`, open `http://localhost:3000`.
Expected: top bar with title/subtitle, lens toggle, `00:00` clock; hero band; an empty pipeline row (filled by `app.js` in Task 7); meters; `▶ Run discovery` button. Clicking **Technical** swaps to the planes/badges/trace panel. No console errors except (until Task 7) the missing `app.js` wiring.

- [ ] **Step 4: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/index.html demo/uc1-discovery-orchestration/public/css/theme.css
git commit -m "feat(uc1-demo): command-center UI shell + theme"
```

---

## Task 7: Front-end engine (`public/js/app.js`) — state, render, run, lens, clock

Loads fixtures, renders the pipeline, runs the animated pipeline calling the two real stages (with client fallback badge), drives the discovery clock and funnel, and toggles lenses from one shared `run` state object (resolves review findings #5 run-state, #13). The two-step gate is added in Task 8.

**Files:**
- Create: `demo/uc1-discovery-orchestration/public/js/app.js`

- [ ] **Step 1: Create `public/js/app.js`**

```js
import { runStage } from './azure.js';

const run = {
  scenario: null,
  candidates: [],
  activeLens: 'executive',
  status: 'idle',            // idle | running | gate | approved
  stageStatus: {},           // id -> pending | running | done
  startedAt: 0,
  clockTimer: null,
  mode: 'live',              // flips to 'simulated' if any real stage falls back
  targetResult: null,
  rankResult: null,
  gate: { reviewer: null, approver: null },
  trace: []
};

const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function init() {
  const [scenario, candData] = await Promise.all([
    fetch('./fixtures/scenario-pvrig.json').then((r) => r.json()),
    fetch('./fixtures/candidates.json').then((r) => r.json())
  ]);
  run.scenario = scenario;
  run.candidates = candData.candidates;

  $('#program-title').textContent = scenario.program.title;
  $('#program-subtitle').textContent = scenario.program.subtitle;
  $('#hero-trad').textContent = `${scenario.speed.traditionalYears - 2}–${scenario.speed.traditionalYears} years`;
  $('#hero-ai').textContent = `~${scenario.speed.acceleratedMonths} months`;
  $('#hero-headline').textContent =
    `${scenario.speed.speedMultiplier}× faster · ${scenario.speed.yearsSaved} yrs saved`;
  $('#funnel-value').textContent = `${scenario.funnel.generated} → ${scenario.funnel.advanced}`;

  renderPipeline();
  wireControls();
}

function renderPipeline() {
  const html = run.scenario.stages.map((s) => {
    run.stageStatus[s.id] = 'pending';
    return `<article class="stage" data-id="${s.id}" data-state="pending">
      <div class="stage-icon">${s.icon}</div>
      ${s.real ? '<span class="stage-real badge badge-real">REAL · Azure</span>' : ''}
      <div class="stage-label">${s.label}</div>
      <div class="stage-time">${s.traditional} → <b>${s.accelerated}</b></div>
      <div class="stage-headline" data-headline></div>
    </article>`;
  }).join('');
  $('#pipeline').innerHTML = html;
}

function wireControls() {
  $('#lens-exec').addEventListener('click', () => setLens('executive'));
  $('#lens-tech').addEventListener('click', () => setLens('technical'));
  $('#run-btn').addEventListener('click', startRun);
  $('#reset-btn').addEventListener('click', () => location.reload());
}

function setLens(lens) {
  run.activeLens = lens;
  document.body.dataset.lens = lens;
  $('#lens-exec').classList.toggle('is-active', lens === 'executive');
  $('#lens-tech').classList.toggle('is-active', lens === 'technical');
}

function setStatus(status) {
  run.status = status;
  document.body.dataset.status = status;
}

function addTrace(msg) {
  run.trace.push(msg);
  const li = document.createElement('li');
  li.textContent = msg;
  $('#trace').appendChild(li);
}

function startClock() {
  run.startedAt = Date.now();
  run.clockTimer = setInterval(() => {
    const s = Math.floor((Date.now() - run.startedAt) / 1000);
    $('#clock').textContent =
      `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }, 250);
}
function stopClock() { clearInterval(run.clockTimer); }

function markMode(stageResult) {
  if (stageResult.mode === 'simulated') {
    run.mode = 'simulated';
    const badge = $('#mode-badge');
    badge.hidden = false;
    badge.textContent = 'simulated';
  }
}

function setStage(id, state, headline) {
  run.stageStatus[id] = state;
  const el = $(`.stage[data-id="${id}"]`);
  el.dataset.state = state;
  if (headline !== undefined) {
    el.querySelector('[data-headline]').innerHTML =
      state === 'running' ? '<span class="spinner"></span> ' + headline : headline;
  }
}

async function startRun() {
  if (run.status !== 'idle') return;
  $('#run-btn').disabled = true;
  setStatus('running');
  startClock();
  addTrace('Orchestrator: pipeline run started (PVRIG / CD112R).');

  for (const stage of run.scenario.stages) {
    setStage(stage.id, 'running', stage.headline);
    addTrace(`Stage ${stage.id} (${stage.label}) — ${stage.real ? 'REAL Azure call' : 'simulated'} started.`);

    if (stage.id === 1) {
      const res = await runStage('/api/target-id', {
        diseaseArea: 'immuno-oncology',
        intent: 'refill the pipeline after Keytruda',
        targetHint: 'PVRIG'
      });
      markMode(res);
      run.targetResult = res;
      $('#payload-stage1').textContent = JSON.stringify(res, null, 2);
      setStage(stage.id, 'done', `Target validated: ${res.target.name} — ${res.target.recommendation.toUpperCase()}`);
    } else if (stage.id === 5) {
      const res = await runStage('/api/rank', {
        target: run.scenario.program.target,
        candidates: run.candidates
      });
      markMode(res);
      run.rankResult = res;
      $('#payload-stage5').textContent = JSON.stringify(res, null, 2);
      setStage(stage.id, 'done', `Ranked ${res.ranking.length} candidates — awaiting human gate`);
      await sleep(400);
      openGate();   // defined in Task 8
      return;
    } else {
      await sleep(stage.animationMs);
      if (stage.id === 4) $('#funnel-value').textContent =
        `${run.scenario.funnel.generated} → ${run.scenario.funnel.advanced}`;
      setStage(stage.id, 'done', stage.headline);
    }
    await sleep(300);
  }
}

window.__uc1 = { run, openGate: () => openGate() }; // exposed for Task 8 wiring/manual checks
init();
```

- [ ] **Step 2: Syntax-check the browser modules**

Run: `cd demo/uc1-discovery-orchestration && node --check public/js/azure.js && node --check public/js/app.js`
Expected: no output, exit 0 (syntax valid). *Note:* `openGate` is defined in Task 8; until then, expect a `ReferenceError` at the gate in the browser — that is fixed by Task 8.

- [ ] **Step 3: Manual verify the run up to the gate**

Run: `cd demo/uc1-discovery-orchestration && node server.js` (no `.env` → simulated), open `http://localhost:3000`, click **▶ Run discovery**.
Expected: clock ticks; stages light up left→right with spinners then headlines; the **simulated** badge appears (no key); the hero AI bar widens; Stage 1 & 5 show "REAL · Azure" badges; Technical lens shows the trace + the Stage 1/5 JSON payloads. (Gate appears after Task 8.)

- [ ] **Step 4: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/js/app.js
git commit -m "feat(uc1-demo): front-end engine — state, render, run, clock, lens"
```

---

## Task 8: Two-step four-eyes gate + send-back + summary

Adds the dual-control gate (Decision 6): Reviewer **Recommends** → separate Approver **Approves**; either can **Send back**, which triggers a **simulated** alternate re-rank (no third real call — Decision 4). Append these functions to `public/js/app.js` (before the `window.__uc1` line) and remove the temporary `window.__uc1` shim.

**Files:**
- Modify: `demo/uc1-discovery-orchestration/public/js/app.js`

- [ ] **Step 1: Add gate + summary functions**

Insert before `window.__uc1 = …` in `public/js/app.js`:

```js
function candidateById(id) { return run.candidates.find((c) => c.id === id); }

function shortlistHtml() {
  return `<div class="shortlist">` + run.rankResult.ranking
    .slice().sort((a, b) => a.rank - b.rank).map((r) => {
      const c = candidateById(r.id) || { name: r.id, kdNm: '—' };
      return `<div class="row"><span class="rank">#${r.rank}</span>
        <span><strong>${c.name}</strong> — ${r.rationale}</span>
        <span class="kd">KD ${c.kdNm} nM</span></div>`;
    }).join('') + `</div>`;
}

function openGate() {
  setStatus('gate');
  renderReviewerStep();
}

function renderReviewerStep() {
  $('#gate').hidden = false;
  $('#gate').innerHTML = `
    <h2>Human gate — Step 1 of 2 · Reviewer</h2>
    <p class="gate-step">Four-eyes control (Annex 22): the Reviewer recommends; a separate Approver must confirm before any wet-lab commitment.</p>
    ${shortlistHtml()}
    <p class="gate-step"><em>${run.rankResult.overallRecommendation}</em></p>
    <div class="gate-actions">
      <button class="approve" id="reviewer-recommend">Recommend advancing</button>
      <button class="sendback" id="reviewer-sendback">Send back</button>
    </div>`;
  $('#reviewer-recommend').addEventListener('click', onReviewerRecommend);
  $('#reviewer-sendback').addEventListener('click', () => onSendBack('Reviewer'));
}

function onReviewerRecommend() {
  run.gate.reviewer = 'recommend';
  addTrace('Reviewer (Dr. A. Rao): recommended advancing the shortlist.');
  renderApproverStep();
}

function renderApproverStep() {
  $('#gate').innerHTML = `
    <h2>Human gate — Step 2 of 2 · Approver</h2>
    <p class="gate-step">A second, separate person provides the final approval (dual control). The scientist owns the wet-lab call.</p>
    ${shortlistHtml()}
    <div class="gate-actions">
      <button class="approve" id="approver-approve">Approve → wet-lab</button>
      <button class="sendback" id="approver-sendback">Send back</button>
    </div>`;
  $('#approver-approve').addEventListener('click', onApproverApprove);
  $('#approver-sendback').addEventListener('click', () => onSendBack('Approver'));
}

function onSendBack(role) {
  // Simulated alternate re-rank — demonstrates a real human veto WITHOUT a 3rd real Azure call.
  run.gate = { reviewer: null, approver: null };
  const ranking = run.rankResult.ranking.slice().sort((a, b) => a.rank - b.rank);
  if (ranking.length >= 2) {
    [ranking[0].rank, ranking[1].rank] = [ranking[1].rank, ranking[0].rank]; // swap top two
  }
  run.rankResult = {
    ...run.rankResult,
    mode: 'simulated',
    ranking,
    overallRecommendation: 'Re-ranked after human veto (simulated alternate). Top two candidates swapped for reconsideration.'
  };
  markMode(run.rankResult);
  $('#payload-stage5').textContent = JSON.stringify(run.rankResult, null, 2);
  addTrace(`${role}: sent back — simulated alternate re-rank applied (no additional Azure call).`);
  renderReviewerStep();
}

function onApproverApprove() {
  run.gate.approver = 'approve';
  addTrace('Approver (Dr. M. Chen): approved → candidates released to wet-lab. Decision traced (Annex 22 / Part 11).');
  stopClock();
  setStatus('approved');
  showSummary();
}

function showSummary() {
  const sp = run.scenario.speed;
  const top = run.rankResult.ranking.slice().sort((a, b) => a.rank - b.rank)[0];
  const topName = (candidateById(top.id) || { name: top.id }).name;
  $('#gate').hidden = true;
  const sum = $('#summary');
  sum.hidden = false;
  sum.innerHTML = `
    <h2>Discovery cycle complete${run.mode === 'simulated' ? ' (simulated)' : ''}</h2>
    <div class="summary-grid">
      <div><span>Speed to clinic</span><b>${sp.speedMultiplier}× faster</b>${sp.yearsSaved} yrs saved</div>
      <div><span>Candidates advanced</span><b>${run.scenario.funnel.advanced}</b>from ${run.scenario.funnel.generated} generated</div>
      <div><span>Decisions traced</span><b>100%</b>two-person gate · Annex 22</div>
    </div>
    <p>Lead candidate <strong>${topName}</strong> released to wet-lab — the scientist owns the call.</p>`;
  $('#run-btn').hidden = true;
  $('#reset-btn').hidden = false;
}
```

- [ ] **Step 2: Remove the temporary shim**

Delete this line from `public/js/app.js`:
```js
window.__uc1 = { run, openGate: () => openGate() }; // exposed for Task 8 wiring/manual checks
```
Leave the final `init();` call as the last line.

- [ ] **Step 3: Syntax-check**

Run: `cd demo/uc1-discovery-orchestration && node --check public/js/app.js`
Expected: exit 0, no output.

- [ ] **Step 4: Manual verify the full flow**

Run: `cd demo/uc1-discovery-orchestration && node server.js`, open `http://localhost:3000`, **▶ Run discovery**.
Expected: at Stage 5 the **Step 1 · Reviewer** card appears → click **Recommend** → **Step 2 · Approver** card → click **Send back** (shortlist re-orders, trace logs a simulated re-rank, returns to Reviewer) → **Recommend** → **Approve** → clock stops, summary band shows `4× faster · 4.5 yrs saved`, 7 advanced, lead candidate released. Technical lens shows the full trace including both gate roles.

- [ ] **Step 5: Commit**

```bash
git add demo/uc1-discovery-orchestration/public/js/app.js
git commit -m "feat(uc1-demo): two-step four-eyes gate, send-back re-rank, summary"
```

---

## Task 9: README, Definition of Done, final verification

**Files:**
- Create: `demo/uc1-discovery-orchestration/README.md`

- [ ] **Step 1: Create `README.md`**

````markdown
# UC1 — Discovery Orchestration (Live Demo)

A speed-led, governed multi-step drug-discovery demo for **UC1** (PVRIG / CD112R next-gen IO antibody program). Two stages make **real Azure OpenAI** calls (Target ID, Rank); three are simulated; a **two-step four-eyes** human gate owns the decision.

> All on-screen speed figures (e.g. "4× faster", "~18 months") are **illustrative, benchmark-grounded** — not guaranteed Merck outcomes.

## Requirements
- **Node ≥ 20** (uses native `fetch` and `AbortSignal.timeout`).

## Run

```bash
npm install
npm start        # http://localhost:3000
```

### Three run modes
| Mode | How | Behavior |
|------|-----|----------|
| **Live Azure** | copy `.env.example` → `.env`, fill all `AZURE_OPENAI_*` | Stages 1 & 5 call Azure OpenAI |
| **Simulated backend** | run `npm start` with no/blank key | Server returns 501; client uses canned JSON + "simulated" badge |
| **Static (GitHub Pages)** | serve `public/` as static files | `/api/*` 404s; client uses canned JSON; identical demo |

## Azure setup (live mode)
Set in `.env`: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` (a JSON-mode-capable deployment, e.g. `gpt-4o`), `AZURE_OPENAI_API_VERSION` (default `2024-10-21`). The key stays server-side and never reaches the browser.

## Test
```bash
npm test         # node --test: timing, fixtures, server routes, client fallback
```

## Manual demo checklist
1. `npm start`; open the URL. Title = PVRIG / CD112R program.
2. Click **▶ Run discovery** — clock ticks; five stages animate; hero AI bar widens.
3. Stages 1 & 5 show **REAL · Azure** badges; without a key a **simulated** badge appears.
4. At Stage 5: **Reviewer** card → **Recommend** → **Approver** card.
5. **Send back** once — shortlist re-orders (simulated re-rank), trace logs it, returns to Reviewer.
6. **Recommend → Approve** — clock stops; summary shows `4× faster · 4.5 yrs saved`, 7 advanced.
7. Toggle **Technical** — architecture planes, agent trace, and the two real Stage 1/5 payloads (governance badges labeled *simulated*).

## Definition of Done
- [ ] `npm start` serves the app; `npm test` is green (all four test files).
- [ ] Runs live when `.env` is configured; falls back to canned JSON (with badge) when not.
- [ ] Same `public/` runs as static files (no server) with identical behavior.
- [ ] Speed hero, per-stage stamps, and summary all derive from `scenario-pvrig.json` (4× / 4.5 yrs).
- [ ] Executive⇄Technical toggle preserves one run mid-flight and at the gate.
- [ ] Two-step gate works; Send-back re-ranks without a third real Azure call.
- [ ] No Azure key is ever exposed to the browser.
````

- [ ] **Step 2: Full test suite**

Run: `cd demo/uc1-discovery-orchestration && npm test`
Expected: PASS — all four files (timing, fixtures, server, fallback), 0 failures.

- [ ] **Step 3: Final manual pass**

Walk the README "Manual demo checklist" end to end in simulated mode; then (optional, if creds available) set `.env` and confirm Stage 1 & 5 show no simulated badge and payloads contain live Azure content.

- [ ] **Step 4: Commit**

```bash
git add demo/uc1-discovery-orchestration/README.md
git commit -m "docs(uc1-demo): README with run modes, manual checklist, DoD"
```

---

## Self-Review (completed by plan author)

**1. Spec coverage** — every spec section maps to a task:
- §1–2 Purpose/audience/goals → realized across Tasks 6–8 (speed hero, two lenses, governed gate, real Azure badges).
- §3 Scenario (PVRIG/CD112R) → Tasks 2–3 fixtures + Task 7 prompts.
- §4 Architecture (SPA + thin proxy + fallback) → Tasks 4 (server), 5 (client fallback), 6–8 (SPA).
- §5 Two real Azure calls → Task 4 routes + Task 7 wiring; JSON-mode + timeout pinned (resolves review feasibility flag).
- §6 Simulated data → Tasks 2–3 (scenario, candidates, canned).
- §7 UI Layout A (lens toggle, speed-led) → Tasks 6–7.
- §8 Run flow + two-step gate + speed instrumentation → Tasks 7–8.
- §9 Stack/structure/run → Tasks 1, 9 (Node ≥20 pinned — resolves review finding).
- §10 Error handling/fallback → Tasks 4–5 (single client-owned contract — resolves ambiguity findings #11/#12).
- §11 Testing → Tasks 2–5 (`node --test`) + Task 9 manual checklist.
- §12 Claims integrity → hero caption + README banner.
- §13 Open items → resolved in "Decisions locked in".

**2. Placeholder scan** — no `TBD`/`TODO`/"add error handling"/"similar to Task N"; every code step shows complete code; every command shows expected output.

**3. Type consistency** — response field names (`mode`,`stage`,`latencyMs`,`target.{name,mechanism,evidence,confidence,recommendation,recommendationText}`,`ranking[].{id,rank,rationale}`,`overallRecommendation`) and candidate fields (`id,name,target,sequenceSnippet,kdNm,developabilityScore,interfaceScore,toxFlags,triageStatus,stage4Reason`) are identical across fixtures, server, tests, and `app.js`. `decideFallback`/`runStage`/`buildApp`/`azureConfigured`/`buildTargetIdPrompt`/`buildRankPrompt` names match between source and tests.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-26-uc1-discovery-orchestration-demo-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
