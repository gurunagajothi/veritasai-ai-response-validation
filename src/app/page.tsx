import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  FileCheck2,
  AlertTriangle,
  BarChart3,
  FileText,
  Lightbulb,
  CheckCircle2,
  GitCompare,
  Zap,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-gradient-to-b from-blue-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800/80 shadow-sm animate-pulse-subtle">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Infosys Internship Project • Milestones 1–4 Complete</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Measure AI Quality.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Detect Hallucinations.
            </span>{' '}
            Trust Your Responses.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            An intelligent multi-agent platform for evaluating relevance, accuracy, completeness, and hallucinations in AI-generated responses with source-grounded RAG verification.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/evaluate"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Evaluate a Response
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Explore Dashboard
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">Agents</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">5 Logical Judges</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">RAG Engine</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">TruthfulQA & SQuAD</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">Hallucinations</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">Claim-Level Audit</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">Reports</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">Audit-Grade PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Pipeline */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-2">
              Architecture & Lifecycle
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              End-to-End Evaluation Pipeline
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              How the platform validates user prompts, grounds claims against knowledge, and calculates deterministic verdicts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Input Validation & RAG</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ingests question, AI response, and reference texts. Performs semantic vector search across TruthfulQA and SQuAD knowledge repositories.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Multi-Agent Judgments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Four specialized agents analyze Relevance, Accuracy, Completeness, and Hallucination claim-by-claim.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Verdict & Override</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Verdict Agent computes weighted score (100 pts) and enforces critical hallucination or contradiction overrides.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Actionable Coaching & PDF</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Delivers AI Improvement Coach recommendations, interactive highlighted evidence traces, and executive PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Multi-Agent Evaluation & Features Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-2">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enterprise AI Quality Assurance Suite
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Multi-Agent Evaluation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Separate logical agents evaluate Relevance, Accuracy, Completeness, and Hallucinations with structured, auditable outputs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 w-fit">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Hallucination Detection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Decomposes responses into atomic claims, audits them against RAG evidence, classifies severity (Low to Critical), and highlights text spans.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 w-fit">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">RAG Grounded Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Vector similarity indexing with preloaded TruthfulQA and SQuAD benchmark datasets, custom document ingestion, and transparent evidence trace.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 w-fit">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Batch Evaluation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                High-throughput resilient CSV batch processor. Handles malformed rows gracefully and generates batch summary analytics.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 w-fit">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">AI System Benchmark</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Head-to-head comparison between AI System A and AI System B on identical prompt datasets with objective, data-backed winner declarations.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Audit-Grade PDF Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Export comprehensive audit reports with KPI scorecards, multi-agent findings, hallucinated claims table, and improvement recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Call to Action */}
      <section className="py-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to evaluate and trust your AI responses?
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Run an instant multi-agent evaluation or upload a CSV dataset to benchmark your enterprise AI systems.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/evaluate"
              className="px-8 py-3.5 rounded-xl font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-lg active:scale-95 transition-all text-sm"
            >
              Start Single Evaluation
            </Link>
            <Link
              href="/batch"
              className="px-8 py-3.5 rounded-xl font-bold bg-blue-800/60 hover:bg-blue-800 text-white border border-white/20 active:scale-95 transition-all text-sm"
            >
              Upload Batch CSV
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
