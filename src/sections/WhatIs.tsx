import { whatIs } from '../content/site'
import { Section } from '../components/ui/Section'
import { SectionHeader } from '../components/ui/SectionHeader'

export function WhatIs() {
  return (
    <Section id="about" scene="what-is" labelledBy="what-is-title">
      <div className="container-x section-y grid-editorial gap-y-10">
        <SectionHeader number={whatIs.number} title={whatIs.title} id="what-is-title" className="col-span-4 md:col-span-5" />
        <div className="col-span-4 space-y-6 text-lead text-paper/85 md:col-span-6 md:col-start-7 md:pt-12">
          {whatIs.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      <div className="container-x flex min-h-[100svh] items-center py-24">
        <p className="serif text-statement uppercase">
          <span className="block">{whatIs.statement[0]}</span>
          <span className="mt-[0.15em] block italic md:pl-[1.5em]">{whatIs.statement[1]}</span>
        </p>
      </div>
    </Section>
  )
}
