import Link from "next/link";

import { IntegrationsConsole } from "../components/integrations-console";
import { SitePage } from "../components/site-page";

const connectorGroups = [
  {
    title: "TMS and Dispatch Platforms",
    systems: ["McLeod", "Trimble TMW", "Turvo", "Rose Rocket", "Axon", "AscendTMS"],
  },
  {
    title: "ELD and Telematics",
    systems: ["Samsara", "Motive", "Geotab", "Omnitracs", "Garmin", "Platform Science"],
  },
  {
    title: "Load Boards and Broker Feeds",
    systems: ["DAT", "Truckstop", "Project44", "FourKites", "EDI 204/214/990", "Custom API feeds"],
  },
  {
    title: "Back Office and Billing",
    systems: ["QuickBooks", "Sage", "PCS", "Custom accounting ERP", "SFTP/CSV", "Webhook exports"],
  },
];

export default function IntegrationsPage() {
  return (
    <SitePage
      eyebrow="Integrations"
      title="Connect ServiceOps AI to the trucking systems you already use."
      description="Carriers in the USA and Canada can connect TMS, ELD, telematics, load feeds, and billing systems once, then let the 24/7 agent run operations continuously."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {connectorGroups.map((group) => (
          <article key={group.title} className="section-frame rounded-2xl p-6">
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {group.systems.map((system) => (
                <span key={system} className="chip rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-subtle">
                  {system}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <article className="section-frame rounded-3xl p-6 md:p-8">
        <h3 className="display-type text-3xl leading-tight md:text-4xl">How one-time integration works</h3>
        <ol className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          <li className="rounded-xl border border-[var(--border)] p-4">1. Connect your systems (API, EDI, SFTP, or webhook).</li>
          <li className="rounded-xl border border-[var(--border)] p-4">2. Sync drivers, tractors, loads, and active dispatch records.</li>
          <li className="rounded-xl border border-[var(--border)] p-4">3. Route live updates into the control tower in real time.</li>
          <li className="rounded-xl border border-[var(--border)] p-4">4. Start in supervised mode, then increase autonomy by policy.</li>
          <li className="rounded-xl border border-[var(--border)] p-4">5. Let the 24/7 agent manage check-calls and assignment actions.</li>
          <li className="rounded-xl border border-[var(--border)] p-4">6. Keep every decision auditable with role-based controls.</li>
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/book-demo" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#032d26]">
            Start Integration Pilot
          </Link>
          <Link href="/control-tower" className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold">
            Open Control Tower
          </Link>
        </div>
      </article>

      <IntegrationsConsole />
    </SitePage>
  );
}
