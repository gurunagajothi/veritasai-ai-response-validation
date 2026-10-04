'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { VerdictBadge } from '@/components/ui/Badge';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function HistoryPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [verdict, setVerdict] = useState('');
  const [aiSystem, setAiSystem] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (verdict.trim()) params.append('verdict', verdict.trim());
      if (aiSystem.trim()) params.append('ai_system', aiSystem.trim());
      if (minScore.trim()) params.append('min_score', minScore.trim());
      if (maxScore.trim()) params.append('max_score', maxScore.trim());
      params.append('limit', '100');

      const res = await fetch(`/api/evaluations?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load evaluation history.');
      setEvaluations(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [verdict, aiSystem]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete evaluation ${id}?`)) return;

    try {
      const res = await fetch(`/api/evaluations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvaluations(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Evaluation Audit History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Searchable, filterable log of all individual response evaluations and multi-agent audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/csv"
              download
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export History (CSV)
            </a>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Filters Form */}
        <form onSubmit={handleSearchSubmit} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by question text or ID..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Verdicts</option>
                <option value="PASS">PASS</option>
                <option value="NEEDS IMPROVEMENT">NEEDS IMPROVEMENT</option>
                <option value="FAIL">FAIL</option>
              </select>
            </div>

            <div>
              <select
                value={aiSystem}
                onChange={(e) => setAiSystem(e.target.value)}
                className="w-full py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All AI Systems</option>
                <option value="AI System A">AI System A</option>
                <option value="AI System B">AI System B</option>
                <option value="Gemini-1.5-Flash">Gemini-1.5-Flash</option>
                <option value="GPT-4o-Mini">GPT-4o-Mini</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="Min Score"
                className="w-1/2 py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white text-center"
              />
              <button
                type="submit"
                className="w-1/2 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Filter
              </button>
            </div>
          </div>
        </form>

        {/* History Table */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">
              {evaluations.length} Evaluations Logged
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Evaluation ID</th>
                  <th className="py-3 px-4">Question Prompt</th>
                  <th className="py-3 px-4">AI Model</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Relevance</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Hal. Safety</th>
                  <th className="py-3 px-4">Completeness</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {evaluations.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      No evaluation records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 group">
                      <td className="py-3 px-4 font-mono font-medium text-slate-400 truncate max-w-[90px]">
                        {ev.id}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <Link
                          href={`/evaluations/${ev.id}`}
                          className="font-medium text-slate-900 dark:text-white hover:text-blue-600 line-clamp-1"
                        >
                          {ev.question}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {ev.ai_system || 'AI System'}
                      </td>
                      <td className="py-3 px-4 font-black text-sm text-slate-900 dark:text-white">
                        {ev.overall_score}
                      </td>
                      <td className="py-3 px-4">
                        <VerdictBadge verdict={ev.verdict} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {ev.relevance_score}%
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {ev.accuracy_score}%
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {ev.hallucination_score}%
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {ev.completeness_score}%
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(ev.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/evaluations/${ev.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            Inspect
                          </Link>
                          <a
                            href={`/api/export/pdf?id=${ev.id}`}
                            download
                            className="text-slate-400 hover:text-slate-600"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={(e) => handleDelete(ev.id, e)}
                            className="text-rose-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
