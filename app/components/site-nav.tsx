"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/demo", label: "Demo" },
  { href: "/product", label: "Product" },
  { href: "/ai-brain", label: "AI Brain" },
  { href: "/case-studies", label: "Customers" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              display: "inline-flex",
              width: "32px",
              height: "32px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "var(--accent)",
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}>
              SO
            </span>
            <span className="heading-md">ServiceOps AI</span>
          </Link>

          <nav className="nav-links">
            {links.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="nav-right">
            <Link href="/download" className="btn btn-ghost hidden-mobile" style={{ fontSize: "14.5px" }}>
              Download
            </Link>
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: "14.5px" }}>
              Login
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "14px" }}>
              Start Free Trial
            </Link>
            <button
              className="nav-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`nav-mobile ${mobileOpen ? "active" : ""}`}>
        {links.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link href="/download" onClick={() => setMobileOpen(false)}>
          Download
        </Link>
        <Link href="/login" onClick={() => setMobileOpen(false)}>
          Login
        </Link>
        <Link href="/register" onClick={() => setMobileOpen(false)}>
          Start Free Trial
        </Link>
      </div>
    </>
  );
}
