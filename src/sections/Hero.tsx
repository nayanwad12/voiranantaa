import { useRef } from 'react'
import { hero } from '../content/site'
import { InfinityMark } from '../components/ui/Infinity'
import { gsap, MOTION_OK, useGSAP } from '../motion/gsap'
import { screenPathLength } from '../motion/draw'

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Intro: the loop draws itself, the title rises out of its masks, then the details settle in.
        const path = root.current!.querySelector<SVGPathElement>('[data-hero-loop] path')!
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .fromTo(
            path,
            { strokeDasharray: () => screenPathLength(path), strokeDashoffset: () => screenPathLength(path) },
            { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' },
            0,
          )
          .from('[data-hero-line]', { yPercent: 105, duration: 1.4, stagger: 0.14 }, 0.15)
          .from('[data-hero-fade]', { opacity: 0, y: 14, duration: 1.1, stagger: 0.08 }, 0.75)

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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="halo absolute h-[70vmin] w-[120vmin] [--halo:rgb(242_238_230/0.06)]" />
        <InfinityMark data-hero-loop className="w-[min(118vw,72rem)] text-paper/25" strokeWidth={1} />
      </div>

      <div className="container-x flex flex-1 flex-col justify-between gap-10 pt-6 pb-[max(2rem,var(--safe-bottom))] sm:pt-10">
        <p data-hero-fade className="label flex justify-between gap-4 text-muted">
          <span>{hero.edition}</span>
          <span className="text-paper">{hero.theme}</span>
        </p>

        <div data-hero-title>
          <h1 id="hero-title" className="serif text-mega uppercase">
            <span className="hero-mask">
              <span data-hero-line className="block">
                VOIR
              </span>
            </span>{' '}
            <span className="hero-mask text-right">
              <span data-hero-line className="block">
                ANANTA
              </span>
            </span>
          </h1>
          <p data-hero-fade className="serif mt-5 text-right text-subheading italic sm:mt-7">
            {hero.tagline}
          </p>
        </div>

        <div className="flex items-end justify-between gap-6">
          <p data-hero-fade className="max-w-[22rem] text-lead text-paper/85">
            {hero.intro}
          </p>
          <a
            data-hero-fade
            href="#about"
            className="tap group flex shrink-0 flex-col items-center gap-3 text-muted transition-colors hover:text-paper"
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
