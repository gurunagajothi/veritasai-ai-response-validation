'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VerdictBadge } from '../ui/Badge';
import { Search, Filter, ArrowUpRight, Calendar, Bot } from 'lucide-react';

interface EvaluationRow {
  id: string;
  question: string;
  overall_score: number;
  verdict: string;
  relevance_score: number;
  accuracy_score: number;
  hallucination_score: number;
  completeness_score: number;
  ai_system?: string;
  created_at: string;
}

export default function RecentEvaluationsTable({
  evaluations,
  title = 'Recent Evaluations',
  showFilters = true,
}: {
  evaluations: EvaluationRow[];
  title?: string;
  showFilters?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('');

  const filtered = evaluations.filter((row) => {
    const matchesSearch = row.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerdict = !verdictFilter || row.verdict === verdictFilter;
    return matchesSearch && matchesVerdict;
  });

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any evaluation row to inspect full multi-agent findings and evidence traces
          </p>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prompt or ID..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Verdicts</option>
              <option value="PASS">PASS</option>
              <option value="NEEDS IMPROVEMENT">NEEDS IMPROVEMENT</option>
              <option value="FAIL">FAIL</option>
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
            <tr>
              <th className="py-3 px-4">Evaluation ID</th>
              <th className="py-3 px-4">Question Prompt</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Verdict</th>
              <th className="py-3 px-4">Relevance</th>
              <th className="py-3 px-4">Accuracy</th>
              <th className="py-3 px-4">Hal. Safety</th>
              <th className="py-3 px-4">Completeness</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No evaluations match the specified criteria.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                    <span className="truncate block max-w-[100px]">{r.id}</span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <Link
                      href={`/evaluations/${r.id}`}
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 group-hover:underline"
                    >
                      {r.question}
                    </Link>
                    {r.ai_system && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Bot className="w-3 h-3" /> {r.ai_system}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-sm text-slate-900 dark:text-white">
                    {r.overall_score}
                  </td>
                  <td className="py-3 px-4">
                    <VerdictBadge verdict={r.verdict} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {r.relevance_score}%
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {r.accuracy_score}%
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {r.hallucination_score}%
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {r.completeness_score}%
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/evaluations/${r.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
