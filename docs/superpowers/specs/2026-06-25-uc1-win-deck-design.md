# UC1 Win Deck — Design Spec

*Date: 2026-06-25 · Status: Approved (design) · Owner: Account team (Merck × Microsoft)*

## 1. Purpose

Define the storyline, content, and asset-mapping for a single integrated **"win" deck website** — a self-contained HTML slide page deployed on the existing GitHub Pages site — that presents the UC1 business analysis, value case, solution design, implementation plan, and estimates as one persuasive narrative — engineered to win a **full ~$3.21M, 5-phase UC1 engagement** commitment.

This is the assembly/sequencing spec. The underlying facts already exist and are assumed correct; this spec governs how they are arranged to persuade.

## 2. Situation (inputs that shaped this design)

| Dimension | Decision |
|---|---|
| **Near-term outcome to win** | Customer commits to the **full ~$3.21M multi-phase engagement** (not a standalone pilot) |
| **Primary audience** | **R&D / Discovery science leaders** — the value owners who will champion the spend upward to their economic buyers (IT, quality, finance, exec) |
| **Hardest objection** | *"Why commit to all 5 phases now instead of a small pilot first?"* (commitment risk) |
| **Format** | One integrated **win-deck website** (`uc1-win.html`) — a standalone page on the existing gh-pages site, linked from the business-pressures deck, reusing that deck's design system; the four UC1 docs + the estimates workbook are leave-behinds/appendices |
| **Tone** | Generic customer / R&D value-owner level — scientific and operational value, not CFO/C-suite financial framing |

## 3. Strategy

**Chosen storyline: Pressure → Proof → Commit (insight-led reframe).**

The deck opens in the customer's world (R&D pressure), then executes a **reframe** that neutralizes the central objection before it is voiced: *the real risk is not committing — it is "pilot purgatory"* (stalled POCs, lost momentum, re-mobilization cost, competitors compounding gains). It then proves UC1's value, shows feasibility lightly, and presents the **5-phase program with G0–G4 exit gates as the safe way to commit fully** — the customer gets pilot-like off-ramps (including a real Phase 1 pilot + Annex 22 baseline *inside* the commitment) without pilot-like stalls. Commercials and a specific ask close it.

**Why this approach:** audience = value owners, ask = large commitment, crux = "why not pilot." Only a structure that attacks the crux head-on wins. The two pivotal slides are **#5 (reframe)** and **#12 (gates as off-ramps)** — that is where the commitment objection dies.

**Rejected alternatives:** Value-first/outcome-led (opens vendor-push; answers the objection late and weakly); Architecture/roadmap-led (right for architects, wrong for value owners; loses the room early).

## 4. Deck storyline (16 slides + appendix)

Each slide lists its persuasive job and the source asset that feeds it.

### Act 1 — Pressure (open in their world) · *source: business-pressures deck (gh-pages), UC1-Discovery-Outcomes-Citations.md*
1. **Title** — "Accelerating Discovery, Safely — a de-risked AI-first program for R&D" (Merck × Microsoft).
2. **The pressure, quantified** — 4–6 yr discovery timelines, high late-stage failure, cost-per-launch, the $3B-by-2027 savings mandate.
3. **The cost of staying here** — delay = deferred pipeline value; competitors compounding AI advantage. Sets stakes.
4. **What "good" looks like** — the outcomes R&D leaders want: faster target→candidate, better odds, governed/auditable. Bridges to the solution.

### Act 2 — Reframe (the pivot) · *the objection-killer setup*
5. **"The real risk isn't committing — it's pilot purgatory."** — stalled POCs; 12–18 months lost to re-mobilization; value deferred while competitors compound. Reframe: speed **with** commitment, made safe by gates. **Pivotal slide.**

### Act 3 — Proof (UC1 value) · *source: UC1-Solution-Design.md, UC1-Discovery-Outcomes-Citations.md*
6. **UC1 in one picture** — the 5-agent Target ID→Rank pipeline with the human-in-the-loop gate.
7. **Outcomes, evidence-backed** — citation-backed table: timeline compression; AI Phase I success **80–90% vs 40–65%** conventional; 100% lineage; $0 incremental capex. The credibility slide.
8. **Business benefits** — the 4–5 quantified, cited business benefits.

### Act 4 — Solution (light feasibility; pre-empt IT/quality) · *source: UC1-Solution-Design.md, deck slides 8–9*
9. **How it works on Azure** — Foundry Agent Service / Fabric-OneLake / Quantum Elements / HPC at a glance. Feasibility, not a deep-dive.
10. **Protects multicloud + compliant by design** — "federate, don't migrate" four planes (Identity, Governance, Data, Control) + Annex 22 / Part 11 / ALCOA+ built in. Neutralizes architecture and quality objections early.

### Act 5 — De-risked program (commit, safely) · *source: UC1-Solution-Implementation-Plan.md*
11. **The program** — 5 phases, ~15 months: govern → pilot → orchestrate → federate → scale.
12. **Your off-ramps: G0–G4 gates** — every phase ends in a customer go/no-go with explicit exit criteria; **Phase 1 still delivers a working pilot + Annex 22 baseline — the pilot lives *inside* the commitment.** **Pivotal slide — direct answer to "why not pilot first."**
13. **What we prove by when** — phase KPIs; manual baseline documented before each go-live.

### Act 6 — Commercials + ask · *source: UC1-WBS-Estimates-Staffing.xlsx*
14. **Investment** — $3.21M total / 11,190 hrs / by-phase split / ≈$261/hr blended; onshore-led + heavy offshore; staged and **unlocked at each gate**; excludes Azure consumption.
15. **Commit now vs pilot-first** — side-by-side: time-to-value, total cost, team continuity, momentum. **Quantify the cost of waiting using the customer's own timeline numbers** so the "commit now" math is theirs.
16. **The ask + next steps** — approve the program; fund Phase 0 now; name sponsor + gate owners; 30-day mobilization plan.

### Appendix / leave-behinds
- The four UC1 documents and the estimates workbook (as formal attachments).
- RACI (Implementation Plan §6); risks & mitigations (§11); dependencies & assumptions (§12).

## 5. Design principles & guardrails

- **Two slides carry the win (#5, #12).** Everything else supports them. Do not bury or shorten them.
- **Make the "commit now" math the customer's**, not the vendor's (slide 15 uses their timeline/value numbers).
- **One quantified, cited claim per proof slide** — credibility comes from the citations already gathered; do not overload.
- **Tone: value-owner, not C-suite.** Lead with scientific/operational value; the $3.21M is presented as a staged, gated investment, not a finance pitch.
- **Pre-empt, don't dodge, the IT/quality objections** (slide 10) so champions can defend the plan upward.
- **Every slide traces to an existing asset** (mapping above) — no unsupported claims.

## 6. Success criteria

1. A reviewer who only reads slides 5 and 12 understands why full commitment beats a standalone pilot.
2. Every value/proof claim on slides 7–8 is backed by a citation already in the Outcomes brief.
3. Commercials (slide 14) reconcile exactly to the workbook ($3.21M / 11,190 hrs / phase splits).
4. The deck stands alone in ~16 slides; the docs/workbook are appendices, not required reading.
5. The ask (slide 16) is specific and time-bound (approve program, fund Phase 0, name owners, 30-day mobilization).

## 7. Assumptions & open items

- The customer has **already seen the business-pressures deck**; Act 1 recaps rather than introduces it. *(Confirm; if not, Act 1 expands slightly.)*
- The research/facts in the existing artifacts are **correct and current** (explicit user instruction: "assuming the research is correct").
- Branding/template: **reuse the existing business-pressures deck's design system** (green/gold Merck palette, Fraunces + Inter type, the 1280×720 scaled-stage slide scaffold, and the built-in navigation) so the win deck reads as a native continuation of the same site.
- Out of scope: UC2/UC3 (deck references three use cases but only UC1 is built out); Azure consumption pricing; Merck-side internal effort.
