import { NextResponse } from "next/server";

import { processPendingDispatchJobs } from "@/lib/platform/worker";

function isAuthorized(request: Request) {
  const expected = process.env.WORKER_SECRET?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const provided = request.headers.get("x-worker-secret")?.trim() ?? "";
  const bearer = request.headers.get("authorization")?.trim() ?? "";
  return provided === expected || bearer === `Bearer ${expected}`;
}

async function handleProcessJobs(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized worker request." }, { status: 401 });
  }

  const result = await processPendingDispatchJobs();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  return handleProcessJobs(request);
}

export async function GET(request: Request) {
  return handleProcessJobs(request);
}
