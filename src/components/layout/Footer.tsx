import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm transition-colors py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">VeritasAI</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enterprise Multi-Agent AI Response Validation & Quality Intelligence Platform. Built for Infosys Final Internship Project.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Evaluation</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/evaluate" className="hover:text-blue-600 dark:hover:text-blue-400">Single Evaluation</Link></li>
              <li><Link href="/batch" className="hover:text-blue-600 dark:hover:text-blue-400">Batch CSV Upload</Link></li>
              <li><Link href="/benchmark" className="hover:text-blue-600 dark:hover:text-blue-400">AI Benchmark (A vs B)</Link></li>
              <li><Link href="/history" className="hover:text-blue-600 dark:hover:text-blue-400">Audit History</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">RAG & Analytics</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Executive Dashboard</Link></li>
              <li><Link href="/knowledge" className="hover:text-blue-600 dark:hover:text-blue-400">Knowledge Base & Benchmarks</Link></li>
              <li><Link href="/evidence" className="hover:text-blue-600 dark:hover:text-blue-400">RAG Evidence Explorer</Link></li>
              <li><Link href="/analytics" className="hover:text-blue-600 dark:hover:text-blue-400">Batch Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Platform & Specs</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/docs" className="hover:text-blue-600 dark:hover:text-blue-400">Architecture & Methodology</Link></li>
              <li><Link href="/settings" className="hover:text-blue-600 dark:hover:text-blue-400">Evaluation Weights & API</Link></li>
              <li><span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Milestones 1-4 Complete</span></li>
              <li><span className="text-slate-400">v1.0.0 Enterprise Release</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AI Response Validation & Quality Intelligence Platform. Infosys Final Internship Project.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[11px]">
              Multi-Agent Orchestrator: Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
