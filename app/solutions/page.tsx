"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

const solutions = [
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    title: "Dispatch Automation",
    description: "AI assigns loads to drivers based on equipment, proximity, HOS, and lane history. You approve with one click.",
    features: ["Auto-score loads", "Equipment matching", "HOS-aware assignments", "Backhaul optimization"],
    color: "var(--accent)",
  },
  {
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    title: "Exception Handling",
    description: "AI detects delays, breakdowns, and missed windows. Automatically finds alternatives and notifies customers.",
    features: ["Real-time monitoring", "Auto-rerouting", "Customer notifications", "Cost impact analysis"],
    color: "var(--yellow)",
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Rate Intelligence",
    description: "AI analyzes market rates, lane history, and your cost structure to negotiate the best rates with brokers.",
    features: ["Market rate data", "Lane analysis", "Profitability scoring", "Negotiation scripts"],
    color: "var(--green)",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Compliance Monitoring",
    description: "Track HOS, ELD, insurance, and licensing. AI alerts before violations happen, not after.",
    features: ["HOS tracking", "ELD integration", "License monitoring", "Insurance alerts"],
    color: "var(--red)",
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    title: "Driver Communication",
    description: "SMS-first communication. Drivers text in, AI processes, dispatcher approves. No app needed.",
    features: ["Two-way SMS", "Auto-categorization", "Quick replies", "Message history"],
    color: "var(--accent)",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Analytics & Reporting",
    description: "Real-time dashboards with fleet utilization, revenue per truck, on-time rates, and cost analysis.",
    features: ["Fleet utilization", "Revenue tracking", "On-time metrics", "Cost analysis"],
    color: "var(--accent)",
  },
];

export default function SolutionsPage() {
  return (
    <>
      <SiteNav />
      <main style={{ paddingTop: "var(--nav-height)", minHeight: "100vh" }}>
        {/* Header */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin) var(--space-2xl)", maxWidth: "var(--page-max)", margin: "0 auto", textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "16px" }}>Solutions</p>
          <h1 className="display-1">Everything your dispatch team needs</h1>
          <p className="body-lg" style={{ marginTop: "16px", color: "var(--text-secondary)", maxWidth: "560px", margin: "16px auto 0" }}>
            One platform. Six AI agents. Real-time SMS. $49/truck/month.
          </p>
        </section>

        {/* Solutions Grid */}
        <section style={{ padding: "0 var(--page-margin) var(--space-4xl)", maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {solutions.map((solution) => (
              <div key={solution.title} className="section-frame" style={{ padding: "32px", transition: "all 0.3s var(--ease-out-expo)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${solution.color}11`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={solution.color} strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d={solution.icon} />
                  </svg>
                </div>
                <h2 className="heading-lg" style={{ marginBottom: "12px" }}>{solution.title}</h2>
                <p className="body-md" style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>{solution.description}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {solution.features.map((feature) => (
                    <div key={feature} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={solution.color} strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="body-md" style={{ color: "var(--text-secondary)" }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin)", textAlign: "center", background: "var(--grey-10)" }}>
          <h2 className="display-2">Ready to automate dispatch?</h2>
          <p className="body-lg" style={{ marginTop: "12px", color: "var(--text-secondary)", maxWidth: "480px", margin: "12px auto 0" }}>
            30-day free trial. $49/truck/month after. No credit card required.
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
