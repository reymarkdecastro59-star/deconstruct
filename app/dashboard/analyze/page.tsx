"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { analyzeAction } from "@/app/actions/analyze";

type Status = "idle" | "reading" | "analyzing" | "error";

export default function AnalyzePage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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

  return (
    <>
      <div className="dash-page-header">
        <div className="page-eyebrow">New analysis</div>
        <h1 className="page-title">Analyze a paper</h1>
        <p className="page-subtitle">Upload a machine-readable PDF. Results in under 30 seconds.</p>
      </div>

      <div className="dash-page-content" style={{ maxWidth: 720 }}>
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
    </>
  );
}
