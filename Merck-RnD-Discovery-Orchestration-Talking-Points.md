# Speaker Talking Points — Merck AI-First: Three Use Cases

**Deck:** `Merck-AI-First-Three-Use-Cases` — 15 slides (Microsoft × MSD · Account Pursuit · Confidential)
**Audience:** Merck (MSD) R&D, Regulatory & Quality leadership + C-suite sponsors
**Full runtime:** ~22–26 min — or present **any one use-case block in ~9–11 min** (each stands alone)
**Spine thesis (slide 2):** *"Generation is solved. The gate is governance."* — one **Governed Human & Trust Layer** over the multicloud AI Merck already owns. **Integrate, don't displace.**
**Operating principle, every slide:** AI accelerates; **a human owns every regulated decision.**

> Provenance tags: `[slide]` = printed on the slide · `[brief]` = Company Intelligence Brief · `[design]` = architecture proposal.
> Exec quotes on the C-Suite slides are **persona-lens framing** (the outcome each leader buys), not verbatim public statements.

## Deck map
| # | Block | Slide |
| --- | --- | --- |
| 1 | — | Cover — *AI-First Architecture at Merck* |
| 2 | — | The Through-Line — *Generation is solved. The gate is governance.* |
| 3–6 | **UC1 · Discovery (R&D)** | What it is → Future State → Personas → C-Suite |
| 7–10 | **UC2 · Regulatory Authoring** | What it is → Future State → Personas → C-Suite |
| 11–14 | **UC3 · Manufacturing Quality (GxP)** | What it is → Future State → Personas → C-Suite |
| 15 | — | The Ask — *Three copilots. One governance spine.* |

---

## Slide 1 — Cover · "AI-First Architecture at Merck"
**Goal:** Set the frame in two sentences. *(~30–45s)*
- "One **Governed Human & Trust Layer** over the multicloud AI Merck already owns — applied across **three points of the value chain**: **Discovery, Authoring, Deviation.** **Integrate, don't displace.**"
- "Three copilots, one governance spine — all in service of **refilling the pipeline before 2028**."

## Slide 2 — The Through-Line · "Generation is solved. The gate is governance."
**Goal:** Pre-empt the "why not just use Gemini?" reflex and license adopting one, two, or all three. *(~1–1.5 min)*

**Say `[slide]`:**
- "Merck has already bet **~$1B+ on multicloud agentic AI** — Gemini, Bedrock, GPTeal. **The models work — we're not rebuilding them.**"
- "Each of these three copilots closes a **different gap** today's AI leaves open in *regulated* work, and **each stands on its own.** What connects them is a shared **governance spine** — one connected story, **not a dependency.**"
- Spine components to point at: **Azure AI Foundry · Entra Agent ID · Purview lineage · human-in-the-loop / four-eyes · Annex 22 · Part 11 / ALCOA+ · OneLake shortcuts (read S3 + GCS in place).**

**Transition:** "Adopt one, two, or all three. Let's start with Discovery."

---

# Part 1 · Use Case 1 — Discovery (R&D) · slides 3–6
*Block thesis: federate, don't migrate — compress discovery from **4–6 years → 12–18 months to clinic**, inspection-ready from day one.*

## Slide 3 — UC1 · Discovery · *What it is* — "Multi-Step Discovery Orchestration"
**Goal:** Land the problem, the mechanism, and the operating principle. *(~90s–2 min)*

**Open (hook):** "Merck's biggest value lever is **R&D speed** — and the clock is running. The **2028 Keytruda cliff** puts **~46% of revenue** in play *(~$29.5B — `[brief]`)*, and discovery still runs **4–6 years to clinic** with too few validated candidates per cycle."

**Say — the three cards `[slide]`:**
- **The problem** — refill the pipeline before 2028; too slow, too thin on validated candidates.
- **What it does** — "A **cloud-centric platform for *governed agentic* drug discovery.** Agents run **Target ID → generative design → structure & docking → in-silico triage** and hand a **ranked shortlist to a human gate** before any wet-lab work."
- **The principle** — "**AI triages at portfolio scale; the scientist owns the wet-lab call** — four-eyes, Annex 22."

**At a glance:** **12–18 mo to clinic** vs 4–6 yr · **more candidates validated per cycle** · **~46% of revenue protected.**

**$ Dollar impact (illustrative `[design]`):** at the public keystone of **~$1–3M per day earlier to market**, pulling a program forward even **6–12 months** on the discovery leg ≈ **~$180M–$1.1B per successful asset.** Reducing effort/risk: pre-lab in-silico triage avoids **late-stage failures (~$100–300M sunk trial cost each)**, and **burst HPC replaces a multi-$10M on-prem GPU build.**

**Models/partners — make the federation point, don't read the list:** "Multi-vendor by design — ESM, AlphaFold3, Boltz-2, IgLM, RFdiffusion alongside **Protillion, Variational, Gemini** and **Azure Quantum Elements.** We orchestrate across them."

**Transition:** "Here's what that platform looks like."

**If asked — "We signed ~$1B with Google Cloud; why Azure?"** `[brief]` — "We don't displace Gemini; the architecture *calls* it as a federated agent. Azure adds the orchestration spine and the audit trail."

## Slide 4 — UC1 · Discovery · *Future State* — "Cloud-Centric Platform — governed agentic discovery"
**Goal:** Prove "fast + governed + federated" is one coherent design. Slow down here. *(~3–4 min — anchor)*

**Open:** "One screen: compress **4–6 years to 12–18 months to clinic** — and keep every regulator happy."

**Pipeline (top):** Target ID → Generative design → Structure & docking → In-silico triage → **Rank → human gate.** "An agent runs the chain; a human owns the gate."

**Four planes `[slide]`:**
- **Orchestration** — **Foundry Agent Service** runs the multi-agent chain; **A2A** *calls* Gemini / Protillion / Variational (federation in action); human-in-the-loop = four-eyes before wet-lab (Annex 22).
- **Foundation models** — **Foundry catalog + Azure ML** (ESM · AlphaFold3 · Boltz-2 · IgLM · RFdiffusion); **Azure Quantum Elements** (gen-chem + tox, **~20× DFT**); **federated partner models.**
- **Compute** — **ND-series GPU HPC**, **CycleCloud / Azure Batch**, **burst on-demand** — no on-prem rebuild.
- **Data** — **Fabric / OneLake shortcuts read S3 + GCS *in place* (GA)**; **Azure Health Data Services** (Mayo multimodal); **AI Search** hybrid RAG.

**Governance rail (close):** **Entra Agent ID · Purview lineage · Defender · Azure Arc · Part 11 / ALCOA+ ready.** "Cross-cutting across all planes — **not bolted on.**"

**Proof point — say it:** "**OneLake reads your AWS & Google data where it lives.** *That's* federate, don't migrate — no data exodus, no re-platforming tax."

**Outcome bar:** more validated candidates/cycle · **12–18 mo vs 4–6 yr** · human owns the wet-lab call.

**Transition:** "Architecture only matters if people can run it — here's who."

**If asked — "Isn't this Azure lock-in?"** — "Opposite — **Arc, OneLake shortcuts and A2A are explicitly multicloud.** You keep optionality and your contracts."

## Slide 5 — UC1 · Discovery · *Personas* — "Decisions the copilot supports, not replaces"
**Goal:** Show AI changes *what scientists decide*, not whether they're needed. *(~2–3 min)*

**Open:** "AI doesn't replace your scientists — it changes what they spend their day **deciding**."

**Framing line `[slide]`:** "*An AI copilot that assists the **discovery scientist & protein-design engineer** by synthesizing **target + multimodal data**, flagging **non-synthesizable or toxic candidates**, and recommending **a ranked shortlist** — the human retains scientific accountability.*"

**Swim-lane:** Target ID → Generative design (scaffolds·sequences) → Structure & docking (**AlphaFold3 · ABodyBuilder**) → In-silico triage → **Human gate (four-eyes · Annex 22)** → **Wet-lab call (scientist owns).** "Everything is traced."

**Two columns (the heart):**
- **Decisions a human owns:** which candidates advance to wet-lab (Discovery Scientist) · target go/no-go · which scaffolds/sequences to synthesize (Protein-Design Engineer) · approve the ranked shortlist (four-eyes).
- **New roles:** in-silico triage scientist (agent workbench over Foundry) · model-catalog curator & biologics agent-ops engineer · HPC cost steward (no capex).

**Key message:** "**AI proposes at portfolio scale; the human disposes on the regulated call** — trainable, auditable, and it **creates new roles.**"

**Transition:** "So why should the C-suite fund it?"

**If asked — "Does this cut headcount?"** — "It **redeploys judgment, not people**, and stands up new agent-ops roles."

## Slide 6 — UC1 · Discovery · *C-Suite Relevance* — "Three executive lenses"
**Goal:** Hand each executive their own outcome, then transition. *(~2–3 min)*

**Open:** "One platform, three conversations — each executive buys a **different outcome**."
- **CEO — Rob Davis** *(lens: "Refill the pipeline before the 2028 cliff — without abandoning our Google & AWS bets.")*: federated platform = **durable speed as a strategic moat**; **protects ~46% of revenue**; AI scaled responsibly = a **board-grade governance** story.
- **Business/Ops — Dean Li (Pres MRL)** *(lens: "More validated candidates per cycle — with scientists deciding, not running tools.")*: **12–18 mo vs 4–6 yr** · scientists shift from running tools to deciding · fewer late-stage failures · **on-demand HPC without capex.** **$:** ~**$180M–$1.1B accelerated revenue per asset** (6–12 mo earlier × $1–3M/day) + avoided **~$100–300M** late-stage failures.
- **Risk/Compliance — Stelios Tsinontides (VP Global Quality · ex-FDA/CDER)** *(lens: "Inspection-ready from research onward.")*: **Purview + Part 11 / ALCOA+** provenance on every candidate · **Annex 22 — GenAI never makes the critical call** · **Entra Agent ID** least-privilege + full audit.

**Transition:** "Same governance spine, next point on the value chain — filing."

---

# Part 2 · Use Case 2 — Regulatory Authoring (Development) · slides 7–10
*Block thesis: the **governed last mile** for regulatory writing — keep every AI bet; add the layer where a human **reviews, signs and defends** AI output, on the tools already on every desk.*

## Slide 7 — UC2 · Authoring · *What it is* — "Governed Authoring & Review Copilot"
**Goal:** Reframe the problem from "can AI draft?" to "can the draft survive an audit?" *(~90s–2 min)*

**Open (hook):** "Generation is already solved here — **over 80% of staff** draft CSRs with GPTeal + McKinsey today. **The problem is the audit wall:** pilots stall because the output **isn't defensible.**"

**Say — the three cards `[slide]`:**
- **The problem** — drafting is widespread; pilots stall at the **audit wall**.
- **What it does** — "Assembles the **evidence pack**, surfaces a **grounded draft in Word**, and runs **deterministic QA** — citations, consistency, completeness — *before a human ever sees it.*"
- **The principle** — "**AI never signs. Humans never start from a blank page.** Backend model is interchangeable — **GPTeal / Gemini / Bedrock.**"

**At a glance:** **days saved** on the submission critical path · **~$1–3M per day** value of each day earlier to market · **~20 launches** in the window · 30+ oncology studies.

**$ Dollar impact (illustrative):** removing **~10–30 days** from the submission critical path ≈ **$10–90M per product** (at $1–3M/day); across **~20 launches + 30+ studies** that compounds to **several hundred $M** of accelerated revenue. Reducing effort: CSR drafting **180 → 80 hrs (~100 hrs / ~55% saved) + ~50% fewer errors** ≈ **low-single-digit $M/yr** in writer labor plus avoided rework.

**Trust layer (where it runs):** **M365 Copilot · Word · Teams · Copilot Studio** (four-eyes + Part 11 e-sign) · **Entra Agent ID · Purview.**

**Transition:** "Here's the trust layer over the AI you already own."

**If asked — "Isn't this just Copilot?"** — "Copilot drafts; **this is the governed review/sign/defend flow around it** — four-eyes, Part 11 e-sign, immutable audit. That's the part pilots are missing."

## Slide 8 — UC2 · Authoring · *Future State* — "A trust layer over the AI Merck already owns"
**Goal:** Show it's an additive governance layer, not a migration. *(~3 min)*

**Open `[slide]`:** "Keep **every** AI bet you've made. We add the **one layer none of them gives you** — the place where a human **reviews, signs and defends** AI output, with an audit trail, on the tools already on every desk."

**Walk the three bands (top → bottom):**
- **Human owners** — Medical writer (grounded draft + evidence pane) · QA / Reg reviewer (four-eyes) · Accountable signatory (Part 11 sign-off). *Connector: REVIEW · SIGN · DEFEND.*
- **Microsoft trust layer (already in the building)** — **M365 Copilot/Word/Teams** (review & approval surface) · **Copilot Studio** (four-eyes + Part 11 e-sign) · **Entra (+ Agent ID)** (one identity for people & agents, cross-cloud) · **Purview** (AI governance · DLP · immutable audit). *Connector: DRAFT FROM ANY MODEL.*
- **AI you already own (untouched · generation = solved)** — Gemini Enterprise (~$1B) · AWS Bedrock · GPTeal + McKinsey (>80% staff) · Snowflake.

**"Why these decisions" (be ready for each):** 1) **Why not rebuild?** Rivals already won generation. 2) **Why the trust layer?** Auditability is the wall most pilots fail. 3) **Why M365/Entra/Purview?** Already licensed & deployed. 4) **Why start here?** Low GxP risk, fast proof, then data gravity.

**Land it:** "**Not a migration. Not a rip-and-replace.** A governance + accountability layer on software Merck already owns."

**Transition:** "Here's who works inside it."

## Slide 9 — UC2 · Authoring · *Personas* — "Supports the decision, never replaces it"
**Goal:** Same control model, the writing/QA context. *(~2 min)*

**Framing line `[slide]`:** "*An AI copilot that assists **medical writers & reviewers** by synthesizing **the evidence pack**, flagging **unsupported claims**, and recommending **a grounded draft & review route** — the human always retains accountability.*"

**Swim-lane:** Evidence pack (Protocol · SAP · TLF) → Grounded draft (in Word) → Deterministic QA (citations · consistency) → **Four-eyes review (human)** → **Part 11 sign-off (human)** → Purview audit (immutable record).

**Two columns:**
- **Decisions a human owns:** ready for author review? (lead medical writer) · claims supported & consistent? (study author/reviewer) · package defensible? (Reg lead/QA) · sign & release? (accountable signatory — QPPV / Reg).
- **New roles:** **Medical-Writing AI Editor** (curates grounded drafts) · **AI Validation & Evidence Steward** (owns the evidence pack & checks) · **Agent Security Administrator** (identity & access for agents).

**Key message:** "**AI accelerates · humans decide · everything is traced.** The signer never starts from a blank page, and never rubber-stamps a black box."

**Transition:** "Why each executive funds it."

## Slide 10 — UC2 · Authoring · *C-Suite Relevance* — "Three executive lenses"
**Goal:** Tie days-saved economics to defensibility. *(~2 min)*
- **CEO — Rob Davis** *(co-sponsor Dave Williams, CIDO)* *(lens: "Governed multicloud scale before the Keytruda LOE — with no disruptive migration.")*: **Keytruda LOE Dec 2028** · refill the pipeline (~$3B savings target) · scale GenAI value pilots leave stranded — **only ~24% of firms capture it** · **no rip-and-replace.**
- **Business/Ops — Dean Li (Pres MRL)** *(lens: "Days off the submission critical path — defensibly, at launch scale.")*: days saved across **Draft → Review → QC → Lock → Submit** · each day ≈ **$1–3M per product** · **~20 launches** · 30+ registrational oncology studies. **$:** ~**$10–90M per product** (10–30 days earlier) → **several hundred $M** across the launch window; + **low-single-digit $M/yr** writer-labor savings.
- **Risk/Compliance — Jennifer Zachary (EVP & General Counsel) + Stelios Tsinontides (VP Global Quality)** *(lens: "Black box → glass box.")*: evidence **source-linked, signed, immutable, audited**, identity-bound across clouds · **Annex 22 + Part 11 / ALCOA+** built in · a defensible **credibility framework for FDA / EMA.**

**Transition:** "Now the gate that unblocks everything — Quality."

---

# Part 3 · Use Case 3 — Manufacturing Quality / GxP · slides 11–14
*Block thesis: **inspection-ready by construction** — faster GMP investigations on Azure, federated over the multicloud estate. Win this gate first; it unblocks every other AI conversation.*

## Slide 11 — UC3 · Deviation · *What it is* — "Gen-AI Deviation / Investigation Copilot"
**Goal:** Frame speed and compliance as the *same* path. *(~90s–2 min)*

**Open (hook):** "GMP investigations take **2–8 hours of manual search**, and the **audit-credibility gate** keeps AI out of regulated work entirely — with **$10M–$100M+** of regulatory tail-risk behind it."

**Say — the three cards `[slide]`:**
- **The problem** — slow manual investigations · the audit gate blocks AI · large tail-risk.
- **What it does** — "Grounds on **validated precedent (RAG)**, drafts the investigation, **blocks any ungrounded output**, routes **four-eyes sign-off**, writes an **immutable audit trail.**"
- **The principle** — "**Federate, don't migrate** — read **AWS S3 + eschbach + GCS in place** via OneLake. The human owns every regulated call."

**At a glance:** **~30–50% faster** closure (pilot-gated) · **~70% fewer** batch-record errors · ~50% fewer CSR errors · **$10M–$100M+** tail-risk actively managed.

**$ Dollar impact (illustrative):** **~30–50% faster** closure across **thousands of deviations/yr** ≈ **~$1–5M/yr** investigator labor + faster batch release (working-capital benefit). Reducing quality cost/risk: **~70% fewer batch-record errors** avoids scrapped/rejected batches (**$1–10M+ each** for biologics), and **$10M–$100M+** regulatory tail-risk (483 / consent decree / recall) is actively managed.

**Azure components:** AI Search · Azure OpenAI · Content Safety · Purview · Entra Agent ID · Azure Monitor · OneLake.

**Transition:** "Here's the reference architecture — C1 through C8."

**If asked — "Why will Quality trust an LLM?"** — "Because it's **grounded-only** — Content Safety + groundedness **block any output it can't source.** No confident, unsourced summary."

## Slide 12 — UC3 · Deviation · *Future State* — "Inspection-ready by construction — over the multi-cloud estate"
**Goal:** Show governance is *enforced by components*, not policy promises. *(~3 min)*

**Open:** "Same UI your teams already use — **M365 Copilot (Word) · existing QMS · Teams.** Underneath, eight components, each doing one job."

**Walk C1–C8 `[slide]`:** **C1** AI Search (RAG over validated GxP precedent, ACLs) · **C2** Azure OpenAI / Agent Service (drafting + four-eyes gate, pinned model/prompt/eval) · **C3** Content Safety + Groundedness (**block-on-ungrounded gate**) · **C4** Purview + Compliance Manager (Part 11 / ALCOA+ / GAMP 5 + cross-cloud lineage) · **C5** Entra ID + Agent ID (least privilege per action · Annex 22) · **C6** Azure Monitor / Log Analytics (immutable audit trail) · **C7** AI Vision on Arc / IoT Ops (Phase 2 · shop-floor CV) · **C8** Fabric / OneLake (**SSOT · shortcuts read S3 + eschbach + GCS in place**).

**Cross-cutting:** **Agent 365** — register · identity-bind · Defender runtime · Purview DLP/audit · lifecycle.

**Retained, not migrated:** AWS deviation management · eschbach Visual Factory (SSOT) · Google Cloud estate.

**Outcome:** **BB-2** inspection-ready auditability · **BB-1** faster, lower-cost investigations · **BB-3** federation without migration.

**Transition:** "Ten real roles run this loop every day."

## Slide 13 — UC3 · Deviation · *Personas* — "Ten roles, one daily loop — the human owns every gate"
**Goal:** Make it concrete and human — named roles, not abstractions. *(~2 min)*

**Framing line `[slide]`:** "*An AI copilot that assists the **quality investigator** by synthesizing **prior deviations & SOPs**, flagging **ungrounded or unsupported root cause**, and recommending **a cited, four-eyes-ready investigation** — the human owns every gate.*"

**Swim-lane (the daily loop):** Initiators (**Sofia**·Operator, **Lena**·QC Analyst) → Author (**Maria**·Quality Investigator) → SME input (**Raj**·MSAT) → **Approver (James·QA·four-eyes)** → **Release (Pierre·QP, EU)** → Assurance (**Aisha**·Auditor).

**Two columns:**
- **Decisions a human owns:** Phase I lab-error determination (Lena/QC) · investigation authorship & root cause (Maria) · four-eyes approval (James/QA) · batch certification & release (Pierre/QP).
- **New roles keeping the validated state:** **Tom** — CSV / Validation Engineer (GAMP 5) · **Nadia** — Document Controller / RAG Curator · **Daniel** — AI Platform Engineer / GxP-MLOps.

**Key message:** "**Initiate · Author · Approve · Release · Assure — AI drafts, humans decide.** Every gate has an accountable name on it."

**Transition:** "And the value story, in each executive's language."

## Slide 14 — UC3 · Deviation · *C-Suite Relevance* — "Same architecture (C1–C8), three value stories"
**Goal:** Make the Quality gate the strategic unlock. *(~2–3 min + lead to the ask)*
- **CEO — Rob Davis** *(lens: "A credible, defensible way to scale AI fast enough to matter before 2028.")*: removing the audit gate (**BB-2**) is what lets **every** AI use case scale — R&D, trials, quality · protects **~$1–3M/day** earlier revenue per product (sibling trials use case) · **auditability is the enabler tax** that keeps AI value from being clawed back.
- **Business/Ops — Dave Maraldo (EVP Manufacturing · owns deviation-closure P&L)** *(lens: "Faster closure and more predictable release — with zero added audit risk.")*: **~30–50% faster** closure · **~70% fewer** batch-record errors · **speed and compliance are the same path.** **$:** ~**$1–5M/yr** investigator labor + **$1–10M+** per avoided scrapped batch + **$10M–$100M+** tail-risk managed.
- **Risk/Compliance — Stelios Tsinontides (VP Global Quality · compliance veto)** *(lens: "Inspection-ready by construction — I can defend it to FDA / EMA.")*: **grounded-only** output (C1+C3) · **four-eyes** enforced as a release precondition (C2), Annex 22 + agent identity (C5) · **Part 11 / ALCOA+** evidence + cross-cloud lineage (C4/C6).

**Also in the room:** CIO/CDO **Dave Williams** (one governed platform; federate, don't migrate) · CFO **Caroline Litchfield** (V5 migration avoided ✓ · tail-risk managed). **Win the Quality gate first — it unblocks every other conversation.**

---

## Slide 15 — Closing · "Three copilots. One governance spine."
**Goal:** Restate the win and make the ask. *(~1 min)*
- **KEEP THE BETS `[slide]`:** "Keep every AI bet Merck has made — Google, AWS, GPTeal. We add the one layer none of them gives you: where a human **reviews, signs and defends** AI output, with an audit trail, identity-bound across clouds."
- **WIN THE GATE — Land · Attach · Expand:** "**Land** narrow on one lighthouse workflow → **Attach** governance across clouds (**Agent 365: Entra Agent ID + Purview**) → **Expand** on proof. **Win the Quality gate first** — defensible by construction, not by retrofit."
- **The ask `[design]`:** "Pick **one lighthouse program per block** (or just the Quality gate) and stand up the spine as a **90-day proof**, governance on from day one."

---

## 💲 Dollar-savings model (illustrative — show the anchor + assumption, then re-price with Merck's numbers)
**Keystone (public anchor):** *each day a drug reaches market earlier ≈ **$1–3M** in accelerated revenue per product* (Lilly CIO, Yseop 2026). Timeline savings scale from this; effort/quality savings use figures Merck has already disclosed.

| Lever | Mechanism | Illustrative $ |
| --- | --- | --- |
| **UC1 · Timeline** | discovery 4–6 yr → 12–18 mo; attribute **6–12 mo** net earlier-to-clinic that survives to launch | **~$180M–$1.1B / successful asset** |
| **UC1 · Risk + effort** | pre-lab in-silico triage avoids late-stage failures; burst HPC vs on-prem build | **~$100–300M / avoided Phase 3 failure** · ~$10M+ capex avoided |
| **UC2 · Timeline** | governed authoring removes **~10–30 days/submission** × $1–3M/day | **~$10–90M / product** → several hundred $M across ~20 launches + 30+ studies |
| **UC2 · Effort** | CSR drafting **180→80 hrs (~55% less)** + ~50% fewer errors | **low-single-digit $M/yr** writer labor + rework |
| **UC3 · Effort** | **~30–50% faster** closure across thousands of deviations/yr + faster release | **~$1–5M/yr** labor + working-capital benefit |
| **UC3 · Quality + risk** | **~70% fewer** batch-record errors; regulatory tail-risk managed | **$1–10M+** / avoided scrapped batch · **$10M–$100M+** tail-risk |

> **How to use live:** open with the **keystone ($1–3M/day)** + one block's range, then ask the customer for **their** per-day asset value, deviation volume, and submission count — the model re-prices on the spot. Numbers are **order-of-magnitude, illustrative**, derived from public anchors; **not a Merck forecast** — validate against their portfolio economics.

## Quick-reference facts
| Fact | Use it for |
| --- | --- |
| **2028 Keytruda cliff** — ~$29.5B, ~46% of revenue; U.S. LOE Dec 2028 | The urgency / "why now" (all blocks) |
| **~$3B annual savings target by 2027** | CEO cost/scale framing (UC2) |
| **Google Cloud (Apr 2026)** — up to **$1B**, Gemini Enterprise | Federation, not displacement (spine) |
| **Moderna V940 / mRNA-4157** — now **Phase 3** | AI-designed therapy proof; watchlist (UC1) |
| **Mayo Clinic (Feb 2026)** — multimodal + virtual-cell | Data foundation / target ID (UC1) |
| **Variational AI** (small molecules), **Protillion** (antibodies) | Federated partner models; personas (UC1) |
| **>80% of staff** draft CSRs with **GPTeal + McKinsey** | "Generation is solved" (UC2) |
| **Internal gen-AI:** CSR drafts **2–3 wks → 3–4 days, ~50% fewer errors** | Proof Merck already books AI ROI (UC2) |
| **Each day earlier to market ≈ $1–3M / product** | Days-saved economics (UC2) |
| **~30–50% faster** deviation closure · **~70% fewer** batch-record errors | Manufacturing value (UC3) |
| **Regulatory tail-risk $10M–$100M+** per major event | Why the audit gate matters (UC3) |
| Retained, not migrated: **AWS · eschbach · Google** read in place via OneLake | Federate-don't-migrate proof (UC3) |
| **Moat = data + platforms + partnerships**, *not* AI patents | CEO governance/strategy framing |

**Watchlist (how we'll know it's working) `[brief]`:** Google Cloud / Gemini realized productivity gains · Phase 3 V940 / mRNA-4157 readouts · measurable manufacturing gains (yield, deviation cycle time, scrap).

> **Companion note:** this file is named `Merck-RnD-Discovery-Orchestration-Talking-Points.md` for continuity, but now covers the **full `Merck-AI-First-Three-Use-Cases` deck** (slides 1–15). The standalone 4-slide Discovery deck (`Merck-RnD-Discovery-Orchestration-Deliverables.html`) carries the same Discovery talking points on-screen — press **`S`**.

*Prepared for the Company Intelligence Lead · grounded in public information at time of writing.*
