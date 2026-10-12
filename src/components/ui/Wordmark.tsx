import { LOGO } from '../../content/site'

/** Typographic wordmark — stands in for the LOGO placeholder until artwork is supplied. */
export function Wordmark({ className = '' }: { className?: string }) {
  if (LOGO.src) {
    return <img src={LOGO.src} alt={LOGO.alt} className={`h-5 w-auto ${className}`} />
  }
  return (
    <span className={`serif text-[1.375rem] leading-none tracking-[0.04em] whitespace-nowrap ${className}`}>
      {LOGO.text}
    </span>
  )
}
