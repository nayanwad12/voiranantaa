import { experience } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TagList } from '../components/ui/TagList'
import { TimerRing } from '../components/ui/TimerRing'

export function Experience() {
  return (
    <Section id="experience" scene="experience" labelledBy="experience-title">
      <div className="container-x section-y grid-editorial gap-y-14">
        <SectionHeader number={experience.number} title={experience.title} id="experience-title" className="col-span-4 md:col-span-12" />

        <p className="serif col-span-4 text-display uppercase md:col-span-11">{experience.statement}</p>

        <div className="col-span-4 flex flex-col gap-8 sm:flex-row sm:items-center md:col-span-12 md:gap-14">
          <TimerRing label={experience.timer} className="w-44 shrink-0 sm:w-52 lg:w-64" />
          <p className="max-w-[34rem] text-lead text-paper/85">
            {experience.minutes.before}
            <strong className="font-medium text-paper">{experience.minutes.emphasis}</strong>
            {experience.minutes.after}
          </p>
        </div>

        <div className="col-span-4 md:col-span-5">
          <p className="label mb-4 text-muted">{experience.combineIntro}</p>
          <TagList items={experience.combine} />
        </div>

        <div className="col-span-4 md:col-span-6 md:col-start-7">
          <p className="label mb-6 text-muted">{experience.threeIntro}</p>
          <ol className="serif text-title uppercase">
            {experience.three.map((line, i) => (
              <li key={line} className="flex items-baseline gap-4 border-b border-hairline py-3 first:border-t">
                <span className="label text-muted">{String(i + 1).padStart(2, '0')}</span>
                {line}
              </li>
            ))}
          </ol>
          <p className="mt-8 text-lead text-paper/85">{experience.closing}</p>
        </div>
      </div>
    </Section>
  )
}
