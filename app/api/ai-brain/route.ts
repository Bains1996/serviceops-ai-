import { NextResponse } from "next/server";

import { runAgenticBrain, getAgentSystemStatus } from "@/lib/platform/ai-brain";
import { getState } from "@/lib/dispatch-agent/store";
import { getCompanyState, getDefaultCompanyId } from "@/lib/platform/tenant-state-store";
import { authorizeOperatorRequest } from "@/lib/platform/operator-authorization";

function getCompanyId(request: Request) {
  return request.headers.get("x-company-id")?.trim() || null;
}

export async function GET(request: Request) {
  const requestedCompanyId = getCompanyId(request);
  const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "VIEWER" });
  if (!auth.ok) return auth.response;
  const companyId = auth.companyId;

  const status = getAgentSystemStatus();

  return NextResponse.json({
    ok: true,
    companyId,
    system: status,
  });
}

export async function POST(request: Request) {
  const requestedCompanyId = getCompanyId(request);
  const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "DISPATCHER" });
  if (!auth.ok) return auth.response;
  const companyId = auth.companyId;

  const state = companyId === getDefaultCompanyId() ? getState() : await getCompanyState(companyId);

  const result = await runAgenticBrain({
    companyId,
    state,
  });

  return NextResponse.json({
    ok: true,
    companyId,
    result: {
      summary: result.orchestration.summary,
      agents: result.orchestration.agents.map((a) => ({
        type: a.agentType,
        status: a.status,
        actions: a.actions,
        reasoning: a.reasoning,
      })),
      aiGuidance: result.aiGuidance,
      agentInfo: result.agentInfo,
      memorySize: result.memory.length,
    },
  });
}
