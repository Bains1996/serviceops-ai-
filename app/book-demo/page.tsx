"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SitePage } from "../components/site-page";

type DemoForm = {
  fullName: string;
  workEmail: string;
  company: string;
  role: string;
  fleetSize: string;
  systemsToConnect: string;
  autonomyGoal: string;
  primaryPain: string;
  website: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const initialForm: DemoForm = {
  fullName: "",
  workEmail: "",
  company: "",
  role: "",
  fleetSize: "",
  systemsToConnect: "",
  autonomyGoal: "",
  primaryPain: "",
  website: "",
};

export default function BookDemoPage() {
  const router = useRouter();
  const [form, setForm] = useState<DemoForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof DemoForm>(key: K, value: DemoForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.fullName || !form.workEmail || !form.company || !form.role) return;

    setSubmitting(true);
    setError(null);

    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    const payload = {
      ...form,
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
    };

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(
          response.status === 429
            ? "Too many attempts. Please wait a few minutes and try again."
            : "Could not submit request. Please try again.",
        );
        setSubmitting(false);
        return;
      }

      setForm(initialForm);

      if (typeof window !== "undefined") {
        if (window.gtag) {
          window.gtag("event", "generate_lead", {
            event_category: "conversion",
            event_label: "book_demo_submit",
          });
        }
        if (window.fbq) {
          window.fbq("track", "Lead");
        }
      }

      router.push("/thank-you");
    } catch {
      setError("Could not submit request. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <SitePage
      eyebrow="Book Demo"
      title="See ServiceOps AI on your real trucking operations workflow."
      description="Share your current dispatch and billing pain points, and we will map a focused pilot with measurable outcomes."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="section-frame rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Request a Demo</h2>
          <div className="mt-5 grid gap-3">
            <input
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              placeholder="Full name"
              className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none"
              required
            />
            <input
              type="email"
              value={form.workEmail}
              onChange={(event) => update("workEmail", event.target.value)}
              placeholder="Work email"
              className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none"
              required
            />
            <input
              value={form.company}
              onChange={(event) => update("company", event.target.value)}
              placeholder="Company"
              className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none"
              required
            />
            <input
              value={form.role}
              onChange={(event) => update("role", event.target.value)}
              placeholder="Role (Ops Manager, Dispatch Director, etc.)"
              className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none"
              required
            />
            <select
              value={form.fleetSize}
              onChange={(event) => update("fleetSize", event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none"
            >
              <option value="">Fleet size</option>
              <option value="1-25">1-25 trucks</option>
              <option value="26-100">26-100 trucks</option>
              <option value="101-300">101-300 trucks</option>
              <option value="300+">300+ trucks</option>
            </select>
            <textarea
              value={form.systemsToConnect}
              onChange={(event) => update("systemsToConnect", event.target.value)}
              placeholder="Systems to connect (McLeod, Trimble, Samsara, Motive, DAT, Truckstop, QuickBooks, etc.)"
              rows={3}
              className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none"
            />
            <select
              value={form.autonomyGoal}
              onChange={(event) => update("autonomyGoal", event.target.value)}
              className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none"
            >
              <option value="">Autonomy goal</option>
              <option value="assist">Assist mode (all approvals by dispatcher)</option>
              <option value="supervised">Supervised mode (low-risk auto approvals)</option>
              <option value="autonomous">Autonomous mode (policy-based full automation)</option>
            </select>
            <textarea
              value={form.primaryPain}
              onChange={(event) => update("primaryPain", event.target.value)}
              placeholder="Primary pain point (exceptions, missed windows, billing delays, etc.)"
              rows={4}
              className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm outline-none"
            />
            <input
              value={form.website}
              onChange={(event) => update("website", event.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`mt-5 rounded-full px-6 py-3 text-sm font-semibold ${
              submitting
                ? "cursor-not-allowed border border-[var(--border)] text-subtle"
                : "bg-[var(--accent)] text-[#032d26]"
            }`}
          >
            {submitting ? "Submitting..." : "Submit Demo Request"}
          </button>

          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </form>

        <aside className="section-frame rounded-3xl p-6 md:p-8">
          <h3 className="text-2xl font-semibold">What happens next</h3>
          <ol className="mt-4 space-y-2 text-sm leading-7 text-subtle">
            <li>1. 30-minute workflow review with your operations lead.</li>
            <li>2. One-time system connectivity map (TMS, ELD, load feeds, billing stack).</li>
            <li>3. KPI baseline setup for dispatch and billing cycle metrics.</li>
            <li>4. Pilot scope proposal with approval controls and timeline.</li>
            <li>5. Rollout plan for dispatch, ops, and back-office teams.</li>
          </ol>

          <div className="mt-6 rounded-2xl border border-[var(--border)] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-subtle">Pilot target outcomes</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>-25% dispatcher manual workload</li>
              <li>-20% missed windows</li>
              <li>-30% POD-to-invoice cycle time</li>
            </ul>
          </div>
        </aside>
      </div>
    </SitePage>
  );
}
