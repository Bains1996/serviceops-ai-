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
    <div className="space-y-6">
      <article className="section-frame rounded-3xl p-6 md:p-8">
        <h3 className="text-2xl font-semibold">Live Integration Setup</h3>
        <p className="mt-2 text-sm leading-7 text-subtle">
          Create a carrier integration profile, generate credentials, and push a real sync event into the control tower.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            value={form.companyName}
            onChange={(event) => update("companyName", event.target.value)}
            placeholder="Carrier company name"
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <select
            value={form.countryRegion}
            onChange={(event) => update("countryRegion", event.target.value)}
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none"
          >
            <option value="Canada">Canada</option>
            <option value="USA">USA</option>
            <option value="USA + Canada">USA + Canada</option>
          </select>
          <input
            value={form.tms}
            onChange={(event) => update("tms", event.target.value)}
            placeholder="TMS (McLeod, Trimble TMW, Turvo, etc.)"
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <input
            value={form.eld}
            onChange={(event) => update("eld", event.target.value)}
            placeholder="ELD/Telematics (Samsara, Motive, Geotab, etc.)"
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <input
            value={form.loadBoard}
            onChange={(event) => update("loadBoard", event.target.value)}
            placeholder="Load source (DAT, Truckstop, broker API, EDI)"
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <input
            value={form.billing}
            onChange={(event) => update("billing", event.target.value)}
            placeholder="Billing stack (QuickBooks, Sage, ERP, etc.)"
            className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={setupConnection}
            disabled={creating}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#032d26]"
          >
            {creating ? "Creating..." : "Create Integration Credentials"}
          </button>

          <button
            onClick={sendTestSync}
            disabled={!hasCredentials || testing}
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {testing ? "Syncing..." : "Send Live Test Sync"}
          </button>
        </div>

        {credentials && (
          <div className="mt-5 rounded-2xl border border-[var(--line)] p-4 text-sm">
            <p className="font-semibold">Generated credentials (save now)</p>
            <p className="mt-2 text-subtle">Company ID: {credentials.companyId}</p>
            <p className="text-subtle break-all">API Key: {credentials.apiKey}</p>
            <p className="mt-3 text-subtle">Integration endpoint: {credentials.integrationEndpoint}</p>
            <p className="text-subtle">Headers:</p>
            <pre className="mt-2 overflow-auto rounded-lg border border-[var(--line)] p-3 text-xs text-subtle">{sampleHeaders}</pre>
          </div>
        )}

        {testResult?.state && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-xl border border-[var(--line)] p-3">Drivers: {testResult.state.drivers.length}</div>
            <div className="rounded-xl border border-[var(--line)] p-3">Loads: {testResult.state.loads.length}</div>
            <div className="rounded-xl border border-[var(--line)] p-3">Approvals: {testResult.state.approvals.length}</div>
            <div className="rounded-xl border border-[var(--line)] p-3">Outbound: {testResult.state.outbound.length}</div>
          </div>
        )}

        {status && <p className="mt-4 text-sm text-emerald-300">{status}</p>}
        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
      </article>

      <article className="section-frame rounded-3xl p-6 md:p-8">
        <h3 className="text-xl font-semibold">Connected Carriers (Current Runtime)</h3>
        <div className="mt-4 space-y-2 text-sm">
          {connections.length === 0 && (
            <div className="rounded-xl border border-[var(--line)] p-3 text-subtle">No carrier integrations created yet.</div>
          )}
          {connections.map((item) => (
            <div key={item.companyId} className="rounded-xl border border-[var(--line)] p-3">
              <p className="font-semibold">{item.companyName}</p>
              <p className="text-subtle">{item.countryRegion} · {item.companyId}</p>
              <p className="text-subtle">Last event: {item.lastEventAt ? new Date(item.lastEventAt).toLocaleString() : "Not yet"}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
