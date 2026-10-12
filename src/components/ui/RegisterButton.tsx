import { REGISTER_URL, cta, isRegisterPlaceholder } from '../../content/site'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
  className?: string
  onClick?: () => void
}

const sizes = {
  sm: 'h-11 px-3.5 text-[0.6875rem] tracking-[0.14em] sm:px-5 sm:tracking-[0.2em]',
  md: 'h-12 px-6 text-label',
  lg: 'h-14 px-8 text-[0.8125rem] sm:h-16 sm:px-10',
}

/** The primary call to action. Points at REGISTER_URL (placeholder until provided). */
export function RegisterButton({ size = 'md', variant = 'solid', className = '', onClick }: Props) {
  const external = !isRegisterPlaceholder
  const look =
    variant === 'solid'
      ? 'bg-paper text-ink hover:bg-transparent hover:text-paper'
      : 'bg-transparent text-paper hover:bg-paper hover:text-ink'
  return (
    <a
      href={REGISTER_URL}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      data-placeholder={isRegisterPlaceholder ? 'REGISTER_URL' : undefined}
      className={`group inline-flex shrink-0 items-center justify-center gap-3 border border-paper font-medium uppercase whitespace-nowrap ${size === 'sm' ? '' : 'tracking-[0.2em]'} transition-colors duration-300 ${sizes[size]} ${look} ${className}`}
    >
      <span>{cta.register}</span>
      <svg aria-hidden="true" viewBox="0 0 16 10" className={`h-2.5 w-4 ${size === 'sm' ? 'hidden sm:block' : ''} transition-transform duration-300 group-hover:translate-x-1`}>
        <path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </a>
  )
}
