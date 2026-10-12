import { FRAGMENTS, ninetyFive } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TagList } from '../components/ui/TagList'

const TOTAL = FRAGMENTS.unconventional + FRAGMENTS.fabric

/** 100 cells: the static (and fallback) picture of the rule. Count is derived from FRAGMENTS. */
function FragmentGrid() {
  return (
    <div
      role="img"
      aria-label={`${TOTAL} fragments: ${FRAGMENTS.unconventional} unconventional material, ${FRAGMENTS.fabric} textile / fabric`}
      className="grid grid-cols-10 gap-1.5 sm:gap-2"
    >
      {Array.from({ length: TOTAL }, (_, i) => {
        const fabric = i >= FRAGMENTS.unconventional
        return (
          <span
            key={i}
            className={
              fabric
                ? 'aspect-square rounded-full bg-paper shadow-[0_0_18px_rgb(242_238_230/0.45)]'
                : 'aspect-square border border-hairline-strong'
            }
          />
        )
      })}
    </div>
  )
}

export function NinetyFive() {
  return (
    <Section id="material" scene="ninety-five" labelledBy="ninety-five-title">
      <div className="container-x section-y grid-editorial gap-y-14">
        <SectionHeader number={ninetyFive.number} title={ninetyFive.title} id="ninety-five-title" className="col-span-4 md:col-span-12" />

        <dl className="col-span-4 grid grid-cols-[auto_1fr] items-end gap-x-6 gap-y-8 md:col-span-6">
          {ninetyFive.split.map((s) => (
            <div key={s.label} className="contents">
              <dt className="serif text-[clamp(5rem,3rem+9vw,12rem)] leading-[0.8] tabular-nums">
                {s.value}
                <span className="text-[0.45em]">%</span>
              </dt>
              <dd className="label pb-2 text-paper">{s.label}</dd>
            </div>
          ))}
        </dl>

        <div className="col-span-4 md:col-span-5 md:col-start-8 md:self-end">
          <FragmentGrid />
        </div>

        <div className="col-span-4 space-y-8 md:col-span-6 md:col-start-7">
          <p className="text-lead text-paper/85">{ninetyFive.body}</p>
          <div>
            <p className="label mb-4 text-muted">{ninetyFive.materialsIntro}</p>
            <TagList items={ninetyFive.materials} />
          </div>
        </div>

        <div className="col-span-4 md:col-span-12 md:pt-16">
          <p className="serif text-display uppercase">{ninetyFive.statement}</p>
          <p className="mt-6 text-lead text-muted italic">{ninetyFive.statementNote}</p>
        </div>
      </div>
    </Section>
  )
}
