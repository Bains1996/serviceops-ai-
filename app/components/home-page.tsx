"use client";

import Link from "next/link";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

const stats = [
  { label: "Dispatcher workload", value: "-25%", detail: "Fewer exception fire drills" },
  { label: "Missed windows", value: "-20%", detail: "Earlier risk detection" },
  { label: "POD to invoice", value: "-30%", detail: "Faster billing packets" },
  { label: "Overnight churn", value: "-33%", detail: "Clear approval ownership" },
];

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Command Center",
    desc: "Real-time dispatch dashboard running in your browser. Track drivers, loads, and exceptions as they happen.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Driver App",
    desc: "Native mobile app for drivers. Load info, POD photos, GPS tracking, and AI-powered communication.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "AI Agents",
    desc: "Six specialized AI agents handle dispatch orchestration, exception triage, capacity optimization, and billing readiness 24/7.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Approval Gates",
    desc: "Every high-impact decision goes through configurable approval workflows. AI proposes, humans approve.",
  },
];

const integrations = [
  { name: "TMS", examples: "McLeod, Trimble, Turvo, Rose Rocket" },
  { name: "ELD", examples: "Samsara, Motive, Geotab" },
  { name: "Load Boards", examples: "DAT, Truckstop, EDI" },
  { name: "Back Office", examples: "QuickBooks, Sage, ERP" },
];

const workflows = [
  {
    step: "01",
    title: "Load Intake",
    desc: "Broker emails, EDI events, and customer portals consolidated into one queue.",
  },
  {
    step: "02",
    title: "AI Assignment",
    desc: "Best-fit driver or carrier proposed using lane history, capacity, and constraints.",
  },
  {
    step: "03",
    title: "Exception Handling",
    desc: "Delay alerts, reroutes, and detention decisions resolved with ETA impact analysis.",
  },
  {
    step: "04",
    title: "Billing Handoff",
    desc: "POD packets, detention notes, and accessorial data assembled automatically.",
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-24 pb-32 md:px-8 md:pt-32 md:pb-40">
          <div className="max-w-3xl">
            <div className="chip-accent chip mb-8">Trucking dispatch, automated</div>
            <h1 className="display-type text-5xl leading-[1.08] md:text-7xl">
              Run dispatch 24/7.
              <br />
              Resolve exceptions faster.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
              ServiceOps AI handles load intake, dispatch exceptions, POD-to-billing handoff, and
              approval workflows. Humans control high-impact decisions.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/book-demo" className="btn-primary">
                Book a Demo
              </Link>
              <Link href="/solutions" className="btn-secondary">
                See how it works
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {["Built for trucking", "Approval-first", "Audit-ready"].map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[var(--accent)]/[0.04] to-transparent blur-3xl" />
      </section>

      <div className="divider" />

      {/* Stats */}
      <section className="section">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-block">
              <div className="stat-value text-[var(--accent)]">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* What is it */}
      <section className="section">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--accent)]">What is ServiceOps AI</p>
            <h2 className="display-type text-3xl md:text-4xl">
              An AI-powered dispatch command center for trucking carriers.
            </h2>
          </div>
          <div className="space-y-4 text-[var(--text-secondary)] leading-7">
            <p>
              ServiceOps AI is a vertical agentic platform built specifically for trucking carriers
              running regional and cross-border freight operations.
            </p>
            <p>
              It connects to your TMS, ELD, and load boards. AI agents handle routine dispatch
              decisions, exception triage, and document processing around the clock.
            </p>
            <p>
              High-impact decisions always go through human approval. Every action is logged
              and auditable.
            </p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Features */}
      <section className="section">
        <p className="mb-3 text-sm font-medium text-[var(--accent)]">Products</p>
        <h2 className="display-type mb-16 text-3xl md:text-4xl">Two products, one platform.</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card">
              <div className="feature-icon bg-[var(--accent-soft)] text-[var(--accent)]">{f.icon}</div>
              <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
              <p className="text-[var(--text-secondary)] leading-6">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* How it works */}
      <section className="section">
        <p className="mb-3 text-sm font-medium text-[var(--accent)]">How it works</p>
        <h2 className="display-type mb-16 text-3xl md:text-4xl">Four steps to automated dispatch.</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {workflows.map((w) => (
            <div key={w.step}>
              <div className="mb-4 text-5xl font-bold text-[var(--accent)]/[0.12] font-[family-name:var(--font-fraunces)]">
                {w.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{w.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-6">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Integrations */}
      <section className="section">
        <p className="mb-3 text-sm font-medium text-[var(--accent)]">Integrations</p>
        <h2 className="display-type mb-16 text-3xl md:text-4xl">
          Connects to your existing trucking stack.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((i) => (
            <div key={i.name} className="card-flat p-6">
              <h3 className="mb-1 font-semibold">{i.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{i.examples}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/integrations" className="btn-secondary btn-sm">
            View all integrations
          </Link>
        </div>
      </section>

      <div className="divider" />

      {/* CTA */}
      <section className="section-lg">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-type text-3xl md:text-5xl">
            Ready to modernize dispatch?
          </h2>
          <p className="mt-6 text-lg text-[var(--text-secondary)]">
            Book a focused walkthrough. We map your current exception flow, approval model,
            and rollout path in one session.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/book-demo" className="btn-primary">
              Book Demo
            </Link>
            <Link href="/pricing" className="btn-secondary">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
