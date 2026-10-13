import { experience } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TagList } from '../components/ui/TagList'
import { TimerRing } from '../components/ui/TimerRing'
import { useRef } from 'react'
import { gsap, MOTION_OK, REVERSIBLE, useGSAP } from '../motion/gsap'
import { whenNear } from '../motion/arm'

export function Experience() {
  const root = useRef<HTMLElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Set up in idle time once the section is near (keeps page load light on phones).
      mm.add(MOTION_OK, (context) =>
        whenNear(root.current!, () =>
          context.add(() => {
            // The 5:00 ring fills as the visitor moves through the section.
            gsap.fromTo(
              '[data-ring]',
              { strokeDashoffset: (_, el: SVGCircleElement) => el.getTotalLength() },
              {
                strokeDashoffset: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: '[data-ring-wrap]',
                  start: 'top 85%',
                  end: () => `+=${window.innerHeight * 0.9}`,
                  scrub: 0.5,
                },
              },
            )
            // THE WORK. / THE IDEA. / THE EXPERIENCE. arrive one at a time.
            gsap.from('[data-three] > li', {
              opacity: 0,
              yPercent: 40,
              duration: 1.1,
              ease: 'expo.out',
              stagger: 0.32,
              scrollTrigger: { trigger: '[data-three]', start: 'top 80%', toggleActions: REVERSIBLE },
            })
          }),
        ),
      )
      return () => mm.revert()
    },
    { scope: root },
  )
  return (
    <Section ref={root} id="experience" scene="experience" labelledBy="experience-title">
      <div className="container-x section-y grid-editorial gap-y-14">
        <SectionHeader
          number={experience.number}
          title={experience.title}
          id="experience-title"
          className="col-span-4 md:col-span-12"
        />

        <p data-reveal="lines" className="serif col-span-4 text-display uppercase md:col-span-11">
          {experience.statement}
        </p>

        <div data-ring-wrap className="col-span-4 flex flex-col gap-8 sm:flex-row sm:items-center md:col-span-12 md:gap-14">
          <TimerRing label={experience.timer} className="w-44 shrink-0 sm:w-52 lg:w-64" />
          <p data-reveal="fade" className="max-w-[34rem] text-lead text-paper">
            {experience.minutes.before}
            <strong className="font-medium text-paper">{experience.minutes.emphasis}</strong>
            {experience.minutes.after}
          </p>
        </div>

        <div className="col-span-4 md:col-span-5">
          <p data-reveal="fade" className="label mb-4 text-muted">
            {experience.combineIntro}
          </p>
          <TagList items={experience.combine} />
        </div>

        <div className="col-span-4 md:col-span-6 md:col-start-7">
          <p data-reveal="fade" className="label mb-6 text-muted">
            {experience.threeIntro}
          </p>
          <ol data-three className="serif text-title uppercase">
            {experience.three.map((line, i) => (
              <li key={line} className="flex items-baseline gap-4 border-b border-hairline py-3 first:border-t">
                <span className="label text-muted">{String(i + 1).padStart(2, '0')}</span>
                {line}
              </li>
            ))}
          </ol>
          <p data-reveal="fade" className="mt-8 text-lead text-paper">
            {experience.closing}
          </p>
        </div>
      </div>
    </Section>
  )
}
