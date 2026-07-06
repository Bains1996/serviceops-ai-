"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { MouseParallax } from "../components/mouse-parallax";
import { ScrollReveal } from "../components/scroll-reveal";

const agents = [
  {
    name: "Dispatch Orchestrator",
    desc: "Assigns loads to best-fit drivers using lane history, equipment match, HOS remaining, and real-time capacity.",
    color: "var(--accent)",
    image: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95",
  },
  {
    name: "Exception Handler",
    desc: "Triages delays, breakdowns, and reroute requests. Resolves autonomously or escalates to managers with full context.",
    color: "var(--yellow)",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=95",
  },
  {
    name: "Rate Negotiator",
    desc: "Negotiates rates with brokers using lane data, market rates, and carrier cost structure. Proposes accept/reject.",
    color: "var(--green)",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=95",
  },
  {
    name: "Compliance Monitor",
    desc: "Tracks HOS, ELD, and insurance requirements. Alerts before violations. Flags at-risk loads automatically.",
    color: "var(--red)",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=95",
  },
  {
    name: "Billing Readiness",
    desc: "Assembles POD packets, validates billing fields, and flags missing documents before finance handoff.",
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1920&q=95",
  },
  {
    name: "Driver Coordinator",
    desc: "Sends load updates via SMS, processes driver replies, and keeps dispatch informed in real time.",
    color: "#EC4899",
    image: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95",
  },
];

const modelRouting = [
  { tier: "Gemini Flash Lite", use: "Quick tasks — status, categorization", cost: "$0.10/1M tokens", color: "var(--green)" },
  { tier: "GPT-4o-mini", use: "Moderate — analysis, Q&A, chat", cost: "$0.15/1M tokens", color: "var(--yellow)" },
  { tier: "Claude Sonnet", use: "Complex — negotiate, optimize, strategize", cost: "$3/1M tokens", color: "var(--accent)" },
];

export default function AiBrainPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SiteNav />

      <MouseParallax />

{/* Hero — Full-screen AI/neural network background */}
       <section
         className="fullscreen-bg"
         style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=95')",
         } as React.CSSProperties}
       >
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 24px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px", color: "rgba(255,255,255,0.8)", letterSpacing: "3px", fontSize: "13px", textTransform: "uppercase" }}>AI Brain</p>
            <h1 style={{
              fontSize: "clamp(42px, 6vw, 72px)",
              fontWeight: "700",
              lineHeight: "1.05",
              color: "#fff",
              textShadow: "0 2px 30px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
              letterSpacing: "-1.5px",
              marginBottom: "24px",
            }}>
              Six specialized agents. One intelligent dispatch brain.
            </h1>
            <p style={{
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              maxWidth: "680px",
              margin: "0 auto",
            }}>
              ServiceOps AI uses a multi-agent architecture where each agent handles a specific dispatch function. They work in sequence, escalate to humans when needed, and apply intelligent rules to every dispatch decision.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Agent Grid */}
      <section className="section">
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "700px", margin: "0 auto 48px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px" }}>The 6 Agents</p>
            <h2 className="display-1">Each agent is an expert in its domain.</h2>
          </div>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {agents.map((a, i) => (
            <ScrollReveal key={a.name} delay={i * 0.1}>
              <MouseParallax floatDepth={0.2}>
                <div data-float className="card" style={{ padding: "0", height: "100%", overflow: "hidden", borderTop: `3px solid ${a.color}` }}>
                  <div style={{ position: "relative", height: "140px", overflow: "hidden" }}>
                    <img
                      src={a.image}
                      alt={a.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
                    <div style={{ position: "absolute", top: "12px", left: "12px", width: "12px", height: "12px", borderRadius: "50%", background: a.color, boxShadow: `0 0 12px ${a.color}` }} />
                  </div>
                  <div style={{ padding: "24px" }}>
                    <h3 className="heading-lg" style={{ marginBottom: "8px" }}>{a.name}</h3>
                    <p className="body-md" style={{ color: "var(--text-secondary)" }}>{a.desc}</p>
                  </div>
                </div>
              </MouseParallax>
            </ScrollReveal>
          ))}
        </div>
      </section>

{/* Model Routing */}
       <section
         className="fullscreen-bg"
         style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=95')",
         } as React.CSSProperties}
       >
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 24px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px", color: "rgba(255,255,255,0.7)", letterSpacing: "3px", fontSize: "13px", textTransform: "uppercase" }}>Model Routing</p>
            <h2 style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: "700",
              color: "#fff",
              textShadow: "0 2px 24px rgba(0,0,0,0.4)",
              letterSpacing: "-0.5px",
              marginBottom: "16px",
            }}>Right model for every decision.</h2>
            <p style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.8)",
              textShadow: "0 1px 6px rgba(0,0,0,0.3)",
              maxWidth: "600px",
              margin: "0 auto 48px",
            }}>
              Simple tasks use fast, cheap models. Complex decisions use the most capable models. Cost-optimized automatically.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {modelRouting.map((m, i) => (
                <MouseParallax key={m.tier} floatDepth={0.15}>
                  <div data-float style={{
                    padding: "36px 28px",
                    textAlign: "center",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: m.color, margin: "0 auto 16px", boxShadow: `0 0 16px ${m.color}` }} />
                    <h3 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "6px" }}>{m.tier}</h3>
                    <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)" }}>{m.use}</p>
                    <p style={{ fontSize: "13px", marginTop: "8px", color: "rgba(255,255,255,0.5)" }}>{m.cost}</p>
                  </div>
                </MouseParallax>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* How It Works */}
      <section className="section">
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "700px", margin: "0 auto 48px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px" }}>Flow</p>
            <h2 className="display-1">How the AI brain processes a load.</h2>
          </div>
        </ScrollReveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
          {[
            { num: "01", title: "Load arrives", desc: "From TMS, EDI, email, or broker portal." },
            { num: "02", title: "AI analyzes", desc: "Best driver, lane risk, rate potential." },
            { num: "03", title: "Action proposed", desc: "Assign, negotiate, or escalate." },
            { num: "04", title: "Human decides", desc: "Approve, reject, or modify." },
          ].map((s, i) => (
            <ScrollReveal key={s.num} delay={i * 0.1}>
              <MouseParallax floatDepth={0.2}>
                <div data-float style={{ textAlign: "center", padding: "24px" }}>
                  <div style={{ fontSize: "64px", fontWeight: "300", color: "rgba(50,121,249,0.12)", lineHeight: "1", marginBottom: "16px" }}>{s.num}</div>
                  <h3 className="heading-lg" style={{ marginBottom: "8px" }}>{s.title}</h3>
                  <p className="body-md" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
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
           '--bg-image': "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=95')",
           minHeight: "60vh",
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
            }}>See the AI brain in action.</h2>
            <p style={{
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              marginTop: "20px",
            }}>
              Book a demo to see how the 6 agents handle real dispatch scenarios.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "40px", flexWrap: "wrap" }}>
              <Link href="/book-demo" className="btn btn-primary btn-lg" style={{ fontSize: "16px", padding: "16px 36px" }}>Book a Demo</Link>
              <Link href="/register" className="btn btn-outline btn-lg" style={{ fontSize: "16px", padding: "16px 36px", borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>Start Free Trial</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </div>
  );
}
