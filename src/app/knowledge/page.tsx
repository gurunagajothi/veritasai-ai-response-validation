'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Database, Upload, Search, FileText, CheckCircle2, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function KnowledgeBasePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ingestion form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [datasetName, setDatasetName] = useState('Enterprise QA');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/knowledge');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load knowledge base.');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          datasetName: datasetName.trim(),
          content: content.trim(),
          sourceUrl: sourceUrl.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Ingestion failed.');

      setShowAddModal(false);
      setTitle('');
      setContent('');
      setSourceUrl('');
      fetchKnowledge();
    } catch (err: any) {
      alert(`Error ingesting document: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/knowledge?query=${encodeURIComponent(searchQuery.trim())}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setSearchResults(json.chunks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Sidebar />

      <main className="flex-1 lg:pl-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Knowledge Base & Vector Store
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              TruthfulQA, SQuAD benchmarks, and custom reference documents used for RAG grounding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ingest Document
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Semantic Vector Search Bar */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Semantic Vector Retrieval Test
          </h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query vector index (e.g. Apollo lunar landing, brain usage myth, photosynthesis)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search results if queried */}
          {searchResults && (
            <div className="pt-3 space-y-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Top {searchResults.length} Semantic Matches for &ldquo;{searchQuery}&rdquo;:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((ch, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{ch.documentTitle}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {(ch.similarityScore * 100).toFixed(1)}% Sim
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                      {ch.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Dataset Overview Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(data.datasets || []).map((ds: any) => (
              <div key={ds.dataset_name} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{ds.dataset_name}</span>
                  <Badge variant="success" size="sm">Active Index</Badge>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Documents: <strong className="text-slate-900 dark:text-white">{ds.doc_count}</strong></span>
                  <span>Chunks: <strong className="text-slate-900 dark:text-white">{ds.total_chunks}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Indexed Documents Table */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Indexed Documents & Benchmarks</h3>
            <span className="text-xs text-slate-400">{data?.totalDocuments || 0} Documents</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Dataset</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Indexed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {(data?.documents || []).map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs">{doc.title}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {doc.dataset_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">{doc.chunk_count}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-sm truncate">{doc.preview}...</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{new Date(doc.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ingest Document Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Ingest New Knowledge Document</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <form onSubmit={handleIngest} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ISO 27001 Security Standard"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Dataset Name</label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="e.g. Enterprise QA, Medical Benchmarks"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Document Content *</label>
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste reference text passage to clean, chunk, and embed..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Ingesting & Chunking...' : 'Ingest Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
