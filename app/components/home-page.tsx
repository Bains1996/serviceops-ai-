"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import { SiteFooter } from "./site-footer";

type WorkflowStep = {
  id: string;
  title: string;
  outcome: string;
  detail: string;
  events: string[];
};

type Module = {
  title: string;
  detail: string;
  status: string;
};

const workflowSteps: WorkflowStep[] = [
  {
    id: "intake",
    title: "Load Intake -> Assignment -> Dispatch",
    outcome: "Handle exceptions faster with fewer dispatch errors",
    detail:
      "ServiceOps AI consolidates broker emails, customer portals, and EDI events into one control queue, proposes driver or carrier assignment using lane history and constraints, then routes high-impact decisions into manager approval.",
    events: [
      "Load event merged from EDI + email",
      "Window risk and SLA class detected",
      "Best-fit assignment proposed",
      "Dispatcher confirms release",
    ],
  },
  {
    id: "exceptions",
    title: "In Transit -> Exception -> Approval",
    outcome: "Resolve reroutes and detention decisions with auditable approvals",
    detail:
      "Delay alerts, missed windows, and reroute requests are transformed into structured decisions with ETA impact, SLA risk, and cost exposure before customer-facing commitments are sent.",
    events: [
      "Delay signal detected from telematics or check calls",
      "AI proposes reroute or recovery action",
      "Detention and SLA impact estimated",
      "Manager approval captured before final change",
    ],
  },
  {
    id: "billing",
    title: "POD Complete -> Docs -> Billing Handoff",
    outcome: "Move from POD to invoice faster with less back-office rework",
    detail:
      "POD packets, detention notes, and accessorial data are assembled automatically while billing exceptions remain gated for human review and auditability.",
    events: [
      "POD and documents ingested",
      "Missing fields flagged and requested",
      "Billing packet generated",
      "Audit timeline finalized",
    ],
  },
];

const modules: Module[] = [
  {
    title: "Dispatch Exception Copilot",
    detail: "Prioritizes delay, reroute, and missed-window events by SLA impact and financial exposure.",
    status: "Live exception triage",
  },
  {
    title: "Lane and Capacity Optimizer",
    detail: "Balances route windows, capacity limits, and driver availability across active loads.",
    status: "Constraint-aware dispatch",
  },
  {
    title: "Dispatch and Driver Timeline",
    detail: "Unifies messages, ETA updates, and decision context in one operational timeline.",
    status: "Communication traceability",
  },
  {
    title: "Approval Inbox",
    detail: "Applies policy gates for reroutes, detention approvals, and customer-impacting changes.",
    status: "Approval-required thresholds",
  },
  {
    title: "POD and Doc Extractor",
    detail: "Extracts proof of delivery details and identifies missing billing fields before handoff.",
    status: "Billing readiness automation",
  },
  {
    title: "Audit Trail",
    detail: "Complete timeline for every proposal, approval, override, and customer communication.",
    status: "Immutable operational log",
  },
];

const stats = [
  { label: "Dispatcher manual workload", value: "-25%", note: "fewer exception fire drills" },
  { label: "Missed pickup or delivery windows", value: "-20%", note: "earlier risk detection and escalation" },
  { label: "POD to invoice cycle", value: "-30%", note: "faster billing packet completion" },
  { label: "Overnight operational churn", value: "-33%", note: "clear approval ownership" },
];

const trustItems = [
  "Approval-first AI",
  "Role-based controls",
  "Explainable decisions",
  "Full audit logging",
  "Safe automations",
];

const testimonials = [
  {
    quote:
      "We stopped running exceptions through phone chaos. Dispatch now approves recommended actions instead of rebuilding plans all day.",
    name: "Operations Director",
    company: "PrairieLink Carriers",
  },
  {
    quote:
      "Our billing team gets cleaner POD packets and fewer missing fields. Cash cycle speed improved without adding headcount.",
    name: "General Manager",
    company: "Northline Transport Group",
  },
];

function ThemeToggle({ onToggle, isDark }: { onToggle: () => void; isDark: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="chip inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs tracking-[0.14em] text-subtle uppercase transition hover:text-[var(--text-primary)]"
      aria-label="Toggle color theme"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
      {isDark ? "Dark Interface" : "Light Interface"}
    </button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-xs uppercase tracking-[0.18em] text-subtle">{eyebrow}</p>
      <h2 className="display-type text-3xl leading-tight text-[var(--text-primary)] md:text-5xl">{title}</h2>
      <p className="max-w-2xl text-base leading-7 text-subtle md:text-lg">{description}</p>
    </div>
  );
}

function HeroBoard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="section-frame relative overflow-hidden rounded-3xl p-4 md:p-6"
    >
      <div className="grid-overlay absolute inset-0 opacity-40" />
      <div className="relative z-10 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <div className="section-frame rounded-2xl bg-[rgba(7,17,15,0.66)] p-4">
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-subtle">
            <span>Dispatch control board</span>
            <span>14 active jobs</span>
          </div>
          <div className="space-y-2">
            {[
              ["Load 8832 Vancouver -> Calgary", "Window risk", "AB Corridor"],
              ["Load 8871 Winnipeg -> Chicago", "Detention pending", "Cross-border"],
              ["Load 8898 Edmonton -> Seattle", "Reroute proposed", "Pacific lane"],
            ].map((row) => (
              <div key={row[0]} className="grid grid-cols-[1.2fr_0.8fr_0.7fr] gap-2 rounded-xl border border-[var(--line)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-sm text-subtle">
                <span className="text-[var(--text-primary)]">{row[0]}</span>
                <span>{row[1]}</span>
                <span>{row[2]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="section-frame rounded-2xl bg-[rgba(7,17,15,0.72)] p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.12em] text-subtle">Approval panel</p>
            <div className="space-y-2 text-sm">
              <div className="rounded-lg border border-[var(--line)] px-3 py-2">
                <p className="text-[var(--text-primary)]">Reroute authorization: CAD 1,320</p>
                <p className="text-subtle">Awaiting manager review</p>
              </div>
              <div className="rounded-lg border border-[var(--line)] px-3 py-2">
                <p className="text-[var(--text-primary)]">Detention claim: Load #8871</p>
                <p className="text-subtle">AI confidence: 93%</p>
              </div>
            </div>
          </div>

          <div className="section-frame rounded-2xl bg-[rgba(7,17,15,0.72)] p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.12em] text-subtle">Risk indicator</p>
            <div className="rounded-full border border-[var(--line)] p-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-300 via-[var(--accent)] to-amber-300" />
            </div>
            <p className="mt-3 text-sm text-subtle">
              Low-risk updates auto-progress while SLA and cost-impacting actions remain gated.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HomePage() {
  const [activeFlow, setActiveFlow] = useState<WorkflowStep["id"]>("intake");
  const [isDark, setIsDark] = useState(true);

  const activeStep = useMemo(
    () => workflowSteps.find((step) => step.id === activeFlow) ?? workflowSteps[0],
    [activeFlow],
  );

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-500"
    >
      {/* Animated Particles */}
      <div className="particle-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <header className="hero-atmosphere relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 md:px-8 md:pb-24 md:pt-8">
          <nav className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.02)] text-sm font-semibold text-[var(--accent)]">
                SO
              </span>
              <div>
                <p className="text-sm tracking-[0.16em] text-subtle uppercase">ServiceOps AI</p>
                <p className="text-xs text-subtle">Trucking Carriers | Canada to North America</p>
              </div>
            </div>
            <div className="hidden items-center gap-6 text-xs uppercase tracking-[0.14em] text-subtle md:flex">
              <Link href="/solutions" className="transition hover:text-[var(--text-primary)]">
                Solutions
              </Link>
              <Link href="/integrations" className="transition hover:text-[var(--text-primary)]">
                Integrations
              </Link>
              <Link href="/modules" className="transition hover:text-[var(--text-primary)]">
                Modules
              </Link>
              <Link href="/case-studies" className="transition hover:text-[var(--text-primary)]">
                Case Studies
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/download"
                className="hidden items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] transition hover:bg-[rgba(255,255,255,0.04)] md:inline-flex"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download App
              </Link>
              <ThemeToggle onToggle={() => setIsDark((prev) => !prev)} isDark={isDark} />
              <Link
                href="/book-demo"
                className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#022f27] transition hover:bg-[var(--accent-strong)]"
              >
                Book Demo
              </Link>
            </div>
          </nav>

          <div className="mb-8 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-subtle md:hidden">
            <Link href="/solutions" className="transition hover:text-[var(--text-primary)]">
              Solutions
            </Link>
            <Link href="/integrations" className="transition hover:text-[var(--text-primary)]">
              Integrations
            </Link>
            <Link href="/modules" className="transition hover:text-[var(--text-primary)]">
              Modules
            </Link>
            <Link href="/case-studies" className="transition hover:text-[var(--text-primary)]">
              Case Studies
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-8">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="chip inline-flex rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] text-subtle"
              >
                24/7 dispatch agent for carrier operations
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="display-type max-w-3xl text-4xl leading-[1.05] md:text-6xl"
              >
                Run dispatch 24/7, resolve exceptions faster, and keep every critical action reviewable.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="max-w-2xl text-lg leading-8 text-subtle"
              >
                ServiceOps AI is a vertical agentic platform for trucking carriers. It handles load intake, dispatch exceptions, POD-to-billing handoff, and approval workflows while humans control high-impact decisions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/book-demo"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#062a24] transition hover:bg-[var(--accent-strong)]"
                >
                  Book Demo
                </Link>
                <Link
                  href="/solutions"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[rgba(255,255,255,0.04)]"
                >
                  See ServiceOps in Action
                </Link>
              </motion.div>

              <div className="grid gap-2 pt-4 sm:grid-cols-3">
                {[
                  "Built for trucking carriers",
                  "Approval-based workflows",
                  "Audit-ready action history",
                ].map((item) => (
                  <div key={item} className="chip rounded-full px-4 py-2 text-xs tracking-[0.12em] text-subtle uppercase">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <HeroBoard />
          </div>
        </div>
      </header>

      <main className="space-y-28 px-5 py-20 md:px-8 md:py-24">
        <section className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="section-frame rounded-2xl p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.16em] text-subtle">Who this is for</p>
              <h3 className="display-type mt-3 text-2xl md:text-3xl">Trucking carriers and transport operators.</h3>
              <p className="mt-4 text-sm leading-7 text-subtle md:text-base">
                ServiceOps AI is built for owners, operations managers, dispatch leads,
                and back-office teams running regional and cross-border freight operations.
              </p>
            </article>
            <article className="section-frame rounded-2xl p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.16em] text-subtle">What this is not</p>
              <h3 className="display-type mt-3 text-2xl md:text-3xl">Not generic telematics or another TMS clone.</h3>
              <p className="mt-4 text-sm leading-7 text-subtle md:text-base">
                It is not a generic AI chatbot. It is an approval-first operational AI system
                for exception handling, dispatch decisions, document processing, and billing readiness.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-10">
          <SectionHeading
            eyebrow="Operational Reality"
            title="Carrier operations break in exception handoffs."
            description="Load events arrive from EDI, email, and customer portals. Dispatchers juggle ETAs, capacity, and SLA risk. Operations teams lose time in status churn. Billing waits on incomplete POD packets. Revenue slows in the gaps."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Load events enter from too many systems",
              "Dispatch decisions drift across calls and chats",
              "Exception context is inconsistent across shifts",
              "POD and billing handoff create avoidable delay",
            ].map((problem) => (
              <article key={problem} className="section-frame rounded-2xl p-6">
                <p className="text-lg leading-7">{problem}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionHeading
            eyebrow="Product Workflow"
            title="Three connected workflows, one controlled carrier control loop."
            description="Each flow is built for operational speed with policy-aware safeguards. AI proposes, business rules verify, humans approve critical actions."
          />
          <div className="section-frame rounded-3xl p-5 md:p-7">
            <div className="mb-5 flex flex-wrap gap-2">
              {workflowSteps.map((step) => (
                <button
                  type="button"
                  key={step.id}
                  onClick={() => setActiveFlow(step.id)}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition ${
                    activeFlow === step.id
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                      : "border-[var(--line)] text-subtle hover:text-[var(--text-primary)]"
                  }`}
                >
                  {step.title}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                <h3 className="display-type text-2xl leading-tight md:text-3xl">{activeStep.outcome}</h3>
                <p className="text-base leading-7 text-subtle">{activeStep.detail}</p>
                <div className="space-y-2">
                  {activeStep.events.map((event, index) => (
                    <div key={event} className="flex items-center gap-3 rounded-xl border border-[var(--line)] px-4 py-3 text-sm">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-xs text-subtle">
                        {index + 1}
                      </span>
                      <span>{event}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Why It Works"
            title="Automation with guardrails, not autonomous customer risk."
            description="ServiceOps AI runs repetitive operations at machine speed while preserving governance. High-impact dispatch and cost decisions remain explicit, reviewable, and accountable."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["AI proposes actions", "Dispatch edits, reroutes, and doc-to-billing handoffs."],
              ["Rules validate each step", "SLA windows, detention rules, cost thresholds, and policy gates."],
              ["Humans approve critical changes", "Customer-impacting and cost-impacting decisions stay gated."],
              ["Every action is logged", "Full trace from suggestion to final approval."],
            ].map(([title, detail]) => (
              <article key={title} className="section-frame rounded-2xl p-6">
                <h4 className="mb-2 text-lg">{title}</h4>
                <p className="text-sm leading-6 text-subtle">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Product Modules"
            title="A complete operating layer for dispatch and freight execution."
            description="Purpose-built modules connect operational data, team actions, and policy controls so work moves faster without losing oversight."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <article key={module.title} className="section-frame rounded-2xl p-6">
                <p className="mb-2 text-xs uppercase tracking-[0.14em] text-subtle">{module.status}</p>
                <h4 className="mb-3 text-xl">{module.title}</h4>
                <p className="text-sm leading-6 text-subtle">{module.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="System Connectivity"
            title="One-time integration into your trucking stack, then real-time 24/7 operations."
            description="Connect TMS, ELD, telematics, load feeds, and billing tools once. ServiceOps AI keeps driver and load records synchronized and responds to live events continuously."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["TMS Platforms", "McLeod, Trimble TMW, Turvo, Rose Rocket, Axon"],
              ["ELD + Telematics", "Samsara, Motive, Geotab, Omnitracs, Garmin"],
              ["Load Feeds", "DAT, Truckstop, EDI 204/214/990, broker APIs"],
              ["Back Office", "QuickBooks, Sage, PCS, ERP exports and webhooks"],
            ].map(([title, detail]) => (
              <article key={title} className="section-frame rounded-2xl p-6">
                <h4 className="text-lg">{title}</h4>
                <p className="mt-2 text-sm leading-6 text-subtle">{detail}</p>
              </article>
            ))}
          </div>
          <div>
            <Link
              href="/integrations"
              className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[rgba(255,255,255,0.04)]"
            >
              View Integration Options
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Measured Impact"
            title="Outcomes operators care about each week."
            description="Designed around the operational metrics that determine margin, service reliability, and cash flow in carrier businesses."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label} className="section-frame rounded-2xl p-6">
                <p className="text-sm text-subtle">{item.label}</p>
                <p className="my-3 text-4xl font-semibold text-[var(--accent)]">{item.value}</p>
                <p className="text-sm leading-6 text-subtle">{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-frame rounded-3xl p-7 md:p-9">
            <SectionHeading
              eyebrow="Trust and Governance"
              title="Every critical action stays reviewable and auditable."
              description="Approval-first controls are built into the workflow: role-based permissions, configurable approval gates, explainable recommendations, and immutable audit timelines."
            />
          </div>
          <div className="section-frame rounded-3xl p-7 md:p-9">
            <ul className="space-y-3 text-sm">
              {trustItems.map((item) => (
                <li key={item} className="rounded-lg border border-[var(--line)] px-4 py-3 text-subtle">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-8">
          <SectionHeading
            eyebrow="Proof Layer"
            title="Built to showcase operational proof, not vanity metrics."
            description="Use this section for customer logos, deployment snapshots, and role-specific results once pilots are complete."
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {testimonials.map((entry) => (
              <figure key={entry.company} className="section-frame rounded-2xl p-7">
                <blockquote className="text-lg leading-8">"{entry.quote}"</blockquote>
                <figcaption className="mt-6 text-sm text-subtle">
                  {entry.name} · {entry.company}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Download Section */}
        <section className="mx-auto max-w-7xl">
          <div className="section-frame relative overflow-hidden rounded-3xl p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-[var(--accent-purple)]/10" />
            <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.16em] text-subtle">Download the App</p>
                <h2 className="display-type text-3xl leading-tight md:text-5xl">
                  Dispatch from anywhere. <span className="gradient-text">On desktop or mobile.</span>
                </h2>
                <p className="max-w-lg text-base leading-7 text-subtle">
                  The Command Center runs in your browser — no install needed. 
                  Drivers get the mobile app for load management, POD photos, and AI-powered communication.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/download"
                    className="btn-primary inline-flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download for Android
                  </Link>
                  <Link
                    href="/download"
                    className="btn-secondary inline-flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    Download for iOS
                  </Link>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-subtle">Free for drivers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-subtle">Works offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-subtle">POD camera</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                {/* Phone Mockup */}
                <div className="mx-auto w-64 rounded-[2.5rem] border-4 border-[var(--surface-glass-border)] bg-[var(--bg-elevated)] p-2 shadow-2xl">
                  <div className="rounded-[2rem] bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-purple)]/20 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">9:41</span>
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                        <div className="h-2 w-2 rounded-full bg-[var(--accent)]/50" />
                        <div className="h-2 w-2 rounded-full bg-[var(--accent)]/30" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="glass-card p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[var(--accent)]/20" />
                          <div className="h-2 w-20 rounded bg-[var(--text-primary)]/20" />
                        </div>
                        <div className="h-2 w-32 rounded bg-[var(--accent)]/30" />
                      </div>
                      <div className="glass-card p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[var(--accent-purple)]/20" />
                          <div className="h-2 w-24 rounded bg-[var(--text-primary)]/20" />
                        </div>
                        <div className="h-2 w-28 rounded bg-[var(--accent-purple)]/30" />
                      </div>
                      <div className="glass-card p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[var(--accent-amber)]/20" />
                          <div className="h-2 w-16 rounded bg-[var(--text-primary)]/20" />
                        </div>
                        <div className="h-2 w-36 rounded bg-[var(--accent-amber)]/30" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -right-4 top-8 float glass-card px-3 py-2 text-xs font-semibold text-[var(--accent)]">
                  AI Online
                </div>
                <div className="absolute -left-4 bottom-12 float glass-card px-3 py-2 text-xs font-semibold text-[var(--accent-emerald)]" style={{ animationDelay: '1s' }}>
                  GPS Active
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="final-cta" className="mx-auto max-w-7xl">
          <div className="section-frame rounded-3xl p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.16em] text-subtle">Ready to modernize operations</p>
                <h2 className="display-type text-3xl leading-tight md:text-5xl">
                  See ServiceOps AI running on your dispatch and billing workflow.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-subtle">
                  Book a focused walkthrough for carrier operators. We map your current exception flow, approval model, and rollout path in one session.
                </p>
              </div>
              <Link
                href="/book-demo"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-[#032d26] transition hover:bg-[var(--accent-strong)]"
              >
                Book Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
