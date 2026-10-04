import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureKnowledgeBaseSeeded, retrieveRelevantChunks } from '@/lib/rag/retriever';
import { chunkText } from '@/lib/rag/chunker';
import { computeEmbedding } from '@/lib/rag/vectorStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    ensureKnowledgeBaseSeeded();
    const db = getDb();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    // If query is passed, perform semantic RAG search
    if (query && query.trim().length > 0) {
      const chunks = retrieveRelevantChunks(query.trim(), 6);
      return NextResponse.json({ success: true, query, chunks });
    }

    // Otherwise return datasets and documents overview
    const documents = db.prepare(`
      SELECT id, dataset_name, title, source_url, chunk_count, created_at,
             substr(content, 1, 140) as preview
      FROM knowledge_documents
      ORDER BY created_at DESC
    `).all();

    const totalChunks = (db.prepare('SELECT COUNT(*) as count FROM knowledge_chunks').get() as { count: number }).count;
    const datasets = db.prepare(`
      SELECT dataset_name, COUNT(*) as doc_count, SUM(chunk_count) as total_chunks
      FROM knowledge_documents
      GROUP BY dataset_name
    `).all();

    return NextResponse.json({
      success: true,
      totalDocuments: documents.length,
      totalChunks,
      datasets,
      documents,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, datasetName, content, sourceUrl } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Document title is required.' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || content.trim().length < 15) {
      return NextResponse.json({ success: false, error: 'Document content is required (min 15 characters).' }, { status: 400 });
    }

    const db = getDb();
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const effectiveDataset = datasetName?.trim() || 'Custom Reference';
    const chunks = chunkText(content.trim(), { chunkSize: 65, chunkOverlap: 15 });
    const now = new Date().toISOString();

    const insertDoc = db.prepare(`
      INSERT INTO knowledge_documents (id, dataset_name, title, source_url, content, chunk_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertChunk = db.prepare(`
      INSERT INTO knowledge_chunks (id, document_id, dataset_name, chunk_index, content, token_count, vector_embedding, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDoc.run(docId, effectiveDataset, title.trim(), sourceUrl?.trim() || '', content.trim(), chunks.length, now);

    for (const ch of chunks) {
      const chunkId = `${docId}-ch-${ch.index}`;
      const emb = computeEmbedding(ch.content);
      insertChunk.run(
        chunkId,
        docId,
        effectiveDataset,
        ch.index,
        ch.content,
        ch.wordCount,
        JSON.stringify(emb),
        now
      );
    }

    return NextResponse.json({
      success: true,
      documentId: docId,
      title: title.trim(),
      datasetName: effectiveDataset,
      chunkCount: chunks.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
