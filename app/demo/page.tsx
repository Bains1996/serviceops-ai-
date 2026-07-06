"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

type DriverStatus = "AVAILABLE" | "EN_ROUTE" | "AT_PICKUP" | "DELAYED";

type DemoDriver = {
  id: string;
  name: string;
  status: DriverStatus;
  city: string;
  load?: string;
  lat: number;
  lng: number;
};

type DemoLoad = {
  id: string;
  origin: string;
  destination: string;
  rate: number;
  status: string;
  assignedTo?: string;
};

type TimelineEvent = {
  time: string;
  actor: string;
  action: string;
  detail: string;
};

const initialDrivers: DemoDriver[] = [
  { id: "drv-1", name: "Raj Singh", status: "EN_ROUTE", city: "Abbotsford, BC", load: "ld-101", lat: 49.05, lng: -122.30 },
  { id: "drv-2", name: "Gurpreet Gill", status: "AVAILABLE", city: "Calgary, AB", lat: 51.04, lng: -114.07 },
  { id: "drv-3", name: "Mike Chen", status: "AT_PICKUP", city: "Kamloops, BC", load: "ld-103", lat: 50.67, lng: -120.33 },
  { id: "drv-4", name: "Sarah Patel", status: "DELAYED", city: "Hope, BC", load: "ld-104", lat: 49.38, lng: -121.44 },
];

const initialLoads: DemoLoad[] = [
  { id: "ld-101", origin: "Vancouver, BC", destination: "Kelowna, BC", rate: 1480, status: "IN_PROGRESS", assignedTo: "drv-1" },
  { id: "ld-102", origin: "Surrey, BC", destination: "Edmonton, AB", rate: 2800, status: "OPEN" },
  { id: "ld-103", origin: "Kamloops, BC", destination: "Prince George, BC", rate: 950, status: "ASSIGNED", assignedTo: "drv-3" },
  { id: "ld-104", origin: "Hope, BC", destination: "Vancouver, BC", rate: 680, status: "DELAYED", assignedTo: "drv-4" },
];

const initialTimeline: TimelineEvent[] = [
  { time: "14:32", actor: "Dispatch Agent", action: "Assigned", detail: "Load ld-101 to Raj Singh (score: 94/100)" },
  { time: "14:28", actor: "Exception Agent", action: "Detected", detail: "Driver Sarah Patel delayed 45 min near Hope BC" },
  { time: "14:15", actor: "Rate Agent", action: "Negotiated", detail: "ld-102 rate from $2,400 to $2,800 (+$400)" },
  { time: "14:10", actor: "Compliance Agent", action: "Verified", detail: "All drivers HOS within limits" },
  { time: "14:02", actor: "Dispatch Agent", action: "Scored", detail: "ld-103 assigned to Mike Chen (best match)" },
  { time: "13:55", actor: "System", action: "Started", detail: "24/7 dispatch agent cycle initiated" },
];

export default function DemoPage() {
  const [drivers, setDrivers] = useState(initialDrivers);
  const [loads, setLoads] = useState(initialLoads);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [activeTab, setActiveTab] = useState<"drivers" | "loads" | "timeline">("drivers");
  const [isRunning, setIsRunning] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCycleCount((c) => c + 1);
      setTimeline((prev) => {
        const actions = [
          { actor: "Dispatch Agent", action: "Scored", detail: `Load ld-102 matched to best driver (score: ${85 + Math.floor(Math.random() * 14)}/100)` },
          { actor: "Exception Agent", action: "Monitored", detail: `Fleet status: ${drivers.filter((d) => d.status !== "DELAYED").length}/${drivers.length} on time` },
          { actor: "Rate Agent", action: "Analyzed", detail: `Market rate for Vancouver-Edmonton lane: $2.85/mi` },
          { actor: "Compliance Agent", action: "Checked", detail: "All HOS logs within FMCSA limits" },
          { actor: "Dispatch Agent", action: "Optimized", detail: "Fleet utilization at 78% - 2 trucks available" },
        ];
        const next = actions[Math.floor(Math.random() * actions.length)];
        const now = new Date();
        return [
          { time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`, ...next },
          ...prev.slice(0, 9),
        ];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning, drivers]);

  const statusColor = (s: DriverStatus) => {
    if (s === "AVAILABLE") return "var(--green)";
    if (s === "EN_ROUTE") return "var(--blue)";
    if (s === "AT_PICKUP") return "var(--yellow)";
    return "var(--red)";
  };

  const loadStatusColor = (s: string) => {
    if (s === "OPEN") return "var(--green)";
    if (s === "IN_PROGRESS") return "var(--blue)";
    if (s === "ASSIGNED") return "var(--yellow)";
    return "var(--red)";
  };

  return (
    <>
      <SiteNav />
      <main style={{ paddingTop: "var(--nav-height)", minHeight: "100vh" }}>
        {/* Header */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin) var(--space-2xl)", maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: isRunning ? "var(--green)" : "var(--grey-300)" }} className={isRunning ? "pulse-green" : ""} />
            <span className="small" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {isRunning ? `Agent Running \u2022 Cycle #${cycleCount}` : "Agent Paused"}
            </span>
          </div>
          <h1 className="display-1">Live Dispatch Agent Demo</h1>
          <p className="body-lg" style={{ marginTop: "12px", color: "var(--text-secondary)", maxWidth: "640px" }}>
            Watch the AI dispatch agents work in real time. They score loads, assign drivers, detect exceptions, and negotiate rates — you approve everything.
          </p>
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: "12px 28px" }}>
              Start Free Trial
            </Link>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn btn-secondary"
              style={{ padding: "12px 28px" }}
            >
              {isRunning ? "Pause Demo" : "Resume Demo"}
            </button>
          </div>
        </section>

        {/* KPI Bar */}
        <section style={{ padding: "0 var(--page-margin)", maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {[
              { label: "Active Drivers", value: drivers.length, color: "var(--green)", icon: "\u{1F69B}" },
              { label: "Open Loads", value: loads.filter((l) => l.status === "OPEN").length, color: "var(--blue)", icon: "\u{1F4E6}" },
              { label: "On-Time %", value: `${Math.round((drivers.filter((d) => d.status !== "DELAYED").length / drivers.length) * 100)}%`, color: "var(--green)", icon: "\u2705" },
              { label: "AI Actions", value: timeline.length, color: "var(--accent)", icon: "\u{1F916}" },
            ].map((kpi) => (
              <div key={kpi.label} className="section-frame" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="small" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{kpi.label}</p>
                  <span style={{ fontSize: "20px" }}>{kpi.icon}</span>
                </div>
                <p className="display-3" style={{ marginTop: "8px", color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <section style={{ padding: "var(--space-2xl) var(--page-margin)", maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <div className="control-tower-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
            {/* Left: Map + Tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Driver Map Placeholder */}
              <div className="section-frame" style={{ height: "320px", overflow: "hidden", borderRadius: "24px", position: "relative" }}>
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", position: "relative", overflow: "hidden" }}>
                  {/* Grid lines */}
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(50,121,249,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(50,121,249,0.06) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                  {/* Driver dots */}
                  {drivers.map((driver, i) => (
                    <div
                      key={driver.id}
                      style={{
                        position: "absolute",
                        left: `${15 + i * 20}%`,
                        top: `${25 + (i % 2) * 30}%`,
                        width: driver.status === "DELAYED" ? "16px" : "12px",
                        height: driver.status === "DELAYED" ? "16px" : "12px",
                        borderRadius: "50%",
                        background: statusColor(driver.status),
                        border: "2px solid white",
                        boxShadow: `0 0 12px ${statusColor(driver.status)}`,
                        transition: "all 0.5s var(--ease-out-expo)",
                      }}
                    />
                  ))}
                  {/* City labels */}
                  {["Vancouver", "Abbotsford", "Kamloops", "Calgary"].map((city, i) => (
                    <div key={city} style={{ position: "absolute", left: `${12 + i * 20}%`, top: `${60 + (i % 2) * 10}%`, fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)" }}>
                      {city}
                    </div>
                  ))}
                  {/* Legend */}
                  <div style={{ position: "absolute", bottom: "16px", left: "16px", display: "flex", gap: "16px", background: "rgba(0,0,0,0.5)", padding: "8px 16px", borderRadius: "8px" }}>
                    {(["AVAILABLE", "EN_ROUTE", "AT_PICKUP", "DELAYED"] as DriverStatus[]).map((s) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor(s) }} />
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)" }}>{s.replace("_", " ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs: Drivers / Loads */}
              <div className="section-frame" style={{ padding: "0" }}>
                <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                  {(["drivers", "loads"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1,
                        padding: "14px",
                        background: activeTab === tab ? "var(--accent-soft)" : "transparent",
                        border: "none",
                        borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                        color: activeTab === tab ? "var(--accent)" : "var(--text-muted)",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        textTransform: "capitalize",
                        transition: "all 0.2s",
                      }}
                    >
                      {tab} ({tab === "drivers" ? drivers.length : loads.length})
                    </button>
                  ))}
                </div>
                <div style={{ padding: "16px", maxHeight: "300px", overflow: "auto" }}>
                  {activeTab === "drivers" && drivers.map((driver) => (
                    <div key={driver.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: statusColor(driver.status), flexShrink: 0 }} className={`pulse-${driver.status === "DELAYED" ? "red" : "green"}`} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="body-md" style={{ fontWeight: "600" }}>{driver.name}</p>
                        <p className="small" style={{ color: "var(--text-muted)" }}>{driver.city} {driver.load ? `\u2022 ${driver.load}` : ""}</p>
                      </div>
                      <span style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600", background: `${statusColor(driver.status)}15`, color: statusColor(driver.status) }}>
                        {driver.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                  {activeTab === "loads" && loads.map((load) => (
                    <div key={load.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "8px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "10px", background: loadStatusColor(load.status), flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="body-md" style={{ fontWeight: "600" }}>{load.origin} \u2192 {load.destination}</p>
                        <p className="small" style={{ color: "var(--text-muted)" }}>CAD ${load.rate.toLocaleString()} {load.assignedTo ? `\u2022 ${load.assignedTo}` : ""}</p>
                      </div>
                      <span style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600", background: `${loadStatusColor(load.status)}15`, color: loadStatusColor(load.status) }}>
                        {load.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Timeline */}
            <div className="section-frame" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ padding: "8px", borderRadius: "8px", background: "var(--accent-soft)" }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="heading-md">Agent Activity Feed</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "500px", overflow: "auto" }}>
                {timeline.map((event, i) => (
                  <div
                    key={`${event.time}-${event.detail}-${i}`}
                    className="animate-fade-in-up"
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      background: i === 0 ? "var(--accent-soft)" : "transparent",
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span className="small" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{event.time}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "9999px", fontSize: "10px", fontWeight: "600", background: "var(--accent-soft)", color: "var(--accent)" }}>
                        {event.actor}
                      </span>
                      <span className="small" style={{ fontWeight: "600" }}>{event.action}</span>
                    </div>
                    <p className="body-md" style={{ color: "var(--text-secondary)" }}>{event.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin)", textAlign: "center" }}>
          <h2 className="display-2">See this working for your fleet?</h2>
          <p className="body-lg" style={{ marginTop: "12px", color: "var(--text-secondary)", maxWidth: "520px", margin: "12px auto 0" }}>
            30-day free trial. $49/truck/month after. No credit card required.
          </p>
          <div style={{ marginTop: "32px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: "16px 36px" }}>
              Start Free Trial
            </Link>
            <Link href="/pricing" className="btn btn-secondary" style={{ padding: "16px 36px" }}>
              View Pricing
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
