import { SHAPE_NAMES, type ShapeName } from './thread/shapes'

/**
 * The whole scene is described by one flat numeric state: camera, colour, intensities,
 * which "moments" are visible, and a weight per thread shape. Keyframes are partial states;
 * scrolling interpolates between them, so every animation reverses exactly on scroll-up.
 */
export const SCALARS = [
  'camX', 'camY', 'camZ', 'tgtX', 'tgtY', 'tgtZ',
  'r', 'g', 'b', // thread / light colour (sRGB 0–1)
  'glow', // ambient glow behind the thread (kept low so text contrast holds)
  'thread', // thread opacity
  'particles', // particle opacity
  'bloom', // bloom strength (high tier)
  'speed', // time scale of the thread's own motion
  'flicker', // Bhayanaka's flicker
  'fragments', // 04: the 100 fragments
  'plinth', // 06: plinth + spotlight
  'lights', // 08/13: the 20 points of light
  'arc', // 13: lights arranged as a stage arc instead of two groups
  'winners', // 08: the two category winners brighten
  'beads', // 10: timeline beads
] as const
export type Scalar = (typeof SCALARS)[number]

export const F = Object.fromEntries(SCALARS.map((k, i) => [k, i])) as Record<Scalar, number>
export const SHAPE_OFFSET = SCALARS.length
export const STATE_LEN = SCALARS.length + SHAPE_NAMES.length
export const shapeIndex = (n: ShapeName) => SHAPE_OFFSET + SHAPE_NAMES.indexOf(n)

export type Partial3D = Partial<Record<Scalar, number>> & {
  shape?: ShapeName
  color?: string
  cam?: [number, number, number]
  tgt?: [number, number, number]
}

const hex = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function defaultState(): Float32Array {
  const s = new Float32Array(STATE_LEN)
  apply(s, {
    cam: [0, 0, 8],
    tgt: [0, 0, 0],
    color: '#F2EEE6',
    glow: 0.028,
    thread: 1,
    particles: 1,
    bloom: 0.7,
    speed: 1,
    shape: 'infinity',
  })
  return s
}

/** Write a partial keyframe onto a full state (carry-forward semantics). */
export function apply(s: Float32Array, p: Partial3D) {
  for (const k of SCALARS) if (p[k] !== undefined) s[F[k]] = p[k]!
  if (p.cam) [s[F.camX], s[F.camY], s[F.camZ]] = p.cam
  if (p.tgt) [s[F.tgtX], s[F.tgtY], s[F.tgtZ]] = p.tgt
  if (p.color) [s[F.r], s[F.g], s[F.b]] = hex(p.color)
  if (p.shape) {
    s.fill(0, SHAPE_OFFSET)
    s[shapeIndex(p.shape)] = 1
  }
}

/* ------------------------------------------------------------------------ */
/* The scroll track                                                          */
/* ------------------------------------------------------------------------ */

type Stop = { pos: number; state: Float32Array }
let track: Stop[] = []

export type Measured = { key: string; start: number; end: number }

/** Build the sorted list of keyframes in document scroll positions. */
export function buildTrack(ranges: Measured[], keyframesFor: (key: string) => [number, Partial3D][] | undefined) {
  const raw: { pos: number; p: Partial3D }[] = []
  for (const r of ranges) {
    const kfs = keyframesFor(r.key)
    if (!kfs) continue
    for (const [at, p] of kfs) raw.push({ pos: r.start + at * (r.end - r.start), p })
  }
  raw.sort((a, b) => a.pos - b.pos)
  let prev = defaultState()
  track = raw.map(({ pos, p }) => {
    const s = prev.slice()
    apply(s, p)
    prev = s
    return { pos, state: s }
  })
}

const ease = (x: number) => x * x * (3 - 2 * x)

/** The target state for a scroll position. */
export function resolve(scroll: number, out: Float32Array) {
  if (!track.length) return
  if (scroll <= track[0].pos) return out.set(track[0].state)
  const last = track[track.length - 1]
  if (scroll >= last.pos) return out.set(last.state)
  let lo = 0
  let hi = track.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (track[mid].pos <= scroll) lo = mid
    else hi = mid
  }
  const a = track[lo]
  const b = track[hi]
  const f = ease((scroll - a.pos) / Math.max(1, b.pos - a.pos))
  for (let i = 0; i < STATE_LEN; i++) out[i] = a.state[i] + (b.state[i] - a.state[i]) * f
}

/* ------------------------------------------------------------------------ */
/* Live values shared by every 3D component each frame                       */
/* ------------------------------------------------------------------------ */

/** Debug hook (?debug): inspect the track and live state from the console. */
export const debugTrack = () => track.map((s) => ({ pos: Math.round(s.pos), fragments: s.state[F.fragments], plinth: s.state[F.plinth], lights: s.state[F.lights] }))

export const live = {
  state: defaultState(),
  target: defaultState(),
  time: 0,
  ctx: { wide: true, fit: 1 },
  /** Current thread points (xyz × count), written by the Director. */
  points: new Float32Array(0),
  count: 0,
  /** 0 = open thread (ends fade), 1 = closed loop. */
  closed: 1,
  ready: false,
}
