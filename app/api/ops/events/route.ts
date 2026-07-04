import { NextResponse } from "next/server";

import { listDispatchEvents } from "@/lib/platform/event-store";
import { authorizeOperatorRequest } from "@/lib/platform/operator-authorization";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedCompanyId = url.searchParams.get("companyId")?.trim() || null;
  const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "VIEWER" });
  if (!auth.ok) return auth.response;
  const companyId = auth.companyId;
  const limit = Number(url.searchParams.get("limit") ?? "25");
  const events = await listDispatchEvents(companyId, Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 25);
  return NextResponse.json({ ok: true, companyId, events });
}
