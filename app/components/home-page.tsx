"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

const stats = [
  { value: "-25%", label: "Dispatcher workload", detail: "Fewer exception fire drills" },
  { value: "-20%", label: "Missed windows", detail: "Earlier risk detection" },
  { value: "-30%", label: "POD to invoice", detail: "Faster billing packets" },
  { value: "-33%", label: "Overnight churn", detail: "Clear approval ownership" },
];

const features = [
  {
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    title: "AI Command Center",
    desc: "Desktop web app that handles all dispatcher tasks. AI triages exceptions, proposes actions, and routes approvals. Real-time fleet visibility.",
  },
  {
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    title: "SMS Driver Comms",
    desc: "AI sends load updates, pickup instructions, and route changes via text message. Drivers respond with simple keywords. No app required.",
  },
  {
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    title: "6 AI Agents",
    desc: "Dispatch orchestrator, exception handler, capacity optimizer, billing readiness, compliance monitor, and communication agent. Running 24/7.",
  },
  {
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    title: "Approval Gates",
    desc: "Every cost-impacting and customer-facing decision goes through configurable approval workflows. AI proposes, humans decide.",
  },
];

const integrations = [
  { name: "TMS", items: "McLeod, Trimble, Turvo, Rose Rocket, Axon" },
  { name: "ELD + Telematics", items: "Samsara, Motive, Geotab, Omnitracs, Garmin" },
  { name: "Load Boards", items: "DAT, Truckstop, EDI 204/214/990" },
  { name: "Back Office", items: "QuickBooks, Sage, PCS, ERP" },
];

const workflow = [
  { num: "01", title: "Load Intake", desc: "Broker emails, EDI events, and customer portals consolidated into one AI queue." },
  { num: "02", title: "AI Assignment", desc: "Best-fit driver proposed using lane history, equipment, and real-time capacity." },
  { num: "03", title: "Exception Resolution", desc: "Delay alerts, reroutes, and detention handled autonomously or escalated to managers." },
  { num: "04", title: "Billing Handoff", desc: "POD packets, detention notes, and accessorial data assembled automatically." },
];

const painPoints = [
  "Load events arrive from too many disconnected systems",
  "Dispatch decisions drift across phone calls and group chats",
  "Exception context gets lost between shifts and team members",
  "POD and billing handoff creates days of avoidable delay",
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    const children = el.querySelectorAll(".reveal");
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export function HomePage() {
  const heroRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const workflowRef = useScrollReveal();
  const integrationsRef = useScrollReveal();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteNav />

      {/* ═══════════════════════════════════════ HERO ═══════════════════════════════════════ */}
      <section className="section-hero" ref={heroRef}>
        <div className="grid-12 items-center">
          {/* Left: Text */}
          <div className="col-span-5 max-lg:col-span-4">
            <div className="reveal eyebrow mb-6">Trucking dispatch, automated</div>
            <h1 className="display-hero reveal reveal-delay-1">
              Run dispatch
              <br />
              24/7.
            </h1>
            <p className="body-lg mt-8 max-w-lg text-[var(--text-secondary)] reveal reveal-delay-2">
              ServiceOps AI handles load intake, dispatch exceptions, driver communication, and
              POD-to-billing handoff. Your dispatch team focuses on growth, not fire drills.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 reveal reveal-delay-3">
              <Link href="/book-demo" className="btn btn-primary">
                Book a Demo
              </Link>
              <Link href="/solutions" className="btn btn-outline">
                See how it works
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 reveal reveal-delay-4">
              {["Built for trucking", "SMS-first comms", "Audit-ready"].map((t) => (
                <span key={t} className="small rounded-full border border-[var(--border)] px-4 py-2 text-[var(--text-secondary)]">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Large image */}
          <div className="col-span-7 max-lg:col-span-4 mt-12 lg:mt-0">
            <div className="reveal reveal-delay-2 relative">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80"
                alt="Professional truck driver on the road"
                className="img-hero"
                loading="eager"
              />
              {/* Overlay stat */}
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="small text-[var(--text-muted)]">Active fleet today</p>
                    <p className="heading-lg mt-1">247 drivers online</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                    <svg className="h-6 w-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ STATS ═══════════════════════════════════════ */}
      <section className="section" ref={statsRef}>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`stat-block reveal reveal-delay-${i + 1}`}>
              <div className="stat-value">{s.value}</div>
              <div className="heading-md mt-2">{s.label}</div>
              <p className="caption mt-1 text-[var(--text-muted)]">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ WHAT IS IT ═══════════════════════════════════════ */}
      <section className="section">
        <div className="grid-12 items-center">
          <div className="col-span-5 max-lg:col-span-4">
            <div className="reveal">
              <div className="eyebrow mb-4">What is ServiceOps AI</div>
              <h2 className="display-0">
                An AI-powered dispatch command center for trucking carriers.
              </h2>
            </div>
          </div>
          <div className="col-span-6 max-lg:col-span-4 ml-auto max-lg:ml-0 max-lg:mt-8">
            <div className="space-y-4 reveal reveal-delay-1">
              <p className="body-lg text-[var(--text-secondary)]">
                ServiceOps AI is a vertical agentic platform built specifically for trucking carriers
                running regional and cross-border freight operations across North America.
              </p>
              <p className="body-lg text-[var(--text-secondary)]">
                It connects to your TMS, ELD, and load boards. Six specialized AI agents handle
                routine dispatch decisions, exception triage, driver communication, and document
                processing around the clock.
              </p>
              <p className="body-lg text-[var(--text-secondary)]">
                High-impact decisions always go through human approval. Every action is logged
                and auditable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ LARGE IMAGE BREAK ═══════════════════════════════════════ */}
      <section className="scroll-parallax">
        <div className="max-w-[var(--page-max)] mx-auto px-[var(--page-margin)]">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)]" style={{ height: "clamp(400px, 50vw, 600px)" }}>
            <img
              src="https://images.unsplash.com/photo-1605745341112-85968b3e9154?w=1600&q=80"
              alt="Modern trucking operations and logistics"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
              <div className="max-w-2xl">
                <div className="eyebrow mb-3 text-white/80">The problem</div>
                <h2 className="display-1 text-white">
                  Carrier operations break in exception handoffs.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ PAIN POINTS ═══════════════════════════════════════ */}
      <section className="section">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {painPoints.map((p, i) => (
            <div key={p} className={`card reveal reveal-delay-${i + 1}`}>
              <p className="heading-md">{p}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ FEATURES ═══════════════════════════════════════ */}
      <section className="section" ref={featuresRef}>
        <div className="eyebrow mb-4 reveal">Products</div>
        <h2 className="display-0 mb-16 reveal reveal-delay-1">Two products, one platform.</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <div key={f.title} className={`card reveal reveal-delay-${Math.min(i + 1, 4)}`}>
              <div className="icon-circle mb-5">{f.icon}</div>
              <h3 className="heading-lg mb-3">{f.title}</h3>
              <p className="body-md text-[var(--text-secondary)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ SMS EXPLAINER ═══════════════════════════════════════ */}
      <section className="section">
        <div className="grid-12 items-center">
          <div className="col-span-6 max-lg:col-span-4">
            <div className="scroll-parallax relative overflow-hidden rounded-[var(--radius-lg)]">
              <img
                src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&q=80"
                alt="Truck driver using phone for dispatch updates"
                className="img-feature"
                loading="lazy"
              />
            </div>
          </div>
          <div className="col-span-5 max-lg:col-span-4 ml-auto max-lg:ml-0 max-lg:mt-8">
            <div className="reveal">
              <div className="eyebrow mb-4">Driver Communication</div>
              <h2 className="display-2 mb-6">
                Drivers don't need an app.
                <br />
                They need a text message.
              </h2>
              <p className="body-lg mb-6 text-[var(--text-secondary)]">
                Most truck drivers don't download apps for work. ServiceOps AI sends load updates,
                pickup instructions, route changes, and document requests via SMS. Drivers respond
                with simple keywords like "loaded", "unloaded", or "delay 45 min".
              </p>
              <p className="body-lg mb-8 text-[var(--text-secondary)]">
                The AI handles check-calls automatically, confirms POD details, and keeps dispatch
                informed in real time — all through standard text messaging.
              </p>
              <div className="flex flex-wrap gap-3">
                {["No app install needed", "Works on any phone", "AI-powered responses"].map((t) => (
                  <span key={t} className="small rounded-full border border-[var(--border)] px-4 py-2 text-[var(--text-secondary)]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ WORKFLOW ═══════════════════════════════════════ */}
      <section className="section" ref={workflowRef}>
        <div className="eyebrow mb-4 reveal">How it works</div>
        <h2 className="display-0 mb-16 reveal reveal-delay-1">Four steps to automated dispatch.</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {workflow.map((w, i) => (
            <div key={w.num} className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}>
              <div className="mb-4 text-6xl font-light text-[var(--accent)]/10" style={{ fontFamily: "var(--font-display)" }}>
                {w.num}
              </div>
              <h3 className="heading-lg mb-2">{w.title}</h3>
              <p className="body-md text-[var(--text-secondary)]">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ COMMAND CENTER PREVIEW ═══════════════════════════════════════ */}
      <section className="section">
        <div className="scroll-parallax">
          <div className="browser-frame">
            <div className="browser-bar">
              <div className="browser-dot bg-[var(--g-red)]" />
              <div className="browser-dot bg-[var(--g-yellow)]" />
              <div className="browser-dot bg-[var(--g-green)]" />
              <div className="ml-4 flex-1 rounded-full bg-[var(--g-grey-50)] px-4 py-1.5 text-center text-xs text-[var(--text-muted)]">
                app.serviceops.ai/command-center
              </div>
            </div>
            <div className="browser-content grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-[var(--g-grey-10)]" />
              ))}
              <div className="col-span-4 mt-2 h-40 rounded-lg bg-[var(--g-grey-10)]" />
            </div>
          </div>
        </div>
        <div className="mt-8 text-center reveal">
          <p className="body-lg text-[var(--text-secondary)]">
            The Command Center runs in your browser. No install. Real-time fleet visibility, AI-powered exception handling, and approval workflows.
          </p>
          <Link href="/control-tower" className="btn btn-outline mt-6">
            Open Command Center
          </Link>
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ INTEGRATIONS ═══════════════════════════════════════ */}
      <section className="section" ref={integrationsRef}>
        <div className="eyebrow mb-4 reveal">Integrations</div>
        <h2 className="display-0 mb-16 reveal reveal-delay-1">
          Connects to your entire trucking stack.
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((g, i) => (
            <div key={g.name} className={`card-flat reveal reveal-delay-${Math.min(i + 1, 4)}`}>
              <h3 className="heading-md mb-2">{g.name}</h3>
              <p className="caption text-[var(--text-muted)]">{g.items}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 reveal">
          <Link href="/integrations" className="btn btn-outline">
            View all integrations
          </Link>
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ DRIVER APP ═══════════════════════════════════════ */}
      <section className="section">
        <div className="grid-12 items-center">
          <div className="col-span-5 max-lg:col-span-4">
            <div className="reveal">
              <div className="eyebrow mb-4">For Drivers</div>
              <h2 className="display-2 mb-6">
                Free mobile app for drivers who want it.
              </h2>
              <p className="body-lg mb-6 text-[var(--text-secondary)]">
                Some drivers prefer a mobile experience. The ServiceOps AI driver app gives them
                load details, POD photo capture, GPS tracking, and direct AI chat — all free forever.
              </p>
              <div className="space-y-3">
                {["Current load management", "POD camera", "AI dispatcher chat", "GPS tracking", "Works offline"].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <svg className="h-5 w-5 shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="body-md">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/download" className="btn btn-primary mt-8">
                Download Free
              </Link>
            </div>
          </div>
          <div className="col-span-6 max-lg:col-span-4 ml-auto max-lg:ml-0 max-lg:mt-8">
            <div className="scroll-parallax flex justify-center">
              <div className="phone-frame">
                <div className="phone-screen p-5">
                  <div className="mb-4 text-center">
                    <p className="small text-[var(--text-muted)]">Good Morning</p>
                    <p className="heading-md">Dispatch Center</p>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                      <p className="text-2xl font-medium text-[var(--accent)]">12</p>
                      <p className="small text-[var(--text-muted)]">Active Loads</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                      <p className="text-2xl font-medium text-[var(--green)]">8</p>
                      <p className="small text-[var(--text-muted)]">Delivered</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--accent)]">LD-042</span>
                        <span className="rounded bg-[var(--green)]/10 px-2 py-0.5 text-xs font-medium text-[var(--green)]">In Transit</span>
                      </div>
                      <p className="small font-medium">Vancouver → Kelowna</p>
                      <p className="small text-[var(--text-muted)]">Raj Singh • $1,200</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-[var(--accent-soft)]" />
                        <span className="small font-medium">AI Dispatcher</span>
                      </div>
                      <p className="small text-[var(--text-muted)]">"Pickup confirmed. Proceed to dock 3."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ═══════════════════════════════════════ SECOND LARGE IMAGE ═══════════════════════════════════════ */}
      <section className="scroll-parallax">
        <div className="max-w-[var(--page-max)] mx-auto px-[var(--page-margin)]">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)]" style={{ height: "clamp(300px, 40vw, 500px)" }}>
            <img
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1600&q=80"
              alt="Fleet of trucks on highway at sunset"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 lg:p-12">
              <div className="max-w-xl">
                <div className="eyebrow mb-3 text-white/80">Built for North America</div>
                <h2 className="display-1 text-white">
                  Cross-border freight, handled intelligently.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ CTA ═══════════════════════════════════════ */}
      <section className="section-hero">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-0 reveal">
            Ready to modernize dispatch?
          </h2>
          <p className="body-lg mt-6 text-[var(--text-secondary)] reveal reveal-delay-1">
            Book a focused walkthrough. We map your current exception flow, approval model,
            and rollout path in one session.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center reveal reveal-delay-2">
            <Link href="/book-demo" className="btn btn-primary">Book Demo</Link>
            <Link href="/pricing" className="btn btn-outline">View pricing</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
