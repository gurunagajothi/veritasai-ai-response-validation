import React from 'react';
import {
  FileCheck2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  Target,
  ShieldAlert,
  ListChecks,
  Activity
} from 'lucide-react';

interface KpiSummary {
  totalEvaluations: number;
  passRate: number;
  needsImprovementRate: number;
  failRate: number;
  avgOverallScore: number;
  avgRelevance: number;
  avgAccuracy: number;
  avgHallucination: number;
  avgCompleteness: number;
  hallucinationFrequency: number;
}

export default function KpiCards({ summary }: { summary: KpiSummary }) {
  const cards = [
    {
      label: 'Total Evaluations',
      value: summary.totalEvaluations.toLocaleString(),
      subtext: 'Audited responses',
      icon: FileCheck2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-900/40',
    },
    {
      label: 'Pass Rate',
      value: `${summary.passRate}%`,
      subtext: 'Production acceptable',
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/40',
    },
    {
      label: 'Needs Impr. Rate',
      value: `${summary.needsImprovementRate}%`,
      subtext: 'Requires tuning',
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/40',
    },
    {
      label: 'Fail Rate',
      value: `${summary.failRate}%`,
      subtext: 'Severe hallucinations/unfit',
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/40',
    },
    {
      label: 'Avg Overall Score',
      value: `${summary.avgOverallScore}/100`,
      subtext: 'Weighted multi-agent',
      icon: Sparkles,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/40',
    },
    {
      label: 'Hallucination Frequency',
      value: `${summary.hallucinationFrequency}%`,
      subtext: 'Responses with hallucinations',
      icon: ShieldAlert,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-100 dark:border-red-900/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl border ${c.border} bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-lg ${c.bg} ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {c.value}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {c.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
