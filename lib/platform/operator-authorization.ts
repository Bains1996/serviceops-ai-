import { NextResponse } from "next/server";

import { CarrierRole, getCarrierSession } from "./operator-auth";

const ROLE_LEVEL: Record<CarrierRole, number> = {
  VIEWER: 1,
  DISPATCHER: 2,
  ADMIN: 3,
};

function hasRequiredRole(current: CarrierRole, required: CarrierRole) {
  return ROLE_LEVEL[current] >= ROLE_LEVEL[required];
}

export async function authorizeOperatorRequest(options: {
  request: Request;
  companyId?: string | null;
  requiredRole?: CarrierRole;
}) {
  const session = await getCarrierSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Authentication required." }, { status: 401 }),
    };
  }

  if (options.requiredRole && !hasRequiredRole(session.role, options.requiredRole)) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Insufficient permissions." }, { status: 403 }),
    };
  }

  const requestedCompanyId = options.companyId?.trim() || session.companyId;
  if (requestedCompanyId !== session.companyId) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Tenant access denied." }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    session,
    companyId: requestedCompanyId,
  };
}