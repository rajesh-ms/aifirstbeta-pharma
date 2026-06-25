# UC1 — Multi-Step Discovery Orchestration: Outcomes, Citations & Verification

*Source deck: [Merck AI-First — Three Use Cases](https://rajesh-ms.github.io/aifirstbeta-pharma/#1) · Use Case 1 (Discovery / R&D)*
*Prepared: 25 June 2026 · Citations drawn from the research `.md` files and independently verified against public web sources.*

---

## Business pressure driving UC1

Refill the R&D pipeline before the **2028 Keytruda patent cliff** — improve R&D productivity and time-to-market. Discovery today runs **4–6 years to clinic** with too few validated candidates per cycle.

---

## Core outcomes

| # | Outcome (from the deck) | Research source (`.md`) | Independent web verification |
|---|---|---|---|
| 1 | **12–18 months to clinic vs 4–6 year norm** | `AI_Trends_in_Pharma_by_Business_Pressure.md` (R&D lens) — refs [1][2][5][6] | ✅ **Confirmed as an industry benchmark**, not a guaranteed result. AI-designed candidates (e.g., Insilico ~18 mo preclinical→Phase I; Exscientia) cited widely as 12–18 mo vs 4–6 yr "in some cases." |
| 2 | **More validated candidates per cycle, at portfolio scale** | `AI_Trends_in_Pharma_by_Business_Pressure.md` (173 AI programs, 2026); `Company Intelligence_Merck-AI-Deep-Dive.md` (Variational, Protillion, Mayo) | ✅ **Confirmed.** 173+ AI-discovered programs in clinical development by 2026 (up from ~24 in late 2023); AI Phase I success 80–90% vs 40–65% conventional — supports "more shots on goal." |
| 3 | **~46% of revenue protected at the cliff** | `Merck-US_AI-Quality_Research-COMBINED.md` (¶5, refs [26][28]); `merck_co_financial summary.md` | ✅ **Confirmed.** Keytruda = $29.5B of $64.2B 2024 sales (≈46%); US patent expires **Dec 2028**. ("Protected" = the exposure the use case targets, not a measured result.) |
| 4 | **Human owns the wet-lab call — AI triages, human approves** (four-eyes · Annex 22 · Part 11/ALCOA+) | `Vin_Competitor_Landscape_Slides.md` (Annex 22, ALCOA+, four-eyes); `Merck-US_AI-Quality_Research-COMBINED.md` (¶4) — refs [18][19] | ✅ **Confirmed.** EU GMP **Annex 22** draft (7 Jul 2025): generative AI **prohibited for critical GxP decisions**; **human-in-the-loop mandatory** for non-critical use. |

---

## Customer-value lenses (generic, not C-suite)

### Strategy & growth
- Federated platform = **durable speed as a strategic moat** (data + platforms + partnerships).
  *Source:* `Company Intelligence_Merck-AI-Deep-Dive.md` ("the moat is data + platforms + partnerships").
  ✅ Web-verified deals: **Google Cloud up to $1B / Gemini Enterprise** (Apr 2026), **Protillion $510M** (Jun 2026), **Variational $349M**.
- **Protects ~46% of revenue** at the cliff, plus **$3B annual savings by 2027** and a **"$70B+ opportunity by mid-2030s."**
  *Source:* `Merck-US_AI-Quality_Research-COMBINED.md` refs [25][27]. ✅ Web-confirmed.

### Research operations & productivity
- **Scientists shift from running tools to deciding.**
  *Source:* deck principle, grounded in Annex 22 "decision-support, not decision-maker" (`Merck-US_AI-Quality_Research-COMBINED.md`, ¶4). ✅ Regulatory framing web-verified.
- **Fewer costly late-stage failures (pre-lab triage).**
  ✅ Supported by web data: AI Phase I success 80–90% vs 40–65%.
- **On-demand HPC without capex.**
  ⚠️ **Solution-architecture claim** (Azure HPC burst) — not independently sourced in research or web; positioning, not a verified Merck fact.

### Quality, risk & compliance
- **Purview lineage + Part 11/ALCOA+ provenance on every candidate**; **Annex 22 honored** (GenAI never makes the critical call); **Entra Agent ID** least-privilege governance.
  *Source:* `Vin_Competitor_Landscape_Slides.md` (Human-in-the-loop, GAMP 5 / 21 CFR Part 11 / ALCOA+, four-eyes); `Merck-US_AI-Quality_Research-COMBINED.md` (¶4).
  ✅ Regulatory requirements web-verified; the Microsoft control mappings (Purview/Entra) are solution design.

---

## Business benefits

| # | Business benefit | Why it matters (quantified basis) | Citation |
|---|---|---|---|
| 1 | **Faster pipeline velocity / time-to-market** | Compressing discovery from a **4–6 year** norm toward **12–18 months to clinic** means more assets reach the clinic per year — more "shots on goal" before the cliff. | `AI_Trends_in_Pharma_by_Business_Pressure.md` (R&D lens). Web: AI-designed candidates reaching trials in 12–18 mo (Insilico, Exscientia). |
| 2 | **Revenue protection against the patent cliff** | A faster, fuller pipeline helps replace the **~46% of revenue** (Keytruda, $29.5B of $64.2B 2024 sales) exposed when the core US patent expires **Dec 2028**. | `Merck-US_AI-Quality_Research-COMBINED.md` (¶5); `merck_co_financial summary.md`. Web: [Merck FY2024 results](https://www.merck.com/news/merck-announces-fourth-quarter-and-full-year-2024-financial-results/). |
| 3 | **Higher R&D productivity & capital efficiency** | In-silico triage advances **more validated candidates per cycle** and cuts costly late-stage failures (AI Phase I success **80–90% vs 40–65%**); burst HPC adds capacity **without capex**, supporting the **$3B-by-2027** savings goal. | Web: [173 AI programs / success rates](https://sciencereader.com/ai-drug-discovery-2026/); `merck_co_financial summary.md` ($3B by 2027); `Company Intelligence_Merck-AI-Deep-Dive.md`. |
| 4 | **Compliance-grade speed (de-risked adoption)** | A governance spine — **Annex 22**, **21 CFR Part 11 / ALCOA+**, human-in-the-loop four-eyes — lets Merck accelerate **without** weakening auditability, positioning it to *lead* Annex 22 adoption rather than react. | `Merck-US_AI-Quality_Research-COMBINED.md` (¶4); `Vin_Competitor_Landscape_Slides.md`. Web: [Annex 22 (Merit Solutions)](https://meritsolutions.com/blog-annex-22-ai-pharma-regulation/). |
| 5 | **Protects existing AI investment (federate, don't migrate)** | Orchestrating across **Azure + Google + AWS** integrates the **~$1B+** in agentic-AI bets Merck already made — **Google Cloud up to $1B**, **Protillion $510M**, **Variational $349M** — instead of ripping and replacing them. | `Company Intelligence_Merck-AI-Deep-Dive.md`. Web: [Google Cloud $1B](https://www.constellationr.com/insights/news/merck-inks-google-cloud-agentic-ai-deal-worth-1-billion); [Protillion $510M](https://www.fiercebiotech.com/biotech/merck-inks-510m-biobucks-data-generation-partnership-protillion). |

---

## Key source URLs (web verification)

- **Keytruda ~46% / Dec 2028:** [Merck FY2024 results](https://www.merck.com/news/merck-announces-fourth-quarter-and-full-year-2024-financial-results/)
- **Annex 22 (gen-AI prohibited for critical / HITL):** [Merit Solutions](https://meritsolutions.com/blog-annex-22-ai-pharma-regulation/) · [EU consultation](https://health.ec.europa.eu/consultations/stakeholders-consultation-eudralex-volume-4-good-manufacturing-practice-guidelines-chapter-4-annex_en)
- **173 AI programs (2026):** [sciencereader.com](https://sciencereader.com/ai-drug-discovery-2026/)
- **Protillion $510M:** [FierceBiotech](https://www.fiercebiotech.com/biotech/merck-inks-510m-biobucks-data-generation-partnership-protillion)
- **Google Cloud up to $1B:** [ConstellationR](https://www.constellationr.com/insights/news/merck-inks-google-cloud-agentic-ai-deal-worth-1-billion)

---

## Verification summary

Outcomes 1–4 and the financial / partnership / regulatory claims are **web-confirmed**. Two items are **solution positioning, not verifiable facts**:

1. "On-demand HPC without capex"
2. The specific Microsoft control mappings (Purview / Entra / Foundry)

The "12–18 mo" figure is a real industry benchmark but **illustrative**, not a guaranteed Merck outcome. The "~46%" describes revenue **exposure** at the cliff; "protected" is the use case's aim, not a measured result.
