import { NextResponse } from "next/server";

import { getState, resetState } from "@/lib/dispatch-agent/store";
import { getCompanyState, getDefaultCompanyId, resetCompanyState } from "@/lib/platform/tenant-state-store";
import { authorizeOperatorRequest } from "@/lib/platform/operator-authorization";
import { getAgentSystemStatus } from "@/lib/platform/ai-brain";

function getCompanyId(request: Request) {
  return new URL(request.url).searchParams.get("companyId")?.trim() || null;
}

export async function GET(request: Request) {
  const requestedCompanyId = getCompanyId(request);
  const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "VIEWER" });
  if (!auth.ok) return auth.response;
  const companyId = auth.companyId;
  const state = companyId === getDefaultCompanyId() ? getState() : await getCompanyState(companyId);
  const agentStatus = getAgentSystemStatus();
  return NextResponse.json({ ok: true, companyId, state, agentStatus });
}

export async function POST(request: Request) {
  const requestedCompanyId = getCompanyId(request);
  const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "ADMIN" });
  if (!auth.ok) return auth.response;
  const companyId = auth.companyId;
  const state = companyId === getDefaultCompanyId() ? resetState() : await resetCompanyState(companyId);
  return NextResponse.json({ ok: true, companyId, state });
}
