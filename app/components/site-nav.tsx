import Link from "next/link";

const links = [
  { href: "/solutions", label: "Solutions" },
  { href: "/modules", label: "Modules" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/case-studies", label: "Case Studies" },
];

export function SiteNav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
            SO
          </span>
          <span className="heading-md text-[var(--text)]">ServiceOps AI</span>
        </Link>

        <nav className="nav-links">
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/download" className="btn btn-ghost hidden md:inline-flex">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </Link>
          <Link href="/book-demo" className="btn btn-primary">
            Book Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
