import { findConnectionByCompany, findConnectionRecordByCompany } from "@/lib/platform/connections-store";

function parseIntegrationKeys(raw: string | undefined) {
  const map = new Map<string, string>();
  if (!raw) return map;

  for (const pair of raw.split(",")) {
    const [companyId, apiKey] = pair.split(":").map((value) => value.trim());
    if (!companyId || !apiKey) continue;
    map.set(companyId, apiKey);
  }

  return map;
}

export async function authenticateIntegration(request: Request) {
  const companyId = request.headers.get("x-company-id")?.trim() ?? "";
  const apiKey = request.headers.get("x-api-key")?.trim() ?? "";

  if (!companyId || !apiKey) {
    return { ok: false, reason: "missing_credentials" } as const;
  }

  const dynamicConnection = findConnectionByCompany(companyId) ?? await findConnectionRecordByCompany(companyId);
  if (dynamicConnection) {
    if (dynamicConnection.apiKey !== apiKey) {
      return { ok: false, reason: "invalid_api_key" } as const;
    }
    return { ok: true, companyId } as const;
  }

  const keyMap = parseIntegrationKeys(process.env.INTEGRATION_KEYS);
  const expected = keyMap.get(companyId);

  if (!expected) {
    return { ok: false, reason: "unknown_company" } as const;
  }

  if (expected !== apiKey) {
    return { ok: false, reason: "invalid_api_key" } as const;
  }

  return { ok: true, companyId } as const;
}
