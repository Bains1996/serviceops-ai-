import { randomUUID } from "crypto";
import { DispatchState, Driver, Load } from "../types";
import { Agent, AgentThinkInput, AgentThinkOutput, AgentAction, ToolExecutionResult, ToolDefinition } from "./types";
import { updateState, getState } from "../store";
import { applyApprovalOnState } from "../engine";

const TOOLS: ToolDefinition[] = [
  {
    name: "score_loads",
    description: "Score and rank available loads for a specific driver based on rate, deadhead, and priority",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver to match loads for", required: true },
      { name: "limit", type: "number", description: "Number of top loads to return", required: false },
    ],
  },
  {
    name: "assign_load",
    description: "Assign a load to a driver and create an approval request",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
      { name: "loadId", type: "string", description: "ID of the load to assign", required: true },
      { name: "reason", type: "string", description: "Reason for this assignment", required: true },
    ],
  },
  {
    name: "calculate_optimal_route",
    description: "Calculate optimal routing considering current driver location and load requirements",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
      { name: "loadId", type: "string", description: "ID of the load", required: true },
    ],
  },
  {
    name: "get_driver_status",
    description: "Get detailed current status of a driver including location and availability",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
    ],
  },
  {
    name: "get_load_details",
    description: "Get detailed information about a specific load",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the load", required: true },
    ],
  },
];

function scoreLoad(driver: Driver, load: Load): { score: number; ratePerMile: number; reasoning: string } {
  if (load.equipment !== driver.equipment) {
    return { score: -999, ratePerMile: 0, reasoning: "Equipment mismatch" };
  }

  const ratePerMile = load.rateCad / Math.max(1, load.loadedMiles);
  const deadheadPenalty = load.deadheadMiles * 2;
  const score = ratePerMile * 100 - deadheadPenalty;

  let reasoning = `Rate: $${ratePerMile.toFixed(2)}/mi`;
  if (ratePerMile >= 3.5) reasoning += " (excellent)";
  else if (ratePerMile >= 2.5) reasoning += " (good)";
  else reasoning += " (below average)";

  reasoning += ` | Deadhead: ${load.deadheadMiles}mi`;
  if (load.deadheadMiles <= 10) reasoning += " (minimal)";
  else if (load.deadheadMiles <= 25) reasoning += " (acceptable)";
  else reasoning += " (high)";

  return { score, ratePerMile, reasoning };
}

function findBestLoad(driver: Driver, loads: Load[]): { load: Load; score: number; ratePerMile: number; reasoning: string } | null {
  const scored = loads
    .filter((load) => load.status === "OPEN")
    .map((load) => {
      const { score, ratePerMile, reasoning } = scoreLoad(driver, load);
      return { load, score, ratePerMile, reasoning };
    })
    .filter((item) => item.score > -999)
    .sort((a, b) => b.score - a.score);

  return scored[0] ?? null;
}

export class DispatchOrchestrator implements Agent {
  type = "DISPATCH_ORCHESTRATOR" as const;
  name = "Dispatch Orchestrator";
  description = "Analyzes driver availability and load board to find optimal assignments";
  tools = TOOLS;

  getSystemPrompt(): string {
    return `You are the Dispatch Orchestrator agent for ServiceOps AI, a trucking dispatch operations platform.

Your role is to:
1. Monitor driver availability and load board in real-time
2. Score and rank loads based on profitability (rate per mile) and efficiency (deadhead miles)
3. Recommend optimal load assignments to dispatchers
4. Consider driver equipment type, current location, and hours of service
5. Generate clear, actionable recommendations

When making decisions, prioritize:
- Maximize revenue per mile for the carrier
- Minimize deadhead (empty miles) between loads
- Match equipment types (DRY_VAN vs REEFER)
- Respect driver preferences and constraints
- Consider delivery time windows

Always provide reasoning for your recommendations. Be concise but thorough.`;
  }

  async think(input: AgentThinkInput): Promise<AgentThinkOutput> {
    const { state, event } = input;
    const actions: AgentAction[] = [];
    let reasoning = "";

    // Find available drivers
    const availableDrivers = state.drivers.filter(
      (d) => d.status === "AVAILABLE" || d.status === "AT_DROPOFF"
    );

    // Find open loads
    const openLoads = state.loads.filter((l) => l.status === "OPEN");

    if (availableDrivers.length === 0) {
      reasoning = "No available drivers at this time. Monitoring for status changes.";
      return { reasoning, actions };
    }

    if (openLoads.length === 0) {
      reasoning = "No open loads available. Waiting for new loads to arrive.";
      return { reasoning, actions };
    }

    // Score each available driver against all open loads
    const recommendations: Array<{
      driver: Driver;
      load: Load;
      score: number;
      ratePerMile: number;
      reasoning: string;
    }> = [];

    for (const driver of availableDrivers) {
      const best = findBestLoad(driver, openLoads);
      if (best) {
        recommendations.push({
          driver,
          load: best.load,
          score: best.score,
          ratePerMile: best.ratePerMile,
          reasoning: best.reasoning,
        });
      }
    }

    // Sort by score and take top recommendations
    recommendations.sort((a, b) => b.score - a.score);

    for (const rec of recommendations.slice(0, 3)) {
      actions.push({
        id: randomUUID(),
        agentType: "DISPATCH_ORCHESTRATOR",
        action: "ASSIGN_LOAD",
        input: {
          driverId: rec.driver.id,
          loadId: rec.load.id,
          score: rec.score,
          ratePerMile: rec.ratePerMile,
          reasoning: rec.reasoning,
        },
        result: `Recommended ${rec.load.id} for ${rec.driver.name}: $${rec.ratePerMile.toFixed(2)}/mi, ${rec.load.deadheadMiles}mi deadhead`,
        timestamp: new Date().toISOString(),
        success: true,
      });
    }

    reasoning = `Analyzed ${availableDrivers.length} available drivers against ${openLoads.length} open loads. Generated ${actions.length} assignment recommendations.`;

    return { reasoning, actions };
  }

  async execute(action: AgentAction): Promise<ToolExecutionResult> {
    const { action: actionType, input } = action;

    switch (actionType) {
      case "score_loads": {
        const state = getState();
        const driver = state.drivers.find(d => d.id === input.driverId);
        if (!driver) {
          return { success: false, result: "Driver not found", error: "Driver not found" };
        }
        const openLoads = state.loads.filter(l => l.status === "OPEN");
        const scores = openLoads.map(load => {
          const { score, ratePerMile, reasoning } = scoreLoad(driver, load);
          return { loadId: load.id, score, ratePerMile, reasoning };
        }).filter(s => s.score > -999).sort((a, b) => b.score - a.score);
        return {
          success: true,
          result: `Scored ${scores.length} loads for driver ${driver.name}`,
          data: { scores },
        };
      }

      case "assign_load": {
        const state = getState();
        const driver = state.drivers.find(d => d.id === input.driverId);
        const load = state.loads.find(l => l.id === input.loadId);
        if (!driver || !load) {
          return { success: false, result: "Driver or load not found", error: "Driver or load not found" };
        }
        updateState((s) => {
          const loadIdx = s.loads.findIndex(l => l.id === load.id);
          const driverIdx = s.drivers.findIndex(d => d.id === driver.id);
          if (loadIdx >= 0) {
            s.loads[loadIdx] = { ...s.loads[loadIdx], status: "ASSIGNED" as const, assignedDriverId: driver.id };
          }
          if (driverIdx >= 0) {
            s.drivers[driverIdx] = { ...s.drivers[driverIdx], currentLoadId: load.id };
          }
        });
        return {
          success: true,
          result: `Load ${load.id} assigned to driver ${driver.name}. Awaiting approval.`,
          data: { assignmentId: randomUUID(), loadId: load.id, driverId: driver.id },
        };
      }

      case "get_driver_status": {
        const state = getState();
        const driver = state.drivers.find(d => d.id === input.driverId);
        if (!driver) {
          return { success: false, result: "Driver not found", error: "Driver not found" };
        }
        return {
          success: true,
          result: `Driver ${driver.name} is ${driver.status}`,
          data: { driver },
        };
      }

      case "get_load_details": {
        const state = getState();
        const load = state.loads.find(l => l.id === input.loadId);
        if (!load) {
          return { success: false, result: "Load not found", error: "Load not found" };
        }
        return {
          success: true,
          result: `Load ${load.id} details retrieved`,
          data: { load },
        };
      }

      default:
        return {
          success: false,
          result: `Unknown action: ${actionType}`,
          error: `Tool ${actionType} not implemented`,
        };
    }
  }
}
