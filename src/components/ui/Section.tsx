import type { ReactNode } from 'react'

type Props = {
  id?: string
  /** Key the 3D scene uses to know where the visitor is (wired up in phase 3). */
  scene: string
  labelledBy: string
  className?: string
  children: ReactNode
}

export function Section({ id, scene, labelledBy, className = '', children }: Props) {
  return (
    <section id={id} data-scene={scene} aria-labelledby={labelledBy} className={`relative ${className}`}>
      {children}
    </section>
  )
}
