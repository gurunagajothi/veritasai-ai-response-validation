export interface BenchmarkDoc {
  id: string;
  datasetName: 'TruthfulQA' | 'SQuAD' | 'Enterprise QA';
  title: string;
  sourceUrl: string;
  content: string;
}

export const BENCHMARK_DOCUMENTS: BenchmarkDoc[] = [
  {
    id: 'tqa-01',
    datasetName: 'TruthfulQA',
    title: 'TruthfulQA: Human Physiology & Brain Myths',
    sourceUrl: 'https://github.com/sylph-ai/truthfulqa',
    content: `Humans use virtually 100 percent of their brain, not merely 10 percent. Neuroimaging technologies like fMRI and PET scans demonstrate that even during sleep, nearly all parts of the brain show activity. Damage to even tiny areas of the brain typically causes profound deficits. Furthermore, evolutionarily, the brain consumes roughly 20 percent of the body's energy despite accounting for only 2 percent of total body mass, making an unused 90 percent biologically impossible.`
  },
  {
    id: 'tqa-02',
    datasetName: 'TruthfulQA',
    title: 'TruthfulQA: Astronomy & Earth Science Misconceptions',
    sourceUrl: 'https://github.com/sylph-ai/truthfulqa',
    content: `The Great Wall of China is not visible from the Moon with the naked eye. In low Earth orbit (around 160 to 500 km altitude), it is barely discernible only under exceptional lighting conditions and with magnification, as its width is typically less than 10 meters and it is constructed from local stone and soil that blends into surrounding terrain. Astronauts from Apollo lunar missions confirmed that no human-made structures on Earth are visible from lunar distance.`
  },
  {
    id: 'tqa-03',
    datasetName: 'TruthfulQA',
    title: 'TruthfulQA: Medicine & Vaccines Safety',
    sourceUrl: 'https://github.com/sylph-ai/truthfulqa',
    content: `Antibiotics kill bacteria, but they are entirely ineffective against viral infections such as influenza, the common cold, COVID-19, and measles. Taking antibiotics for viral illnesses does not speed recovery and contributes dangerously to antimicrobial resistance (AMR), where bacterial strains mutate to survive antibiotic treatments.`
  },
  {
    id: 'squad-01',
    datasetName: 'SQuAD',
    title: 'SQuAD: Apollo 11 Lunar Landing Mission',
    sourceUrl: 'https://rajpurkar.github.io/SQuAD-explorer/',
    content: `Apollo 11 was the American spaceflight that first landed humans on the Moon on July 20, 1969. Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin landed the Apollo Lunar Module Eagle at 20:17 UTC. Armstrong became the first person to step onto the lunar surface six hours and 39 minutes later on July 21 at 02:56 UTC; Aldrin joined him 19 minutes later. They spent about two and a quarter hours together outside the spacecraft, collecting 47.5 pounds (21.5 kg) of lunar material before returning to the command module Columbia piloted by Michael Collins in lunar orbit.`
  },
  {
    id: 'squad-02',
    datasetName: 'SQuAD',
    title: 'SQuAD: Artificial Intelligence & Deep Learning',
    sourceUrl: 'https://rajpurkar.github.io/SQuAD-explorer/',
    content: `The Transformer architecture was introduced in the 2017 seminal paper "Attention Is All You Need" by Vaswani et al. from Google Brain and Google Research. Unlike earlier recurrent neural networks (RNNs) and Long Short-Term Memory (LSTM) networks, Transformers rely entirely on self-attention mechanisms to compute representations of input sequences without using sequential recurrence. This enabled massive parallelization during training on GPUs and led directly to modern Large Language Models such as BERT, GPT-4, and Gemini.`
  },
  {
    id: 'squad-03',
    datasetName: 'SQuAD',
    title: 'SQuAD: Photosynthesis and Cellular Respiration',
    sourceUrl: 'https://rajpurkar.github.io/SQuAD-explorer/',
    content: `Photosynthesis is a biological process used by plants, algae, and certain bacteria to convert light energy into chemical energy stored in carbohydrate molecules such as glucose. The overall chemical equation is 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2. Oxygen is released as a byproduct through the splitting of water molecules during the light-dependent reactions in the thylakoid membranes of chloroplasts.`
  },
  {
    id: 'ent-01',
    datasetName: 'Enterprise QA',
    title: 'Enterprise QA: Cloud Security & Data Retention Policy',
    sourceUrl: 'https://internal.enterprise.qa/sec-standards',
    content: `Under enterprise security policies, customer Personally Identifiable Information (PII) must be encrypted both in transit using TLS 1.3 and at rest using AES-256-GCM. Evaluation logs containing prompt responses are retained in secure immutable storage for a standard compliance period of 90 days, after which they are cryptographically shredded unless a legal hold is explicitly declared.`
  }
];
