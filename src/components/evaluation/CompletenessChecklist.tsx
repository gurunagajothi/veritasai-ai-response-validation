import React from 'react';
import { CompletenessResult, CompletenessAspect } from '@/lib/agents/types';
import { CheckCircle2, AlertTriangle, XCircle, ListFilter } from 'lucide-react';
import Badge from '../ui/Badge';

interface CompletenessChecklistProps {
  completeness: CompletenessResult;
}

export default function CompletenessChecklist({ completeness }: CompletenessChecklistProps) {
  const allAspects: CompletenessAspect[] = [
    ...(completeness.addressedAspects || []),
    ...(completeness.partiallyAddressedAspects || []),
    ...(completeness.missingAspects || []),
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'Addressed') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
    }
    if (status === 'Partially Addressed') {
      return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />;
    }
    return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Addressed') {
      return <Badge variant="success" size="sm">✓ Addressed</Badge>;
    }
    if (status === 'Partially Addressed') {
      return <Badge variant="warning" size="sm">⚠ Partially Addressed</Badge>;
    }
    return <Badge variant="danger" size="sm">✕ Missing</Badge>;
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
            <ListFilter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Question Requirement Decomposition</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates whether each explicit and implicit sub-question is covered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {completeness.addressedAspects?.length || 0} Addressed
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {completeness.partiallyAddressedAspects?.length || 0} Partial
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {completeness.missingAspects?.length || 0} Missing
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {allAspects.map((aspect) => (
          <div
            key={aspect.id}
            className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(aspect.status)}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {aspect.aspect}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {aspect.requirement}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                  Analysis: {aspect.reasoning}
                </p>
              </div>
            </div>
            <div>
              {getStatusBadge(aspect.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
