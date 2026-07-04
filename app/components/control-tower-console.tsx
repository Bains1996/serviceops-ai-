"use client";

import { useEffect, useMemo, useState } from "react";

type DriverStatus = "OFF_DUTY" | "AVAILABLE" | "EN_ROUTE" | "AT_PICKUP" | "AT_DROPOFF" | "DELAYED" | "BREAKDOWN";
type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

type Driver = {
  id: string;
  name: string;
  phone: string;
  equipment: string;
  status: DriverStatus;
  city: string;
  lat?: number;
  lng?: number;
  currentLoadId?: string;
  lastUpdateAt: string;
};

type Load = {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  pickupAt: string;
  deliveryAt: string;
  equipment: string;
  rateCad: number;
  loadedMiles: number;
  deadheadMiles: number;
  status: string;
  assignedDriverId?: string;
};

type ApprovalItem = {
  id: string;
  at: string;
  status: ApprovalStatus;
  workflow: "NEXT_LOAD_ASSIGNMENT";
  reason: string;
  driverId: string;
  loadId: string;
  score: number;
  deadheadMiles: number;
  ratePerMile: number;
  recommendedMessage: string;
};

type TimelineEvent = {
  id: string;
  at: string;
  actor: string;
  title: string;
  detail: string;
};

type OutboundMessage = {
  id: string;
  at: string;
  to: string;
  body: string;
};

type DispatchEvent = {
  id: string;
  source: "TMS" | "TWILIO_INBOUND" | "TWILIO_STATUS" | "OPS_MESSAGE" | "OPS_APPROVAL";
  eventType: string;
  status: "RECEIVED" | "PROCESSED" | "FAILED";
  summary: string;
  errorMessage?: string;
  createdAt: string;
  processedAt?: string;
};

type DispatchJob = {
  id: string;
  jobType: "POST_EVENT_AUTOMATION" | "SYNC_CONNECTION_ACTIVITY";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  attempts: number;
  lastError?: string;
  createdAt: string;
};

type ConnectionSummary = {
  companyId: string;
  companyName: string;
  countryRegion: string;
  createdAt: string;
  lastEventAt?: string;
};

type CarrierSession = {
  companyId: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "DISPATCHER" | "VIEWER";
};

type OpsState = {
  updatedAt: string;
  drivers: Driver[];
  loads: Load[];
  approvals: ApprovalItem[];
  timeline: TimelineEvent[];
  outbound: OutboundMessage[];
};

const quickMessages = ["arrived", "loaded", "unloaded", "delay 45 min", "breakdown near Hope BC", "free"];

export function ControlTowerConsole() {
  const [state, setState] = useState<OpsState | null>(null);
  const [events, setEvents] = useState<DispatchEvent[]>([]);
  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [connection, setConnection] = useState<ConnectionSummary | null>(null);
  const [session, setSession] = useState<CarrierSession | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [messageText, setMessageText] = useState("unloaded");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseJson = async <T,>(res: Response): Promise<T> => {
    try {
      return (await res.json()) as T;
    } catch {
      throw new Error(`Request failed with status ${res.status}.`);
    }
  };

  const fetchConnection = async () => {
    const res = await fetch("/api/integrations/setup", { cache: "no-store" });
    const data = (await res.json()) as { ok: boolean; connections: ConnectionSummary[]; message?: string };
    if (data.ok) {
      setConnection(data.connections[0] ?? null);
      return;
    }

    setError(data.message ?? "Unable to load carrier connection.");
  };

  const fetchState = async (nextCompanyId = companyId) => {
    if (!nextCompanyId) return;
    const res = await fetch(`/api/ops/state?companyId=${encodeURIComponent(nextCompanyId)}`, { cache: "no-store" });
    const data = await parseJson<{ ok: boolean; state: OpsState; message?: string }>(res);
    if (data.ok) {
      setState(data.state);
      if (!selectedDriver && data.state.drivers[0]) setSelectedDriver(data.state.drivers[0].id);
      return;
    }

    setError(data.message ?? "Could not load control tower state.");
  };

  const fetchEvents = async (nextCompanyId = companyId) => {
    if (!nextCompanyId) return;
    const res = await fetch(`/api/ops/events?companyId=${encodeURIComponent(nextCompanyId)}&limit=12`, { cache: "no-store" });
    const data = await parseJson<{ ok: boolean; events: DispatchEvent[] }>(res);
    if (data.ok) {
      setEvents(data.events);
    }
  };

  const fetchJobs = async (nextCompanyId = companyId) => {
    if (!nextCompanyId) return;
    const res = await fetch(`/api/ops/jobs?companyId=${encodeURIComponent(nextCompanyId)}&limit=12`, { cache: "no-store" });
    const data = await parseJson<{ ok: boolean; jobs: DispatchJob[] }>(res);
    if (data.ok) {
      setJobs(data.jobs);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        const sessionRes = await fetch("/api/auth/me", { cache: "no-store" });
        const sessionData = await parseJson<{ ok: boolean; session: CarrierSession | null }>(sessionRes);

        if (!sessionData.session) {
          setError("Your session expired. Please sign in again.");
          return;
        }

        const nextCompanyId = sessionData.session.companyId;
        setSession(sessionData.session);
        setCompanyId(nextCompanyId);

        await Promise.all([
          fetchConnection(),
          fetchState(nextCompanyId),
          fetchEvents(nextCompanyId),
          fetchJobs(nextCompanyId),
        ]);
      } catch (initError) {
        const message = initError instanceof Error ? initError.message : "Unable to load control tower.";
        setError(message);
      } finally {
        setInitializing(false);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (!companyId || initializing) return;

    void fetchState(companyId);
    void fetchEvents(companyId);
    void fetchJobs(companyId);
    const timer = setInterval(() => {
      void fetchState(companyId);
      void fetchEvents(companyId);
      void fetchJobs(companyId);
    }, 5000);
    return () => clearInterval(timer);
  }, [companyId]);

  const canDispatch = session?.role === "ADMIN" || session?.role === "DISPATCHER";
  const canReset = session?.role === "ADMIN";

  const selected = useMemo(
    () => state?.drivers.find((driver) => driver.id === selectedDriver) ?? state?.drivers[0],
    [selectedDriver, state],
  );

  const sendMessage = async () => {
    if (!canDispatch || !selected || !messageText.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/ops/message", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-company-id": companyId },
      body: JSON.stringify({ driverId: selected.id, text: messageText }),
    });

    if (!res.ok) {
      setError("Could not process driver message.");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as { state: OpsState };
    setState(data.state);
    await fetchEvents(companyId);
    await fetchJobs(companyId);
    setLoading(false);
  };

  const handleApproval = async (approvalId: string, decision: "APPROVE" | "REJECT") => {
    if (!canDispatch) return;

    const res = await fetch("/api/ops/approval", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-company-id": companyId },
      body: JSON.stringify({ approvalId, decision }),
    });

    if (!res.ok) return;
    const data = (await res.json()) as { state: OpsState };
    setState(data.state);
    await fetchEvents(companyId);
    await fetchJobs(companyId);
  };

  const resetState = async () => {
    if (!canReset) return;

    const res = await fetch(`/api/ops/state?companyId=${encodeURIComponent(companyId)}`, { method: "POST" });
    if (!res.ok) return;
    const data = (await res.json()) as { state: OpsState };
    setState(data.state);
    setSelectedDriver(data.state.drivers[0]?.id ?? "");
    setMessageText("unloaded");
    await fetchEvents(companyId);
    await fetchJobs(companyId);
  };

  if (initializing || !state) {
    if (error) {
      return <p className="text-sm text-rose-300">{error}</p>;
    }

    return <p className="text-sm text-subtle">Loading control tower...</p>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="section-frame group rounded-2xl p-5 transition-all hover:border-[var(--accent)]/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-subtle">Drivers</p>
            <div className="rounded-lg bg-[var(--accent)]/10 p-2">
              <svg className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">{state.drivers.length}</p>
          <p className="mt-1 text-xs text-[var(--accent-emerald)]">Active fleet</p>
        </div>
        
        <div className="section-frame group rounded-2xl p-5 transition-all hover:border-[var(--accent-purple)]/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-subtle">Open Loads</p>
            <div className="rounded-lg bg-[var(--accent-purple)]/10 p-2">
              <svg className="h-4 w-4 text-[var(--accent-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {state.loads.filter((load) => load.status === "OPEN").length}
          </p>
          <p className="mt-1 text-xs text-[var(--accent-purple)]">Ready to assign</p>
        </div>
        
        <div className="section-frame group rounded-2xl p-5 transition-all hover:border-[var(--warning)]/30 hover:shadow-[0_0_20px_rgba(255,184,0,0.1)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-subtle">Approvals</p>
            <div className="rounded-lg bg-[var(--warning)]/10 p-2">
              <svg className="h-4 w-4 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--warning)]">
            {state.approvals.filter((item) => item.status === "PENDING").length}
          </p>
          <p className="mt-1 text-xs text-[var(--warning)]">Awaiting review</p>
        </div>
        
        <div className="section-frame group rounded-2xl p-5 transition-all hover:border-[var(--accent)]/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.12em] text-subtle">Messages</p>
            <div className="rounded-lg bg-[var(--accent)]/10 p-2">
              <svg className="h-4 w-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--accent)]">{state.outbound.length}</p>
          <p className="mt-1 text-xs text-[var(--accent)]">Sent today</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="section-frame overflow-hidden rounded-3xl">
        <div className="relative h-[300px] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--surface)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10">
                <svg className="h-8 w-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Live Driver Map</p>
              <p className="text-xs text-subtle">{state.drivers.length} drivers tracked in real-time</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {state.drivers.map((driver) => (
                  <div key={driver.id} className="chip flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
                    <span className={`h-2 w-2 rounded-full ${driver.status === "AVAILABLE" ? "bg-[var(--accent-emerald)]" : driver.status === "EN_ROUTE" ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]"}`} />
                    {driver.name}
                    {driver.city && <span className="text-subtle">• {driver.city}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="section-frame rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Driver Messaging Agent</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={resetState}
                disabled={!canReset}
                className="chip rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset State
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-subtle">
            Active tenant: {connection?.companyName ?? companyId} ({companyId})
          </p>
          <p className="mt-1 text-xs text-subtle">
            Signed in as {session?.fullName ?? "Operator"} • {session?.role ?? "VIEWER"}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-[0.45fr_0.55fr]">
            <div className="space-y-2">
              {state.drivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left ${
                    selected?.id === driver.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)]"
                  }`}
                >
                  <p className="text-sm font-semibold">{driver.name}</p>
                  <p className="text-xs text-subtle">{driver.status} • {driver.city}</p>
                  {typeof driver.lat === "number" && typeof driver.lng === "number" && (
                    <p className="mt-1 text-[11px] text-subtle">GPS {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}</p>
                  )}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-subtle">Simulate incoming driver text</p>
              <p className="mt-2 text-sm text-subtle">Selected driver: {selected?.name}</p>
              {typeof selected?.lat === "number" && typeof selected?.lng === "number" && (
                <p className="mt-1 text-xs text-subtle">Last known GPS: {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</p>
              )}
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                rows={4}
                className="mt-3 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none"
                placeholder="Type driver message"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {quickMessages.map((msg) => (
                  <button
                    key={msg}
                    onClick={() => setMessageText(msg)}
                    className="chip rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]"
                  >
                    {msg}
                  </button>
                ))}
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !canDispatch}
                className="mt-4 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#032d26] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Processing..." : "Process Message"}
              </button>
              {!canDispatch && <p className="mt-2 text-xs text-subtle">Dispatcher or admin role required for message actions.</p>}
              {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            </div>
          </div>
        </section>

        <section className="section-frame rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--warning)]/10 p-2">
              <svg className="h-5 w-5 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Approval Inbox</h2>
          </div>
          <div className="mt-4 space-y-3">
            {state.approvals.length === 0 && (
              <div className="rounded-xl border border-[var(--line)] p-4 text-center text-sm text-subtle">
                <svg className="mx-auto mb-2 h-8 w-8 text-[var(--accent-emerald)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All caught up! No pending approvals.
              </div>
            )}
            {state.approvals.map((item) => (
              <div key={item.id} className={`rounded-xl border p-4 transition-all ${
                item.status === "PENDING" 
                  ? "border-[var(--warning)]/30 bg-[var(--warning)]/5" 
                  : "border-[var(--line)]"
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{item.loadId} → {item.driverId}</p>
                    <p className="mt-1 text-sm text-subtle">{item.reason}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    item.status === "PENDING" ? "bg-[var(--warning)]/15 text-[var(--warning)]" :
                    item.status === "APPROVED" ? "bg-[var(--accent-emerald)]/15 text-[var(--accent-emerald)]" :
                    "bg-[var(--error)]/15 text-[var(--error)]"
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-subtle">
                  <span>Score: {item.score.toFixed(1)}</span>
                  <span>Deadhead: {item.deadheadMiles} mi</span>
                  <span>Rate: ${item.ratePerMile.toFixed(2)}/mi</span>
                </div>
                {item.status === "PENDING" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleApproval(item.id, "APPROVE")}
                      disabled={!canDispatch}
                      className="flex items-center gap-2 rounded-lg bg-[var(--accent-emerald)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-emerald)]/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(item.id, "REJECT")}
                      disabled={!canDispatch}
                      className="flex items-center gap-2 rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--error)]/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="section-frame rounded-3xl p-6">
        <h2 className="text-xl font-semibold">Event Pipeline</h2>
        <div className="mt-4 max-h-[260px] space-y-2 overflow-auto pr-1">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-[var(--line)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{event.source} • {event.eventType}</p>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${event.status === "PROCESSED" ? "bg-emerald-500/15 text-emerald-300" : event.status === "FAILED" ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-300"}`}>
                  {event.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-subtle">{new Date(event.createdAt).toLocaleString()}</p>
              <p className="mt-2 text-sm">{event.summary}</p>
              {event.errorMessage && <p className="mt-2 text-xs text-rose-300">{event.errorMessage}</p>}
            </div>
          ))}
          {events.length === 0 && (
            <div className="rounded-xl border border-[var(--line)] p-3 text-sm text-subtle">No dispatch events recorded yet.</div>
          )}
        </div>
      </section>

      <section className="section-frame rounded-3xl p-6">
        <h2 className="text-xl font-semibold">Worker Queue</h2>
        <div className="mt-4 max-h-[240px] space-y-2 overflow-auto pr-1">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-xl border border-[var(--line)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{job.jobType}</p>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${job.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-300" : job.status === "FAILED" ? "bg-rose-500/15 text-rose-300" : job.status === "PROCESSING" ? "bg-sky-500/15 text-sky-300" : "bg-amber-500/15 text-amber-300"}`}>
                  {job.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-subtle">Attempts {job.attempts} • {new Date(job.createdAt).toLocaleString()}</p>
              {job.lastError && <p className="mt-2 text-xs text-rose-300">{job.lastError}</p>}
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="rounded-xl border border-[var(--line)] p-3 text-sm text-subtle">No queued background jobs yet.</div>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="section-frame rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Load Board</h2>
          <div className="mt-4 space-y-2">
            {state.loads.map((load) => (
              <div key={load.id} className="rounded-xl border border-[var(--line)] p-3">
                <p className="text-sm font-semibold">{load.id} • {load.customer}</p>
                <p className="mt-1 text-xs text-subtle">{load.origin} {"->"} {load.destination}</p>
                <p className="mt-1 text-xs text-subtle">Rate CAD {load.rateCad} • Deadhead {load.deadheadMiles} mi • {load.status}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-frame rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Live Timeline</h2>
          <div className="mt-4 max-h-[380px] space-y-2 overflow-auto pr-1">
            {state.timeline.map((item) => (
              <div key={item.id} className="rounded-xl border border-[var(--line)] p-3">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-subtle">{item.actor} • {new Date(item.at).toLocaleString()}</p>
                <p className="mt-2 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="section-frame rounded-3xl p-6">
        <h2 className="text-xl font-semibold">Outbound Driver Messages</h2>
        <div className="mt-4 max-h-[240px] space-y-2 overflow-auto pr-1">
          {state.outbound.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-[var(--line)] p-3">
              <p className="text-xs text-subtle">{msg.to} • {new Date(msg.at).toLocaleString()}</p>
              <p className="mt-1 text-sm">{msg.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
