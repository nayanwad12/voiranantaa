import type { SVGProps } from 'react'

/**
 * A drawn infinity loop. Used in the hero before / instead of the WebGL thread, in the
 * final section, the judges note and the marquee. Pure SVG, no font glyph needed.
 * Draw-on animations measure its on-screen length with `screenPathLength` (motion/draw.ts).
 */
export function InfinityMark({
  className = '',
  strokeWidth = 1,
  scaling = false,
  ...rest
}: { className?: string; strokeWidth?: number; scaling?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 100" className={className} aria-hidden="true" fill="none" {...rest}>
      <path
        d="M100 50 C 125 15, 175 15, 175 50 S 125 85, 100 50 S 25 15, 25 50 S 75 85, 100 50 Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        // A hairline at any size; `scaling` keeps viewBox units so CSS can draw it via pathLength.
        {...(scaling ? { pathLength: 1 } : { vectorEffect: 'non-scaling-stroke' })}
      />
    </svg>
  )
}
