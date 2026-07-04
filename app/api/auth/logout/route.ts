import { NextResponse } from "next/server";

import { clearCarrierSession } from "@/lib/platform/operator-auth";

export async function POST() {
  await clearCarrierSession();
  return NextResponse.json({ ok: true });
}
