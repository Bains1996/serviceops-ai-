import { NextResponse } from "next/server";

const clients = new Map<string, ReadableStreamDefaultController>();

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function sendEventToClient(clientId: string, event: string, data: unknown) {
  const controller = clients.get(clientId);
  if (!controller) return;

  const encoder = new TextEncoder();
  const sseData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(encoder.encode(sseData));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || "default";

  const clientId = generateId();

  const stream = new ReadableStream({
    start(controller) {
      clients.set(clientId, controller);

      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ clientId, companyId })}\n\n`));

      request.signal.addEventListener("abort", () => {
        clients.delete(clientId);
        try {
          controller.close();
        } catch (e) {
          // Already closed
        }
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export function broadcastToCompany(companyId: string, event: string, data: unknown) {
  clients.forEach((controller, clientId) => {
    sendEventToClient(clientId, event, data);
  });
}
