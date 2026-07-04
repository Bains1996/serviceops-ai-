import postgres from "postgres";

let sqlClient: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() ?? "";
}

export function hasDatabase() {
  return getDatabaseUrl().length > 0;
}

function getClient() {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlClient) {
    sqlClient = postgres(getDatabaseUrl(), {
      max: 1,
      ssl: "require",
      prepare: false,
    });
  }

  return sqlClient;
}

export async function ensureDatabaseSchema() {
  if (!hasDatabase()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getClient();

      await sql`
        CREATE TABLE IF NOT EXISTS integration_connections (
          company_id TEXT PRIMARY KEY,
          company_name TEXT NOT NULL,
          country_region TEXT NOT NULL,
          systems JSONB NOT NULL DEFAULT '{}'::jsonb,
          api_key TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_event_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS dispatch_states (
          company_id TEXT PRIMARY KEY,
          state JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS dispatch_events (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          source TEXT NOT NULL,
          event_type TEXT NOT NULL,
          status TEXT NOT NULL,
          summary TEXT NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          error_message TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          processed_at TIMESTAMPTZ
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS dispatch_jobs (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          job_type TEXT NOT NULL,
          status TEXT NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}'::jsonb,
          attempts INTEGER NOT NULL DEFAULT 0,
          available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          locked_at TIMESTAMPTZ,
          last_error TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          processed_at TIMESTAMPTZ
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS carrier_users (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS carrier_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          company_id TEXT NOT NULL,
          token_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL,
          revoked_at TIMESTAMPTZ
        )
      `;
    })();
  }

  await schemaReady;
}

export async function withDatabase<T>(callback: (sql: ReturnType<typeof postgres>) => Promise<T>) {
  await ensureDatabaseSchema();
  const sql = getClient();
  return callback(sql);
}
