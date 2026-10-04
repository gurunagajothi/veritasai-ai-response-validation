export interface VectorEmbedding {
  terms: Record<string, number>;
  magnitude: number;
}

export interface IndexedChunk {
  id: string;
  documentId: string;
  datasetName: string;
  content: string;
  embedding: VectorEmbedding;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no',
  'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'were', 'weren\'t', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

export function computeEmbedding(text: string): VectorEmbedding {
  const tokens = tokenize(text);
  const termCounts: Record<string, number> = {};

  for (const token of tokens) {
    termCounts[token] = (termCounts[token] || 0) + 1;
  }

  // Also include 3-gram char hashes for sub-word semantic resilience
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length >= 4);
  for (const word of words) {
    for (let i = 0; i <= word.length - 3; i++) {
      const trigram = word.substring(i, i + 3);
      const key = `_tri_${trigram}`;
      termCounts[key] = (termCounts[key] || 0) + 0.35;
    }
  }

  let sumSquares = 0;
  for (const weight of Object.values(termCounts)) {
    sumSquares += weight * weight;
  }

  const magnitude = Math.sqrt(sumSquares) || 1;

  return {
    terms: termCounts,
    magnitude,
  };
}

export function cosineSimilarity(vecA: VectorEmbedding, vecB: VectorEmbedding): number {
  if (!vecA || !vecB || vecA.magnitude === 0 || vecB.magnitude === 0) return 0;

  let dotProduct = 0;
  const termsA = vecA.terms;
  const termsB = vecB.terms;

  for (const [term, weightA] of Object.entries(termsA)) {
    if (termsB[term]) {
      dotProduct += weightA * termsB[term];
    }
  }

  const score = dotProduct / (vecA.magnitude * vecB.magnitude);
  return Math.min(1.0, Math.max(0.0, score));
}
