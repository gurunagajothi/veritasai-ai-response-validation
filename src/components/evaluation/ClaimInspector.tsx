'use client';

import React, { useState } from 'react';
import { HallucinationClaim, HallucinationSeverity } from '@/lib/agents/types';
import Badge, { SeverityBadge } from '../ui/Badge';
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle, Search, Info, ExternalLink } from 'lucide-react';

interface ClaimInspectorProps {
  claims: HallucinationClaim[];
  rawText: string;
}

export default function ClaimInspector({ claims, rawText }: ClaimInspectorProps) {
  const [selectedClaim, setSelectedClaim] = useState<HallucinationClaim | null>(
    claims.find(c => c.status !== 'Supported') || claims[0] || null
  );
  const [filter, setFilter] = useState<'ALL' | 'UNSUPPORTED' | 'CONTRADICTED' | 'SUPPORTED'>('ALL');
  const [viewMode, setViewMode] = useState<'interactive' | 'table'>('interactive');

  const filteredClaims = claims.filter(c => {
    if (filter === 'UNSUPPORTED') return c.status === 'Unsupported';
    if (filter === 'CONTRADICTED') return c.status === 'Contradicted';
    if (filter === 'SUPPORTED') return c.status === 'Supported';
    return true;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'Supported') {
      return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3" /> Supported</Badge>;
    }
    if (status === 'Contradicted') {
      return <Badge variant="danger" size="sm"><XCircle className="w-3 h-3" /> Contradicted</Badge>;
    }
    return <Badge variant="warning" size="sm"><AlertTriangle className="w-3 h-3" /> Unsupported</Badge>;
  };

  const getClaimHighlightClass = (claim: HallucinationClaim) => {
    if (claim.status === 'Contradicted') return 'claim-highlight-contradicted';
    if (claim.status === 'Unsupported') {
      if (claim.severity === 'Critical') return 'claim-highlight-critical';
      if (claim.severity === 'High') return 'claim-highlight-unsupported-high';
      return 'claim-highlight-unsupported-medium';
    }
    return 'claim-highlight-supported';
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Claims ({claims.length})
          </button>
          <button
            onClick={() => setFilter('UNSUPPORTED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'UNSUPPORTED'
                ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unsupported ({claims.filter(c => c.status === 'Unsupported').length})
          </button>
          <button
            onClick={() => setFilter('CONTRADICTED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'CONTRADICTED'
                ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Contradicted ({claims.filter(c => c.status === 'Contradicted').length})
          </button>
          <button
            onClick={() => setFilter('SUPPORTED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filter === 'SUPPORTED'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Supported ({claims.filter(c => c.status === 'Supported').length})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">View:</span>
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-2.5 py-1 rounded-md font-medium ${
              viewMode === 'interactive'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Interactive Text
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 rounded-md font-medium ${
              viewMode === 'table'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {viewMode === 'interactive' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Highlighted text panel */}
          <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider">AI Response with Claim Highlighting</span>
              <span>Click any highlighted span to inspect evidence</span>
            </div>

            <div className="text-sm leading-relaxed p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 font-sans space-y-2">
              {claims.map((claim, idx) => {
                const isSelected = selectedClaim?.id === claim.id;
                return (
                  <span
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className={`inline px-1 py-0.5 rounded cursor-pointer transition-all ${getClaimHighlightClass(claim)} ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 font-medium' : ''
                    }`}
                    title={`Click to inspect claim #${idx + 1} (${claim.status})`}
                  >
                    {claim.text}{' '}
                  </span>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500" /> Supported Claim
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500" /> Unsupported / Speculative
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/30 border border-rose-500" /> Contradiction / Critical
              </span>
            </div>
          </div>

          {/* Evidence Inspector Drawer */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20 shadow-sm flex flex-col justify-between">
            {selectedClaim ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                      {selectedClaim.id.toUpperCase()}
                    </span>
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                  <SeverityBadge severity={selectedClaim.severity} />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    AI Statement / Proposition
                  </h4>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    &ldquo;{selectedClaim.text}&rdquo;
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Ground-Truth Evidence Verification
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedClaim.evidence || 'No direct evidence found in benchmark knowledge repository.'}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Agent Verification Reasoning
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedClaim.reasoning}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
                <Info className="w-8 h-8 mb-2" />
                <p className="text-xs">Select a highlighted claim from the left panel to inspect its evidence trace.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tabular View */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">AI Statement</th>
                <th className="py-3 px-4">Support Status</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Evidence Reference</th>
                <th className="py-3 px-4">Agent Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-950">
              {filteredClaims.map((claim, idx) => (
                <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs">{claim.text}</td>
                  <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                  <td className="py-3 px-4"><SeverityBadge severity={claim.severity} /></td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-sm">{claim.evidence || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs">{claim.reasoning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
