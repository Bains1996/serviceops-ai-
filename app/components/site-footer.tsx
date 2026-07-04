import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-subtle md:flex-row md:items-center md:justify-between md:px-8">
        <p>© {new Date().getFullYear()} ServiceOps AI. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4 uppercase tracking-[0.12em]">
          <Link href="/solutions" className="transition hover:text-[var(--text-primary)]">
            Solutions
          </Link>
          <Link href="/modules" className="transition hover:text-[var(--text-primary)]">
            Modules
          </Link>
          <Link href="/case-studies" className="transition hover:text-[var(--text-primary)]">
            Case Studies
          </Link>
          <Link href="/privacy" className="transition hover:text-[var(--text-primary)]">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-[var(--text-primary)]">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
