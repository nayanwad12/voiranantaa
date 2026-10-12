import { useState } from 'react'
import { nav } from '../../content/site'
import { RegisterButton } from '../ui/RegisterButton'
import { Wordmark } from '../ui/Wordmark'
import { MobileMenu } from './MobileMenu'

/** Sticky header: wordmark left, Register Now always visible right, links on desktop, menu on mobile. */
export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-ink/80 pt-[var(--safe-top)] backdrop-blur-md">
        <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-3">
          <a href="#top" className="tap -ml-1 inline-flex items-center px-1" aria-label="VOIR ANANTA — back to top">
            <Wordmark className="text-[1.125rem] sm:text-[1.375rem]" />
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="tap inline-flex items-center px-3 text-label uppercase tracking-[0.2em] text-paper/75 transition-colors hover:text-paper"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
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
