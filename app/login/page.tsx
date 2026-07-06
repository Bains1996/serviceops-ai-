"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Login failed.");
      setLoading(false);
      return;
    }
    router.push("/control-tower");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <SiteNav />

      <section className="section-hero">
        <div style={{ maxWidth: "440px", margin: "0 auto" }}>
          <div className="text-center" style={{ marginBottom: "40px" }}>
            <p className="eyebrow" style={{ marginBottom: "16px" }}>Login</p>
            <h1 className="display-2">Welcome back.</h1>
            <p className="body-lg" style={{ marginTop: "12px", color: "var(--text-secondary)" }}>
              Sign in to access your Command Center.
            </p>
          </div>

          <div className="card" style={{ padding: "40px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                className="form-input"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="form-input"
              />
              <button onClick={submit} disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              {error && <p className="body-md" style={{ color: "var(--red)", textAlign: "center" }}>{error}</p>}
            </div>
          </div>

          <p className="body-md" style={{ textAlign: "center", marginTop: "24px", color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--accent)", fontWeight: "500" }}>Start free trial</Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
