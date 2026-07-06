import { DispatchState } from "@/lib/dispatch-agent/types";
import { AgentType, AgentEvent, OrchestrationResult } from "@/lib/dispatch-agent/agents/types";
import { orchestrateAgents, executeSingleAgent, getAgentInfo, getAgentMemory } from "@/lib/dispatch-agent/agents/orchestrator";
import { classifyTask, getModelForTask } from "@/lib/ai-brain/model-router";
import { callWithFailover } from "@/lib/ai-brain/failover";

type AIBrainProvider = "OPENROUTER" | "OPENAI" | "ANTHROPIC";

export type AIBrainGuidance = {
  summary: string;
  actions: string[];
};

// ── Enhanced AI Brain with Agentic System ────────────────────────────────────

export type AgenticBrainResult = {
  orchestration: OrchestrationResult;
  aiGuidance: AIBrainGuidance | null;
  agentInfo: ReturnType<typeof getAgentInfo>;
  memory: ReturnType<typeof getAgentMemory>;
};

// ── Original AI Brain (for external LLM guidance) ────────────────────────────

function normalizeProvider(value: string | undefined): AIBrainProvider {
  const provider = (value ?? "OPENROUTER").trim().toUpperCase();
  if (provider === "OPENAI") return "OPENAI";
  if (provider === "ANTHROPIC") return "ANTHROPIC";
  return "OPENROUTER";
}

function getModel(provider: AIBrainProvider) {
  const configured = process.env.AI_BRAIN_MODEL?.trim();
  if (configured) return configured;

  if (provider === "OPENAI") return "gpt-4.1-mini";
  if (provider === "ANTHROPIC") return "claude-3-5-sonnet-latest";
  return "anthropic/claude-3.5-sonnet";
}

function isAIBrainEnabled() {
  const raw = (process.env.AI_BRAIN_ENABLED ?? "false").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

function getApiKey() {
  return process.env.AI_BRAIN_API_KEY?.trim() ?? "";
}

function compactState(state: DispatchState) {
  const pendingApprovals = state.approvals.filter((item) => item.status === "PENDING");
  const delayedDrivers = state.drivers.filter((driver) => driver.status === "DELAYED" || driver.status === "BREAKDOWN");
  const openLoads = state.loads.filter((load) => load.status === "OPEN");

  return {
    updatedAt: state.updatedAt,
    pendingApprovals: pendingApprovals.map((item) => ({
      id: item.id,
      driverId: item.driverId,
      loadId: item.loadId,
      deadheadMiles: item.deadheadMiles,
      ratePerMile: item.ratePerMile,
    })),
    delayedDrivers: delayedDrivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      status: driver.status,
      city: driver.city,
    })),
    openLoads: openLoads.slice(0, 8).map((load) => ({
      id: load.id,
      origin: load.origin,
      destination: load.destination,
      pickupAt: load.pickupAt,
      deliveryAt: load.deliveryAt,
      rateCad: load.rateCad,
      loadedMiles: load.loadedMiles,
      deadheadMiles: load.deadheadMiles,
    })),
  };
}

function extractFirstJsonObject(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;

  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;

  const maybe = raw.slice(first, last + 1);
  try {
    return JSON.parse(maybe) as { summary?: unknown; actions?: unknown };
  } catch {
    return null;
  }
}

function normalizeGuidance(payload: { summary?: unknown; actions?: unknown } | null) {
  if (!payload) return null;

  const summary = typeof payload.summary === "string" ? payload.summary.trim() : "";
  const actions = Array.isArray(payload.actions)
    ? payload.actions.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];

  if (!summary || actions.length === 0) return null;
  return {
    summary: summary.slice(0, 260),
    actions: actions.slice(0, 3).map((item) => item.slice(0, 200)),
  } satisfies AIBrainGuidance;
}

async function callOpenAICompatible(args: {
  url: string;
  apiKey: string;
  model: string;
  prompt: string;
  extraHeaders?: Record<string, string>;
}) {
  const res = await fetch(args.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.apiKey}`,
      ...(args.extraHeaders ?? {}),
    },
    body: JSON.stringify({
      model: args.model,
      temperature: 0.1,
      messages: [
        { role: "system", content: "You are a trucking dispatch operations planner." },
        { role: "user", content: args.prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`AI provider request failed with status ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(args: { apiKey: string; model: string; prompt: string }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": args.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: args.model,
      max_tokens: 450,
      temperature: 0.1,
      system: "You are a trucking dispatch operations planner. Return strict JSON only.",
      messages: [{ role: "user", content: args.prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`AI provider request failed with status ${res.status}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  return data.content?.find((item) => item.type === "text")?.text ?? "";
}

export async function generateAIBrainGuidance(input: {
  companyId: string;
  eventType?: string;
  eventId?: string;
  state: DispatchState;
}) {
  if (!isAIBrainEnabled()) return null;
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const provider = normalizeProvider(process.env.AI_BRAIN_PROVIDER);
  const model = getModel(provider);
  const stateSummary = compactState(input.state);

  const prompt = [
    "Given this trucking dispatch state, produce 1 concise summary and 1-3 next operational actions.",
    "Actions must be practical and low-risk for the next 30-60 minutes.",
    "Return strict JSON with this shape:",
    '{"summary":"...","actions":["...","..."]}',
    `Company: ${input.companyId}`,
    `Event Type: ${input.eventType ?? "N/A"}`,
    `Event Id: ${input.eventId ?? "N/A"}`,
    `State Snapshot: ${JSON.stringify(stateSummary)}`,
  ].join("\n");

  let raw = "";
  if (provider === "OPENAI") {
    raw = await callOpenAICompatible({
      url: "https://api.openai.com/v1/chat/completions",
      apiKey,
      model,
      prompt,
    });
  } else if (provider === "ANTHROPIC") {
    raw = await callAnthropic({ apiKey, model, prompt });
  } else {
    // Smart routing: classify task → pick cheapest capable model → failover on error
    const complexity = classifyTask(prompt);
    const systemMsg = "You are a trucking dispatch operations planner. Return strict JSON only.";
    try {
      const result = await callWithFailover(complexity, systemMsg, prompt, apiKey);
      raw = result.content;
      console.log(`[AIBrain] Model: ${result.model} | Complexity: ${complexity} | Cost: $${((result.inputTokens * 0.15 + result.outputTokens * 0.60) / 1_000_000).toFixed(6)}`);
    } catch {
      // Failover exhausted — return null (rule-based only)
      return null;
    }
  }

  return normalizeGuidance(extractFirstJsonObject(raw));
}

// ── Agentic Brain (Combined Rule-Based + LLM) ───────────────────────────────

export async function runAgenticBrain(input: {
  companyId: string;
  state: DispatchState;
  event?: AgentEvent;
}): Promise<AgenticBrainResult> {
  const { companyId, state, event } = input;

  // Run the 6-agent orchestration system (rule-based)
  const orchestration = await orchestrateAgents({
    companyId,
    state,
    event,
  });

  // Optionally get LLM guidance (if enabled)
  let aiGuidance: AIBrainGuidance | null = null;
  if (isAIBrainEnabled() && getApiKey()) {
    try {
      aiGuidance = await generateAIBrainGuidance({
        companyId,
        eventType: event?.type,
        state,
      });
    } catch (error) {
      console.error("[AIBrain] LLM guidance failed:", error);
    }
  }

  return {
    orchestration,
    aiGuidance,
    agentInfo: getAgentInfo(),
    memory: getAgentMemory(companyId),
  };
}

// ── Single Agent Execution ───────────────────────────────────────────────────

export async function runSingleAgent(input: {
  companyId: string;
  agentType: AgentType;
  state: DispatchState;
  event?: AgentEvent;
}) {
  return executeSingleAgent(input);
}

// ── Agent System Status ──────────────────────────────────────────────────────

export function getAgentSystemStatus() {
  return {
    agents: getAgentInfo(),
    aiBrainEnabled: isAIBrainEnabled(),
    provider: normalizeProvider(process.env.AI_BRAIN_PROVIDER),
    model: getModel(normalizeProvider(process.env.AI_BRAIN_PROVIDER)),
    routing: "3-tier smart routing (simple→Gemini Flash Lite, moderate→GPT-4o-mini, complex→Claude Sonnet)",
  };
}