import type { ReactNode, Ref } from 'react'

type Props = {
  id?: string
  /** Key the 3D scene uses to know where the visitor is (wired up in phase 3). */
  scene: string
  labelledBy: string
  className?: string
  ref?: Ref<HTMLElement>
  children: ReactNode
}

export function Section({ id, scene, labelledBy, className = '', ref, children }: Props) {
  return (
    <section ref={ref} id={id} data-scene={scene} aria-labelledby={labelledBy} className={`relative ${className}`}>
      {children}
    </section>
  )
}
