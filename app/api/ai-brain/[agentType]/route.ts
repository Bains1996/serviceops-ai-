import { NextResponse } from "next/server";

import { runSingleAgent, getAgentSystemStatus } from "@/lib/platform/ai-brain";
import { getState } from "@/lib/dispatch-agent/store";
import { getCompanyState, getDefaultCompanyId } from "@/lib/platform/tenant-state-store";
import { authorizeOperatorRequest } from "@/lib/platform/operator-authorization";
import { AgentType } from "@/lib/dispatch-agent/agents/types";

function getCompanyId(request: Request) {
  return request.headers.get("x-company-id")?.trim() || null;
}

const VALID_AGENT_TYPES: AgentType[] = [
  "DISPATCH_ORCHESTRATOR",
  "EXCEPTION_HANDLER",
  "RATE_NEGOTIATOR",
  "COMPLIANCE_MONITOR",
  "BILLING_READINESS",
  "DRIVER_COORDINATOR",
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentType: string }> }
) {
  const { agentType: agentTypeParam } = await params;
  const requestedCompanyId = getCompanyId(request);
  const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "VIEWER" });
  if (!auth.ok) return auth.response;
  const companyId = auth.companyId;

  const agentType = agentTypeParam.toUpperCase() as AgentType;
  if (!VALID_AGENT_TYPES.includes(agentType)) {
    return NextResponse.json(
      { ok: false, message: `Invalid agent type: ${agentType}. Valid types: ${VALID_AGENT_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const state = companyId === getDefaultCompanyId() ? getState() : await getCompanyState(companyId);

  const result = await runSingleAgent({
    companyId,
    agentType,
    state,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    agent: {
      type: result.agent,
      status: result.status,
      actions: result.actions,
      reasoning: result.reasoning,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentType: string }> }
) {
  const { agentType: agentTypeParam } = await params;
  const requestedCompanyId = getCompanyId(request);
  const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "DISPATCHER" });
  if (!auth.ok) return auth.response;
  const companyId = auth.companyId;

  const agentType = agentTypeParam.toUpperCase() as AgentType;
  if (!VALID_AGENT_TYPES.includes(agentType)) {
    return NextResponse.json(
      { ok: false, message: `Invalid agent type: ${agentType}. Valid types: ${VALID_AGENT_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const state = companyId === getDefaultCompanyId() ? getState() : await getCompanyState(companyId);

  const result = await runSingleAgent({
    companyId,
    agentType,
    state,
    event: body.event,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    agent: {
      type: result.agent,
      status: result.status,
      actions: result.actions,
      reasoning: result.reasoning,
    },
  });
}
