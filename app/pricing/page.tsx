"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    description: "For small carriers getting started with AI dispatch",
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
    description: "For growing carriers who need full automation",
    price: "$500",
    period: "per month",
    features: [
      "Up to 50 drivers",
      "Everything in Starter",
      "6 Agentic AI Agents",
      "Real-time Control Tower",
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
    description: "For large carriers and fleet operators",
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

const driverPlan = {
  name: "Driver App",
  price: "Free",
  description: "For drivers. Always free. No credit card required.",
  features: [
    "Current load management",
    "POD photo capture",
    "AI dispatcher chat",
    "GPS location sharing",
    "Hours of Service tracking",
    "Push notifications",
    "Works offline",
  ],
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Hero */}
      <section className="hero-atmosphere relative overflow-hidden px-5 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-subtle">Pricing</p>
            <h1 className="display-type text-4xl leading-tight md:text-6xl">
              Simple pricing. <span className="gradient-text">Powerful results.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-subtle">
              Start free with the driver app. Scale with the carrier platform. 
              No hidden fees. No long-term contracts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Driver App - Free */}
      <section className="px-5 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-frame relative overflow-hidden rounded-3xl p-8 md:p-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-emerald)]/10 via-transparent to-[var(--accent)]/10" />
            <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-emerald)]/20 px-4 py-2 text-sm font-semibold text-[var(--accent-emerald)]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Always Free
                </div>
                <h2 className="display-type text-3xl md:text-4xl">{driverPlan.name}</h2>
                <p className="mt-2 text-lg text-subtle">{driverPlan.description}</p>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-[var(--accent-emerald)]">{driverPlan.price}</span>
                  <span className="ml-2 text-subtle">forever</span>
                </div>
              </div>
              <div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {driverPlan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <svg className="h-5 w-5 shrink-0 text-[var(--accent-emerald)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link href="/download" className="btn-primary inline-flex items-center gap-2">
                    Download Free
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Carrier Plans */}
      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-subtle">Carrier Plans</p>
            <h2 className="display-type mt-4 text-3xl md:text-4xl">For your operations team</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`section-frame rounded-2xl p-6 ${
                  plan.popular ? "ring-2 ring-[var(--accent)]" : ""
                }`}
              >
                {plan.popular && (
                  <div className="mb-4 inline-flex rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--bg)]">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-subtle">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-sm text-subtle">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={plan.name === "Professional" ? "/book-demo" : "#"}
                    className={plan.popular ? "btn-primary block text-center" : "btn-secondary block text-center"}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="display-type mb-8 text-center text-3xl md:text-4xl">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
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
            ].map((item) => (
              <div key={item.q} className="section-frame rounded-xl p-5">
                <h4 className="font-semibold">{item.q}</h4>
                <p className="mt-2 text-sm text-subtle">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="display-type text-3xl leading-tight md:text-5xl">
            Ready to transform your dispatch?
          </h2>
          <p className="mt-4 text-lg text-subtle">
            Start with the free driver app. Upgrade when you're ready.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/book-demo" className="btn-primary">
              Book a Demo
            </Link>
            <Link href="/download" className="btn-secondary">
              Download Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
