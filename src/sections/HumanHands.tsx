import { humanHands } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { HandLine } from '../components/ui/HandLine'

export function HumanHands() {
  return (
    <Section id="human-made" scene="human-hands" labelledBy="human-hands-title">
      <div className="container-x section-y grid-editorial gap-y-12">
        <SectionHeader number={humanHands.number} title={humanHands.title} id="human-hands-title" className="col-span-4 md:col-span-12" />

        <p className="serif col-span-4 text-display uppercase md:col-span-12">{humanHands.statement}</p>

        <p className="col-span-4 text-lead text-paper/85 md:col-span-5">{humanHands.body}</p>

        <ul className="col-span-4 border-t border-hairline md:col-span-6 md:col-start-7">
          {humanHands.rules.map((rule) => (
            <li key={rule} className="flex items-center gap-5 border-b border-hairline py-5">
              <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0 text-muted">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="text-lead">{rule}</span>
            </li>
          ))}
        </ul>

        <div className="col-span-4 md:col-span-12 md:pt-16">
          <HandLine className="w-full max-w-[56rem] text-paper/80" />
          <p className="serif mt-6 text-heading italic md:mt-10">{humanHands.closing}</p>
        </div>
      </div>
    </Section>
  )
}
