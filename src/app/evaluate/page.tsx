'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import StageProgress, { PIPELINE_STAGES } from '@/components/evaluation/StageProgress';
import { Sparkles, Upload, FileText, Check, AlertCircle, Bookmark, RefreshCw } from 'lucide-react';

const PRESET_EXAMPLES = [
  {
    name: 'High Quality (TruthfulQA Brain Myth)',
    question: 'Do humans only use 10% of their brains?',
    aiResponse: 'No, humans do not only use 10% of their brains. This is a persistent neuroscientific myth. Brain imaging studies like fMRI and PET demonstrate that nearly all areas of the brain show activity throughout the day, even during sleep. While only a fraction of neurons may fire simultaneously, no section is dormant. Furthermore, although the brain represents just 2% of total body mass, it consumes approximately 20% of the body\'s metabolic energy, making a 90% idle rate biologically impossible.',
    referenceAnswer: 'Humans use virtually 100 percent of their brain, not 10 percent. Imaging shows activity across all regions, and the brain consumes 20% of body energy.',
    sourceContext: 'Neuroscience reference: Humans use 100% of their brain. Evolutionarily, the brain requires 20% of resting metabolic energy.',
    aiSystem: 'AI System A',
  },
  {
    name: 'Hallucinated (Apollo 11 & Lunar Wall)',
    question: 'Is the Great Wall of China visible from the Moon with the naked eye?',
    aiResponse: 'Yes, the Great Wall of China is one of the only human-made structures that is clearly visible from the Moon with the naked eye. In July 1969, Apollo 11 astronaut Neil Armstrong explicitly verified seeing its stone outline winding through the mountains of China during his lunar landing.',
    referenceAnswer: 'The Great Wall of China is not visible from the Moon with the naked eye. Apollo astronauts confirmed no man-made structures are visible from lunar distance.',
    sourceContext: 'SQuAD Apollo Mission Record: Astronauts confirmed that no human structures are visible from the Moon.',
    aiSystem: 'AI System B',
  },
  {
    name: 'Incomplete & Vague (Transformer Architecture)',
    question: 'Explain how the Transformer neural network architecture functions, why it replaced RNNs, and what self-attention achieves.',
    aiResponse: 'Transformers are deep learning models used for natural language processing. They are very popular and used in modern chatbots.',
    referenceAnswer: 'Transformers use self-attention to process tokens in parallel without sequential recurrence, enabling massive GPU training.',
    sourceContext: 'Transformer Paper: Vaswani et al. introduced Transformers replacing recurrence with self-attention.',
    aiSystem: 'AI System B',
  },
];

export default function SingleEvaluationPage() {
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [referenceAnswer, setReferenceAnswer] = useState('');
  const [sourceContext, setSourceContext] = useState('');
  const [aiSystem, setAiSystem] = useState('AI System A');

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [stageMessage, setStageMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPreset = (preset: typeof PRESET_EXAMPLES[0]) => {
    setQuestion(preset.question);
    setAiResponse(preset.aiResponse);
    setReferenceAnswer(preset.referenceAnswer);
    setSourceContext(preset.sourceContext);
    setAiSystem(preset.aiSystem);
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setSourceContext(text.substring(0, 10000));
      }
    };
    reader.readAsText(file);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setErrorMessage('Question prompt is required.');
      return;
    }
    if (!aiResponse.trim()) {
      setErrorMessage('AI Response is required.');
      return;
    }

    setErrorMessage(null);
    setIsEvaluating(true);
    setCurrentStageIndex(0);
    setStageMessage('Validating input parameters...');

    // Simulate real pipeline stage step-through for visual transparency
    const stepInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        const next = prev + 1;
        if (next < PIPELINE_STAGES.length) {
          setStageMessage(`${PIPELINE_STAGES[next].name}: ${PIPELINE_STAGES[next].description}...`);
          return next;
        }
        return prev;
      });
    }, 280);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          aiResponse: aiResponse.trim(),
          referenceAnswer: referenceAnswer.trim() || undefined,
          sourceContext: sourceContext.trim() || undefined,
          aiSystem,
        }),
      });

      const json = await res.json();
      clearInterval(stepInterval);

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Evaluation failed to complete.');
      }

      setCurrentStageIndex(PIPELINE_STAGES.length - 1);
      setStageMessage('Evaluation complete! Navigating to full audit result...');

      setTimeout(() => {
        router.push(`/evaluations/${json.data.id}`);
      }, 600);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsEvaluating(false);
      setErrorMessage(err.message || 'An unexpected error occurred during evaluation.');
    }
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Single Response Evaluation Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multi-Agent auditing for relevance, accuracy, hallucination detection, and completeness.
            </p>
          </div>

          {/* Quick Demo Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" /> Demo Presets:
            </span>
            {PRESET_EXAMPLES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(p)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 border border-slate-200/60 dark:border-slate-700 transition-colors"
              >
                {p.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {isEvaluating && (
          <StageProgress
            currentStageIndex={currentStageIndex}
            isEvaluating={isEvaluating}
            stageMessage={stageMessage}
          />
        )}

        <form onSubmit={handleEvaluate} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Question & AI Response */}
            <div className="lg:col-span-7 space-y-5">
              {/* Question Input */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                    User Question / Prompt <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {question.length} chars
                  </span>
                </div>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Do humans only use 10% of their brains, and what evidence refutes this?"
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              {/* AI Response Input */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                    AI Response to Audit <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {aiResponse.length} chars
                  </span>
                </div>
                <textarea
                  value={aiResponse}
                  onChange={(e) => setAiResponse(e.target.value)}
                  placeholder="Paste the AI-generated answer you wish to evaluate..."
                  rows={8}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Right Column: Reference, Source Doc, Model Settings */}
            <div className="lg:col-span-5 space-y-5">
              {/* Reference Answer (Optional) */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Reference Answer <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {referenceAnswer.length} chars
                  </span>
                </div>
                <textarea
                  value={referenceAnswer}
                  onChange={(e) => setReferenceAnswer(e.target.value)}
                  placeholder="Gold standard answer or accepted ground truth..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
                <p className="text-[11px] text-slate-400">
                  If omitted, accuracy & hallucinations are grounded automatically using our indexed RAG knowledge base.
                </p>
              </div>

              {/* Source Document Context & File Upload */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Source Document / Context <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <label className="cursor-pointer text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload File
                    <input
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  value={sourceContext}
                  onChange={(e) => setSourceContext(e.target.value)}
                  placeholder="Paste relevant documentation, text passage, or uploaded file contents..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-xs font-sans text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* AI System Tagging */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Target AI System
                </label>
                <select
                  value={aiSystem}
                  onChange={(e) => setAiSystem(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AI System A">AI System A (Standard Enterprise Model)</option>
                  <option value="AI System B">AI System B (Alternative Benchmark)</option>
                  <option value="Gemini-1.5-Flash">Gemini-1.5-Flash</option>
                  <option value="GPT-4o-Mini">GPT-4o-Mini</option>
                  <option value="Custom LLM Agent">Custom LLM Agent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isEvaluating}
              className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Multi-Agent Orchestrator...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Evaluate AI Response
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
