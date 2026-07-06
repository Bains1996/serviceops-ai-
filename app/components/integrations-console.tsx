"use client";

import { useEffect, useMemo, useState } from "react";

type ConnectionSummary = {
  companyId: string;
  companyName: string;
  countryRegion: string;
  systems: {
    tms?: string;
    eld?: string;
    loadBoard?: string;
    billing?: string;
  };
  createdAt: string;
  lastEventAt?: string;
};

type SetupResponse = {
  ok: boolean;
  onboarding?: {
    companyId: string;
    apiKey: string;
    integrationEndpoint: string;
    smsInboundWebhook: string;
    smsStatusWebhook: string;
  };
  message?: string;
};

type ConnectionsResponse = {
  ok: boolean;
  connections: ConnectionSummary[];
};

type IntegrationStateResponse = {
  ok: boolean;
  companyId?: string;
  state?: {
    drivers: unknown[];
    loads: unknown[];
    approvals: unknown[];
    timeline: unknown[];
    outbound: unknown[];
  };
  message?: string;
};

const initialForm = {
  companyName: "",
  countryRegion: "Canada",
  tms: "",
  eld: "",
  loadBoard: "",
  billing: "",
};

export function IntegrationsConsole() {
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [connections, setConnections] = useState<ConnectionSummary[]>([]);
  const [credentials, setCredentials] = useState<SetupResponse["onboarding"]>(undefined);
  const [testResult, setTestResult] = useState<IntegrationStateResponse | null>(null);

  const hasCredentials = Boolean(credentials?.companyId && credentials?.apiKey);

  const sampleHeaders = useMemo(() => {
    if (!credentials) return "";
    return `x-company-id: ${credentials.companyId}\nx-api-key: ${credentials.apiKey}`;
  }, [credentials]);

  const refreshConnections = async () => {
    const response = await fetch("/api/integrations/setup", { cache: "no-store" });
    const data = (await response.json()) as ConnectionsResponse;
    if (data.ok) setConnections(data.connections);
  };

  useEffect(() => {
    void refreshConnections();
  }, []);

  const update = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setupConnection = async () => {
    if (!form.companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    setCreating(true);
    setError(null);
    setStatus(null);
    const response = await fetch("/api/integrations/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json()) as SetupResponse;
    if (!response.ok || !data.ok || !data.onboarding) {
      setError(data.message ?? "Could not create integration setup.");
      setCreating(false);
      return;
    }
    setCredentials(data.onboarding);
    setStatus("Integration credentials generated. You can now push live sync events.");
    setCreating(false);
    await refreshConnections();
  };

  const sendTestSync = async () => {
    if (!credentials) return;
    setTesting(true);
    setError(null);
    setStatus(null);
    const response = await fetch("/api/integrations/tms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-company-id": credentials.companyId,
        "x-api-key": credentials.apiKey,
      },
      body: JSON.stringify({
        eventType: "LOAD_UPSERT",
        payload: {
          id: `ld-live-${Math.floor(Math.random() * 10000)}`,
          customer: "Live Integration Test",
          origin: "Mississauga, ON",
          destination: "Chicago, IL",
          pickupAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          deliveryAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
          equipment: "DRY_VAN",
          rateCad: 2400,
          loadedMiles: 520,
          deadheadMiles: 14,
          status: "OPEN",
        },
      }),
    });
    const data = (await response.json()) as IntegrationStateResponse;
    if (!response.ok || !data.ok) {
      setError(data.message ?? "Could not run test sync.");
      setTesting(false);
      return;
    }
    setTestResult(data);
    setStatus("Live sync event accepted. Control Tower state updated.");
    setTesting(false);
    await refreshConnections();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <article className="section-frame" style={{ padding: "32px" }}>
        <h3 className="heading-lg">Live Integration Setup</h3>
        <p className="body-md" style={{ marginTop: "8px", color: "var(--text-muted)" }}>
          Create a carrier integration profile, generate credentials, and push a real sync event into the control tower.
        </p>

        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <input
            value={form.companyName}
            onChange={(event) => update("companyName", event.target.value)}
            placeholder="Carrier company name"
            className="form-input"
          />
          <select
            value={form.countryRegion}
            onChange={(event) => update("countryRegion", event.target.value)}
            className="form-select"
          >
            <option value="Canada">Canada</option>
            <option value="USA">USA</option>
            <option value="USA + Canada">USA + Canada</option>
          </select>
          <input
            value={form.tms}
            onChange={(event) => update("tms", event.target.value)}
            placeholder="TMS (McLeod, Trimble TMW, Turvo, etc.)"
            className="form-input"
          />
          <input
            value={form.eld}
            onChange={(event) => update("eld", event.target.value)}
            placeholder="ELD/Telematics (Samsara, Motive, Geotab, etc.)"
            className="form-input"
          />
          <input
            value={form.loadBoard}
            onChange={(event) => update("loadBoard", event.target.value)}
            placeholder="Load source (DAT, Truckstop, broker API, EDI)"
            className="form-input"
          />
          <input
            value={form.billing}
            onChange={(event) => update("billing", event.target.value)}
            placeholder="Billing stack (QuickBooks, Sage, ERP, etc.)"
            className="form-input"
          />
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={setupConnection} disabled={creating} className="btn btn-primary">
            {creating ? "Creating..." : "Create Integration Credentials"}
          </button>
          <button onClick={sendTestSync} disabled={!hasCredentials || testing} className="btn btn-outline">
            {testing ? "Syncing..." : "Send Live Test Sync"}
          </button>
        </div>

        {credentials && (
          <div style={{ marginTop: "20px", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <p className="body-md" style={{ fontWeight: "600" }}>Generated credentials (save now)</p>
            <p className="body-md" style={{ marginTop: "8px", color: "var(--text-muted)" }}>Company ID: {credentials.companyId}</p>
            <p className="body-md" style={{ color: "var(--text-muted)", wordBreak: "break-all" }}>API Key: {credentials.apiKey}</p>
            <p className="body-md" style={{ marginTop: "12px", color: "var(--text-muted)" }}>Integration endpoint: {credentials.integrationEndpoint}</p>
            <p className="body-md" style={{ color: "var(--text-muted)" }}>Headers:</p>
            <pre style={{ marginTop: "8px", overflow: "auto", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)" }}>{sampleHeaders}</pre>
          </div>
        )}

        {testResult?.state && (
          <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <div style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>Drivers: {testResult.state.drivers.length}</div>
            <div style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>Loads: {testResult.state.loads.length}</div>
            <div style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>Approvals: {testResult.state.approvals.length}</div>
            <div style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>Outbound: {testResult.state.outbound.length}</div>
          </div>
        )}

        {status && <p className="body-md" style={{ marginTop: "16px", color: "var(--green)" }}>{status}</p>}
        {error && <p className="body-md" style={{ marginTop: "16px", color: "var(--red)" }}>{error}</p>}
      </article>

      <article className="section-frame" style={{ padding: "32px" }}>
        <h3 className="heading-lg">Connected Carriers (Current Runtime)</h3>
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {connections.length === 0 && (
            <div style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <p className="body-md" style={{ color: "var(--text-muted)" }}>No carrier integrations created yet.</p>
            </div>
          )}
          {connections.map((item) => (
            <div key={item.companyId} style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <p className="body-md" style={{ fontWeight: "600" }}>{item.companyName}</p>
              <p className="body-md" style={{ color: "var(--text-muted)" }}>{item.countryRegion} &middot; {item.companyId}</p>
              <p className="body-md" style={{ color: "var(--text-muted)" }}>Last event: {item.lastEventAt ? new Date(item.lastEventAt).toLocaleString() : "Not yet"}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
