export default function SettingsPage() {
  return (
    <>
      <div className="dash-page-header">
        <div className="page-eyebrow">Configuration</div>
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="dash-page-content" style={{ maxWidth: 640 }}>

        <div className="placeholder-section">
          <div className="placeholder-section-head">
            <span className="placeholder-section-title">AI Provider</span>
            <span className="coming-soon-badge">Coming Day 4</span>
          </div>
          <div className="placeholder-section-body">
            <div className="placeholder-row">
              <span className="placeholder-row-label">Primary provider</span>
              <span className="placeholder-row-value">Gemini 1.5 Flash</span>
            </div>
            <div className="placeholder-row">
              <span className="placeholder-row-label">Fallback provider</span>
              <span className="placeholder-row-value">Groq · Llama 3.3 70b</span>
            </div>
            <div className="placeholder-row">
              <span className="placeholder-row-label">Analysis depth</span>
              <span className="placeholder-row-value">Standard</span>
            </div>
          </div>
        </div>

        <div className="placeholder-section">
          <div className="placeholder-section-head">
            <span className="placeholder-section-title">Appearance</span>
            <span className="coming-soon-badge">Coming Day 5</span>
          </div>
          <div className="placeholder-section-body">
            <div className="placeholder-row">
              <span className="placeholder-row-label">Theme</span>
              <span className="placeholder-row-value">Light (default)</span>
            </div>
            <div className="placeholder-row">
              <span className="placeholder-row-label">Font size</span>
              <span className="placeholder-row-value">Medium</span>
            </div>
          </div>
        </div>

        <div className="placeholder-section">
          <div className="placeholder-section-head">
            <span className="placeholder-section-title">Data &amp; Privacy</span>
            <span className="coming-soon-badge">Coming Day 4</span>
          </div>
          <div className="placeholder-section-body">
            <div className="placeholder-row">
              <span className="placeholder-row-label">Analysis history</span>
              <span className="placeholder-row-value">Session only (not persisted)</span>
            </div>
            <div className="placeholder-row">
              <span className="placeholder-row-label">PDF storage</span>
              <span className="placeholder-row-value">Never stored</span>
            </div>
            <div className="placeholder-row">
              <span className="placeholder-row-label">Export format</span>
              <span className="placeholder-row-value">Markdown (.md)</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
