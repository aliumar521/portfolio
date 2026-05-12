/* global React, ReactDOM, Knife, TOOLS, toolOpenProgress, TweaksPanel, useTweaks, TweakSection, TweakColor, TweakText, TweakToggle, TweakRadio */
const { useEffect, useRef, useState } = React;

const SKILL_VOICES = {
  Witty: [
    {
      tool: "blade",
      title: "Financial Analysis",
      quote: "First the cut, then the signal. Slice through noise until the number that matters stands alone.",
      bullets: [
        { k: "What", v: "End-to-end financial modelling from raw data to board-ready insight." },
        { k: "How",  v: "Rigorous assumptions, stress-tested scenarios, conclusions you can defend." },
        { k: "Why",  v: "Most decks are 30% too much. The job is finding the one number." },
      ],
      projects: [["2025", "Portfolio risk attribution model"], ["2024", "Revenue forecasting — SaaS"], ["2023", "M&A synergy analysis"]],
    },
    {
      tool: "screwdriver",
      title: "Data Engineering",
      quote: "Boring pipelines, done right. The join nobody notices because it never broke in prod.",
      bullets: [
        { k: "Stack", v: "Python, SQL, dbt, Airflow — the plumbing that keeps analytics honest." },
        { k: "Habit", v: "Tests first, dashboards second. Schemas documented before they're forgotten." },
        { k: "Limits", v: "If it doesn't run in prod, it doesn't count. Notebooks are drafts." },
      ],
      projects: [["2025", "Warehouse migration to BigQuery"], ["2024", "dbt refactor — 200+ models"]],
    },
    {
      tool: "saw",
      title: "Analytics & Reporting",
      quote: "Rough data, finished insight. Metrics, dashboards, docs — the joints between teams.",
      bullets: [
        { k: "Output", v: "Self-serve dashboards, KPI frameworks, automated reporting." },
        { k: "Belief", v: "A metric is a contract, not a decoration." },
        { k: "Bonus",  v: "I write the data dictionary nobody else wants to write." },
      ],
      projects: [["2025", "Executive reporting suite"], ["2023", "Retention metric framework"]],
    },
    {
      tool: "awl",
      title: "Quantitative Research",
      quote: "Punch a clean hole through the noise. Models, back-tests, signals — kept under one roof.",
      bullets: [
        { k: "Range",   v: "Statistical modelling, time-series, A/B testing, causal inference." },
        { k: "Approach", v: "One defensible finding, then five tests trying to break it." },
        { k: "Caveat",  v: "I won't ship a result I can't explain in plain English." },
      ],
      projects: [["2025", "Pricing elasticity study"], ["2024", "Churn prediction model"]],
    },
    {
      tool: "hook",
      title: "Strategy & Advisory",
      quote: "Pull the thread until the right question comes loose. Frame, size, sequence.",
      bullets: [
        { k: "Methods", v: "Market sizing, scenario planning, competitive mapping, storytelling." },
        { k: "Output",  v: "Memos that change minds; roadmaps you can defend to the CFO." },
        { k: "Style",   v: "Plain language, fewer slides." },
      ],
      projects: [["2025", "Go-to-market — fintech launch"], ["2024", "3-year strategic plan"]],
    },
    {
      tool: "opener",
      title: "Data Visualisation",
      quote: "Crack the chart open before it ships. Real audiences, real decisions, real stakes.",
      bullets: [
        { k: "Tools",  v: "Tableau, Power BI, D3, Observable — whichever fits the audience." },
        { k: "Belief", v: "If you can't sketch it on a napkin, the data isn't ready." },
        { k: "Easter", v: "I sneak a meaningful annotation into every chart. Find them." },
      ],
      projects: [["2025", "Interactive P&L explorer"], ["2024", "Investor relations dashboard"]],
    },
  ],
  Plain: [
    { tool: "blade", title: "Financial Analysis",
      quote: "End-to-end financial modelling — assumptions through board-ready output.",
      bullets: [
        { k: "What", v: "Forecasting, valuation, scenario analysis." },
        { k: "How",  v: "Structured, evidence-led, stress-tested." },
        { k: "For",  v: "Leadership, investors, operators." },
      ],
      projects: [["2025", "Portfolio risk model"], ["2024", "Revenue forecast"], ["2023", "M&A analysis"]] },
    { tool: "screwdriver", title: "Data Engineering",
      quote: "Production-grade pipelines in Python, SQL, and dbt.",
      bullets: [
        { k: "Stack",  v: "Python, SQL, dbt, Airflow, BigQuery." },
        { k: "Focus",  v: "Reliability, testability, documentation." },
        { k: "Comfort", v: "ETL design, schema governance, orchestration." },
      ],
      projects: [["2025", "BigQuery migration"], ["2024", "dbt refactor"]] },
    { tool: "saw", title: "Analytics & Reporting",
      quote: "Self-serve dashboards and the metric frameworks that make them durable.",
      bullets: [
        { k: "Output", v: "Dashboards, KPIs, automated reports." },
        { k: "Tools",  v: "Tableau, Power BI, Looker, dbt." },
        { k: "Scope",  v: "From scratch or salvage." },
      ],
      projects: [["2025", "Executive suite"], ["2023", "Retention metrics"]] },
    { tool: "awl", title: "Quantitative Research",
      quote: "Statistical modelling, back-testing, and causal inference.",
      bullets: [
        { k: "Range",  v: "Regression, time-series, A/B tests." },
        { k: "Method", v: "Hypothesis → model → validation." },
        { k: "Output", v: "Reports, notebooks, recommendations." },
      ],
      projects: [["2025", "Pricing elasticity"], ["2024", "Churn model"]] },
    { tool: "hook", title: "Strategy & Advisory",
      quote: "Frame the right problem before the analysis begins.",
      bullets: [
        { k: "Methods", v: "Sizing, scenario planning, competitive mapping." },
        { k: "Output",  v: "Memos, roadmaps, investor briefs." },
        { k: "Audience", v: "C-suite, founders, boards." },
      ],
      projects: [["2025", "Fintech GTM"], ["2024", "3-year plan"]] },
    { tool: "opener", title: "Data Visualisation",
      quote: "Charts that drive decisions, not just discussion.",
      bullets: [
        { k: "Tools", v: "Tableau, Power BI, D3, Observable." },
        { k: "Use",   v: "Exec reporting, investor relations, product." },
        { k: "Bonus", v: "Annotations and context baked in." },
      ],
      projects: [["2025", "P&L explorer"], ["2024", "IR dashboard"]] },
  ],
};

function useScrollProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const prog = Math.max(0, Math.min(1, scrolled / total));
      setP(prog);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
  return p;
}

function App() {
  const [t, setTweak] = useTweaks(window.__TWEAK_DEFAULTS__);

  useEffect(() => {
    document.body.style.background = t.background || "#f1ece1";
  }, [t.background]);

  const pinRef = useRef(null);
  const scroll = useScrollProgress(pinRef);

  const [pageScroll, setPageScroll] = useState(0);
  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPageScroll(window.scrollY / Math.max(1, max));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const skills = SKILL_VOICES[t.skillVoice] || SKILL_VOICES.Witty;

  const openProgresses = TOOLS.map((_, i) => toolOpenProgress(scroll, i));
  let activeIndex = 0;
  for (let i = 0; i < openProgresses.length; i++) {
    if (openProgresses[i] > 0.4) activeIndex = i;
  }

  const today = new Date();
  const yyyymmdd = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2,"0")}.${String(today.getDate()).padStart(2,"0")}`;

  return (
    <>
      <header className="top-chrome">
        <div className="group">
          <span className="mark"><span className="dot"></span> {t.name} / Portfolio</span>
        </div>
        <div className="group">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <span>{yyyymmdd}</span>
        </div>
      </header>

      <div className="progress-rail">
        <div className="fill" style={{ height: `${pageScroll * 100}%` }} />
      </div>

      {/* ---------- HERO ---------- */}
      <section className="hero" id="hero">
        <div className="hero-grid">
          <div>
            <span className="eyebrow"><span className="bar"></span> Folio · 026 / 2026</span>
            <h1 className="display">
              A complete<br/>
              <em>toolkit,</em><br/>
              one handle.
            </h1>
            <p className="lede">{t.tagline}</p>
            <div className="hero-meta">
              <div>Discipline<b>Finance × Data</b></div>
              <div>Based<b>Available Globally</b></div>
              <div>Status<b>Open · 2026</b></div>
            </div>
          </div>
          <div className="hero-knife">
            <Knife progress={0} bodyColor={t.bodyColor} monogram={t.monogram} rotateBody={false} />
          </div>
        </div>
        <div className="hero-foot">
          <span>{t.name.toUpperCase()} · INDEPENDENT PRACTICE</span>
          <span className="scroll-cue">
            Scroll to open the toolkit
            <span className="arrow">
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1v8M2 6l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
            </span>
          </span>
          <span>06 TOOLS · 06 SKILLS</span>
        </div>
      </section>

      {/* ---------- PINNED REVEAL ---------- */}
      <div className="pin-wrap" ref={pinRef} style={{ height: "640vh" }} id="work">
        <div className="pin-stage">
          <div className="pin-knife">
            <Knife progress={scroll} bodyColor={t.bodyColor} monogram={t.monogram} rotateBody={t.rotateBody} />
          </div>
          <div className="pin-panel">
            <div className="skill-index">
              <span>Toolkit</span>
              <span className="ticks">
                {TOOLS.map((_, i) => (
                  <span key={i} className={"tick" + (openProgresses[i] > 0.4 ? " active" : "")} />
                ))}
              </span>
              <span>{String(activeIndex + 1).padStart(2,"0")} / {String(TOOLS.length).padStart(2,"0")}</span>
            </div>
            <div className="panel-stack">
              {skills.map((s, i) => {
                const p = openProgresses[i];
                const visible = p > 0.25 && (i === activeIndex);
                return (
                  <article key={s.tool} className={"skill-card" + (visible ? " visible" : "")}>
                    <div className="skill-meta">
                      <span className="num">{String(i+1).padStart(2,"0")}</span>
                      <span>{TOOLS[i].label}</span>
                      <span>·</span>
                      <span>SKILL · {String(i+1).padStart(2,"0")} / {String(TOOLS.length).padStart(2,"0")}</span>
                    </div>
                    <h3 className="skill-title">{s.title}</h3>
                    <p className="skill-quote">"{s.quote}"</p>
                    <ul className="skill-bullets">
                      {s.bullets.map((b, j) => (
                        <li key={j}><b>{b.k}</b>{b.v}</li>
                      ))}
                    </ul>
                    <div className="skill-projects">
                      {s.projects.flatMap(([yr, name], j) => [
                        <span key={"y"+j}>{yr}</span>,
                        <span key={"n"+j}>{name}</span>
                      ])}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- OUTRO ---------- */}
      <section className="outro" id="contact">
        <div>
          <span className="eyebrow"><span className="bar"></span> The complete toolkit</span>
          <h2>Pick a <em>tool.</em><br/>Let's get to work.</h2>
          <p>Available for financial analysis, data strategy, analytics engineering, and the chewy spaces in between. Short engagements, long collaborations, and the occasional weekend model.</p>
        </div>
        <div className="contact-card">
          <div className="contact-row">
            <span className="k">Email</span>
            <span className="v"><a href="mailto:aliumar521@gmail.com">aliumar521@gmail.com</a></span>
          </div>
          <div className="contact-row">
            <span className="k">LinkedIn</span>
            <span className="v"><a href="#">linkedin.com/in/aliumar</a></span>
          </div>
          <div className="contact-row">
            <span className="k">Elsewhere</span>
            <span className="v"><a href="#">GitHub</a> · <a href="#">Read.cv</a></span>
          </div>
        </div>
        <div className="colophon">
          <span>© {today.getFullYear()} {t.name.toUpperCase()} · ALL RIGHTS RESERVED</span>
          <span>SET IN INSTRUMENT SERIF · DM SANS · JETBRAINS MONO</span>
          <span>NO. 042 / 100</span>
        </div>
      </section>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Identity">
          <TweakText label="Name"     value={t.name}     onChange={(v) => setTweak("name", v)} />
          <TweakText label="Monogram" value={t.monogram} onChange={(v) => setTweak("monogram", v.slice(0, 3))} />
          <TweakText label="Tagline"  value={t.tagline}  onChange={(v) => setTweak("tagline", v)} />
        </TweakSection>
        <TweakSection label="Look">
          <TweakColor
            label="Body color"
            value={t.bodyColor}
            options={["#b8222a", "#1f3a52", "#1c1a17", "#3b6e3a", "#c97a17"]}
            onChange={(v) => setTweak("bodyColor", v)}
          />
          <TweakColor
            label="Background"
            value={t.background}
            options={["#f1ece1", "#ece9e1", "#1c1a17", "#ffffff", "#e3dccd"]}
            onChange={(v) => setTweak("background", v)}
          />
        </TweakSection>
        <TweakSection label="Voice">
          <TweakRadio
            label="Skill copy"
            value={t.skillVoice}
            options={["Witty", "Plain"]}
            onChange={(v) => setTweak("skillVoice", v)}
          />
          <TweakToggle
            label="Subtle body tilt"
            value={t.rotateBody}
            onChange={(v) => setTweak("rotateBody", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
