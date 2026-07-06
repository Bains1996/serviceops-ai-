"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

const modules = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    name: "Dispatch Orchestrator",
    desc: "AI assigns loads to drivers based on equipment, proximity, HOS, and lane history. Scored 0-100 for optimal matching.",
    status: "Core",
    color: "var(--accent)",
  },
  {
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    name: "Exception Handler",
    desc: "Detects delays, breakdowns, and missed windows. Automatically finds alternatives and notifies stakeholders.",
    status: "Core",
    color: "var(--yellow)",
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    name: "Rate Negotiator",
    desc: "Analyzes market rates, lane history, and your cost structure. Proposes accept/reject decisions for broker loads.",
    status: "Core",
    color: "var(--green)",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    name: "Compliance Monitor",
    desc: "Tracks HOS, ELD, insurance, and licensing. AI alerts before violations happen, not after.",
    status: "Core",
    color: "var(--red)",
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    name: "Driver Coordinator",
    desc: "SMS-first communication. Drivers text in, AI processes, dispatcher approves. No app needed.",
    status: "Core",
    color: "var(--accent)",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    name: "Billing Readiness",
    desc: "Captures POD, validates documents, and prepares billing packets before loads are delivered.",
    status: "Core",
    color: "var(--green)",
  },
  {
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    name: "Fleet Visibility",
    desc: "Real-time Leaflet map with driver locations, status colors, and load tracking across BC and Alberta.",
    status: "Live",
    color: "var(--accent)",
  },
  {
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    name: "Approval Workflow",
    desc: "Gates reroutes, detention approvals, and customer-impacting changes for manager sign-off.",
    status: "Live",
    color: "var(--yellow)",
  },
  {
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    name: "AI Chat Assistant",
    desc: "Ask questions about loads, rates, compliance, and fleet status. Get instant answers with real data.",
    status: "Live",
    color: "var(--accent)",
  },
];

export default function ModulesPage() {
  return (
    <>
      <SiteNav />
      <main style={{ paddingTop: "var(--nav-height)", minHeight: "100vh" }}>
        {/* Header */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin) var(--space-2xl)", maxWidth: "var(--page-max)", margin: "0 auto", textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "16px" }}>Platform</p>
          <h1 className="display-1">6 AI agents. 3 platform features.</h1>
          <p className="body-lg" style={{ marginTop: "16px", color: "var(--text-secondary)", maxWidth: "560px", margin: "16px auto 0" }}>
            Every feature works together. All integrations included. No per-seat fees. Just $49/truck/month.
          </p>
        </section>

        {/* Modules Grid */}
        <section style={{ padding: "0 var(--page-margin) var(--space-4xl)", maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {modules.map((mod) => (
              <div key={mod.name} className="section-frame" style={{ padding: "28px", transition: "all 0.3s var(--ease-out-expo)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${mod.color}11`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={mod.color} strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d={mod.icon} />
                    </svg>
                  </div>
                  <span style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600", background: "var(--accent-soft)", color: "var(--accent)" }}>
                    {mod.status}
                  </span>
                </div>
                <h2 className="heading-md" style={{ marginBottom: "8px" }}>{mod.name}</h2>
                <p className="body-md" style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>{mod.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin)", background: "var(--grey-10)" }}>
          <div style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}>
            <h2 className="display-3" style={{ textAlign: "center", marginBottom: "48px" }}>How the AI agents work together</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
              {["Driver SMS", "\u2192", "AI Chat", "\u2192", "Dispatch Agent", "\u2192", "Approval", "\u2192", "SMS Reply"].map((item, i) => (
                <div key={i} style={{
                  padding: item === "\u2192" ? "0" : "12px 20px",
                  borderRadius: item === "\u2192" ? "0" : "12px",
                  background: item === "\u2192" ? "transparent" : "var(--bg)",
                  border: item === "\u2192" ? "none" : "1px solid var(--border)",
                  fontSize: item === "\u2192" ? "24px" : "14px",
                  fontWeight: item === "\u2192" ? "400" : "600",
                  color: item === "\u2192" ? "var(--accent)" : "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin)", textAlign: "center" }}>
          <h2 className="display-2">See it in action</h2>
          <p className="body-lg" style={{ marginTop: "12px", color: "var(--text-secondary)", maxWidth: "480px", margin: "12px auto 0" }}>
            30-day free trial. All features included. No credit card required.
          </p>
          <div style={{ marginTop: "32px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: "16px 36px" }}>
              Start Free Trial
            </Link>
            <Link href="/book-demo" className="btn btn-secondary" style={{ padding: "16px 36px" }}>
              Book a Demo
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
