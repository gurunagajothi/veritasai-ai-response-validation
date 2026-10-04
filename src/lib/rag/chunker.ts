export interface ChunkOptions {
  chunkSize?: number; // target words per chunk
  chunkOverlap?: number; // overlapping words
}

export interface ChunkResult {
  index: number;
  content: string;
  wordCount: number;
}

export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export function chunkText(text: string, options: ChunkOptions = {}): ChunkResult[] {
  const chunkSize = options.chunkSize || 100;
  const chunkOverlap = options.chunkOverlap || 20;

  const cleaned = cleanText(text);
  if (!cleaned) return [];

  // Split into sentences / paragraphs first to avoid cutting sentences mid-way if possible
  const words = cleaned.split(/\s+/);
  if (words.length <= chunkSize) {
    return [
      {
        index: 0,
        content: cleaned,
        wordCount: words.length,
      }
    ];
  }

  const chunks: ChunkResult[] = [];
  let startIndex = 0;
  let chunkIdx = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    const content = chunkWords.join(' ');

    chunks.push({
      index: chunkIdx,
      content,
      wordCount: chunkWords.length,
    });

    chunkIdx++;
    if (endIndex === words.length) break;
    startIndex += (chunkSize - chunkOverlap);
  }

  return chunks;
}
