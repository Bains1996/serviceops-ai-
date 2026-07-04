import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "crypto";

import { cookies } from "next/headers";

import { hasDatabase, withDatabase } from "./db";

const SESSION_COOKIE = "serviceops_session";
const SESSION_DAYS = 14;

export type CarrierRole = "ADMIN" | "DISPATCHER" | "VIEWER";

type CarrierUserRecord = {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: CarrierRole;
};

type CarrierSessionRecord = {
  id: string;
  userId: string;
  companyId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string;
};

type AuthStore = typeof globalThis & {
  __carrierUsers?: CarrierUserRecord[];
  __carrierSessions?: CarrierSessionRecord[];
};

const store = globalThis as AuthStore;

function getCarrierUsers() {
  if (!store.__carrierUsers) {
    store.__carrierUsers = [];
  }
  return store.__carrierUsers;
}

function getCarrierSessions() {
  if (!store.__carrierSessions) {
    store.__carrierSessions = [];
  }
  return store.__carrierSessions;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const current = Buffer.from(hash, "hex");
  return current.length === next.length && timingSafeEqual(current, next);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerCarrierUser(input: {
  companyId: string;
  fullName: string;
  email: string;
  password: string;
  role?: CarrierRole;
}) {
  const email = normalizeEmail(input.email);
  const passwordHash = hashPassword(input.password);

  if (!hasDatabase()) {
    const users = getCarrierUsers();
    const existing = users.find((item) => item.email === email);
    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    const user: CarrierUserRecord = {
      id: randomUUID(),
      companyId: input.companyId,
      fullName: input.fullName.trim(),
      email,
      passwordHash,
      role: input.role ?? "ADMIN",
    };

    users.unshift(user);
    return {
      id: user.id,
      company_id: user.companyId,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  return withDatabase(async (sql) => {
    const existing = await sql<{ id: string }[]>`
      SELECT id FROM carrier_users WHERE email = ${email} LIMIT 1
    `;
    if (existing.length > 0) {
      throw new Error("EMAIL_EXISTS");
    }

    const rows = await sql<{
      id: string;
      company_id: string;
      full_name: string;
      email: string;
      role: CarrierRole;
    }[]>`
      INSERT INTO carrier_users (
        id, company_id, full_name, email, password_hash, role, created_at, updated_at
      ) VALUES (
        ${randomUUID()},
        ${input.companyId},
        ${input.fullName.trim()},
        ${email},
        ${passwordHash},
        ${input.role ?? "ADMIN"},
        NOW(),
        NOW()
      )
      RETURNING id, company_id, full_name, email, role
    `;

    return rows[0];
  });
}

export async function authenticateCarrierUser(email: string, password: string) {
  if (!hasDatabase()) {
    const user = getCarrierUsers().find((item) => item.email === normalizeEmail(email));
    if (!user) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;

    return {
      id: user.id,
      companyId: user.companyId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  return withDatabase(async (sql) => {
    const rows = await sql<{
      id: string;
      company_id: string;
      full_name: string;
      email: string;
      password_hash: string;
      role: CarrierRole;
    }[]>`
      SELECT id, company_id, full_name, email, password_hash, role
      FROM carrier_users
      WHERE email = ${normalizeEmail(email)}
      LIMIT 1
    `;

    const user = rows[0];
    if (!user) return null;
    if (!verifyPassword(password, user.password_hash)) return null;

    return {
      id: user.id,
      companyId: user.company_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };
  });
}

export async function createCarrierSession(user: {
  id: string;
  companyId: string;
}) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  if (!hasDatabase()) {
    getCarrierSessions().unshift({
      id: randomUUID(),
      userId: user.id,
      companyId: user.companyId,
      tokenHash,
      expiresAt,
    });
  } else {
    await withDatabase(async (sql) => {
      await sql`
        INSERT INTO carrier_sessions (
          id, user_id, company_id, token_hash, created_at, expires_at
        ) VALUES (
          ${randomUUID()},
          ${user.id},
          ${user.companyId},
          ${tokenHash},
          NOW(),
          ${expiresAt}
        )
      `;
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearCarrierSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    if (!hasDatabase()) {
      const current = getCarrierSessions().find((item) => item.tokenHash === tokenHash);
      if (current) {
        current.revokedAt = new Date().toISOString();
      }
    } else {
      await withDatabase(async (sql) => {
        await sql`
          UPDATE carrier_sessions
          SET revoked_at = NOW()
          WHERE token_hash = ${tokenHash}
        `;
      });
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCarrierSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = hashToken(token);

  if (!hasDatabase()) {
    const now = new Date();
    const memorySession = getCarrierSessions().find(
      (item) => item.tokenHash === tokenHash && !item.revokedAt && new Date(item.expiresAt) > now,
    );
    if (!memorySession) return null;

    const user = getCarrierUsers().find((item) => item.id === memorySession.userId);
    if (!user) return null;

    return {
      userId: user.id,
      companyId: user.companyId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  return withDatabase(async (sql) => {
    const rows = await sql<{
      user_id: string;
      company_id: string;
      full_name: string;
      email: string;
      role: CarrierRole;
    }[]>`
      SELECT s.user_id, s.company_id, u.full_name, u.email, u.role
      FROM carrier_sessions s
      JOIN carrier_users u ON u.id = s.user_id
      WHERE s.token_hash = ${tokenHash}
        AND s.revoked_at IS NULL
        AND s.expires_at > NOW()
      LIMIT 1
    `;

    const session = rows[0];
    if (!session) return null;

    return {
      userId: session.user_id,
      companyId: session.company_id,
      fullName: session.full_name,
      email: session.email,
      role: session.role,
    };
  });
}
