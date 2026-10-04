# Comprehensive Testing & Verification Guide

## AI Response Validation & Quality Intelligence Platform

This document describes the test methodology, automated unit and integration tests, and end-to-end user journeys implemented in the platform.

---

### 1. Running the Automated Test Suite

To run the automated test suite:

```bash
npm test
```

This executes `scripts/test-runner.ts` via `tsx`, testing the following components:
1. **Document Chunker:** Validates text normalization and sliding window chunking with word boundaries and overlap.
2. **Vector Store:** Verifies embedding generation, sub-word tri-gram resilience, and mathematical cosine similarity properties.
3. **Relevance Judge Agent:** Verifies prompt topical alignment, intent matching, and topic drift detection.
4. **Accuracy Judge Agent:** Tests factual verification against gold reference answers and contradiction detection.
5. **Hallucination Detection Agent:** Asserts claim extraction, ungrounded statement detection, and critical severity tagging.
6. **Completeness Judge Agent:** Tests requirement decomposition and tracking of addressed vs missing facets.
7. **Verdict Agent:** Validates weighted composite calculation and critical hallucination override enforcement.
8. **RAG Retriever:** Verifies benchmark dataset seeding (TruthfulQA and SQuAD) and cosine similarity ranking.
9. **SQLite Database:** Verifies table schemas, indices, and database write-ahead logging (WAL).
10. **PDF Report Generator:** Verifies binary PDF generation with tables and scorecards without exceptions.

---

### 2. End-to-End User Verification Flows

#### Flow 1: Single Evaluation to PDF Audit
1. Navigate to `http://localhost:3000/evaluate`.
2. Click the preset button **"TruthfulQA Brain Myth"** or enter a custom prompt and AI response.
3. Click **"Evaluate AI Response"**.
4. Observe real-time visual progress across all 7 pipeline stages.
5. Review the resulting audit report at `/evaluations/[id]`.
6. Click any highlighted claim in the **Hallucinated Claims Inspector** to view evidence matching.
7. Click **"Download PDF Report"** to verify generation of the PDF audit document.

#### Flow 2: Batch CSV Evaluation to Analytics
1. Navigate to `http://localhost:3000/batch`.
2. Click **"Download Sample CSV Template"** to inspect format.
3. Drag & drop or browse a `.csv` file.
4. Click **"Launch Batch Evaluation"**.
5. Observe resilient record-by-record processing.
6. Review aggregate KPI statistics and individual row audits.
7. Click **"Download Batch PDF Report"**.
8. Navigate to `/dashboard` to verify updated KPI counts and charts.

#### Flow 3: AI System Benchmark (A vs B)
1. Navigate to `http://localhost:3000/benchmark`.
2. Select **Model A** (`AI System A`) and **Model B** (`AI System B`).
3. Verify head-to-head comparison charts and data-backed winner declarations.

#### Flow 4: RAG Grounding & Knowledge Ingestion
1. Navigate to `http://localhost:3000/knowledge`.
2. In the **Semantic Vector Retrieval Test** input, type `Apollo 11 lunar landing`.
3. Verify that retrieved chunks from SQuAD return with similarity percentages.
4. Click **"Ingest Document"** and add a custom test passage to verify real-time chunking and indexing.
