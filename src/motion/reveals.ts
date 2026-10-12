import { gsap, REVERSIBLE, SplitText } from './gsap'

/**
 * Declarative scroll reveals, driven by data attributes so sections stay free of animation code:
 *   data-reveal="lines"   split into lines; each line rises out of a mask, one after another
 *   data-reveal="fade"    small upward move + fade
 *   data-reveal="stagger" the element's children fade up in sequence (data-reveal-step = gap in s)
 * All reverse cleanly when scrolling back up. Call inside a reduced-motion-gated gsap context.
 */
export function setupReveals(scope: HTMLElement) {
  const start = 'top 86%'

  scope.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'reveal-line',
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
  })

  scope.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 1,
      scrollTrigger: { trigger: el, start, toggleActions: REVERSIBLE },
    })
  })

  scope.querySelectorAll<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
    gsap.from(el.children, {
      y: 22,
      opacity: 0,
      duration: 0.9,
      stagger: Number(el.dataset.revealStep) || 0.07,
      scrollTrigger: { trigger: el, start, toggleActions: REVERSIBLE },
    })
  })
}
