import { getDb } from '../db';
import { chunkText } from './chunker';
import { computeEmbedding, cosineSimilarity, VectorEmbedding } from './vectorStore';
import { BENCHMARK_DOCUMENTS } from './benchmarkDatasets';
import { RAGChunk } from '../agents/types';

let isKnowledgeSeeded = false;

export function ensureKnowledgeBaseSeeded() {
  if (isKnowledgeSeeded) return;
  const db = getDb();

  const countRow = db.prepare('SELECT COUNT(*) as count FROM knowledge_documents').get() as { count: number };
  if (countRow.count === 0) {
    const insertDoc = db.prepare(`
      INSERT INTO knowledge_documents (id, dataset_name, title, source_url, content, chunk_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertChunk = db.prepare(`
      INSERT INTO knowledge_chunks (id, document_id, dataset_name, chunk_index, content, token_count, vector_embedding, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    for (const doc of BENCHMARK_DOCUMENTS) {
      const chunks = chunkText(doc.content, { chunkSize: 60, chunkOverlap: 15 });
      insertDoc.run(doc.id, doc.datasetName, doc.title, doc.sourceUrl, doc.content, chunks.length, now);

      for (const ch of chunks) {
        const chunkId = `${doc.id}-chunk-${ch.index}`;
        const embedding = computeEmbedding(ch.content);
        insertChunk.run(
          chunkId,
          doc.id,
          doc.datasetName,
          ch.index,
          ch.content,
          ch.wordCount,
          JSON.stringify(embedding),
          now
        );
      }
    }
  }
  isKnowledgeSeeded = true;
}

export function indexAdHocDocument(title: string, content: string, datasetName = 'Ad-hoc Upload'): RAGChunk[] {
  const db = getDb();
  const docId = `adhoc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const chunks = chunkText(content, { chunkSize: 75, chunkOverlap: 20 });
  const now = new Date().toISOString();

  const insertDoc = db.prepare(`
    INSERT INTO knowledge_documents (id, dataset_name, title, source_url, content, chunk_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertChunk = db.prepare(`
    INSERT INTO knowledge_chunks (id, document_id, dataset_name, chunk_index, content, token_count, vector_embedding, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDoc.run(docId, datasetName, title, '', content, chunks.length, now);

  const indexedChunks: RAGChunk[] = [];
  for (const ch of chunks) {
    const chunkId = `${docId}-chunk-${ch.index}`;
    const embedding = computeEmbedding(ch.content);
    insertChunk.run(
      chunkId,
      docId,
      datasetName,
      ch.index,
      ch.content,
      ch.wordCount,
      JSON.stringify(embedding),
      now
    );
    indexedChunks.push({
      id: chunkId,
      documentTitle: title,
      datasetName,
      content: ch.content,
      similarityScore: 1.0,
      usedInEvaluation: true,
    });
  }

  return indexedChunks;
}

export function retrieveRelevantChunks(query: string, topK = 4, sourceContext?: string): RAGChunk[] {
  ensureKnowledgeBaseSeeded();
  const db = getDb();

  const queryEmbedding = computeEmbedding(query);

  // If the user provided a direct source document / text with the evaluation, chunk it and give it high retrieval priority
  const directChunks: RAGChunk[] = [];
  if (sourceContext && sourceContext.trim().length > 0) {
    const adhocChunks = chunkText(sourceContext, { chunkSize: 60, chunkOverlap: 15 });
    for (let i = 0; i < adhocChunks.length; i++) {
      const ch = adhocChunks[i];
      const emb = computeEmbedding(ch.content);
      const sim = cosineSimilarity(queryEmbedding, emb);
      directChunks.push({
        id: `source-chunk-${i}`,
        documentTitle: 'Provided Source Document',
        datasetName: 'Evaluation Context',
        content: ch.content,
        // Boost provided source document relevance
        similarityScore: Math.min(1.0, sim * 1.35 + 0.15),
        usedInEvaluation: false,
      });
    }
  }

  // Retrieve stored chunks from SQLite
  const storedChunks = db.prepare(`
    SELECT c.id, c.content, c.vector_embedding, c.dataset_name, d.title as doc_title
    FROM knowledge_chunks c
    JOIN knowledge_documents d ON c.document_id = d.id
  `).all() as { id: string; content: string; vector_embedding: string; dataset_name: string; doc_title: string }[];

  const scoredStored: RAGChunk[] = [];
  for (const row of storedChunks) {
    try {
      const emb: VectorEmbedding = JSON.parse(row.vector_embedding);
      const sim = cosineSimilarity(queryEmbedding, emb);
      if (sim > 0.05) {
        scoredStored.push({
          id: row.id,
          documentTitle: row.doc_title,
          datasetName: row.dataset_name,
          content: row.content,
          similarityScore: sim,
          usedInEvaluation: false,
        });
      }
    } catch {
      // Ignore corrupt embedding row
    }
  }

  // Combine and sort by similarity descending
  const combined = [...directChunks, ...scoredStored];
  combined.sort((a, b) => b.similarityScore - a.similarityScore);

  const selected = combined.slice(0, topK);
  for (const item of selected) {
    if (item.similarityScore >= 0.18) {
      item.usedInEvaluation = true;
    }
  }

  return selected;
}
