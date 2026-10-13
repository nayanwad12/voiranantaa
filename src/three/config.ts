import type { Tier } from '../quality/tier'

export type TierConfig = {
  dpr: [number, number]
  /** Particles in the field. */
  particles: number
  /** Post-processing: 'full' = bloom + chromatic aberration + grain + vignette, 'bloom', or none. */
  post: 'full' | 'bloom' | 'none'
  antialias: boolean
  /** Noise octaves in the aurora background. */
  octaves: number
  fragmentDetail: number
}

export const TIER_CONFIG: Record<Exclude<Tier, 'fallback'>, TierConfig> = {
  high: { dpr: [1, 2], particles: 140_000, post: 'full', antialias: false, octaves: 5, fragmentDetail: 1 },
  medium: { dpr: [1, 1.5], particles: 60_000, post: 'bloom', antialias: false, octaves: 4, fragmentDetail: 1 },
  low: { dpr: [1, 1.5], particles: 18_000, post: 'none', antialias: false, octaves: 3, fragmentDetail: 0 },
}
