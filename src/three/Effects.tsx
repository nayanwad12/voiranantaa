import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import type { BloomEffect } from 'postprocessing'
import { F, live } from './state'

/** Bloom on the thread — high tier only, and its own chunk so other tiers never download it. */
export default function Effects() {
  const bloom = useRef<BloomEffect>(null)
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = live.state[F.bloom]
  })
  return (
    <EffectComposer multisampling={4}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.28} luminanceSmoothing={0.3} intensity={0.7} radius={0.55} />
    </EffectComposer>
  )
}
