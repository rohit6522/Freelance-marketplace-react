import { money } from "../../utils/format";

export default function EarningsChart({ data }) {
  const max = Math.max(...data.map((d) => d.amount), 0);
  const maxHeight = 150;
  const baseline = 180;
  const step = 90;
  const barWidth = 56;
  const total = data.reduce((n, d) => n + d.amount, 0);

  return (
    <div>
      <svg viewBox="0 0 600 220" className="w-full h-auto" role="img" aria-label={`Earnings per month, last ${data.length} months, total ${money(total)}`}>
        <line x1="20" y1={baseline} x2="580" y2={baseline} className="stroke-outline-variant" strokeWidth="1" />
        {data.map((d, i) => {
          const h = max ? Math.max(2, Math.round((d.amount / max) * maxHeight)) : 2;
          const x = 40 + i * step;
          return (
            <g key={`${d.year}-${d.month}`}>
              <rect x={x} y={baseline - h} width={barWidth} height={h} className={d.amount ? "fill-primary" : "fill-surface-container-high"} />
              {d.amount > 0 && (
                <text x={x + barWidth / 2} y={baseline - h - 6} textAnchor="middle" fontSize="12" fontFamily="Geist, sans-serif" className="fill-on-surface">
                  {money(d.amount)}
                </text>
              )}
              <text x={x + barWidth / 2} y="202" textAnchor="middle" fontSize="12" fontFamily="Geist, sans-serif" className="fill-on-surface-variant">
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
      {total === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant text-center">No released earnings in this period yet.</p>}
    </div>
  );
}