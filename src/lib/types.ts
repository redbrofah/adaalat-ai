// =====================================================================
// AdaalatAI Core Types
// =====================================================================

export type AgentId =
  | "orchestrator"
  | "vision"
  | "classification"
  | "conflict"
  | "precedent"
  | "deadline"
  | "reasoning"
  | "translation"
  | "synthesis"
  | "critic";

export type AgentStatus = "idle" | "queued" | "running" | "done" | "error";

export type CaseStatus = "complete" | "partial" | "empty";

export interface AgentEventMessageRef {
  key: string;
  params?: Record<string, string | number>;
}

export interface AgentEvent {
  caseId: string;
  agent: AgentId;
  status: AgentStatus;
  messageRef?: AgentEventMessageRef;
  message?: string;
  toolCall?: { name: string; args: Record<string, unknown> };
  toolResult?: { name: string; preview: string };
  partialOutput?: string;
  finalOutput?: unknown;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
}

export interface CaseFile {
  id: string;
  title: string;
  uploadedAt: number;
  files: CaseAttachment[];
  rawText: string;
  language: "bn" | "en" | "mixed";
}

export interface CaseAttachment {
  name: string;
  mimeType: string;
  pages?: number;
  base64?: string;
  text?: string;
  isHandwritten?: boolean;
}

export interface ClassificationOutput {
  caseType: "criminal" | "civil" | "family" | "constitutional" | "narcotics" | "other";
  subtype: string;
  urgency: number;
  priorityFactors: string[];
  applicableLaws: { actName: string; sections: string[] }[];
  estimatedComplexity: "low" | "medium" | "high";
  reasoning: string;
}

export interface VisionOutput {
  extractedText: string;
  confidence: number;
  pages: { page: number; text: string }[];
  isHandwritten: boolean;
  detectedLanguage: "bn" | "en" | "mixed";
}

export interface ConflictItem {
  witnessA: string;
  witnessB: string;
  topic: string;
  statementA: string;
  statementB: string;
  severity: "low" | "medium" | "high";
  resolution?: string;
}

export interface ConflictOutput {
  contradictions: ConflictItem[];
  notableInconsistencies: string[];
  overallReliabilityNote: string;
}

export interface PrecedentItem {
  citation: string;
  caseName: string;
  court: "Appellate" | "High Court" | "District" | "Other";
  year?: number;
  principle: string;
  relevance: string;
  source: "scob" | "bdlaws" | "external";
}

export interface PrecedentOutput {
  precedents: PrecedentItem[];
  applicableActs: { actName: string; sections: string[]; quote: string }[];
}

export interface DeadlineItem {
  description: string;
  statutoryBasis: string;
  deadlineDate?: string;
  daysRemaining?: number;
  isViolated: boolean;
  consequence?: string;
}

export interface DeadlineOutput {
  deadlines: DeadlineItem[];
  immediateActions: string[];
}

export interface ReasoningOutput {
  legalIssues: string[];
  constitutionalConsiderations: string[];
  statutoryAnalysis: string;
  precedentApplication: string;
  conclusion: string;
  draftOrderBangla: string;
  draftOrderEnglish: string;
}

export interface TranslationOutput {
  banglaText: string;
  englishText: string;
  legalGlossary: { bangla: string; english: string }[];
}

export interface SynthesisOutput {
  briefBangla: string;
  briefEnglish: string;
  draftOrderBangla: string;
  draftOrderEnglish: string;
  citationsVerified: boolean;
  estimatedManualHours: number;
  totalAgentSeconds: number;
}

export interface CriticReport {
  passed: boolean;
  issues: {
    agent: AgentId;
    severity: "info" | "warning" | "error";
    message: string;
  }[];
  rerunSuggestions: AgentId[];
}

export interface BudgetSnapshot {
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
  perAgentCostUsd: Partial<Record<AgentId, number>>;
}
