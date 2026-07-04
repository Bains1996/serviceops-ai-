import Link from "next/link";

import { SitePage } from "../components/site-page";

const solutions = [
  {
    title: "Dispatch Exception Resolution",
    detail:
      "Triage lane risk, missed windows, and reroute options from one control queue with policy-aware escalation.",
  },
  {
    title: "Approval-Based Operational Decisions",
    detail:
      "Keep reroutes, detention approvals, and customer-impacting changes gated to manager sign-off.",
  },
  {
    title: "POD to Billing Acceleration",
    detail:
      "Track missing POD fields, complete billing packets faster, and reduce back-office rework.",
  },
];

export default function SolutionsPage() {
  return (
    <SitePage
      eyebrow="Solutions"
      title="Operational AI workflows for carrier teams under real constraints."
      description="ServiceOps AI focuses on dispatch exceptions, approval control, and billing handoff speed for trucking carriers operating across Canada and North America."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {solutions.map((item) => (
          <article key={item.title} className="section-frame rounded-2xl p-6">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-subtle">{item.detail}</p>
          </article>
        ))}
      </div>

      <article className="section-frame rounded-3xl p-6 md:p-8">
        <h3 className="display-type text-3xl leading-tight md:text-4xl">How teams use this in daily operations</h3>
        <ol className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          <li className="rounded-xl border border-[var(--line)] p-4">1. Load events arrive from EDI, email, and customer portals.</li>
          <li className="rounded-xl border border-[var(--line)] p-4">2. AI flags lane risk and recommends recovery actions.</li>
          <li className="rounded-xl border border-[var(--line)] p-4">3. Managers approve cost-impacting decisions.</li>
          <li className="rounded-xl border border-[var(--line)] p-4">4. Dispatch executes and customer updates are logged.</li>
          <li className="rounded-xl border border-[var(--line)] p-4">5. POD docs are validated for billing readiness.</li>
          <li className="rounded-xl border border-[var(--line)] p-4">6. Finance receives a cleaner packet faster.</li>
        </ol>
        <div className="mt-6">
          <Link href="/book-demo" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#032d26]">
            Book Demo
          </Link>
        </div>
      </article>

      <article className="section-frame rounded-3xl p-6 md:p-8">
        <h3 className="display-type text-3xl leading-tight md:text-4xl">Connect with your current trucking systems</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-subtle">
          Integrate once and keep your records synced: drivers, equipment, active loads, status updates, and new load events from USA and Canada operations.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--line)] p-4 text-sm">TMS and dispatch tools: McLeod, Trimble TMW, Turvo, Rose Rocket, Axon.</div>
          <div className="rounded-xl border border-[var(--line)] p-4 text-sm">ELD and telematics: Samsara, Motive, Geotab, Omnitracs, Garmin.</div>
          <div className="rounded-xl border border-[var(--line)] p-4 text-sm">Load feeds: DAT, Truckstop, EDI 204/214/990, broker APIs.</div>
          <div className="rounded-xl border border-[var(--line)] p-4 text-sm">Accounting/back office: QuickBooks, Sage, PCS, ERP and webhook exports.</div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/integrations" className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold">
            See Integrations
          </Link>
          <Link href="/book-demo" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#032d26]">
            Start Integration Pilot
          </Link>
        </div>
      </article>
    </SitePage>
  );
}
