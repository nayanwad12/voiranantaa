import { lenses } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'

/**
 * Six lenses. Stacked on phones, 2-up on tablets, arranged on a ring on desktop (lg+).
 * The ring positions are CSS custom properties so the same markup serves every layout.
 */
export function Lenses() {
  const n = lenses.items.length
  return (
    <Section id="lenses" scene="lenses" labelledBy="lenses-title">
      <div className="container-x section-y">
        <SectionHeader number={lenses.number} title={lenses.title} id="lenses-title" />
        <p className="mt-8 max-w-[34rem] text-lead text-paper/85 lg:hidden">{lenses.intro}</p>

        <div className="relative mt-12 lg:mx-auto lg:mt-16 lg:aspect-[1.35] lg:max-w-[76rem]">
          {/* Ring + centre text, desktop only */}
          <div aria-hidden="true" className="absolute inset-[10%_17%] hidden rounded-[50%] border border-hairline-strong lg:block" />
          <p className="absolute top-1/2 left-1/2 hidden w-[22rem] -translate-x-1/2 -translate-y-1/2 text-center text-lead text-paper/85 lg:block">
            {lenses.intro}
          </p>

          <ol className="grid gap-px bg-hairline md:grid-cols-2 lg:contents">
            {lenses.items.map((lens, i) => {
              const angle = (-90 + (360 / n) * i) * (Math.PI / 180)
              return (
                <li
                  key={lens.name}
                  style={{
                    ['--x' as string]: `${50 + Math.cos(angle) * 33}%`,
                    ['--y' as string]: `${50 + Math.sin(angle) * 40}%`,
                  }}
                  className="flex flex-col gap-3 bg-ink py-6 sm:p-8 lg:absolute lg:top-[var(--y)] lg:left-[var(--x)] lg:w-[clamp(16rem,19vw,22rem)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:border lg:border-hairline lg:bg-ink/90 lg:p-7"
                >
                  <span className="label text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="serif text-heading">{lens.name}</h3>
                  <p className="text-body text-paper/85">{lens.question}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </Section>
  )
}
