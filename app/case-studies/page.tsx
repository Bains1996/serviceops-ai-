import Link from "next/link";

import { SitePage } from "../components/site-page";

const studies = [
  {
    company: "PrairieLink Carriers",
    fleet: "120 trucks",
    result: "Reduced exception handling time by 29% within 8 weeks.",
    detail:
      "Unified cross-shift dispatch context and moved high-cost reroutes into approval gates.",
  },
  {
    company: "Northline Transport Group",
    fleet: "80 trucks",
    result: "Improved POD-to-invoice cycle by 34%.",
    detail:
      "Automated document checks flagged missing billing fields before finance handoff.",
  },
  {
    company: "Maple Freight Systems",
    fleet: "210 trucks",
    result: "Cut missed delivery windows by 21%.",
    detail:
      "Early risk detection and policy-aware dispatch escalation reduced avoidable SLA breaches.",
  },
];

export default function CaseStudiesPage() {
  return (
    <SitePage
      eyebrow="Case Studies"
      title="Operational proof from carrier teams managing real lane volatility."
      description="This page is designed to present measurable outcomes that matter to operations leadership, dispatch managers, and finance teams."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {studies.map((item) => (
          <article key={item.company} className="section-frame rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-subtle">{item.fleet}</p>
            <h2 className="mt-2 text-xl font-semibold">{item.company}</h2>
            <p className="mt-3 text-lg text-[var(--accent)]">{item.result}</p>
            <p className="mt-3 text-sm leading-7 text-subtle">{item.detail}</p>
          </article>
        ))}
      </div>

      <article className="section-frame rounded-3xl p-6 md:p-8">
        <h3 className="display-type text-3xl leading-tight md:text-4xl">Ready to run a pilot with measurable KPIs?</h3>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-subtle md:text-base">
          We run a focused pilot on dispatch exceptions and billing handoff, then measure impact on workload,
          missed windows, and document cycle time.
        </p>
        <div className="mt-6">
          <Link href="/book-demo" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#032d26]">
            Start Pilot Discussion
          </Link>
        </div>
      </article>
    </SitePage>
  );
}
