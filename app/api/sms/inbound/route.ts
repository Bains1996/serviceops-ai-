import { processDriverMessageByPhone, processDriverMessageByPhoneOnState } from "@/lib/dispatch-agent/engine";
import { addTimelineEvent, getState } from "@/lib/dispatch-agent/store";
import { sendSms } from "@/lib/messaging/sms";
import { runAutonomyCycle, runAutonomyCycleOnState } from "@/lib/platform/autonomy-runner";
import { markDispatchEventFailed, markDispatchEventProcessed, recordDispatchEvent } from "@/lib/platform/event-store";
import { enqueueDispatchJob } from "@/lib/platform/job-store";
import { addCompanyTimelineEvent, findCompanyIdByDriverPhone, getCompanyState, getDefaultCompanyId, saveCompanyState } from "@/lib/platform/tenant-state-store";
import { verifyTwilioSignature } from "@/lib/messaging/twilio-verify";

export async function POST(request: Request) {
  let eventId: string | undefined;
  try {
    const formData = await request.formData();
    const from = String(formData.get("From") ?? "").trim();
    const body = String(formData.get("Body") ?? "").trim();
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      params.append(key, String(value));
    }

    const signature = request.headers.get("x-twilio-signature");
    const verification = verifyTwilioSignature(request.url, params, signature);

    if (!verification.ok) {
      addTimelineEvent("Security", "Rejected inbound SMS", `Twilio signature failed: ${verification.reason}.`);
      return new Response("forbidden", { status: 403 });
    }

    if (!from || !body) {
      return new Response("missing from/body", { status: 400 });
    }

    const companyId = (await findCompanyIdByDriverPhone(from)) ?? getDefaultCompanyId();
    const event = await recordDispatchEvent({
      companyId,
      source: "TWILIO_INBOUND",
      eventType: "DRIVER_SMS",
      summary: `Inbound driver SMS received from ${from}.`,
      payload: { from, body },
    });
    eventId = event.id;

    let beforeIds: Set<string>;
    let state;

    if (companyId === getDefaultCompanyId()) {
      beforeIds = new Set(getState().outbound.map((item) => item.id));
      processDriverMessageByPhone(from, body);
      state = runAutonomyCycle();
    } else {
      const baseState = await getCompanyState(companyId);
      beforeIds = new Set(baseState.outbound.map((item) => item.id));
      state = processDriverMessageByPhoneOnState(structuredClone(baseState), from, body);
      state = runAutonomyCycleOnState(state);
      await saveCompanyState(companyId, state);
    }

    const outboundToSend = state.outbound.filter((item) => !beforeIds.has(item.id));
    await Promise.all(outboundToSend.map((item) => sendSms(item.to, item.body)));

    await enqueueDispatchJob({
      companyId,
      jobType: "POST_EVENT_AUTOMATION",
      payload: { eventId, source: "TWILIO_INBOUND", from },
    });

    if (companyId !== getDefaultCompanyId()) {
      await addCompanyTimelineEvent(companyId, "Twilio", "Inbound SMS processed", `Processed inbound message from ${from}.`);
    }

    if (eventId) await markDispatchEventProcessed(eventId);

    return new Response("ok", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process inbound SMS.";
    if (eventId) await markDispatchEventFailed(eventId, message);
    return new Response("error", { status: 500 });
  }
}
