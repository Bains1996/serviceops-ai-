import { SitePage } from "../components/site-page";

const modules = [
  {
    name: "Dispatch Exception Copilot",
    desc: "Prioritizes loads at SLA risk and proposes recovery actions.",
    status: "Core",
  },
  {
    name: "Lane and Capacity Optimizer",
    desc: "Balances route windows, capacity, and assignment options.",
    status: "Core",
  },
  {
    name: "Approval Inbox",
    desc: "Gates reroutes, detention, and ETA shifts for management sign-off.",
    status: "Core",
  },
  {
    name: "Driver and Dispatch Timeline",
    desc: "Unifies communications and operational context in one timeline.",
    status: "Live",
  },
  {
    name: "POD and Document Extractor",
    desc: "Captures missing billing fields before handoff to finance.",
    status: "Live",
  },
  {
    name: "Audit Trail",
    desc: "Stores decisions, overrides, and customer-impacting actions.",
    status: "Compliance",
  },
];

export default function ModulesPage() {
  return (
    <SitePage
      eyebrow="Modules"
      title="Purpose-built modules for dispatch, approvals, and billing flow."
      description="Each module is designed to reduce dependency on tribal knowledge while keeping high-impact operational decisions controlled and auditable."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((item) => (
          <article key={item.name} className="section-frame rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-subtle">{item.status}</p>
            <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
            <p className="mt-3 text-sm leading-7 text-subtle">{item.desc}</p>
          </article>
        ))}
      </div>

      <article className="section-frame rounded-3xl p-6 md:p-8">
        <h3 className="text-2xl font-semibold">Operator outcomes this stack is designed to improve</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-xs text-subtle">Dispatcher workload</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--accent)]">-25%</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-xs text-subtle">Missed windows</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--accent)]">-20%</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-xs text-subtle">POD-to-invoice cycle</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--accent)]">-30%</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-xs text-subtle">Overnight churn</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--accent)]">-33%</p>
          </div>
        </div>
      </article>
    </SitePage>
  );
}
