"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

// ── Mouse Cursor Trail (Google Antigravity style) ────────────────────────────
function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let mouseX = -100;
    let mouseY = -100;
    let prevMouseX = -100;
    let prevMouseY = -100;
    const trails: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      life: number;
      vx: number;
      vy: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new trail points only when mouse moves
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2) {
        const speed = Math.min(dist * 0.3, 4);
        trails.push({
          x: mouseX,
          y: mouseY,
          size: Math.random() * 2.5 + 1.5,
          opacity: 0.7,
          life: 1,
          vx: dx * 0.02,
          vy: dy * 0.02,
        });
        prevMouseX = mouseX;
        prevMouseY = mouseY;
      }

      // Draw and update trails
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life -= 0.012;
        t.opacity = t.life * 0.7;
        t.size *= 0.99;
        t.x += t.vx;
        t.y += t.vy;
        t.vx *= 0.96;
        t.vy *= 0.96;

        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }

        // Main dot
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(50, 121, 249, ${t.opacity})`;
        ctx.fill();

        // Inner glow
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(50, 121, 249, ${t.opacity * 0.3})`;
        ctx.fill();

        // Outer glow
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(50, 121, 249, ${t.opacity * 0.08})`;
        ctx.fill();
      }

      // Keep trails manageable
      if (trails.length > 80) {
        trails.splice(0, trails.length - 80);
      }

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -100;
      mouseY = -100;
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Typewriter Effect ────────────────────────────────────────────────────────
function Typewriter({
  text,
  delay = 0,
  speed = 35,
  style = {},
  onComplete,
}: {
  text: string;
  delay?: number;
  speed?: number;
  style?: React.CSSProperties;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      onComplete?.();
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);

    return () => clearTimeout(timeout);
  }, [started, displayed, text, speed, onComplete]);

  return (
    <span style={style}>
      {displayed}
      {started && (
        <span
          style={{
            display: "inline-block",
            width: "3px",
            height: "0.9em",
            background: "var(--accent)",
            marginLeft: "2px",
            animation: "blink 0.7s step-end infinite",
            verticalAlign: "text-bottom",
            opacity: displayed.length < text.length ? 1 : 0,
          }}
        />
      )}
    </span>
  );
}

// ── Mouse-following float element (static until mouse is over) ──────────────
function MouseFloat({
  children,
  depth = 1,
  style = {},
}: {
  children: React.ReactNode;
  depth?: number;
  style?: React.CSSProperties;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);
      const threshold = 400;

      if (dist < threshold) {
        const factor = 1 - dist / threshold;
        setOffset({
          x: distX * 0.015 * depth * factor,
          y: distY * 0.015 * depth * factor,
        });
        setIsHovered(true);
      } else {
        setOffset({ x: 0, y: 0 });
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setOffset({ x: 0, y: 0 });
      setIsHovered(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [depth]);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: isHovered
          ? "transform 0.1s ease-out"
          : "transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)",
      }}
    >
      {children}
    </div>
  );
}

// ── Scroll Reveal ────────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(40px)",
        transition: `opacity 0.7s cubic-bezier(0.19, 1, 0.22, 1) ${delay}s, transform 0.7s cubic-bezier(0.19, 1, 0.22, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: "$49", label: "Per truck, per month", detail: "All features included. Volume discounts at 20+." },
  { value: "24/7", label: "AI dispatches around the clock", detail: "No breaks, no shifts, no sick days." },
  { value: "6", label: "Specialized AI agents", detail: "Dispatch, negotiation, compliance, billing, comms, exceptions." },
  { value: "0", label: "App installs required", detail: "Drivers get texts. That's it." },
];

const features = [
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Command Center",
    desc: "Desktop web app with real-time fleet map, load board, AI recommendations, and approval queue.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=95",
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "SMS Driver Comms",
    desc: "AI texts load updates, pickup instructions, and route changes. Drivers reply with keywords. No app needed.",
    image: "https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95",
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "6 AI Agents",
    desc: "Dispatch orchestrator, exception handler, rate negotiator, compliance monitor, billing readiness, driver coordinator.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=95",
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Approval Gates",
    desc: "Every cost-impacting decision goes through configurable workflows. AI proposes, humans decide.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=95",
  },
];

const integrations = [
  { name: "TMS", items: "API, EDI, webhooks — connects to most platforms" },
  { name: "ELD", items: "API integration, GPS data feeds, ELD log exports" },
  { name: "Load Boards", items: "EDI 204/214, API feeds, email parsing" },
  { name: "Back Office", items: "CSV export, API invoicing, SFTP data feeds" },
];

const workflow = [
  { num: "01", title: "Load Intake", desc: "Broker emails, EDI events, and customer portals consolidated into one AI queue." },
  { num: "02", title: "AI Assignment", desc: "Best-fit driver proposed using lane history, equipment, and real-time capacity." },
  { num: "03", title: "Exception Resolution", desc: "Delay alerts, reroutes, and detention handled autonomously or escalated to managers." },
  { num: "04", title: "Billing Handoff", desc: "POD packets, detention notes, and accessorial data assembled automatically." },
];

const painPoints = [
  "Load events arrive from too many disconnected systems",
  "Dispatch decisions drift across phone calls and group chats",
  "Exception context gets lost between shifts and team members",
  "POD and billing handoff creates days of avoidable delay",
];

// ═══════════════════════════════════════════════════════════════════════════════
// ── HOMEPAGE ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export function HomePage() {
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <MouseTrail />
      <SiteNav />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: "var(--grey-1200)",
        }}
      >
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.4,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(18,19,23,0.3) 0%, rgba(18,19,23,0.8) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "var(--page-max)",
            margin: "0 auto",
            padding: "0 var(--page-margin)",
            width: "100%",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--grid-gutter)", alignItems: "center" }}>
            <div>
              {/* Eyebrow */}
              <div
                style={{
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "none" : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.19, 1, 0.22, 1)",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 16px",
                    borderRadius: "9999px",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase" as const,
                    marginBottom: "32px",
                  }}
                >
                  Trucking dispatch, automated
                </div>
              </div>

              {/* Main heading - Typewriter */}
              <h1
                style={{
                  fontSize: "clamp(48px, 7vw, 107px)",
                  lineHeight: "1.05",
                  letterSpacing: "-2px",
                  fontWeight: 600,
                  color: "white",
                  minHeight: "clamp(120px, 15vw, 220px)",
                }}
              >
                <Typewriter
                  text="Your AI Dispatcher"
                  delay={600}
                  speed={45}
                  style={{ display: "block" }}
                />
                <Typewriter
                  text="That Never Sleeps"
                  delay={2200}
                  speed={45}
                  style={{ display: "block", color: "var(--accent)" }}
                />
              </h1>

              {/* Description */}
              <div
                style={{
                  opacity: heroReady ? 1 : 0,
                  transition: "opacity 0.8s ease 4s",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--base-size)",
                    lineHeight: "var(--base-line-height)",
                    color: "rgba(255,255,255,0.7)",
                    maxWidth: "480px",
                    marginTop: "32px",
                  }}
                >
                  ServiceOps AI handles load intake, dispatch exceptions, driver communication, and
                  POD-to-billing handoff. Your dispatch team focuses on growth, not fire drills.
                </p>
              </div>

              {/* CTA buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginTop: "40px",
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "none" : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.19, 1, 0.22, 1) 4.2s",
                }}
              >
                <Link
                  href="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "16px 32px",
                    borderRadius: "9999px",
                    background: "white",
                    color: "var(--grey-1200)",
                    fontSize: "16px",
                    fontWeight: 500,
                    textDecoration: "none",
                    boxShadow: "0 4px 24px rgba(255,255,255,0.15)",
                    transition: "all 0.3s",
                  }}
                >
                  Start Free Trial
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link
                  href="/product"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "16px 32px",
                    borderRadius: "9999px",
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.3s",
                  }}
                >
                  See how it works
                </Link>
              </div>

              {/* Tags */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "32px",
                  opacity: heroReady ? 1 : 0,
                  transition: "opacity 0.8s ease 4.5s",
                }}
              >
                {["$49/truck/mo", "No credit card", "20-min setup"].map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Command Center Preview */}
            <div
              style={{
                opacity: heroReady ? 1 : 0,
                transform: heroReady ? "none" : "translateX(40px)",
                transition: "all 0.8s cubic-bezier(0.19, 1, 0.22, 1) 1s",
              }}
            >
              <MouseFloat depth={1.2}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
                    overflow: "hidden",
                  }}
                >
                  {/* Browser bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "14px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57" }} />
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#febc2e" }} />
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840" }} />
                    <div
                      style={{
                        marginLeft: "16px",
                        flex: 1,
                        borderRadius: "9999px",
                        background: "rgba(255,255,255,0.06)",
                        padding: "8px 16px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      app.serviceops.ai/command-center
                    </div>
                  </div>

                  {/* Dashboard */}
                  <div style={{ padding: "24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
                      {[
                        { label: "Active Loads", value: "24", color: "#3279F9" },
                        { label: "Drivers Online", value: "18", color: "#34A853" },
                        { label: "Delivered", value: "12", color: "#FBBC04" },
                        { label: "Revenue", value: "$12.4K", color: "#34A853" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: "12px",
                            padding: "16px",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{s.label}</p>
                          <p style={{ fontSize: "20px", fontWeight: 600, color: s.color, margin: "4px 0 0" }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 10px" }}>AI Activity</p>
                        {["Load assigned to Raj", "POD received from Mike", "Rate negotiated: +$200"].map((a) => (
                          <div key={a} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34A853" }} />
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{a}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 10px" }}>Approval Queue</p>
                        {["Reroute I-90 delay", "Detention claim $350", "New load assignment"].map((a) => (
                          <div key={a} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>{a}</span>
                            <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "9px", fontWeight: 600, background: "rgba(251,188,4,0.15)", color: "#FBBC04" }}>PENDING</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </MouseFloat>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section style={{ padding: "var(--space-6xl) var(--page-margin)", background: "var(--grey-10)" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--grid-gutter)" }}>
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <MouseFloat depth={0.3 + i * 0.15}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "clamp(48px, 6vw, 72px)", lineHeight: "1", fontWeight: 600, color: "var(--accent)", letterSpacing: "-2px" }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: "var(--md-size)", fontWeight: 500, marginTop: "12px" }}>{s.label}</div>
                    <p style={{ fontSize: "var(--sm-size)", color: "var(--text-muted)", marginTop: "4px" }}>{s.detail}</p>
                  </div>
                </MouseFloat>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHAT IS IT ═══════════════════ */}
      <section style={{ padding: "var(--space-7xl) var(--page-margin)" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "5fr 6fr", gap: "var(--grid-gutter)", alignItems: "start" }}>
            <Reveal>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "16px" }}>
                  What is ServiceOps AI
                </div>
                <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", lineHeight: "1.15", letterSpacing: "-1px", fontWeight: 600 }}>
                  An AI-powered dispatch command center for trucking carriers.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
                <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "var(--text-secondary)" }}>
                  ServiceOps AI is a vertical agentic platform built specifically for trucking carriers
                  running regional and cross-border freight operations across North America.
                </p>
                <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "var(--text-secondary)" }}>
                  It connects to your TMS, ELD, and load boards. Six specialized AI agents handle
                  routine dispatch decisions, exception triage, driver communication, and document
                  processing around the clock.
                </p>
                <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "var(--text-secondary)" }}>
                  High-impact decisions always go through human approval. Every action is logged and auditable.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PAIN POINTS ═══════════════════ */}
      <section style={{ padding: "var(--space-7xl) var(--page-margin)" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "16px" }}>The Problem</div>
              <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", lineHeight: "1.15", letterSpacing: "-1px", fontWeight: 600 }}>What dispatch teams deal with every day.</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {painPoints.map((p, i) => (
              <Reveal key={p} delay={i * 0.1}>
                <MouseFloat depth={0.2}>
                  <div
                    style={{
                      padding: "32px",
                      borderRadius: "20px",
                      background: "white",
                      border: "1px solid var(--border)",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <p style={{ fontSize: "var(--md-size)", lineHeight: "var(--md-line-height)", fontWeight: 500 }}>{p}</p>
                  </div>
                </MouseFloat>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section style={{ padding: "var(--space-7xl) var(--page-margin)", background: "var(--grey-10)" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "16px" }}>Platform</div>
              <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", lineHeight: "1.15", letterSpacing: "-1px", fontWeight: 600 }}>One platform. Everything included.</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <MouseFloat depth={0.3 + i * 0.1}>
                  <div
                    style={{ borderRadius: "20px", overflow: "hidden", background: "white", border: "1px solid var(--border)", transition: "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                      <img src={f.image} alt={f.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s" }}
                        onMouseEnter={(e) => { (e.target as HTMLImageElement).style.transform = "scale(1.05)"; }}
                        onMouseLeave={(e) => { (e.target as HTMLImageElement).style.transform = "scale(1)"; }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))" }} />
                      <div style={{ position: "absolute", bottom: "20px", left: "24px", width: "56px", height: "56px", borderRadius: "16px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                        {f.icon}
                      </div>
                    </div>
                    <div style={{ padding: "28px" }}>
                      <h3 style={{ fontSize: "var(--xl-size)", fontWeight: 500, marginBottom: "8px" }}>{f.title}</h3>
                      <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "var(--text-secondary)" }}>{f.desc}</p>
                    </div>
                  </div>
                </MouseFloat>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SMS EXPLAINER ═══════════════════ */}
      <section style={{ padding: "var(--space-7xl) var(--page-margin)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.1 }} />
        </div>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "5fr 6fr", gap: "var(--grid-gutter)", alignItems: "center" }}>
            <Reveal>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "16px" }}>Driver Communication</div>
                <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", lineHeight: "1.15", letterSpacing: "-1px", fontWeight: 600, marginBottom: "24px" }}>
                  Drivers don&apos;t need an app.
                  <br />
                  <span style={{ color: "var(--accent)" }}>They need a text message.</span>
                </h2>
                <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "var(--text-secondary)", marginBottom: "24px" }}>
                  Most truck drivers don&apos;t download apps for work. ServiceOps AI sends load updates,
                  pickup instructions, route changes, and document requests via SMS. Drivers respond
                  with simple keywords like &quot;loaded&quot;, &quot;unloaded&quot;, or &quot;delay 45 min&quot;.
                </p>
                <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "var(--text-secondary)", marginBottom: "32px" }}>
                  The AI handles check-calls automatically, confirms POD details, and keeps dispatch
                  informed in real time &mdash; all through standard text messaging.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {["No app install needed", "Works on any phone", "AI-powered responses"].map((t) => (
                    <span key={t} style={{ padding: "6px 14px", borderRadius: "9999px", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "13px", fontWeight: 500 }}>{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <MouseFloat depth={0.6}>
                <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.12)" }}>
                  <img src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95" alt="Truck on highway" style={{ width: "100%", height: "480px", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(50,121,249,0.15), rgba(139,92,246,0.1))" }} />
                </div>
              </MouseFloat>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ WORKFLOW ═══════════════════ */}
      <section style={{ padding: "var(--space-7xl) var(--page-margin)", background: "var(--grey-10)" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "16px" }}>How it works</div>
              <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", lineHeight: "1.15", letterSpacing: "-1px", fontWeight: 600 }}>Four steps to automated dispatch.</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
            {workflow.map((w, i) => (
              <Reveal key={w.num} delay={i * 0.1}>
                <MouseFloat depth={0.2 + i * 0.1}>
                  <div
                    style={{ padding: "40px 32px", borderRadius: "20px", background: "white", border: "1px solid var(--border)", textAlign: "center", transition: "all 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ fontSize: "56px", fontWeight: 300, color: "rgba(50,121,249,0.12)", lineHeight: "1", marginBottom: "24px" }}>{w.num}</div>
                    <h3 style={{ fontSize: "var(--lg-size)", fontWeight: 500, marginBottom: "12px" }}>{w.title}</h3>
                    <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "var(--text-secondary)" }}>{w.desc}</p>
                  </div>
                </MouseFloat>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ INTEGRATIONS ═══════════════════ */}
      <section style={{ padding: "var(--space-7xl) var(--page-margin)" }}>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "16px" }}>Integrations</div>
              <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", lineHeight: "1.15", letterSpacing: "-1px", fontWeight: 600 }}>Connects to your entire trucking stack.</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            {integrations.map((g, i) => (
              <Reveal key={g.name} delay={i * 0.1}>
                <MouseFloat depth={0.2}>
                  <div
                    style={{ padding: "32px 24px", borderRadius: "20px", background: "var(--grey-10)", border: "1px solid var(--border)", transition: "all 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <h3 style={{ fontSize: "var(--md-size)", fontWeight: 500, marginBottom: "8px" }}>{g.name}</h3>
                    <p style={{ fontSize: "var(--sm-size)", color: "var(--text-muted)", lineHeight: "var(--sm-line-height)" }}>{g.items}</p>
                  </div>
                </MouseFloat>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ DRIVER COMMUNICATION ═══════════════════ */}
      <section style={{ padding: "var(--space-7xl) var(--page-margin)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.08 }} />
        </div>
        <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "5fr 6fr", gap: "var(--grid-gutter)", alignItems: "center" }}>
            <Reveal>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "16px" }}>For Drivers</div>
                <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", lineHeight: "1.15", letterSpacing: "-1px", fontWeight: 600, marginBottom: "24px" }}>
                  No app needed. Just text messages.
                </h2>
                <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "var(--text-secondary)", marginBottom: "24px" }}>
                  Drivers get load assignments via SMS. Reply with keywords like ACCEPT, DELAY, or LOADED.
                  No app to download. No login to remember. Works on any phone.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {["SMS load assignments", "Keyword replies", "AI-powered responses", "No app install needed", "Works on any phone"].map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span style={{ fontSize: "var(--base-size)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/download" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "9999px", background: "var(--accent)", color: "white", fontSize: "16px", fontWeight: 500, textDecoration: "none", marginTop: "32px" }}>
                  Try It Free
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <MouseFloat depth={0.6}>
                <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 80px rgba(0,0,0,0.12)" }}>
                  <img src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=1920&q=95" alt="Truck driver" style={{ width: "100%", height: "480px", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3))" }} />
                </div>
              </MouseFloat>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section style={{ position: "relative", minHeight: "60vh", display: "flex", alignItems: "center", overflow: "hidden", background: "var(--grey-1200)" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=95" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(18,19,23,0.5) 0%, rgba(18,19,23,0.9) 100%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "var(--page-max)", margin: "0 auto", padding: "0 var(--page-margin)", width: "100%" }}>
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}>
              <h2 style={{ fontSize: "clamp(40px, 5vw, 72px)", lineHeight: "1.1", letterSpacing: "-1.5px", fontWeight: 600, color: "white" }}>
                Ready to modernize dispatch?
              </h2>
              <p style={{ fontSize: "var(--base-size)", lineHeight: "var(--base-line-height)", color: "rgba(255,255,255,0.6)", marginTop: "24px" }}>
                Start your free trial. Add drivers, connect your TMS, and let AI handle dispatch in 20 minutes.
              </p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "40px", flexWrap: "wrap" }}>
                <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "9999px", background: "white", color: "var(--grey-1200)", fontSize: "16px", fontWeight: 500, textDecoration: "none" }}>
                  Start Free Trial
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 32px", borderRadius: "9999px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "16px", fontWeight: 500, textDecoration: "none" }}>
                  View pricing
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />

      {/* Blink animation for cursor */}
      <style jsx global>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
