import { NextResponse } from "next/server";

type PODUploadPayload = {
  loadId: string;
  driverId: string;
  imageData: string;
  location?: { lat: number; lng: number };
  notes?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PODUploadPayload;

    if (!payload.loadId || !payload.driverId || !payload.imageData) {
      return NextResponse.json(
        { ok: false, message: "loadId, driverId, and imageData are required." },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Upload to S3/R2/Cloudflare
    // 2. Store metadata in database
    // 3. Notify the dispatch system

    const podId = `pod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    console.log(`[POD] Received proof of delivery:`, {
      podId,
      loadId: payload.loadId,
      driverId: payload.driverId,
      location: payload.location,
      notes: payload.notes,
      imageLength: payload.imageData.length,
    });

    return NextResponse.json({
      ok: true,
      podId,
      message: "Proof of delivery captured successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload POD.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
