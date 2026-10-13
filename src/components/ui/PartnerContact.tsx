import { PARTNER_EMAIL } from '../../content/site'

/** The partnership email CTA, or a clearly named placeholder until PARTNER_EMAIL is set. */
export function PartnerContact({ className = '' }: { className?: string }) {
  if (!PARTNER_EMAIL) {
    return (
      <span
        data-placeholder="PARTNER_EMAIL"
        className={`label inline-flex min-h-[44px] items-center border border-dashed border-paper/50 px-4 text-paper ${className}`}
      >
        [ PARTNER_EMAIL ]
      </span>
    )
  }
  return (
    <a
      href={`mailto:${PARTNER_EMAIL}`}
      className={`serif inline-flex min-h-[44px] items-center border-b border-paper/40 text-heading break-all transition-colors hover:border-paper ${className}`}
    >
      {PARTNER_EMAIL}
    </a>
  )
}
