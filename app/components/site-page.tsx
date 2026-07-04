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
    <div className="min-h-screen bg-[var(--bg)]">
      <SiteNav />
      <main className="section-hero">
        <div className="reveal">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="display-0">{title}</h1>
          <p className="body-lg mt-4 max-w-3xl text-[var(--text-secondary)]">{description}</p>
        </div>
        <div className="mt-12 space-y-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
