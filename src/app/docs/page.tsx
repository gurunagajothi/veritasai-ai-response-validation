'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import {
  BookOpen,
  Layers,
  ShieldCheck,
  Code2,
  FileSpreadsheet,
  CheckCircle2,
  Cpu,
  Database,
  FileText
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-8">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Platform Documentation & Architecture
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System architectural blueprints, multi-agent evaluation formulas, API reference, and Infosys internship milestones.
          </p>
        </div>

        {/* Milestone Verification Card */}
        <div className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
          <h2 className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Infosys Internship Milestone Fulfillment Matrix
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                ✓ Milestone 1: Foundation, RAG & Knowledge Base
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                TruthfulQA & SQuAD datasets, text cleaning, sliding-window chunker, TF-IDF + sub-word vector embedding, cosine retriever, and custom doc ingestion.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                ✓ Milestone 2: Relevance, Accuracy & Hallucination Agents
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Intent alignment, topic drift detection, fact verification against gold truth & RAG, claim extraction, severity rating, and character span highlighting.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                ✓ Milestone 3: Completeness, Verdict & Batch Evaluation
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Sub-question decomposition, configurable weighted composite scoring, critical hallucination overrides, and resilient CSV batch evaluation.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                ✓ Milestone 4: Dashboard, PDF Reports & Demonstration
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Executive KPI dashboard, Recharts visualizations, single & batch audit PDF generators with auto-tables, AI System Benchmark, and comprehensive tests.
              </p>
            </div>
          </div>
        </div>

        {/* System Architecture */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            1. System Architecture
          </h2>
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`User Input (Question, AI Response, Optional Reference/Context)
    │
    ▼
Evaluation Orchestrator (/api/evaluate)
    │
    ├──► Stage 1: Input Validation (Token density, syntax, boundary check)
    │
    ├──► Stage 2: RAG Pipeline & Vector Search
    │       ├── SQLite Knowledge Base (TruthfulQA, SQuAD, Custom Docs)
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
            └── Persistence in SQLite (evaluations, batches, metrics)`}
            </div>
          </div>
        </section>

        {/* Evaluation Methodology */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            2. Multi-Agent Evaluation Methodology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-blue-600 dark:text-blue-400">Relevance Judge (Default 20%)</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Computes prompt-to-response semantic vector cosine similarity combined with keyword token coverage and first-sentence directness. Detects topic drift across closing paragraphs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400">Accuracy Judge (Default 35%)</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Evaluates factual claims against reference answers and retrieved RAG chunks. Categorizes claims into Correct, Partially Correct, Incorrect, and Contradictions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-amber-600 dark:text-amber-400">Hallucination Agent (Default 25%)</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Decomposes text into atomic propositions. Verifies support from reference evidence or flags unsupported/fabricated statements with severity (Low, Medium, High, Critical).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-purple-600 dark:text-purple-400">Completeness Judge (Default 20%)</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Decomposes prompt into core dimensions and constraints (What, Why, How, Compare). Audits whether each is Addressed (✓), Partially Addressed (⚠), or Missing (✕).
              </p>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-violet-600" />
            3. API Endpoint Reference
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500">
                <tr>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-blue-600">POST</td>
                  <td className="py-2.5 px-4 font-mono">/api/evaluate</td>
                  <td className="py-2.5 px-4">Executes full 5-agent evaluation pipeline on a single response</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-blue-600">POST</td>
                  <td className="py-2.5 px-4 font-mono">/api/batch</td>
                  <td className="py-2.5 px-4">Resilient batch processor with error isolation for CSV uploads</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-emerald-600">GET</td>
                  <td className="py-2.5 px-4 font-mono">/api/evaluations</td>
                  <td className="py-2.5 px-4">Lists evaluations with search, verdict filters, and pagination</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-emerald-600">GET</td>
                  <td className="py-2.5 px-4 font-mono">/api/evaluations/[id]</td>
                  <td className="py-2.5 px-4">Retrieves complete structured audit record for an evaluation</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-emerald-600">GET</td>
                  <td className="py-2.5 px-4 font-mono">/api/analytics</td>
                  <td className="py-2.5 px-4">Calculates executive KPIs, verdict distributions, and trends</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-emerald-600">GET</td>
                  <td className="py-2.5 px-4 font-mono">/api/benchmark</td>
                  <td className="py-2.5 px-4">Compares AI System A vs AI System B with data-backed winners</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-emerald-600">GET</td>
                  <td className="py-2.5 px-4 font-mono">/api/export/pdf</td>
                  <td className="py-2.5 px-4">Generates downloadable executive PDF report (single or batch)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
