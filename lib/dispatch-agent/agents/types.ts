import { DispatchState, Driver, Load, ApprovalItem } from "../types";

// ── Agent Types ──────────────────────────────────────────────────────────────

export type AgentType =
  | "DISPATCH_ORCHESTRATOR"
  | "EXCEPTION_HANDLER"
  | "RATE_NEGOTIATOR"
  | "COMPLIANCE_MONITOR"
  | "BILLING_READINESS"
  | "DRIVER_COORDINATOR";

export type AgentStatus = "IDLE" | "THINKING" | "EXECUTING" | "WAITING_APPROVAL" | "ERROR";

export type AgentMemory = {
  companyId: string;
  agentType: AgentType;
  context: Record<string, unknown>;
  lastAction?: string;
  lastResult?: string;
  history: AgentAction[];
  createdAt: string;
  updatedAt: string;
};

export type AgentAction = {
  id: string;
  agentType: AgentType;
  action: string;
  input: Record<string, unknown>;
  result: string;
  timestamp: string;
  success: boolean;
};

// ── Tool Definitions ─────────────────────────────────────────────────────────

export type ToolParameter = {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
  enum?: string[];
};

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: ToolParameter[];
};

export type ToolExecutionResult = {
  success: boolean;
  result: string;
  data?: unknown;
  error?: string;
};

// ── Agent Interface ──────────────────────────────────────────────────────────

export interface Agent {
  type: AgentType;
  name: string;
  description: string;
  tools: ToolDefinition[];

  think(input: AgentThinkInput): Promise<AgentThinkOutput>;
  execute(action: AgentAction): Promise<ToolExecutionResult>;
  getSystemPrompt(): string;
}

export type AgentThinkInput = {
  companyId: string;
  state: DispatchState;
  event?: AgentEvent;
  memory?: AgentMemory;
};

export type AgentThinkOutput = {
  reasoning: string;
  actions: AgentAction[];
  memoryUpdates?: Partial<AgentMemory>;
};

// ── Agent Events ─────────────────────────────────────────────────────────────

export type AgentEvent =
  | { type: "LOAD_ARRIVED"; load: Load }
  | { type: "DRIVER_STATUS_CHANGED"; driver: Driver; oldStatus: string }
  | { type: "APPROVAL_REQUESTED"; approval: ApprovalItem }
  | { type: "EXCEPTION_DETECTED"; severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; details: string }
  | { type: "RATE_NEGOTIATION"; loadId: string; currentRate: number; targetRate: number }
  | { type: "COMPLIANCE_CHECK"; driverId: string; checkType: string }
  | { type: "BILLING_READY"; loadId: string; documents: string[] }
  | { type: "DRIVER_MESSAGE"; driverId: string; message: string };

// ── Agent Orchestration ──────────────────────────────────────────────────────

export type OrchestrationResult = {
  agents: {
    agentType: AgentType;
    status: AgentStatus;
    actions: AgentAction[];
    reasoning: string;
  }[];
  summary: string;
  memoryUpdates: AgentMemory[];
};

// ── Model Routing ────────────────────────────────────────────────────────────

export type ModelTier = "FLASH" | "SONNET" | "GPT4O";

export const MODEL_ROUTING: Record<ModelTier, {
  model: string;
  provider: string;
  maxTokens: number;
  temperature: number;
}> = {
  FLASH: {
    model: "gemini-2.0-flash",
    provider: "GOOGLE",
    maxTokens: 1024,
    temperature: 0.3,
  },
  SONNET: {
    model: "claude-3-5-sonnet",
    provider: "ANTHROPIC",
    maxTokens: 2048,
    temperature: 0.2,
  },
  GPT4O: {
    model: "gpt-4o",
    provider: "OPENAI",
    maxTokens: 4096,
    temperature: 0.1,
  },
};

// Map agent types to model tiers
export const AGENT_MODEL_TIER: Record<AgentType, ModelTier> = {
  DRIVER_COORDINATOR: "FLASH",       // Quick, routine responses
  DISPATCH_ORCHESTRATOR: "SONNET",   // Complex assignment decisions
  EXCEPTION_HANDLER: "SONNET",       // Needs good reasoning
  RATE_NEGOTIATOR: "GPT4O",          // Complex negotiation logic
  COMPLIANCE_MONITOR: "FLASH",       // Rule-based checks
  BILLING_READINESS: "FLASH",        // Document validation
};
