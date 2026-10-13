import { selection } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TagList } from '../components/ui/TagList'
import { useRef } from 'react'
import { gsap, MOTION_OK, REVERSIBLE, useGSAP } from '../motion/gsap'
import { whenNear } from '../motion/arm'

/** A row of points of light — one per finalist place. The first one is the (eventual) category winner. */
function Lights({ count }: { count: number }) {
  return (
    <span aria-hidden="true" className="flex flex-wrap gap-2.5 sm:gap-3">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          data-light={i === 0 ? 'winner' : 'finalist'}
          className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-paper shadow-[0_0_16px_4px_rgb(242_238_230/0.5)]' : 'bg-paper/35'}`}
        />
      ))}
    </span>
  )
}

export function Selection() {
  const lights = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Set up in idle time once the section is near (keeps page load light on phones).
      mm.add(MOTION_OK, (context) =>
        whenNear(lights.current!, () =>
          context.add(() => {
            // 20 points of light appear (10 / 10), then one in each category brightens as the winner.
            gsap
              .timeline({ scrollTrigger: { trigger: lights.current, start: 'top 75%', toggleActions: REVERSIBLE } })
              .from('[data-light]', {
                opacity: 0,
                scale: 0,
                duration: 0.6,
                ease: 'back.out(3)',
                stagger: { each: 0.05, grid: 'auto' },
              })
              .from(
                '[data-light="winner"]',
                {
                  boxShadow: '0 0 0px 0px rgba(242,238,230,0)',
                  backgroundColor: 'rgba(242,238,230,0.35)',
                  duration: 1.2,
                  ease: 'power2.out',
                },
                '+=0.2',
              )
          }),
        ),
      )
      return () => mm.revert()
    },
    { scope: lights },
  )
  return (
    <Section id="selection" scene="selection" labelledBy="selection-title">
      <div className="container-x section-y grid-editorial gap-y-14">
        <SectionHeader
          number={selection.number}
          title={selection.title}
          id="selection-title"
          className="col-span-4 md:col-span-12"
        />

        <p data-reveal="lines" className="serif col-span-4 text-display uppercase md:col-span-12">
          {selection.finalists}
        </p>

        <div ref={lights} className="col-span-4 md:col-span-12">
          <p data-reveal="fade" className="label mb-6 text-muted">
            {selection.fromIntro}
          </p>
          <ul className="grid gap-px bg-hairline sm:grid-cols-2">
            {selection.split.map((s) => (
              <li key={s.category} className="flex flex-col gap-6 bg-ink py-6 sm:px-8 sm:first:pl-0">
                <span className="serif text-heading">
                  <span className="tabular-nums">{s.count}</span> — {s.category}
                </span>
                <Lights count={s.count} />
              </li>
            ))}
          </ul>
          <p data-reveal="fade" className="mt-8 max-w-[40rem] text-lead text-paper">
            {selection.body}
          </p>
        </div>

        <div className="col-span-4 md:col-span-6">
          <h3 data-reveal="lines" className="serif text-title">
            {selection.winnersTitle}
          </h3>
          <p data-reveal="fade" className="mt-4 text-lead text-muted">
            {selection.winnersNote}
          </p>
          <ul data-reveal="stagger" className="mt-8 border-t border-hairline">
            {selection.winners.map((w) => (
              <li key={w} className="label flex items-center gap-4 border-b border-hairline py-5 text-paper">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-paper shadow-[0_0_14px_3px_rgb(242_238_230/0.55)]" />
                {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-4 md:col-span-5 md:col-start-8 md:self-end">
          <p data-reveal="fade" className="label mb-4 text-muted">
            {selection.recognitionsIntro}
          </p>
          <TagList items={selection.recognitions} size="md" />
        </div>
      </div>
    </Section>
  )
}
