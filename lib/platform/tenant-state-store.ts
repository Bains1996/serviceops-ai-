import { randomUUID } from "crypto";

import { DispatchState } from "@/lib/dispatch-agent/types";
import { createSeedState, getState as getDemoState } from "@/lib/dispatch-agent/store";

import { hasDatabase, withDatabase } from "./db";

const DEFAULT_COMPANY_ID = "demo-company";

function normalizePhone(value: string) {
  return value.replace(/[^0-9+]/g, "").trim();
}

function cloneState(state: DispatchState): DispatchState {
  return JSON.parse(JSON.stringify(state)) as DispatchState;
}

function seedCompanyState() {
  return cloneState(createSeedState());
}

export function getDefaultCompanyId() {
  return DEFAULT_COMPANY_ID;
}

export async function getCompanyState(companyId = DEFAULT_COMPANY_ID) {
  if (!hasDatabase()) {
    return companyId === DEFAULT_COMPANY_ID ? getDemoState() : seedCompanyState();
  }

  return withDatabase(async (sql) => {
    const rows = await sql<{ state: DispatchState }[]>`
      SELECT state
      FROM dispatch_states
      WHERE company_id = ${companyId}
      LIMIT 1
    `;

    if (rows.length > 0) {
      return rows[0].state;
    }

    const state = seedCompanyState();
    await sql`
      INSERT INTO dispatch_states (company_id, state)
      VALUES (${companyId}, ${sql.json(state)})
      ON CONFLICT (company_id) DO NOTHING
    `;
    return state;
  });
}

export async function saveCompanyState(companyId: string, state: DispatchState) {
  if (!hasDatabase()) {
    return state;
  }

  return withDatabase(async (sql) => {
    await sql`
      INSERT INTO dispatch_states (company_id, state, updated_at)
      VALUES (${companyId}, ${sql.json(state)}, NOW())
      ON CONFLICT (company_id)
      DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()
    `;
    return state;
  });
}

export async function updateCompanyState(
  companyId: string,
  mutator: (state: DispatchState) => void | DispatchState,
) {
  const state = cloneState(await getCompanyState(companyId));
  const maybeReplacement = mutator(state);
  const next = (maybeReplacement ?? state) as DispatchState;
  next.updatedAt = new Date().toISOString();
  return saveCompanyState(companyId, next);
}

export async function resetCompanyState(companyId = DEFAULT_COMPANY_ID) {
  const seeded = seedCompanyState();
  return saveCompanyState(companyId, seeded);
}

export async function addCompanyTimelineEvent(companyId: string, actor: string, title: string, detail: string) {
  return updateCompanyState(companyId, (state) => {
    state.timeline.unshift({
      id: randomUUID(),
      at: new Date().toISOString(),
      actor,
      title,
      detail,
    });
    state.updatedAt = new Date().toISOString();
  });
}

export async function findCompanyIdByDriverPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const demoDriver = getDemoState().drivers.find((driver) => normalizePhone(driver.phone) === normalized);
  if (demoDriver) return DEFAULT_COMPANY_ID;

  if (!hasDatabase()) return null;

  return withDatabase(async (sql) => {
    const rows = await sql<{ company_id: string }[]>`
      SELECT company_id
      FROM dispatch_states
      WHERE EXISTS (
        SELECT 1
        FROM jsonb_array_elements(state->'drivers') AS driver
        WHERE regexp_replace(COALESCE(driver->>'phone', ''), '[^0-9+]', '', 'g') = ${normalized}
      )
      LIMIT 1
    `;

    return rows[0]?.company_id ?? null;
  });
}

export async function findCompanyIdByOutboundPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  const demoOutbound = getDemoState().outbound.find((message) => normalizePhone(message.to) === normalized);
  if (demoOutbound) return DEFAULT_COMPANY_ID;

  if (!hasDatabase()) return null;

  return withDatabase(async (sql) => {
    const rows = await sql<{ company_id: string }[]>`
      SELECT company_id
      FROM dispatch_states
      WHERE EXISTS (
        SELECT 1
        FROM jsonb_array_elements(state->'outbound') AS outbound
        WHERE regexp_replace(COALESCE(outbound->>'to', ''), '[^0-9+]', '', 'g') = ${normalized}
      )
      LIMIT 1
    `;

    return rows[0]?.company_id ?? null;
  });
}
