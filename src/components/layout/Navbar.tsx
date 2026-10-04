'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import {
  ShieldCheck,
  Menu,
  X,
  Play,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLanding = pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Veritas<span className="text-blue-600 dark:text-blue-400">AI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Infosys M1-M4
                </span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                AI Quality Intelligence Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Quick Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/evaluate"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/evaluate'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Evaluate
          </Link>
          <Link
            href="/batch"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/batch'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Batch
          </Link>
          <Link
            href="/benchmark"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/benchmark'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Benchmark
          </Link>
          <Link
            href="/docs"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/docs'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Docs
          </Link>
        </nav>

        {/* Right Side actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Link
            href="/evaluate"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Evaluate Response
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            href="/evaluate"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Single Evaluation
          </Link>
          <Link
            href="/batch"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batch Evaluation
          </Link>
          <Link
            href="/history"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Evaluation History
          </Link>
          <Link
            href="/benchmark"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            AI Comparison
          </Link>
          <Link
            href="/knowledge"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Knowledge Base
          </Link>
          <Link
            href="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Analytics
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Settings
          </Link>
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Documentation
          </Link>
        </div>
      )}
    </header>
  );
}
