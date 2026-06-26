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
