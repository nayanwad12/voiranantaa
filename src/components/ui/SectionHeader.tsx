type Props = {
  number: string
  title: string
  id: string
  /** Optional small kicker shown after the number, e.g. "THE FIRST EDITION". */
  kicker?: string
  className?: string
  titleClassName?: string
}

/** "01 —" label + section h2, the editorial heading used by every numbered section. */
export function SectionHeader({ number, title, id, kicker, className = '', titleClassName = '' }: Props) {
  return (
    <header className={className}>
      <p data-reveal="fade" className="label flex items-center gap-3 text-muted">
        <span className="text-paper">{number} —</span>
        {kicker && <span>{kicker}</span>}
      </p>
      <h2 id={id} data-reveal="lines" className={`serif mt-5 md:mt-6 ${titleClassName || 'text-title'}`}>
        {title}
      </h2>
    </header>
  )
}
