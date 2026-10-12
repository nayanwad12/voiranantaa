import { show } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'

export function Show() {
  return (
    <Section id="show" scene="show" labelledBy="show-title">
      <div className="container-x section-y">
        <SectionHeader number={show.number} title={show.title} id="show-title" />

        <p className="serif mt-14 text-[clamp(3.5rem,0.6rem+12vw,13rem)] leading-[0.86] uppercase md:mt-20">
          <span className="block whitespace-nowrap">{show.statement[0]}</span>
          <span className="block whitespace-nowrap italic pl-[0.6em] md:pl-[1.2em]">{show.statement[1]}</span>
        </p>

        <div className="mt-16 grid-editorial gap-y-6 md:mt-24">
          <p data-reveal="fade" className="label col-span-4 text-muted md:col-span-3 md:pt-4">{show.meetsIntro}</p>
          <ul data-reveal="stagger" data-reveal-step="0.35" className="serif col-span-4 text-title uppercase md:col-span-9">
            {show.meets.map((line) => (
              <li key={line} className="border-b border-hairline py-4 first:border-t md:py-5">
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 grid-editorial gap-y-6 md:mt-20">
          <p data-reveal="fade" className="col-span-4 text-lead text-paper/85 md:col-span-6 md:col-start-4">{show.body}</p>
          <p data-reveal="fade" className="label col-span-4 text-paper md:col-span-6 md:col-start-4">{show.closing}</p>
        </div>
      </div>
    </Section>
  )
}
