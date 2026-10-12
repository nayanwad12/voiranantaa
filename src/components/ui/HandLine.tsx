/**
 * A deliberately imperfect, hand-drawn loop — the human counterpoint to the machine thread.
 * Phase 2 draws it on scroll via stroke-dashoffset (pathLength is normalised to 1).
 */
export function HandLine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 220" aria-hidden="true" className={className} fill="none">
      <path
        pathLength={1}
        d="M8 132 C 46 120, 82 96, 118 104 C 160 113, 170 168, 214 170 C 262 173, 280 122, 302 104
           C 330 80, 352 46, 398 44 C 452 41, 494 74, 497 112 C 500 151, 462 182, 420 178
           C 371 173, 338 136, 302 108 C 268 82, 236 52, 192 55 C 147 58, 120 92, 128 124
           C 135 154, 171 171, 214 169 C 257 166, 290 129, 318 113 C 352 94, 410 112, 470 150
           C 520 181, 560 186, 592 176"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
