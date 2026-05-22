"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "var(--paper)",
  border: "1px solid var(--rule)",
  borderRadius: 4,
  color: "var(--ink)",
  padding: "11px 14px",
  fontFamily: "var(--f-sans)",
  fontSize: 14,
  outline: "none",
  transition: "border-color 150ms",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--f-mono)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--ink)",
  opacity: 0.55,
  marginBottom: 6,
  display: "block",
};

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", {
        email, password, redirect: false, callbackUrl: "/upload",
      });
      if (result?.url) {
        window.location.href = result.url;
      } else {
        setError("Account created but sign-in failed. Try signing in manually.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Brand panel */}
      <div className="auth-brand">
        <a href="/" className="auth-brand-logo">DeConstruct_</a>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p className="auth-brand-quote">
            Read less.<br />Understand<br />more.
          </p>
          <p className="auth-brand-meta">AI reading assistant · 2026</p>
        </div>
        <span className="auth-brand-meta">© 2026 DeConstruct_</span>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <h2>Create account</h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input
                type="text" required value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(14,27,48,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--rule)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(14,27,48,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--rule)")}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Password <span style={{ opacity: 0.5, fontWeight: 400 }}>— min. 8 characters</span>
              </label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(14,27,48,0.5)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--rule)")}
              />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--dc-accent)", fontFamily: "var(--f-sans)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cta-pill solid"
              style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or</span>
            <div className="auth-divider-line" />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/upload" })}
            className="cta-pill"
            style={{ width: "100%", justifyContent: "center", gap: 10 }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p style={{
            fontFamily: "var(--f-sans)", fontSize: 12,
            color: "var(--ink)", opacity: 0.5,
            margin: 0, textAlign: "center",
          }}>
            Already have an account?{" "}
            <a href="/sign-in" style={{ opacity: 1, textDecoration: "underline", color: "var(--ink)" }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
