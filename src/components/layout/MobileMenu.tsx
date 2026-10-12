import { useEffect, useRef } from 'react'
import { nav } from '../../content/site'
import { RegisterButton } from '../ui/RegisterButton'
import { Wordmark } from '../ui/Wordmark'

type Props = { open: boolean; onClose: () => void }

/** Full-screen menu for phones and tablets. Traps focus, closes on Escape and on link tap. */
export function MobileMenu({ open, onClose }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const outside = [document.getElementById('main'), document.querySelector('body > #root > header'), document.getElementById('footer')]
    outside.forEach((el) => el?.setAttribute('inert', ''))
    document.documentElement.style.overflow = 'hidden'
    closeBtn.current?.focus()

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
      opener?.focus()
    }
  }, [open, onClose])

  return (
    <div
      id="mobile-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden={!open}
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
            <li key={item.href} className="border-b border-hairline first:border-t">
              <a
                href={item.href}
                onClick={onClose}
                className="flex min-h-[44px] items-baseline justify-between gap-6 py-4 sm:py-5"
              >
                <span className="serif text-[clamp(2.5rem,1.5rem+5vw,4.5rem)] leading-none">{item.label}</span>
                <span className="label text-muted">{String(i + 1).padStart(2, '0')}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-x shrink-0">
        <RegisterButton size="lg" className="w-full" onClick={onClose} />
      </div>
    </div>
  )
}
