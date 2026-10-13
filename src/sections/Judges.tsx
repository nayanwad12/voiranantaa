import { judges } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TagList } from '../components/ui/TagList'
import { InfinityMark } from '../components/ui/Infinity'

export function Judges() {
  return (
    <Section id="judges" scene="judges" labelledBy="judges-title">
      <div className="container-x section-y grid-editorial gap-y-12">
        <SectionHeader number={judges.number} title={judges.title} id="judges-title" className="col-span-4 md:col-span-12" />
        <p data-reveal="lines" className="serif col-span-4 text-display uppercase md:col-span-11">
          {judges.statement}
        </p>

        <div className="col-span-4 md:col-span-6">
          <p data-reveal="fade" className="text-lead text-paper/85">
            {judges.intro}
          </p>
          <TagList items={judges.fields} size="md" className="mt-6" />
        </div>

        <div
          data-reveal="fade"
          className="col-span-4 flex flex-col items-start justify-between gap-10 border border-hairline p-6 sm:p-10 md:col-span-5 md:col-start-8"
        >
          <InfinityMark className="w-16 text-muted" />
          <p className="serif text-heading italic">{judges.note}</p>
        </div>
      </div>
    </Section>
  )
}
