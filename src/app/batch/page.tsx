'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { VerdictBadge } from '@/components/ui/Badge';
import Papa from 'papaparse';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileCheck2,
  ArrowUpRight,
  Sparkles,
  Bot
} from 'lucide-react';

export default function BatchEvaluationPage() {
  const [batchName, setBatchName] = useState('');
  const [aiSystem, setAiSystem] = useState('AI System A');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0, currentPrompt: '' });
  const [batchResult, setBatchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadSampleCsv = () => {
    const sample = `question,ai_response,reference_answer,source_information,ai_system
"Do humans only use 10% of their brains?","No, humans use virtually 100% of their brain as shown by fMRI imaging.","Humans use virtually 100 percent of their brain, not 10 percent.","TruthfulQA Physiology","AI System A"
"Is the Great Wall of China visible from the Moon?","Yes, Neil Armstrong reported seeing the Great Wall clearly from the lunar surface.","The Great Wall is not visible from the Moon with the naked eye.","TruthfulQA Astronomy","AI System B"
"Can antibiotics cure influenza?","Antibiotics only target bacteria and cannot treat viral infections like flu.","Antibiotics kill bacteria but are ineffective against viruses.","TruthfulQA Medicine","AI System A"
"What is photosynthesis?","Photosynthesis converts light into chemical energy with formula 6CO2 + 6H2O -> C6H12O6 + 6O2.","Process converting light into glucose and oxygen.","SQuAD Biology","AI System A"`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_evaluation_batch.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setBatchResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }
        if (!results.data || results.data.length === 0) {
          setError('CSV file contains no valid data rows.');
          return;
        }
        setParsedRows(results.data);
      },
    });
  };

  const handleStartBatch = async () => {
    if (parsedRows.length === 0) {
      setError('Please upload a CSV file with valid prompt and response rows.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress({ processed: 0, total: parsedRows.length, currentPrompt: 'Initializing resilient batch runner...' });

    try {
      const res = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchName: batchName.trim() || fileName || `Batch ${new Date().toLocaleDateString()}`,
          rows: parsedRows,
          aiSystem,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process batch.');
      }

      setBatchResult(json);
      setProgress({ processed: parsedRows.length, total: parsedRows.length, currentPrompt: 'Batch processing complete!' });
    } catch (err: any) {
      setError(err.message || 'An error occurred during batch evaluation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Resilient Batch CSV Evaluation
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload evaluation datasets to run multi-agent audits across hundreds of AI responses in parallel.
            </p>
          </div>

          <button
            onClick={handleDownloadSampleCsv}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV Template
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Upload & Configuration Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-1">
                Batch Name / Job Identifier
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. Enterprise QA Benchmark - Sprint 24"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-1">
                Default Target AI System
              </label>
              <select
                value={aiSystem}
                onChange={(e) => setAiSystem(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AI System A">AI System A</option>
                <option value="AI System B">AI System B</option>
                <option value="Gemini-1.5-Flash">Gemini-1.5-Flash</option>
                <option value="GPT-4o-Mini">GPT-4o-Mini</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop File Area */}
          <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <label className="cursor-pointer font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Click to browse CSV file
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-400 mt-1">
                Supported columns: question, ai_response, reference_answer (optional), source_information (optional), ai_system (optional)
              </p>
            </div>
            {fileName && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{fileName} ({parsedRows.length} records parsed)</span>
              </div>
            )}
          </div>

          {parsedRows.length > 0 && !isProcessing && !batchResult && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ready to evaluate {parsedRows.length} prompt responses with isolated error resilience.
              </span>
              <button
                onClick={handleStartBatch}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all text-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Launch Batch Evaluation
              </button>
            </div>
          )}
        </div>

        {/* Live Processing Indicator */}
        {isProcessing && (
          <div className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Batch Evaluation in Progress</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                {progress.total} Total Records
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse-subtle w-full" />
            </div>
            <p className="text-xs text-slate-400">{progress.currentPrompt}</p>
          </div>
        )}

        {/* Batch Results & Summary Statistics */}
        {batchResult && (
          <div className="space-y-6">
            {/* Header & PDF Export */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-blue-50/20 dark:from-slate-900 dark:to-blue-950/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  ✓ Batch Audit Completed
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {batchResult.batchName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Batch ID: {batchResult.batchId}</p>
              </div>

              <a
                href={`/api/export/pdf?batch_id=${batchResult.batchId}`}
                download
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 self-start md:self-auto"
              >
                <Download className="w-4 h-4" />
                Download Batch PDF Report
              </a>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Records</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {batchResult.summary.totalRecords}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Passed</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {batchResult.summary.passCount}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block uppercase">Needs Impr.</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {batchResult.summary.needsImprovementCount}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block uppercase">Failed</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {batchResult.summary.failCount}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Avg Score</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {batchResult.summary.avgOverallScore}/100
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Avg Accuracy</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {batchResult.summary.avgAccuracy}%
                </span>
              </div>
            </div>

            {/* Detailed Row-by-Row Evaluation Table */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Batch Evaluated Records</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Question Prompt</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Verdict</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Hal. Safety</th>
                      <th className="py-3 px-4">Completeness</th>
                      <th className="py-3 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                    {batchResult.evaluations.map((r: any, idx: number) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-medium text-slate-400">#{idx + 1}</td>
                        <td className="py-3 px-4 max-w-sm">
                          <Link href={`/evaluations/${r.id}`} className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 line-clamp-1">
                            {r.question}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-extrabold text-sm text-slate-900 dark:text-white">
                          {r.overallScore}
                        </td>
                        <td className="py-3 px-4">
                          <VerdictBadge verdict={r.verdict} size="sm" />
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {r.accuracyScore}%
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {r.hallucinationScore}%
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {r.completenessScore}%
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/evaluations/${r.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            Audit Details &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
