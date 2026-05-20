"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const C = {
  bg: "#0e1b30",
  card: "#1a2b48",
  border: "rgba(236,227,205,0.1)",
  text: "#ece3cd",
  muted: "rgba(236,227,205,0.5)",
  dim: "rgba(236,227,205,0.3)",
  inputBg: "#0a1525",
  inputBorder: "rgba(236,227,205,0.18)",
  inputFocus: "rgba(236,227,205,0.45)",
  error: "#e05a2b",
  rule: "rgba(236,227,205,0.12)",
} as const;

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: C.inputBg,
  border: `1px solid ${C.inputBorder}`,
  borderRadius: 4, color: C.text,
  padding: "10px 14px",
  fontFamily: "var(--font-geist), sans-serif",
  fontSize: 14, outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
  fontSize: 10, letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: C.muted, marginBottom: 6, display: "block",
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email, password, redirect: false, callbackUrl: "/upload",
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>

      <a href="/" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontSize: 32, color: C.text, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 8, textDecoration: "none", display: "block" }}>
        DeConstruct<span style={{ display: "inline-block", width: "0.38em", height: "0.72em", background: C.text, marginLeft: 2, verticalAlign: "middle", transform: "translateY(-1px)" }} />
      </a>
      <p style={{ fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace", fontSize: 10, color: "rgba(236,227,205,0.45)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 40 }}>
        AI reading assistant · Sign in to continue
      </p>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(0,0,0,0.4)", borderRadius: 8, padding: 32, width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 20 }}>

        <h2 style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif", fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em", color: C.text, margin: 0 }}>
          Sign in
        </h2>

        {/* Credentials form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = C.inputFocus)}
              onBlur={e => (e.currentTarget.style.borderColor = C.inputBorder)}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = C.inputFocus)}
              onBlur={e => (e.currentTarget.style.borderColor = C.inputBorder)}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 12, color: C.error, fontFamily: "var(--font-geist), sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "11px 20px",
              background: loading ? "rgba(236,227,205,0.6)" : C.text,
              color: C.bg, border: "none", borderRadius: 4,
              fontFamily: "var(--font-geist), sans-serif",
              fontSize: 13, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em", transition: "background 200ms",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: C.rule }} />
          <span style={{ fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace", fontSize: 10, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>or</span>
          <div style={{ flex: 1, height: 1, background: C.rule }} />
        </div>

        {/* Google */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/upload" })}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "transparent", border: `1px solid ${C.inputBorder}`, color: C.text, borderRadius: 4, padding: "11px 20px", fontFamily: "var(--font-geist), sans-serif", fontSize: 14, cursor: "pointer", transition: "border-color 200ms, background 200ms" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(236,227,205,0.5)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(236,227,205,0.05)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.inputBorder; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p style={{ fontFamily: "var(--font-geist), sans-serif", fontSize: 12, color: "rgba(236,227,205,0.45)", margin: 0, textAlign: "center" }}>
          New to DeConstruct?{" "}
          <a href="/sign-up" style={{ color: C.text, textDecoration: "underline" }}>Create an account</a>
        </p>
      </div>
    </div>
  );
}

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
