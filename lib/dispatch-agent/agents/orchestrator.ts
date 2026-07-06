import { randomUUID } from "crypto";
import { DispatchState } from "../types";
import { Agent, AgentType, AgentEvent, AgentMemory, AgentAction, OrchestrationResult, AgentStatus, AgentThinkInput } from "./types";
import { DispatchOrchestrator } from "./dispatch-orchestrator";
import { ExceptionHandler } from "./exception-handler";
import { RateNegotiator } from "./rate-negotiator";
import { ComplianceMonitor } from "./compliance-monitor";
import { BillingReadiness } from "./billing-readiness";
import { DriverCoordinator } from "./driver-coordinator";

// ── Memory Store ─────────────────────────────────────────────────────────────

const memoryStore = new Map<string, AgentMemory>();

function getMemory(companyId: string, agentType: AgentType): AgentMemory | undefined {
  return memoryStore.get(`${companyId}:${agentType}`);
}

function setMemory(memory: AgentMemory): void {
  memoryStore.set(`${memory.companyId}:${memory.agentType}`, memory);
}

function createMemory(companyId: string, agentType: AgentType): AgentMemory {
  return {
    companyId,
    agentType,
    context: {},
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── Agent Registry ───────────────────────────────────────────────────────────

const agents: Record<AgentType, Agent> = {
  DISPATCH_ORCHESTRATOR: new DispatchOrchestrator(),
  EXCEPTION_HANDLER: new ExceptionHandler(),
  RATE_NEGOTIATOR: new RateNegotiator(),
  COMPLIANCE_MONITOR: new ComplianceMonitor(),
  BILLING_READINESS: new BillingReadiness(),
  DRIVER_COORDINATOR: new DriverCoordinator(),
};

// ── Agent Priority & Trigger Rules ───────────────────────────────────────────

const AGENT_PRIORITIES: Record<AgentType, number> = {
  EXCEPTION_HANDLER: 100,        // Highest priority - safety first
  DRIVER_COORDINATOR: 80,        // High - driver communication
  DISPATCH_ORCHESTRATOR: 60,     // Medium - load assignment
  COMPLIANCE_MONITOR: 40,        // Medium - regulatory
  RATE_NEGOTIATOR: 30,           // Lower - revenue optimization
  BILLING_READINESS: 20,         // Lowest - back office
};

function determineRelevantAgents(
  state: DispatchState,
  event?: AgentEvent
): AgentType[] {
  const relevant: AgentType[] = [];

  // Always check for exceptions
  const hasExceptions = state.drivers.some(
    (d) => d.status === "DELAYED" || d.status === "BREAKDOWN"
  );
  if (hasExceptions) {
    relevant.push("EXCEPTION_HANDLER");
  }

  // Check for available drivers needing loads
  const availableDrivers = state.drivers.filter(
    (d) => d.status === "AVAILABLE" || d.status === "AT_DROPOFF"
  );
  if (availableDrivers.length > 0) {
    relevant.push("DISPATCH_ORCHESTRATOR");
  }

  // Check for delivered loads needing billing
  const deliveredLoads = state.loads.filter((l) => l.status === "DELIVERED");
  if (deliveredLoads.length > 0) {
    relevant.push("BILLING_READINESS");
  }

  // Always run compliance checks periodically
  relevant.push("COMPLIANCE_MONITOR");

  // Handle driver messages
  if (event?.type === "DRIVER_MESSAGE") {
    relevant.push("DRIVER_COORDINATOR");
  }

  // Rate negotiations for open loads
  const openLoads = state.loads.filter((l) => l.status === "OPEN");
  if (openLoads.length > 0) {
    relevant.push("RATE_NEGOTIATOR");
  }

  // Remove duplicates and sort by priority
  const unique = [...new Set(relevant)];
  return unique.sort((a, b) => AGENT_PRIORITIES[b] - AGENT_PRIORITIES[a]);
}

// ── Main Orchestration Function ──────────────────────────────────────────────

export async function orchestrateAgents(input: {
  companyId: string;
  state: DispatchState;
  event?: AgentEvent;
}): Promise<OrchestrationResult> {
  const { companyId, state, event } = input;
  const results: OrchestrationResult["agents"] = [];
  const allActions: AgentAction[] = [];
  const memoryUpdates: AgentMemory[] = [];

  // Determine which agents to run
  const relevantAgents = determineRelevantAgents(state, event);

  console.log(`[Orchestrator] Running ${relevantAgents.length} agents for company ${companyId}`);

  // Run each agent
  for (const agentType of relevantAgents) {
    const agent = agents[agentType];
    const memory = getMemory(companyId, agentType) || createMemory(companyId, agentType);

    const thinkInput: AgentThinkInput = {
      companyId,
      state,
      event,
      memory,
    };

    let status: AgentStatus = "THINKING";
    let actions: AgentAction[] = [];
    let reasoning = "";

    try {
      // Agent thinks
      const output = await agent.think(thinkInput);
      reasoning = output.reasoning;
      actions = output.actions;

      // Update memory
      const updatedMemory: AgentMemory = {
        ...memory,
        ...output.memoryUpdates,
        lastAction: actions.length > 0 ? actions[0].action : memory.lastAction,
        lastResult: reasoning,
        history: [...memory.history, ...actions].slice(-50), // Keep last 50 actions
        updatedAt: new Date().toISOString(),
      };
      setMemory(updatedMemory);
      memoryUpdates.push(updatedMemory);

      // Execute actions
      status = "EXECUTING";
      for (const action of actions.slice(0, 5)) { // Limit to 5 actions per agent
        try {
          const result = await agent.execute(action);
          action.result = result.success ? result.result : `Error: ${result.error}`;
          action.success = result.success;
        } catch (error) {
          action.success = false;
          action.result = `Execution error: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
      }

      status = "IDLE";
    } catch (error) {
      status = "ERROR";
      reasoning = `Agent error: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(`[Orchestrator] Error in ${agentType}:`, error);
    }

    results.push({
      agentType,
      status,
      actions,
      reasoning,
    });

    allActions.push(...actions);
  }

  // Generate summary
  const summary = generateSummary(results);

  return {
    agents: results,
    summary,
    memoryUpdates,
  };
}

function generateSummary(results: OrchestrationResult["agents"]): string {
  const parts: string[] = [];

  for (const result of results) {
    if (result.actions.length > 0) {
      const agentName = agents[result.agentType]?.name || result.agentType;
      parts.push(`${agentName}: ${result.reasoning}`);
    }
  }

  if (parts.length === 0) {
    return "No actions required at this time.";
  }

  return parts.join("\n");
}

// ── Single Agent Execution ───────────────────────────────────────────────────

export async function executeSingleAgent(input: {
  companyId: string;
  agentType: AgentType;
  state: DispatchState;
  event?: AgentEvent;
}): Promise<{
  agent: AgentType;
  status: AgentStatus;
  actions: AgentAction[];
  reasoning: string;
}> {
  const { companyId, agentType, state, event } = input;
  const agent = agents[agentType];

  if (!agent) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  const memory = getMemory(companyId, agentType) || createMemory(companyId, agentType);

  const thinkInput: AgentThinkInput = {
    companyId,
    state,
    event,
    memory,
  };

  let status: AgentStatus = "THINKING";
  let actions: AgentAction[] = [];
  let reasoning = "";

  try {
    const output = await agent.think(thinkInput);
    reasoning = output.reasoning;
    actions = output.actions;

    // Update memory
    const updatedMemory: AgentMemory = {
      ...memory,
      ...output.memoryUpdates,
      lastAction: actions.length > 0 ? actions[0].action : memory.lastAction,
      lastResult: reasoning,
      history: [...memory.history, ...actions].slice(-50),
      updatedAt: new Date().toISOString(),
    };
    setMemory(updatedMemory);

    // Execute actions
    status = "EXECUTING";
    for (const action of actions) {
      try {
        const result = await agent.execute(action);
        action.result = result.success ? result.result : `Error: ${result.error}`;
        action.success = result.success;
      } catch (error) {
        action.success = false;
        action.result = `Execution error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }

    status = "IDLE";
  } catch (error) {
    status = "ERROR";
    reasoning = `Agent error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }

  return {
    agent: agentType,
    status,
    actions,
    reasoning,
  };
}

// ── Agent Info ───────────────────────────────────────────────────────────────

export function getAgentInfo(): Array<{
  type: AgentType;
  name: string;
  description: string;
  tools: string[];
}> {
  return Object.entries(agents).map(([type, agent]) => ({
    type: type as AgentType,
    name: agent.name,
    description: agent.description,
    tools: agent.tools.map((t) => t.name),
  }));
}

export function getAgentMemory(companyId: string): AgentMemory[] {
  const memories: AgentMemory[] = [];
  for (const agentType of Object.keys(agents) as AgentType[]) {
    const memory = getMemory(companyId, agentType);
    if (memory) {
      memories.push(memory);
    }
  }
  return memories;
}
