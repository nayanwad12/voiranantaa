import { rasas } from '../content/site'
import type { Partial3D } from './state'
import type { ShapeName } from './thread/shapes'

/**
 * The scroll map (brief §2): for each section ([data-scene] key), keyframes at local progress
 * 0→1 measured from when the section's top reaches the viewport centre to when its bottom does
 * (unless the element overrides that with data-scene-start / data-scene-end).
 */
type Ctx = { wide: boolean }
type Keys = [number, Partial3D][]

const PAPER = '#F2EEE6'
const HOME: Partial3D = { cam: [0, 0, 8], tgt: [0, 0, 0] }

export function keyframesFor(key: string, { wide }: Ctx): Keys | undefined {
  // The rasa journey: the camera looks down the thread into depth; on wide screens the
  // camera sits left so the thread passes to the right of the text.
  const rasaCam: Partial3D = wide ? { cam: [-1.7, 0.6, 7], tgt: [-0.7, -0.1, -10] } : { cam: [0, 0.7, 7.5], tgt: [0, 0.2, -10] }

  switch (key) {
    case 'hero':
      return [
        [0.5, { ...HOME, shape: 'infinity', color: PAPER }],
        [1, { shape: 'infinity' }],
      ]
    case 'what-is':
      return [
        [0.2, { shape: 'infinity', cam: [0, 0, 8.6] }],
        [0.6, { shape: 'line', ...HOME }],
        [1, { shape: 'line', glow: 0.02 }],
      ]
    case 'rasa-intro':
      return [
        [0.35, { shape: 'line', color: PAPER }],
        [1, { shape: 'depth', ...rasaCam, glow: 0.03 }],
      ]
    case 'rasa-journey':
      return rasas.flatMap((r, i): Keys => {
        const k: Partial3D = {
          shape: r.key as ShapeName,
          color: r.rim ?? r.color,
          // Coloured light, never a wash: near-white rasas glow less so the black stays black.
          glow: r.rim ? 0.03 : ['hasya', 'shanta', 'karuna'].includes(r.key) ? 0.035 : 0.08,
          flicker: r.key === 'bhayanaka' ? 1 : 0,
          ...rasaCam,
        }
        return [
          [(i + 0.2) / rasas.length, k],
          [(i + 0.8) / rasas.length, k],
        ]
      })
    case 'rasa-statement':
      return [
        [0.25, { shape: 'line', color: PAPER, glow: 0.028, flicker: 0, ...HOME }],
        [0.9, { shape: 'weave' }],
      ]
    case 'categories':
      return [
        [0.1, { shape: 'knot' }],
        [0.45, { shape: 'knot' }],
        [0.72, { shape: 'wave' }],
        [0.95, { shape: 'wave' }],
      ]
    case 'ninety-five':
      return [
        [0.08, { shape: 'wave', thread: 1, particles: 1, fragments: 0 }],
        [0.35, { shape: 'line', thread: 0.06, particles: 0.25, fragments: 1 }],
        [0.95, { fragments: 1 }],
      ]
    case 'human-hands':
      return [
        [0.15, { fragments: 0.6 }],
        [0.4, { shape: 'calm', fragments: 0, thread: 0.3, particles: 0.2, bloom: 0.25, glow: 0.02, speed: 0.3 }],
        [0.95, { shape: 'calm' }],
      ]
    case 'experience':
      return [
        [0.15, { shape: 'calm' }],
        [0.45, { shape: 'halo', thread: 0.9, particles: 0.6, bloom: 0.8, speed: 1, plinth: 1, glow: 0.03, cam: [0, 1.2, 7.4], tgt: [0, -0.9, 0] }],
        [0.95, { shape: 'halo' }],
      ]
    case 'participate':
      return [
        [0.3, { shape: 'horizon', plinth: 0, thread: 0.7, ...HOME }],
        [0.9, { shape: 'horizon' }],
      ]
    case 'selection':
      return [
        [0.15, { shape: 'horizon', thread: 0.4, lights: 0, winners: 0, arc: 0 }],
        [0.45, { lights: 1 }],
        [0.7, { winners: 1 }],
        [0.95, { winners: 1 }],
      ]
    case 'lenses':
      return [
        [0.25, { shape: 'ring', lights: 0, winners: 0, thread: 0.55 }],
        [0.9, { shape: 'ring' }],
      ]
    case 'journey':
      return [
        [0.05, { shape: 'vertical', thread: 0.9, beads: 1, cam: [0, 3.5, 8], tgt: [0, 3.5, 0] }],
        [0.95, { cam: [0, -3.5, 8], tgt: [0, -3.5, 0] }],
      ]
    case 'participation':
      return [
        [0.25, { shape: 'calm', beads: 0, thread: 0.4, particles: 0.4, ...HOME }],
        [0.9, { shape: 'calm' }],
      ]
    case 'develop':
      return [[0.5, { shape: 'calm', thread: 0.35 }]]
    case 'show':
      return [
        [0.2, { shape: 'horizon', thread: 0.6, particles: 0.7, lights: 1, arc: 1, winners: 0 }],
        [0.9, { shape: 'horizon' }],
      ]
    case 'judges':
      return [[0.35, { shape: 'calm', lights: 0, arc: 1, thread: 0.35 }]]
    case 'partnerships':
      return [
        [0.3, { shape: 'weave', thread: 0.8, particles: 0.8 }],
        [0.9, { shape: 'weave' }],
      ]
    case 'voirtales':
      return [[0.45, { shape: 'calm', thread: 0.45 }]]
    case 'final':
      return [
        [0.05, { shape: 'line', thread: 1, particles: 1, glow: 0.028, ...HOME }],
        [0.55, { shape: 'infinity' }],
        [1, { shape: 'infinity' }],
      ]
  }
  return undefined
}
