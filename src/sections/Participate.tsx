import { participate } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Marquee } from '../components/ui/Marquee'

export function Participate() {
  return (
    <Section id="participate" scene="participate" labelledBy="participate-title">
      <div className="section-y">
        <div className="container-x grid-editorial gap-y-10">
          <SectionHeader
            number={participate.number}
            title={participate.title}
            id="participate-title"
            className="col-span-4 md:col-span-12"
          />
          <p data-reveal="lines" className="serif col-span-4 text-display uppercase md:col-span-11">
            {participate.statement}
          </p>
          <p data-reveal="fade" className="col-span-4 text-lead text-paper/85 md:col-span-6">
            {participate.eligibility}
          </p>
        </div>

        <div className="mt-14 border-y border-hairline md:mt-20">
          <Marquee items={participate.disciplines} label="Disciplines" />
        </div>

        <div className="container-x mt-10">
          <p data-reveal="fade" className="text-lead text-muted">
            {participate.closing}
          </p>
        </div>
      </div>
    </Section>
  )
}
