import { useRef } from 'react'
import { hero } from '../content/site'
import { InfinityMark } from '../components/ui/Infinity'
import { gsap, MOTION_OK, useGSAP } from '../motion/gsap'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // The intro (loop draws, title rises, details settle) is pure CSS so it starts at first paint
        // on the prerendered HTML — see .hero-* in base.css.
        // Leaving the hero: the title drifts up and recedes; reverses exactly on the way back.
        gsap.to('[data-hero-title]', {
          yPercent: -18,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="top"
      data-scene="hero"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-[calc(var(--header-h)+var(--safe-top))]"
    >
      {/* Static ∞ — drawn on load; shown until (or instead of) the WebGL thread. */}
      <div aria-hidden="true" className="static-art pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="halo absolute h-[70vmin] w-[120vmin] [--halo:rgb(242_238_230/0.06)]" />
        <InfinityMark className="hero-loop w-[min(118vw,72rem)] text-paper/25" strokeWidth={0.28} scaling />
      </div>

      <div className="container-x flex flex-1 flex-col justify-between gap-10 pt-6 pb-[max(2rem,var(--safe-bottom))] sm:pt-10">
        <p className="hero-fade label flex justify-between gap-4 text-muted">
          <span>{hero.edition}</span>
          <span className="text-paper">{hero.theme}</span>
        </p>

        <div data-hero-title>
          <h1 id="hero-title" className="serif text-mega uppercase">
            <span className="hero-mask">
              <span className="hero-line block">VOIR</span>
            </span>{' '}
            <span className="hero-mask text-right">
              <span className="hero-line block [animation-delay:0.29s]">ANANTA</span>
            </span>
          </h1>
          <p className="hero-fade serif mt-5 text-right [animation-delay:0.85s] text-subheading italic sm:mt-7">{hero.tagline}</p>
        </div>

        <div className="flex items-end justify-between gap-6">
          <p className="hero-fade max-w-[22rem] [animation-delay:0.95s] text-lead text-paper">{hero.intro}</p>
          <a
            href="#about"
            className="hero-fade tap group [animation-delay:1.05s] flex shrink-0 flex-col items-center gap-3 text-muted transition-colors hover:text-paper"
          >
            <span className="sr-only">Scroll to the next section</span>
            <span aria-hidden="true" className="scroll-cue relative block h-14 w-px overflow-hidden bg-hairline-strong">
              <span className="absolute inset-x-0 top-0 h-1/2 bg-paper" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
