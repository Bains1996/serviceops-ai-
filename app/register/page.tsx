"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "company">("info");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", companyName: "", fleetSize: "5-20" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    const companyId = form.companyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Registration failed.");
      setLoading(false);
      return;
    }
    router.push("/control-tower");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SiteNav />

      <section className="section-hero">
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div className="text-center" style={{ marginBottom: "40px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px" }}>Start Free Trial</p>
            <h1 className="display-2">Get started in 20 minutes</h1>
            <p className="body-lg" style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
              $49/truck/month. All features included. 30 days free. No credit card required.
            </p>
          </div>

          {/* Progress */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
            <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: "var(--accent)" }} />
            <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: step === "company" ? "var(--accent)" : "var(--grey-20)" }} />
          </div>

          <div className="card" style={{ padding: "40px" }}>
            {step === "info" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p className="body-md" style={{ fontWeight: "600", marginBottom: "8px" }}>Your details</p>
                <input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Full name"
                  className="form-input"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Work email"
                  className="form-input"
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Password (8+ characters)"
                  className="form-input"
                />
                <button
                  onClick={() => {
                    if (!form.fullName || !form.email || !form.password) {
                      setError("All fields are required.");
                      return;
                    }
                    if (form.password.length < 8) {
                      setError("Password must be at least 8 characters.");
                      return;
                    }
                    setError(null);
                    setStep("company");
                  }}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%" }}
                >
                  Continue
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p className="body-md" style={{ fontWeight: "600", marginBottom: "8px" }}>Your company</p>
                <input
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Company name"
                  className="form-input"
                />
                <div>
                  <p className="small" style={{ color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Fleet size</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {["1-4", "5-20", "20-50", "50-100", "100+"].map((size) => (
                      <button
                        key={size}
                        onClick={() => update("fleetSize", size)}
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          border: form.fleetSize === size ? "1px solid var(--accent)" : "1px solid var(--border)",
                          background: form.fleetSize === size ? "var(--accent-soft)" : "transparent",
                          color: form.fleetSize === size ? "var(--accent)" : "var(--text)",
                          fontWeight: "600",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button onClick={() => setStep("info")} className="btn btn-secondary" style={{ flex: 1 }}>
                    Back
                  </button>
                  <button
                    onClick={submit}
                    disabled={loading || !form.companyName}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    {loading ? "Creating account..." : "Start Free Trial"}
                  </button>
                </div>
              </div>
            )}
            {error && <p className="body-md" style={{ color: "var(--red)", textAlign: "center", marginTop: "12px" }}>{error}</p>}
          </div>

          <p className="body-md" style={{ textAlign: "center", marginTop: "24px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: "500" }}>Sign in</Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
