import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DATABASE_URL || path.join(DB_DIR, 'quality_intelligence.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      batch_id TEXT,
      question TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      reference_answer TEXT,
      source TEXT,
      ai_system TEXT DEFAULT 'AI System A',
      relevance_score REAL NOT NULL,
      accuracy_score REAL NOT NULL,
      hallucination_score REAL NOT NULL,
      completeness_score REAL NOT NULL,
      overall_score REAL NOT NULL,
      verdict TEXT NOT NULL,
      relevance_data TEXT,
      accuracy_data TEXT,
      hallucination_data TEXT,
      completeness_data TEXT,
      verdict_data TEXT,
      retrieved_evidence TEXT,
      recommendations TEXT,
      confidence REAL DEFAULT 0.95,
      is_demo INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      total_records INTEGER DEFAULT 0,
      successful_records INTEGER DEFAULT 0,
      failed_records INTEGER DEFAULT 0,
      pass_count INTEGER DEFAULT 0,
      needs_improvement_count INTEGER DEFAULT 0,
      fail_count INTEGER DEFAULT 0,
      avg_overall_score REAL DEFAULT 0,
      avg_relevance REAL DEFAULT 0,
      avg_accuracy REAL DEFAULT 0,
      avg_hallucination REAL DEFAULT 0,
      avg_completeness REAL DEFAULT 0,
      ai_system TEXT DEFAULT 'AI System A',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS knowledge_documents (
      id TEXT PRIMARY KEY,
      dataset_name TEXT NOT NULL,
      title TEXT NOT NULL,
      source_url TEXT,
      content TEXT NOT NULL,
      chunk_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS knowledge_chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      dataset_name TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      token_count INTEGER DEFAULT 0,
      vector_embedding TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_evaluations_batch ON evaluations(batch_id);
    CREATE INDEX IF NOT EXISTS idx_evaluations_verdict ON evaluations(verdict);
    CREATE INDEX IF NOT EXISTS idx_evaluations_created ON evaluations(created_at);
    CREATE INDEX IF NOT EXISTS idx_evaluations_ai_system ON evaluations(ai_system);
    CREATE INDEX IF NOT EXISTS idx_chunks_dataset ON knowledge_chunks(dataset_name);
  `);
}

export default getDb;
