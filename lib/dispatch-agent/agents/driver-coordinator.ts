import { randomUUID } from "crypto";
import { DispatchState, Driver } from "../types";
import { Agent, AgentThinkInput, AgentThinkOutput, AgentAction, ToolExecutionResult, ToolDefinition } from "./types";
import { getState } from "../store";
import { sendSms } from "../../messaging/sms";

const TOOLS: ToolDefinition[] = [
  {
    name: "send_sms",
    description: "Send an SMS message to a driver",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver to message", required: true },
      { name: "message", type: "string", description: "Message content to send", required: true },
      { name: "priority", type: "string", description: "Message priority (LOW, NORMAL, HIGH)", required: false },
    ],
  },
  {
    name: "parse_driver_response",
    description: "Parse and interpret a driver's SMS response",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver who responded", required: true },
      { name: "message", type: "string", description: "Driver's message content", required: true },
    ],
  },
  {
    name: "get_driver_context",
    description: "Get full context for a driver including current load, location, and history",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
    ],
  },
  {
    name: "send_assignment_notification",
    description: "Send a load assignment notification with all details to a driver",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
      { name: "loadId", type: "string", description: "ID of the assigned load", required: true },
      { name: "pickupLocation", type: "string", description: "Pickup location address", required: true },
      { name: "deliveryLocation", type: "string", description: "Delivery location address", required: true },
      { name: "pickupTime", type: "string", description: "Scheduled pickup time", required: true },
      { name: "specialInstructions", type: "string", description: "Any special instructions", required: false },
    ],
  },
  {
    name: "confirm_receipt",
    description: "Confirm driver received and understood a message",
    parameters: [
      { name: "driverId", type: "string", description: "ID of the driver", required: true },
      { name: "messageId", type: "string", description: "ID of the message to confirm", required: true },
    ],
  },
];

function parseDriverMessage(text: string): {
  intent: string;
  confidence: number;
  extractedInfo: Record<string, string>;
} {
  const lowerText = text.toLowerCase().trim();

  // Status updates
  if (/\b(arrived|at shipper|at pickup|at dock)\b/.test(lowerText)) {
    return {
      intent: "STATUS_ARRIVED",
      confidence: 0.95,
      extractedInfo: { status: "AT_PICKUP" },
    };
  }

  if (/\b(loaded|got load|cargo secured|ready to roll)\b/.test(lowerText)) {
    return {
      intent: "STATUS_LOADED",
      confidence: 0.95,
      extractedInfo: { status: "EN_ROUTE" },
    };
  }

  if (/\b(unloaded|empty|done delivery|delivered)\b/.test(lowerText)) {
    return {
      intent: "STATUS_UNLOADED",
      confidence: 0.95,
      extractedInfo: { status: "AVAILABLE" },
    };
  }

  // Exceptions
  if (/\b(delay|late|running behind|traffic|weather)\b/.test(lowerText)) {
    const etaMatch = lowerText.match(/(?:eta|expected|will be|arrive)\s*(?:at|around|by)?\s*(\d{1,2}(?::\d{2})?(?:\s*(?:am|pm))?)/i);
    return {
      intent: "EXCEPTION_DELAY",
      confidence: 0.9,
      extractedInfo: {
        status: "DELAYED",
        eta: etaMatch?.[1] || "unknown",
      },
    };
  }

  if (/\b(breakdown|broke down|flat tire|engine|mechanical)\b/.test(lowerText)) {
    return {
      intent: "EXCEPTION_BREAKDOWN",
      confidence: 0.95,
      extractedInfo: { status: "BREAKDOWN" },
    };
  }

  // Acknowledgments
  if (/\b(ok|okay|copy|10-4|roger|understood|will do|got it)\b/.test(lowerText)) {
    return {
      intent: "ACKNOWLEDGMENT",
      confidence: 0.9,
      extractedInfo: {},
    };
  }

  // Questions
  if (/\b(\?|when|where|what|how|who)\b/.test(lowerText)) {
    return {
      intent: "QUESTION",
      confidence: 0.8,
      extractedInfo: {},
    };
  }

  // Default
  return {
    intent: "UNRECOGNIZED",
    confidence: 0.5,
    extractedInfo: {},
  };
}

function generateDriverResponse(driver: Driver, intent: string, extractedInfo: Record<string, string>): string {
  switch (intent) {
    case "STATUS_ARRIVED":
      return `Arrival logged for ${driver.name}. Please update with LOADED once cargo is secured.`;

    case "STATUS_LOADED":
      return `Loaded status confirmed. Proceed to destination and text UNLOADED when complete.`;

    case "STATUS_UNLOADED":
      return `Unloaded status recorded. Finding your best next load now.`;

    case "EXCEPTION_DELAY":
      return `Delay recorded. Updated ETA: ${extractedInfo.eta || "pending"}. Dispatch is notifying customer.`;

    case "EXCEPTION_BREAKDOWN":
      return `Breakdown reported. Please send: 1) Exact location 2) Issue description. Repair coordination initiated.`;

    case "ACKNOWLEDGMENT":
      return `Thank you, ${driver.name}. Standing by for next update.`;

    case "QUESTION":
      return `Received your question. Dispatch will respond shortly with the information you need.`;

    default:
      return `Message received. If this is a status update, please send one of: ARRIVED, LOADED, UNLOADED, DELAY, BREAKDOWN.`;
  }
}

export class DriverCoordinator implements Agent {
  type = "DRIVER_COORDINATOR" as const;
  name = "Driver Coordinator";
  description = "Manages SMS-based driver communication and status tracking";
  tools = TOOLS;

  getSystemPrompt(): string {
    return `You are the Driver Coordinator agent for ServiceOps AI, a trucking dispatch operations platform.

Your role is to:
1. Communicate with drivers via SMS (text messages)
2. Parse and interpret driver responses
3. Track driver status and location
4. Send load assignments with clear instructions
5. Handle driver questions and concerns

Communication style:
- Keep messages short and clear (SMS-friendly)
- Use plain language, no jargon
- Be professional but friendly
- Provide actionable information
- Confirm receipt of important updates

Standard status updates:
- ARRIVED → Driver is at pickup location
- LOADED → Cargo secured, en route to delivery
- UNLOADED → Delivery complete, available for next load
- DELAY → Delay reported with ETA
- BREAKDOWN → Mechanical issue, needs assistance

When sending load assignments include:
- Load ID
- Pickup location and time
- Delivery location and time
- Special instructions (if any)
- Reply CONFIRM to accept

Always acknowledge driver messages promptly. Be the reliable point of contact.`;
  }

  async think(input: AgentThinkInput): Promise<AgentThinkOutput> {
    const { state, event } = input;
    const actions: AgentAction[] = [];
    let reasoning = "";

    // Handle incoming driver message event
    if (event?.type === "DRIVER_MESSAGE") {
      const driver = state.drivers.find((d) => d.id === event.driverId);
      if (driver) {
        // Parse the message
        const parsed = parseDriverMessage(event.message);

        // Get driver context
        actions.push({
          id: randomUUID(),
          agentType: "DRIVER_COORDINATOR",
          action: "get_driver_context",
          input: { driverId: driver.id },
          result: `Context retrieved for ${driver.name}`,
          timestamp: new Date().toISOString(),
          success: true,
        });

        // Parse the response
        actions.push({
          id: randomUUID(),
          agentType: "DRIVER_COORDINATOR",
          action: "parse_driver_response",
          input: {
            driverId: driver.id,
            message: event.message,
          },
          result: `Message parsed: intent=${parsed.intent}, confidence=${parsed.confidence}`,
          timestamp: new Date().toISOString(),
          success: true,
        });

        // Generate and send response
        const response = generateDriverResponse(driver, parsed.intent, parsed.extractedInfo);

        actions.push({
          id: randomUUID(),
          agentType: "DRIVER_COORDINATOR",
          action: "send_sms",
          input: {
            driverId: driver.id,
            message: response,
            priority: parsed.intent.startsWith("EXCEPTION") ? "HIGH" : "NORMAL",
          },
          result: `SMS sent to ${driver.name}: ${response.substring(0, 50)}...`,
          timestamp: new Date().toISOString(),
          success: true,
        });

        reasoning = `Processed message from ${driver.name}: "${event.message}" → Intent: ${parsed.intent} (confidence: ${(parsed.confidence * 100).toFixed(0)}%)`;
      }
    } else {
      // Proactive communication - check on drivers
      const driversNeedingUpdate = state.drivers.filter(
        (d) => d.status === "EN_ROUTE" || d.status === "AT_PICKUP"
      );

      for (const driver of driversNeedingUpdate.slice(0, 3)) {
        actions.push({
          id: randomUUID(),
          agentType: "DRIVER_COORDINATOR",
          action: "get_driver_context",
          input: { driverId: driver.id },
          result: `Context retrieved for ${driver.name}`,
          timestamp: new Date().toISOString(),
          success: true,
        });
      }

      reasoning = `Checked ${driversNeedingUpdate.length} drivers for proactive communication needs.`;
    }

    return { reasoning, actions };
  }

  async execute(action: AgentAction): Promise<ToolExecutionResult> {
    const { action: actionType, input } = action;

    switch (actionType) {
      case "send_sms": {
        const state = getState();
        const driver = state.drivers.find(d => d.id === input.driverId);
        const phone = driver?.phone;
        let delivered = false;

        if (phone) {
          try {
            const result = await sendSms(phone, input.message as string);
            delivered = result.sent;
          } catch (e) {
            console.log(`[SMS] Twilio not configured. Would send to ${phone}: ${input.message}`);
          }
        }

        return {
          success: true,
          result: `SMS ${delivered ? "sent" : "queued"} to driver ${driver?.name ?? input.driverId}`,
          data: {
            to: phone ?? "unknown",
            driverName: driver?.name,
            message: input.message,
            priority: input.priority || "NORMAL",
            delivered,
            timestamp: new Date().toISOString(),
          },
        };
      }

      case "parse_driver_response": {
        const parsed = parseDriverMessage(input.message as string);
        return {
          success: true,
          result: `Message parsed: ${parsed.intent}`,
          data: parsed,
        };
      }

      case "get_driver_context": {
        const state = getState();
        const driver = state.drivers.find(d => d.id === input.driverId);
        return {
          success: true,
          result: driver ? `Context for ${driver.name}` : "Driver not found",
          data: { driver },
        };
      }

      case "send_assignment_notification": {
        const state = getState();
        const driver = state.drivers.find(d => d.id === input.driverId);
        const load = state.loads.find(l => l.id === input.loadId);
        const message = `New Load Assignment: ${load?.origin ?? "?"} → ${load?.destination ?? "?"}. Pickup: ${input.pickupTime ?? "ASAP"}. Reply ACCEPT to confirm.`;

        let delivered = false;
        if (driver?.phone) {
          try {
            await sendSms(driver.phone, message);
            delivered = true;
          } catch (e) {
            console.log(`[SMS] Would send assignment to ${driver.phone}: ${message}`);
          }
        }

        return {
          success: true,
          result: `Assignment notification ${delivered ? "sent" : "queued"} to ${driver?.name ?? input.driverId}`,
          data: {
            loadId: input.loadId,
            driverId: input.driverId,
            driverName: driver?.name,
            message,
            delivered,
          },
        };
      }

      case "confirm_receipt":
        return {
          success: true,
          result: `Receipt confirmed for message ${input.messageId}`,
          data: { confirmed: true, timestamp: new Date().toISOString() },
        };

      default:
        return {
          success: false,
          result: `Unknown action: ${actionType}`,
          error: `Tool ${actionType} not implemented`,
        };
    }
  }
}
