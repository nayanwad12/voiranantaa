import { partnerships } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TagList } from '../components/ui/TagList'
import { PartnerContact } from '../components/ui/PartnerContact'

export function Partnerships() {
  return (
    <Section id="partner" scene="partnerships" labelledBy="partnerships-title">
      <div className="container-x section-y grid-editorial gap-y-14">
        <SectionHeader number={partnerships.number} title={partnerships.title} id="partnerships-title" className="col-span-4 md:col-span-12" />
        <p data-reveal="lines" className="serif col-span-4 text-display uppercase md:col-span-11">{partnerships.statement}</p>

        <div className="col-span-4 md:col-span-5">
          <p data-reveal="fade" className="label mb-5 text-muted">{partnerships.areasIntro}</p>
          <TagList items={partnerships.areas} size="md" />
        </div>

        <div className="col-span-4 md:col-span-6 md:col-start-7">
          <p data-reveal="fade" className="label mb-5 text-muted">{partnerships.tiersIntro}</p>
          <ol data-reveal="stagger" className="border-t border-hairline">
            {partnerships.tiers.map((tier, i) => (
              <li key={tier} className="flex items-baseline gap-5 border-b border-hairline py-4">
                <span className="label w-6 shrink-0 text-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="serif text-subheading">{tier}</span>
              </li>
            ))}
          </ol>
        </div>

        <div data-reveal="fade" className="col-span-4 flex flex-col gap-4 border-t border-hairline pt-10 md:col-span-12 md:flex-row md:items-center md:justify-between">
          <p className="label text-muted">{partnerships.contactIntro}</p>
          <PartnerContact />
        </div>
      </div>
    </Section>
  )
}
