import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// Mobile address-bar show/hide must not re-layout every trigger.
ScrollTrigger.config({ ignoreMobileResize: true })
gsap.defaults({ ease: 'power3.out', duration: 1 })

/** Every decorative animation is gated on this; reduced-motion visitors get the static page. */
export const MOTION_OK = '(prefers-reduced-motion: no-preference)'

/** Reveals play on the way down and reverse on the way back up. */
export const REVERSIBLE = 'play none none reverse'

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger, SplitText, useGSAP }
