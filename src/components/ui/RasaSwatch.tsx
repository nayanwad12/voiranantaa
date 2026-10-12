import type { Rasa } from '../../content/site'

/** A small glowing light in a rasa's colour (accent only — never a background behind text). */
export function RasaSwatch({ rasa, className = '' }: { rasa: Rasa; className?: string }) {
  const ring = rasa.rim ?? rasa.color
  return (
    <span aria-hidden="true" className={`relative inline-block h-3 w-3 shrink-0 ${className}`}>
      <span
        className="absolute -inset-4 rounded-full opacity-60 blur-md"
        style={{ background: `radial-gradient(closest-side, ${ring}, transparent)` }}
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: rasa.color, boxShadow: `0 0 0 1px ${ring}` }}
      />
    </span>
  )
}
