'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import ScoreCard from '@/components/evaluation/ScoreCard';
import ClaimInspector from '@/components/evaluation/ClaimInspector';
import CompletenessChecklist from '@/components/evaluation/CompletenessChecklist';
import EvidenceTraceView from '@/components/evaluation/EvidenceTraceView';
import RecommendationCoach from '@/components/evaluation/RecommendationCoach';
import { VerdictBadge } from '@/components/ui/Badge';
import { FullEvaluationRecord } from '@/lib/agents/types';
import {
  Download,
  Share2,
  FileJson,
  FileSpreadsheet,
  ArrowLeft,
  Calendar,
  Bot,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function EvaluationResultPage() {
  const params = useParams();
  const router = useRouter();
  const evalId = params.id as string;

  const [record, setRecord] = useState<FullEvaluationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      try {
        const res = await fetch(`/api/evaluations/${evalId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Evaluation not found.');
        }
        setRecord(json.data);

        // If PASS with high score, fire celebratory confetti
        if (json.data.verdict === 'PASS' && json.data.overallScore >= 85) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (evalId) {
      fetchRecord();
    }
  }, [evalId]);

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleExportJson = () => {
    if (!record) return;
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation_${record.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Sidebar />
        <main className="flex-1 lg:pl-8 space-y-6 animate-pulse">
          <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        </main>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Sidebar />
        <main className="flex-1 lg:pl-8 space-y-6">
          <div className="p-8 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">Evaluation Record Not Found</h2>
            <p className="text-xs text-rose-700 dark:text-rose-400">{error || 'Could not locate evaluation audit.'}</p>
            <Link
              href="/evaluate"
              className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              Start New Evaluation
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Evaluation History
          </Link>

          {/* Action Buttons: PDF, JSON, Share */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/export/pdf?id=${record.id}`}
              download
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Report
            </a>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <FileJson className="w-3.5 h-3.5" />
              Export JSON
            </button>

            <button
              onClick={handleCopyShare}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copied!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Executive Verdict Top Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <VerdictBadge verdict={record.verdict} size="lg" />
              <span className="font-mono text-xs text-slate-400">ID: {record.id}</span>
              {record.isDemo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Demo Dataset
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Response Audit Report
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" /> {record.aiSystem}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {new Date(record.createdAt).toLocaleString()}
              </span>
              <span>Confidence: {(record.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Large Overall Score Badge */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Composite Score
              </span>
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                {record.overallScore}
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </span>
            </div>
          </div>
        </div>

        {/* Four Dimension Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard
            dimension="relevance"
            score={record.relevanceScore}
            status={record.relevanceData?.category || 'Evaluated'}
            explanation={record.relevanceData?.reasoning || 'Evaluates prompt topical alignment and directness.'}
            weight={record.verdictData?.weights?.relevance}
            issuesCount={record.relevanceData?.issues?.length || 0}
          />
          <ScoreCard
            dimension="accuracy"
            score={record.accuracyScore}
            status={record.accuracyScore >= 80 ? 'High Accuracy' : 'Inconsistencies Detected'}
            explanation={record.accuracyData?.reasoning || 'Factual consistency against ground-truth and RAG.'}
            weight={record.verdictData?.weights?.accuracy}
            issuesCount={record.accuracyData?.issues?.length || 0}
          />
          <ScoreCard
            dimension="hallucination"
            score={record.hallucinationScore}
            status={`${record.hallucinationData?.hallucinationCount || 0} Flagged Claims`}
            explanation={record.hallucinationData?.reasoning || 'Claim extraction & evidence verification.'}
            weight={record.verdictData?.weights?.hallucination}
            issuesCount={record.hallucinationData?.hallucinationCount || 0}
          />
          <ScoreCard
            dimension="completeness"
            score={record.completenessScore}
            status={`${record.completenessData?.addressedAspects?.length || 0}/${record.completenessData?.totalRequirements || 0} Aspects Addressed`}
            explanation={record.completenessData?.reasoning || 'Question requirement coverage analysis.'}
            weight={record.verdictData?.weights?.completeness}
            issuesCount={record.completenessData?.missingAspects?.length || 0}
          />
        </div>

        {/* Evaluated Content Drawer: Prompt, AI Response & Reference */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Evaluated Input & Response Data
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Question Prompt</span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {record.question}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Reference Ground Truth</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {record.referenceAnswer || 'No direct reference answer provided (Evaluated against indexed RAG benchmark chunks).'}
              </p>
            </div>
          </div>
        </div>

        {/* "Why this score?" Synthesis Section */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Why This Score?</h3>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
            <p>
              The composite score of <strong className="text-blue-600 dark:text-blue-400">{record.overallScore}/100</strong> was calculated using weighted multi-agent consensus: Relevance ({(record.verdictData?.weights?.relevance || 0.2) * 100}%), Accuracy ({(record.verdictData?.weights?.accuracy || 0.35) * 100}%), Hallucination Safety ({(record.verdictData?.weights?.hallucination || 0.25) * 100}%), and Completeness ({(record.verdictData?.weights?.completeness || 0.2) * 100}%).
            </p>
            {record.verdictData?.overriddenByCriticalIssue && (
              <p className="font-bold text-rose-600 dark:text-rose-400">
                CRITICAL OVERRIDE APPLIED: {record.verdictData.overrideReason}
              </p>
            )}
          </div>
        </div>

        {/* Major Differentiating Feature: Hallucinated Claims Inspector */}
        <div className="space-y-2">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hallucination Claim Audit & Grounding
          </h2>
          <ClaimInspector
            claims={record.hallucinationData?.claims || []}
            rawText={record.aiResponse}
          />
        </div>

        {/* Completeness Checklist: Question Decomposition */}
        <CompletenessChecklist completeness={record.completenessData} />

        {/* Evidence Used & RAG Trace */}
        <EvidenceTraceView evidence={record.retrievedEvidence} />

        {/* AI Quality Improvement Coach */}
        <RecommendationCoach
          recommendations={record.recommendations}
          strengths={record.verdictData?.strengths}
          weaknesses={record.verdictData?.weaknesses}
          criticalIssues={record.verdictData?.criticalIssues}
        />
      </main>
    </div>
  );
}
