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
            <span className="heading-md text-[var(--text)]">ServiceOps AI</span>
          </div>
          <p className="body-md mt-4 max-w-xs text-[var(--text-secondary)]">
            AI-powered dispatch and operations platform for trucking carriers.
            Run dispatch 24/7, resolve exceptions faster, keep every action auditable.
          </p>
        </div>

        <div>
          <h4>Product</h4>
          <ul>
            <li><Link href="/solutions">Solutions</Link></li>
            <li><Link href="/modules">Modules</Link></li>
            <li><Link href="/integrations">Integrations</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/control-tower">Command Center</Link></li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><Link href="/case-studies">Case Studies</Link></li>
            <li><Link href="/book-demo">Book Demo</Link></li>
            <li><Link href="/download">Download</Link></li>
          </ul>
        </div>

        <div>
          <h4>Legal</h4>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--page-max)] pt-8 mt-8" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="caption text-[var(--text-muted)]">
            © {new Date().getFullYear()} ServiceOps AI. All rights reserved.
          </p>
          <p className="caption text-[var(--text-muted)]">
            Built for trucking carriers across North America.
          </p>
        </div>
      </div>
    </footer>
  );
}
