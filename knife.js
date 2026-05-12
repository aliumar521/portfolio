/* global React */
const { useMemo } = React;

const HINGE_TOP = { x: 270, y: 270 };
const HINGE_BOT = { x: 270, y: 410 };

function bladePath(L = 380) {
  const tip = L;
  const upper = -16, lower = 16;
  return `
    M 0 ${lower}
    L 0 ${upper}
    L 20 ${upper - 4}
    L 60 ${upper - 6}
    C 200 ${upper - 4}, 320 ${upper - 2}, ${tip - 30} -2
    L ${tip} 0
    L ${tip - 30} 6
    C 320 ${lower - 2}, 200 ${lower}, 60 ${lower}
    L 20 ${lower + 2}
    Z
  `;
}

function sawPath(L = 340) {
  const back = 12, top = -12;
  let teeth = "";
  const teethStart = 60, teethEnd = L - 30;
  const teethLen = teethEnd - teethStart;
  const n = 16;
  const step = teethLen / n;
  for (let i = 0; i < n; i++) {
    const x0 = teethStart + i * step;
    const xMid = x0 + step / 2;
    const x1 = x0 + step;
    teeth += ` L ${x0} ${top} L ${xMid} ${top - 9} L ${x1} ${top}`;
  }
  return `
    M 0 ${back}
    L 0 ${top + 2}
    L 20 ${top}
    L ${teethStart} ${top}
    ${teeth}
    L ${teethEnd} ${top}
    L ${L - 12} ${top + 2}
    L ${L} 0
    L ${L - 8} ${back - 4}
    L 20 ${back}
    Z
  `;
}

function hookPath(L = 240) {
  return `
    M 0 -10
    L 0 10
    L 30 12
    L ${L - 80} 12
    L ${L - 80} 6
    L ${L - 50} 6
    L ${L - 50} 18
    L ${L - 20} 18
    L ${L - 10} 8
    L ${L - 10} -10
    L ${L - 30} -16
    L ${L - 30} -4
    L ${L - 60} -4
    L ${L - 60} -10
    Z
  `;
}

function screwdriverPath(L = 380) {
  return `
    M 0 -10
    L 0 10
    L 30 8
    L ${L - 60} 4
    L ${L - 30} 7
    L ${L} 5
    L ${L} -5
    L ${L - 30} -7
    L ${L - 60} -4
    L 30 -8
    Z
  `;
}

function awlPath(L = 280) {
  return `
    M 0 -11
    L 0 11
    L 40 10
    L ${L - 30} 3
    L ${L} 0
    L ${L - 30} -3
    L 40 -10
    Z
  `;
}

function openerPath(L = 250) {
  return `
    M 0 -10
    L 0 10
    L 30 12
    L ${L - 60} 14
    L ${L - 60} 4
    L ${L - 30} 4
    L ${L - 30} 18
    L ${L} 18
    L ${L} -10
    L ${L - 20} -14
    L ${L - 20} -4
    L ${L - 50} -4
    L ${L - 50} -12
    L 30 -12
    Z
  `;
}

const TOOL_SHAPES = {
  blade:       { fn: bladePath,       length: 380 },
  saw:         { fn: sawPath,         length: 340 },
  hook:        { fn: hookPath,        length: 230 },
  screwdriver: { fn: screwdriverPath, length: 380 },
  awl:         { fn: awlPath,         length: 270 },
  opener:      { fn: openerPath,      length: 240 },
};

const TOOLS = [
  { id: "blade",       hinge: "top", openAngle: -150, label: "The Blade" },
  { id: "screwdriver", hinge: "bot", openAngle:  150, label: "The Screwdriver" },
  { id: "saw",         hinge: "top", openAngle: -110, label: "The Saw" },
  { id: "awl",         hinge: "bot", openAngle:  110, label: "The Awl" },
  { id: "hook",        hinge: "top", openAngle:  -75, label: "The Hook" },
  { id: "opener",      hinge: "bot", openAngle:   75, label: "The Opener" },
];

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function toolOpenProgress(progress, idx, n = TOOLS.length) {
  const intro = 0.08, outro = 0.94;
  const span = outro - intro;
  const slot = span / n;
  const start = intro + slot * idx;
  const end   = start + slot * 0.95;
  const t = (progress - start) / (end - start);
  return Math.max(0, Math.min(1, t));
}

function ToolGroup({ tool, openP, idx, accent }) {
  const shape = TOOL_SHAPES[tool.id];
  const pivot = tool.hinge === "top" ? HINGE_TOP : HINGE_BOT;
  const ang = tool.openAngle * easeOutCubic(openP);
  const d = shape.fn(shape.length);
  const isActive = openP > 0.05 && openP < 0.98;
  return (
    <g transform={`rotate(${ang} ${pivot.x} ${pivot.y})`} style={{ transition: "filter .25s" }}>
      <g transform={`translate(${pivot.x} ${pivot.y})`}>
        <path d={d} fill="rgba(20,15,10,0.18)" transform="translate(2 4)" />
        <path d={d} fill="url(#steelGrad)" stroke="#5b5854" strokeWidth="0.8" />
        <path d={d} fill="url(#steelGloss)" opacity="0.9" />
        {tool.id === "awl" && (
          <circle cx="20" cy="0" r="3.4" fill="#1a1815" />
        )}
        {tool.id === "screwdriver" && (
          <rect x={shape.length - 18} y="-1" width="14" height="2" fill="#1a1815" opacity="0.45" />
        )}
        {tool.id === "blade" && (
          <path d={`M 50 -8 L ${shape.length - 50} -2`} stroke="#ffffff70" strokeWidth="1" fill="none" />
        )}
      </g>
      {isActive && (
        <g transform={`translate(${pivot.x} ${pivot.y}) rotate(${-ang})`} opacity={openP < 0.4 ? openP * 2.5 : 1}>
          <g transform={`rotate(${tool.openAngle * 0.6}) translate(${shape.length * 0.55} ${tool.hinge === "top" ? -36 : 36})`}>
            <text
              x="0" y="0"
              fill={accent}
              fontFamily="JetBrains Mono, monospace"
              fontSize="13"
              letterSpacing="2"
              textAnchor="middle"
              style={{ textTransform: "uppercase" }}
            >
              {String(idx + 1).padStart(2, "0")} · {tool.label.toUpperCase()}
            </text>
          </g>
        </g>
      )}
    </g>
  );
}

function shade(hex, pct) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const adj = (c) => Math.max(0, Math.min(255, Math.round(c + (pct / 100) * 255)));
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return "#" + toHex(adj(r)) + toHex(adj(g)) + toHex(adj(b));
}

function Knife({ progress = 0, bodyColor = "#b8222a", monogram = "AU", rotateBody = true }) {
  const tilt = rotateBody ? -6 + progress * 4 : 0;

  const tools = TOOLS.map((t, i) => ({
    ...t,
    openP: toolOpenProgress(progress, i)
  }));

  const ordered = useMemo(() => {
    const idxed = tools.map((t, i) => ({ t, i }));
    return idxed.sort((a, b) => a.i - b.i);
  }, [progress]);

  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="redGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={shade(bodyColor, 18)} />
          <stop offset="50%"  stopColor={bodyColor} />
          <stop offset="100%" stopColor={shade(bodyColor, -22)} />
        </linearGradient>
        <linearGradient id="redGloss" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="steelGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#f4f3ef" />
          <stop offset="50%"  stopColor="#c9c7c2" />
          <stop offset="100%" stopColor="#85837e" />
        </linearGradient>
        <linearGradient id="steelGloss" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="35%"  stopColor="#ffffff" stopOpacity="0" />
          <stop offset="65%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id="hingeGrad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%"   stopColor="#ddd" />
          <stop offset="60%"  stopColor="#888" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </radialGradient>
        <linearGradient id="bodyShadow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      <g transform={`rotate(${tilt} 600 350)`}>
        <g>
          {ordered.map(({ t, i }) => (
            <ToolGroup key={t.id} tool={t} openP={t.openP} idx={i} accent={bodyColor} />
          ))}
        </g>

        <g>
          <rect x="200" y="282" width="700" height="140" rx="70" ry="70"
                fill="rgba(20,15,10,0.16)" filter="blur(0)" />
          <rect x="200" y="270" width="700" height="140" rx="70" ry="70"
                fill="url(#redGrad)" />
          <rect x="210" y="278" width="680" height="60" rx="52" ry="52"
                fill="url(#redGloss)" />
          <rect x="200" y="270" width="700" height="140" rx="70" ry="70"
                fill="url(#bodyShadow)" />
          <line x1="220" y1="270" x2="880" y2="270" stroke="#000" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="220" y1="410" x2="880" y2="410" stroke="#000" strokeOpacity="0.18" strokeWidth="1" />

          <ellipse cx="216" cy="340" rx="8"  ry="62" fill="#3a3835" opacity="0.55" />
          <ellipse cx="884" cy="340" rx="8"  ry="62" fill="#3a3835" opacity="0.55" />
          <ellipse cx="216" cy="340" rx="4"  ry="58" fill="url(#steelGrad)" />
          <ellipse cx="884" cy="340" rx="4"  ry="58" fill="url(#steelGrad)" />

          <circle cx="908" cy="340" r="14" fill="none" stroke="url(#hingeGrad)" strokeWidth="3" />
          <circle cx="908" cy="340" r="10" fill="none" stroke="#0006" strokeWidth="0.6" />

          <circle cx={HINGE_TOP.x} cy={HINGE_TOP.y} r="6" fill="url(#hingeGrad)" />
          <circle cx={HINGE_TOP.x} cy={HINGE_TOP.y} r="2" fill="#1a1815" />
          <circle cx={HINGE_BOT.x} cy={HINGE_BOT.y} r="6" fill="url(#hingeGrad)" />
          <circle cx={HINGE_BOT.x} cy={HINGE_BOT.y} r="2" fill="#1a1815" />
          <circle cx={830} cy={270} r="5" fill="url(#hingeGrad)" />
          <circle cx={830} cy={410} r="5" fill="url(#hingeGrad)" />

          <g transform="translate(550 340)">
            <circle r="48" fill="#fff" opacity="0.96" />
            <circle r="48" fill="none" stroke="#0001" strokeWidth="1" />
            <circle r="40" fill="none" stroke={bodyColor} strokeOpacity="0.18" strokeWidth="1" />
            <text
              x="0" y="2"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Instrument Serif, serif"
              fontSize="34"
              fill={bodyColor}
              fontStyle="italic"
              letterSpacing="1"
            >{monogram}</text>
            <text
              x="0" y="32"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="6.5"
              letterSpacing="2"
              fill="#0007"
            >· EST · MMXXVI ·</text>
          </g>

          <text
            x="780" y="345"
            fontFamily="JetBrains Mono, monospace"
            fontSize="8" letterSpacing="2"
            fill="#fff" opacity="0.55"
            textAnchor="middle"
          >NO. 042</text>
        </g>
      </g>
    </svg>
  );
}

window.Knife = Knife;
window.TOOLS = TOOLS;
window.toolOpenProgress = toolOpenProgress;
