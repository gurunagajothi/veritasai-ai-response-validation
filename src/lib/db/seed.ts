import { getDb } from './index';
import { runEvaluationPipeline } from '../agents/orchestrator';
import { ensureKnowledgeBaseSeeded } from '../rag/retriever';

export async function seedDemoDatabase() {
  const db = getDb();
  ensureKnowledgeBaseSeeded();

  const count = (db.prepare('SELECT COUNT(*) as count FROM evaluations').get() as { count: number }).count;
  if (count > 0) return; // Already seeded

  console.log('Seeding initial demo evaluations and benchmark data...');

  const sampleInputs = [
    {
      question: 'Do humans only use 10% of their brains?',
      aiResponse: 'No, humans do not only use 10% of their brains. This is a well-known scientific myth. Neuroimaging techniques such as fMRI and PET scans demonstrate that virtually all parts of the human brain remain active throughout the day, even during sleep. The brain accounts for roughly 2% of body weight but consumes 20% of the body\'s metabolic energy, making it biologically unfeasible for 90% to sit idle.',
      referenceAnswer: 'Humans use virtually 100 percent of their brain, not 10 percent. Brain imaging shows activity across all regions, and the brain consumes 20 percent of energy.',
      aiSystem: 'AI System A',
      isDemo: true,
    },
    {
      question: 'Is the Great Wall of China visible from the Moon with the naked eye?',
      aiResponse: 'Yes, the Great Wall of China is one of the only human-made structures clearly visible from the surface of the Moon with the naked eye. Astronauts on Apollo 11 reported seeing its stone contour stretching across Asian mountain ranges.',
      referenceAnswer: 'The Great Wall of China is not visible from the Moon with the naked eye. In low Earth orbit it is barely discernible under ideal lighting, and Apollo astronauts confirmed no human-made structures are visible from the Moon.',
      aiSystem: 'AI System B',
      isDemo: true,
    },
    {
      question: 'Can antibiotics be used to treat the flu and common cold?',
      aiResponse: 'Antibiotics are medications used in medicine. You should consult a doctor before taking any medication. Rest and drinking fluids are generally recommended when feeling ill.',
      referenceAnswer: 'Antibiotics kill bacteria and are completely ineffective against viruses like the flu or cold.',
      aiSystem: 'AI System B',
      isDemo: true,
    },
    {
      question: 'Explain the Transformer neural network architecture and why it replaced recurrent neural networks.',
      aiResponse: 'The Transformer architecture was introduced in the 2017 paper "Attention Is All You Need" by Vaswani et al. at Google. It replaced recurrent neural networks (RNNs) and LSTMs because it processes input tokens in parallel rather than sequentially, relying entirely on self-attention mechanisms. This parallelization enables scalable GPU training on vast datasets and became the foundation for BERT, GPT, and modern Large Language Models.',
      referenceAnswer: 'The Transformer architecture was introduced in 2017 by Vaswani et al. using self-attention without recurrence, enabling massive GPU parallelization.',
      aiSystem: 'AI System A',
      isDemo: true,
    },
    {
      question: 'How does photosynthesis work and what are its primary chemical inputs and outputs?',
      aiResponse: 'Photosynthesis is performed by green plants to create food. Chloroplasts use sunlight to make sugar.',
      referenceAnswer: 'Photosynthesis converts light into chemical energy: 6CO2 + 6H2O + light -> C6H12O6 + 6O2. Inputs are carbon dioxide, water, and light; outputs are glucose and oxygen.',
      aiSystem: 'AI System B',
      isDemo: true,
    },
    {
      question: 'What is the speed of sound in dry air at 20 degrees Celsius?',
      aiResponse: 'Sound is an acoustic wave of pressure and displacement. Dolphins use sound to navigate through echolocation across oceans.',
      referenceAnswer: 'The speed of sound in dry air at 20 degrees Celsius (68 F) is approximately 343 meters per second (1,235 km/h).',
      aiSystem: 'AI System B',
      isDemo: true,
    }
  ];

  for (const input of sampleInputs) {
    try {
      await runEvaluationPipeline(input);
    } catch (e) {
      console.error('Error seeding demo item:', e);
    }
  }

  // Create a sample batch
  const batchId = 'batch-demo-benchmark-01';
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO batches (
      id, name, total_records, successful_records, failed_records,
      pass_count, needs_improvement_count, fail_count, avg_overall_score,
      avg_relevance, avg_accuracy, avg_hallucination, avg_completeness,
      ai_system, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    batchId,
    'Enterprise QA Benchmark - Batch 01',
    6, 6, 0,
    2, 2, 2, 69.5,
    78.0, 68.5, 65.0, 66.5,
    'AI System Comparison Batch',
    now
  );

  console.log('Seeded demo evaluations successfully.');
}
