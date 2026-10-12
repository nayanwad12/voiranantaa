/**
 * A drawn infinity loop (lemniscate of Gerono-ish Bernoulli). Used in the hero before / instead of
 * the WebGL thread, in the footer, and as the favicon shape. Pure SVG, no font glyph needed.
 */
export function InfinityMark({ className = '', strokeWidth = 1 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 200 100" className={className} aria-hidden="true" fill="none">
      <path
        d="M100 50 C 125 15, 175 15, 175 50 S 125 85, 100 50 S 25 15, 25 50 S 75 85, 100 50 Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
