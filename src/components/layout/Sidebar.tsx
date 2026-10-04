'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  FileSpreadsheet,
  History,
  GitCompare,
  Database,
  Search,
  BarChart3,
  Settings,
  BookOpen,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Single Evaluation', href: '/evaluate', icon: Sparkles, badge: 'Core' },
  { name: 'Batch Evaluation', href: '/batch', icon: FileSpreadsheet },
  { name: 'Evaluation History', href: '/history', icon: History },
  { name: 'AI Comparison', href: '/benchmark', icon: GitCompare, badge: 'A vs B' },
  { name: 'Knowledge Base', href: '/knowledge', icon: Database },
  { name: 'Evidence Explorer', href: '/evidence', icon: Search },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Documentation', href: '/docs', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Intelligence Platform
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 dark:bg-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Milestone info banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/40 border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
            <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Milestones M1–M4</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Multi-Agent RAG validation, claim hallucination scanner, resilient batch evaluator, & executive PDF auditor.
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            <span>Production Ready</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
