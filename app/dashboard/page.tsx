"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { PaperAnalysis } from "@/lib/schemas/analysis";
import Link from "next/link";

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 32px", gap: 16, textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        border: "1px solid var(--rule)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--f-display)", fontSize: 28, opacity: 0.3,
      }}>
        ∅
      </div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 28, letterSpacing: "-0.02em", opacity: 0.3 }}>
        No analyses yet.
      </div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.35 }}>
        Upload a paper to get started
      </div>
      <Link href="/dashboard/analyze" className="cta-pill" style={{ marginTop: 8 }}>
        Analyze a paper <span className="arrow">→</span>
      </Link>
    </div>
  );
}

export default function PapersPage() {
  const { data: session } = useSession();
  const [papers, setPapers] = useState<PaperAnalysis[]>([]);

  useEffect(() => {
    const items: PaperAnalysis[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("analysis_")) {
        try { items.push(JSON.parse(sessionStorage.getItem(key)!)); } catch {}
      }
    }
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setPapers(items);
  }, []);

  const [greeting, setGreeting] = useState("Welcome");
  const [firstName, setFirstName] = useState("there");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
    setFirstName(session?.user?.name?.split(" ")[0] ?? "there");
  }, [session]);

  return (
    <>
      <div className="dash-page-header">
        <div className="page-eyebrow">{greeting}, {firstName}</div>
        <h1 className="page-title">Your papers</h1>
        {papers.length > 0 && (
          <p className="page-subtitle">
            {papers.length} {papers.length === 1 ? "analysis" : "analyses"} this session
          </p>
        )}
      </div>

      <div className="dash-page-content">
        {papers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="papers-grid">
            {papers.map((paper) => (
              <Link key={paper.id} href={`/analyze/${paper.id}`} className="paper-card">
                <div className="paper-card-field">{paper.field}</div>
                <div className="paper-card-title">{paper.title}</div>
                {paper.plainAbstract && (
                  <div className="paper-card-abstract">{paper.plainAbstract}</div>
                )}
                <div className="paper-card-footer">
                  <span>{paper.keywords.slice(0, 2).join(" · ")}</span>
                  <span>{new Date(paper.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </Link>
            ))}

            {/* Analyze new paper card */}
            <Link href="/dashboard/analyze" style={{
              border: "1.5px dashed var(--rule)", borderRadius: 8,
              padding: 20, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
              textDecoration: "none", color: "var(--ink)",
              minHeight: 160, transition: "border-color 150ms, background 150ms",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(14,27,48,0.4)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--paper-deep)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--rule)"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: 24, opacity: 0.25 }}>+</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.4 }}>
                Analyze new paper
              </span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
