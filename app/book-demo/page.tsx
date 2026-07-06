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
        headers: { "Content-Type": "application/json" },
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
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px" }}>
        <form onSubmit={onSubmit} className="section-frame" style={{ padding: "32px" }}>
          <h2 className="heading-lg">Request a Demo</h2>
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              placeholder="Full name"
              className="form-input"
              required
            />
            <input
              type="email"
              value={form.workEmail}
              onChange={(event) => update("workEmail", event.target.value)}
              placeholder="Work email"
              className="form-input"
              required
            />
            <input
              value={form.company}
              onChange={(event) => update("company", event.target.value)}
              placeholder="Company"
              className="form-input"
              required
            />
            <input
              value={form.role}
              onChange={(event) => update("role", event.target.value)}
              placeholder="Role (Ops Manager, Dispatch Director, etc.)"
              className="form-input"
              required
            />
            <select
              value={form.fleetSize}
              onChange={(event) => update("fleetSize", event.target.value)}
              className="form-select"
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
              className="form-textarea"
            />
            <select
              value={form.autonomyGoal}
              onChange={(event) => update("autonomyGoal", event.target.value)}
              className="form-select"
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
              className="form-textarea"
            />
            <input
              value={form.website}
              onChange={(event) => update("website", event.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ display: "none" }}
              aria-hidden="true"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`btn ${submitting ? "btn-outline" : "btn-primary"}`}
            style={{ marginTop: "20px" }}
          >
            {submitting ? "Submitting..." : "Submit Demo Request"}
          </button>

          {error && <p className="body-md" style={{ marginTop: "16px", color: "var(--red)" }}>{error}</p>}
        </form>

        <aside className="section-frame" style={{ padding: "32px" }}>
          <h3 className="heading-lg">What happens next</h3>
          <ol style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "30-minute workflow review with your operations lead.",
              "One-time system connectivity map (TMS, ELD, load feeds, billing stack).",
              "KPI baseline setup for dispatch and billing cycle metrics.",
              "Pilot scope proposal with approval controls and timeline.",
              "Rollout plan for dispatch, ops, and back-office teams.",
            ].map((step, i) => (
              <li key={step} className="body-md" style={{ color: "var(--text-secondary)" }}>{i + 1}. {step}</li>
            ))}
          </ol>

          <div style={{ marginTop: "24px", padding: "16px", border: "1px solid var(--border)", borderRadius: "16px" }}>
            <p className="small" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Pilot target outcomes</p>
            <ul style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li className="body-md">-25% dispatcher manual workload</li>
              <li className="body-md">-20% missed windows</li>
              <li className="body-md">-30% POD-to-invoice cycle time</li>
            </ul>
          </div>
        </aside>
      </div>
    </SitePage>
  );
}
