"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { MouseParallax } from "../components/mouse-parallax";
import { ScrollReveal } from "../components/scroll-reveal";

const features = [
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Command Center",
    desc: "Desktop web app with real-time fleet map, load board, AI recommendations, and approval queue. Runs in your browser — no install.",
    image: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "SMS Driver Comms",
    desc: "AI texts load updates, pickup instructions, and route changes. Drivers reply with keywords. No app needed.",
    image: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "6 AI Agents",
    desc: "Dispatch orchestrator, exception handler, rate negotiator, compliance monitor, billing readiness, driver coordinator.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=95",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Approval Gates",
    desc: "Every cost-impacting decision goes through configurable workflows. AI proposes, humans decide.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=95",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "POD Processing",
    desc: "Automatic proof-of-delivery extraction, billing packet assembly, and missing field detection.",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1920&q=95",
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "24/7 Operations",
    desc: "AI handles overnight dispatch, exception triage, and driver comms. Your team focuses on growth.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=95",
  },
];

const integrations = [
  { name: "TMS", items: "API, EDI, webhooks — connects to most platforms" },
  { name: "ELD", items: "API integration, GPS data feeds, ELD log exports" },
  { name: "Load Boards", items: "EDI 204/214, API feeds, email parsing" },
  { name: "Back Office", items: "CSV export, API invoicing, SFTP data feeds" },
];

export default function ProductPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SiteNav />

      <MouseParallax />

      {/* Hero — Full-screen dashboard background */}
       <section
         className="fullscreen-bg"
         style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           minHeight: "100vh",
         } as React.CSSProperties}
       >
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 24px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px", color: "rgba(255,255,255,0.8)", letterSpacing: "3px", fontSize: "13px", textTransform: "uppercase" }}>Product</p>
            <h1 style={{
              fontSize: "clamp(42px, 6vw, 72px)",
              fontWeight: "700",
              lineHeight: "1.05",
              color: "#fff",
              textShadow: "0 2px 30px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
              letterSpacing: "-1.5px",
              marginBottom: "24px",
            }}>
              The complete AI dispatch platform for trucking carriers.
            </h1>
            <p style={{
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              maxWidth: "640px",
              margin: "0 auto 40px",
            }}>
              One platform. Every dispatch decision automated, every action auditable, every driver connected.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ fontSize: "16px", padding: "16px 36px" }}>Start Free Trial</Link>
              <Link href="/book-demo" className="btn btn-outline btn-lg" style={{ fontSize: "16px", padding: "16px 36px", borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>Book a Demo</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Browser Preview */}
      <section className="section">
        <ScrollReveal>
          <MouseParallax floatDepth={0.3}>
            <div className="browser-frame">
              <div className="browser-bar">
                <div className="browser-dot" style={{ background: "var(--red)" }} />
                <div className="browser-dot" style={{ background: "var(--yellow)" }} />
                <div className="browser-dot" style={{ background: "var(--green)" }} />
                <div style={{ marginLeft: "16px", flex: 1, borderRadius: "9999px", background: "var(--grey-10)", padding: "6px 16px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                  app.serviceops.ai/command-center
                </div>
              </div>
              <div className="browser-content" style={{ background: "var(--grey-10)", minHeight: "350px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
                  {["Active Loads", "Drivers Online", "Delivered", "Revenue"].map((label) => (
                    <div key={label} data-float style={{ background: "white", borderRadius: "12px", padding: "16px", border: "1px solid var(--border)" }}>
                      <p className="small" style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="heading-lg" style={{ marginTop: "4px" }}>
                        {label === "Revenue" ? "$12,400" : label === "Active Loads" ? "24" : label === "Drivers Online" ? "18" : "12"}
                      </p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div data-float style={{ background: "white", borderRadius: "12px", padding: "16px", border: "1px solid var(--border)" }}>
                    <p className="small" style={{ color: "var(--text-muted)", marginBottom: "8px" }}>AI Activity</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {["Load assigned to Raj", "POD received from Mike", "Rate negotiated: +$200"].map((a) => (
                        <div key={a} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)" }} />
                          <span className="small">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div data-float style={{ background: "white", borderRadius: "12px", padding: "16px", border: "1px solid var(--border)" }}>
                    <p className="small" style={{ color: "var(--text-muted)", marginBottom: "8px" }}>Approval Queue</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {["Reroute I-90 delay", "Detention claim $350", "New load assignment"].map((a) => (
                        <div key={a} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="small">{a}</span>
                          <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600", background: "rgba(251,188,4,0.1)", color: "var(--yellow)" }}>PENDING</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MouseParallax>
        </ScrollReveal>
      </section>

      {/* Features — Full-screen background image sections */}
      <section>
        {features.map((f, i) => (
          <ScrollReveal key={f.title} delay={0.1}>
            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                alignItems: i % 2 === 0 ? "center" : "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${f.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: i % 2 === 0
                    ? "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 100%)"
                    : "linear-gradient(225deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 100%)",
                }}
              />
              <div
                data-float
                style={{
                  position: "relative",
                  zIndex: 2,
                  maxWidth: "600px",
                  padding: "80px 72px",
                  color: "#fff",
                }}
              >
                <MouseParallax floatDepth={0.4}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "28px",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}>
                    {f.icon}
                  </div>
                  <h2 style={{
                    fontSize: "clamp(32px, 4vw, 48px)",
                    fontWeight: "700",
                    lineHeight: "1.1",
                    marginBottom: "20px",
                    textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                    letterSpacing: "-0.5px",
                  }}>{f.title}</h2>
                  <p style={{
                    fontSize: "18px",
                    lineHeight: "1.65",
                    color: "rgba(255,255,255,0.85)",
                    textShadow: "0 1px 6px rgba(0,0,0,0.2)",
                  }}>{f.desc}</p>
                </MouseParallax>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* Integrations */}
      <section className="section" style={{ background: "var(--bg)" }}>
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "700px", margin: "0 auto 48px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px" }}>Integrations</p>
            <h2 className="display-1">Connects to your entire trucking stack.</h2>
          </div>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {integrations.map((g, i) => (
            <ScrollReveal key={g.name} delay={i * 0.1}>
              <MouseParallax floatDepth={0.15}>
                <div data-float className="card-flat" style={{ padding: "28px" }}>
                  <h3 className="heading-md" style={{ marginBottom: "8px" }}>{g.name}</h3>
                  <p className="caption" style={{ color: "var(--text-muted)" }}>{g.items}</p>
                </div>
              </MouseParallax>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
       <section
         className="fullscreen-bg"
         style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           minHeight: "70vh",
         } as React.CSSProperties}
       >
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "700px", margin: "0 auto", padding: "80px 24px" }}>
            <h2 style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: "700",
              color: "#fff",
              textShadow: "0 2px 30px rgba(0,0,0,0.4)",
              letterSpacing: "-1px",
            }}>Ready to see it in action?</h2>
            <p style={{
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              marginTop: "20px",
            }}>
              Start your free trial or book a demo to see the full platform.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "40px", flexWrap: "wrap" }}>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ fontSize: "16px", padding: "16px 36px" }}>Start Free Trial</Link>
              <Link href="/book-demo" className="btn btn-outline btn-lg" style={{ fontSize: "16px", padding: "16px 36px", borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>Book a Demo</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
