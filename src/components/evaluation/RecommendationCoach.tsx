import React from 'react';
import { Lightbulb, AlertOctagon, TrendingUp, CheckCircle2 } from 'lucide-react';

interface RecommendationCoachProps {
  recommendations: string[];
  strengths?: string[];
  weaknesses?: string[];
  criticalIssues?: string[];
}

export default function RecommendationCoach({
  recommendations,
  strengths = [],
  weaknesses = [],
  criticalIssues = [],
}: RecommendationCoachProps) {
  return (
    <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shadow-sm space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-indigo-100 dark:border-slate-800">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/25">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            Smart Recommendation Engine
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
              AI Coach
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated quality coaching derived from multi-agent evaluation findings
          </p>
        </div>
      </div>

      {/* Critical Issues Alert if any */}
      {criticalIssues.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
            <AlertOctagon className="w-4 h-4" />
            <span>Critical Verdict Override Flagged</span>
          </div>
          <ul className="list-disc list-inside text-xs text-rose-800 dark:text-rose-300 space-y-1">
            {criticalIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strengths.length > 0 && (
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Key Response Strengths
            </h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Identified Weaknesses
            </h4>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              {weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actionable Recommendations List */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Actionable Optimization Steps
        </h4>
        <div className="space-y-2.5">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/80 flex items-start gap-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                {idx + 1}
              </span>
              <p>{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
