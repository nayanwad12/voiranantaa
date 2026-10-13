import { useRef } from 'react'
import { firstEdition, rasas } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { RasaSwatch } from '../components/ui/RasaSwatch'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ScrollTrigger, useGSAP } from '../motion/gsap'

const N = rasas.length
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (x: number) => x * x * (3 - 2 * x)

/**
 * 02 — Infinite Raga and the nine rasas.
 * Desktop (fine pointer, motion allowed): the signature pinned section. One stage holds; the nine
 * rasas cross-fade as the visitor scrolls, a counter runs 1/9 … 9/9, and the 3D camera travels
 * along the thread through nine zones of light.
 * Everywhere else: nine full-height panels that snap into place, each with its own rasa light.
 * Both are the same ordered list, so assistive tech always reads all nine.
 */
export function Rasas() {
  const pin = useMediaQuery('(min-width: 64rem) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
  const stage = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!pin || !stage.current) return
      const panels = stage.current.querySelectorAll<HTMLElement>('[data-rasa-panel]')
      const ticks = stage.current.querySelectorAll<HTMLElement>('[data-rasa-tick]')
      const render = (progress: number) => {
        const r = progress * N
        panels.forEach((el, i) => {
          let d = r - (i + 0.5)
          if (i === 0) d = Math.max(d, 0)
          if (i === N - 1) d = Math.min(d, 0)
          const a = 1 - smooth(clamp01((Math.abs(d) - 0.28) / 0.22))
          el.style.opacity = String(a)
          el.style.transform = `translate3d(0, ${(-d * 70).toFixed(1)}px, 0)`
        })
        ticks.forEach((t, i) => (t.style.transform = `scaleX(${clamp01(r - i)})`))
        const current = rasas[Math.min(N - 1, Math.floor(r))]
        stage.current!.style.setProperty('--rasa-active', current.rim ?? current.color)
      }
      ScrollTrigger.create({
        trigger: stage.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * 7.2}`,
        pin: true,
        refreshPriority: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
      })
      render(0)
      requestAnimationFrame(() => ScrollTrigger.refresh())
    },
    { dependencies: [pin], revertOnUpdate: true },
  )

  return (
    <Section id="rasas" scene="rasas" labelledBy="rasas-title">
      <div data-scene="rasa-intro" className="container-x section-y grid-editorial gap-y-10">
        <div className="col-span-4 md:col-span-6">
          <SectionHeader
            number={firstEdition.number}
            kicker={firstEdition.label}
            title={firstEdition.title}
            id="rasas-title"
            titleClassName="text-display"
          />
          <p data-reveal="fade" className="serif mt-5 text-subheading italic text-paper/90">
            {firstEdition.subtitle}
          </p>
        </div>
        <div
          data-reveal="stagger"
          className="col-span-4 space-y-6 text-lead text-paper/85 md:col-span-5 md:col-start-8 md:self-end"
        >
          {firstEdition.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      {/* Measured by the 3D scene: on desktop the pinned range, on phones the run of panels. */}
      <div
        data-scene="rasa-journey"
        data-scene-start={pin ? 'top top' : undefined}
        data-scene-end={pin ? 'bottom bottom' : undefined}
      >
        <div ref={stage} className={pin ? 'rasa-stage' : ''}>
          <div
            className={`container-x ${pin ? 'absolute inset-x-0 top-[calc(var(--header-h)+var(--safe-top)+2.5rem)] z-10' : ''}`}
          >
            <p className="label border-b border-hairline pb-6 text-muted">{firstEdition.rasasIntro}</p>
          </div>

          <ol className={pin ? 'rasa-stage__list' : 'rasa-panels'}>
            {rasas.map((rasa, i) => (
              <li key={rasa.key} data-rasa-panel style={{ ['--rasa' as string]: rasa.rim ?? rasa.color }}>
                <div className="container-x w-full">
                  <p className="label flex items-center gap-4 text-muted tabular-nums">
                    <RasaSwatch rasa={rasa} />
                    <span>
                      <span className="text-paper">{String(i + 1).padStart(2, '0')}</span> / {String(N).padStart(2, '0')}
                    </span>
                  </p>
                  <h3 className="serif mt-5 text-[clamp(3.25rem,1rem+10vw,11.5rem)] leading-[0.86] uppercase">{rasa.name}</h3>
                  <p className="serif mt-4 text-[clamp(1.5rem,1.1rem+1.6vw,2.75rem)] italic text-paper/90">{rasa.meaning}</p>
                </div>
              </li>
            ))}
          </ol>

          {pin && (
            <div aria-hidden="true" className="container-x absolute inset-x-0 bottom-[max(2.5rem,var(--safe-bottom))] z-10">
              <div className="grid grid-cols-9 gap-2">
                {rasas.map((rasa) => (
                  <div key={rasa.key}>
                    <div className="relative h-px bg-hairline-strong">
                      <span data-rasa-tick className="absolute inset-0 origin-left scale-x-0 bg-paper" />
                    </div>
                    <span className="label mt-3 hidden text-[0.625rem] text-muted xl:block">{rasa.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div data-scene="rasa-statement" className="container-x section-y">
        <p data-reveal="lines" className="serif text-display uppercase">
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
