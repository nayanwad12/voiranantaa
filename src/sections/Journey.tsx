import { journey } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'

export function Journey() {
  return (
    <Section id="journey" scene="journey" labelledBy="journey-title">
      <div className="container-x section-y">
        <SectionHeader number={journey.number} title={journey.title} id="journey-title" />

        <ol className="relative mt-14 md:mt-20">
          {/* The thread, as a timeline */}
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[5px] w-px bg-gradient-to-b from-paper/0 via-paper/40 to-paper/0 md:left-[calc(33.333%+5px)]" />
          {journey.steps.map((step) => (
            <li key={step.date} className="relative grid gap-2 py-7 pl-10 md:grid-cols-3 md:gap-10 md:py-9 md:pl-0">
              <span
                aria-hidden="true"
                className={`absolute top-[2.35rem] left-0 h-[11px] w-[11px] rounded-full md:top-[2.85rem] md:left-1/3 ${
                  step.tentative
                    ? 'border border-paper bg-ink shadow-[0_0_18px_4px_rgb(242_238_230/0.35)]'
                    : 'bg-paper shadow-[0_0_14px_3px_rgb(242_238_230/0.45)]'
                }`}
              />
              <p className="serif text-heading md:pr-10 md:text-right">{step.date}</p>
              <div className="md:col-span-2 md:pl-12">
                <p className="label text-paper md:pt-3">{step.event}</p>
                {step.tentative && (
                  <span className="label mt-3 inline-block border border-dashed border-paper/50 px-2.5 py-1 text-paper">
                    {journey.tentativeMarker}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-body text-muted md:pl-[calc(33.333%+3rem)]">{journey.footnote}</p>
      </div>
    </Section>
  )
}
