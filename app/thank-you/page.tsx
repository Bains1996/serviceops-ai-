import Link from "next/link";

import { ConversionTracker } from "../components/conversion-tracker";
import { SitePage } from "../components/site-page";

export default function ThankYouPage() {
  return (
    <SitePage
      eyebrow="Thank You"
      title="Demo request received."
      description="Our team will contact you shortly to scope your dispatch exception and billing workflow pilot."
    >
      <ConversionTracker />
      <article className="section-frame" style={{ padding: "32px" }}>
        <h2 className="heading-lg">What to expect next</h2>
        <ol style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            "Intro email with scheduling link.",
            "30-minute operations workflow call.",
            "Pilot KPI baseline and rollout proposal.",
          ].map((step, i) => (
            <li key={step} className="body-md" style={{ color: "var(--text-secondary)" }}>{i + 1}. {step}</li>
          ))}
        </ol>
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-outline">Back to Home</Link>
          <Link href="/case-studies" className="btn btn-primary">View Case Studies</Link>
        </div>
      </article>
    </SitePage>
  );
}
