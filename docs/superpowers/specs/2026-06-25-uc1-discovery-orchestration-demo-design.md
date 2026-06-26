# UC1 Discovery Orchestration — Live Demo App · Design Spec

*Companion to: `UC1-Solution-Design.md`, `UC1-Discovery-Outcomes-Citations.md` · Source deck: [Merck AI-First — Three Use Cases](https://rajesh-ms.github.io/aifirstbeta-pharma/#1)*

| | |
|---|---|
| **Document** | Design Spec — UC1 Live Demo App |
| **Use case** | UC1 — Multi-Step Discovery Orchestration (R&D / Discovery) |
| **Status** | Draft v1.0 |
| **Date** | 25 June 2026 |
| **Hero outcome** | **Accelerating the speed of discovery** (4–6 yr → 12–18 mo to clinic) |

---

## 1. Purpose & scope

Build an interactive **demo app** that brings UC1 to life: a governed, multi-step agentic drug-discovery pipeline whose **single most important message is the acceleration of discovery speed**. The app dramatizes how AI agents compress a 4–6 year discovery-to-clinic timeline toward ~12–18 months, while a mandatory human gate keeps every regulated decision human-owned.

The demo serves **two layered audiences over one pipeline run**:
- **Executive lens** (primary) — the business value, led by speed-to-clinic, supported by revenue protection and governed trust.
- **Technical lens** (secondary) — how the Azure multi-agent orchestration actually runs the pipeline.

**In scope:** a runnable single-page app + thin backend; one on-narrative scenario; two real Azure OpenAI calls and three simulated stages; a human approval gate; live speed/outcome instrumentation.

**Out of scope:** real structure prediction (AlphaFold3/GPU), a real Foundry Agent Service deployment, wet-lab/LIMS integration, UC2/UC3, authentication, multi-user state, production hardening.

---

## 2. Audience & goals

A viewer should walk away convinced that:
1. **Discovery gets dramatically faster** — months collapse into minutes on screen; ~4× faster to clinic, ~4.5 years saved (illustrative, benchmark-grounded).
2. **More validated candidates reach the clinic per cycle** — more "shots on goal" before the 2028 cliff.
3. **Speed does not cost control** — the human owns the wet-lab call (four-eyes, Annex 22); everything is traced (Part 11 / ALCOA+).
4. **It runs on Azure** — and the real Azure OpenAI calls at Stages 1 & 5 prove it is wireable, not just a mockup.

---

## 3. Scenario

**Designing a next-generation immuno-oncology antibody against an emerging checkpoint target (TIGIT, with LAG-3 as an alternate) to refill the pipeline after Keytruda** — itself an anti-PD-1 antibody. This is the demo's concrete, credible storyline and grounds the LLM prompts, the candidate data, and the narrative.

---

## 4. Architecture (Approach A — SPA + thin proxy + simulated fallback)

```
Browser SPA  ──(stages 1 & 5)──►  Node/Express proxy  ──►  Azure OpenAI (real)
   │  pipeline engine · lens toggle · speed instrumentation · human gate
   └──(no backend / no key)──►  bundled canned responses  (still fully demoable)
```

- **Front-end:** vanilla HTML/CSS/JS single-page "command center," no build step, styled with the deck's Microsoft/Merck palette. Holds run state, lens toggle, animation/timing, the human gate, and all meters.
- **Backend:** a single `server.js` (Express) that (a) serves the static front-end and (b) exposes two API routes that forward to Azure OpenAI using a key held server-side in a gitignored `.env`. The key never reaches the browser.
- **Fallback:** if the backend is unreachable or no Azure key is configured, the two real stages use bundled canned JSON and show a subtle "simulated" badge. The demo therefore runs anywhere — including GitHub Pages in fully-simulated mode — and never breaks live.

**Why this approach:** real Azure calls with a server-side key (credible + safe), graceful degradation (reliable), on-theme, and `npm start` to run. Chosen over a full Azure deployment (too heavy/flaky for a demo) and browser-side bring-your-own-key (exposes the key, Azure OpenAI CORS friction).

---

## 5. The two real Azure OpenAI calls

Both use low temperature and request structured JSON for demo determinism. Env vars: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`.

### 5.1 `POST /api/target-id` — Stage 1 (Target ID & validation)
- **Input:** program context — disease area (immuno-oncology), intent ("refill the pipeline after Keytruda"), optional target hint.
- **Output (JSON):** validated target (e.g., TIGIT), mechanism of action, 3–5 evidence bullets, a confidence score, and a **human-framed go/no-go recommendation**.
- **Role in demo:** sets a credible "this is real, grounded AI" tone up front; feeds the Stage 1 card and the opening narrative.

### 5.2 `POST /api/rank` — Stage 5 (Rank → human gate)
- **Input:** the simulated shortlist of surviving candidates with computed properties (affinity/KD, developability, tox flags, docking score).
- **Output (JSON):** a ranked ordering with a **per-candidate rationale** and an **overall recommendation** for the four-eyes human gate.
- **Role in demo:** the dramatic climax — the ranked shortlist a human approves. Reinforces "AI recommends, human decides."

The **Technical lens** exposes the raw request/response payloads for both calls.

---

## 6. Simulated data & scientific content (`fixtures/`)

- **`scenario-tigit.json`** — target, program metadata, and the **traditional-vs-AI timing table** that is the single source of truth for the speed band, the discovery clock, and the per-stage time stamps.
- **Stages 2–4 scripted content:**
  - Stage 2 (generative design): ~240 candidate antibody scaffolds/sequences (RFdiffusion/IgLM/Protillion/Variational framing).
  - Stage 3 (structure & docking): mock AlphaFold3 / ABodyBuilder structures + docking scores.
  - Stage 4 (in-silico triage): synthesizability + toxicity filters (Azure Quantum Elements framing) narrowing 240 → **7 advance**.
- **`candidates.json`** — candidate objects: id, sequence snippet, predicted affinity (KD), developability score, tox flags, docking score — enough for the Stage 5 ranking to read as real.
- **`canned-stage1.json` / `canned-stage5.json`** — realistic fallback responses matching the real-call output schema, used when no Azure key is present.

---

## 7. UI design (Layout A — lens-toggle command center, speed-led)

- **Top bar:** program title + scenario subtitle, the **Executive ⇄ Technical** lens toggle, and a live **discovery clock** (elapsed time, ticking through the run).
- **Hero speed band (Executive lens):** a faded "Traditional discovery → clinic: 4–6 years" track with a bright "AI-orchestrated: ~14 months" bar overlaid, headlined **≈ 4× faster · ~4.5 yrs saved**.
- **Pipeline row:** the five stages (🎯 Target ID → 🧬 Gen design → 🔬 Structure & docking → ⚖️ In-silico triage → 👥 Rank → human gate), each showing a **traditional → AI-accelerated time stamp** (e.g., Target ID *6–12 mo → 6 min*; Triage *weeks → 90 min*). Stages 1 & 5 carry a **"REAL · Azure OpenAI"** badge.
- **Supporting meters (Executive lens):** validated candidates this cycle (240→7 funnel), revenue exposure addressed (~46% · $29.5B at the Keytruda LOE), and decisions traced (100% · Annex 22 · Part 11 / ALCOA+).
- **Human gate card:** "Approve the ranked shortlist (four-eyes · Annex 22)" with **Approve** and **Send back** actions.
- **Technical lens (toggle):** replaces the meters/hero region with the **architecture planes** (Orchestration · Foundation models · Compute · Data · Governance), per-stage **agent traces**, the A2A/MCP calls, **Entra Agent ID + Purview lineage** badges, and the two real request/response payloads. Lens toggle shares run state at any time.

---

## 8. Run flow, human gate & speed instrumentation

1. Presenter clicks **Run discovery**.
2. The engine steps through stages with animated delays; the **discovery clock ticks**, each completed stage stamps its time-saved, and the meters animate (candidate funnel narrows, the time-to-clinic bar visibly compresses).
3. Stages 1 and 5 call the backend (or fall back to canned JSON); a spinner shows while awaiting.
4. At Stage 5 the pipeline **pauses at the human gate**. The ranked shortlist + rationale (from the real call) is presented.
5. **Approve** → "approved candidates → wet-lab (the scientist owns the call)" + a final summary (≈4× faster, N candidates advanced, 100% traced). **Send back** demonstrates a real human veto and re-runs the rank.
6. **Speed is data-driven:** the hero band, clock, and per-stage stamps all read from the one timing table in `scenario-tigit.json`, so the speed story is internally consistent.

---

## 9. Tech stack, structure & how to run

**Stack:** Node + Express (serves static + two API routes); vanilla HTML/CSS/JS front-end (no bundler/build step); dependencies kept light (`express`, `dotenv`, native `fetch`).

```
demo/uc1-discovery-orchestration/
  server.js              # express: static + /api/target-id + /api/rank
  .env.example           # Azure OpenAI vars (real .env is gitignored)
  package.json
  public/
    index.html           # command-center shell
    css/theme.css        # deck palette / Segoe UI
    js/app.js            # pipeline engine, lens toggle, gate, meters, clock
    js/azure.js          # client calls to /api with canned fallback
  fixtures/
    scenario-tigit.json
    candidates.json
    canned-stage1.json
    canned-stage5.json
  README.md              # run + Azure key setup + manual demo checklist
```

**Run:** `npm install && npm start`, then open the served localhost URL. Set Azure keys in `.env` (copied from `.env.example`) to enable the real calls; omit them to run fully simulated. Lives under `demo/` alongside the UC1 docs; runs on GitHub Pages in simulated mode.

---

## 10. Error handling & fallback

- On boot, `server.js` validates env and **logs which mode it is in** (live Azure vs simulated).
- Any `/api` error, timeout, or missing key → the client transparently uses the canned JSON and shows a subtle **"simulated"** badge; the demo never breaks.
- Azure errors are caught with graceful messages; request timeouts are bounded so a slow call cannot stall the demo.

---

## 11. Testing

Lightweight, using Node's built-in `node --test` (repo has no test tooling today; no heavy framework added):
- The two route handlers: mocked Azure response → correct output shape; missing key → fallback path taken.
- Fixture-shape check: canned Stage 1/5 fixtures match the schema the UI consumes.
- A manual demo run-through checklist in the README (run → stages animate → gate pauses → approve → summary; and the simulated-fallback path).

---

## 12. Business-outcome grounding & claims integrity

Grounded in `UC1-Discovery-Outcomes-Citations.md` and the source deck:
- **12–18 months to clinic vs 4–6 year norm** — an **industry benchmark, illustrative**, not a guaranteed Merck result.
- **More validated candidates per cycle** — supported by the 173-AI-programs / higher Phase I success data.
- **~46% revenue exposure** — Keytruda = $29.5B of $64.2B 2024 sales; US patent expires Dec 2028. "Addressed/protected" = the exposure the use case targets, not a measured result.
- **Annex 22 / Part 11 / ALCOA+** — GenAI prohibited for critical GxP decisions; human-in-the-loop mandatory.

**Claims-integrity rule for the demo:** the on-screen speed figures (e.g., "6 min," "≈4× faster," "~14 months") are **illustrative demo values grounded in the published benchmark**, not guaranteed outcomes. The app labels them as illustrative so the demo informs without overclaiming — consistent with the deck's *Assumptions vs Facts vs Must-Validate* ethos.

---

## 13. Open items to confirm during implementation

- Exact Azure OpenAI deployment/model name available to the presenter (set in `.env`).
- Final per-stage illustrative timings (tunable in `scenario-tigit.json`).
- Whether to surface a small "scenario picker" (TIGIT ↔ LAG-3) or hard-code TIGIT for v1 (default: hard-code TIGIT, keep the data structured so a picker is a later add).
