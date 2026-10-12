import { SkipLink } from './components/layout/SkipLink'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Hero } from './sections/Hero'
import { WhatIs } from './sections/WhatIs'
import { Rasas } from './sections/Rasas'
import { Categories } from './sections/Categories'
import { NinetyFive } from './sections/NinetyFive'
import { HumanHands } from './sections/HumanHands'
import { Experience } from './sections/Experience'
import { Participate } from './sections/Participate'
import { Selection } from './sections/Selection'
import { Lenses } from './sections/Lenses'
import { Journey } from './sections/Journey'
import { Participation } from './sections/Participation'
import { Develop } from './sections/Develop'
import { Show } from './sections/Show'
import { Judges } from './sections/Judges'
import { Partnerships } from './sections/Partnerships'
import { AboutVoirtales } from './sections/AboutVoirtales'
import { Final } from './sections/Final'

export default function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <Hero />
        <WhatIs />
        <Rasas />
        <Categories />
        <NinetyFive />
        <HumanHands />
        <Experience />
        <Participate />
        <Selection />
        <Lenses />
        <Journey />
        <Participation />
        <Develop />
        <Show />
        <Judges />
        <Partnerships />
        <AboutVoirtales />
        <Final />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
