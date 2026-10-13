import { humanHands } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { HandLine } from '../components/ui/HandLine'
import { useRef } from 'react'
import { gsap, MOTION_OK, useGSAP } from '../motion/gsap'
import { whenNear } from '../motion/arm'
import { screenPathLength } from '../motion/draw'

export function HumanHands() {
  const drawing = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Set up in idle time once the section is near (keeps page load light on phones).
      mm.add(MOTION_OK, (context) =>
        whenNear(drawing.current!, () =>
          context.add(() => {
            // The line is drawn by the scroll itself, so it un-draws when scrolling back.
            const path = drawing.current!.querySelector<SVGPathElement>('path')!
            gsap.fromTo(
              path,
              { strokeDasharray: () => screenPathLength(path), strokeDashoffset: () => screenPathLength(path) },
              {
                strokeDashoffset: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: drawing.current,
                  start: 'top 90%',
                  end: 'bottom 45%',
                  scrub: 0.6,
                  invalidateOnRefresh: true,
                },
              },
            )
          }),
        ),
      )
      return () => mm.revert()
    },
    { scope: drawing },
  )
  return (
    <Section id="human-made" scene="human-hands" labelledBy="human-hands-title">
      <div className="container-x section-y grid-editorial gap-y-12">
        <SectionHeader
          number={humanHands.number}
          title={humanHands.title}
          id="human-hands-title"
          className="col-span-4 md:col-span-12"
        />

        <p data-reveal="lines" className="serif col-span-4 text-display uppercase md:col-span-12">
          {humanHands.statement}
        </p>

        <p data-reveal="fade" className="col-span-4 text-lead text-paper md:col-span-5">
          {humanHands.body}
        </p>

        <ul data-reveal="stagger" className="col-span-4 border-t border-hairline md:col-span-6 md:col-start-7">
          {humanHands.rules.map((rule) => (
            <li key={rule} className="flex items-center gap-5 border-b border-hairline py-5">
              <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0 text-muted">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="text-lead">{rule}</span>
            </li>
          ))}
        </ul>

        <div ref={drawing} className="col-span-4 md:col-span-12 md:pt-16">
          <HandLine className="w-full max-w-[56rem] text-paper/80" />
          <p data-reveal="lines" className="serif mt-6 text-heading italic md:mt-10">
            {humanHands.closing}
          </p>
        </div>
      </div>
    </Section>
  )
}
