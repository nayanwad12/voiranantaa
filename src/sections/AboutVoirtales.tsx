import { aboutVoirtales } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'

export function AboutVoirtales() {
  return (
    <Section id="voirtales" scene="voirtales" labelledBy="voirtales-title">
      <div className="container-x section-y grid-editorial gap-y-10">
        <SectionHeader number={aboutVoirtales.number} title={aboutVoirtales.title} id="voirtales-title" className="col-span-4 md:col-span-12" />
        <p data-reveal="lines" className="serif col-span-4 text-display uppercase md:col-span-7">{aboutVoirtales.statement}</p>
        <div data-reveal="stagger" className="col-span-4 space-y-6 text-lead text-paper/85 md:col-span-4 md:col-start-9 md:self-end">
          {aboutVoirtales.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="label pt-4 text-muted">{aboutVoirtales.signature}</p>
        </div>
      </div>
    </Section>
  )
}
