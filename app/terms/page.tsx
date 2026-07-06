import { SitePage } from "../components/site-page";

export default function TermsPage() {
  return (
    <SitePage
      eyebrow="Terms"
      title="Website terms of use"
      description="These terms govern access to and use of the ServiceOps AI marketing website."
    >
      <article className="section-frame" style={{ padding: "32px" }}>
        <p className="body-md" style={{ color: "var(--text-secondary)" }}>
          Content on this site is provided for informational purposes regarding ServiceOps AI products,
          pilot programs, and commercial offerings.
        </p>
        <p className="body-md" style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
          Submission of a demo form does not create a service contract. Commercial terms,
          implementation scope, and pricing are finalized in written agreements.
        </p>
        <p className="body-md" style={{ marginTop: "16px", color: "var(--text-secondary)" }}>
          You may not misuse the website or attempt unauthorized access to infrastructure,
          APIs, or data systems.
        </p>
      </article>
    </SitePage>
  );
}
