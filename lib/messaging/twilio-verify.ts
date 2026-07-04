import { createHmac, timingSafeEqual } from "crypto";

function computeExpectedSignature(url: string, params: URLSearchParams, authToken: string) {
  const sortedKeys = [...new Set(Array.from(params.keys()))].sort();
  let payload = url;

  for (const key of sortedKeys) {
    const values = params.getAll(key);
    for (const value of values) {
      payload += `${key}${value}`;
    }
  }

  return createHmac("sha1", authToken).update(payload).digest("base64");
}

export function verifyTwilioSignature(url: string, params: URLSearchParams, providedSignature: string | null) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return { ok: false, reason: "missing_auth_token" } as const;
  }

  if (!providedSignature) {
    return { ok: false, reason: "missing_signature" } as const;
  }

  const expected = computeExpectedSignature(url, params, authToken);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(providedSignature);

  if (expectedBuffer.length !== providedBuffer.length) {
    return { ok: false, reason: "invalid_signature" } as const;
  }

  const ok = timingSafeEqual(expectedBuffer, providedBuffer);
  return ok ? ({ ok: true } as const) : ({ ok: false, reason: "invalid_signature" } as const);
}
