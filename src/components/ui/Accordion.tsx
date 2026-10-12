import { useId, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'

type Item = { name: string; question: string }

/** Numbered list on tablet/desktop; a one-open-at-a-time accordion on phones. */
export function Accordion({ items }: { items: readonly Item[] }) {
  const wide = useMediaQuery('(min-width: 48rem)')
  const [open, setOpen] = useState<number | null>(0)
  const base = useId()

  return (
    <ol className="border-t border-hairline">
      {items.map((item, i) => {
        const num = <span className="label w-8 shrink-0 text-muted md:w-auto">{String(i + 1).padStart(2, '0')}</span>
        if (wide) {
          return (
            <li key={item.name} className="grid grid-cols-12 items-baseline gap-6 border-b border-hairline py-7">
              <span className="col-span-1">{num}</span>
              <h3 className="serif col-span-6 text-heading">{item.name}</h3>
              <p className="col-span-5 text-lead text-paper/85">{item.question}</p>
            </li>
          )
        }
        const expanded = open === i
        const panelId = `${base}-panel-${i}`
        const btnId = `${base}-btn-${i}`
        return (
          <li key={item.name} className="border-b border-hairline">
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : i)}
                className="flex min-h-[44px] w-full items-center gap-3 py-5 text-left"
              >
                {num}
                <span className="serif flex-1 text-heading">{item.name}</span>
                <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
                  <path d="M0 6h12" stroke="currentColor" strokeWidth="1" />
                  {!expanded && <path d="M6 0v12" stroke="currentColor" strokeWidth="1" />}
                </svg>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} hidden={!expanded} className="pb-6 pl-11">
              <p className="text-lead text-paper/85">{item.question}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
