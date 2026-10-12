import { useRef } from 'react'
import { journey } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { gsap, MOTION_OK, REVERSIBLE, useGSAP } from '../motion/gsap'

export function Journey() {
  const list = useRef<HTMLOListElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // The thread is drawn down the timeline by the scroll.
        gsap.from('[data-journey-line]', {
          scaleY: 0,
          ease: 'none',
          scrollTrigger: { trigger: list.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 },
        })
        // Each date is a bead of light that switches on as the visitor passes it.
        gsap.utils.toArray<HTMLElement>('[data-journey-step]').forEach((step) => {
          const st = { trigger: step, start: 'top 70%', toggleActions: REVERSIBLE }
          gsap.from(step.querySelector('[data-bead]'), { scale: 0.2, opacity: 0.2, duration: 0.6, ease: 'back.out(3)', scrollTrigger: st })
          gsap.from(step.querySelectorAll('[data-step-text]'), { opacity: 0, x: 18, duration: 0.9, stagger: 0.08, scrollTrigger: st })
        })
      })
      return () => mm.revert()
    },
    { scope: list },
  )

  return (
    <Section id="journey" scene="journey" labelledBy="journey-title">
      <div className="container-x section-y">
        <SectionHeader number={journey.number} title={journey.title} id="journey-title" />

        <ol ref={list} className="relative mt-14 md:mt-20">
          {/* The thread, as a timeline */}
          <span
            data-journey-line
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-gradient-to-b from-paper/0 via-paper/40 to-paper/0 md:left-[calc(33.333%+5px)]"
          />
          {journey.steps.map((step) => (
            <li key={step.date} data-journey-step className="relative grid gap-2 py-7 pl-10 md:grid-cols-3 md:gap-10 md:py-9 md:pl-0">
              <span
                data-bead
                aria-hidden="true"
                className={`absolute top-[2.35rem] left-0 h-[11px] w-[11px] rounded-full md:top-[2.85rem] md:left-1/3 ${
                  step.tentative
                    ? 'border border-paper bg-ink shadow-[0_0_18px_4px_rgb(242_238_230/0.35)]'
                    : 'bg-paper shadow-[0_0_14px_3px_rgb(242_238_230/0.45)]'
                }`}
              />
              <p data-step-text className="serif text-heading md:pr-10 md:text-right">
                {step.date}
              </p>
              <div data-step-text className="md:col-span-2 md:pl-12">
                <p className="label text-paper md:pt-3">{step.event}</p>
                {step.tentative && (
                  <span className="label mt-3 inline-block border border-dashed border-paper/50 px-2.5 py-1 text-paper">
                    {journey.tentativeMarker}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p data-reveal="fade" className="mt-8 text-body text-muted md:pl-[calc(33.333%+3rem)]">
          {journey.footnote}
        </p>
      </div>
    </Section>
  )
}
