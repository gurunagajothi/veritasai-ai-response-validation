import React from 'react';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'input_validation', name: 'Input Validated', description: 'Syntax & token density check' },
  { id: 'knowledge_retrieval', name: 'Knowledge Retrieved', description: 'Semantic vector search & RAG' },
  { id: 'relevance_analysis', name: 'Relevance Analysis', description: 'Intent alignment & topic drift' },
  { id: 'accuracy_verification', name: 'Accuracy Verification', description: 'Factual entailment vs ground truth' },
  { id: 'hallucination_scan', name: 'Hallucination Scan', description: 'Atomic claim extraction & audit' },
  { id: 'completeness_analysis', name: 'Completeness Analysis', description: 'Requirement decomposition' },
  { id: 'verdict_generation', name: 'Final Verdict Generation', description: 'Weighted composite & coach' },
];

interface StageProgressProps {
  currentStageIndex: number;
  isEvaluating: boolean;
  stageMessage?: string;
}

export default function StageProgress({
  currentStageIndex,
  isEvaluating,
  stageMessage,
}: StageProgressProps) {
  const percent = Math.min(100, Math.round(((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100));

  return (
    <div className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 shadow-md space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Multi-Agent Evaluation Pipeline
            {isEvaluating && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" /> In Progress
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stageMessage || 'Executing real-time multi-agent verification stages...'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{percent}%</span>
          <span className="block text-[10px] text-slate-400">Pipeline Completion</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Stage Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {PIPELINE_STAGES.map((st, idx) => {
          const isDone = idx < currentStageIndex || (!isEvaluating && currentStageIndex === PIPELINE_STAGES.length - 1);
          const isCurrent = idx === currentStageIndex && isEvaluating;

          return (
            <div
              key={st.id}
              className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                isDone
                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-white'
                  : isCurrent
                  ? 'border-blue-400 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm'
                  : 'border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 flex-shrink-0" />
                )}
                <span className="font-bold truncate text-[11px]">{st.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                {st.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
