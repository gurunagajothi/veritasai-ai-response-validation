'use client';

import React, { useState } from 'react';
import { RAGChunk } from '@/lib/agents/types';
import { Database, ChevronDown, ChevronUp, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import Badge from '../ui/Badge';

interface EvidenceTraceViewProps {
  evidence: RAGChunk[];
}

export default function EvidenceTraceView({ evidence }: EvidenceTraceViewProps) {
  const [expandedChunkId, setExpandedChunkId] = useState<string | null>(evidence[0]?.id || null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        No external reference chunks retrieved. Evaluation was performed using reference answer or self-contained reasoning.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">RAG Evidence Grounding Trace</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Retrieved reference passages used by Accuracy & Hallucination Judge Agents
            </p>
          </div>
        </div>
        <Badge variant="info" size="sm">
          {evidence.length} Chunks Retrieved
        </Badge>
      </div>

      <div className="space-y-3">
        {evidence.map((chunk, idx) => {
          const isExpanded = expandedChunkId === chunk.id;
          const simPercent = (chunk.similarityScore * 100).toFixed(1);

          return (
            <div
              key={chunk.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-blue-300 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
              }`}
            >
              <div
                onClick={() => setExpandedChunkId(isExpanded ? null : chunk.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {chunk.documentTitle}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {chunk.datasetName}
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{simPercent}% Match</span>
                    <span className="block text-[10px] text-slate-400">Semantic Cosine</span>
                  </div>
                  {chunk.usedInEvaluation && (
                    <Badge variant="success" size="sm">
                      <Check className="w-3 h-3" /> Used in Audit
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-200/50 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    {chunk.content}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Chunk ID: {chunk.id}</span>
                    <span>Status: Source-Grounded Anchor</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
