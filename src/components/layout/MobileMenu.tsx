import { useEffect, useRef, useState } from 'react'
import { nav } from '../../content/site'
import { RegisterButton } from '../ui/RegisterButton'
import { Wordmark } from '../ui/Wordmark'
import { gsap, prefersReducedMotion } from '../../motion/gsap'
import { setScrollLocked } from '../../motion/lenis'

type Props = { open: boolean; onClose: () => void }

/**
 * Full-screen menu for phones and tablets. Traps focus, closes on Escape and on link tap.
 * The page unlocks the moment it closes (so a tapped link can start scrolling) while the
 * panel fades out on top.
 */
export function MobileMenu({ open, onClose }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)

  // Lock / unlock the page and manage focus — tied directly to `open`.
  useEffect(() => {
    if (!open) return
    setVisible(true)
    const opener = document.activeElement as HTMLElement | null
    const outside = [document.getElementById('main'), document.querySelector('[data-site-header]'), document.getElementById('footer')]
    outside.forEach((el) => el?.setAttribute('inert', ''))
    document.documentElement.style.overflow = 'hidden'
    setScrollLocked(true)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panel.current) return
      const focusables = panel.current.querySelectorAll<HTMLElement>('a, button')
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      outside.forEach((el) => el?.removeAttribute('inert'))
      document.documentElement.style.overflow = ''
      setScrollLocked(false)
      // Return focus to the menu button unless a link already moved it somewhere meaningful.
      if (panel.current?.contains(document.activeElement) || document.activeElement === document.body) {
        opener?.focus({ preventScroll: true })
      }
    }
  }, [open, onClose])

  // Visual enter / exit.
  useEffect(() => {
    const el = panel.current
    if (!el || !visible) return
    const instant = prefersReducedMotion()
    if (open) {
      closeBtn.current?.focus()
      const tl = gsap.timeline()
      tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: instant ? 0 : 0.45, ease: 'power2.out' })
      if (!instant) {
        tl.from(el.querySelectorAll('[data-menu-item]'), { yPercent: 60, autoAlpha: 0, duration: 0.8, stagger: 0.05, ease: 'expo.out' }, 0.1)
      }
      return () => {
        tl.kill()
      }
    }
    const tween = gsap.to(el, { autoAlpha: 0, duration: instant ? 0 : 0.35, ease: 'power2.in', onComplete: () => setVisible(false) })
    return () => {
      tween.kill()
    }
  }, [open, visible])

  return (
    <div
      id="mobile-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden={!visible}
      className="fixed inset-0 z-[70] flex flex-col bg-ink pt-[var(--safe-top)] pb-[max(1.5rem,var(--safe-bottom))] lg:hidden"
    >
      <div className="container-x flex h-[var(--header-h)] shrink-0 items-center justify-between">
        <Wordmark className="text-[1.125rem] sm:text-[1.375rem]" />
        <button ref={closeBtn} type="button" onClick={onClose} className="tap -mr-2 inline-flex items-center justify-center px-2">
          <span className="sr-only">Close menu</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobile" className="container-x flex flex-1 flex-col justify-center overflow-y-auto py-8">
        <ul className="flex flex-col">
          {nav.map((item, i) => (
            <li key={item.href} data-menu-item className="border-b border-hairline first:border-t">
              <a href={item.href} onClick={onClose} className="flex min-h-[44px] items-baseline justify-between gap-6 py-4 sm:py-5">
                <span className="serif text-[clamp(2.5rem,1.5rem+5vw,4.5rem)] leading-none">{item.label}</span>
                <span className="label text-muted">{String(i + 1).padStart(2, '0')}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div data-menu-item className="container-x shrink-0">
        <RegisterButton size="lg" className="w-full" onClick={onClose} />
      </div>
    </div>
  )
}
