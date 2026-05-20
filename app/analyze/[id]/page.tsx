"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { PaperAnalysis } from "@/lib/schemas/analysis";
import { analysisToMarkdown } from "@/lib/utils/markdown";

function UserAvatar() {
  const { data: session } = useSession();
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      title="Sign out"
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}
    >
      {session?.user?.image ? (
        <img src={session.user.image} alt="" width={28} height={28} style={{ borderRadius: "50%", display: "block" }} />
      ) : (
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--ink-2)", border: "1px solid var(--rule)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "var(--paper)", fontSize: 11,
        }}>
          {session?.user?.name?.[0] ?? "?"}
        </span>
      )}
    </button>
  );
}

function CardLabel({ code, title }: { code: string; title: string }) {
  return (
    <div className="result-card-head">
      <span className="card-label">{code}</span>
      <span className="card-title">{title}</span>
    </div>
  );
}

export default function AnalyzePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`analysis_${id}`);
    if (raw) {
      setAnalysis(JSON.parse(raw));
    } else {
      setNotFound(true);
    }
  }, [id]);

  function handleExport() {
    if (!analysis) return;
    const md = analysisToMarkdown(analysis);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analysis.title.slice(0, 60).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (notFound) {
    return (
      <div className="results-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.45 }}>404</div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 36, letterSpacing: "-0.02em" }}>Analysis not found.</div>
        <button className="cta-pill" onClick={() => router.push("/upload")}>
          Back to dashboard <span className="arrow">←</span>
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="results-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 28, fontStyle: "italic", opacity: 0.4 }}>Loading&hellip;</div>
      </div>
    );
  }

  const createdDate = new Date(analysis.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="results-page">
      {/* Nav */}
      <nav className="results-nav">
        <a href="/upload" className="dc-logo" style={{ fontSize: 20 }}>
          DeConstruct<span className="cursor" />
        </a>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.45 }}>
            {createdDate}
          </span>
          <button onClick={handleExport} className="cta-pill" style={{ padding: "8px 16px", fontSize: 10 }}>
            Export .md <span className="arrow">↓</span>
          </button>
          <a href="/upload" className="cta-pill" style={{ padding: "8px 16px", fontSize: 10 }}>
            New paper <span className="arrow">↑</span>
          </a>
          <UserAvatar />
        </div>
      </nav>

      {/* Hero */}
      <div className="results-hero">
        <div className="field-tag">{analysis.field}</div>
        <h1 className="paper-title">{analysis.title}</h1>
        <div className="keywords">
          {analysis.keywords.map((k, i) => (
            <span className="tag-pill" key={i}>{k}</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="results-body">
        {/* Main column */}
        <main className="results-main">

          {/* Plain abstract */}
          <div className="result-card">
            <CardLabel code="FT-01" title="Plain-language summary" />
            <div className="result-card-body">
              <p style={{ fontSize: 16, lineHeight: 1.85 }}>{analysis.plainAbstract}</p>
            </div>
          </div>

          {/* Contributions */}
          <div className="result-card">
            <CardLabel code="FT-02" title="Key contributions" />
            <div className="result-card-body">
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.contributions.map((c, i) => (
                  <li key={i} style={{ lineHeight: 1.7, fontSize: 14 }}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Methodology */}
          <div className="result-card">
            <CardLabel code="FT-03" title="Methodology" />
            <div className="result-card-body">
              <p style={{ lineHeight: 1.8 }}>{analysis.methodology}</p>
            </div>
          </div>

          {/* Findings */}
          <div className="result-card">
            <CardLabel code="FT-04" title="Key findings & results" />
            <div className="result-card-body">
              <p style={{ lineHeight: 1.8 }}>{analysis.findings}</p>
            </div>
          </div>

          {/* Sections */}
          <div className="result-card">
            <CardLabel code="FT-05" title="Section breakdown" />
            <div className="result-card-body" style={{ padding: "0 28px" }}>
              {analysis.sections.map((s, i) => (
                <div className="section-item" key={i}>
                  <div className="sec-header">
                    <span className="sec-num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="sec-title">{s.title}</div>
                  </div>
                  <p className="sec-summary">{s.summary}</p>
                  <div className="key-points">
                    {s.keyPoints.map((kp, j) => (
                      <div className="key-point" key={j}>{kp}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations */}
          <div className="result-card">
            <CardLabel code="FT-06" title="Limitations" />
            <div className="result-card-body">
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.limitations.map((l, i) => (
                  <li key={i} style={{ lineHeight: 1.7, fontSize: 14 }}>{l}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Future work */}
          <div className="result-card">
            <CardLabel code="FT-07" title="Future work" />
            <div className="result-card-body">
              <p style={{ lineHeight: 1.8 }}>{analysis.futureWork}</p>
            </div>
          </div>

        </main>

        {/* Sidebar */}
        <aside className="results-sidebar">
          {/* Field — inverted card */}
          <div className="sidebar-card ink-card">
            <span className="card-label">FT-03 · Field</span>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--paper)" }}>
              {analysis.field}
            </div>
          </div>

          {/* Keywords */}
          <div className="sidebar-card">
            <span className="card-label">Keywords</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {analysis.keywords.map((k, i) => (
                <span className="mini-tag" key={i}>{k}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="sidebar-card">
            <span className="card-label">Analysis stats</span>
            <div className="stats-grid">
              {[
                { label: "Sections",      value: analysis.sections.length },
                { label: "Concepts",      value: analysis.concepts.length },
                { label: "Relationships", value: analysis.relationships.length },
                { label: "Keywords",      value: analysis.keywords.length },
              ].map(s => (
                <div className="stat-cell" key={s.label}>
                  <span className="stat-num">{s.value}</span>
                  <span className="stat-lbl">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concept map placeholder */}
          <div className="sidebar-card">
            <span className="card-label">Concept map · {analysis.concepts.length} nodes</span>
            <div className="cmap-placeholder">
              Interactive map — Day 3
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 9 }}>
              {analysis.concepts.slice(0, 6).map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: c.type === "core" ? "#1c3556" : c.type === "method" ? "#3d5a3b" : c.type === "result" ? "#b8410b" : "#6b4f1c",
                  }} />
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.45, width: 44, flexShrink: 0 }}>
                    {c.type}
                  </span>
                  <span style={{ lineHeight: 1.3, opacity: 0.8 }}>{c.id.replace(/-/g, " ")}</span>
                </div>
              ))}
              {analysis.concepts.length > 6 && (
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, opacity: 0.35, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
                  +{analysis.concepts.length - 6} more
                </div>
              )}
            </div>
          </div>

          {/* Export */}
          <button onClick={handleExport} className="cta-pill" style={{ width: "100%", justifyContent: "center" }}>
            Export to Markdown <span className="arrow">↓</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
