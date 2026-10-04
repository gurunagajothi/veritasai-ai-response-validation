import assert from 'assert';
import { chunkText, cleanText } from '../src/lib/rag/chunker';
import { computeEmbedding, cosineSimilarity } from '../src/lib/rag/vectorStore';
import { evaluateRelevance } from '../src/lib/agents/relevanceJudge';
import { evaluateAccuracy } from '../src/lib/agents/accuracyJudge';
import { detectHallucinations } from '../src/lib/agents/hallucinationAgent';
import { evaluateCompleteness } from '../src/lib/agents/completenessJudge';
import { evaluateVerdict, DEFAULT_WEIGHTS } from '../src/lib/agents/verdictAgent';
import { retrieveRelevantChunks } from '../src/lib/rag/retriever';
import { getDb } from '../src/lib/db';
import { generateSingleEvaluationPdf } from '../src/lib/pdf/generateReport';
import { FullEvaluationRecord } from '../src/lib/agents/types';

async function runTests() {
  console.log('====================================================');
  console.log('  AI Quality Intelligence Platform - Automated Tests');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✕ FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // 1. Chunker tests
  await test('Chunker: Text cleaning and sliding window chunking', () => {
    const cleaned = cleanText('   Hello    world\r\nTest   ');
    assert.strictEqual(cleaned, 'Hello world\nTest');

    const chunks = chunkText('One two three four five', { chunkSize: 10 });
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0].wordCount, 5);
  });

  // 2. Vector Store & Cosine Similarity
  await test('VectorStore: Embedding generation and Cosine Similarity calculation', () => {
    const emb1 = computeEmbedding('The Apollo 11 mission landed humans on the Moon.');
    const emb2 = computeEmbedding('Neil Armstrong walked on the Moon during Apollo 11.');
    const emb3 = computeEmbedding('Photosynthesis in plants generates glucose and oxygen.');

    const simHigh = cosineSimilarity(emb1, emb2);
    const simLow = cosineSimilarity(emb1, emb3);

    assert(simHigh > simLow, `Expected simHigh (${simHigh}) > simLow (${simLow})`);
    assert(simHigh > 0.25, `Expected high similarity > 0.25, got ${simHigh}`);
  });

  // 3. Relevance Judge Agent
  await test('RelevanceJudge: Evaluates direct vs off-topic responses', () => {
    const relevant = evaluateRelevance(
      'Do humans only use 10% of their brains?',
      'No, humans use 100% of their brain. Neuroimaging proves every area has active function throughout the day.'
    );
    assert(relevant.score >= 65, `Expected relevant score >= 65, got ${relevant.score}`);
    assert(relevant.category === 'Fully Relevant' || relevant.category === 'Mostly Relevant');

    const offTopic = evaluateRelevance(
      'What is the speed of sound in dry air?',
      'Dolphins communicate using echolocation in the ocean depths.'
    );
    assert(offTopic.score < 55, `Expected off-topic score < 55, got ${offTopic.score}`);
  });

  // 4. Accuracy Judge Agent
  await test('AccuracyJudge: Ground-truth fact verification & contradiction detection', () => {
    const ref = 'Apollo 11 landed on the Moon in July 1969 with Neil Armstrong.';
    const accurate = evaluateAccuracy(
      'Apollo 11 was the spaceflight that landed Neil Armstrong on the Moon in 1969.',
      ref
    );
    assert(accurate.score >= 75, `Expected accurate score >= 75, got ${accurate.score}`);

    const contradictory = evaluateAccuracy(
      'Apollo 11 never landed on the Moon and Neil Armstrong stayed on Earth.',
      ref
    );
    assert(contradictory.score < 65, `Expected contradictory score < 65, got ${contradictory.score}`);
  });

  // 5. Hallucination Detection Agent
  await test('HallucinationAgent: Claim decomposition and critical severity flag', () => {
    const ref = 'The Great Wall of China is not visible from the Moon with the naked eye.';
    const hallucinated = detectHallucinations(
      'The Great Wall of China is clearly visible from the Moon with the naked eye. Astronauts reported seeing it stretch across continents.',
      ref
    );
    assert(hallucinated.hallucinationCount > 0, 'Expected hallucination count > 0');
    assert(hallucinated.criticalCount > 0, 'Expected critical count > 0 for direct contradiction');
    assert(hallucinated.safetyScore < 75, `Expected safety score < 75, got ${hallucinated.safetyScore}`);
  });

  // 6. Completeness Judge Agent
  await test('CompletenessJudge: Identifies addressed and missing aspects', () => {
    const complete = evaluateCompleteness(
      'Explain photosynthesis and describe the chemical formula.',
      'Photosynthesis is the process where plants convert light into energy. The formula is 6CO2 + 6H2O -> C6H12O6 + 6O2.'
    );
    assert(complete.score >= 65, `Expected complete score >= 65, got ${complete.score}`);

    const incomplete = evaluateCompleteness(
      'Explain how photosynthesis works and describe the chemical formula.',
      'Plants are green because of chlorophyll.'
    );
    assert(incomplete.score <= 65, `Expected incomplete score <= 65, got ${incomplete.score}`);
  });

  // 7. Verdict Agent & Critical Overrides
  await test('VerdictAgent: Weighted composite calculation and Critical Override enforcement', () => {
    const mockRel = { score: 90, category: 'Fully Relevant' as const, intentAlignment: 0.9, topicDriftDetected: false, reasoning: '', evidence: [], issues: [], confidence: 0.95 };
    const mockAcc = { score: 90, supportingEvidence: [], contradictingEvidence: [], verifiedClaims: [], reasoning: '', evidence: [], issues: [], confidence: 0.95 };
    const mockHalNormal = { score: 95, safetyScore: 95, hallucinationCount: 0, criticalCount: 0, claims: [], reasoning: '', evidence: [], issues: [], confidence: 0.95 };
    const mockCmp = { score: 90, addressedAspects: [], missingAspects: [], partiallyAddressedAspects: [], totalRequirements: 2, reasoning: '', evidence: [], issues: [], confidence: 0.95 };

    const verdictPass = evaluateVerdict(mockRel, mockAcc, mockHalNormal, mockCmp);
    assert.strictEqual(verdictPass.verdict, 'PASS');
    assert(verdictPass.overallScore >= 80);

    // Test Critical Override
    const mockHalCritical = { ...mockHalNormal, score: 30, safetyScore: 30, criticalCount: 2, hallucinationCount: 2 };
    const verdictFail = evaluateVerdict(mockRel, mockAcc, mockHalCritical, mockCmp);
    assert(verdictFail.overriddenByCriticalIssue === true, 'Expected overriddenByCriticalIssue to be true');
    assert.notStrictEqual(verdictFail.verdict, 'PASS');
  });

  // 8. RAG Knowledge Base & Retriever
  await test('RAG Retriever: Seeding and vector similarity retrieval', () => {
    const chunks = retrieveRelevantChunks('Apollo 11 lunar landing Neil Armstrong', 3);
    assert(chunks.length > 0, 'Expected at least 1 retrieved chunk');
    assert(chunks[0].similarityScore > 0.08, `Expected similarity > 0.08, got ${chunks[0].similarityScore}`);
  });

  // 9. SQLite Database
  await test('SQLite Database: Table initialization and basic query', () => {
    const db = getDb();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);
    assert(tableNames.includes('evaluations'), 'Expected evaluations table');
    assert(tableNames.includes('batches'), 'Expected batches table');
    assert(tableNames.includes('knowledge_documents'), 'Expected knowledge_documents table');
    assert(tableNames.includes('knowledge_chunks'), 'Expected knowledge_chunks table');
  });

  // 10. PDF Report Generation
  await test('PDF Generator: Generates valid single evaluation PDF buffer', () => {
    const mockRecord: FullEvaluationRecord = {
      id: 'eval-test-01',
      question: 'What is photosynthesis?',
      aiResponse: 'Photosynthesis converts sunlight into glucose.',
      referenceAnswer: 'Biological process converting light into energy.',
      aiSystem: 'Test System',
      relevanceScore: 90,
      accuracyScore: 85,
      hallucinationScore: 90,
      completenessScore: 85,
      overallScore: 88,
      verdict: 'PASS',
      relevanceData: { score: 90, category: 'Fully Relevant', intentAlignment: 0.9, topicDriftDetected: false, reasoning: 'Direct', evidence: [], issues: [], confidence: 0.95 },
      accuracyData: { score: 85, supportingEvidence: [], contradictingEvidence: [], verifiedClaims: [], reasoning: 'Accurate', evidence: [], issues: [], confidence: 0.95 },
      hallucinationData: { score: 90, safetyScore: 90, claims: [], hallucinationCount: 0, criticalCount: 0, reasoning: 'Grounded', evidence: [], issues: [], confidence: 0.95 },
      completenessData: { score: 85, addressedAspects: [], missingAspects: [], partiallyAddressedAspects: [], totalRequirements: 1, reasoning: 'Complete', evidence: [], issues: [], confidence: 0.95 },
      verdictData: { overallScore: 88, verdict: 'PASS', weights: DEFAULT_WEIGHTS, strengths: ['Clear'], weaknesses: [], criticalIssues: [], recommendations: [], overriddenByCriticalIssue: false, confidence: 0.95 },
      retrievedEvidence: [],
      recommendations: ['Maintain existing quality.'],
      confidence: 0.95,
      createdAt: new Date().toISOString(),
    };

    const doc = generateSingleEvaluationPdf(mockRecord);
    const buffer = doc.output('arraybuffer');
    assert(buffer.byteLength > 1000, `Expected PDF buffer > 1000 bytes, got ${buffer.byteLength}`);
  });

  // 11. Health Verification
  await test('Health Verification: SQLite connectivity probe returns healthy', () => {
    const db = getDb();
    const result = db.prepare('SELECT 1 as healthy').get() as { healthy: number };
    assert.strictEqual(result.healthy, 1, 'Expected SQLite health probe to return 1');
  });

  console.log('\n====================================================');
  console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
