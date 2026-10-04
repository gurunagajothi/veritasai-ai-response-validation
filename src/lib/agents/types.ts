export type VerdictType = 'PASS' | 'NEEDS IMPROVEMENT' | 'FAIL';
export type HallucinationSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ClaimSupportStatus = 'Supported' | 'Unsupported' | 'Contradicted';
export type AspectStatus = 'Addressed' | 'Partially Addressed' | 'Missing';
export type RelevanceCategory = 'Fully Relevant' | 'Mostly Relevant' | 'Partially Relevant' | 'Irrelevant' | 'Off-topic';

export interface BaseAgentResult {
  score: number; // 0 - 100
  reasoning: string;
  evidence: string[];
  issues: string[];
  confidence: number; // 0 - 1
}

export interface RelevanceResult extends BaseAgentResult {
  category: RelevanceCategory;
  intentAlignment: number;
  topicDriftDetected: boolean;
}

export interface ClaimVerification {
  claim: string;
  status: 'Correct' | 'Partially Correct' | 'Incorrect' | 'Contradiction';
  evidence: string;
  reasoning: string;
}

export interface AccuracyResult extends BaseAgentResult {
  supportingEvidence: string[];
  contradictingEvidence: string[];
  verifiedClaims: ClaimVerification[];
}

export interface HallucinationClaim {
  id: string;
  text: string;
  status: ClaimSupportStatus;
  severity: HallucinationSeverity;
  evidence: string;
  reasoning: string;
  charStart?: number;
  charEnd?: number;
}

export interface HallucinationResult extends BaseAgentResult {
  safetyScore: number; // 0 - 100 (100 = zero hallucinations)
  hallucinationCount: number;
  criticalCount: number;
  claims: HallucinationClaim[];
}

export interface CompletenessAspect {
  id: string;
  aspect: string;
  requirement: string;
  status: AspectStatus;
  reasoning: string;
}

export interface CompletenessResult extends BaseAgentResult {
  addressedAspects: CompletenessAspect[];
  missingAspects: CompletenessAspect[];
  partiallyAddressedAspects: CompletenessAspect[];
  totalRequirements: number;
}

export interface EvaluationWeights {
  relevance: number;      // e.g. 0.20
  accuracy: number;       // e.g. 0.35
  hallucination: number;  // e.g. 0.25
  completeness: number;   // e.g. 0.20
}

export interface VerdictResult {
  overallScore: number;
  verdict: VerdictType;
  weights: EvaluationWeights;
  strengths: string[];
  weaknesses: string[];
  criticalIssues: string[];
  recommendations: string[];
  overriddenByCriticalIssue: boolean;
  overrideReason?: string;
  confidence: number;
}

export interface RAGChunk {
  id: string;
  documentTitle: string;
  datasetName: string;
  content: string;
  similarityScore: number;
  usedInEvaluation: boolean;
}

export interface EvaluationPipelineInput {
  question: string;
  aiResponse: string;
  referenceAnswer?: string;
  sourceContext?: string;
  aiSystem?: string;
  batchId?: string;
  isDemo?: boolean;
}

export interface EvaluationPipelineStageUpdate {
  stage: 'input_validation' | 'knowledge_retrieval' | 'relevance_analysis' | 'accuracy_verification' | 'hallucination_scan' | 'completeness_analysis' | 'verdict_generation' | 'completed';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message: string;
  progressPercent: number;
}

export interface FullEvaluationRecord {
  id: string;
  batchId?: string;
  question: string;
  aiResponse: string;
  referenceAnswer?: string;
  source?: string;
  aiSystem: string;
  relevanceScore: number;
  accuracyScore: number;
  hallucinationScore: number;
  completenessScore: number;
  overallScore: number;
  verdict: VerdictType;
  relevanceData: RelevanceResult;
  accuracyData: AccuracyResult;
  hallucinationData: HallucinationResult;
  completenessData: CompletenessResult;
  verdictData: VerdictResult;
  retrievedEvidence: RAGChunk[];
  recommendations: string[];
  confidence: number;
  isDemo?: boolean;
  createdAt: string;
}
