'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Charts from '@/components/dashboard/Charts';
import { BarChart3, Download, RefreshCw, AlertCircle, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch analytics.');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Batch Quality & Evaluation Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multi-dimensional analysis of response accuracy, hallucination frequency, and aggregate pass rates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/export/csv"
              download
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Evaluation Data (CSV)
            </a>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading && !data ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-900" />
            <div className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-900" />
          </div>
        ) : data ? (
          <>
            {/* Interactive Charts */}
            <Charts
              verdictData={data.verdictDistribution}
              dimensionAverages={data.dimensionAverages}
              scoreBuckets={data.scoreBuckets}
              trends={data.trends}
            />

            {/* Batch History Table */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Historical Evaluation Batches
                </h3>
                <span className="text-xs text-slate-400">{data.batches?.length || 0} Batches Registered</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Batch Name</th>
                      <th className="py-3 px-4">Total Records</th>
                      <th className="py-3 px-4">Pass</th>
                      <th className="py-3 px-4">Needs Impr.</th>
                      <th className="py-3 px-4">Fail</th>
                      <th className="py-3 px-4">Avg Score</th>
                      <th className="py-3 px-4">Created Date</th>
                      <th className="py-3 px-4 text-right">PDF Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                    {(data.batches || []).map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{b.name}</td>
                        <td className="py-3 px-4 font-semibold">{b.total_records}</td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{b.pass_count}</td>
                        <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-semibold">{b.needs_improvement_count}</td>
                        <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-semibold">{b.fail_count}</td>
                        <td className="py-3 px-4 font-black text-blue-600 dark:text-blue-400">{b.avg_overall_score}/100</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(b.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`/api/export/pdf?batch_id=${b.id}`}
                            download
                            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            Export PDF &rarr;
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
