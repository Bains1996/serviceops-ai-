import { SitePage } from "../components/site-page";

export default function PrivacyPage() {
  return (
    <SitePage
      eyebrow="Privacy"
      title="Privacy policy for ServiceOps AI website"
      description="This page describes how lead data submitted through the website is handled for demo and pilot discussions."
    >
      <article className="section-frame" style={{ padding: "32px" }}>
        <p className="body-md" style={{ color: "var(--text-secondary)" }}>
          We collect business contact information that you provide in the Book Demo form,
          including name, work email, company, role, fleet size, and workflow challenges.
        </p>
        <p className="body-md" style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
          This information is used only for sales follow-up, pilot scoping, and customer support
          related to ServiceOps AI offerings.
        </p>
        <p className="body-md" style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
          We do not sell your personal information. Data may be processed by trusted service providers
          used to manage lead intake and communications.
        </p>
        <p className="body-md" style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
          To request deletion of submitted lead data, contact your ServiceOps AI account representative.
        </p>
      </article>
    </SitePage>
  );
}
