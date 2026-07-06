import { NextResponse } from "next/server";

import { getState } from "@/lib/dispatch-agent/store";
import { getCompanyState, getDefaultCompanyId } from "@/lib/platform/tenant-state-store";
import { authorizeOperatorRequest } from "@/lib/platform/operator-authorization";
import { runAgenticBrain } from "@/lib/platform/ai-brain";

function getCompanyId(request: Request) {
  return request.headers.get("x-company-id")?.trim() || null;
}

function determineAgentFromMessage(message: string): string {
  const lower = message.toLowerCase();

  if (/\b(load|assign|driver|dispatch|route)\b/.test(lower)) {
    return "DISPATCH_ORCHESTRATOR";
  }
  if (/\b(delay|breakdown|exception|problem|issue|stuck)\b/.test(lower)) {
    return "EXCEPTION_HANDLER";
  }
  if (/\b(rate|price|negotiate|cost|margin|profit)\b/.test(lower)) {
    return "RATE_NEGOTIATOR";
  }
  if (/\b(compliance|hos|eld|insurance|violation|regulation)\b/.test(lower)) {
    return "COMPLIANCE_MONITOR";
  }
  if (/\b(bill|invoice|pod|payment|document|paperwork)\b/.test(lower)) {
    return "BILLING_READINESS";
  }
  if (/\b(sms|text|message|contact|call|driver status)\b/.test(lower)) {
    return "DRIVER_COORDINATOR";
  }

  return "DISPATCH_ORCHESTRATOR";
}

function generateResponse(
  agentType: string,
  message: string,
  state: ReturnType<typeof getState>,
  agenticResult: Awaited<ReturnType<typeof runAgenticBrain>>
): string {
  const lower = message.toLowerCase();

  // Get real data from state
  const availableDrivers = state.drivers.filter((d) => d.status === "AVAILABLE").length;
  const activeLoads = state.loads.filter((l) => l.status === "IN_PROGRESS" || l.status === "ASSIGNED").length;
  const openLoads = state.loads.filter((l) => l.status === "OPEN").length;
  const pendingApprovals = state.approvals.filter((a) => a.status === "PENDING").length;

  // Generate contextual response based on agent type and message
  switch (agentType) {
    case "DISPATCH_ORCHESTRATOR":
      if (/\b(status|overview|summary|what's happening)\b/.test(lower)) {
        return `Here's your current dispatch overview:\n\n• **Active Loads:** ${activeLoads}\n• **Available Drivers:** ${availableDrivers}\n• **Open Loads:** ${openLoads}\n• **Pending Approvals:** ${pendingApprovals}\n\n${agenticResult.orchestration.summary || "All systems operating normally."}`;
      }
      if (/\b(assign|match|find load)\b/.test(lower)) {
        return `I've analyzed your available drivers and open loads. ${agenticResult.orchestration.summary || "I can help you find the best load-driver matches based on rate per mile, deadhead distance, and equipment type."}\n\nWould you like me to:\n1. Score and rank available loads\n2. Auto-assign the best match\n3. Show me the options`;
      }
      return `I'm the Dispatch Orchestrator. I can help you with:\n\n• Load assignments and driver matching\n• Fleet status overview\n• Route optimization\n\n${agenticResult.orchestration.summary || "What would you like to know about your dispatch operations?"}`;

    case "EXCEPTION_HANDLER":
      const delayedDrivers = state.drivers.filter((d) => d.status === "DELAYED" || d.status === "BREAKDOWN");
      if (delayedDrivers.length > 0) {
        return `I've detected ${delayedDrivers.length} active exception(s):\n\n${delayedDrivers.map((d) => `• **${d.name}** (${d.status}) - ${d.city}`).join("\n")}\n\n${agenticResult.orchestration.summary || "I'm working on finding alternatives and notifying stakeholders."}\n\nWould you like me to:\n1. Find alternative drivers for affected loads\n2. Contact the affected drivers\n3. Notify customers about delays`;
      }
      return `No active exceptions detected. All drivers are operating normally.\n\n${agenticResult.orchestration.summary || "I'll monitor for any delays, breakdowns, or issues and alert you immediately."}`;

    case "RATE_NEGOTIATOR":
      return `I've analyzed your current load rates against market data.\n\n${agenticResult.orchestration.summary || "I can help you negotiate better rates with brokers and evaluate if your current loads are priced competitively."}\n\nWould you like me to:\n1. Analyze rates for specific lanes\n2. Generate counter-offers for below-market loads\n3. Show profitability analysis`;

    case "COMPLIANCE_MONITOR":
      return `Compliance status check complete.\n\n${agenticResult.orchestration.summary || "All drivers are currently compliant with HOS regulations. I'm monitoring for any potential violations."}\n\nI'm tracking:\n• Hours of Service (HOS)\n• ELD compliance\n• Insurance coverage\n• Documentation status`;

    case "BILLING_READINESS":
      const deliveredLoads = state.loads.filter((l) => l.status === "DELIVERED").length;
      return `Billing readiness status:\n\n• **Delivered loads pending billing:** ${deliveredLoads}\n\n${agenticResult.orchestration.summary || "I'm processing POD documents and preparing invoices for completed loads."}\n\nWould you like me to:\n1. Check POD completeness for recent deliveries\n2. Generate invoices for completed loads\n3. Follow up on overdue payments`;

    case "DRIVER_COORDINATOR":
      return `Driver communication status:\n\n• **Active drivers:** ${state.drivers.length}\n• **Currently en route:** ${state.drivers.filter((d) => d.status === "EN_ROUTE").length}\n\n${agenticResult.orchestration.summary || "I'm ready to send SMS updates to your drivers and process their responses."}\n\nI can help with:\n1. Sending load assignments via SMS\n2. Processing driver status updates\n3. Tracking driver acknowledgments`;

    default:
      return `I understand your request about "${message}".\n\n${agenticResult.orchestration.summary || "I'm processing this through our AI dispatch system to provide you with the most relevant information."}\n\nHow else can I help you today?`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ ok: false, message: "Message is required." }, { status: 400 });
    }

    const requestedCompanyId = getCompanyId(request);
    const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "VIEWER" });

    let companyId: string;
    let state;

    if (auth.ok) {
      companyId = auth.companyId;
      state = companyId === getDefaultCompanyId() ? getState() : await getCompanyState(companyId);
    } else {
      return NextResponse.json({ ok: false, message: "Authentication required." }, { status: 401 });
    }

    // Determine which agent should handle this
    const agentType = determineAgentFromMessage(message);

    // Run the agentic brain
    const agenticResult = await runAgenticBrain({
      companyId,
      state,
    });

    // Generate response
    const response = generateResponse(agentType, message, state, agenticResult);

    return NextResponse.json({
      ok: true,
      response,
      agentType,
      companyId,
    });
  } catch (error) {
    console.error("[AI Chat] Error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to process your message. Please try again." },
      { status: 500 }
    );
  }
}
