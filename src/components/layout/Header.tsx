import { useState } from 'react'
import { nav } from '../../content/site'
import { RegisterButton } from '../ui/RegisterButton'
import { Wordmark } from '../ui/Wordmark'
import { MobileMenu } from './MobileMenu'
import { ScrollTrigger, useGSAP } from '../../motion/gsap'

/**
 * Sticky header: wordmark left, Register Now always visible right, links on desktop, menu on mobile.
 * It never hides (Register Now must stay one tap away); it only gains a backing once the page scrolls,
 * and marks the nav link for the section in view.
 */
export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  useGSAP(() => {
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => setScrolled(self.scroll() > 24) })
    nav.forEach(({ href }) => {
      const section = document.querySelector(href)
      if (!section) return
      ScrollTrigger.create({
        trigger: section,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => setActive((cur) => (self.isActive ? href : cur === href ? null : cur)),
      })
    })
  })

  return (
    <>
      <header
        data-site-header
        className={`fixed inset-x-0 top-0 z-50 border-b pt-[var(--safe-top)] transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open ? 'border-hairline bg-ink/80 backdrop-blur-md' : 'border-transparent bg-transparent'
        }`}
      >
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-3">
          <a href="#top" className="tap -ml-1 inline-flex items-center px-1" aria-label="VOIR ANANTA — back to top">
            <Wordmark className="text-[1.125rem] sm:text-[1.375rem]" />
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {nav.map((item) => {
                const current = active === item.href
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={current ? 'location' : undefined}
                      className={`tap group relative inline-flex items-center px-3 text-label uppercase tracking-[0.2em] transition-colors hover:text-paper ${
                        current ? 'text-paper' : 'text-paper'
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-3 bottom-2.5 h-px origin-left bg-paper transition-transform duration-500 ${
                          current ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <RegisterButton size="sm" />
            <button
              type="button"
              className="tap -mr-2 inline-flex items-center justify-center gap-2 px-2 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
                <path d="M3 9h18M3 15h18" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
