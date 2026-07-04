import { NextResponse } from "next/server";

import { createCarrierSession, registerCarrierUser } from "@/lib/platform/operator-auth";

type RegisterPayload = {
  companyId: string;
  fullName: string;
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    if (!payload.companyId || !payload.fullName || !payload.email || !payload.password) {
      return NextResponse.json({ ok: false, message: "companyId, fullName, email, and password are required." }, { status: 400 });
    }

    if (payload.password.trim().length < 8) {
      return NextResponse.json({ ok: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await registerCarrierUser(payload);
    await createCarrierSession({ id: user.id, companyId: user.company_id });
    return NextResponse.json({ ok: true, user: { companyId: user.company_id, fullName: user.full_name, email: user.email, role: user.role } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register user.";
    if (message === "EMAIL_EXISTS") {
      return NextResponse.json({ ok: false, message: "This email is already registered." }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: "Unable to register user." }, { status: 500 });
  }
}
