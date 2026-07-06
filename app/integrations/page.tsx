"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { MouseParallax } from "../components/mouse-parallax";
import { ScrollReveal } from "../components/scroll-reveal";

const connectorGroups = [
  {
    title: "TMS and Dispatch Platforms",
    systems: ["API integration", "EDI 204/214/990", "Webhook events", "CSV import", "Custom TMS connectors"],
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "ELD and Telematics",
    systems: ["API integration", "Webhook events", "GPS data feeds", "ELD log exports", "Custom telematics"],
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Load Boards and Broker Feeds",
    systems: ["EDI 204 load offers", "EDI 214 status updates", "API load feeds", "Email parsing", "Custom broker portals"],
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Back Office and Billing",
    systems: ["CSV export", "API invoicing", "Webhook events", "SFTP data feeds", "Custom accounting integrations"],
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const steps = [
  "Connect your systems (API, EDI, SFTP, or webhook).",
  "Sync drivers, tractors, loads, and active dispatch records.",
  "Route live updates into the control tower in real time.",
  "Start in supervised mode, then increase autonomy by policy.",
  "Let the 24/7 agent manage check-calls and assignment actions.",
  "Keep every decision auditable with role-based controls.",
];

export default function IntegrationsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SiteNav />

      <MouseParallax />

{/* Hero — Network/technology background */}
       <section
         className="fullscreen-bg fullscreen-bg-light"
          style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=95')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           minHeight: "50vh",
         } as React.CSSProperties}
       >
        <ScrollReveal>
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "100px 24px 60px", textAlign: "center" }}>
            <p className="eyebrow" style={{ marginBottom: "12px", color: "rgba(255,255,255,0.7)", letterSpacing: "3px", fontSize: "13px", textTransform: "uppercase" }}>Integrations</p>
            <h1 style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: "700",
              lineHeight: "1.1",
              color: "#fff",
              textShadow: "0 2px 24px rgba(0,0,0,0.4)",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}>
              Connect ServiceOps AI to the trucking systems you already use.
            </h1>
            <p style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.8)",
              textShadow: "0 1px 6px rgba(0,0,0,0.3)",
              maxWidth: "680px",
              margin: "0 auto",
            }}>
              Carriers in the USA and Canada can connect TMS, ELD, telematics, load feeds, and billing systems once, then let the 24/7 agent run operations continuously.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Connector Grid — Compact, no padding waste */}
      <section style={{ padding: "32px var(--page-margin)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {connectorGroups.map((group, i) => (
            <ScrollReveal key={group.title} delay={i * 0.08}>
              <MouseParallax floatDepth={0.1}>
                <div data-float className="card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "var(--accent-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent)",
                      flexShrink: 0,
                    }}>{group.icon}</div>
                    <h2 className="heading-lg">{group.title}</h2>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {group.systems.map((system) => (
                      <span key={system} className="tag">{system}</span>
                    ))}
                  </div>
                </div>
              </MouseParallax>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* How Integration Works — Compact steps */}
       <section
         className="fullscreen-bg"
          style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=95')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           minHeight: "auto",
           padding: "60px 0",
         } as React.CSSProperties}
       >
        <ScrollReveal>
          <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>
            <div style={{
              padding: "40px",
              borderRadius: "var(--radius-lg)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <h3 style={{
                fontSize: "clamp(28px, 3.5vw, 40px)",
                fontWeight: "700",
                color: "#fff",
                textShadow: "0 2px 16px rgba(0,0,0,0.3)",
                marginBottom: "32px",
                letterSpacing: "-0.5px",
              }}>How one-time integration works</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {steps.map((step, i) => (
                  <div key={step} style={{
                    padding: "14px 18px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--accent)",
                      flexShrink: 0,
                      lineHeight: "1.5",
                    }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", lineHeight: "1.5" }}>{step}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "28px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/book-demo" className="btn btn-primary">Start Integration Pilot</Link>
                <Link href="/control-tower" className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>Open Control Tower</Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
