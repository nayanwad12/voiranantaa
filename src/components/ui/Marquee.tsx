import { InfinityMark } from './Infinity'

/**
 * An endless loop of words. Two identical tracks slide together so the seam never shows.
 * Pauses on hover/focus; static (wrapped) under prefers-reduced-motion.
 * The visible tracks are aria-hidden — a plain list carries the content for assistive tech.
 */
export function Marquee({ items, label }: { items: readonly string[]; label: string }) {
  const track = (hidden: boolean) => (
    <ul className="marquee__track" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className="flex shrink-0 items-center">
          <span className="serif px-5 text-title whitespace-nowrap uppercase sm:px-8">{item}</span>
          <InfinityMark className="h-3 w-6 shrink-0 text-muted" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="marquee py-4" aria-label={label} role="group">
      {track(false)}
      {track(true)}
    </div>
  )
}
