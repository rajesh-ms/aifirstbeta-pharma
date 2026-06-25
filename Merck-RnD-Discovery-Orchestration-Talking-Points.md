# Speaker Talking Points — Use Case 1: Multi-Step Discovery Orchestration

**Deck:** `Merck-AI-First-Three-Use-Cases` — **Discovery / R&D block, slides 3–6** (Microsoft × MSD · Account Pursuit)
**Audience:** Merck (MSD) R&D leadership + C-suite sponsors
**Block runtime:** ~9–11 min · **Anchor slide:** Slide 4 (architecture)
**Through-line carried in from slide 2:** *"Generation is solved. The gate is governance."*
**Discovery thesis:** *Federate, don't migrate* — Azure becomes the orchestration + governance layer over Merck's existing Google/AWS estate to compress discovery from **4–6 years → 12–18 months to clinic**, inspection-ready from day one.

> Provenance tags: `[slide]` = printed on the slide · `[brief]` = Company Intelligence Brief · `[design]` = architecture proposal.
> Exec quotes on slide 6 are **persona-lens framing** (the outcome each leader buys), not verbatim public statements.

---

## Slide 3 — Use Case 1 · Discovery · *What it is*
### "Multi-Step Discovery Orchestration"
**Goal:** Land the problem, the mechanism, and the operating principle — before any architecture. *(~90s–2 min)*

**Open (the hook):**
- "Merck's single biggest value lever is R&D speed — and the clock is running. The **2028 Keytruda cliff** puts **~46% of revenue** in play, and today discovery runs **4–6 years to clinic** with too few validated candidates per cycle." *(~$29.5B exposed — `[brief]`)*

**Say — walk the three cards `[slide]`:**
- **The problem** — refill the pipeline before 2028; discovery is too slow and too thin on validated candidates.
- **What it does** — "A **cloud-centric platform for *governed agentic* drug discovery.** Agents run the chain — **Target ID → generative design → structure & docking → in-silico triage** — and hand a **ranked shortlist to a human gate** before any wet-lab work."
- **The principle** — "**AI triages at portfolio scale; the scientist owns the wet-lab call** — four-eyes, Annex 22." This is the line to repeat all block.

**Point to "At a glance":**
- **12–18 months to clinic** vs the 4–6 year norm · **more validated candidates per cycle** · **~46% of revenue protected** at the cliff.

**Name the models/partners — don't read them all; make the federation point:**
- "The stack is **multi-vendor by design** — ESM, AlphaFold3, Boltz-2, IgLM, RFdiffusion alongside **Protillion, Variational, Gemini** and **Azure Quantum Elements.** We orchestrate across them; we don't replace them."

**Transition:** "Here's what that platform actually looks like."

**If asked — "We just signed a ~$1B Google Cloud deal; why Azure?"** `[brief]`
- "We don't displace Gemini — the architecture literally *calls* it as a federated agent. Azure adds the orchestration spine and the audit trail. Next slide shows it."

---

## Slide 4 — Use Case 1 · Discovery · *Future State*
### "Cloud-Centric Platform — governed agentic discovery"
**Goal:** Prove "fast + governed + federated" is one coherent design. This is the slide to slow down on. *(~3–4 min — anchor)*

**Open:** "One screen: compress **4–6 years of discovery to 12–18 months to clinic** — and keep every regulator happy."

**Pipeline (top band):** Target ID & validation → Generative design → Structure & docking → In-silico triage → **Rank → human gate.** "An agent runs the whole chain; a human owns the gate."

**Walk the four planes (top to bottom) `[slide]`:**
- **Orchestration** — **Azure AI Foundry Agent Service** runs the multi-agent chain (Target·Design·Structure·Triage·Rank); **A2A interoperability** *calls* **Gemini / Protillion / Variational** — federation in action; **human-in-the-loop gate** = four-eyes before wet-lab (Annex 22).
- **Foundation models** — **Foundry catalog + Azure ML** (ESM · AlphaFold3 · Boltz-2 · IgLM · RFdiffusion); **Azure Quantum Elements** (generative chemistry + tox, **~20× accelerated DFT**); **federated partner models** (Protillion · Variational · Gemini).
- **Compute** — **ND-series GPU HPC**, **CycleCloud / Azure Batch** for docking & screening at scale, **burst on-demand** — capacity **without an on-prem rebuild**.
- **Data foundation** — **Fabric / OneLake shortcuts read S3 + GCS *in place* (GA)**; **Azure Health Data Services** (FHIR/DICOM/genomics) for the **Mayo** multimodal data; **AI Search** for hybrid RAG over assay & precedent data.

**Land the governance rail (right column — the close):**
- **Entra Agent ID · Purview lineage · Defender · Azure Arc (multicloud/edge) · Part 11 / ALCOA+ ready.** "**Cross-cutting across all planes — not bolted on.** That's what makes it inspection-ready."

**The proof point (say it explicitly):** "In the data plane — **OneLake reads your AWS and Google data where it lives.** *That* is 'federate, don't migrate' — no data exodus, no re-platforming tax."

**Outcome bar:** more validated candidates/cycle · **12–18 mo vs 4–6 yr** · human owns the wet-lab call — and the badge: **"Federate, don't migrate."**

**Transition:** "Architecture only matters if people can run it — here's who."

**If asked — "Isn't this Azure lock-in?"**
- "The opposite — **Arc, OneLake shortcuts and A2A are explicitly multicloud.** You keep your contracts and your optionality; Azure adds the connective tissue and the audit trail."

---

## Slide 5 — Use Case 1 · Discovery · *Persona-Driven Scenarios*
### "Decisions the copilot supports, not replaces"
**Goal:** Show AI changes *what scientists decide*, not whether they're needed. *(~2–3 min)*

**Open:** "AI doesn't replace your scientists — it changes what they spend their day deciding."

**Read the framing line once — it's the control model in a sentence `[slide]`:**
- "*An AI copilot that assists the **discovery scientist & protein-design engineer** by synthesizing **target + multimodal data**, flagging **non-synthesizable or toxic candidates**, and recommending **a ranked shortlist** — the human retains scientific accountability.*"

**Walk the swim-lane:**
- Target ID → Generative design (scaffolds · sequences) → Structure & docking (**AlphaFold3 · ABodyBuilder**) → In-silico triage (ranked shortlist) → **Human gate (four-eyes · Annex 22)** → **Wet-lab call (scientist owns).** "Everything up to the gate is AI accelerating; the last two nodes are human-owned — and **everything is traced.**"

**Contrast the two columns — the heart of the slide:**
- **Decisions a human owns:** which candidates advance to wet-lab (Discovery Scientist) · target go/no-go · which scaffolds/sequences to synthesize (Protein-Design Engineer) · approve the ranked shortlist, four-eyes — validates the biology.
- **New roles & interfaces:** **in-silico triage scientist** (agent workbench over Foundry) · **model-catalog curator** & **biologics agent-ops engineer** · **HPC cost steward** (burst compute, no capex).

**Key message:** "**AI proposes at portfolio scale; the human disposes on the regulated call.** That consistency is what makes it **trainable and auditable** — and it **creates new roles**, it doesn't erase scientists."

**Transition:** "So if that's how the work changes — why should the C-suite fund it?"

**If asked — "Does this cut headcount?"**
- "It **redeploys judgment, not people** — scientists move from running tools to deciding — and it stands up **new agent-ops roles.**"

---

## Slide 6 — Use Case 1 · Discovery · *C-Suite Relevance*
### "Multi-step discovery orchestration — three executive lenses"
**Goal:** Hand each executive their own outcome, then make the ask. *(~2–3 min + close)*

**Open:** "One platform, three conversations — the CEO, the head of labs, and Quality each buy a **different outcome**."

**CEO — Rob Davis (Chairman & CEO) · modernization / scale / governance `[slide]`:**
- *Their lens:* "Refill the pipeline before the 2028 cliff — without abandoning our Google & AWS bets."
- Federated platform = **durable speed as a strategic moat** (data + platforms + partnerships) · **protects ~46% of revenue** at the cliff · **AI scaled responsibly = a board-grade governance story.** "He doesn't have to choose between speed and his Google bet."

**Business / Ops — Dean Li (President, Merck Research Labs) · speed / throughput:**
- *Their lens:* "More validated candidates per cycle, at portfolio scale — with scientists deciding, not running tools."
- **12–18 mo to clinic vs 4–6 yr** · scientists **shift from running tools to deciding** · **fewer costly late-stage failures** (pre-lab triage) · **on-demand HPC without capex.**

**Risk / Compliance — Stelios Tsinontides (VP Global Quality · ex-FDA/CDER) · safety / trust:**
- *Their lens:* "Inspection-ready from research onward — AI triages, a human owns every regulated call."
- **Purview lineage + Part 11 / ALCOA+** provenance on **every candidate** · **Annex 22 honored — GenAI never makes the critical decision** · agents governed by **Entra Agent ID** — least privilege, full audit.

**Close:** "Same architecture, three value stories — **speed** for the business, **defensibility** for Quality, a **durable moat** for the CEO."

**The ask (next step) `[design]`:** "**Phase C** — pick **one discovery program** and stand up the orchestration spine as a **90-day proof**, with the governance rail on from day one."

**If asked — "How will we know it's working?"** (tie to the brief watchlist) `[brief]`
- "Three signals: **Google Cloud / Gemini realized productivity gains**, **Phase 3 V940 / mRNA-4157 readouts**, and **measurable manufacturing gains** — yield, deviation cycle time, scrap."

---

## Quick-reference facts (from the Company Intelligence Brief)
| Fact | Use it for |
| --- | --- |
| **2028 Keytruda cliff** — ~$29.5B, ~46% of revenue | The urgency / "why now" |
| **Google Cloud (Apr 2026)** — up to **$1B**, Gemini Enterprise | Federation, not displacement |
| **Moderna V940 / mRNA-4157** — now **Phase 3** | AI-designed therapy proof; watchlist |
| **Mayo Clinic (Feb 2026)** — multimodal + virtual-cell | Data foundation / target ID |
| **Variational AI** (small molecules), **Protillion** (antibodies) | Federated partner models; personas |
| **Internal gen-AI:** CSR drafts **2–3 wks → 3–4 days, 50% fewer errors** | Proof Merck already books AI ROI |
| **Moat = data + platforms + partnerships**, *not* AI patents | CEO governance/strategy framing |

> **Where these slides sit in the deck:** `Merck-AI-First-Three-Use-Cases` — **Discovery / R&D = slides 3–6.** (Use Case 2 · Regulatory Authoring = slides 7–10; Use Case 3 · Manufacturing Quality = slides 11–14; cover = 1, through-line = 2, closing = 15.)

*Prepared for the Company Intelligence Lead · grounded in public information at time of writing.*
