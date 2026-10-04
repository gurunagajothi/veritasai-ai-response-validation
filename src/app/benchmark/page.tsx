'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { GitCompare, Trophy, Bot, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function BenchmarkPage() {
  const [systemA, setSystemA] = useState('AI System A');
  const [systemB, setSystemB] = useState('AI System B');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/benchmark?system_a=${encodeURIComponent(systemA)}&system_b=${encodeURIComponent(systemB)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch benchmark.');
      }
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmark();
  }, [systemA, systemB]);

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              AI System Benchmark (Head-to-Head)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Objective comparison of two AI models across identical prompts with data-backed winner declarations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={systemA}
              onChange={(e) => setSystemA(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AI System A">Model A (AI System A)</option>
              <option value="Gemini-1.5-Flash">Model A (Gemini-1.5-Flash)</option>
              <option value="GPT-4o-Mini">Model A (GPT-4o-Mini)</option>
            </select>

            <span className="text-xs font-bold text-slate-400">vs</span>

            <select
              value={systemB}
              onChange={(e) => setSystemB(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AI System B">Model B (AI System B)</option>
              <option value="Custom LLM Agent">Model B (Custom LLM Agent)</option>
              <option value="GPT-4o-Mini">Model B (GPT-4o-Mini)</option>
            </select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900" />
              <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900" />
            </div>
            <div className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-900" />
          </div>
        ) : data ? (
          <>
            {/* Winners Banner */}
            <div className="p-6 rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Objective Data-Backed Winner Declarations
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/50 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Overall Quality</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 truncate block">
                    {data.winners.overallQuality}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/50 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Factual Accuracy</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 truncate block">
                    {data.winners.accuracy}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/50 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Hallucination Safety</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 truncate block">
                    {data.winners.hallucinationSafety}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/50 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Completeness</span>
                  <span className="font-extrabold text-purple-600 dark:text-purple-400 truncate block">
                    {data.winners.completeness}
                  </span>
                </div>
              </div>
            </div>

            {/* Side-by-Side Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System A Card */}
              <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{data.systemA.system}</h3>
                      <span className="text-[11px] text-slate-400">{data.systemA.count} Evaluations Evaluated</span>
                    </div>
                  </div>
                  <Badge variant="info" size="lg">{data.systemA.overallScore}/100</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Factual Accuracy:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.systemA.accuracy}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Hallucination Safety:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.systemA.hallucinationSafety}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Completeness Coverage:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.systemA.completeness}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Pass Rate:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.systemA.passRate}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Hallucination Incident Rate:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{data.systemA.hallucinationRate}%</span>
                  </div>
                </div>
              </div>

              {/* System B Card */}
              <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{data.systemB.system}</h3>
                      <span className="text-[11px] text-slate-400">{data.systemB.count} Evaluations Evaluated</span>
                    </div>
                  </div>
                  <Badge variant="purple" size="lg">{data.systemB.overallScore}/100</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Factual Accuracy:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.systemB.accuracy}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Hallucination Safety:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.systemB.hallucinationSafety}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Completeness Coverage:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.systemB.completeness}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Pass Rate:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.systemB.passRate}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Hallucination Incident Rate:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{data.systemB.hallucinationRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Bar Chart */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Head-to-Head Dimension Comparison</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
                    <XAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    <Bar dataKey={data.systemA.system} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={data.systemB.system} fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
