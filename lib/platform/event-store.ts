import { randomUUID } from "crypto";

import { hasDatabase, withDatabase } from "./db";

export type DispatchEventStatus = "RECEIVED" | "PROCESSED" | "FAILED";
export type DispatchEventSource = "TMS" | "TWILIO_INBOUND" | "TWILIO_STATUS" | "OPS_MESSAGE" | "OPS_APPROVAL";

export type DispatchEventRecord = {
  id: string;
  companyId: string;
  source: DispatchEventSource;
  eventType: string;
  status: DispatchEventStatus;
  summary: string;
  payload: unknown;
  errorMessage?: string;
  createdAt: string;
  processedAt?: string;
};

type EventMemoryStore = typeof globalThis & {
  __dispatchEvents?: DispatchEventRecord[];
};

const memoryStore = globalThis as EventMemoryStore;

function getMemoryEvents() {
  if (!memoryStore.__dispatchEvents) {
    memoryStore.__dispatchEvents = [];
  }
  return memoryStore.__dispatchEvents;
}

function normalizePayload(payload: unknown) {
  return JSON.parse(JSON.stringify(payload ?? {})) as Record<string, unknown>;
}

export async function recordDispatchEvent(input: {
  companyId: string;
  source: DispatchEventSource;
  eventType: string;
  summary: string;
  payload: unknown;
}) {
  const event: DispatchEventRecord = {
    id: randomUUID(),
    companyId: input.companyId,
    source: input.source,
    eventType: input.eventType,
    status: "RECEIVED",
    summary: input.summary,
    payload: input.payload,
    createdAt: new Date().toISOString(),
  };

  getMemoryEvents().unshift(event);

  if (!hasDatabase()) {
    return event;
  }

  await withDatabase(async (sql) => {
    await sql`
      INSERT INTO dispatch_events (
        id,
        company_id,
        source,
        event_type,
        status,
        summary,
        payload,
        created_at
      )
      VALUES (
        ${event.id},
        ${event.companyId},
        ${event.source},
        ${event.eventType},
        ${event.status},
        ${event.summary},
        ${sql.json(normalizePayload(event.payload) as never)},
        ${event.createdAt}
      )
    `;
  });

  return event;
}

export async function markDispatchEventProcessed(eventId: string) {
  const processedAt = new Date().toISOString();
  const memory = getMemoryEvents().find((item) => item.id === eventId);
  if (memory) {
    memory.status = "PROCESSED";
    memory.processedAt = processedAt;
  }

  if (!hasDatabase()) return;

  await withDatabase(async (sql) => {
    await sql`
      UPDATE dispatch_events
      SET status = 'PROCESSED', processed_at = ${processedAt}, error_message = NULL
      WHERE id = ${eventId}
    `;
  });
}

export async function markDispatchEventFailed(eventId: string, errorMessage: string) {
  const processedAt = new Date().toISOString();
  const memory = getMemoryEvents().find((item) => item.id === eventId);
  if (memory) {
    memory.status = "FAILED";
    memory.processedAt = processedAt;
    memory.errorMessage = errorMessage;
  }

  if (!hasDatabase()) return;

  await withDatabase(async (sql) => {
    await sql`
      UPDATE dispatch_events
      SET status = 'FAILED', processed_at = ${processedAt}, error_message = ${errorMessage}
      WHERE id = ${eventId}
    `;
  });
}

export async function listDispatchEvents(companyId: string, limit = 25) {
  const memory = getMemoryEvents()
    .filter((item) => item.companyId === companyId)
    .slice(0, limit);

  if (!hasDatabase()) {
    return memory;
  }

  return withDatabase(async (sql) => {
    const rows = await sql<{
      id: string;
      company_id: string;
      source: DispatchEventSource;
      event_type: string;
      status: DispatchEventStatus;
      summary: string;
      payload: unknown;
      error_message: string | null;
      created_at: string;
      processed_at: string | null;
    }[]>`
      SELECT id, company_id, source, event_type, status, summary, payload, error_message, created_at, processed_at
      FROM dispatch_events
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      companyId: row.company_id,
      source: row.source,
      eventType: row.event_type,
      status: row.status,
      summary: row.summary,
      payload: row.payload,
      errorMessage: row.error_message ?? undefined,
      createdAt: row.created_at,
      processedAt: row.processed_at ?? undefined,
    }));
  });
}
