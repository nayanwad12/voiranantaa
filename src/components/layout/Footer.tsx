import { aboutVoirtales, final, nav } from '../../content/site'
import { Wordmark } from '../ui/Wordmark'
import { PartnerContact } from '../ui/PartnerContact'

export function Footer() {
  return (
    <footer id="footer" className="relative border-t border-hairline pb-[max(2rem,var(--safe-bottom))]">
      <div className="container-x grid-editorial gap-y-10 py-14 md:py-20">
        <div className="col-span-4 md:col-span-5">
          <Wordmark className="text-[1.75rem]" />
          <p className="mt-3 text-body text-muted">{final.initiative}</p>
        </div>
        <nav aria-label="Footer" className="col-span-4 md:col-span-3">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="label tap inline-flex items-center text-paper underline-offset-[6px] hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="col-span-4 flex flex-col items-start gap-6 md:col-span-4">
          <PartnerContact />
          <a href="#top" className="label tap inline-flex items-center gap-3 text-paper underline-offset-[6px] hover:underline">
            Back to top
            <svg aria-hidden="true" viewBox="0 0 10 16" className="h-4 w-2.5">
              <path d="M5 16V2M1 6l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
        </div>
      </div>
      <div className="container-x">
        <p className="label border-t border-hairline pt-6 text-muted">{aboutVoirtales.signature}</p>
      </div>
    </footer>
  )
}
