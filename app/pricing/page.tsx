"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { MouseParallax } from "../components/mouse-parallax";
import { ScrollReveal } from "../components/scroll-reveal";

const tiers = [
  {
    name: "Carrier Platform",
    desc: "Everything included. Every feature. Every agent.",
    price: "$49",
    unit: "per truck / month",
    note: "All features included. Volume discounts available.",
    features: [
      "AI Dispatch Copilot",
      "6 Specialized AI Agents",
      "Real-time Command Center",
      "SMS driver communication",
      "Approval workflows",
      "TMS, ELD, load board integrations",
      "POD-to-billing acceleration",
      "Unlimited users",
      "Email + chat support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
];

const volumes = [
  { trucks: "1-19", price: "$49", per: "per truck/mo" },
  { trucks: "20-49", price: "$39", per: "per truck/mo" },
  { trucks: "50+", price: "$29", per: "per truck/mo (negotiated)" },
];

const faqs = [
  {
    q: "What exactly does $49/truck include?",
    a: "Everything. All 6 AI agents, the Command Center, SMS communication, approval workflows, and analytics dashboard. No feature gates.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. 30 days, no credit card required. Full access to every feature.",
  },
  {
    q: "What about volume discounts?",
    a: "20+ trucks = $39/truck/mo. 50+ trucks = $29/truck/mo (negotiated). Contact sales for 100+.",
  },
  {
    q: "What about drivers?",
    a: "Drivers get text messages — no app needed. The carrier pays for the platform; drivers are included at no extra cost.",
  },
  {
    q: "What TMS integrations do you support?",
    a: "We integrate via API, EDI, and webhooks with most TMS platforms. Custom integrations available for enterprise carriers.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Data is encrypted at rest and in transit. We use industry-standard security practices and never share data with third parties.",
  },
  {
    q: "Can I switch plans later?",
    a: "There's only one plan — everything included. You just add or remove trucks as your fleet changes.",
  },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SiteNav />

      <MouseParallax />

      {/* Hero — Full-screen truck background */}
      <section
        className="fullscreen-bg"
        style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1551288049-bae6490f2e6b?w=1920&q=95')",
         } as React.CSSProperties}
      >
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "900px", margin: "0 auto", padding: "clamp(80px, 10vh, 120px) 24px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px", color: "rgba(255,255,255,0.8)", letterSpacing: "3px", fontSize: "13px", textTransform: "uppercase" }}>Pricing</p>
            <h1 style={{
              fontSize: "clamp(42px, 6vw, 72px)",
              fontWeight: "700",
              lineHeight: "1.05",
              color: "#fff",
              textShadow: "0 2px 30px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
              letterSpacing: "-1.5px",
              marginBottom: "24px",
            }}>
              $49 per truck.
              <br />
              Everything included.
            </h1>
            <p style={{
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              maxWidth: "600px",
              margin: "0 auto",
            }}>
              One flat rate. All AI agents, all integrations, all features. Volume discounts for larger fleets.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Single Pricing Card */}
      <section className="section-tight">
        <ScrollReveal>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <MouseParallax floatDepth={0.15}>
              <div data-float className="card glow-ring" style={{ padding: "clamp(30px, 4vw, 48px)", textAlign: "center" }}>
                <p className="eyebrow" style={{ marginBottom: "8px" }}>Carrier Platform</p>
                <div style={{ marginBottom: "8px" }}>
                  <span className="display-hero" style={{ color: "var(--accent)" }}>$49</span>
                  <span className="body-lg" style={{ color: "var(--text-muted)", marginLeft: "8px" }}>/truck/mo</span>
                </div>
                <p className="body-md" style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
                  All features included. No feature gates. No hidden fees.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", textAlign: "left", marginBottom: "clamp(20px, 3vw, 32px)" }}>
                  {tiers[0].features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="body-md">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                  Start Free Trial
                </Link>
                <p className="caption" style={{ color: "var(--text-muted)", marginTop: "12px" }}>
                  30 days free. No credit card required.
                </p>
              </div>
            </MouseParallax>
          </div>
        </ScrollReveal>
      </section>

      {/* Driver Experience */}
      <section
        className="fullscreen-bg"
        style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1920&q=95')",
         } as React.CSSProperties}
      >
        <ScrollReveal>
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "clamp(50px, 8vh, 80px) 24px" }}>
            <div className="text-center" style={{ marginBottom: "clamp(20px, 4vh, 48px)" }}>
              <h2 style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: "700",
                color: "#fff",
                textShadow: "0 2px 24px rgba(0,0,0,0.4)",
                letterSpacing: "-0.5px",
              }}>How it works for drivers</h2>
              <p style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: "rgba(255,255,255,0.8)",
                textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                marginTop: "16px",
              }}>
                No apps to install. No passwords to remember. Just simple text messages.
              </p>
            </div>
            <div style={{ display: "grid", gap: "clamp(16px, 3vw, 24px)", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginBottom: "clamp(20px, 4vh, 40px)" }}>
              <div style={{ textAlign: "center", padding: "clamp(16px, 3vw, 24px)", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width: "clamp(40px, 5vw, 60px)", height: "clamp(40px, 5vw, 60px)", margin: "0 auto 16px", background: "rgba(100, 200, 255, 0.2)", borderRadius: "50%" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 style={{ marginBottom: "12px", color: "#fff" }}>Load assignment</h3>
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.5" }}>
                  You'll receive a text with the load details: pickup, delivery, weight, and pay. Reply "ACCEPT" to take the load or "DECLINE" to pass.
                </p>
              </div>
              <div style={{ textAlign: "center", padding: "clamp(16px, 3vw, 24px)", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width: "clamp(40px, 5vw, 60px)", height: "clamp(40px, 5vw, 60px)", margin: "0 auto 16px", background: "rgba(100, 255, 100, 0.2)", borderRadius: "50%" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 style={{ marginBottom: "12px", color: "#fff" }}>Proof of delivery</h3>
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.5" }}>
                  After delivery, snap a photo of the POD and reply with the image. Our AI will extract the details and update the load status automatically.
                </p>
              </div>
              <div style={{ textAlign: "center", padding: "clamp(16px, 3vw, 24px)", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width: "clamp(40px, 5vw, 60px)", height: "clamp(40px, 5vw, 60px)", margin: "0 auto 16px", background: "rgba(255, 100, 100, 0.2)", borderRadius: "50%" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 style={{ marginBottom: "12px", color: "#fff" }}>Issues & updates</h3>
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.5" }}>
                  If you're running late, stuck in traffic, or have an issue, just text us. We'll notify the dispatcher and reschedule if needed.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Volume Discounts */}
      <section
        className="fullscreen-bg"
        style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=95')",
         } as React.CSSProperties}
      >
        <ScrollReveal>
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "clamp(50px, 8vh, 80px) 24px" }}>
            <div className="text-center" style={{ marginBottom: "clamp(20px, 4vh, 48px)" }}>
              <h2 style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: "700",
                color: "#fff",
                textShadow: "0 2px 24px rgba(0,0,0,0.4)",
                letterSpacing: "-0.5px",
              }}>Volume discounts for growing fleets.</h2>
              <p style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: "rgba(255,255,255,0.8)",
                textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                marginTop: "16px",
              }}>
                The more trucks, the less you pay per truck. No contracts required.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(16px, 3vw, 20px)" }}>
              {volumes.map((v, i) => (
                <MouseParallax key={v.trucks} floatDepth={0.12}>
                  <div data-float style={{
                    padding: "clamp(24px, 4vw, 36px) clamp(16px, 3vw, 28px)",
                    textAlign: "center",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}>
                    <p style={{ fontSize: "clamp(18px, 3vw, 22px)", fontWeight: "600", color: "#fff", marginBottom: "clamp(2px, 1vh, 4px)" }}>{v.trucks} trucks</p>
                    <p style={{ fontSize: "clamp(30px, 5vw, 40px)", fontWeight: "700", color: "#fff", margin: "clamp(8px, 2vh, 16px) 0 clamp(2px, 1vh, 4px)", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>{v.price}</p>
                    <p style={{ fontSize: "clamp(10px, 2vw, 14px)", color: "rgba(255,255,255,0.6)" }}>{v.per}</p>
                  </div>
                </MouseParallax>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ */}
      <section className="section">
        <ScrollReveal>
          <div style={{ maxWidth: "700px", margin: "0 auto", padding: "clamp(30px, 4vw, 40px) 24px" }}>
            <h2 className="display-2 text-center" style={{ marginBottom: "clamp(20px, 4vh, 48px)" }}>Frequently Asked Questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vh, 12px)" }}>
              {faqs.map((item, i) => (
                <ScrollReveal key={item.q} delay={i * 0.06}>
                  <MouseParallax floatDepth={0.08}>
                    <div data-float className="card-flat" style={{ padding: "clamp(16px, 3vw, 24px)" }}>
                      <h4 className="heading-lg">{item.q}</h4>
                      <p className="body-md" style={{ marginTop: "8px", color: "var(--text-secondary)" }}>{item.a}</p>
                    </div>
                  </MouseParallax>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section
        className="fullscreen-bg"
        style={{
           '--bg-image': "url('https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95')",
         } as React.CSSProperties}
      >
        <ScrollReveal>
          <div className="text-center" style={{ maxWidth: "700px", margin: "0 auto", padding: "clamp(50px, 8vh, 80px) 24px" }}>
            <h2 style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: "700",
              color: "#fff",
              textShadow: "0 2px 30px rgba(0,0,0,0.4)",
              letterSpacing: "-1px",
            }}>Ready to modernize dispatch?</h2>
            <p style={{
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              marginTop: "20px",
            }}>
              Start your free trial. Add drivers, connect your TMS, and let AI handle dispatch in 20 minutes.
            </p>
            <div style={{ display: "flex", gap: "clamp(12px, 2vw, 16px)", justifyContent: "center", marginTop: "clamp(20px, 4vh, 40px)", flexWrap: "wrap" }}>
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