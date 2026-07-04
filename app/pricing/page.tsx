"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

const plans = [
  {
    name: "Starter",
    desc: "For small carriers getting started with AI dispatch",
    price: "$299",
    period: "per month",
    features: [
      "Up to 10 drivers",
      "AI Dispatch Copilot",
      "SMS driver communication",
      "Basic approval workflows",
      "Email support",
      "1 TMS integration",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    desc: "For growing carriers who need full automation",
    price: "$500",
    period: "per month",
    features: [
      "Up to 50 drivers",
      "Everything in Starter",
      "6 Agentic AI Agents",
      "Real-time Command Center",
      "Advanced approval workflows",
      "Unlimited TMS integrations",
      "Priority support",
      "Custom branding",
    ],
    cta: "Book Demo",
    popular: true,
  },
  {
    name: "Enterprise",
    desc: "For large carriers and fleet operators",
    price: "Custom",
    period: "contact us",
    features: [
      "Unlimited drivers",
      "Everything in Professional",
      "Custom AI model training",
      "Dedicated account manager",
      "SLA guarantees",
      "API access",
      "On-premise deployment",
      "White-label options",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const driverFeatures = [
  "Current load management",
  "POD photo capture",
  "AI dispatcher chat",
  "GPS location sharing",
  "Hours of Service tracking",
  "Push notifications",
  "Works offline",
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes. The Professional plan comes with a 14-day free trial. No credit card required.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. Upgrade or downgrade anytime. We'll prorate the difference.",
  },
  {
    q: "What TMS integrations do you support?",
    a: "We integrate with McLeod, Trimble TMW, Turvo, Rose Rocket, Axon, and more. Custom integrations available on Enterprise.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use SOC 2 compliant infrastructure, encrypt all data at rest and in transit, and never share your data with third parties.",
  },
  {
    q: "Do you offer on-premise deployment?",
    a: "Yes, on Enterprise plan. We can deploy to your own cloud or on-premise servers.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteNav />

      {/* Hero */}
      <section className="px-5 pt-24 pb-16 md:px-8 md:pt-32">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-3 text-sm font-medium text-[var(--accent)]">Pricing</p>
          <h1 className="display-type text-4xl md:text-6xl">
            Simple pricing.
            <br />
            Powerful results.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-secondary)]">
            Start free with the driver app. Scale with the carrier platform.
            No hidden fees. No long-term contracts.
          </p>
        </div>
      </section>

      {/* Driver App - Free */}
      <section className="px-5 pb-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="card-flat overflow-hidden p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--success)]/10 px-4 py-2 text-sm font-semibold text-[var(--success)]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Always Free
                </div>
                <h2 className="display-type text-3xl md:text-4xl">Driver App</h2>
                <p className="mt-2 text-[var(--text-secondary)]">
                  For drivers. Always free. No credit card required.
                </p>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-[var(--success)]">Free</span>
                  <span className="ml-2 text-[var(--text-muted)]">forever</span>
                </div>
              </div>
              <div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {driverFeatures.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <svg className="h-5 w-5 shrink-0 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/download" className="btn-primary">
                    Download Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrier Plans */}
      <section className="px-5 pb-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-medium text-[var(--accent)]">Carrier Plans</p>
            <h2 className="display-type text-3xl md:text-4xl">For your operations team</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card relative ${plan.popular ? "ring-2 ring-[var(--accent)]" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{plan.desc}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-sm text-[var(--text-muted)]">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={plan.popular ? "/book-demo" : "#"}
                    className={plan.popular ? "btn-primary block text-center" : "btn-secondary block text-center"}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-16 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="display-type mb-8 text-center text-3xl md:text-4xl">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="card-flat p-5">
                <h4 className="font-semibold">{item.q}</h4>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-type text-3xl md:text-5xl">
            Ready to transform dispatch?
          </h2>
          <p className="mt-6 text-lg text-[var(--text-secondary)]">
            Start with the free driver app. Upgrade when you're ready.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/book-demo" className="btn-primary">Book a Demo</Link>
            <Link href="/download" className="btn-secondary">Download Free</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
