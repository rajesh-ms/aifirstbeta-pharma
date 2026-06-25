# Merck (MSD) - Three Pressures, Three Use Cases, Azure Digital Enablers

### One-page companion: use case -> mechanism -> outcome -> Azure mapping

*Public sources, as of June 2026. Spine = `Merck-AI-Intelligence-Brief.md`; companions = `Merck-Current-State-Architecture.md`, `Merck-Future-State-Azure-Architecture.md`.*

> **Design principle - federate, don't migrate.** Azure is the **target-state digital enabler**; Merck's existing **Google Cloud / Gemini** (R&D, agentic ops) and **AWS** (deviation management) stay. Microsoft Fabric **OneLake shortcuts** read data in place from **Amazon S3 and Google Cloud Storage** (GA) - no lift-and-shift.
>
> **Provenance:** **[brief]** = in the intelligence brief - **[deck]** = pressure deck + cited sources - **[H/design]** = target-state Azure recommendation, validate.

---

## 1. Increase R&D speed -> Generative target discovery + in-silico candidate & toxicity design

- **Mechanism:** Foundation models nominate/validate targets; Mayo multimodal "virtual-cell" data sharpens target ID; generative models design small molecules (Variational AI) and antibodies (Protillion); pre-lab efficacy/tox prediction triages out dead-ends before wet-lab. **[brief]**
- **Outcome:** More validated candidates per cycle, fewer costly late failures - refills the pipeline against the **2028 Keytruda cliff (P1)**. Attacks the ~1-in-10 success rate / decade timelines - "the single biggest cost lever." **[brief]**

| Capability | Azure digital enabler | What it enables | Preserves existing investment |
| --- | --- | --- | --- |
| Generative chemistry + molecular property/tox screening | **Azure Quantum Elements** (Generative Chemistry + Accelerated DFT, ~20x) | Propose *synthesizable* novel molecules; predict solubility/tox/synthetic feasibility in-silico | Complements Variational/Protillion outputs |
| Protein / antibody / bio foundation models | **Azure AI Foundry model catalog** + **Azure Machine Learning** | Host & fine-tune specialized life-science models | Federates, not replaces, Gemini discovery |
| Multi-step discovery orchestration | **Azure AI Foundry Agent Service** (GA, multi-agent) | Agentic target -> candidate -> screen pipeline | A2A interop with non-Azure agents |
| Large-scale simulation / docking / MD | **Azure HPC: ND-series GPU + CycleCloud / Batch** | Burst compute for in-silico screening | On-demand, no on-prem rebuild |
| Mayo multimodal clinical + genomic data | **Azure Health Data Services (FHIR/DICOM/genomics)** in **Fabric / OneLake** | Unified, query-ready multimodal data | OneLake shortcuts read S3/GCS in place |

**Why Azure wins:** the only hyperscaler pairing **generative computational chemistry (Quantum Elements)** with integrated HPC + AI under one **Purview**-governed data plane.

---

## 2. Increase Trials speed -> AI enrollment + autonomous regulatory writing

- **Mechanism:** AI ranks high-recruiting **sites**, matches eligible **patients** to protocols, predicts **dropout risk** for early intervention; internal gen-AI then drafts CSRs/submissions - the proven **2-3 wks -> 3-4 days, 50% fewer errors** step. **[brief]**
- **Outcome:** Faster, fuller enrollment + a compressed write-up-to-submission tail. At **~$1-3M/day** of earlier revenue (P2), the clearest dollar-denominated win. **[brief/deck]**

| Capability | Azure digital enabler | What it enables | Preserves existing investment |
| --- | --- | --- | --- |
| Unify trial / site / patient + EHR data | **Fabric / OneLake + Azure Health Data Services (FHIR)** | One governed view for matching | Federates existing sources via shortcuts |
| Patient-to-protocol matching / eligibility | **Azure AI Search** (hybrid + semantic reranker) | High-recall retrieval over eligibility criteria | Sits over current data, no migration |
| Site-selection ranking + dropout-risk models | **Azure Machine Learning** | Predictive enrollment & retention | Extends existing trial analytics |
| Autonomous CSR / submission drafting | **Azure OpenAI in AI Foundry (PTU)** + **Foundry Agent Service** | Grounded first-draft agents at predictable cost | Augments internal gen-AI CSR platform |
| Writer review / redline in place | **Microsoft 365 Copilot (Word) + Copilot Studio** | Draft-for-review in tools writers already use | Coexists with Gemini-based authoring |
| Agent identity & access | **Microsoft Entra Agent ID** | Governed, least-privilege writing agents | Entra is the enterprise IdP across clouds |

**Why Azure wins:** end-to-end **FHIR data -> matching -> drafting** inside the writer's existing M365 surface, with **PTU** cost predictability and **Entra** agent governance.

---

## 3. Inspection-Ready Auditability -> Gen-AI deviation / investigation copilot

- **Mechanism:** Agent retrieves precedent deviations/CAPAs (RAG over GxP knowledge - the **AWS deviation** workload), drafts the investigation **with cited sources**, routes through **four-eyes** sign-off; Visual Factory = single source of truth; CV inspection feeds defect data; every step logged to **Part 11 / ALCOA+** and classified critical-vs-non-critical per **Annex 22**. **[brief/deck]**
- **Outcome:** Faster GMP investigations *with* a defensible audit trail - **inspection-ready by design**, closing the **P3/P4** audit-credibility gate that blocks scaling AI into GxP. **[deck]**

| Capability | Azure digital enabler | What it enables | Preserves existing investment |
| --- | --- | --- | --- |
| RAG over GxP precedent (deviations, CAPAs, SOPs) | **Azure AI Search** (hybrid + reranker) | Cited, precedent-grounded drafting | Indexes existing GxP content in place |
| Investigation drafting + human-in-the-loop | **Azure OpenAI in AI Foundry** + **Foundry Agent Service** | Draft-for-review with four-eyes gate | Federates with AWS deviation workload |
| No-unsourceable-claims guardrails | **Azure AI Content Safety + Foundry groundedness/evals** | Blocks the "confident summary it can't source" liability | Adds assurance layer over any model |
| Part 11 / ALCOA+ control mapping + lineage | **Microsoft Purview + Purview Compliance Manager** | Pre-built compliance evidence & data lineage | Governs data across AWS/Google/internal |
| Governed agent identity + Annex 22 classification | **Microsoft Entra Agent ID + Conditional Access** | Auditable agent actions, least privilege | Extends Entra to AI agents |
| Immutable audit logging | **Azure Monitor / Log Analytics** | Tamper-evident trail for inspectors | Centralizes multi-cloud logs |
| Edge defect inspection (CV) | **Azure AI Vision on Azure Arc / IoT Operations** | Shop-floor inspection feeding deviations | Arc governs existing edge, no rip-replace |
| Single source of truth | **Fabric / OneLake** | Federates eschbach Visual Factory + AWS deviation data | Shortcuts - read in place |

**Why Azure wins:** **Purview Compliance Manager + Entra Agent ID + Foundry groundedness** deliver the traceability/governance story tuned for FDA/EMA - auditability is Azure's strongest competitive ground in regulated pharma.

---

## Cross-cutting Azure governance planes (underpin all three)

These four planes are the "federate, don't migrate" backbone - they govern across Google, AWS and internal without moving workloads:

| Plane | Azure service | Role |
| --- | --- | --- |
| **Identity** | Microsoft Entra + **Entra Agent ID** | One identity & access fabric for users *and* AI agents |
| **Governance** | Microsoft Purview + Defender | Data lineage, classification, Part 11 / ALCOA+ evidence, security posture |
| **Data** | Microsoft Fabric / **OneLake** (shortcuts to S3 + GCS) | One logical lake over multi-cloud data - no migration |
| **Control** | Azure Arc | Extends Azure policy/management to AWS, Google & edge |

---

## Sources (anchor facts)

| Item | Source |
| --- | --- |
| Foundation models, AI-in-trials, CV inspection, gen-AI deviation mgmt (AWS), <30-min risk, Mayo, Moderna, Variational/Protillion, CSR 2-3 wks -> 3-4 days/50% fewer errors | `Merck-AI-Intelligence-Brief.md` (8 cited sources) **[brief]** |
| GxP guardrails (GAMP 5 / Part 11 / ALCOA+ / Annex 22), value-capture gap, submission-speed economics, four-eyes | Pressure deck (Rephine, ISPE, BCG, Fierce Pharma, Yseop) **[deck]** |
| Azure Quantum Elements (Generative Chemistry + Accelerated DFT) | Microsoft Azure blog (2024) |
| Azure AI Foundry Agent Service GA + multi-agent + Entra Agent ID | Microsoft Build 2025 / Ignite 2025 |
| OneLake shortcuts to Amazon S3 + Google Cloud Storage (GA) | Microsoft Fabric documentation |

*Azure mappings are target-state design recommendations [H/design]; the underlying Merck use cases and outcomes are grounded per the tags above. Prepared for the Company Intelligence Lead / Architecture Transformation Program.*
