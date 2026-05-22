"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { analyzeAction } from "@/app/actions/analyze";
import { ATTENTION_SAMPLE } from "@/lib/sample/attention";
import type { PaperAnalysis } from "@/lib/schemas/analysis";

type Status = "idle" | "reading" | "analyzing" | "error";

const MAX_STORED = 20;

function saveAnalysis(data: PaperAnalysis) {
  localStorage.setItem(`analysis_${data.id}`, JSON.stringify(data));
  const keys = Object.keys(localStorage).filter(k => k.startsWith("analysis_"));
  if (keys.length > MAX_STORED) {
    const sorted = keys
      .map(k => ({ k, t: (() => { try { return JSON.parse(localStorage.getItem(k)!).createdAt as string; } catch { return ""; } })() }))
      .sort((a, b) => a.t.localeCompare(b.t));
    localStorage.removeItem(sorted[0].k);
  }
}

function loadRecent(): PaperAnalysis[] {
  const items: PaperAnalysis[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("analysis_")) {
      try { items.push(JSON.parse(localStorage.getItem(key)!)); } catch {}
    }
  }
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function UserAvatar() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
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
          background: "var(--ink)", border: "1px solid rgba(14,27,48,0.15)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "var(--paper)", fontSize: 12, fontFamily: "var(--f-sans)",
        }}>
          {session?.user?.name?.[0] ?? "?"}
        </span>
      )}
    </button>
  );
}

function RecentList({ items, onDelete }: { items: PaperAnalysis[]; onDelete: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 24, fontStyle: "italic", opacity: 0.16, lineHeight: 1, marginBottom: 10 }}>
          Nothing yet.
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.32 }}>
          Upload a paper to get started
        </div>
      </div>
    );
  }

  return (
    <div>
      {items.map((a, i) => (
        <div
          key={a.id}
          style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            padding: "14px 0",
            borderBottom: i < items.length - 1 ? "1px solid var(--rule-soft)" : "none",
          }}
        >
          <a
            href={`/analyze/${a.id}`}
            className="recent-item"
            style={{ flex: 1, display: "block", textDecoration: "none" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
              <span className="recent-item-field">{a.field}</span>
              <span className="recent-item-date">
                {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="recent-item-title">{a.title}</div>
          </a>
          <button
            onClick={() => onDelete(a.id)}
            title="Remove"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "2px 4px", opacity: 0.25, fontSize: 14, lineHeight: 1,
              color: "var(--ink)", flexShrink: 0, marginTop: 2,
              transition: "opacity 150ms",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.25")}
          >
            ×
          </button>
        </div>
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
    setRecent(loadRecent().slice(0, 8));
  }, []);

  function handleDelete(id: string) {
    localStorage.removeItem(`analysis_${id}`);
    setRecent(prev => prev.filter(a => a.id !== id));
  }

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
      saveAnalysis(result.data);
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

  function handleSample() {
    saveAnalysis(ATTENTION_SAMPLE);
    router.push(`/analyze/${ATTENTION_SAMPLE.id}`);
  }

  const [greeting, setGreeting] = useState("");
  const [firstName, setFirstName] = useState("");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
    setFirstName(session?.user?.name?.split(" ")[0] ?? "");
  }, [session]);

  return (
    <div className="upload-page">
      {/* Nav */}
      <nav className="results-nav">
        <a href="/" className="dc-logo" style={{ fontSize: 20 }}>DeConstruct_</a>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {session?.user?.name && (
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.4 }}>
              {session.user.name}
            </span>
          )}
          <UserAvatar />
        </div>
      </nav>

      {/* Page header */}
      <div className="upload-page-header">
        {greeting && firstName && (
          <div className="eyebrow">{greeting}, {firstName}</div>
        )}
        <h1>Analyze a paper.</h1>
      </div>

      {/* Body */}
      <div className="upload-body">

        {/* Upload zone */}
        <div className="upload-main">
          {status === "reading" || status === "analyzing" ? (
            <div className="upload-zone" style={{ cursor: "default" }}>
              <div className="upload-loading">
                <div className="step-label">Processing — step {status === "reading" ? 1 : 2} of 2</div>
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

          {/* Sample paper */}
          {status === "idle" && (
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4 }}>
                or try a sample
              </span>
              <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
            </div>
          )}
          {status === "idle" && (
            <button
              onClick={handleSample}
              className="cta-pill"
              style={{ marginTop: 14, width: "100%", justifyContent: "center" }}
            >
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.55 }}>
                Sample
              </span>
              Attention Is All You Need
              <span className="arrow">→</span>
            </button>
          )}
        </div>

        {/* Recent analyses */}
        <aside className="upload-aside">
          <div className="upload-aside-head">
            <span className="dc-eyebrow dim">Recent</span>
            {recent.length > 0 && (
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, opacity: 0.32, letterSpacing: "0.08em" }}>
                {recent.length}
              </span>
            )}
          </div>
          <RecentList items={recent} onDelete={handleDelete} />
        </aside>

      </div>
    </div>
  );
}
