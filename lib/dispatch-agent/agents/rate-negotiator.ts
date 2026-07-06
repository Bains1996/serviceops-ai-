import { randomUUID } from "crypto";
import { DispatchState, Load } from "../types";
import { Agent, AgentThinkInput, AgentThinkOutput, AgentAction, ToolExecutionResult, ToolDefinition } from "./types";
import { getState } from "../store";

const TOOLS: ToolDefinition[] = [
  {
    name: "analyze_market_rates",
    description: "Analyze current market rates for a specific lane and equipment type",
    parameters: [
      { name: "origin", type: "string", description: "Origin city/region", required: true },
      { name: "destination", type: "string", description: "Destination city/region", required: true },
      { name: "equipmentType", type: "string", description: "Equipment type (DRY_VAN, REEFER)", required: true },
    ],
  },
  {
    name: "evaluate_rate",
    description: "Evaluate if a load rate is competitive and profitable",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the load to evaluate", required: true },
      { name: "marketAverage", type: "number", description: "Current market average rate per mile", required: true },
    ],
  },
  {
    name: "generate_counter_offer",
    description: "Generate a counter-offer for a load with below-market rate",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the load", required: true },
      { name: "currentRate", type: "number", description: "Current offered rate", required: true },
      { name: "targetRate", type: "number", description: "Target rate to negotiate for", required: true },
      { name: "reasoning", type: "string", description: "Reasoning for the counter-offer", required: true },
    ],
  },
  {
    name: "calculate_profitability",
    description: "Calculate full profitability analysis for a load including all costs",
    parameters: [
      { name: "loadId", type: "string", description: "ID of the load", required: true },
      { name: "driverCostPerMile", type: "number", description: "Driver cost per mile", required: false },
      { name: "fuelCostPerGallon", type: "number", description: "Fuel cost per gallon", required: false },
    ],
  },
];

function calculateMarketRate(origin: string, destination: string, equipmentType: string): number {
  // Simplified market rate calculation based on typical Canadian trucking rates
  const baseRates: Record<string, number> = {
    "DRY_VAN": 2.25,
    "REEFER": 2.75,
  };

  const base = baseRates[equipmentType] || 2.25;

  // Adjust for common lanes
  const laneMultipliers: Record<string, number> = {
    "BC-AB": 1.0,
    "AB-SK": 0.95,
    "SK-MB": 0.9,
    "MB-ON": 1.1,
    "ON-QC": 1.05,
    "QC-NB": 0.95,
    "cross-country": 1.2,
  };

  const laneKey = `${origin.substring(0, 2).toUpperCase()}-${destination.substring(0, 2).toUpperCase()}`;
  const multiplier = laneMultipliers[laneKey] || 1.0;

  return base * multiplier;
}

function evaluateProfitability(load: Load, marketRate: number): {
  isProfitable: boolean;
  ratePerMile: number;
  marketComparison: number;
  recommendation: string;
} {
  const ratePerMile = load.rateCad / Math.max(1, load.loadedMiles);
  const marketComparison = ((ratePerMile - marketRate) / marketRate) * 100;

  let isProfitable = true;
  let recommendation = "";

  if (marketComparison < -10) {
    isProfitable = false;
    recommendation = `Rate is ${Math.abs(marketComparison).toFixed(1)}% below market. Consider negotiating or declining.`;
  } else if (marketComparison < 0) {
    recommendation = `Rate is slightly below market. Acceptable if deadhead is minimal.`;
  } else if (marketComparison < 10) {
    recommendation = `Rate is at market. Good opportunity.`;
  } else {
    recommendation = `Rate is ${marketComparison.toFixed(1)}% above market. Excellent opportunity.`;
  }

  return {
    isProfitable,
    ratePerMile,
    marketComparison,
    recommendation,
  };
}

export class RateNegotiator implements Agent {
  type = "RATE_NEGOTIATOR" as const;
  name = "Rate Negotiator";
  description = "Analyzes load rates and negotiates optimal pricing with brokers";
  tools = TOOLS;

  getSystemPrompt(): string {
    return `You are the Rate Negotiator agent for ServiceOps AI, a trucking dispatch operations platform.

Your role is to:
1. Analyze market rates for specific lanes and equipment types
2. Evaluate if offered rates are competitive and profitable
3. Generate counter-offers for below-market rates
4. Calculate full profitability including all operational costs
5. Recommend acceptance or rejection of load offers

When evaluating rates, consider:
- Current market conditions and seasonal trends
- Lane-specific supply and demand
- Equipment availability and specialization
- Deadhead miles and positioning costs
- Driver costs and preferences
- Customer relationship value

Rate guidelines:
- DRY_VAN: $2.00-$3.50/mile (varies by lane)
- REEFER: $2.50-$4.00/mile (premium for temperature control)
- Cross-country: 15-25% premium over regional
- Remote/northern routes: 20-40% premium

Always provide clear reasoning and market context. Be data-driven but practical.`;
  }

  async think(input: AgentThinkInput): Promise<AgentThinkOutput> {
    const { state } = input;
    const actions: AgentAction[] = [];
    let reasoning = "";

    // Find open loads that need rate evaluation
    const openLoads = state.loads.filter((l) => l.status === "OPEN");

    if (openLoads.length === 0) {
      reasoning = "No open loads requiring rate evaluation.";
      return { reasoning, actions };
    }

    for (const load of openLoads.slice(0, 5)) {
      // Analyze market rates
      actions.push({
        id: randomUUID(),
        agentType: "RATE_NEGOTIATOR",
        action: "analyze_market_rates",
        input: {
          origin: load.origin,
          destination: load.destination,
          equipmentType: load.equipment,
        },
        result: `Market rate analysis completed for ${load.origin} → ${load.destination}`,
        timestamp: new Date().toISOString(),
        success: true,
      });

      // Evaluate current rate
      const marketRate = calculateMarketRate(load.origin, load.destination, load.equipment);
      const evaluation = evaluateProfitability(load, marketRate);

      actions.push({
        id: randomUUID(),
        agentType: "RATE_NEGOTIATOR",
        action: "evaluate_rate",
        input: {
          loadId: load.id,
          marketAverage: marketRate,
        },
        result: `Rate evaluation: ${evaluation.recommendation}`,
        timestamp: new Date().toISOString(),
        success: true,
      });

      // Calculate profitability
      actions.push({
        id: randomUUID(),
        agentType: "RATE_NEGOTIATOR",
        action: "calculate_profitability",
        input: {
          loadId: load.id,
          driverCostPerMile: 0.85,
          fuelCostPerGallon: 1.5,
        },
        result: `Profitability calculated for ${load.id}`,
        timestamp: new Date().toISOString(),
        success: true,
      });

      // Generate counter-offer if rate is below market
      if (!evaluation.isProfitable) {
        const targetRate = marketRate * load.loadedMiles * 1.05; // 5% above market

        actions.push({
          id: randomUUID(),
          agentType: "RATE_NEGOTIATOR",
          action: "generate_counter_offer",
          input: {
            loadId: load.id,
            currentRate: load.rateCad,
            targetRate,
            reasoning: evaluation.recommendation,
          },
          result: `Counter-offer generated: $${targetRate.toFixed(0)} (was $${load.rateCad})`,
          timestamp: new Date().toISOString(),
          success: true,
        });
      }
    }

    reasoning = `Analyzed ${openLoads.length} open loads for rate optimization. Market rates evaluated and profitability assessed.`;

    return { reasoning, actions };
  }

  async execute(action: AgentAction): Promise<ToolExecutionResult> {
    const { action: actionType, input } = action;

    switch (actionType) {
      case "analyze_market_rates": {
        const origin = input.origin as string;
        const destination = input.destination as string;
        const equipmentType = input.equipmentType as string;
        const marketRate = calculateMarketRate(origin, destination, equipmentType);
        return {
          success: true,
          result: `Market rate for ${origin} → ${destination} (${equipmentType}): $${marketRate.toFixed(2)}/mi`,
          data: { marketRate, origin, destination, equipmentType },
        };
      }

      case "evaluate_rate": {
        const state = getState();
        const load = state.loads.find(l => l.id === input.loadId);
        const marketAverage = input.marketAverage as number;
        if (!load) {
          return { success: false, result: "Load not found", error: "Load not found" };
        }
        const evaluation = evaluateProfitability(load, marketAverage);
        return {
          success: true,
          result: `Rate evaluation for ${load.id}: ${evaluation.recommendation}`,
          data: { ...evaluation, loadId: load.id },
        };
      }

      case "generate_counter_offer": {
        const currentRate = input.currentRate as number;
        const targetRate = input.targetRate as number;
        const reasoning = input.reasoning as string;
        return {
          success: true,
          result: `Counter-offer generated: $${targetRate.toFixed(0)} (was $${currentRate})`,
          data: { currentRate, targetRate, reasoning, loadId: input.loadId },
        };
      }

      case "calculate_profitability": {
        const state = getState();
        const load = state.loads.find(l => l.id === input.loadId);
        if (!load) {
          return { success: false, result: "Load not found", error: "Load not found" };
        }
        const ratePerMile = load.rateCad / Math.max(1, load.loadedMiles);
        const driverCostPerMile = (input.driverCostPerMile as number) || 0.85;
        const profitPerMile = ratePerMile - driverCostPerMile;
        const totalProfit = profitPerMile * load.loadedMiles;
        return {
          success: true,
          result: `Profitability for ${load.id}: $${profitPerMile.toFixed(2)}/mi, $${totalProfit.toFixed(0)} total`,
          data: { ratePerMile, driverCostPerMile, profitPerMile, totalProfit, loadId: load.id },
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
