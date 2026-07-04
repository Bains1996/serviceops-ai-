import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
              SO
            </span>
            <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              ServiceOps AI
            </span>
          </div>
          <p className="max-w-xs text-sm text-[var(--text-secondary)] leading-6">
            AI-powered dispatch and operations platform for trucking carriers. Run dispatch 24/7,
            resolve exceptions faster, keep every action auditable.
          </p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><Link href="/solutions">Solutions</Link></li>
            <li><Link href="/modules">Modules</Link></li>
            <li><Link href="/integrations">Integrations</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/control-tower">Command Center</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/case-studies">Case Studies</Link></li>
            <li><Link href="/book-demo">Book Demo</Link></li>
            <li><Link href="/download">Download</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 md:flex-row">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} ServiceOps AI. All rights reserved.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Built for trucking carriers across North America.
          </p>
        </div>
      </div>
    </footer>
  );
}
