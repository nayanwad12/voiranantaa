/**
 * The thread's vocabulary. Every shape maps a position along the thread (t ∈ [0,1]) to a point,
 * so any two shapes can be blended point-by-point and the thread morphs smoothly between them.
 * All shapes are procedural — no models, no textures.
 */
export type ShapeCtx = { wide: boolean; fit: number }
export type ShapeFn = (t: number, time: number, ctx: ShapeCtx, out: Float32Array, o: number) => void

const TAU = Math.PI * 2
const tri = (x: number) => 2 * Math.abs(2 * (x - Math.floor(x + 0.5))) - 1
/** The rasa journey runs into depth, away from the camera. */
const DEPTH = 28
const along = (t: number) => 4.6 - t * DEPTH

const set = (out: Float32Array, o: number, x: number, y: number, z: number) => {
  out[o] = x
  out[o + 1] = y
  out[o + 2] = z
}

export const SHAPES = {
  /** ∞ — a breathing lemniscate. Hero and finale. */
  infinity: (t, time, { fit }, out, o) => {
    const th = t * TAU
    const s = Math.sin(th)
    const d = 1 + s * s
    const a = 2.45 * fit * (1 + 0.025 * Math.sin(time * 0.9))
    const x = (a * Math.cos(th)) / d
    const y = (a * s * Math.cos(th)) / d
    const phi = 0.28 * Math.sin(time * 0.21)
    set(out, o, x * Math.cos(phi), y, 0.35 * Math.sin(th * 2 + time * 0.3) + x * Math.sin(phi))
  },
  /** The loop unravelled into a single drifting line. */
  line: (t, time, { fit }, out, o) => {
    set(
      out,
      o,
      (t - 0.5) * 15 * Math.max(fit, 0.7),
      0.35 * Math.sin(t * 7 + time * 0.5) * (0.6 + 0.4 * Math.sin(t * 3)),
      0.5 * Math.sin(t * 5 - time * 0.3),
    )
  },
  /** A near-straight path into depth — the way into the nine rasas. */
  depth: (t, time, _c, out, o) => {
    set(out, o, 0.12 * Math.sin(t * 9 + time * 0.3), -0.2 + 0.08 * Math.sin(t * 13 + time * 0.4), along(t))
  },

  // ---- the nine rasas (all run into depth; they differ in how the thread behaves) ----
  /** Beauty / Love — soft, flowing, intertwined curves. */
  shringara: (t, time, _c, out, o) => {
    const u = t * DEPTH
    set(out, o, 1.1 * Math.cos(u * 0.45 + time * 0.6), 0.7 * Math.sin(u * 0.9 + time * 0.5), along(t))
  },
  /** Joy — light, bouncing, playful rhythm. */
  hasya: (t, time, _c, out, o) => {
    const u = t * DEPTH
    set(out, o, 0.5 * Math.sin(u * 0.25 + time * 0.4), -0.9 + 1.6 * Math.abs(Math.sin(u * 0.55 - time * 2.4)), along(t))
  },
  /** Compassion / Sorrow — slow, drooping, heavy. */
  karuna: (t, time, _c, out, o) => {
    const u = t * DEPTH
    const sag = 0.5 + 0.5 * Math.sin(u * 0.2 - time * 0.18)
    set(out, o, 0.4 * Math.sin(u * 0.12 + time * 0.15), -0.45 - 1.0 * sag * sag, along(t))
  },
  /** Intensity / Anger — sharp, jagged, fast. */
  raudra: (t, time, _c, out, o) => {
    const u = t * DEPTH
    set(out, o, 0.95 * tri(u * 0.35 + time * 1.6), 0.7 * tri(u * 0.6 - time * 2.3 + 0.25), along(t))
  },
  /** Courage — strong, rising upward. */
  veera: (t, time, _c, out, o) => {
    const u = t * DEPTH
    const a = u * 0.5 + time * 1.2
    set(out, o, 0.5 * Math.cos(a), -1.3 + t * 3.4 + 0.5 * Math.sin(a) + 0.25 * Math.sin(time * 0.8), along(t))
  },
  /** Fear — trembling, flickering. */
  bhayanaka: (t, time, _c, out, o) => {
    const u = t * DEPTH
    set(
      out,
      o,
      0.25 * Math.sin(u * 0.3 + time * 0.5) + 0.07 * Math.sin(u * 7.1 + time * 31),
      0.07 * Math.sin(u * 6.3 - time * 27) + 0.05 * Math.sin(u * 11 + time * 43),
      along(t),
    )
  },
  /** Disquiet — tangled, knotted. */
  bibhatsa: (t, time, _c, out, o) => {
    const u = t * DEPTH
    set(
      out,
      o,
      0.8 * Math.sin(u * 0.9) + 0.45 * Math.sin(u * 2.3 + time * 0.9),
      0.7 * Math.cos(u * 1.1) + 0.45 * Math.sin(u * 1.9 - time * 0.7),
      along(t),
    )
  },
  /** Wonder — bursting outward, an expanding spiral. */
  adbhuta: (t, time, _c, out, o) => {
    const u = t * DEPTH
    const r = (0.1 + 2.6 * Math.pow(1 - t, 1.6)) * (1 + 0.15 * Math.sin(time * 1.5))
    const a = u * 0.55 + time * 0.6
    set(out, o, r * Math.cos(a), 0.8 * r * Math.sin(a), along(t))
  },
  /** Peace — still, nearly straight, near silence. */
  shanta: (t, time, _c, out, o) => {
    const u = t * DEPTH
    set(out, o, 0.03 * Math.sin(u * 0.2 + time * 0.15), 0.02 * Math.sin(u * 0.15 + time * 0.1), along(t))
  },

  // ---- material, stage, timeline ----
  /** RAGA / FORM — the thread twists into sculptural geometry (a 2,3 torus knot). */
  knot: (t, time, { wide }, out, o) => {
    const p = t * TAU
    const r = 2 + Math.cos(3 * p)
    let x = r * Math.cos(2 * p) * 0.55
    let y = r * Math.sin(2 * p) * 0.55
    let z = -Math.sin(3 * p) * 0.55
    const ry = time * 0.25
    const c = Math.cos(ry)
    const s = Math.sin(ry)
    ;[x, z] = [x * c + z * s, -x * s + z * c]
    const cx = 0.45
    ;[y, z] = [y * Math.cos(cx) - z * Math.sin(cx), y * Math.sin(cx) + z * Math.cos(cx)]
    const k = wide ? 1 : 0.62
    set(out, o, x * k + (wide ? -2.7 : 0), y * k + (wide ? -0.1 : 0.6), z * k)
  },
  /** RAGA / VOICE — the thread becomes a voice / sound waveform. */
  wave: (t, time, { wide }, out, o) => {
    const env = Math.sin(t * Math.PI)
    const amp = 0.95 * env * (0.35 + 0.65 * Math.abs(Math.sin(t * 7.3 + time * 0.9)))
    set(out, o, (t - 0.5) * (wide ? 5.4 : 2.9) + (wide ? 2.7 : 0), amp * Math.sin(t * 52 - time * 4.2) + (wide ? 0 : -0.4), 0)
  },
  /** A low, quiet line — for the calm sections. */
  calm: (t, time, { fit }, out, o) => {
    set(out, o, (t - 0.5) * 16 * Math.max(fit, 0.7), -1.7 + 0.08 * Math.sin(t * 4 + time * 0.3), -1 + 0.3 * Math.sin(t * 3 + time * 0.2))
  },
  /** A halo above the plinth. */
  halo: (t, time, { wide }, out, o) => {
    const p = t * TAU
    const r = wide ? 1.35 : 0.84
    set(out, o, r * Math.cos(p), (wide ? -0.35 : -1.5) + 0.06 * Math.sin(p * 3 + time), r * Math.sin(p))
  },
  /** A distant horizon. */
  horizon: (t, time, _c, out, o) => {
    set(out, o, (t - 0.5) * 24, -2.55 + 0.04 * Math.sin(t * 9 + time * 0.5), -3)
  },
  /** A faint ring behind the six lenses. */
  ring: (t, time, { wide }, out, o) => {
    const p = t * TAU + time * 0.05
    const R = wide ? 2.7 : 1.45
    set(out, o, R * Math.cos(p), R * Math.sin(p) * (wide ? 0.82 : 1), -1.5 + 0.1 * Math.sin(p * 5 + time))
  },
  /** The timeline: the thread turns vertical. */
  vertical: (t, time, { wide }, out, o) => {
    set(out, o, (wide ? 3.3 : 1.2) + 0.05 * Math.sin(t * 9 + time * 0.6), 7 - t * 14, -0.5 + 0.08 * Math.sin(t * 12 + time * 0.4))
  },
  /** A gentle weave. */
  weave: (t, time, { fit }, out, o) => {
    set(
      out,
      o,
      (t - 0.5) * 16 * Math.max(fit, 0.7),
      0.55 * Math.sin(t * 9 + time * 0.6) * Math.cos(t * 3.1 - time * 0.25),
      0.7 * Math.cos(t * 6 + time * 0.4),
    )
  },
} satisfies Record<string, ShapeFn>

export type ShapeName = keyof typeof SHAPES
export const SHAPE_NAMES = Object.keys(SHAPES) as ShapeName[]
export const SHAPE_FNS = SHAPE_NAMES.map((n) => SHAPES[n] as ShapeFn)
/** Closed shapes don't fade at their ends. */
export const CLOSED: ShapeName[] = ['infinity', 'knot', 'halo', 'ring']
/** Where the vertical timeline thread sits (used by the timeline beads). */
export const verticalX = (wide: boolean) => (wide ? 3.3 : 1.2)
