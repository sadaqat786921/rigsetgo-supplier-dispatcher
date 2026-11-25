const NAVY = '#003778';
const LINE = '#E3E9F1';
const MUTED = '#6B7A90';
const ORANGE = '#F7941D';

export function LineChart({ values, labels, height = 210, max: maxIn, money }: { values: number[]; labels: string[]; height?: number; max?: number; money?: boolean }) {
  const W = 620;
  const H = height;
  const top = 10;
  const bottom = H - 34;
  const left = 44;
  const right = W - 12;
  const max = maxIn ?? Math.max(4, Math.ceil((Math.max(...values) * 1.15) / 4) * 4);
  const x = (i: number) => left + (i * (right - left)) / Math.max(1, values.length - 1);
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const d = values.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const fmt = (v: number) => (money ? (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`) : String(v));
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart">
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={NAVY} stopOpacity="0.16" />
            <stop offset="1" stopColor={NAVY} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left - 8} x2={right} y1={y(t)} y2={y(t)} stroke={LINE} />
            <text x={0} y={y(t) + 4} fontSize="11" fill={MUTED}>
              {fmt(t)}
            </text>
          </g>
        ))}
        <path d={`${d} L ${x(values.length - 1)} ${bottom} L ${x(0)} ${bottom} Z`} fill="url(#area)" />
        <path d={d} fill="none" stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />
        {values.map((v, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r="5.5" fill="#fff" stroke={i === values.length - 1 ? ORANGE : NAVY} strokeWidth="3">
              <title>{`${labels[i]}: ${fmt(v)}`}</title>
            </circle>
            <text x={x(i)} y={H - 10} fontSize="11" fill={MUTED} textAnchor="middle">
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function MiniLine({ values }: { values: number[] }) {
  const W = 170;
  const H = 100;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const x = (i: number) => 8 + (i * (W - 16)) / (values.length - 1);
  const y = (v: number) => H - 10 - ((v - min) / Math.max(1, max - min)) * (H - 20);
  const d = values.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      <path d={d} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="5" fill={i === values.length - 1 ? ORANGE : NAVY} stroke="#fff" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

export function Donut({ segments, size = 132, center, sub }: { segments: { value: number; color: string }[]; size?: number; center: string; sub?: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${center} ${sub ?? ''}`} style={{ flex: 'none' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8EFF8" strokeWidth="18" />
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="18"
            strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        offset += len;
        return el;
      })}
      <text x="50%" y={sub ? '48%' : '54%'} textAnchor="middle" fontSize={size > 100 ? 22 : 16} fontWeight="700" fill="#0B1B33">
        {center}
      </text>
      {sub && (
        <text x="50%" y="62%" textAnchor="middle" fontSize="11" fill={MUTED}>
          {sub}
        </text>
      )}
    </svg>
  );
}

export function Bars({ values, labels, max: maxIn }: { values: number[]; labels: string[]; max?: number }) {
  const W = 320;
  const H = 150;
  const max = maxIn ?? Math.max(...values, 1) * 1.15;
  const slot = (W - 10) / values.length;
  const bw = Math.min(26, slot * 0.55);
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bar chart">
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={118 - f * 108} y2={118 - f * 108} stroke={LINE} />
        ))}
        {values.map((v, i) => {
          const h = (v / max) * 108;
          const x = 5 + i * slot + (slot - bw) / 2;
          return (
            <g key={i}>
              <rect x={x} y={118 - h} width={bw} height={h} rx="6" fill={i === values.length - 1 ? NAVY : '#C9D8EC'}>
                <title>{`${labels[i]}: ${v}`}</title>
              </rect>
              <text x={x + bw / 2} y={138} fontSize="11" fill={MUTED} textAnchor="middle">
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Simple drawn map with a route. `progress` 0–100 moves the truck along the route. */
export function RouteMap({ progress, label, height = 260 }: { progress: number; label?: string; height?: number }) {
  const pts: [number, number][] = [
    [40, 220], [110, 210], [160, 160], [230, 140], [300, 96], [360, 80], [430, 44],
  ];
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = (Math.min(100, Math.max(0, progress)) / 100) * total;
  let pos = pts[0];
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i]) {
      const f = left / seg[i];
      pos = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
      break;
    }
    left -= seg[i];
    pos = pts[i + 1];
  }
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');
  return (
    <div className="map" style={{ minHeight: height }}>
      <svg viewBox="0 0 470 260" preserveAspectRatio="xMidYMid slice" aria-label="Delivery route map">
        {[[20, 20, 70, 44], [110, 14, 56, 60], [190, 30, 80, 40], [300, 120, 60, 50], [30, 90, 64, 50], [120, 190, 90, 46], [240, 190, 70, 50], [380, 180, 70, 56], [390, 100, 52, 40]].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="8" fill="#fff" opacity="0.75" />
        ))}
        <rect x="0" y="160" width="470" height="10" fill="#fff" />
        <rect x="96" y="0" width="10" height="260" fill="#fff" />
        <rect x="280" y="0" width="10" height="260" fill="#fff" />
        <rect x="0" y="72" width="470" height="8" fill="#fff" />
        <path d={d} fill="none" stroke={NAVY} strokeWidth="3.5" strokeDasharray="9 8" strokeLinecap="round" />
        <circle cx={pts[0][0]} cy={pts[0][1]} r="7" fill="#fff" stroke={NAVY} strokeWidth="3" />
        <path transform={`translate(${pts[6][0] - 12} ${pts[6][1] - 26})`} d="M12 0a9 9 0 0 1 9 9c0 6.5-9 15-9 15S3 15.5 3 9a9 9 0 0 1 9-9z" fill={ORANGE} />
        <circle cx={pts[6][0]} cy={pts[6][1] - 17} r="3.2" fill="#fff" />
        <circle cx={pos[0]} cy={pos[1]} r="17" fill={NAVY} stroke="#fff" strokeWidth="4" />
        <path transform={`translate(${pos[0] - 8} ${pos[1] - 6})`} d="M1 2h8v7H1zM9 4h3l3 3v2H9z" fill="#fff" />
      </svg>
      {label && (
        <div className="map-tag" style={{ left: '30%', top: '42%' }}>
          {label}
        </div>
      )}
    </div>
  );
}
