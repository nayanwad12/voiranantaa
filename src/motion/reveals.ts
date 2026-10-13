import { gsap, REVERSIBLE, SplitText } from './gsap'
import { whenNear } from './arm'

/**
 * Declarative scroll reveals, driven by data attributes so sections stay free of animation code:
 *   data-reveal="lines"   split into lines; each line rises out of a mask, one after another
 *   data-reveal="fade"    small upward move + fade
 *   data-reveal="stagger" the element's children fade up in sequence (data-reveal-step = gap in s)
 * All reverse cleanly when scrolling back up.
 *
 * Performance: nothing is split or measured up front. Each element is "armed" (split + trigger)
 * in idle time once it comes within about a screen of the viewport (see arm.ts), so page load
 * stays light even on slow phones. Call inside a reduced-motion-gated gsap.matchMedia() context.
 */
const start = 'top 86%'

function arm(el: HTMLElement) {
  switch (el.dataset.reveal) {
    case 'lines':
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'reveal-line',
        // Lines only (words stay whole), so screen readers read the text normally.
        aria: 'none',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.15,
            ease: 'expo.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start, toggleActions: REVERSIBLE },
          }),
      })
      break
    case 'fade':
      gsap.from(el, { y: 28, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start, toggleActions: REVERSIBLE } })
      break
    case 'stagger':
      gsap.from(el.children, {
        y: 22,
        opacity: 0,
        duration: 0.9,
        stagger: Number(el.dataset.revealStep) || 0.07,
        scrollTrigger: { trigger: el, start, toggleActions: REVERSIBLE },
      })
      break
  }
}

export function setupReveals(scope: HTMLElement, context: gsap.Context): () => void {
  const cancels = [...scope.querySelectorAll<HTMLElement>('[data-reveal]')].map((el) =>
    whenNear(el, () => context.add(() => arm(el))),
  )
  return () => cancels.forEach((c) => c())
}
