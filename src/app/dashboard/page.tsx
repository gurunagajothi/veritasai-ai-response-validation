'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import KpiCards from '@/components/dashboard/KpiCards';
import Charts from '@/components/dashboard/Charts';
import RecentEvaluationsTable from '@/components/dashboard/RecentEvaluationsTable';
import { Sparkles, FileSpreadsheet, RefreshCw, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load analytics data');
      }
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Executive AI Quality Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multi-agent response evaluations, hallucination monitoring, and dimension health metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/evaluate"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              New Evaluation
            </Link>

            <Link
              href="/batch"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Batch CSV
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>Error loading dashboard analytics: {error}</p>
          </div>
        )}

        {loading && !data ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              <div className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
            </div>
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <KpiCards summary={data.summary} />

            {/* Charts Section */}
            <Charts
              verdictData={data.verdictDistribution}
              dimensionAverages={data.dimensionAverages}
              scoreBuckets={data.scoreBuckets}
              trends={data.trends}
            />

            {/* Recent Evaluations Table */}
            <RecentEvaluationsTable evaluations={data.recentEvaluations || []} />
          </>
        ) : null}
      </main>
    </div>
  );
}
