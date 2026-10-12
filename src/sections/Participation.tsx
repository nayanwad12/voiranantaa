import { participation } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'
import { RegisterButton } from '../components/ui/RegisterButton'

export function Participation() {
  return (
    <Section id="participation" scene="participation" labelledBy="participation-title">
      <div className="container-x section-y">
        <SectionHeader number={participation.number} title={participation.title} id="participation-title" />

        <ul data-reveal="stagger" className="mt-12 grid gap-px border border-hairline bg-hairline md:mt-16 md:grid-cols-2">
          {participation.fees.map((fee) => (
            <li key={fee.label} className="flex flex-col justify-between gap-12 bg-ink p-6 sm:p-10 lg:min-h-[20rem] lg:p-12">
              <p className="label text-muted">{fee.label}</p>
              <p className="serif text-[clamp(4rem,2.5rem+6vw,9rem)] leading-[0.85] tabular-nums">
                {/* Instrument Serif has no ₹; the Inter fallback glyph is set light to sit with the serif. */}
                {fee.amount.startsWith('₹') ? (
                  <>
                    <span className="font-extralight">₹</span>
                    {fee.amount.slice(1)}
                  </>
                ) : (
                  fee.amount
                )}
              </p>
            </li>
          ))}
        </ul>

        <div data-reveal="fade" className="mt-10 flex flex-col gap-10 md:mt-14 md:flex-row md:items-end md:justify-between">
          <dl className="grid gap-6 sm:grid-cols-2 sm:gap-14">
            {participation.dates.map((d) => (
              <div key={d.label}>
                <dt className="label text-muted">{d.label}</dt>
                <dd className="serif mt-2 text-heading">{d.value}</dd>
              </div>
            ))}
          </dl>
          <RegisterButton size="lg" className="w-full md:w-auto" />
        </div>
      </div>
    </Section>
  )
}
