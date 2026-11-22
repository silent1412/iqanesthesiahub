interface CountdownRingProps {
  /** 0..1 fraction of the subscription period remaining */
  fraction: number
  size?: number
  stroke?: number
  tone?: 'active' | 'expiring' | 'expired'
}

const TONE_COLOR: Record<NonNullable<CountdownRingProps['tone']>, string> = {
  active: 'stroke-[#9dc98a]',
  expiring: 'stroke-[#e0a33e]',
  expired: 'stroke-[#d4573f]',
}

export default function CountdownRing({
  fraction,
  size = 120,
  stroke = 8,
  tone = 'active',
}: CountdownRingProps) {
  const clamped = Math.min(1, Math.max(0, fraction))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${Math.round(clamped * 100)}% of subscription remaining`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className="stroke-white/15"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped)}
        className={`${TONE_COLOR[tone]} transition-[stroke-dashoffset] duration-500 ease-out`}
      />
    </svg>
  )
}
