import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/solutions", label: "Solutions" },
  { href: "/modules", label: "Modules" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/control-tower", label: "Control Tower" },
  { href: "/case-studies", label: "Case Studies" },
];

export function SiteNav() {
  return (
    <header className="border-b border-[var(--surface-glass-border)] bg-[var(--bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-purple)] text-xs font-bold text-white">
            SO
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.08em] text-[var(--text-primary)]">ServiceOps AI</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-subtle">Trucking Carriers</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-xs uppercase tracking-[0.14em] text-subtle md:flex">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--text-primary)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/download"
            className="hidden items-center gap-2 rounded-full border border-[var(--surface-glass-border)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-glass)] md:inline-flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </Link>
          <Link
            href="/book-demo"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--bg)] transition hover:bg-[var(--accent-strong)]"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
