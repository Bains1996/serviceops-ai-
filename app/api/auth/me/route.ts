import { NextResponse } from "next/server";

import { getCarrierSession } from "@/lib/platform/operator-auth";

export async function GET() {
  const session = await getCarrierSession();
  return NextResponse.json({ ok: true, session });
}
