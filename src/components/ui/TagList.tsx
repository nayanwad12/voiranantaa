type Props = { items: readonly string[]; className?: string; size?: 'sm' | 'md' }

/** Hairline tags, used for materials, disciplines, fields and areas. A real list for assistive tech. */
export function TagList({ items, className = '', size = 'sm' }: Props) {
  const pad = size === 'md' ? 'px-4 py-2.5 text-[0.8125rem]' : 'px-3 py-2 text-[0.6875rem]'
  return (
    <ul data-reveal="stagger" className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => (
        <li
          key={item}
          className={`border border-hairline-strong uppercase tracking-[0.16em] text-paper/90 ${pad}`}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
