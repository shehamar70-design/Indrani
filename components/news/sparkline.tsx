/**
 * Inline SVG sparkline — docs/15 §chart primitives. Pure server component:
 * no deps, no hooks; direction color from first→last unless overridden.
 * Empty/1-point series renders nothing (never a fake flat line, docs/18 §2).
 */

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  /** Override auto up/down color, e.g. "var(--accent-brand)". */
  stroke?: string;
  /** Soft gradient fill under the line. */
  fill?: boolean;
  className?: string;
}

export default function Sparkline({
  values,
  width = 96,
  height = 28,
  strokeWidth = 1.5,
  stroke,
  fill = false,
  className,
}: SparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = strokeWidth;
  const stepX = (width - pad * 2) / (values.length - 1);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);

  const points = values.map((v, i) => `${(pad + i * stepX).toFixed(2)},${y(v).toFixed(2)}`);
  const up = values[values.length - 1] >= values[0];
  const color = stroke ?? (up ? "var(--accent-up)" : "var(--accent-down)");
  const gradId = fill ? `spark-${points[0]}-${points.length}`.replace(/[.,]/g, "") : undefined;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Trend: ${up ? "up" : "down"}`}
      className={className}
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`${pad},${height - pad} ${points.join(" ")} ${width - pad},${height - pad}`}
            fill={`url(#${gradId})`}
          />
        </>
      )}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
