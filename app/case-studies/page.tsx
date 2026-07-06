"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

const caseStudies = [
  {
    company: "Pacific Freight Lines",
    location: "Surrey, BC",
    fleet: "12 trucks",
    result: "$2,400/month saved",
    quote: "ServiceOps AI replaced our full-time dispatcher. The AI handles 80% of assignments automatically, and we just approve the rest.",
    author: "Harpreet Singh, Operations Manager",
    metrics: { loadsPerDay: 18, onTimeRate: "94%", costPerMile: "$2.12" },
  },
  {
    company: "Mountain Valley Transport",
    location: "Kamloops, BC",
    fleet: "8 trucks",
    result: "3x more loads per day",
    quote: "We were doing 6 loads/day manually. ServiceOps AI pushed us to 18 loads/day with the same number of trucks. The AI finds backhaul loads we'd never have found.",
    author: "Mike Chen, Owner",
    metrics: { loadsPerDay: 18, onTimeRate: "91%", costPerMile: "$1.98" },
  },
  {
    company: "Coastal Logistics",
    location: "Vancouver, BC",
    fleet: "24 trucks",
    result: "94% on-time delivery",
    quote: "The exception handling alone is worth $49/truck. When a driver breaks down, the AI immediately finds a replacement and notifies the customer. Zero manual intervention.",
    author: "Sarah Patel, Fleet Director",
    metrics: { loadsPerDay: 35, onTimeRate: "94%", costPerMile: "$2.05" },
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <SiteNav />
      <main style={{ paddingTop: "var(--nav-height)", minHeight: "100vh" }}>
        {/* Header */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin) var(--space-2xl)", maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <p className="eyebrow" style={{ marginBottom: "16px" }}>Customer Stories</p>
          <h1 className="display-1">Real results from BC carriers</h1>
          <p className="body-lg" style={{ marginTop: "16px", color: "var(--text-secondary)", maxWidth: "560px" }}>
            See how Lower Mainland transport companies are saving $2,000+/month with autonomous dispatch AI.
          </p>
        </section>

        {/* Case Studies */}
        <section style={{ padding: "0 var(--page-margin) var(--space-4xl)", maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {caseStudies.map((study) => (
              <div key={study.company} className="section-frame" style={{ padding: "40px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="heading-lg">{study.company}</h2>
                        <p className="small" style={{ color: "var(--text-muted)" }}>{study.location} &bull; {study.fleet}</p>
                      </div>
                    </div>
                    <p className="display-3" style={{ color: "var(--green)", marginBottom: "16px" }}>{study.result}</p>
                    <blockquote style={{ fontSize: "16px", lineHeight: "1.6", color: "var(--text-secondary)", borderLeft: "3px solid var(--accent)", paddingLeft: "16px", fontStyle: "italic" }}>
                      &ldquo;{study.quote}&rdquo;
                    </blockquote>
                    <p className="small" style={{ marginTop: "12px", color: "var(--text-muted)" }}>&mdash; {study.author}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ padding: "24px", borderRadius: "16px", background: "var(--grey-10)" }}>
                      <p className="small" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>Key Metrics</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                          <p className="display-3" style={{ color: "var(--accent)" }}>{study.metrics.loadsPerDay}</p>
                          <p className="small" style={{ color: "var(--text-muted)" }}>Loads/day</p>
                        </div>
                        <div>
                          <p className="display-3" style={{ color: "var(--green)" }}>{study.metrics.onTimeRate}</p>
                          <p className="small" style={{ color: "var(--text-muted)" }}>On-time rate</p>
                        </div>
                        <div>
                          <p className="display-3" style={{ color: "var(--accent)" }}>{study.metrics.costPerMile}</p>
                          <p className="small" style={{ color: "var(--text-muted)" }}>Cost/mile</p>
                        </div>
                        <div>
                          <p className="display-3" style={{ color: "var(--green)" }}>{study.fleet}</p>
                          <p className="small" style={{ color: "var(--text-muted)" }}>Fleet size</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "var(--space-4xl) var(--page-margin)", textAlign: "center", background: "var(--grey-10)" }}>
          <h2 className="display-2">Join these carriers</h2>
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
