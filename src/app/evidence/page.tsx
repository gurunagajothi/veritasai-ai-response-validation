'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import EvidenceTraceView from '@/components/evaluation/EvidenceTraceView';
import { Search, Database, Bot, ArrowRight, ExternalLink } from 'lucide-react';
import { VerdictBadge } from '@/components/ui/Badge';

export default function EvidenceExplorerPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedEval, setSelectedEval] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/evaluations?limit=25');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setEvaluations(json.data);
          // Fetch full record for the first evaluation
          const firstId = json.data[0].id;
          const fullRes = await fetch(`/api/evaluations/${firstId}`);
          const fullJson = await fullRes.json();
          if (fullJson.success) {
            setSelectedEval(fullJson.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectEval = async (id: string) => {
    try {
      const res = await fetch(`/api/evaluations/${id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedEval(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            RAG Grounding & Evidence Explorer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transparent inspection of vector retrieval chunks and factual source grounding across evaluations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Evaluation Selector */}
          <div className="lg:col-span-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Select Evaluation Audit
            </h3>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {evaluations.map((ev) => {
                const isSelected = selectedEval?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => handleSelectEval(ev.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-400">{ev.id}</span>
                      <VerdictBadge verdict={ev.verdict} size="sm" />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                      {ev.question}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Evidence Explorer Details */}
          <div className="lg:col-span-8 space-y-5">
            {selectedEval ? (
              <>
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase">Selected Prompt & Response</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Score: {selectedEval.overallScore}/100</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-400 block mb-0.5">Question:</span>
                    <p className="font-semibold text-slate-900 dark:text-white mb-2">{selectedEval.question}</p>
                    <span className="font-bold text-slate-400 block mb-0.5">AI Response:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedEval.aiResponse}</p>
                  </div>
                </div>

                {/* Evidence Trace Component */}
                <EvidenceTraceView evidence={selectedEval.retrievedEvidence || []} />
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">Loading evidence trace...</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
