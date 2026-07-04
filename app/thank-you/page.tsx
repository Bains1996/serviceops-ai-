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
      <article className="section-frame rounded-3xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold">What to expect next</h2>
        <ol className="mt-4 space-y-2 text-sm leading-7 text-subtle">
          <li>1. Intro email with scheduling link.</li>
          <li>2. 30-minute operations workflow call.</li>
          <li>3. Pilot KPI baseline and rollout proposal.</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold">
            Back to Home
          </Link>
          <Link href="/case-studies" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#032d26]">
            View Case Studies
          </Link>
        </div>
      </article>
    </SitePage>
  );
}
