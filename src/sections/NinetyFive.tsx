import { FRAGMENTS, ninetyFive } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { TagList } from '../components/ui/TagList'
import { useRef } from 'react'
import { gsap, MOTION_OK, REVERSIBLE, useGSAP } from '../motion/gsap'

const TOTAL = FRAGMENTS.unconventional + FRAGMENTS.fabric

/** 100 cells: the static (and fallback) picture of the rule. Count is derived from FRAGMENTS. */
function FragmentGrid() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // 95 fragments gather from scattered positions; the 5 fabric pieces settle last.
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 80%', toggleActions: REVERSIBLE } })
        tl.from('[data-cell="material"]', {
          opacity: 0,
          scale: 0.2,
          x: () => gsap.utils.random(-40, 40),
          y: () => gsap.utils.random(-40, 40),
          rotate: () => gsap.utils.random(-90, 90),
          duration: 1,
          ease: 'expo.out',
          stagger: { each: 0.01, from: 'random' },
        }).from('[data-cell="fabric"]', { opacity: 0, scale: 0, duration: 1.2, ease: 'elastic.out(1, 0.6)', stagger: 0.08 }, '-=0.4')
      })
      return () => mm.revert()
    },
    { scope: ref },
  )
  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${TOTAL} fragments: ${FRAGMENTS.unconventional} unconventional material, ${FRAGMENTS.fabric} textile / fabric`}
      className="grid grid-cols-10 gap-1.5 sm:gap-2"
    >
      {Array.from({ length: TOTAL }, (_, i) => {
        const fabric = i >= FRAGMENTS.unconventional
        return (
          <span
            key={i}
            data-cell={fabric ? 'fabric' : 'material'}
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

        <dl data-reveal="stagger" className="col-span-4 grid grid-cols-[auto_1fr] items-end gap-x-6 gap-y-8 md:col-span-6">
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

        {/* Clipped so the scattered fragments never poke past the screen edge; padded for the fabric glow. */}
        <div className="col-span-4 -m-5 overflow-hidden p-5 md:col-span-5 md:col-start-8 md:self-end">
          <FragmentGrid />
        </div>

        <div className="col-span-4 space-y-8 md:col-span-6 md:col-start-7">
          <p data-reveal="fade" className="text-lead text-paper/85">{ninetyFive.body}</p>
          <div>
            <p data-reveal="fade" className="label mb-4 text-muted">{ninetyFive.materialsIntro}</p>
            <TagList items={ninetyFive.materials} />
          </div>
        </div>

        <div className="col-span-4 md:col-span-12 md:pt-16">
          <p data-reveal="lines" className="serif text-display uppercase">{ninetyFive.statement}</p>
          <p data-reveal="fade" className="mt-6 text-lead text-muted italic">{ninetyFive.statementNote}</p>
        </div>
      </div>
    </Section>
  )
}
