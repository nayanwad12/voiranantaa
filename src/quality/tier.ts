import { useSyncExternalStore } from 'react'

/**
 * 3D quality tiers (brief §6):
 *   high     desktop with a capable GPU — full thread, particles, bloom, dpr ≤ 2
 *   medium   tablets, integrated graphics — fewer particles, no bloom, dpr ≤ 1.5
 *   low      phones — simplified thread, no post-processing, dpr ≤ 1.5
 *   fallback no WebGL, reduced motion, software rendering, very weak device — no canvas at all
 * `?tier=high|medium|low|fallback` overrides detection (handy for testing).
 */
export type Tier = 'high' | 'medium' | 'low' | 'fallback'
export const TIERS: Tier[] = ['high', 'medium', 'low', 'fallback']

function gpuName(): string | null {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return null
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return name || 'unknown'
  } catch {
    return null
  }
}

export function detectTier(): Tier {
  const forced = new URLSearchParams(location.search).get('tier') as Tier | null
  if (forced && TIERS.includes(forced)) return forced

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'fallback'
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return 'fallback'
  if ((nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2) return 'fallback'

  const gpu = gpuName()
  if (!gpu) return 'fallback'
  if (/swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(gpu)) return 'fallback'

  const coarse = matchMedia('(pointer: coarse)').matches
  const shortSide = Math.min(screen.width, screen.height)
  if (coarse && shortSide < 600) return 'low'
  if (/mali|adreno|powervr|apple a\d/i.test(gpu)) return 'medium'
  if (coarse) return 'medium'
  if (/intel|iris|uhd graphics|hd graphics/i.test(gpu)) return 'medium'
  if ((nav.hardwareConcurrency ?? 8) <= 4) return 'medium'
  return 'high'
}

/* A tiny store so the frame-rate watchdog can step the tier down at runtime. */
let current: Tier | null = null
const listeners = new Set<() => void>()

function apply(t: Tier) {
  current = t
  document.documentElement.dataset.tier = t
  listeners.forEach((l) => l())
}

export function getTier(): Tier {
  if (current === null) apply(detectTier())
  return current!
}

/** Step down one tier (high → medium → low → fallback). */
export function dropTier() {
  const i = TIERS.indexOf(getTier())
  if (i < TIERS.length - 1) apply(TIERS[i + 1])
}

export function useTier(): Tier {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    getTier,
    () => 'fallback',
  )
}
