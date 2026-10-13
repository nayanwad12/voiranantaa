import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction, type BloomEffect } from 'postprocessing'
import * as THREE from 'three'
import { F, live } from './state'

/**
 * The finish: bloom on every point of light, a whisper of chromatic aberration at the edges,
 * film grain and a vignette. Its own chunk; only the high and medium tiers ever download it.
 */
export default function Effects({ full }: { full: boolean }) {
  const bloom = useRef<BloomEffect>(null)
  const offset = useRef(new THREE.Vector2(0.0007, 0.0005))
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = live.cur.s[F.bloom] * (full ? 1 : 0.85)
    // Fast scrolling pulls the colours apart a little more.
    const k = 0.0006 + live.velocity * 0.0025
    offset.current.set(k, k * 0.7)
  })
  if (!full) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.12} luminanceSmoothing={0.4} intensity={1} radius={0.7} />
      </EffectComposer>
    )
  }
  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.12} luminanceSmoothing={0.4} intensity={1.1} radius={0.75} />
      <ChromaticAberration offset={offset.current} radialModulation modulationOffset={0.25} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.22} />
      <Vignette offset={0.28} darkness={0.62} />
    </EffectComposer>
  )
}
