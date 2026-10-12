import { useEffect } from 'react'
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from './gsap'
import { initLenis, installAnchorHandling } from './lenis'
import { setupReveals } from './reveals'

/** Mounts once: smooth scroll, anchor handling and the global data-reveal animations. */
export function SiteMotion() {
  useEffect(() => {
    const stopLenis = initLenis()
    const stopAnchors = installAnchorHandling()
    // Line breaks change when the web fonts arrive; re-measure every trigger once they have.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      stopAnchors()
      stopLenis()
    }
  }, [])

  useGSAP(() => {
    const main = document.getElementById('main')
    if (!main) return
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => setupReveals(main))
    return () => mm.revert()
  })

  return null
}
