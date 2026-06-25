# Speaker Talking Points — Multi-Step Discovery Orchestration

**Deck:** `Merck-RnD-Discovery-Orchestration-Deliverables.html` (Microsoft × MSD · Phase B)
**Audience:** Merck (MSD) R&D leadership + C-suite sponsors
**Total runtime:** ~10–12 min · **Anchor slide:** Slide 2 (architecture)
**One-sentence thesis:** *Federate, don't migrate* — Azure becomes the orchestration + governance layer over Merck's existing Google/AWS estate to compress discovery from **4–6 years → 12–18 months to clinic**, inspection-ready from day one.

> Provenance tags on each slide: `[brief]` = grounded in the Company Intelligence Brief · `[deck]` = carried from the pressures deck · `[H/design]` = hypothesis/design proposal.

---

## Slide 1 — Title · Multi-Step Discovery Orchestration
**Goal:** Frame the stakes and the operating principle in 90 seconds. *(~60–90s)*

**Open (the hook):**
- "Merck's single biggest value lever is R&D speed — and the clock is running. The **2028 Keytruda patent cliff** puts roughly **$29.5B — about 46% of revenue — in play**. The question isn't *whether* to use AI in discovery; it's how to do it fast, at scale, **without throwing away the Google Cloud and AWS investments you've already made**."

**Say:**
- This is **Phase B**. Three deliverables today: ① an **architecture concept**, ② the **human + AI personas** who run it, ③ **why each member of your C-suite should care**.
- Our north star — and you'll see it bottom-right on every slide — is **"federate, don't migrate."** Azure is the **orchestration and governance layer over your multi-cloud estate**, not a rip-and-replace.
- This is a **Microsoft × MSD** co-engineering conversation, not a product pitch.

**Transition:** "Let's start with what the platform actually looks like."

**If asked — "We just signed a $1B Google Cloud deal; why Azure?"**
- We don't displace Gemini — we **orchestrate across it**. The architecture literally *calls* Gemini as a federated agent. More on the next slide.

---

## Slide 2 — Deliverable 1 · Architecture Concept (Cloud-Centric Platform)
**Goal:** Prove that "fast + governed + federated" is one coherent design. This is the slide to slow down on. *(~3–4 min)*

**Open:** "This one screen says: we can compress **4–6 years of discovery to 12–18 months to clinic** — and keep every regulator happy."

**Walk the pipeline (top band):**
- Five steps — **Target ID → Generative design → Structure & docking → In-silico triage → Rank → human gate.** "An agent runs the **whole chain**; a **human owns the final gate**."

**Walk the four planes (top to bottom):**
- 🟢 **Orchestration** — **Azure AI Foundry Agent Service** runs the multi-agent chain. **A2A interoperability** means it *calls* **Gemini, Protillion, Variational** — that's federation in action. **Human-in-the-loop gate** = four-eyes before wet-lab (**Annex 22**).
- 🟢 **Foundation models** — the science: **ESM · AlphaFold3 · Boltz-2 · IgLM · RFdiffusion** via Foundry/Azure ML; **Azure Quantum Elements** for generative chemistry + **~20× accelerated DFT**; plus **federated partner models**.
- 🟢 **Compute** — **ND-series GPU HPC**, **CycleCloud/Batch** for docking & screening at scale, **burst on-demand** — capacity **without an on-prem rebuild**.
- 🟢 **Data foundation** — **Microsoft Fabric / OneLake shortcuts read S3 + GCS *in place***; **Azure Health Data Services** for the **Mayo** multimodal data; **AI Search** for RAG over assay & precedent data.

**Land the governance rail (right column — the close):**
- **Entra Agent ID · Purview lineage · Defender · Azure Arc · Part 11 / ALCOA+ ready.** "This is what makes it **inspection-ready**, and it's **cross-cutting — not bolted on**."

**The proof point (say it explicitly):** "Bottom-left — **OneLake reads your AWS and Google data where it lives.** *That* is 'federate, don't migrate.' No data exodus, no re-platforming tax."

**Outcome bar:** more validated candidates/cycle · **12–18 mo vs 4–6 yr** · human owns the wet-lab call.

**Transition:** "Architecture only matters if people can run it — here's who."

**If asked — "Isn't this Azure lock-in?"**
- The opposite: **Arc, OneLake shortcuts, and A2A are explicitly multicloud.** You keep optionality and your existing contracts; Azure adds the connective tissue and the audit trail.

---

## Slide 3 — Deliverable 2 · Persona-Driven Scenarios
**Goal:** Show AI changes *what scientists decide*, not whether they're needed. *(~2–3 min)*

**Open:** "AI doesn't replace your scientists — it changes what they spend their day deciding. Two personas show how."

**Read the framing template once (it is the governance story in one line):**
- *"An AI copilot that assists `<persona>` by synthesizing `<data>`, flagging `<risks>`, and recommending `<actions>` — **while the human retains accountability.**"* "Note the last clause — that's the whole control model in a sentence."

**DS — Discovery scientist / computational chemist:**
- Agent runs **target → design → dock → triage** and returns a **ranked shortlist with evidence & lineage**; the scientist decides **what advances to wet-lab** (four-eyes).
- **New roles:** in-silico triage scientist · HPC cost steward.

**AE — Antibody / protein-design engineer:**
- Agent orchestrates **antibody LMs + generative design + ABodyBuilder structure + developability/immunogenicity screens**; the engineer judges **manufacturability**.
- **New roles:** model-catalog curator · biologics agent-ops engineer.

**Key message:** "Same pattern both times — **AI proposes at portfolio scale; the human disposes on the regulated call.** That consistency is exactly what makes it **trainable and auditable**."

**Transition:** "So if that's how the work changes — why should the C-suite fund it? Let's translate."

**If asked — "Does this cut headcount?"**
- It **redeploys judgment**, not people — scientists move from running tools to deciding — and it **creates new agent-ops roles**.

---

## Slide 4 — Deliverable 3 · C-Suite Relevance ("So What?")
**Goal:** Hand each executive their own outcome, then make the ask. *(~2–3 min + close)*

**Open:** "One platform, three different conversations — because the CEO, the head of labs, and Quality each buy a **different outcome**."

**CEO — Rob Davis · modernization / scale / governance:**
- Federated platform = **durable speed as a strategic moat** (data + platforms + partnerships); **protects ~46% of revenue** exposed at the cliff; **AI scaled responsibly** = a **board-grade governance story**. "He doesn't have to choose between speed and his Google bet."

**Business / Operations — Dean Li · Pres MRL · speed / throughput / reliability:**
- More validated candidates/cycle, **12–18 mo vs 4–6 yr**; scientists **shift from running tools to deciding**; **on-demand HPC — capacity without capex**.

**Risk / Compliance — Stelios Tsinontides · Quality · safety / trust / regulatory:**
- **Purview lineage + Part 11 / ALCOA+** provenance on **every candidate**; **Annex 22** honored — **GenAI never makes the critical decision**; agents governed by **Entra Agent ID** — least privilege, full audit.

**Close:** "Translate architecture into the outcomes each leader **already** cares about — **speed** for the business, **defensibility** for Quality, a **durable moat** for the CEO."

**The ask (next step):** "**Phase C** — pick **one discovery program** and stand up the orchestration spine as a **90-day proof**, with the governance rail on from day one."

**If asked — "How will we know it's working?"** (tie to the brief watchlist)
- Track three signals: **Google Cloud / Gemini realized productivity gains**, **Phase 3 V940 / mRNA-4157 readouts**, and **measurable manufacturing gains** (yield, deviation cycle time, scrap).

---

## Quick-reference facts (all from the Intelligence Brief)
| Fact | Use it for |
| --- | --- |
| **2028 Keytruda cliff** — ~$29.5B, ~46% of revenue | The urgency / "why now" |
| **Google Cloud (Apr 2026)** — up to **$1B**, Gemini Enterprise | Federation, not displacement |
| **Moderna V940 / mRNA-4157** — now **Phase 3** | AI-designed therapy proof; watchlist |
| **Mayo Clinic (Feb 2026)** — multimodal + virtual-cell | The data foundation / target ID |
| **Variational AI** (small molecules), **Protillion** (antibodies) | Federated partner models, personas |
| **Internal gen-AI:** CSR drafts **2–3 wks → 3–4 days, 50% fewer errors** | Proof Merck already gets AI ROI |
| **Moat = data + platforms + partnerships**, *not* AI patents | CEO governance/strategy framing |

> **Tip:** Press **`S`** in the HTML deck for these notes on-screen (per slide), **`O`** for the slide overview, **`F`** for fullscreen.

*Prepared for the Company Intelligence Lead · grounded in public information at time of writing.*
