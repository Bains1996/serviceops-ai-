import { NextResponse } from "next/server";

import { applyApproval, applyApprovalOnState } from "@/lib/dispatch-agent/engine";
import { getState } from "@/lib/dispatch-agent/store";
import { sendSms } from "@/lib/messaging/sms";
import { markDispatchEventFailed, markDispatchEventProcessed, recordDispatchEvent } from "@/lib/platform/event-store";
import { enqueueDispatchJob } from "@/lib/platform/job-store";
import { authorizeOperatorRequest } from "@/lib/platform/operator-authorization";
import { ApprovalDecision } from "@/lib/dispatch-agent/types";
import { getCompanyState, getDefaultCompanyId, saveCompanyState } from "@/lib/platform/tenant-state-store";

type ApprovalPayload = {
  approvalId: string;
  decision: ApprovalDecision;
};

function getCompanyId(request: Request) {
  return request.headers.get("x-company-id")?.trim() || null;
}

export async function POST(request: Request) {
  let eventId: string | undefined;
  try {
    const payload = (await request.json()) as ApprovalPayload;
    if (!payload.approvalId || !payload.decision) {
      return NextResponse.json({ ok: false, message: "approvalId and decision are required." }, { status: 400 });
    }

    if (payload.decision !== "APPROVE" && payload.decision !== "REJECT") {
      return NextResponse.json({ ok: false, message: "Invalid decision." }, { status: 400 });
    }

    const requestedCompanyId = getCompanyId(request);
    const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "DISPATCHER" });
    if (!auth.ok) return auth.response;
    const companyId = auth.companyId;
    const event = await recordDispatchEvent({
      companyId,
      source: "OPS_APPROVAL",
      eventType: payload.decision,
      summary: `Operator approval action ${payload.decision} for ${payload.approvalId}.`,
      payload,
    });
    eventId = event.id;
    const baseState = companyId === getDefaultCompanyId() ? getState() : await getCompanyState(companyId);
    const beforeIds = new Set(baseState.outbound.map((item) => item.id));
    let state;

    if (companyId === getDefaultCompanyId()) {
      state = applyApproval(payload.approvalId, payload.decision);
    } else {
      state = applyApprovalOnState(structuredClone(baseState), payload.approvalId, payload.decision);
      await saveCompanyState(companyId, state);
    }

    const outboundToSend = state.outbound.filter((item) => !beforeIds.has(item.id));
    await Promise.all(outboundToSend.map((item) => sendSms(item.to, item.body)));

    await enqueueDispatchJob({
      companyId,
      jobType: "POST_EVENT_AUTOMATION",
      payload: { eventId, source: "OPS_APPROVAL", approvalId: payload.approvalId },
    });

    if (eventId) await markDispatchEventProcessed(eventId);

    return NextResponse.json({ ok: true, companyId, state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process approval.";
    if (eventId) await markDispatchEventFailed(eventId, message);
    return NextResponse.json({ ok: false, message: "Unable to process approval." }, { status: 500 });
  }
}
