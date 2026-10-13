import { SHAPE_INDEX, type ShapeName } from './particles/shapes'

/**
 * The whole scene is described by one flat numeric state (camera, palette, background, effects,
 * moments) plus the pair of particle shapes being morphed between. Keyframes are partial states
 * placed along the page; the scroll position picks the two around it and interpolates, so every
 * animation reverses exactly on scroll-up.
 */
export const SCALARS = [
  'camX', 'camY', 'camZ', 'tgtX', 'tgtY', 'tgtZ',
  'ox', 'oy', 'oz', // where the particle sculpture sits
  'c1r', 'c1g', 'c1b', 'c2r', 'c2g', 'c2b', 'c3r', 'c3g', 'c3b', // particle palette (3 stops)
  'b1r', 'b1g', 'b1b', 'b2r', 'b2g', 'b2b', 'b3r', 'b3g', 'b3b', // aurora background (3 stops)
  'size', // particle size
  'glow', // particle brightness
  'turb', // swirling currents
  'speed', // time scale of the shapes' own motion
  'bloom',
  'mono', // 1 = colour drained to black and white (05 — made by human hands)
  'flicker', // Bhayanaka
  'fragments', // 04 — the 100 fragments
  'plinth', // 06 — plinth + spotlight
  'winners', // 08 — the two winners flare
  'beads', // 10 — timeline beads
] as const
export type Scalar = (typeof SCALARS)[number]
export const F = Object.fromEntries(SCALARS.map((k, i) => [k, i])) as Record<Scalar, number>

export type Palette = [string, string, string]
export type Partial3D = Partial<Record<Scalar, number>> & {
  shape?: ShapeName
  colors?: Palette
  bg?: Palette
  cam?: [number, number, number]
  tgt?: [number, number, number]
  at?: [number, number, number]
}

const hex = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

type Full = { s: Float32Array; shape: number }

function base(): Full {
  const f: Full = { s: new Float32Array(SCALARS.length), shape: SHAPE_INDEX.infinity }
  apply(f, {
    cam: [0, 0, 8],
    tgt: [0, 0, 0],
    at: [0, 0, 0],
    colors: ['#FFB347', '#FF3D8B', '#2DE1FC'],
    bg: ['#07040F', '#1A0B2E', '#3A0F4A'],
    size: 1,
    glow: 1,
    turb: 0.08,
    speed: 1,
    bloom: 1.1,
  })
  return f
}

function apply(f: Full, p: Partial3D) {
  const s = f.s
  for (const k of SCALARS) if (p[k] !== undefined) s[F[k]] = p[k]!
  if (p.cam) s.set(p.cam, F.camX)
  if (p.tgt) s.set(p.tgt, F.tgtX)
  if (p.at) s.set(p.at, F.ox)
  if (p.colors) p.colors.forEach((c, i) => s.set(hex(c), F.c1r + i * 3))
  if (p.bg) p.bg.forEach((c, i) => s.set(hex(c), F.b1r + i * 3))
  if (p.shape) f.shape = SHAPE_INDEX[p.shape]
}

/* ------------------------------------------------------------------------ */
/* The scroll track                                                          */
/* ------------------------------------------------------------------------ */

type Stop = { pos: number } & Full
let track: Stop[] = []

export type Measured = { key: string; start: number; end: number }

export function buildTrack(ranges: Measured[], keyframesFor: (key: string) => [number, Partial3D][] | undefined) {
  const raw: { pos: number; p: Partial3D }[] = []
  for (const r of ranges) {
    const kfs = keyframesFor(r.key)
    if (!kfs) continue
    for (const [at, p] of kfs) raw.push({ pos: r.start + at * (r.end - r.start), p })
  }
  raw.sort((a, b) => a.pos - b.pos)
  let prev = base()
  track = raw.map(({ pos, p }) => {
    const f: Full = { s: prev.s.slice(), shape: prev.shape }
    apply(f, p)
    prev = f
    return { pos, ...f }
  })
}

const ease = (x: number) => x * x * (3 - 2 * x)

/** Resolve a scroll position into the live state: scalars, and the shape pair being morphed. */
export function resolve(scroll: number, out: Current) {
  if (!track.length) return
  let a = track[0]
  let b = track[0]
  let f = 0
  if (scroll >= track[track.length - 1].pos) a = b = track[track.length - 1]
  else if (scroll > track[0].pos) {
    let lo = 0
    let hi = track.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (track[mid].pos <= scroll) lo = mid
      else hi = mid
    }
    a = track[lo]
    b = track[hi]
    f = ease((scroll - a.pos) / Math.max(1, b.pos - a.pos))
  }
  for (let i = 0; i < out.s.length; i++) out.s[i] = a.s[i] + (b.s[i] - a.s[i]) * f
  out.a = a.shape
  out.b = b.shape
  out.mix = a.shape === b.shape ? 0 : f
}

export type Current = { s: Float32Array; a: number; b: number; mix: number }

/** Live values shared by every 3D component each frame (written by the Director). */
export const live = {
  cur: { s: base().s, a: SHAPE_INDEX.infinity, b: SHAPE_INDEX.infinity, mix: 0 } as Current,
  /** Eased scroll position the scene follows (smooths native touch scrolling too). */
  smooth: -1,
  /** Scroll speed, 0–1, used to stir the particles. */
  velocity: 0,
  time: 0,
  /** 0 → 1 over the first seconds: the first note blooms into the ∞. */
  intro: 0,
  ctx: { wide: true, fit: 1 },
  mouse: { x: 0, y: 0, z: 0, active: 0 },
}

/** Debug hook (?debug). */
export const debugTrack = () => track.map((t) => ({ pos: Math.round(t.pos), shape: t.shape }))
