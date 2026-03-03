"use client"

const ZODIAC_SYMBOLS = [
  "\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D",
  "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653",
]

interface ZodiacWheelProps {
  size?: number
}

export function ZodiacWheel({ size = 500 }: ZodiacWheelProps) {
  const center = size / 2
  const outerRadius = size / 2 - 20
  const innerRadius = outerRadius * 0.65
  const symbolRadius = (outerRadius + innerRadius) / 2

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="animate-rotate-slow"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="none"
        stroke="rgba(0, 240, 255, 0.15)"
        strokeWidth="1"
      />

      {/* Inner ring */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="none"
        stroke="rgba(180, 74, 255, 0.12)"
        strokeWidth="1"
      />

      {/* Division lines + symbols */}
      {ZODIAC_SYMBOLS.map((symbol, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180)
        const midAngle = ((i * 30 + 15) - 90) * (Math.PI / 180)

        const x1 = center + Math.cos(angle) * innerRadius
        const y1 = center + Math.sin(angle) * innerRadius
        const x2 = center + Math.cos(angle) * outerRadius
        const y2 = center + Math.sin(angle) * outerRadius

        const sx = center + Math.cos(midAngle) * symbolRadius
        const sy = center + Math.sin(midAngle) * symbolRadius

        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(0, 240, 255, 0.1)"
              strokeWidth="0.5"
            />
            <text
              x={sx}
              y={sy}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(0, 240, 255, 0.4)"
              fontSize={size * 0.04}
              style={{ fontFamily: "serif" }}
            >
              {symbol}
            </text>
          </g>
        )
      })}

      {/* Center dot */}
      <circle
        cx={center}
        cy={center}
        r="3"
        fill="rgba(255, 215, 0, 0.5)"
      />

      {/* Cross lines */}
      {[0, 90].map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180)
        return (
          <line
            key={deg}
            x1={center + Math.cos(rad) * innerRadius * 0.3}
            y1={center + Math.sin(rad) * innerRadius * 0.3}
            x2={center + Math.cos(rad + Math.PI) * innerRadius * 0.3}
            y2={center + Math.sin(rad + Math.PI) * innerRadius * 0.3}
            stroke="rgba(255, 215, 0, 0.15)"
            strokeWidth="0.5"
          />
        )
      })}
    </svg>
  )
}
