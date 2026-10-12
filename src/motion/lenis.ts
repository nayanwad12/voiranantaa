import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null

/**
 * Smooth scrolling for mouse / trackpad only. Touch devices keep native momentum scrolling
 * (and CSS scroll-snap later), and reduced-motion visitors get plain scrolling.
 * Lenis is driven by GSAP's ticker so ScrollTrigger and Lenis never disagree.
 */
export function initLenis(): () => void {
  const fine = window.matchMedia('(pointer: fine)').matches
  if (!fine || prefersReducedMotion()) return () => {}

  lenis = new Lenis({ duration: 1.15, smoothWheel: true, autoRaf: false })
  lenis.on('scroll', ScrollTrigger.update)
  if (new URLSearchParams(location.search).has('debug')) Object.assign(window, { __lenis: lenis })
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export function setScrollLocked(locked: boolean) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

/** Scroll to an in-page anchor, then move focus there so keyboard and screen-reader users land with it. */
export function scrollToHash(hash: string) {
  const target = hash === '#top' ? document.getElementById('top') : document.querySelector<HTMLElement>(hash)
  if (!target) return

  const focusTarget = () => {
    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
      target.setAttribute('tabindex', '-1')
    }
    target.focus({ preventScroll: true })
  }

  if (lenis) {
    // html's scroll-padding-top already keeps the target clear of the sticky header.
    lenis.scrollTo(hash === '#top' ? 0 : target, { force: true, onComplete: focusTarget })
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    focusTarget()
  }
  history.pushState(null, '', hash)
}

/** One delegated handler for every in-page link (nav, skip link, Register placeholder, footer). */
export function installAnchorHandling(): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = (e.target as Element).closest?.('a[href^="#"]') as HTMLAnchorElement | null
    if (!link) return
    const hash = link.getAttribute('href')!
    if (hash.length < 2) return
    e.preventDefault()
    // Let any state change from the same click (e.g. closing the mobile menu) commit first.
    setTimeout(() => scrollToHash(hash), 0)
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
