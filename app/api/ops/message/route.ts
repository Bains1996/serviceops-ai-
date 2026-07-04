import { NextResponse } from "next/server";

import { processDriverMessage, processDriverMessageOnState } from "@/lib/dispatch-agent/engine";
import { getState } from "@/lib/dispatch-agent/store";
import { sendSms } from "@/lib/messaging/sms";
import { runAutonomyCycle, runAutonomyCycleOnState } from "@/lib/platform/autonomy-runner";
import { markDispatchEventFailed, markDispatchEventProcessed, recordDispatchEvent } from "@/lib/platform/event-store";
import { enqueueDispatchJob } from "@/lib/platform/job-store";
import { authorizeOperatorRequest } from "@/lib/platform/operator-authorization";
import { DriverMessageInput } from "@/lib/dispatch-agent/types";
import { getCompanyState, getDefaultCompanyId, saveCompanyState } from "@/lib/platform/tenant-state-store";

function getCompanyId(request: Request) {
  return request.headers.get("x-company-id")?.trim() || null;
}

export async function POST(request: Request) {
  let eventId: string | undefined;
  try {
    const payload = (await request.json()) as DriverMessageInput;
    if (!payload.driverId || !payload.text) {
      return NextResponse.json({ ok: false, message: "driverId and text are required." }, { status: 400 });
    }

    const requestedCompanyId = getCompanyId(request);
    const auth = await authorizeOperatorRequest({ request, companyId: requestedCompanyId, requiredRole: "DISPATCHER" });
    if (!auth.ok) return auth.response;
    const companyId = auth.companyId;
    const event = await recordDispatchEvent({
      companyId,
      source: "OPS_MESSAGE",
      eventType: "DRIVER_MESSAGE",
      summary: `Operator-triggered driver message processing for ${payload.driverId}.`,
      payload,
    });
    eventId = event.id;
    const baseState = companyId === getDefaultCompanyId() ? getState() : await getCompanyState(companyId);
    const beforeIds = new Set(baseState.outbound.map((item) => item.id));

    let state;
    if (companyId === getDefaultCompanyId()) {
      processDriverMessage(payload);
      state = runAutonomyCycle();
    } else {
      state = processDriverMessageOnState(structuredClone(baseState), payload);
      state = runAutonomyCycleOnState(state);
      await saveCompanyState(companyId, state);
    }

    const outboundToSend = state.outbound.filter((item) => !beforeIds.has(item.id));
    await Promise.all(outboundToSend.map((item) => sendSms(item.to, item.body)));

    await enqueueDispatchJob({
      companyId,
      jobType: "POST_EVENT_AUTOMATION",
      payload: { eventId, source: "OPS_MESSAGE", driverId: payload.driverId },
    });

    if (eventId) await markDispatchEventProcessed(eventId);

    return NextResponse.json({ ok: true, companyId, state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process message.";
    if (eventId) await markDispatchEventFailed(eventId, message);
    return NextResponse.json({ ok: false, message: "Unable to process message." }, { status: 500 });
  }
}
