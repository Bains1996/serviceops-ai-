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
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="section-frame rounded-3xl p-6 md:p-8">
          <div className="flex gap-3 text-sm">
            <button onClick={() => setMode("login")} className={`rounded-full px-4 py-2 ${mode === "login" ? "bg-[var(--accent)] text-[#032d26]" : "chip"}`}>Login</button>
            <button onClick={() => setMode("register")} className={`rounded-full px-4 py-2 ${mode === "register" ? "bg-[var(--accent)] text-[#032d26]" : "chip"}`}>Register</button>
          </div>
          <div className="mt-5 grid gap-3">
            {mode === "register" && (
              <>
                <input value={form.companyId} onChange={(event) => setForm((prev) => ({ ...prev, companyId: event.target.value }))} placeholder="Company ID (from onboarding)" className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none" />
                <input value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} placeholder="Full name" className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none" />
              </>
            )}
            <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Work email" className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none" />
            <input type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Password" className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2.5 text-sm outline-none" />
            <button onClick={submit} className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#032d26]">{mode === "login" ? "Sign In" : "Create Operator Account"}</button>
            {mode === "register" && <p className="text-xs text-subtle">Use the carrier company ID generated during integration setup.</p>}
            {status && <p className="text-sm text-subtle">{status}</p>}
          </div>
        </section>

        <section className="section-frame rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Current Session</h2>
          {!session ? (
            <p className="mt-4 text-sm text-subtle">No operator session active yet.</p>
          ) : (
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-subtle">Name:</span> {session.fullName}</p>
              <p><span className="text-subtle">Email:</span> {session.email}</p>
              <p><span className="text-subtle">Company:</span> {session.companyId}</p>
              <p><span className="text-subtle">Role:</span> {session.role}</p>
              <Link href="/control-tower" className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#032d26]">
                Open Control Tower
              </Link>
              <button onClick={logout} className="mt-4 rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.12em]">Sign Out</button>
            </div>
          )}
        </section>
      </div>
    </SitePage>
  );
}
