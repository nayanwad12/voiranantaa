import { hero } from '../content/site'
import { InfinityMark } from '../components/ui/Infinity'

export function Hero() {
  return (
    <section
      id="top"
      data-scene="hero"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-[calc(var(--header-h)+var(--safe-top))]"
    >
      {/* Static ∞ — shown until (or instead of) the WebGL thread. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="halo absolute h-[70vmin] w-[120vmin] [--halo:rgb(242_238_230/0.06)]" />
        <InfinityMark className="w-[min(118vw,72rem)] text-paper/25" strokeWidth={1} />
      </div>

      <div className="container-x flex flex-1 flex-col justify-between gap-10 pt-6 pb-[max(2rem,var(--safe-bottom))] sm:pt-10">
        <p className="label flex justify-between gap-4 text-muted">
          <span>{hero.edition}</span>
          <span className="text-paper">{hero.theme}</span>
        </p>

        <div>
          <h1 id="hero-title" className="serif text-mega uppercase">
            <span className="block">VOIR</span>{' '}
            <span className="block text-right">ANANTA</span>
          </h1>
          <p className="serif mt-5 text-right text-subheading italic sm:mt-7">
            {hero.tagline}
          </p>
        </div>

        <div className="flex items-end justify-between gap-6">
          <p className="max-w-[22rem] text-lead text-paper/85">{hero.intro}</p>
          <a href="#about" className="tap group flex shrink-0 flex-col items-center gap-3 text-muted transition-colors hover:text-paper">
            <span className="sr-only">Scroll to the next section</span>
            <span aria-hidden="true" className="relative block h-14 w-px overflow-hidden bg-hairline-strong">
              <span className="absolute inset-x-0 top-0 h-1/2 bg-paper" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
