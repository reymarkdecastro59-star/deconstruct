"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { analyzeAction } from "@/app/actions/analyze";
import type { PaperAnalysis } from "@/lib/schemas/analysis";

type Status = "idle" | "reading" | "analyzing" | "error";

function UserAvatar() {
  const { data: session } = useSession();
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      title="Sign out"
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}
    >
      {session?.user?.image ? (
        <img src={session.user.image} alt="" width={30} height={30} style={{ borderRadius: "50%", display: "block" }} />
      ) : (
        <span style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "#1a2b48", border: "1px solid rgba(236,227,205,0.2)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "var(--paper)", fontSize: 12,
        }}>
          {session?.user?.name?.[0] ?? "?"}
        </span>
      )}
    </button>
  );
}

function RecentList({ items }: { items: PaperAnalysis[] }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--f-display)", fontSize: 28,
          fontStyle: "italic", opacity: 0.18, lineHeight: 1, marginBottom: 10,
        }}>
          No analyses yet.
        </div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 10,
          textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.35,
        }}>
          Upload a paper to get started
        </div>
      </div>
    );
  }

  return (
    <div>
      {items.map((a, i) => (
        <a
          key={a.id}
          href={`/analyze/${a.id}`}
          className="recent-item"
          style={{
            display: "block",
            padding: "14px 0",
            borderBottom: i < items.length - 1 ? "1px solid var(--rule-soft)" : "none",
            textDecoration: "none",
          }}
        >
          <div style={{
            display: "flex", alignItems: "baseline",
            justifyContent: "space-between", gap: 8, marginBottom: 5,
          }}>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: 9,
              textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.45,
            }}>
              {a.field}
            </span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, opacity: 0.3, flexShrink: 0 }}>
              {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <div style={{
            fontFamily: "var(--f-display)", fontSize: 17,
            lineHeight: 1.2, letterSpacing: "-0.01em",
          }}>
            {a.title}
          </div>
        </a>
      ))}
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [recent, setRecent] = useState<PaperAnalysis[]>([]);

  useEffect(() => {
    const items: PaperAnalysis[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("analysis_")) {
        try { items.push(JSON.parse(sessionStorage.getItem(key)!)); } catch {}
      }
    }
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecent(items.slice(0, 8));
  }, []);

  const analyze = useCallback(async (file: File) => {
    setStatus("reading");
    const formData = new FormData();
    formData.append("file", file);
    try {
      setStatus("analyzing");
      const result = await analyzeAction(formData);
      if (!result.ok) {
        setErrorMsg(result.message);
        setStatus("error");
        return;
      }
      sessionStorage.setItem(`analysis_${result.data.id}`, JSON.stringify(result.data));
      router.push(`/analyze/${result.data.id}`);
    } catch {
      setErrorMsg("Could not reach the analysis service. Please check your connection.");
      setStatus("error");
    }
  }, [router]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) analyze(accepted[0]);
  }, [analyze]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: status === "analyzing" || status === "reading",
  });

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav className="results-nav">
        <a href="/" className="dc-logo" style={{ fontSize: 20 }}>
          DeConstruct<span className="cursor" />
        </a>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: 10,
            textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.45,
          }}>
            {session?.user?.name ?? ""}
          </span>
          <UserAvatar />
        </div>
      </nav>

      {/* Dashboard body */}
      <div className="dashboard-body">

        {/* Left — upload */}
        <div className="dash-main">
          <div className="dash-welcome">
            <div className="dc-eyebrow dim" style={{ marginBottom: 10 }}>
              {greeting}, {firstName}
            </div>
            <h1 style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(36px, 4vw, 60px)",
              letterSpacing: "-0.025em", lineHeight: 1,
              margin: "0 0 40px", fontWeight: 400,
            }}>
              Analyze a paper.
            </h1>
          </div>

          {status === "reading" || status === "analyzing" ? (
            <div className="upload-zone" style={{ cursor: "default" }}>
              <div className="upload-loading">
                <div className="step-label">
                  Processing — step {status === "reading" ? 1 : 2} of 2
                </div>
                <div className="step-title">
                  {status === "reading" ? "Reading document" : "Analyzing with AI"}&hellip;
                </div>
                <div className="upload-progress">
                  <div className="pip active" />
                  <div className={`pip${status === "analyzing" ? " active" : ""}`} />
                </div>
              </div>
            </div>
          ) : status === "error" ? (
            <div className="upload-zone">
              <div className="upload-error">
                <div className="err-code">Analysis failed</div>
                <div className="err-msg">{errorMsg}</div>
                <button className="cta-pill" onClick={() => setStatus("idle")}>
                  Try again <span className="arrow">↩</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`upload-zone${isDragActive ? " drag-over" : ""}`}
            >
              <input {...getInputProps()} />
              <span className="upload-ico">↑</span>
              <div className="upload-title">Drag &amp; drop your PDF here</div>
              <div className="upload-sub">PDF · Up to 20 MB · Machine-readable only</div>
              <span className="cta-pill solid" style={{ pointerEvents: "none" }}>
                Browse file <span className="arrow">→</span>
              </span>
              <div className="upload-hint">
                Processed server-side and never stored. Analysis returns in under 30 seconds.
              </div>
            </div>
          )}
        </div>

        {/* Right — recent analyses */}
        <aside className="dash-sidebar">
          <div style={{
            display: "flex", alignItems: "baseline",
            justifyContent: "space-between",
            paddingBottom: 14, borderBottom: "1px solid var(--rule)",
            marginBottom: 4,
          }}>
            <span className="dc-eyebrow dim">Recent analyses</span>
            {recent.length > 0 && (
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: 10,
                opacity: 0.35, letterSpacing: "0.08em",
              }}>
                {recent.length}
              </span>
            )}
          </div>
          <RecentList items={recent} />
        </aside>

      </div>
    </div>
  );
}
