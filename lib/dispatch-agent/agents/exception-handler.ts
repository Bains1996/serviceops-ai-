import { randomUUID } from "crypto";
import { DispatchState, Driver } from "../types";
import { Agent, AgentThinkInput, AgentThinkOutput, AgentAction, ToolExecutionResult, ToolDefinition } from "./types";
import { updateState, getState } from "../store";

const TOOLS: ToolDefinition[] = [
  {
    name: "triage_exception",
    description: "Analyze and prioritize exceptions based on severity and impact",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the affected driver", required: true },
      { name: "exceptionType", type: "string", description: "Type of exception (DELAY, BREAKDOWN, ACCIDENT, WEATHER)", required: true },
      { name: "severity", type: "string", description: "Initial severity assessment", required: true },
    ],
  },
  {
    name: "notify_stakeholders",
    description: "Send notifications to affected parties (dispatchers, customers, carriers)",
    parameters: [
      { name: "recipients", type: "array", description: "List of recipients to notify", required: true },
      { name: "message", type: "string", description: "Notification message", required: true },
      { name: "priority", type: "string", description: "Notification priority (LOW, MEDIUM, HIGH, CRITICAL)", required: true },
    ],
  },
  {
    name: "find_alternative",
    description: "Find alternative solutions for the exception (reroute, swap driver, reschedule)",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the affected driver", required: true },
      { name: "exceptionType", type: "string", description: "Type of exception", required: true },
      { name: "constraints", type: "object", description: "Constraints for alternatives", required: false },
    ],
  },
  {
    name: "estimate_impact",
    description: "Estimate business impact of the exception (cost, time, customer satisfaction)",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the affected driver", required: true },
      { name: "exceptionType", type: "string", description: "Type of exception", required: true },
      { name: "duration", type: "number", description: "Estimated duration in hours", required: false },
    ],
  },
];

function classifySeverity(driver: Driver, text: string): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("accident") || lowerText.includes("injury") || lowerText.includes("fire")) {
    return "CRITICAL";
  }

  if (lowerText.includes("breakdown") || lowerText.includes("broke down")) {
    return "HIGH";
  }

  if (lowerText.includes("delay") || lowerText.includes("late")) {
    if (lowerText.includes("hour") || lowerText.includes("significant")) {
      return "HIGH";
    }
    return "MEDIUM";
  }

  if (lowerText.includes("weather") || lowerText.includes("road") || lowerText.includes("traffic")) {
    return "MEDIUM";
  }

  return "LOW";
}

function estimateDelayHours(text: string): number {
  const hourMatch = text.match(/(\d+)\s*(?:hour|hr)/i);
  if (hourMatch) return parseInt(hourMatch[1], 10);

  const delayMatch = text.match(/delay(?:ed)?\s*(?:by)?\s*(\d+)/i);
  if (delayMatch) return parseInt(delayMatch[1], 10);

  return 2; // Default 2-hour estimate
}

export class ExceptionHandler implements Agent {
  type = "EXCEPTION_HANDLER" as const;
  name = "Exception Handler";
  description = "Triages and resolves dispatch exceptions (delays, breakdowns, emergencies)";
  tools = TOOLS;

  getSystemPrompt(): string {
    return `You are the Exception Handler agent for ServiceOps AI, a trucking dispatch operations platform.

Your role is to:
1. Monitor incoming driver messages for exceptions (delays, breakdowns, accidents)
2. Classify severity and prioritize response
3. Triage exceptions and determine appropriate actions
4. Find alternative solutions (reroute, swap driver, reschedule)
5. Estimate business impact and notify stakeholders
6. Coordinate with other agents for resolution

When handling exceptions:
- CRITICAL: Immediate safety issues, accidents, injuries → Emergency protocols
- HIGH: Breakdowns, significant delays → Active resolution required
- MEDIUM: Minor delays, weather issues → Monitor and plan
- LOW: Routine status updates → Log and continue

Always consider:
- Driver safety first
- Customer delivery commitments
- Cost impact (towing, rerouting, delays)
- Compliance requirements (HOS, insurance)
- Communication to all affected parties

Be decisive and action-oriented. Provide clear next steps.`;
  }

  async think(input: AgentThinkInput): Promise<AgentThinkOutput> {
    const { state, event } = input;
    const actions: AgentAction[] = [];
    let reasoning = "";

    // Check for drivers with exceptions
    const exceptionDrivers = state.drivers.filter(
      (d) => d.status === "DELAYED" || d.status === "BREAKDOWN"
    );

    if (exceptionDrivers.length === 0) {
      reasoning = "No active exceptions detected. All drivers operating normally.";
      return { reasoning, actions };
    }

    for (const driver of exceptionDrivers) {
      const severity = driver.status === "BREAKDOWN" ? "HIGH" : "MEDIUM";

      // Triage action
      actions.push({
        id: randomUUID(),
        agentType: "EXCEPTION_HANDLER",
        action: "triage_exception",
        input: {
          driverId: driver.id,
          exceptionType: driver.status,
          severity,
        },
        result: `${driver.status} exception for ${driver.name} classified as ${severity}`,
        timestamp: new Date().toISOString(),
        success: true,
      });

      // Estimate impact
      actions.push({
        id: randomUUID(),
        agentType: "EXCEPTION_HANDLER",
        action: "estimate_impact",
        input: {
          driverId: driver.id,
          exceptionType: driver.status,
          duration: driver.status === "BREAKDOWN" ? 4 : 2,
        },
        result: `Impact estimated for ${driver.name}`,
        timestamp: new Date().toISOString(),
        success: true,
      });

      // Find alternatives if driver has a load
      if (driver.currentLoadId) {
        actions.push({
          id: randomUUID(),
          agentType: "EXCEPTION_HANDLER",
          action: "find_alternative",
          input: {
            driverId: driver.id,
            exceptionType: driver.status,
            constraints: {
              hasLoad: true,
              loadId: driver.currentLoadId,
            },
          },
          result: `Alternative solutions being evaluated for ${driver.name}`,
          timestamp: new Date().toISOString(),
          success: true,
        });
      }

      // Notify stakeholders
      actions.push({
        id: randomUUID(),
        agentType: "EXCEPTION_HANDLER",
        action: "notify_stakeholders",
        input: {
          recipients: ["dispatch", "operations"],
          message: `${driver.status} reported by ${driver.name} in ${driver.city}`,
          priority: severity,
        },
        result: `Stakeholders notified for ${driver.name} exception`,
        timestamp: new Date().toISOString(),
        success: true,
      });
    }

    reasoning = `${exceptionDrivers.length} active exception(s) detected and triaged. Actions initiated for resolution.`;

    return { reasoning, actions };
  }

  async execute(action: AgentAction): Promise<ToolExecutionResult> {
    const { action: actionType, input } = action;

    switch (actionType) {
      case "triage_exception": {
        const state = getState();
        const driver = state.drivers.find(d => d.id === input.driverId);
        if (!driver) {
          return { success: false, result: "Driver not found", error: "Driver not found" };
        }
        return {
          success: true,
          result: `Exception triaged: ${input.exceptionType} for driver ${driver.name} (${input.severity} severity)`,
          data: { severity: input.severity, timestamp: new Date().toISOString(), driverId: driver.id },
        };
      }

      case "notify_stakeholders": {
        const recipients = input.recipients as string[];
        return {
          success: true,
          result: `Notifications sent to ${recipients.length} recipients: ${recipients.join(", ")}`,
          data: { notified: recipients, timestamp: new Date().toISOString() },
        };
      }

      case "find_alternative": {
        const state = getState();
        const driver = state.drivers.find(d => d.id === input.driverId);
        const alternatives = ["Reroute around delay", "Swap to available driver", "Reschedule delivery window"];
        return {
          success: true,
          result: `Found ${alternatives.length} alternatives for ${driver?.name ?? input.driverId}`,
          data: { alternatives, driverId: input.driverId },
        };
      }

      case "estimate_impact": {
        const delayHours = (input.duration as number) || 2;
        const costImpact = delayHours * 250;
        return {
          success: true,
          result: `Impact estimated: ${delayHours}h delay, ~$${costImpact} cost impact`,
          data: { estimatedDelayHours: delayHours, costImpact: `$${costImpact}` },
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
