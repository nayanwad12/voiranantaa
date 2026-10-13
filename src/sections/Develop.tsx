import { develop } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Accordion } from '../components/ui/Accordion'

export function Develop() {
  return (
    <Section id="develop" scene="develop" labelledBy="develop-title">
      <div className="container-x section-y">
        <SectionHeader
          number={develop.number}
          title={develop.title}
          id="develop-title"
          titleClassName="text-title max-w-[16ch]"
        />
        <p data-reveal="fade" className="label mt-12 mb-6 text-muted md:mt-16">
          {develop.intro}
        </p>
        <Accordion items={develop.items} />
        <p data-reveal="fade" className="mt-10 max-w-[40rem] text-lead text-paper/85">
          {develop.closing}
        </p>
      </div>
    </Section>
  )
}
