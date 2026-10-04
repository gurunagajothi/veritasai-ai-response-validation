# AI Response Validation & Quality Intelligence Platform

> **Final Infosys Internship Project**  
> An enterprise-grade multi-agent platform for evaluating relevance, accuracy, completeness, and hallucinations in AI-generated responses with source-grounded RAG verification.

---

## 🌟 Executive Overview & Problem Statement

Modern generative AI models and LLMs (Large Language Models) are deployed widely across customer support, healthcare, legal analysis, and enterprise decision-making. However, generative models suffer from critical reliability bottlenecks:
1. **Hallucinations & Fabrications:** Inventing plausible-sounding but false statements without grounding.
2. **Topical Drift & Irrelevance:** Evading the user's specific prompt with generic boilerplate.
3. **Incomplete Coverage:** Answering only superficial aspects of multi-part questions while missing core constraints.
4. **Lack of Auditability & Transparency:** Black-box outputs without clear evidence tracing.

**VeritasAI** solves this problem by providing a multi-agent evaluation pipeline. Each response is decomposed into atomic propositions, verified against authoritative knowledge bases (TruthfulQA, SQuAD, and custom enterprise documentation), scored across four key dimensions, and delivered with an actionable audit report and executive PDF.

---

## 🎯 Milestone Fulfillment Matrix

| Milestone | Scope & Capabilities | Status |
|---|---|:---:|
| **M1: Foundation, RAG & Knowledge Base** | TruthfulQA & SQuAD datasets, text cleaning, sliding-window chunking, sub-word vector embedding, cosine similarity retriever, and custom doc ingestion. | **100% COMPLETE** |
| **M2: Relevance, Accuracy & Hallucination Judges** | Prompt intent alignment, topic drift detection, fact verification against gold truth & RAG, claim extraction, severity rating, and character span highlighting. | **100% COMPLETE** |
| **M3: Completeness, Verdict & Batch Evaluation** | Sub-question decomposition, configurable weighted composite scoring, critical hallucination overrides, and resilient CSV batch evaluation. | **100% COMPLETE** |
| **M4: Dashboard, PDF Reports & Demonstration** | Executive KPI dashboard, Recharts visualizations, single & batch audit PDF generators with auto-tables, AI System Benchmark, and comprehensive tests. | **100% COMPLETE** |

---

## 🏗️ System Architecture

```
User Input (Question, AI Response, Optional Reference/Context)
    │
    ▼
Evaluation Orchestrator (/api/evaluate)
    │
    ├──► Stage 1: Input Validation (Syntax & token density check)
    │
    ├──► Stage 2: RAG Pipeline & Semantic Vector Search
    │       ├── SQLite Knowledge Store (TruthfulQA, SQuAD, Custom Docs)
    │       ├── Sliding-window Chunker (chunkSize: 60, overlap: 15)
    │       └── Cosine Semantic Similarity Retrieval
    │
    ├──► Stage 3: Relevance Judge Agent (Semantic intent, directness, topic drift)
    │
    ├──► Stage 4: Accuracy Judge Agent (Entailment check vs reference & RAG context)
    │
    ├──► Stage 5: Hallucination Detection Agent (Atomic claim audit, severity rating)
    │
    ├──► Stage 6: Completeness Judge Agent (Requirement decomposition: Addressed/Missing)
    │
    └──► Stage 7: Verdict Agent & Coach
            ├── Configurable weighted composite scoring (0-100)
            ├── Critical Hallucination & Contradiction Overrides
            ├── AI Quality Improvement Coach recommendations
            └── Persistence in SQLite (evaluations, batches, metrics)
```

---

## ✨ Key Platform Features

1. **Multi-Agent Evaluation Workspace:**
   - Evaluates user prompts across 4 dimensions: **Relevance**, **Accuracy**, **Hallucination Safety**, and **Completeness**.
   - Real-time pipeline visualizer showing actual backend stages.
   - Built-in demonstration presets (TruthfulQA, Apollo 11, Transformers).

2. **Interactive Hallucination Claim Inspector:**
   - Automatically breaks responses into granular claims.
   - Visually highlights statements directly in the response text:
     - 🟩 **Supported Claims** (Verified against reference truth)
     - 🟨 **Unsupported Claims** (Speculative or ungrounded)
     - 🟥 **Contradictions** (Direct conflicts with facts)
   - Interactive evidence drawer: Click any highlighted text to inspect evidence match and agent reasoning.

3. **RAG Evidence Explorer:**
   - Full transparency into vector search chunks.
   - Shows similarity match percentages and source documents used during evaluation.

4. **Resilient Batch CSV Evaluation:**
   - Upload CSV datasets containing hundreds of prompt-response pairs.
   - Error-isolated execution: invalid records do not halt the batch.
   - Generates batch summary analytics and download-ready Batch PDF reports.

5. **AI System Benchmark (Head-to-Head):**
   - Compares **AI System A** vs **AI System B** on identical test prompts.
   - Objective, data-backed winner declarations by Overall Quality, Accuracy, Hallucination Safety, and Completeness.

6. **Audit-Grade PDF Reports:**
   - Produces executive PDF reports using `jspdf` and `jspdf-autotable` for single evaluations and batch runs.
   - Formatted with headers, KPI scorecards, auto-formatted tables, claim breakdowns, and coaching steps.

7. **Configurable Settings & Demo Mode:**
   - Customize weights (must sum to 100%) and verdict thresholds.
   - Built-in deterministic and semantic Demo Mode for reliable demonstrations without external API credit dependencies.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling & UI:** Tailwind CSS + Lucide Icons + Canvas-Confetti
- **Charts & Visualizations:** Recharts (Radar, Pie, Bar, Line charts)
- **Database & Persistence:** SQLite with Write-Ahead Logging (`WAL` mode) via `better-sqlite3`
- **PDF Generation:** `jspdf` + `jspdf-autotable`
- **CSV Processing:** `papaparse`
- **RAG & Vector Search:** Sliding-window text chunker + normalized TF-IDF vector embeddings + sub-word character tri-grams + cosine similarity search

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js:** v18.0.0 or higher (v24.x tested and supported)
- **npm:** v9.x or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gurunagajothi/AI-Fire-Crowd-Evacuation.git
   cd "Infosys Project"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *(Defaults are pre-configured; no API keys required to run in Demo Mode)*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run the Automated Test Suite:**
   ```bash
   npm test
   ```

---

## 📄 CSV Batch Evaluation Format

Prepare a standard CSV file with the following headers:

```csv
question,ai_response,reference_answer,source_information,ai_system
"Do humans only use 10% of their brains?","No, humans use virtually 100% of their brain as shown by fMRI imaging.","Humans use virtually 100 percent of their brain, not 10 percent.","TruthfulQA Physiology","AI System A"
"Is the Great Wall of China visible from the Moon?","Yes, astronauts reported seeing the Great Wall clearly from the lunar surface.","The Great Wall is not visible from the Moon with the naked eye.","TruthfulQA Astronomy","AI System B"
```

*(Note: `reference_answer`, `source_information`, and `ai_system` are optional columns)*

---

## 📚 Documentation Links

- [System Architecture Specification](docs/architecture.md)
- [Evaluation Methodology & Formulations](docs/evaluation-methodology.md)
- [API Reference Guide](docs/api.md)
- [Testing & Verification Guide](docs/testing.md)

---

## 👥 Credits & Academic Notice

Developed as the **Final Internship Project** for **Infosys Springboard / Internship Program**.  
Designed and architected as a production-style enterprise AI Quality Assurance platform.
