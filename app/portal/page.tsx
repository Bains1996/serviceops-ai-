"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { SitePage } from "../components/site-page";

type Session = {
  companyId: string;
  fullName: string;
  email: string;
  role: string;
};

export default function PortalPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ companyId: "", fullName: "", email: "", password: "" });
  const [status, setStatus] = useState<string | null>(null);

  const loadSession = async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = (await res.json()) as { session: Session | null };
    setSession(data.session);
  };

  useEffect(() => {
    void loadSession();
  }, []);

  const submit = async () => {
    setStatus(null);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login"
      ? { email: form.email, password: form.password }
      : { companyId: form.companyId, fullName: form.fullName, email: form.email, password: form.password };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.message ?? "Request failed.");
      return;
    }
    setStatus(mode === "login" ? "Signed in." : "Account created and signed in.");
    await loadSession();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
  };

  return (
    <SitePage eyebrow="Carrier Portal" title="Operator access for connected carriers." description="Carrier admins and dispatch operators can sign in here to access their ServiceOps AI workspace.">
      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "24px" }}>
        <section className="section-frame" style={{ padding: "32px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setMode("login")}
              className={`btn ${mode === "login" ? "btn-primary" : "btn-outline"}`}
              style={{ padding: "8px 16px", fontSize: "15px" }}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`btn ${mode === "register" ? "btn-primary" : "btn-outline"}`}
              style={{ padding: "8px 16px", fontSize: "15px" }}
            >
              Register
            </button>
          </div>
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {mode === "register" && (
              <>
                <input
                  value={form.companyId}
                  onChange={(event) => setForm((prev) => ({ ...prev, companyId: event.target.value }))}
                  placeholder="Company ID (from onboarding)"
                  className="form-input"
                />
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Full name"
                  className="form-input"
                />
              </>
            )}
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="Work email"
              className="form-input"
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Password"
              className="form-input"
            />
            <button onClick={submit} className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
              {mode === "login" ? "Sign In" : "Create Operator Account"}
            </button>
            {mode === "register" && <p className="small" style={{ color: "var(--text-muted)" }}>Use the carrier company ID generated during integration setup.</p>}
            {status && <p className="body-md" style={{ color: "var(--text-secondary)" }}>{status}</p>}
          </div>
        </section>

        <section className="section-frame" style={{ padding: "32px" }}>
          <h2 className="heading-lg">Current Session</h2>
          {!session ? (
            <p className="body-md" style={{ marginTop: "16px", color: "var(--text-muted)" }}>No operator session active yet.</p>
          ) : (
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <p className="body-md"><span style={{ color: "var(--text-muted)" }}>Name:</span> {session.fullName}</p>
              <p className="body-md"><span style={{ color: "var(--text-muted)" }}>Email:</span> {session.email}</p>
              <p className="body-md"><span style={{ color: "var(--text-muted)" }}>Company:</span> {session.companyId}</p>
              <p className="body-md"><span style={{ color: "var(--text-muted)" }}>Role:</span> {session.role}</p>
              <Link href="/control-tower" className="btn btn-primary" style={{ marginTop: "16px", alignSelf: "flex-start" }}>
                Open Control Tower
              </Link>
              <button onClick={logout} className="btn btn-outline" style={{ marginTop: "8px", alignSelf: "flex-start" }}>Sign Out</button>
            </div>
          )}
        </section>
      </div>
    </SitePage>
  );
}
