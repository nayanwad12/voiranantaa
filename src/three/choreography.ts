import { rasas } from '../content/site'
import type { Palette, Partial3D } from './state'
import { RASA_SHAPE } from './particles/shapes'

/**
 * The scroll story. For each section ([data-scene] key): keyframes at local progress 0→1, measured
 * from when the section's top reaches the viewport centre to when its bottom does (unless the
 * element overrides it with data-scene-start / data-scene-end). A keyframe changes only what it names.
 *
 *   Prologue   a single note of light blooms into the ∞ — the raga with no end
 *   Act I      the ∞ tears apart and re-weaves itself as a gown: wearable art
 *   Act II     nine emotional worlds, each with its own colour and living form
 *   Act III    FORM (iridescent sculpture) and VOICE (sound waves)
 *   Act IV     the 95 / 5 rule: matter — 100 fragments
 *   Act V      the human hand: the colour drains away, one quiet line
 *   Act VI     the stage: the gown returns under a spotlight
 *   Act VII    a river of every discipline → 20 stars, 2 flare → six lenses orbit
 *   Act VIII   the journey: a double helix of light the camera descends
 *   Coda       footlights, a woven fabric, and the return to ∞
 */
type Ctx = { wide: boolean }
type Keys = [number, Partial3D][]

const HOME: Partial3D = { cam: [0, 0, 8], tgt: [0, 0, 0], at: [0, 0, 0] }

// Chapter palettes: [particles] and [background]. Backgrounds stay deep so white text reads.
const P = {
  prologue: { colors: ['#FFB347', '#FF3D8B', '#2DE1FC'], bg: ['#07040F', '#1A0B2E', '#3A0F4A'] },
  gown: { colors: ['#FFE9C7', '#FF6FB0', '#8A5CFF'], bg: ['#08050E', '#170A26', '#2C0E3D'] },
  weave: { colors: ['#FFB347', '#FF3D8B', '#7C5CFF'], bg: ['#07040F', '#190A2C', '#331047'] },
  form: { colors: ['#9CFFE9', '#6E7BFF', '#FF63C3'], bg: ['#040714', '#0D1440', '#1F0E3E'] },
  voice: { colors: ['#FFE36E', '#FF7A45', '#FF2E88'], bg: ['#0B0508', '#2A0B1E', '#3E0E2A'] },
  matter: { colors: ['#FFFFFF', '#FFD9A0', '#FF8A3D'], bg: ['#0A0605', '#22120B', '#3A1B10'] },
  hand: { colors: ['#FFFFFF', '#E8E4DC', '#BDB8AE'], bg: ['#070707', '#101010', '#181818'] },
  stage: { colors: ['#FFF1D6', '#FFC56B', '#FF7A45'], bg: ['#070504', '#16100A', '#1F150C'] },
  river: { colors: ['#2DE1FC', '#7C5CFF', '#FF3D8B'], bg: ['#050612', '#0F1836', '#22104A'] },
  stars: { colors: ['#8EC5FF', '#FFE7A8', '#FFFFFF'], bg: ['#02030A', '#071226', '#0E2250'] },
  lenses: { colors: ['#FFD48A', '#FF7AB6', '#6EE7FF'], bg: ['#070512', '#150E32', '#28154D'] },
  helix: { colors: ['#6EE7FF', '#7C5CFF', '#FF4FD8'], bg: ['#030612', '#0A1430', '#190F3C'] },
  calm: { colors: ['#FFE3B3', '#FFB347', '#FF7A45'], bg: ['#0A0705', '#18110B', '#22150D'] },
  footlights: { colors: ['#FFFFFF', '#FFD36B', '#FF3D8B'], bg: ['#0A0410', '#20092B', '#3A0D46'] },
  silver: { colors: ['#FFFFFF', '#D8DCE6', '#9AA3B5'], bg: ['#060609', '#101018', '#181826'] },
} satisfies Record<string, { colors: Palette; bg: Palette }>

// The nine worlds — saturated takes on the traditional Natyashastra colours.
const RASA_WORLD: Record<string, { colors: Palette; bg: Palette; cam: [number, number, number]; tgt: [number, number, number] }> = {
  shringara: { colors: ['#7FFFE4', '#00B3A4', '#FF5FA2'], bg: ['#020F0E', '#052E2A', '#0B4744'], cam: [0, 1.4, 7], tgt: [0, 0, 0] },
  hasya: { colors: ['#FFFFFF', '#FFE8A3', '#FFB8DD'], bg: ['#0C0A0F', '#262030', '#3E3248'], cam: [0, 0, 8.4], tgt: [0, 0.2, 0] },
  karuna: { colors: ['#E3EBF8', '#8FA7C8', '#7C7FB0'], bg: ['#04060C', '#121A2A', '#232F48'], cam: [0, 1.8, 7.4], tgt: [0, -0.3, 0] },
  raudra: { colors: ['#FFD36B', '#FF3B1F', '#C4001F'], bg: ['#0F0202', '#380606', '#660B0B'], cam: [1.6, 0.4, 6.2], tgt: [0, 0, 0] },
  veera: { colors: ['#FFF3B0', '#FFB627', '#FF6A00'], bg: ['#0E0802', '#372004', '#663A07'], cam: [0, -1.6, 7], tgt: [0, 0.6, 0] },
  bhayanaka: { colors: ['#FFFFFF', '#C8CCD6', '#5A5F6B'], bg: ['#000000', '#07080B', '#12141A'], cam: [0, 0, 5.6], tgt: [0, 0, 0] },
  bibhatsa: { colors: ['#C2B3FF', '#4D4DFF', '#2A1AA8'], bg: ['#030318', '#0A0A38', '#181862'], cam: [-1.8, 1, 6.4], tgt: [0, 0, 0] },
  adbhuta: { colors: ['#FFFBD1', '#FFE14D', '#FF4FD8'], bg: ['#0D0A02', '#2A2006', '#47183A'], cam: [0, 4.6, 5.2], tgt: [0, 0, 0] },
  shanta: { colors: ['#FFFFFF', '#E6F4F1', '#9FE6E0'], bg: ['#040A0B', '#0E1D20', '#1B3335'], cam: [0, 0.7, 9], tgt: [0, -0.6, -2] },
}

export function keyframesFor(key: string, { wide }: Ctx): Keys | undefined {
  // On wide screens the sculptures sit to the right of the text column.
  const side: [number, number, number] = wide ? [1.9, 0, 0] : [0, 0.4, 0]

  switch (key) {
    case 'hero':
      return [
        [0.5, { ...HOME, ...P.prologue, shape: 'infinity', turb: 0.06, bloom: 1.3, mono: 0, glow: 1.35, size: 1.15 }],
        [1, { shape: 'infinity' }],
      ]
    case 'what-is':
      return [
        [0.15, { shape: 'infinity', cam: [0, 0, 8.8] }],
        [0.5, { glow: 1, size: 1 }],
        [0.55, { ...P.gown, shape: 'gown', cam: [0, 0.3, 7.6], tgt: [0, -0.1, 0], at: side, turb: 0.05 }],
        [1, { shape: 'gown' }],
      ]
    case 'rasa-intro':
      return [
        [0.3, { shape: 'gown' }],
        [0.95, { ...P.weave, shape: 'dust', at: [0, 0, 0], ...HOME, turb: 0.2 }],
      ]
    case 'rasa-journey':
      return rasas.flatMap((r, i): Keys => {
        const w = RASA_WORLD[r.key]
        const k: Partial3D = {
          shape: RASA_SHAPE[r.key],
          colors: w.colors,
          bg: w.bg,
          cam: w.cam,
          tgt: w.tgt,
          at: side,
          turb: r.key === 'shanta' ? 0.01 : 0.06,
          flicker: r.key === 'bhayanaka' ? 1 : 0,
          bloom: r.key === 'shanta' ? 0.8 : 1.25,
          glow: r.key === 'karuna' ? 1.5 : r.key === 'raudra' ? 1.2 : 1,
        }
        return [
          [(i + 0.22) / rasas.length, k],
          [(i + 0.78) / rasas.length, k],
        ]
      })
    case 'rasa-statement':
      return [
        [0.2, { ...P.weave, shape: 'infinity', ...HOME, flicker: 0, turb: 0.08, bloom: 1.1, glow: 1.2 }],
        [0.95, { shape: 'infinity' }],
      ]
    case 'categories':
      return [
        [0.12, { ...P.form, shape: 'form', glow: 1.4 }],
        [0.6, { glow: 1.1 }],
        [0.45, { shape: 'form' }],
        [0.7, { ...P.voice, shape: 'voice' }],
        [0.95, { shape: 'voice' }],
      ]
    case 'ninety-five':
      return [
        [0.1, { ...P.matter, shape: 'dust', fragments: 0, glow: 0.7, turb: 0.15 }],
        [0.35, { fragments: 1, glow: 0.45 }],
        [0.95, { fragments: 1 }],
      ]
    case 'human-hands':
      return [
        [0.15, { fragments: 0.5 }],
        [0.4, { ...P.hand, shape: 'line', fragments: 0, mono: 1, glow: 0.7, bloom: 0.4, turb: 0.01, speed: 0.4 }],
        [0.95, { shape: 'line' }],
      ]
    case 'experience':
      return [
        [0.12, { shape: 'line' }],
        [0.45, { ...P.stage, shape: 'stageGown', mono: 0, glow: 1, bloom: 1.2, speed: 1, plinth: 1, turb: 0.03, cam: [0, 1.0, 8.2], tgt: [0, -0.4, 0] }],
        [0.95, { shape: 'stageGown' }],
      ]
    case 'participate':
      return [
        [0.3, { ...P.river, shape: 'river', plinth: 0, ...HOME, turb: 0.08 }],
        [0.9, { shape: 'river' }],
      ]
    case 'selection':
      return [
        [0.2, { ...P.stars, shape: 'constellation', winners: 0 }],
        [0.5, { winners: 0 }],
        [0.75, { winners: 1 }],
        [0.95, { winners: 1 }],
      ]
    case 'lenses':
      return [
        [0.25, { ...P.lenses, shape: 'astrolabe', winners: 0 }],
        [0.9, { shape: 'astrolabe' }],
      ]
    case 'journey':
      return [
        [0.05, { ...P.helix, shape: 'helix', beads: 1, cam: [0, 3.5, 8], tgt: [0, 3.5, 0] }],
        [0.95, { cam: [0, -3.5, 8], tgt: [0, -3.5, 0] }],
      ]
    case 'participation':
      return [
        [0.25, { ...P.calm, shape: 'dust', beads: 0, glow: 0.5, ...HOME }],
        [0.9, { shape: 'dust' }],
      ]
    case 'develop':
      return [[0.5, { shape: 'dust', glow: 0.45 }]]
    case 'show':
      return [
        [0.2, { ...P.footlights, shape: 'arc', glow: 1, bloom: 1.3 }],
        [0.9, { shape: 'arc' }],
      ]
    case 'judges':
      return [[0.4, { ...P.silver, shape: 'line', glow: 0.6 }]]
    case 'partnerships':
      return [
        [0.3, { ...P.prologue, shape: 'weave', glow: 0.9 }],
        [0.9, { shape: 'weave' }],
      ]
    case 'voirtales':
      return [[0.45, { ...P.calm, shape: 'dust', glow: 0.5 }]]
    case 'final':
      return [
        [0.05, { ...P.prologue, shape: 'dust', glow: 1, ...HOME }],
        [0.55, { shape: 'infinity', bloom: 1.3 }],
        [1, { shape: 'infinity' }],
      ]
  }
  return undefined
}
