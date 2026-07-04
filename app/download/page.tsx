"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    icon: "🚛",
    title: "Current Load",
    description: "View your active load, pickup/delivery details, and time windows at a glance.",
  },
  {
    icon: "📸",
    title: "POD Camera",
    description: "Take photos of proof of delivery, bills of lading, and cargo condition.",
  },
  {
    icon: "🤖",
    title: "AI Dispatcher",
    description: "Chat with your AI assistant for load updates, directions, and support.",
  },
  {
    icon: "📍",
    title: "GPS Tracking",
    description: "Automatic location updates so dispatch always knows where you are.",
  },
  {
    icon: "⏰",
    title: "Hours of Service",
    description: "Track driving hours and get reminders before your HOS limits.",
  },
  {
    icon: "🔔",
    title: "Push Notifications",
    description: "Get instant alerts for new loads, route changes, and dispatch messages.",
  },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Hero */}
      <section className="hero-atmosphere relative overflow-hidden px-5 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.18em] text-subtle">Download ServiceOps AI</p>
                <h1 className="display-type text-4xl leading-tight md:text-6xl">
                  Your dispatch center. <span className="gradient-text">In your pocket.</span>
                </h1>
                <p className="max-w-lg text-lg leading-8 text-subtle">
                  The Command Center runs in your browser. The mobile app puts AI-powered dispatch 
                  in your drivers' hands. One system, every device.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="#"
                  className="btn-primary inline-flex items-center justify-center gap-3"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </Link>
                <Link
                  href="#"
                  className="btn-secondary inline-flex items-center justify-center gap-3"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-subtle">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free for drivers
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Works offline
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto"
            >
              {/* Phone Mockup */}
              <div className="relative w-72 rounded-[3rem] border-4 border-[var(--surface-glass-border)] bg-[var(--bg-elevated)] p-3 shadow-2xl">
                <div className="rounded-[2.5rem] bg-gradient-to-br from-[var(--accent)]/20 via-[var(--accent-purple)]/10 to-[var(--accent-amber)]/10 p-5">
                  {/* Status Bar */}
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-xs font-semibold">9:41</span>
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      <div className="h-2 w-2 rounded-full bg-[var(--accent)]/50" />
                      <div className="h-2 w-2 rounded-full bg-[var(--accent)]/30" />
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center">
                      <p className="text-xs text-subtle">Good Morning</p>
                      <p className="text-lg font-semibold">Dispatch Center</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card p-3 text-center">
                        <p className="text-2xl font-bold text-[var(--accent)]">12</p>
                        <p className="text-[10px] text-subtle">Active Loads</p>
                      </div>
                      <div className="glass-card p-3 text-center">
                        <p className="text-2xl font-bold text-[var(--accent-emerald)]">8</p>
                        <p className="text-[10px] text-subtle">Delivered</p>
                      </div>
                    </div>

                    {/* Load Card */}
                    <div className="glass-card p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded bg-[var(--accent)]/20 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">LD-042</span>
                        <span className="rounded bg-[var(--accent-emerald)]/20 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-emerald)]">In Transit</span>
                      </div>
                      <p className="text-xs font-medium">Vancouver → Kelowna</p>
                      <p className="text-[10px] text-subtle">Raj Singh • $1,200</p>
                    </div>

                    {/* AI Chat */}
                    <div className="glass-card p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-[var(--accent)]/20" />
                        <span className="text-[10px] font-semibold">AI Dispatcher</span>
                      </div>
                      <p className="text-[10px] text-subtle">"Pickup confirmed. Proceed to dock 3."</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -right-6 top-12 float rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold text-[var(--bg)] shadow-lg glow">
                AI Online
              </div>
              <div className="absolute -left-6 bottom-20 float rounded-full bg-[var(--accent-emerald)] px-4 py-2 text-xs font-bold text-[var(--bg)] shadow-lg" style={{ animationDelay: "1s" }}>
                GPS Active
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.18em] text-subtle">Driver Features</p>
            <h2 className="display-type text-3xl leading-tight md:text-5xl">
              Everything drivers need. <span className="text-[var(--accent)]">Nothing they don't.</span>
            </h2>
            <p className="text-lg text-subtle">
              Built by a former truck driver. Designed for the real world of long-haul freight.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="section-frame rounded-2xl p-6"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm leading-6 text-subtle">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop Section */}
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="section-frame relative overflow-hidden rounded-3xl p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/10 via-transparent to-[var(--accent)]/10" />
            <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-subtle">Command Center</p>
                <h2 className="display-type mt-4 text-3xl leading-tight md:text-4xl">
                  The desktop experience. <span className="gradient-text">In your browser.</span>
                </h2>
                <p className="mt-4 text-base leading-7 text-subtle">
                  No install required. Bookmark it and it works just like an app. 
                  Real-time maps, multi-load management, AI assistant, and approval workflows — all in one tab.
                </p>
                <div className="mt-6">
                  <Link
                    href="/portal"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Open Command Center
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--surface-glass-border)] bg-[var(--bg-elevated)] p-4 shadow-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[var(--error)]" />
                  <div className="h-3 w-3 rounded-full bg-[var(--warning)]" />
                  <div className="h-3 w-3 rounded-full bg-[var(--success)]" />
                  <span className="ml-2 text-xs text-subtle">serviceops.ai/control-tower</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="glass-card h-16 rounded-lg" />
                  ))}
                </div>
                <div className="mt-2 glass-card h-24 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="display-type text-3xl leading-tight md:text-5xl">
            Ready to dispatch smarter?
          </h2>
          <p className="mt-4 text-lg text-subtle">
            Download the app or book a demo to see ServiceOps AI in action.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/book-demo" className="btn-primary">
              Book a Demo
            </Link>
            <Link href="#" className="btn-secondary">
              Download for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
