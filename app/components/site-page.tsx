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
      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <section className="section-frame rounded-3xl p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.18em] text-subtle">{eyebrow}</p>
          <h1 className="display-type mt-3 text-4xl leading-tight md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-subtle md:text-lg">{description}</p>
        </section>

        <section className="mt-8 space-y-6">{children}</section>
      </main>
      <SiteFooter />
    </div>
  );
}
