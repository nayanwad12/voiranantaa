import { categories } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'

function FormGlyph() {
  return (
    <svg viewBox="0 0 160 80" aria-hidden="true" className="h-16 w-32 text-paper/60" fill="none">
      <path
        d="M10 60 C 40 -10, 70 90, 80 40 S 120 -10, 150 30 M30 70 L60 15 L95 65 L130 12"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function VoiceGlyph() {
  const d = Array.from({ length: 61 }, (_, i) => {
    const x = (i / 60) * 160
    const env = Math.sin((i / 60) * Math.PI)
    const y = 40 + Math.sin(i * 0.9) * 26 * env * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.23)))
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 160 80" aria-hidden="true" className="h-16 w-32 text-paper/60" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function Categories() {
  return (
    <Section id="categories" scene="categories" labelledBy="categories-title">
      <div className="container-x section-y">
        <SectionHeader number={categories.number} title={categories.title} id="categories-title" />

        <div className="mt-12 grid gap-px bg-hairline md:mt-16 md:grid-cols-2">
          {categories.items.map((cat) => (
            <article
              key={cat.key}
              aria-labelledby={`cat-${cat.key}`}
              className="flex flex-col gap-8 bg-ink p-6 sm:p-10 lg:min-h-[38rem] lg:p-14"
            >
              <div className="flex items-start justify-between gap-6">
                <p className="label text-muted">{cat.kind}</p>
                {cat.key === 'form' ? <FormGlyph /> : <VoiceGlyph />}
              </div>
              <h3 id={`cat-${cat.key}`} className="serif text-title">
                {cat.name}
              </h3>
              <p className="max-w-[32rem] text-lead text-paper/85">{cat.description}</p>

              <div className="mt-auto">
                <p className="label text-muted">{categories.focusLabel}</p>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.8125rem] font-medium tracking-[0.18em] uppercase">
                  {cat.focus.map((word, i) => (
                    <li key={word} className="flex items-center gap-3">
                      {word}
                      {i < cat.focus.length - 1 && (
                        <span aria-hidden="true" className="text-muted">
                          ·
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="serif border-t border-hairline pt-6 text-heading italic">{cat.question}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}
