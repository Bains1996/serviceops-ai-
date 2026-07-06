import { NextResponse } from "next/server";

import { createConnectionRecord, findConnectionRecordByCompany, listConnectionRecords } from "@/lib/platform/connections-store";
import { authorizeOperatorRequest } from "@/lib/platform/operator-authorization";

type SetupPayload = {
  companyName: string;
  countryRegion: string;
  tms?: string;
  eld?: string;
  loadBoard?: string;
  billing?: string;
};

function isValid(payload: SetupPayload) {
  return payload.companyName?.trim().length > 1 && payload.countryRegion?.trim().length > 1;
}

export async function GET(request: Request) {
  const auth = await authorizeOperatorRequest({ request, requiredRole: "VIEWER" });
  if (!auth.ok) return auth.response;

  const connection = await findConnectionRecordByCompany(auth.companyId);
  if (connection) {
    return NextResponse.json({ ok: true, connections: [connection] });
  }

  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, connections: await listConnectionRecords() });
  }

  return NextResponse.json({ ok: true, connections: [] });
}

export async function POST(request: Request) {
  try {
    const auth = await authorizeOperatorRequest({ request, requiredRole: "DISPATCHER" });
    if (!auth.ok) return auth.response;

    const payload = (await request.json()) as SetupPayload;

    if (!isValid(payload)) {
      return NextResponse.json({ ok: false, message: "companyName and countryRegion are required." }, { status: 400 });
    }

    const connection = await createConnectionRecord({
      companyName: payload.companyName.trim(),
      countryRegion: payload.countryRegion.trim(),
      systems: {
        tms: payload.tms?.trim(),
        eld: payload.eld?.trim(),
        loadBoard: payload.loadBoard?.trim(),
        billing: payload.billing?.trim(),
      },
    });

    return NextResponse.json({
      ok: true,
      onboarding: {
        companyId: connection.companyId,
        apiKey: connection.apiKey,
        integrationEndpoint: "/api/integrations/tms",
        smsInboundWebhook: "/api/sms/inbound",
        smsStatusWebhook: "/api/sms/status",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to create integration setup." }, { status: 500 });
  }
}
