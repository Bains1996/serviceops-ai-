"use client";

import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Current Load",
    desc: "View your active load, pickup/delivery details, and time windows at a glance.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "POD Camera",
    desc: "Take photos of proof of delivery, bills of lading, and cargo condition.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "AI Dispatcher",
    desc: "Chat with your AI assistant for load updates, directions, and support.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "GPS Tracking",
    desc: "Automatic location updates so dispatch always knows where you are.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Hours of Service",
    desc: "Track driving hours and get reminders before your HOS limits.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: "Push Notifications",
    desc: "Get instant alerts for new loads, route changes, and dispatch messages.",
  },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteNav />

      {/* Hero */}
      <section className="px-5 pt-24 pb-20 md:px-8 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-medium text-[var(--accent)]">Download ServiceOps AI</p>
                <h1 className="display-type text-4xl md:text-6xl">
                  Your dispatch center.
                  <br />
                  In your pocket.
                </h1>
                <p className="max-w-lg text-lg text-[var(--text-secondary)]">
                  The Command Center runs in your browser. The mobile app puts AI-powered dispatch
                  in your drivers' hands. One system, every device.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="#" className="btn-primary inline-flex items-center justify-center gap-3">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </Link>
                <Link href="#" className="btn-secondary inline-flex items-center justify-center gap-3">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
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
            </div>

            {/* Phone Mockup */}
            <div className="relative mx-auto">
              <div className="relative w-72 rounded-[3rem] border-4 border-[var(--border)] bg-white p-3 shadow-xl">
                <div className="rounded-[2.5rem] bg-gradient-to-br from-[var(--accent-soft)] to-white p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-xs font-semibold">9:41</span>
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      <div className="h-2 w-2 rounded-full bg-[var(--accent)]/50" />
                      <div className="h-2 w-2 rounded-full bg-[var(--accent)]/30" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-xs text-[var(--text-muted)]">Good Morning</p>
                      <p className="text-lg font-semibold">Dispatch Center</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                        <p className="text-2xl font-bold text-[var(--accent)]">12</p>
                        <p className="text-[10px] text-[var(--text-muted)]">Active Loads</p>
                      </div>
                      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                        <p className="text-2xl font-bold text-[var(--success)]">8</p>
                        <p className="text-[10px] text-[var(--text-muted)]">Delivered</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">LD-042</span>
                        <span className="rounded bg-[var(--success)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">In Transit</span>
                      </div>
                      <p className="text-xs font-medium">Vancouver → Kelowna</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Raj Singh • $1,200</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-[var(--accent-soft)]" />
                        <span className="text-[10px] font-semibold">AI Dispatcher</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)]">"Pickup confirmed. Proceed to dock 3."</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-6 top-12 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white shadow-lg">
                AI Online
              </div>
              <div className="absolute -left-6 bottom-20 rounded-full bg-[var(--success)] px-4 py-2 text-xs font-bold text-white shadow-lg">
                GPS Active
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Features */}
      <section className="section">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-medium text-[var(--accent)]">Driver Features</p>
          <h2 className="display-type text-3xl md:text-5xl">
            Everything drivers need.
            <br />
            Nothing they don't.
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Built by a former truck driver. Designed for the real world of long-haul freight.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card">
              <div className="feature-icon bg-[var(--accent-soft)] text-[var(--accent)]">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-6">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Desktop Section */}
      <section className="section">
        <div className="card-flat overflow-hidden p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-3 text-sm font-medium text-[var(--accent)]">Command Center</p>
              <h2 className="display-type text-3xl md:text-4xl">
                The desktop experience.
                <br />
                In your browser.
              </h2>
              <p className="mt-4 text-[var(--text-secondary)]">
                No install required. Bookmark it and it works just like an app.
                Real-time maps, multi-load management, AI assistant, and approval workflows — all in one tab.
              </p>
              <div className="mt-6">
                <Link href="/control-tower" className="btn-primary inline-flex items-center gap-2">
                  Open Command Center
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[var(--error)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--warning)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--success)]" />
                <span className="ml-2 text-xs text-[var(--text-muted)]">serviceops.ai/control-tower</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-[var(--bg)]" />
                ))}
              </div>
              <div className="mt-2 h-24 rounded-lg bg-[var(--bg)]" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-lg">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-type text-3xl md:text-5xl">
            Ready to dispatch smarter?
          </h2>
          <p className="mt-6 text-lg text-[var(--text-secondary)]">
            Download the app or book a demo to see ServiceOps AI in action.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/book-demo" className="btn-primary">Book a Demo</Link>
            <Link href="#" className="btn-secondary">Download Free</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
