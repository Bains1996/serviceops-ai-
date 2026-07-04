function normalizePhone(value: string) {
  return value.replace(/[^0-9+]/g, "").trim();
}

export async function sendSms(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const statusCallback = process.env.TWILIO_STATUS_CALLBACK_URL;

  if (!accountSid || !authToken || !fromNumber) {
    return { sent: false, reason: "twilio_not_configured" } as const;
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.set("To", normalizePhone(to));
  params.set("From", normalizePhone(fromNumber));
  params.set("Body", body);
  if (statusCallback) {
    params.set("StatusCallback", statusCallback);
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    return { sent: false, reason: "twilio_send_failed" } as const;
  }

  return { sent: true } as const;
}
