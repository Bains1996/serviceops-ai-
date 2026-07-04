import { randomUUID } from "crypto";

import { hasDatabase, withDatabase } from "./db";
import { getCompanyState } from "./tenant-state-store";

type IntegrationSystems = {
  tms?: string;
  eld?: string;
  loadBoard?: string;
  billing?: string;
};

export type IntegrationConnection = {
  companyId: string;
  companyName: string;
  countryRegion: string;
  systems: IntegrationSystems;
  apiKey: string;
  createdAt: string;
  lastEventAt?: string;
};

type GlobalConnections = typeof globalThis & {
  __integrationConnections?: IntegrationConnection[];
};

const store = globalThis as GlobalConnections;

function now() {
  return new Date().toISOString();
}

function getConnections() {
  if (!store.__integrationConnections) {
    store.__integrationConnections = [];
  }
  return store.__integrationConnections;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function createConnection(input: {
  companyName: string;
  countryRegion: string;
  systems: IntegrationSystems;
}) {
  const base = slugify(input.companyName) || "carrier";
  const companyId = `${base}-${randomUUID().slice(0, 8)}`;
  const apiKey = randomUUID().replace(/-/g, "");

  const record: IntegrationConnection = {
    companyId,
    companyName: input.companyName,
    countryRegion: input.countryRegion,
    systems: input.systems,
    apiKey,
    createdAt: now(),
  };

  getConnections().unshift(record);
  return record;
}

export async function createConnectionRecord(input: {
  companyName: string;
  countryRegion: string;
  systems: IntegrationSystems;
}) {
  const record = createConnection(input);

  if (!hasDatabase()) {
    return record;
  }

  await getCompanyState(record.companyId);
  return withDatabase(async (sql) => {
    await sql`
      INSERT INTO integration_connections (
        company_id,
        company_name,
        country_region,
        systems,
        api_key,
        created_at,
        updated_at
      )
      VALUES (
        ${record.companyId},
        ${record.companyName},
        ${record.countryRegion},
        ${sql.json(record.systems)},
        ${record.apiKey},
        ${record.createdAt},
        NOW()
      )
      ON CONFLICT (company_id)
      DO UPDATE SET
        company_name = EXCLUDED.company_name,
        country_region = EXCLUDED.country_region,
        systems = EXCLUDED.systems,
        api_key = EXCLUDED.api_key,
        updated_at = NOW()
    `;

    return record;
  });
}

export function listConnections() {
  return getConnections().map((item) => ({
    companyId: item.companyId,
    companyName: item.companyName,
    countryRegion: item.countryRegion,
    systems: item.systems,
    createdAt: item.createdAt,
    lastEventAt: item.lastEventAt,
  }));
}

export async function listConnectionRecords() {
  if (!hasDatabase()) {
    return listConnections();
  }

  return withDatabase(async (sql) => {
    const rows = await sql<{
      company_id: string;
      company_name: string;
      country_region: string;
      systems: IntegrationSystems;
      created_at: string;
      last_event_at: string | null;
    }[]>`
      SELECT company_id, company_name, country_region, systems, created_at, last_event_at
      FROM integration_connections
      ORDER BY created_at DESC
    `;

    return rows.map((item) => ({
      companyId: item.company_id,
      companyName: item.company_name,
      countryRegion: item.country_region,
      systems: item.systems,
      createdAt: item.created_at,
      lastEventAt: item.last_event_at ?? undefined,
    }));
  });
}

export function findConnectionByCompany(companyId: string) {
  return getConnections().find((item) => item.companyId === companyId);
}

export async function findConnectionRecordByCompany(companyId: string) {
  const memory = findConnectionByCompany(companyId);
  if (memory || !hasDatabase()) return memory;

  return withDatabase(async (sql) => {
    const rows = await sql<IntegrationConnection[]>`
      SELECT
        company_id as "companyId",
        company_name as "companyName",
        country_region as "countryRegion",
        systems,
        api_key as "apiKey",
        created_at as "createdAt",
        last_event_at as "lastEventAt"
      FROM integration_connections
      WHERE company_id = ${companyId}
      LIMIT 1
    `;

    return rows[0];
  });
}

export function touchConnection(companyId: string) {
  const record = findConnectionByCompany(companyId);
  if (!record) return;
  record.lastEventAt = now();
}

export async function touchConnectionRecord(companyId: string) {
  touchConnection(companyId);
  if (!hasDatabase()) return;

  await withDatabase(async (sql) => {
    await sql`
      UPDATE integration_connections
      SET last_event_at = NOW(), updated_at = NOW()
      WHERE company_id = ${companyId}
    `;
  });
}
