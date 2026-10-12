import { firstEdition, rasas } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { RasaSwatch } from '../components/ui/RasaSwatch'

export function Rasas() {
  return (
    <Section id="rasas" scene="rasas" labelledBy="rasas-title">
      <div className="container-x section-y grid-editorial gap-y-10">
        <div className="col-span-4 md:col-span-6">
          <SectionHeader
            number={firstEdition.number}
            kicker={firstEdition.label}
            title={firstEdition.title}
            id="rasas-title"
            titleClassName="text-display"
          />
          <p className="serif mt-5 text-subheading italic text-paper/90">{firstEdition.subtitle}</p>
        </div>
        <div className="col-span-4 space-y-6 text-lead text-paper/85 md:col-span-5 md:col-start-8 md:self-end">
          {firstEdition.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      <div className="container-x">
        <p className="label mb-6 text-muted">{firstEdition.rasasIntro}</p>
        <ol className="border-t border-hairline">
          {rasas.map((rasa, i) => (
            <li
              key={rasa.key}
              className="group grid-editorial relative items-center gap-y-1 border-b border-hairline py-6 md:py-8"
            >
              <span className="label col-span-1 text-muted tabular-nums md:col-span-2">
                {i + 1}/{rasas.length}
              </span>
              <span className="col-span-3 flex items-center justify-between gap-4 md:col-span-10 md:grid md:grid-cols-10">
                <span className="serif text-heading md:col-span-6">{rasa.name}</span>
                <span className="hidden text-body text-muted md:col-span-3 md:block">{rasa.meaning}</span>
                <span className="flex justify-end md:col-span-1">
                  <RasaSwatch rasa={rasa} />
                </span>
              </span>
              <span className="col-span-3 col-start-2 text-body text-muted md:hidden">{rasa.meaning}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="container-x section-y">
        <p className="serif text-display uppercase">
          {firstEdition.statement.map((line, i) => (
            <span key={line} className={`block ${['', 'md:pl-[0.75em]', 'italic md:pl-[1.5em]'][i]}`}>
              {line}
            </span>
          ))}
        </p>
      </div>
    </Section>
  )
}
