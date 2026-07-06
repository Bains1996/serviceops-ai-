"use client";

import { useEffect, useMemo, useState } from "react";
import { FleetMap } from "./fleet-map";
import { AIChatWidget } from "./ai-chat-widget";

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
    if (data.ok) setEvents(data.events);
  };

  const fetchJobs = async (nextCompanyId = companyId) => {
    if (!nextCompanyId) return;
    const res = await fetch(`/api/ops/jobs?companyId=${encodeURIComponent(nextCompanyId)}&limit=12`, { cache: "no-store" });
    const data = await parseJson<{ ok: boolean; jobs: DispatchJob[] }>(res);
    if (data.ok) setJobs(data.jobs);
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

    const eventSource = new EventSource(`/api/events?companyId=${encodeURIComponent(companyId)}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "state_update") {
          setState(data.state);
        } else if (data.type === "events_update") {
          setEvents(data.events);
        } else if (data.type === "jobs_update") {
          setJobs(data.jobs);
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      console.log("[SSE] Reconnecting...");
    };

    return () => {
      eventSource.close();
    };
  }, [companyId, initializing]);

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
    if (error) return <p className="body-md" style={{ color: "var(--red)" }}>{error}</p>;
    return <p className="body-md" style={{ color: "var(--text-muted)" }}>Loading control tower...</p>;
  }

  const statusColor = (s: string) => {
    if (s === "PROCESSED" || s === "COMPLETED") return "var(--green)";
    if (s === "FAILED") return "var(--red)";
    if (s === "PROCESSING") return "var(--blue)";
    return "var(--yellow)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Drivers", value: state.drivers.length, color: "var(--green)", sub: "Active fleet", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
          { label: "Open Loads", value: state.loads.filter((l) => l.status === "OPEN").length, color: "var(--blue)", sub: "Ready to assign", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
          { label: "Approvals", value: state.approvals.filter((a) => a.status === "PENDING").length, color: "var(--yellow)", sub: "Awaiting review", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Messages", value: state.outbound.length, color: "var(--blue)", sub: "Sent today", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
        ].map((kpi) => (
          <div key={kpi.label} className="section-frame" style={{ padding: "20px", transition: "all 0.3s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="small" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{kpi.label}</p>
              <div style={{ padding: "8px", borderRadius: "8px", background: `${kpi.color}11` }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={kpi.icon} />
                </svg>
              </div>
            </div>
            <p className="display-3" style={{ marginTop: "12px", color: kpi.color }}>{kpi.value}</p>
            <p className="small" style={{ marginTop: "4px", color: kpi.color }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Map Section */}
      <div className="section-frame" style={{ overflow: "hidden", borderRadius: "24px", height: "400px" }}>
        <FleetMap
          drivers={state.drivers}
          selectedDriver={selectedDriver}
          onDriverSelect={setSelectedDriver}
        />
      </div>

      {/* Messaging and Approval */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
        <section className="section-frame" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 className="heading-lg">Driver Messaging Agent</h2>
            <button
              onClick={resetState}
              disabled={!canReset}
              className="chip"
              style={{ padding: "8px 16px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em" }}
            >
              Reset State
            </button>
          </div>
          <p className="small" style={{ marginTop: "12px", color: "var(--text-muted)" }}>
            Active tenant: {connection?.companyName ?? companyId} ({companyId})
          </p>
          <p className="small" style={{ marginTop: "4px", color: "var(--text-muted)" }}>
            Signed in as {session?.fullName ?? "Operator"} &bull; {session?.role ?? "VIEWER"}
          </p>

          <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "0.45fr 0.55fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {state.drivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px",
                    borderRadius: "12px",
                    border: selected?.id === driver.id ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: selected?.id === driver.id ? "var(--accent-soft)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <p className="body-md" style={{ fontWeight: "500" }}>{driver.name}</p>
                  <p className="small" style={{ color: "var(--text-muted)" }}>{driver.status} &bull; {driver.city}</p>
                  {typeof driver.lat === "number" && typeof driver.lng === "number" && (
                    <p style={{ marginTop: "4px", fontSize: "11px", color: "var(--text-muted)" }}>GPS {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}</p>
                  )}
                </button>
              ))}
            </div>

            <div style={{ padding: "16px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <p className="small" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Simulate incoming driver text</p>
              <p className="body-md" style={{ marginTop: "8px", color: "var(--text-muted)" }}>Selected driver: {selected?.name}</p>
              {typeof selected?.lat === "number" && typeof selected?.lng === "number" && (
                <p className="small" style={{ marginTop: "4px", color: "var(--text-muted)" }}>Last known GPS: {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</p>
              )}
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                rows={4}
                className="form-textarea"
                style={{ marginTop: "12px" }}
                placeholder="Type driver message"
              />
              <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {quickMessages.map((msg) => (
                  <button
                    key={msg}
                    onClick={() => setMessageText(msg)}
                    className="chip"
                    style={{ padding: "6px 12px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                  >
                    {msg}
                  </button>
                ))}
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !canDispatch}
                className="btn btn-primary"
                style={{ marginTop: "16px", width: "100%" }}
              >
                {loading ? "Processing..." : "Process Message"}
              </button>
              {!canDispatch && <p className="small" style={{ marginTop: "8px", color: "var(--text-muted)" }}>Dispatcher or admin role required for message actions.</p>}
              {error && <p className="body-md" style={{ marginTop: "12px", color: "var(--red)" }}>{error}</p>}
            </div>
          </div>
        </section>

        <section className="section-frame" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(251,188,4,0.1)" }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--yellow)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="heading-lg">Approval Inbox</h2>
          </div>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {state.approvals.length === 0 && (
              <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", textAlign: "center" }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--green)" strokeWidth="2" style={{ margin: "0 auto 8px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="body-md" style={{ color: "var(--text-muted)" }}>All caught up! No pending approvals.</p>
              </div>
            )}
            {state.approvals.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: item.status === "PENDING" ? "1px solid rgba(251,188,4,0.3)" : "1px solid var(--border)",
                  background: item.status === "PENDING" ? "rgba(251,188,4,0.05)" : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontWeight: "600" }}>{item.loadId} &rarr; {item.driverId}</p>
                    <p className="body-md" style={{ marginTop: "4px", color: "var(--text-muted)" }}>{item.reason}</p>
                  </div>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: "600",
                    background: item.status === "PENDING" ? "rgba(251,188,4,0.15)" : item.status === "APPROVED" ? "rgba(52,168,83,0.15)" : "rgba(234,67,53,0.15)",
                    color: item.status === "PENDING" ? "var(--yellow)" : item.status === "APPROVED" ? "var(--green)" : "var(--red)",
                  }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span className="small" style={{ color: "var(--text-muted)" }}>Score: {item.score.toFixed(1)}</span>
                  <span className="small" style={{ color: "var(--text-muted)" }}>Deadhead: {item.deadheadMiles} mi</span>
                  <span className="small" style={{ color: "var(--text-muted)" }}>Rate: ${item.ratePerMile.toFixed(2)}/mi</span>
                </div>
                {item.status === "PENDING" && (
                  <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleApproval(item.id, "APPROVE")}
                      disabled={!canDispatch}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "var(--green)",
                        color: "white",
                        border: "none",
                        fontWeight: "600",
                        cursor: canDispatch ? "pointer" : "not-allowed",
                        opacity: canDispatch ? 1 : 0.4,
                      }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(item.id, "REJECT")}
                      disabled={!canDispatch}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "var(--red)",
                        color: "white",
                        border: "none",
                        fontWeight: "600",
                        cursor: canDispatch ? "pointer" : "not-allowed",
                        opacity: canDispatch ? 1 : 0.4,
                      }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

      {/* Event Pipeline */}
      <section className="section-frame" style={{ padding: "24px" }}>
        <h2 className="heading-lg">Event Pipeline</h2>
        <div style={{ marginTop: "16px", maxHeight: "260px", overflow: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {events.map((event) => (
            <div key={event.id} style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <p className="body-md" style={{ fontWeight: "500" }}>{event.source} &bull; {event.eventType}</p>
                <span style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600", background: `${statusColor(event.status)}22`, color: statusColor(event.status) }}>
                  {event.status}
                </span>
              </div>
              <p className="small" style={{ marginTop: "4px", color: "var(--text-muted)" }}>{new Date(event.createdAt).toLocaleString()}</p>
              <p className="body-md" style={{ marginTop: "8px" }}>{event.summary}</p>
              {event.errorMessage && <p className="small" style={{ marginTop: "8px", color: "var(--red)" }}>{event.errorMessage}</p>}
            </div>
          ))}
          {events.length === 0 && (
            <div style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <p className="body-md" style={{ color: "var(--text-muted)" }}>No dispatch events recorded yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Worker Queue */}
      <section className="section-frame" style={{ padding: "24px" }}>
        <h2 className="heading-lg">Worker Queue</h2>
        <div style={{ marginTop: "16px", maxHeight: "240px", overflow: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {jobs.map((job) => (
            <div key={job.id} style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <p className="body-md" style={{ fontWeight: "500" }}>{job.jobType}</p>
                <span style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600", background: `${statusColor(job.status)}22`, color: statusColor(job.status) }}>
                  {job.status}
                </span>
              </div>
              <p className="small" style={{ marginTop: "4px", color: "var(--text-muted)" }}>Attempts {job.attempts} &bull; {new Date(job.createdAt).toLocaleString()}</p>
              {job.lastError && <p className="small" style={{ marginTop: "8px", color: "var(--red)" }}>{job.lastError}</p>}
            </div>
          ))}
          {jobs.length === 0 && (
            <div style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <p className="body-md" style={{ color: "var(--text-muted)" }}>No queued background jobs yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Load Board and Timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <section className="section-frame" style={{ padding: "24px" }}>
          <h2 className="heading-lg">Load Board</h2>
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {state.loads.map((load) => (
              <div key={load.id} style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <p className="body-md" style={{ fontWeight: "500" }}>{load.id} &bull; {load.customer}</p>
                <p className="small" style={{ marginTop: "4px", color: "var(--text-muted)" }}>{load.origin} &rarr; {load.destination}</p>
                <p className="small" style={{ marginTop: "4px", color: "var(--text-muted)" }}>Rate CAD {load.rateCad} &bull; Deadhead {load.deadheadMiles} mi &bull; {load.status}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-frame" style={{ padding: "24px" }}>
          <h2 className="heading-lg">Live Timeline</h2>
          <div style={{ marginTop: "16px", maxHeight: "380px", overflow: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {state.timeline.map((item) => (
              <div key={item.id} style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <p className="body-md" style={{ fontWeight: "500" }}>{item.title}</p>
                <p className="small" style={{ marginTop: "4px", color: "var(--text-muted)" }}>{item.actor} &bull; {new Date(item.at).toLocaleString()}</p>
                <p className="body-md" style={{ marginTop: "8px" }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Outbound Messages */}
      <section className="section-frame" style={{ padding: "24px" }}>
        <h2 className="heading-lg">Outbound Driver Messages</h2>
        <div style={{ marginTop: "16px", maxHeight: "240px", overflow: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {state.outbound.map((msg) => (
            <div key={msg.id} style={{ padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <p className="small" style={{ color: "var(--text-muted)" }}>{msg.to} &bull; {new Date(msg.at).toLocaleString()}</p>
              <p className="body-md" style={{ marginTop: "4px" }}>{msg.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Chat Widget */}
      <AIChatWidget companyId={companyId} />
    </div>
  );
}
