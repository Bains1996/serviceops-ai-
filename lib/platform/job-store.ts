import { randomUUID } from "crypto";

import { hasDatabase, withDatabase } from "./db";

export type DispatchJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "DEAD_LETTER";
export type DispatchJobType = "POST_EVENT_AUTOMATION" | "SYNC_CONNECTION_ACTIVITY";

export type DispatchJobRecord = {
  id: string;
  companyId: string;
  jobType: DispatchJobType;
  status: DispatchJobStatus;
  payload: unknown;
  attempts: number;
  availableAt: string;
  lockedAt?: string;
  lastError?: string;
  createdAt: string;
  processedAt?: string;
};

type JobMemoryStore = typeof globalThis & {
  __dispatchJobs?: DispatchJobRecord[];
};

const memoryStore = globalThis as JobMemoryStore;

function getMemoryJobs() {
  if (!memoryStore.__dispatchJobs) {
    memoryStore.__dispatchJobs = [];
  }
  return memoryStore.__dispatchJobs;
}

function normalizePayload(payload: unknown) {
  return JSON.parse(JSON.stringify(payload ?? {})) as Record<string, unknown>;
}

export async function enqueueDispatchJob(input: {
  companyId: string;
  jobType: DispatchJobType;
  payload: unknown;
  availableAt?: string;
}) {
  const job: DispatchJobRecord = {
    id: randomUUID(),
    companyId: input.companyId,
    jobType: input.jobType,
    status: "PENDING",
    payload: input.payload,
    attempts: 0,
    availableAt: input.availableAt ?? new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  getMemoryJobs().unshift(job);

  if (!hasDatabase()) return job;

  await withDatabase(async (sql) => {
    await sql`
      INSERT INTO dispatch_jobs (
        id, company_id, job_type, status, payload, attempts, available_at, created_at
      ) VALUES (
        ${job.id},
        ${job.companyId},
        ${job.jobType},
        ${job.status},
        ${sql.json(normalizePayload(job.payload) as never)},
        ${job.attempts},
        ${job.availableAt},
        ${job.createdAt}
      )
    `;
  });

  return job;
}

export async function claimPendingJobs(limit = 20) {
  if (!hasDatabase()) {
    const now = new Date().toISOString();
    return getMemoryJobs()
      .filter((job) => job.status === "PENDING" && job.availableAt <= now)
      .slice(0, limit)
      .map((job) => {
        job.status = "PROCESSING";
        job.lockedAt = now;
        job.attempts += 1;
        return job;
      });
  }

  return withDatabase(async (sql) => {
    const rows = await sql<{
      id: string;
      company_id: string;
      job_type: DispatchJobType;
      status: DispatchJobStatus;
      payload: unknown;
      attempts: number;
      available_at: string;
      locked_at: string | null;
      last_error: string | null;
      created_at: string;
      processed_at: string | null;
    }[]>`
      UPDATE dispatch_jobs
      SET status = 'PROCESSING',
          locked_at = NOW(),
          attempts = attempts + 1
      WHERE id IN (
        SELECT id
        FROM dispatch_jobs
        WHERE status = 'PENDING'
          AND available_at <= NOW()
        ORDER BY created_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, company_id, job_type, status, payload, attempts, available_at, locked_at, last_error, created_at, processed_at
    `;

    return rows.map((row) => ({
      id: row.id,
      companyId: row.company_id,
      jobType: row.job_type,
      status: row.status,
      payload: row.payload,
      attempts: row.attempts,
      availableAt: row.available_at,
      lockedAt: row.locked_at ?? undefined,
      lastError: row.last_error ?? undefined,
      createdAt: row.created_at,
      processedAt: row.processed_at ?? undefined,
    }));
  });
}

export async function completeDispatchJob(jobId: string) {
  const processedAt = new Date().toISOString();
  const memory = getMemoryJobs().find((job) => job.id === jobId);
  if (memory) {
    memory.status = "COMPLETED";
    memory.processedAt = processedAt;
  }

  if (!hasDatabase()) return;

  await withDatabase(async (sql) => {
    await sql`
      UPDATE dispatch_jobs
      SET status = 'COMPLETED', processed_at = ${processedAt}, last_error = NULL
      WHERE id = ${jobId}
    `;
  });
}

export async function failDispatchJob(jobId: string, errorMessage: string) {
  const processedAt = new Date().toISOString();
  const memory = getMemoryJobs().find((job) => job.id === jobId);
  if (memory) {
    memory.status = "FAILED";
    memory.processedAt = processedAt;
    memory.lastError = errorMessage;
  }

  if (!hasDatabase()) return;

  await withDatabase(async (sql) => {
    await sql`
      UPDATE dispatch_jobs
      SET status = 'FAILED', processed_at = ${processedAt}, last_error = ${errorMessage}
      WHERE id = ${jobId}
    `;
  });
}

export async function requeueDispatchJob(jobId: string, errorMessage: string, delaySeconds = 60) {
  const availableAt = new Date(Date.now() + Math.max(1, delaySeconds) * 1000).toISOString();
  const memory = getMemoryJobs().find((job) => job.id === jobId);
  if (memory) {
    memory.status = "PENDING";
    memory.availableAt = availableAt;
    memory.lockedAt = undefined;
    memory.lastError = errorMessage;
    memory.processedAt = undefined;
  }

  if (!hasDatabase()) return;

  await withDatabase(async (sql) => {
    await sql`
      UPDATE dispatch_jobs
      SET status = 'PENDING',
          available_at = ${availableAt},
          locked_at = NULL,
          processed_at = NULL,
          last_error = ${errorMessage}
      WHERE id = ${jobId}
    `;
  });
}

export async function deadLetterDispatchJob(jobId: string, errorMessage: string) {
  const processedAt = new Date().toISOString();
  const memory = getMemoryJobs().find((job) => job.id === jobId);
  if (memory) {
    memory.status = "DEAD_LETTER";
    memory.processedAt = processedAt;
    memory.lastError = errorMessage;
    memory.lockedAt = undefined;
  }

  if (!hasDatabase()) return;

  await withDatabase(async (sql) => {
    await sql`
      UPDATE dispatch_jobs
      SET status = 'DEAD_LETTER', processed_at = ${processedAt}, locked_at = NULL, last_error = ${errorMessage}
      WHERE id = ${jobId}
    `;
  });
}

export async function listDispatchJobs(companyId: string, limit = 25) {
  const memory = getMemoryJobs().filter((job) => job.companyId === companyId).slice(0, limit);
  if (!hasDatabase()) return memory;

  return withDatabase(async (sql) => {
    const rows = await sql<{
      id: string;
      company_id: string;
      job_type: DispatchJobType;
      status: DispatchJobStatus;
      payload: unknown;
      attempts: number;
      available_at: string;
      locked_at: string | null;
      last_error: string | null;
      created_at: string;
      processed_at: string | null;
    }[]>`
      SELECT id, company_id, job_type, status, payload, attempts, available_at, locked_at, last_error, created_at, processed_at
      FROM dispatch_jobs
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      companyId: row.company_id,
      jobType: row.job_type,
      status: row.status,
      payload: row.payload,
      attempts: row.attempts,
      availableAt: row.available_at,
      lockedAt: row.locked_at ?? undefined,
      lastError: row.last_error ?? undefined,
      createdAt: row.created_at,
      processedAt: row.processed_at ?? undefined,
    }));
  });
}
