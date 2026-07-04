import { addTimelineEvent } from "@/lib/dispatch-agent/store";
import { markDispatchEventFailed, markDispatchEventProcessed, recordDispatchEvent } from "@/lib/platform/event-store";
import { addCompanyTimelineEvent, findCompanyIdByOutboundPhone, getDefaultCompanyId } from "@/lib/platform/tenant-state-store";
import { verifyTwilioSignature } from "@/lib/messaging/twilio-verify";

export async function POST(request: Request) {
  let eventId: string | undefined;
  try {
    const formData = await request.formData();
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      params.append(key, String(value));
    }

    const signature = request.headers.get("x-twilio-signature");
    const verification = verifyTwilioSignature(request.url, params, signature);

    if (!verification.ok) {
      addTimelineEvent("Security", "Rejected SMS status callback", `Twilio signature failed: ${verification.reason}.`);
      return new Response("forbidden", { status: 403 });
    }

    const to = String(formData.get("To") ?? "").trim();
    const status = String(formData.get("MessageStatus") ?? "unknown").trim();
    const sid = String(formData.get("MessageSid") ?? "unknown").trim();

    const companyId = (await findCompanyIdByOutboundPhone(to)) ?? getDefaultCompanyId();
    const event = await recordDispatchEvent({
      companyId,
      source: "TWILIO_STATUS",
      eventType: status,
      summary: `Twilio delivery update ${status} for ${to || "unknown"}.`,
      payload: { to, status, sid },
    });
    eventId = event.id;

    if (companyId === getDefaultCompanyId()) {
      addTimelineEvent("Twilio", "SMS delivery update", `Message ${sid} to ${to || "unknown"} is ${status}.`);
    } else {
      await addCompanyTimelineEvent(companyId, "Twilio", "SMS delivery update", `Message ${sid} to ${to || "unknown"} is ${status}.`);
    }

    if (eventId) await markDispatchEventProcessed(eventId);

    return new Response("ok", { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process SMS status callback.";
    if (eventId) await markDispatchEventFailed(eventId, message);
    return new Response("error", { status: 500 });
  }
}
