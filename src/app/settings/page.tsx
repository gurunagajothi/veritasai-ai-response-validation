'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Settings as SettingsIcon, Sliders, ShieldCheck, Check, Save, RefreshCw, Key, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [weights, setWeights] = useState({
    relevance: 20,
    accuracy: 35,
    hallucination: 25,
    completeness: 20,
  });

  const [thresholdPass, setThresholdPass] = useState(80);
  const [thresholdNeedsImprovement, setThresholdNeedsImprovement] = useState(60);
  const [enableDemoMode, setEnableDemoMode] = useState(true);

  const [savedMessage, setSavedMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  const totalWeight = weights.relevance + weights.accuracy + weights.hallucination + weights.completeness;
  const isWeightValid = totalWeight === 100;

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.settings) {
          const w = json.settings.weights;
          if (w) {
            setWeights({
              relevance: Math.round(w.relevance * 100),
              accuracy: Math.round(w.accuracy * 100),
              hallucination: Math.round(w.hallucination * 100),
              completeness: Math.round(w.completeness * 100),
            });
          }
          if (json.settings.thresholdPass) setThresholdPass(json.settings.thresholdPass);
          if (json.settings.thresholdNeedsImprovement) setThresholdNeedsImprovement(json.settings.thresholdNeedsImprovement);
          if (json.settings.enableDemoMode !== undefined) setEnableDemoMode(json.settings.enableDemoMode);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightValid) {
      alert('The four evaluation weights must sum to exactly 100%.');
      return;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights: {
            relevance: weights.relevance / 100,
            accuracy: weights.accuracy / 100,
            hallucination: weights.hallucination / 100,
            completeness: weights.completeness / 100,
          },
          thresholdPass,
          thresholdNeedsImprovement,
          enableDemoMode,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleResetDefaults = () => {
    setWeights({
      relevance: 20,
      accuracy: 35,
      hallucination: 25,
      completeness: 20,
    });
    setThresholdPass(80);
    setThresholdNeedsImprovement(60);
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Platform & Evaluation Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure multi-agent dimension weights, verdict score thresholds, and API model providers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              type="button"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-400 animate-fade-in">
            <Check className="w-4 h-4" />
            <p>Settings updated successfully! New weights will govern all subsequent evaluations.</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Dimension Weights Customizer */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Multi-Agent Dimension Weights</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Adjust the relative influence of each judge agent in calculating the final 0–100 composite score.
                  </p>
                </div>
              </div>
              <div className={`text-xs font-bold px-3 py-1 rounded-full ${isWeightValid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'}`}>
                Sum: {totalWeight}% / 100%
              </div>
            </div>

            <div className="space-y-4">
              {/* Relevance */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Relevance Weight</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{weights.relevance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights.relevance}
                  onChange={(e) => setWeights({ ...weights, relevance: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Accuracy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Accuracy Weight (Recommended Highest)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{weights.accuracy}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights.accuracy}
                  onChange={(e) => setWeights({ ...weights, accuracy: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Hallucination */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Hallucination Safety Weight</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{weights.hallucination}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights.hallucination}
                  onChange={(e) => setWeights({ ...weights, hallucination: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Completeness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Completeness Coverage Weight</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{weights.completeness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights.completeness}
                  onChange={(e) => setWeights({ ...weights, completeness: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Verdict Thresholds */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Verdict Score Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                  PASS Threshold (≥ Score)
                </label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={thresholdPass}
                  onChange={(e) => setThresholdPass(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <label className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                  NEEDS IMPROVEMENT Threshold (≥ Score)
                </label>
                <input
                  type="number"
                  min="30"
                  max="79"
                  value={thresholdNeedsImprovement}
                  onChange={(e) => setThresholdNeedsImprovement(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Demo Mode & Environment Credentials */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">LLM Provider & Demo Credentials</h3>
                <p className="text-xs text-slate-400">Environment variables managed via .env with zero-exposure security.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-blue-900 dark:text-blue-200 block">
                  Built-in Deterministic & Semantic Demo Mode
                </span>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Enables high-fidelity multi-agent evaluation and RAG search without requiring paid external API keys.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDemoMode}
                  onChange={(e) => setEnableDemoMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!isWeightValid}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 text-xs"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
