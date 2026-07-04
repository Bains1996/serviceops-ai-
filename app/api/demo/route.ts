import { NextResponse } from "next/server";

type DemoLeadPayload = {
  fullName: string;
  workEmail: string;
  company: string;
  role: string;
  fleetSize?: string;
  systemsToConnect?: string;
  autonomyGoal?: string;
  primaryPain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  website?: string;
};

const ipWindowMs = 10 * 60 * 1000;
const maxRequestsPerWindow = 10;
const ipRateMap = new Map<string, number[]>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  return realIp ?? "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const entries = ipRateMap.get(ip) ?? [];
  const freshEntries = entries.filter((ts) => now - ts < ipWindowMs);

  if (freshEntries.length >= maxRequestsPerWindow) {
    ipRateMap.set(ip, freshEntries);
    return true;
  }

  freshEntries.push(now);
  ipRateMap.set(ip, freshEntries);
  return false;
}

function isValid(payload: DemoLeadPayload) {
  return (
    payload.fullName.trim().length > 1 &&
    payload.workEmail.includes("@") &&
    payload.company.trim().length > 1 &&
    payload.role.trim().length > 1
  );
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 10_000) {
      return NextResponse.json(
        { ok: false, message: "Payload too large." },
        { status: 413 },
      );
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Please retry in a few minutes." },
        { status: 429 },
      );
    }

    const payload = (await request.json()) as DemoLeadPayload;

    if (payload.website && payload.website.trim().length > 0) {
      // Honeypot filled by bots: return success to avoid signaling protections.
      return NextResponse.json({ ok: true });
    }

    if (!isValid(payload)) {
      return NextResponse.json(
        { ok: false, message: "Missing required lead fields." },
        { status: 400 },
      );
    }

    const webhookUrl = process.env.DEMO_WEBHOOK_URL;

    if (webhookUrl) {
      const webhookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "serviceops-ai-site",
          createdAt: new Date().toISOString(),
          ip,
          lead: payload,
        }),
      });

      if (!webhookRes.ok) {
        return NextResponse.json(
          { ok: false, message: "Lead webhook failed." },
          { status: 502 },
        );
      }
    }

    if (!webhookUrl) {
      console.log("[demo-lead]", {
        createdAt: new Date().toISOString(),
        ip,
        lead: payload,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unable to process lead request." },
      { status: 500 },
    );
  }
}
