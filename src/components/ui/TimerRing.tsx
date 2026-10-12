/** The 5:00 ring. `progress` (0→1) fills it; phase 2 drives this from scroll. */
export function TimerRing({ label, progress = 1, className = '' }: { label: string; progress?: number; className?: string }) {
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div className={`relative aspect-square ${className}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-hairline-strong)" strokeWidth="0.6" />
        <circle
          data-ring
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
        />
      </svg>
      <span className="serif absolute inset-0 flex items-center justify-center text-[clamp(2.75rem,2rem+3vw,4.5rem)] leading-none tabular-nums">
        {label}
      </span>
    </div>
  )
}
