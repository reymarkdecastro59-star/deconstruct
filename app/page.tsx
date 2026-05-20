"use client";

import { useSession, signOut } from "next-auth/react";

/* =========================================================
   DATA
   ========================================================= */
const STEPS = [
  { n: "01", title: "Upload", desc: "Drop a PDF up to 20 MB. Machine-readable papers process in under thirty seconds.", ico: "↑" },
  { n: "02", title: "Extract", desc: "Server-side text extraction strips headers, footers, and OCR artifacts before analysis.", ico: "⊟" },
  { n: "03", title: "Analyze", desc: "A structured prompt returns schema-validated JSON: abstract, methodology, concepts, edges.", ico: "◇" },
  { n: "04", title: "Explore", desc: "Read summaries on the left, traverse a draggable concept map on the right. Export to Markdown.", ico: "→" },
];

const FEATURES = [
  {
    id: "FT-01",
    title: "Plain-language abstract",
    desc: "A 2–3 sentence layperson rewrite of the paper, distinct from the academic abstract. Useful for triage and for explaining your reading to a non-specialist.",
    sample: "The authors show that machine-translation models can drop recurrence entirely and rely on attention to learn dependencies across an input sequence.",
  },
  {
    id: "FT-02",
    title: "Methodology breakdown",
    desc: "Three to six sentences identifying experimental design, data, controls, and analysis. Helps evaluate whether the claims are well-supported before reading in depth.",
    tags: ["Quantitative", "Ablation", "BLEU score", "WMT-14 corpus", "8 GPUs", "Adam optimizer"],
  },
  {
    id: "FT-03",
    title: "Field classification",
    desc: "Single-line discipline tag — set near the title so you know what mental model to load.",
    tags: ["CS / Machine Learning", "Subfield: NLP", "Tier-1 venue"],
  },
];

/* =========================================================
   BOOK 3D
   ========================================================= */
function Book3D() {
  const coverSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 470"><text x="170" y="195" font-family="Georgia,'Times New Roman',serif" font-size="34" fill="#ece5d0" text-anchor="middle" letter-spacing="0.5">DeConstruct</text><text x="170" y="225" font-family="Georgia,'Times New Roman',serif" font-size="28" fill="#ece5d0" text-anchor="middle" opacity="0.7" font-style="italic">_</text><text x="170" y="360" font-family="Courier New,monospace" font-size="10" fill="#ece5d0" text-anchor="middle" opacity="0.45" letter-spacing="2">Vol. I · 2026</text></svg>`
  );
  const spineSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 470"><text x="26" y="240" font-family="Georgia,'Times New Roman',serif" font-size="13" fill="#ece5d0" text-anchor="middle" letter-spacing="0.5" transform="rotate(90 26 240)">DeConstruct_</text></svg>`
  );

  return (
    <>
      <div className="book-shadow" />
      <div className="book">
        <div className="book-face front" style={{
          backgroundImage: `url("data:image/svg+xml,${coverSvg}"), radial-gradient(ellipse 110% 90% at 35% 35%, rgba(255,255,255,0.05) 0%, transparent 55%), radial-gradient(ellipse 130% 100% at 60% 70%, rgba(0,0,0,0.18) 50%, transparent 80%), linear-gradient(160deg, #233a5a 0%, #1a2c46 50%, #0f1d33 100%)`,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%",
          backgroundRepeat: "no-repeat",
        }} />
        <div className="book-face back" />
        <div className="book-face spine" style={{
          backgroundImage: `url("data:image/svg+xml,${spineSvg}"), linear-gradient(90deg, #060e1c 0%, #1a2c46 18%, #233a5a 50%, #1a2c46 82%, #060e1c 100%)`,
          backgroundSize: "100% 100%, 100% 100%",
          backgroundRepeat: "no-repeat",
        }} />
        <div className="book-face edge-right" />
        <div className="book-face edge-top" />
        <div className="book-face edge-bottom" />
      </div>
    </>
  );
}

/* =========================================================
   NAV
   ========================================================= */
function UserAvatar() {
  const { data: session } = useSession();
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      title="Sign out"
      style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
        display: "flex", alignItems: "center",
      }}
    >
      {session?.user?.image ? (
        <img
          src={session.user.image}
          alt={session.user.name ?? ""}
          width={32} height={32}
          style={{ borderRadius: "50%", display: "block" }}
        />
      ) : (
        <span style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "#1a2b48", border: "1px solid rgba(236,227,205,0.2)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          color: "#ece3cd", fontSize: 13,
        }}>
          {session?.user?.name?.[0] ?? "?"}
        </span>
      )}
    </button>
  );
}

function Nav() {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  return (
    <nav className="dc-nav">
      <a href="/" className="dc-logo">DeConstruct<span className="cursor" /></a>
      <div className="nav-tag">
        <p>An AI reading assistant for</p>
        <p className="indent">academic literature.</p>
      </div>
      <div className="nav-tag">
        <span className="nav-email">hello@deconstruct.ai</span>
        <p style={{ marginTop: 8, opacity: 0.6, fontSize: 12, margin: "8px 0 0" }}>v1.0 · EST 2026©</p>
      </div>
      <div className="nav-lang">
        <span className="active">EN</span>
        <span className="sep">/</span>
        <span style={{ opacity: 0.5 }}>IT</span>
      </div>

      {isSignedIn ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/upload" className="menu-btn">
            <span className="dot" />
            Analyze
          </a>
          <UserAvatar />
        </div>
      ) : (
        <a href="/sign-in" className="menu-btn">
          <span className="dot" />
          Sign in
        </a>
      )}
    </nav>
  );
}

/* =========================================================
   HERO
   ========================================================= */
function Hero() {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  return (
    <section className="hero">
      <div className="hero-headline">
        <h1 className="hero-title">
          <span className="line">Read less.</span>
          <span className="line ital indent">Understand</span>
          <span className="line">more.</span>
        </h1>
        <div className="hero-book-stage" aria-hidden="true">
          <Book3D />
        </div>
      </div>

      <div className="hero-foot">
        <div className="col" style={{ gridColumn: "1 / span 4" }}>
          <span className="label">Synopsis</span>
          <p>Upload an academic PDF. Get a structured analysis — abstract, methodology, concepts, relationships — in under thirty seconds.</p>
        </div>
        <div className="col" style={{ gridColumn: "9 / span 4", display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <span className="label">Begin</span>
          {isSignedIn ? (
            <a className="cta-pill solid" href="/upload">
              Analyze a paper <span className="arrow">→</span>
            </a>
          ) : (
            <a className="cta-pill solid" href="/sign-in">
              Get started <span className="arrow">→</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MARQUEE
   ========================================================= */
function Marquee() {
  const items = ["Plain-language abstract", "Methodology", "Concept map", "Section summaries", "Keyword extraction", "Markdown export"];
  const Row = () => (
    <span>
      {items.map((t, i) => (
        <span key={i}>
          {t}<span className="dot" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--ink)", margin: "0 28px", verticalAlign: "middle" }} />
        </span>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <Row /><Row /><Row />
      </div>
    </div>
  );
}

/* =========================================================
   HOW IT WORKS
   ========================================================= */
function HowItWorks() {
  return (
    <section>
      <div className="section-head">
        <div className="num">(II) Method</div>
        <h2 className="title">From PDF to <span className="ital">structured</span> insight.</h2>
        <div className="right">
          Four steps. Server-side extraction, schema-validated AI, client-side visualization. No accounts, no storage, no telemetry.
        </div>
      </div>
      <div className="steps">
        {STEPS.map(s => (
          <div className="step" key={s.n}>
            <div className="num-mark">({s.n})</div>
            <div className="ico">
              <span style={{ fontFamily: "var(--f-display)", fontSize: 24 }}>{s.ico}</span>
            </div>
            <div className="step-title dc-serif">{s.title}</div>
            <div className="step-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


/* =========================================================
   FEATURES
   ========================================================= */
function FeaturesGrid() {
  return (
    <section>
      <div className="section-head">
        <div className="num">(IV) Output</div>
        <h2 className="title">What you <span className="ital">actually</span> receive.</h2>
        <div className="right">
          Every analysis returns the same schema. Predictable. Exportable. Validated by Zod before it ever reaches your screen.
        </div>
      </div>
      <div className="features">
        <div className="feature">
          <div className="fid">{FEATURES[0].id}</div>
          <h3>{FEATURES[0].title}</h3>
          <p>{FEATURES[0].desc}</p>
          <div className="mini-summary">{FEATURES[0].sample}&rdquo;</div>
        </div>
        <div className="feature">
          <div className="fid">{FEATURES[1].id}</div>
          <h3>{FEATURES[1].title}</h3>
          <p>{FEATURES[1].desc}</p>
          <div className="mini-tags">
            {FEATURES[1].tags!.map((t, i) => <span className="mini-tag" key={i}>{t}</span>)}
          </div>
        </div>
        <div className="feature">
          <div className="fid">{FEATURES[2].id}</div>
          <h3>{FEATURES[2].title}</h3>
          <p>{FEATURES[2].desc}</p>
          <div className="mini-tags">
            {FEATURES[2].tags!.map((t, i) => <span className="mini-tag" key={i}>{t}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}


/* =========================================================
   CTA
   ========================================================= */
function CTA() {
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  return (
    <section className="cta-section">
      <h2>Now <span className="ital">read</span><br />the next one.</h2>
      <p>Drop a PDF. Get a structured analysis in under thirty seconds. Nothing stored server-side.</p>
      {isSignedIn ? (
        <a className="cta-pill solid" href="/upload">
          Analyze a paper <span className="arrow">→</span>
        </a>
      ) : (
        <a className="cta-pill solid" href="/sign-in">
          Get started free <span className="arrow">→</span>
        </a>
      )}
    </section>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */
function Footer() {
  return (
    <footer>
      <div className="row1">
        <div className="brand">
          DeConstruct<span style={{ fontStyle: "italic" }}>_</span>
          <small>An AI reading assistant · EST 2026©</small>
        </div>
        <div>
          <h5>Product</h5>
          <ul>
            <li>Analyze</li><li>Concept map</li><li>Sample papers</li><li>Export</li>
          </ul>
        </div>
        <div>
          <h5>Resources</h5>
          <ul>
            <li>Specification</li><li>Changelog</li><li>v2 roadmap</li><li>GitHub</li>
          </ul>
        </div>
        <div>
          <h5>Contact</h5>
          <ul>
            <li>hello@deconstruct.ai</li><li>GitHub</li><li>LinkedIn</li>
          </ul>
        </div>
      </div>
      <div className="meta">
        <span>© 2026 DeConstruct_ · All rights reserved</span>
        <span>v1.0 · Built in six days</span>
      </div>
    </footer>
  );
}

/* =========================================================
   GRID OVERLAY
   ========================================================= */
function GridLines() {
  return (
    <div className="gridlines" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => <span key={i} />)}
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */
export default function Home() {
  return (
    <>
      <GridLines />
      <Nav />
      <Hero />
      <Marquee />
      <HowItWorks />
      <FeaturesGrid />
      <CTA />
      <Footer />
    </>
  );
}
