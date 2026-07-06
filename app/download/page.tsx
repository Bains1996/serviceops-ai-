"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { MouseParallax } from "../components/mouse-parallax";
import { ScrollReveal } from "../components/scroll-reveal";

const features = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Load Board",
    desc: "View all available loads, sort by rate, lane, and equipment type. Accept with one click.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Driver Messaging",
    desc: "Send and receive text messages from drivers. AI parses replies and updates load status automatically.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "AI Chat",
    desc: "Ask your AI dispatcher anything. Load status, driver availability, rate calculations — instant answers.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Approval Queue",
    desc: "Review AI recommendations. Approve load assignments, rate negotiations, and exception resolutions.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Event Timeline",
    desc: "See every action in real-time. Load assignments, driver messages, exceptions — all logged and searchable.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Analytics Dashboard",
    desc: "Revenue per mile, empty miles, delivery performance, driver utilization — all at a glance.",
  },
];

export default function DownloadPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SiteNav />

      <MouseParallax />

{/* Hero — Full-screen background */}
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
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 24px 80px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: "16px", color: "rgba(255,255,255,0.7)", letterSpacing: "3px", fontSize: "13px", textTransform: "uppercase" }}>Try ServiceOps AI</p>
                <h1 style={{
                  fontSize: "clamp(36px, 5vw, 56px)",
                  fontWeight: "700",
                  lineHeight: "1.08",
                  color: "#fff",
                  textShadow: "0 2px 30px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
                  letterSpacing: "-1px",
                  marginBottom: "20px",
                }}>
                  Your dispatch center.
                  <br />
                  In your browser.
                </h1>
                <p style={{
                  fontSize: "18px",
                  lineHeight: "1.6",
                  color: "rgba(255,255,255,0.85)",
                  textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                  maxWidth: "480px",
                }}>
                  The Command Center runs in your browser. Manage loads, message drivers, and let AI handle dispatch — all from one tab. No install required.
                </p>
                <div style={{ marginTop: "28px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <Link href="/register" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    Start Free Trial
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link href="/book-demo" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "8px", borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>
                    Book a Demo
                  </Link>
                </div>
                <div style={{ marginTop: "24px", display: "flex", gap: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px" }}>$49/truck/month</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px" }}>30-day free trial</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <MouseParallax floatDepth={0.3}>
                  <div data-float className="phone-frame">
                    <div className="phone-screen" style={{ padding: "20px" }}>
                      <div style={{ textAlign: "center", marginBottom: "16px" }}>
                        <p className="small" style={{ color: "var(--text-muted)" }}>Good Morning</p>
                        <p className="heading-md">Dispatch Center</p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                        <div style={{ background: "white", borderRadius: "12px", padding: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                          <p style={{ fontSize: "24px", fontWeight: "500", color: "var(--accent)" }}>12</p>
                          <p className="small" style={{ color: "var(--text-muted)" }}>Active Loads</p>
                        </div>
                        <div style={{ background: "white", borderRadius: "12px", padding: "12px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                          <p style={{ fontSize: "24px", fontWeight: "500", color: "var(--green)" }}>8</p>
                          <p className="small" style={{ color: "var(--text-muted)" }}>Delivered</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ background: "white", borderRadius: "12px", padding: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ background: "var(--accent-soft)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", color: "var(--accent)" }}>LD-042</span>
                            <span style={{ background: "rgba(52,168,83,0.1)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600", color: "var(--green)" }}>In Transit</span>
                          </div>
                          <p className="small" style={{ fontWeight: "500" }}>Vancouver &rarr; Kelowna</p>
                          <p className="small" style={{ color: "var(--text-muted)" }}>Raj Singh &bull; $1,200</p>
                        </div>
                        <div style={{ background: "white", borderRadius: "12px", padding: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent-soft)" }} />
                            <span className="small" style={{ fontWeight: "500" }}>AI Dispatcher</span>
                          </div>
                          <p className="small" style={{ color: "var(--text-muted)" }}>&quot;Pickup confirmed. Proceed to dock 3.&quot;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </MouseParallax>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Features — Full-screen background sections */}
      <section>
        <ScrollReveal>
          <div style={{ maxWidth: "768px", margin: "0 auto", padding: "80px 24px 40px", textAlign: "center" }}>
            <p className="eyebrow" style={{ marginBottom: "12px" }}>Command Center Features</p>
            <h2 className="display-1">
              Everything dispatch needs.
              <br />
              Nothing they don&apos;t.
            </h2>
            <p className="body-lg" style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
              Built for trucking carriers. Designed for the real world of freight operations.
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", padding: "0 var(--page-margin)" }}>
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.08}>
              <MouseParallax floatDepth={0.12}>
                <div data-float className="card hover-lift" style={{ padding: "28px" }}>
                  <div className="icon-circle" style={{ marginBottom: "16px" }}>{f.icon}</div>
                  <h3 className="heading-lg" style={{ marginBottom: "8px" }}>{f.title}</h3>
                  <p className="body-md" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
                </div>
              </MouseParallax>
            </ScrollReveal>
          ))}
        </div>
      </section>

{/* Desktop Section — Full-screen background */}
       <section
         className="fullscreen-bg"
         style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=95')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           minHeight: "80vh",
         } as React.CSSProperties}
       >
        <ScrollReveal>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              alignItems: "center",
              padding: "48px",
              borderRadius: "var(--radius-lg)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: "12px", color: "rgba(255,255,255,0.7)", letterSpacing: "3px", fontSize: "13px", textTransform: "uppercase" }}>Command Center</p>
                <h2 style={{
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  fontWeight: "700",
                  lineHeight: "1.1",
                  color: "#fff",
                  textShadow: "0 2px 16px rgba(0,0,0,0.3)",
                  letterSpacing: "-0.5px",
                  marginBottom: "16px",
                }}>
                  The desktop experience.
                  <br />
                  In your browser.
                </h2>
                <p style={{
                  fontSize: "17px",
                  lineHeight: "1.6",
                  color: "rgba(255,255,255,0.8)",
                  textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  marginBottom: "24px",
                }}>
                  No install required. Bookmark it and it works just like an app.
                  Load board, AI recommendations, and approval workflows — all in one tab.
                </p>
                <Link href="/control-tower" className="btn btn-primary">Open Command Center</Link>
              </div>
              <MouseParallax floatDepth={0.2}>
                <div data-float className="browser-frame" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                  <div className="browser-bar" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="browser-dot" style={{ background: "var(--red)" }} />
                    <div className="browser-dot" style={{ background: "var(--yellow)" }} />
                    <div className="browser-dot" style={{ background: "var(--green)" }} />
                  </div>
                  <div className="browser-content" style={{ background: "var(--grey-10)", minHeight: "200px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ height: "60px", borderRadius: "8px", background: "white", border: "1px solid var(--border)" }} />
                      ))}
                    </div>
                  </div>
                </div>
              </MouseParallax>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="section-hero">
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h2 className="display-0">Ready to dispatch smarter?</h2>
            <p className="body-lg" style={{ marginTop: "24px", color: "var(--text-secondary)" }}>
              Start your free trial or book a demo to see ServiceOps AI in action.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "40px", flexWrap: "wrap" }}>
              <Link href="/register" className="btn btn-primary btn-lg">Start Free Trial</Link>
              <Link href="/book-demo" className="btn btn-outline btn-lg">Book a Demo</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
