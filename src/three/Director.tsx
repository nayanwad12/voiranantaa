import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ScrollTrigger } from '../motion/gsap'
import { keyframesFor } from './choreography'
import { buildTrack, debugTrack, F, live, resolve, SHAPE_OFFSET, type Measured } from './state'
import { CLOSED, SHAPE_FNS, SHAPE_NAMES } from './thread/shapes'

const edge = (spec: string, top: number, bottom: number, vh: number) => {
  const [el, vp] = spec.split(' ')
  const y = el === 'bottom' ? bottom : el === 'center' ? (top + bottom) / 2 : top
  return y - (vp === 'bottom' ? vh : vp === 'center' ? vh / 2 : 0)
}

/** Measure every [data-scene] range in scroll pixels and rebuild the keyframe track. */
function measure() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const aspect = vw / vh
  const wide = vw >= 900 && aspect > 1.05
  live.ctx = { wide, fit: Math.min(1, Math.max(0.55, aspect / 1.2)) }
  const ranges: Measured[] = []
  document.querySelectorAll<HTMLElement>('[data-scene]').forEach((el) => {
    const r = el.getBoundingClientRect()
    const top = r.top + window.scrollY
    const bottom = r.bottom + window.scrollY
    ranges.push({
      key: el.dataset.scene!,
      start: edge(el.dataset.sceneStart ?? 'top center', top, bottom, vh),
      end: edge(el.dataset.sceneEnd ?? 'bottom center', top, bottom, vh),
    })
  })
  buildTrack(ranges, (key) => keyframesFor(key, { wide }))
}

const closedIdx = CLOSED.map((n) => SHAPE_OFFSET + SHAPE_NAMES.indexOf(n))
const active: number[] = []

/**
 * Runs first every frame: resolves the scroll position to a target state, eases the live state
 * toward it, moves the camera and computes the thread's points for everyone else to draw.
 */
export function Director({ count }: { count: number }) {
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    if (new URLSearchParams(location.search).has('debug')) Object.assign(window, { __scene: { live, debugTrack, measure } })
    live.points = new Float32Array(count * 3)
    live.count = count
    live.ready = false
    measure()
    ScrollTrigger.addEventListener('refresh', measure)
    // Sections below can shift after fonts load or the pin is created; re-measure then too.
    const t = setTimeout(measure, 600)
    return () => {
      ScrollTrigger.removeEventListener('refresh', measure)
      clearTimeout(t)
    }
  }, [count])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const { state, target, points, ctx } = live
    resolve(window.scrollY, target)
    if (!live.ready) {
      state.set(target)
      live.ready = true
    }
    const k = 1 - Math.exp(-dt * 4.2)
    for (let i = 0; i < state.length; i++) state[i] += (target[i] - state[i]) * k
    live.time += dt * state[F.speed]

    camera.position.set(state[F.camX], state[F.camY], state[F.camZ])
    camera.lookAt(state[F.tgtX], state[F.tgtY], state[F.tgtZ])

    // Blend every shape that currently has weight.
    active.length = 0
    let total = 0
    for (let s = 0; s < SHAPE_FNS.length; s++) {
      const w = state[SHAPE_OFFSET + s]
      if (w > 0.002) {
        active.push(s)
        total += w
      }
    }
    points.fill(0)
    const tmp = scratch
    for (const s of active) {
      const w = state[SHAPE_OFFSET + s] / total
      const fn = SHAPE_FNS[s]
      for (let j = 0; j < count; j++) {
        fn(j / (count - 1), live.time, ctx, tmp, 0)
        const o = j * 3
        points[o] += tmp[0] * w
        points[o + 1] += tmp[1] * w
        points[o + 2] += tmp[2] * w
      }
    }
    let closed = 0
    for (const i of closedIdx) closed += state[i]
    live.closed = Math.min(1, closed / Math.max(total, 1e-3))
  }, -2)

  return null
}

const scratch = new Float32Array(3)
