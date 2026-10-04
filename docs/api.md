# API Reference Documentation

## AI Response Validation & Quality Intelligence Platform

Base URL: `http://localhost:3000` (or production host)

All request and response bodies use JSON format unless specified otherwise (such as PDF binary streams and CSV downloads).

---

### 1. Single Evaluation API

#### `POST /api/evaluate`
Runs the complete multi-stage evaluation pipeline across all 5 judge agents, RAG retrieval, and persists the audit in SQLite.

**Request Body:**
```json
{
  "question": "Do humans only use 10% of their brains?",
  "aiResponse": "No, humans use virtually 100% of their brain...",
  "referenceAnswer": "Humans use virtually 100 percent of their brain, not 10 percent.",
  "sourceContext": "Neuroscience reference notes...",
  "aiSystem": "AI System A",
  "isDemo": false
}
```

**Response (HTTP 200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "eval-1728000000000-xyz",
    "overallScore": 92,
    "verdict": "PASS",
    "relevanceScore": 94,
    "accuracyScore": 92,
    "hallucinationScore": 95,
    "completenessScore": 88,
    "relevanceData": { ... },
    "accuracyData": { ... },
    "hallucinationData": { "claims": [ ... ] },
    "completenessData": { "addressedAspects": [ ... ] },
    "verdictData": { "weights": { ... }, "strengths": [ ... ], "recommendations": [ ... ] },
    "retrievedEvidence": [ ... ],
    "createdAt": "2026-10-04T13:50:00.000Z"
  }
}
```

---

### 2. Batch Evaluation API

#### `POST /api/batch`
Resilient batch evaluation for CSV uploads. Validates records, isolates record-level errors, and generates batch statistics.

**Request Body:**
```json
{
  "batchName": "Enterprise Sprint 24 Benchmark",
  "aiSystem": "AI System A",
  "rows": [
    {
      "question": "What is photosynthesis?",
      "ai_response": "Photosynthesis converts light energy into glucose.",
      "reference_answer": "Process converting light into glucose."
    }
  ]
}
```

**Response (HTTP 200 OK):**
```json
{
  "success": true,
  "batchId": "batch-1728000000000-abc",
  "batchName": "Enterprise Sprint 24 Benchmark",
  "summary": {
    "totalRecords": 1,
    "successfulRecords": 1,
    "failedRecords": 0,
    "passCount": 1,
    "needsImprovementCount": 0,
    "failCount": 0,
    "avgOverallScore": 90.0,
    "avgRelevance": 92.0,
    "avgAccuracy": 90.0,
    "avgHallucination": 95.0,
    "avgCompleteness": 85.0
  },
  "evaluations": [ ... ],
  "failures": []
}
```

#### `GET /api/batch`
Returns the 50 most recent batch evaluation summaries.

---

### 3. Evaluation History API

#### `GET /api/evaluations`
Search and filter evaluations.

**Query Parameters:**
- `search`: String (searches prompt text or ID)
- `verdict`: `PASS` | `NEEDS IMPROVEMENT` | `FAIL`
- `ai_system`: String filter
- `batch_id`: String filter
- `min_score`: Number (0-100)
- `max_score`: Number (0-100)
- `limit`: Number (default: 50, max: 100)
- `offset`: Number (default: 0)

#### `GET /api/evaluations/[id]`
Returns the full record for a specific evaluation ID.

#### `DELETE /api/evaluations/[id]`
Deletes an evaluation from the database.

---

### 4. Executive Analytics API

#### `GET /api/analytics`
Returns dashboard KPIs, verdict distributions, dimension averages, score brackets, trends, and recent records.

---

### 5. AI System Benchmark API

#### `GET /api/benchmark?system_a=AI System A&system_b=AI System B`
Calculates side-by-side metrics across models and returns objective winner declarations.

---

### 6. Knowledge Base Management API

#### `GET /api/knowledge`
Returns dataset list, document count, and total indexed chunks.
If `?query=...` is provided, performs semantic vector retrieval and returns ranked chunks.

#### `POST /api/knowledge`
Ingests a new reference document, chunks it, and creates vector embeddings.

---

### 7. Settings API

#### `GET /api/settings`
Returns current dimension weights and verdict thresholds.

#### `POST /api/settings`
Updates weights (must sum to 100%), thresholds, and demo mode.

---

### 8. Export APIs

#### `GET /api/export/pdf?id=[evalId]`
Downloads executive single evaluation audit PDF report.

#### `GET /api/export/pdf?batch_id=[batchId]`
Downloads batch summary evaluation PDF report.

#### `GET /api/export/csv?batch_id=[optionalBatchId]`
Exports evaluations as a downloadable CSV dataset.
