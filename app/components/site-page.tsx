import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";

export function SitePage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SiteNav />
      <main className="section-hero">
        <div className="reveal">
          <p className="eyebrow" style={{ marginBottom: "16px" }}>{eyebrow}</p>
          <h1 className="display-0">{title}</h1>
          <p className="body-lg mt-4" style={{ color: "var(--text-secondary)", maxWidth: "768px" }}>{description}</p>
        </div>
        <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "32px" }}>{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
