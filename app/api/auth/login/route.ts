import { NextResponse } from "next/server";

import { authenticateCarrierUser, createCarrierSession } from "@/lib/platform/operator-auth";

type LoginPayload = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    if (!payload.email || !payload.password) {
      return NextResponse.json({ ok: false, message: "email and password are required." }, { status: 400 });
    }

    const user = await authenticateCarrierUser(payload.email, payload.password);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Invalid login credentials." }, { status: 401 });
    }

    await createCarrierSession({ id: user.id, companyId: user.companyId });
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to sign in." }, { status: 500 });
  }
}
