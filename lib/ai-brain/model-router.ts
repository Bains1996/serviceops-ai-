// ═══════════════════════════════════════════════════════════════
// MODEL ROUTER — Smart AI model selection with failover
// Routes tasks to the cheapest model that can handle them
// ═══════════════════════════════════════════════════════════════

export type TaskComplexity = "simple" | "moderate" | "complex";

export type ModelConfig = {
  id: string;
  costPer1MInput: number;
  costPer1MOutput: number;
};

const MODELS: Record<string, ModelConfig> = {
  "google/gemini-2.5-flash-lite": {
    id: "google/gemini-2.5-flash-lite",
    costPer1MInput: 0.10,
    costPer1MOutput: 0.40,
  },
  "deepseek/deepseek-v4-flash": {
    id: "deepseek/deepseek-v4-flash",
    costPer1MInput: 0.09,
    costPer1MOutput: 0.18,
  },
  "openai/gpt-4o-mini": {
    id: "openai/gpt-4o-mini",
    costPer1MInput: 0.15,
    costPer1MOutput: 0.60,
  },
  "anthropic/claude-3-haiku": {
    id: "anthropic/claude-3-haiku",
    costPer1MInput: 0.25,
    costPer1MOutput: 1.25,
  },
  "anthropic/claude-sonnet-4": {
    id: "anthropic/claude-sonnet-4",
    costPer1MInput: 3.00,
    costPer1MOutput: 15.00,
  },
  "openai/gpt-4o": {
    id: "openai/gpt-4o",
    costPer1MInput: 2.50,
    costPer1MOutput: 10.00,
  },
};

const FAILOVER_CHAINS: Record<TaskComplexity, string[]> = {
  simple: ["google/gemini-2.5-flash-lite", "openai/gpt-4o-mini", "anthropic/claude-3-haiku"],
  moderate: ["openai/gpt-4o-mini", "anthropic/claude-3-haiku", "google/gemini-2.5-flash-lite"],
  complex: ["anthropic/claude-sonnet-4", "openai/gpt-4o", "openai/gpt-4o-mini"],
};

const SIMPLE_PATTERNS = [
  /\barrived\b/i, /\bloaded\b/i, /\bunloaded\b/i, /\bfree\b/i,
  /\bavailable\b/i, /\byes\b/i, /\bno\b/i, /\bok\b/i,
  /\bdelay\b/i, /\bbreakdown\b/i, /\bstatus\b/i, /\bcheck\b/i,
  /\bsent\b/i, /\bdelivered\b/i, /\bpicked up\b/i,
];

const COMPLEX_PATTERNS = [
  /\bnegotiate\b/i, /\brecommend\b/i, /\bstrateg/i, /\boptimiz/i,
  /\banalyze\b/i, /\bwhat should\b/i, /\bhow should\b/i,
  /\bcomplex\b/i, /\bescalat/i, /\bexception\b/i, /\breroute\b/i,
  /\balternative\b/i, /\bimpact\b/i, /\bcost analysis\b/i, /\bprofitab/i,
];

export function classifyTask(message: string): TaskComplexity {
  const msg = message.trim().toLowerCase();
  if (msg.length < 20 && SIMPLE_PATTERNS.some((p) => p.test(msg))) return "simple";
  if (COMPLEX_PATTERNS.some((p) => p.test(msg))) return "complex";
  if (SIMPLE_PATTERNS.some((p) => p.test(msg))) return "simple";
  return "moderate";
}

export function getModelForTask(complexity: TaskComplexity): ModelConfig {
  return MODELS[FAILOVER_CHAINS[complexity][0]];
}

export function getFailoverChain(complexity: TaskComplexity): ModelConfig[] {
  return FAILOVER_CHAINS[complexity].map((id) => MODELS[id]).filter(Boolean);
}

export function estimateCost(model: ModelConfig, inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * model.costPer1MInput + (outputTokens / 1_000_000) * model.costPer1MOutput;
}
