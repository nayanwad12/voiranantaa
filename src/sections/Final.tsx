import { final } from '../content/site'
import { RegisterButton } from '../components/ui/RegisterButton'
import { InfinityMark } from '../components/ui/Infinity'

export function Final() {
  return (
    <section
      id="final"
      data-scene="final"
      aria-labelledby="final-title"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden py-24"
    >
      <div aria-hidden="true" className="static-art pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <InfinityMark className="w-[min(130vw,80rem)] text-paper/15" />
      </div>
      <div className="container-x flex flex-col items-center text-center">
        <h2 id="final-title" data-reveal="lines" className="serif text-statement uppercase">
          {final.question}
        </h2>
        <div data-reveal="stagger" className="mt-12 flex flex-col items-center gap-3 md:mt-16">
          <p className="serif text-heading">{final.name}</p>
          <p className="label text-paper">{final.edition}</p>
          <p className="serif text-subheading italic">{final.tagline}</p>
          <p className="mt-2 text-body text-muted">{final.initiative}</p>
        </div>
        <RegisterButton size="lg" className="mt-12 w-full sm:w-auto md:mt-14" />
      </div>
    </section>
  )
}
