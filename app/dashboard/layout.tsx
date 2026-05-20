"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

function IconPapers() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="9" height="11" rx="1" />
      <path d="M5 3V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1" />
      <path d="M5 7h5M5 10h3" />
    </svg>
  );
}
function IconAnalyze() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12V4M5 7l3-3 3 3" />
      <rect x="2" y="12" width="12" height="2" rx="1" fill="currentColor" stroke="none" opacity="0.4" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" />
    </svg>
  );
}

const NAV = [
  { href: "/dashboard",          label: "Papers",   Icon: IconPapers },
  { href: "/dashboard/analyze",  label: "Analyze",  Icon: IconAnalyze },
];
const NAV_BOTTOM = [
  { href: "/dashboard/settings", label: "Settings", Icon: IconSettings },
  { href: "/dashboard/profile",  label: "Profile",  Icon: IconProfile },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="app-sidebar">
        {/* Logo */}
        <div className="sidebar-logo-wrap">
          <Link href="/dashboard" style={{
            fontFamily: "var(--f-display)", fontSize: 22,
            color: "var(--paper)", letterSpacing: "-0.02em",
            lineHeight: 1, textDecoration: "none",
            display: "flex", alignItems: "baseline", gap: 0,
          }}>
            DeConstruct
            <span style={{
              display: "inline-block", width: "0.38em", height: "0.7em",
              background: "var(--paper)", marginLeft: 2,
              verticalAlign: "middle", transform: "translateY(-1px)",
            }} />
          </Link>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 9,
            textTransform: "uppercase", letterSpacing: "0.14em",
            color: "rgba(236,227,205,0.3)", marginTop: 6,
          }}>
            AI reading assistant
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item${isActive(href) ? " active" : ""}`}
            >
              <Icon />
              {label}
            </Link>
          ))}

          <div className="sidebar-divider" />

          {NAV_BOTTOM.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item${isActive(href) ? " active" : ""}`}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="sidebar-user-section">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" width={28} height={28}
              style={{ borderRadius: "50%", flexShrink: 0 }} />
          ) : (
            <span style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: "rgba(236,227,205,0.12)", border: "1px solid rgba(236,227,205,0.18)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "rgba(236,227,205,0.7)", fontSize: 11, fontFamily: "var(--f-sans)",
            }}>
              {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{session?.user?.name ?? "Account"}</div>
            <div className="sidebar-user-email">{session?.user?.email ?? ""}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="sidebar-signout-btn"
            title="Sign out"
          >
            <IconLogout />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
