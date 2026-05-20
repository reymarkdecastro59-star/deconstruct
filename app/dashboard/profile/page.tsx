"use client";

import { useSession, signOut } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const provider = session?.user?.image ? "Google" : "Email / Password";

  return (
    <>
      <div className="dash-page-header">
        <div className="page-eyebrow">Account</div>
        <h1 className="page-title">Profile</h1>
      </div>

      <div className="dash-page-content" style={{ maxWidth: 640 }}>

        {/* Avatar + name */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20,
          padding: "24px 0 32px", borderBottom: "1px solid var(--rule)", marginBottom: 24,
        }}>
          {session?.user?.image ? (
            <img src={session.user.image} alt="" width={64} height={64}
              style={{ borderRadius: "50%", border: "2px solid var(--rule)" }} />
          ) : (
            <span style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--ink)", border: "2px solid var(--rule)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "var(--paper)", fontSize: 22, fontFamily: "var(--f-display)",
            }}>
              {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1 }}>
              {session?.user?.name ?? "—"}
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, opacity: 0.45, marginTop: 6, letterSpacing: "0.06em" }}>
              {session?.user?.email ?? "—"}
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="placeholder-section">
          <div className="placeholder-section-head">
            <span className="placeholder-section-title">Account details</span>
          </div>
          <div className="placeholder-section-body">
            <div className="placeholder-row">
              <span className="placeholder-row-label">Name</span>
              <span className="placeholder-row-value">{session?.user?.name ?? "—"}</span>
            </div>
            <div className="placeholder-row">
              <span className="placeholder-row-label">Email</span>
              <span className="placeholder-row-value">{session?.user?.email ?? "—"}</span>
            </div>
            <div className="placeholder-row">
              <span className="placeholder-row-label">Sign-in method</span>
              <span className="placeholder-row-value">{provider}</span>
            </div>
          </div>
        </div>

        <div className="placeholder-section">
          <div className="placeholder-section-head">
            <span className="placeholder-section-title">Edit profile</span>
            <span className="coming-soon-badge">Coming Day 4</span>
          </div>
          <div className="placeholder-section-body">
            <div className="placeholder-row">
              <span className="placeholder-row-label">Display name</span>
              <span className="placeholder-row-value">Editable in Day 4</span>
            </div>
            <div className="placeholder-row">
              <span className="placeholder-row-label">Password</span>
              <span className="placeholder-row-value">Change password — Day 4</span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div style={{ marginTop: 32 }}>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="cta-pill"
            style={{ color: "var(--dc-accent)", borderColor: "var(--dc-accent)" }}
          >
            Sign out <span className="arrow">→</span>
          </button>
        </div>

      </div>
    </>
  );
}
