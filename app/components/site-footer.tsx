import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
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
            }}>
              SO
            </span>
            <span className="heading-md">ServiceOps AI</span>
          </div>
          <p className="body-md" style={{ maxWidth: "320px", color: "var(--text-secondary)", marginTop: "12px" }}>
            AI-powered dispatch and operations platform for trucking carriers.
            Run dispatch 24/7, resolve exceptions faster, keep every action auditable.
          </p>
        </div>

        <div>
          <h4>Product</h4>
          <ul>
            <li><Link href="/product">Product</Link></li>
            <li><Link href="/ai-brain">AI Brain</Link></li>
            <li><Link href="/integrations">Integrations</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/control-tower">Command Center</Link></li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><Link href="/solutions">Solutions</Link></li>
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

      <div className="footer-bottom">
        <p className="caption" style={{ color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} ServiceOps AI. All rights reserved.
        </p>
        <p className="caption" style={{ color: "var(--text-muted)" }}>
          Built for trucking carriers across North America.
        </p>
      </div>
    </footer>
  );
}
