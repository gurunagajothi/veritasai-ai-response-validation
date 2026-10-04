import React from 'react';
import { Target, CheckCircle2, ShieldAlert, ListChecks, HelpCircle } from 'lucide-react';
import Badge from '../ui/Badge';

interface ScoreCardProps {
  dimension: 'relevance' | 'accuracy' | 'hallucination' | 'completeness';
  score: number;
  status: string;
  explanation: string;
  weight?: number;
  issuesCount?: number;
  onClickDetails?: () => void;
}

export default function ScoreCard({
  dimension,
  score,
  status,
  explanation,
  weight,
  issuesCount = 0,
  onClickDetails,
}: ScoreCardProps) {
  const configs = {
    relevance: {
      title: 'Relevance',
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-900/50',
      barColor: 'bg-blue-600',
    },
    accuracy: {
      title: 'Accuracy',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
      barColor: 'bg-emerald-600',
    },
    hallucination: {
      title: 'Hallucination Safety',
      icon: ShieldAlert,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
      barColor: 'bg-amber-500',
    },
    completeness: {
      title: 'Completeness',
      icon: ListChecks,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-200 dark:border-purple-900/50',
      barColor: 'bg-purple-600',
    },
  };

  const cfg = configs[dimension];
  const Icon = cfg.icon;

  const getScoreVariant = (s: number) => {
    if (s >= 80) return 'success';
    if (s >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className={`p-5 rounded-2xl border ${cfg.borderColor} bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${cfg.bgColor} ${cfg.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cfg.title}</h3>
              {weight !== undefined && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Weight: {(weight * 100).toFixed(0)}%</span>
              )}
            </div>
          </div>
          <Badge variant={getScoreVariant(score)} size="md">
            {score}/100
          </Badge>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>

        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{status}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {explanation}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        {issuesCount > 0 ? (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {issuesCount} issue{issuesCount > 1 ? 's' : ''} detected
          </span>
        ) : (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            No issues flagged
          </span>
        )}

        {onClickDetails && (
          <button
            onClick={onClickDetails}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            View Details &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
