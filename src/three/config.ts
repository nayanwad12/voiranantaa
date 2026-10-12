import type { Tier } from '../quality/tier'

export type TierConfig = {
  dpr: [number, number]
  points: number
  particles: number
  stars: number
  bloom: boolean
  antialias: boolean
  /** Opacity of the wide soft line that fakes a glow where there is no bloom. */
  halo: number
  fragmentDetail: number
}

export const TIER_CONFIG: Record<Exclude<Tier, 'fallback'>, TierConfig> = {
  high: { dpr: [1, 2], points: 600, particles: 4000, stars: 320, bloom: true, antialias: true, halo: 0.07, fragmentDetail: 1 },
  medium: { dpr: [1, 1.5], points: 400, particles: 1500, stars: 160, bloom: false, antialias: true, halo: 0.12, fragmentDetail: 1 },
  low: { dpr: [1, 1.5], points: 180, particles: 400, stars: 0, bloom: false, antialias: false, halo: 0.12, fragmentDetail: 0 },
}
