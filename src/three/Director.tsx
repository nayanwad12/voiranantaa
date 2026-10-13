import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ScrollTrigger } from '../motion/gsap'
import { keyframesFor } from './choreography'
import { buildTrack, debugTrack, F, live, resolve, type Measured } from './state'

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

/**
 * Runs first every frame: eases the scroll position, resolves it into the scene state, plays the
 * opening bloom, moves the camera (with a touch of cursor parallax) and tracks the cursor in 3D.
 */
export function Director() {
  const camera = useThree((s) => s.camera)
  const pointer = useThree((s) => s.pointer)
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), d: new THREE.Vector3(), par: new THREE.Vector2(), mouseK: 0 }), [])
  const fine = useMemo(() => window.matchMedia('(pointer: fine)').matches, [])

  useEffect(() => {
    if (new URLSearchParams(location.search).has('debug'))
      Object.assign(window, {
        __scene: { live, debugTrack, measure, debug: () => ({ a: live.cur.a, b: live.cur.b, mix: live.cur.mix, camZ: live.cur.s[F.camZ] }) },
      })
    live.smooth = -1
    live.intro = 0
    measure()
    ScrollTrigger.addEventListener('refresh', measure)
    const t = setTimeout(measure, 600)
    return () => {
      ScrollTrigger.removeEventListener('refresh', measure)
      clearTimeout(t)
    }
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)
    const target = window.scrollY
    const prev = live.smooth
    live.smooth = prev < 0 ? target : prev + (target - prev) * (1 - Math.exp(-dt * 5.5))
    const speed = prev < 0 ? 0 : Math.abs(live.smooth - prev) / Math.max(dt, 1e-3)
    live.velocity += (Math.min(1, speed / 5000) - live.velocity) * (1 - Math.exp(-dt * 4))
    resolve(live.smooth, live.cur)
    const s = live.cur.s
    live.time += dt * s[F.speed]
    live.intro = Math.min(1, live.intro + dt / 3.6)

    // Camera: keyframed position, plus a gentle parallax that follows the cursor.
    tmp.par.lerp(fine ? pointer : tmp.par.set(0, 0), 1 - Math.exp(-dt * 2.5))
    camera.position.set(s[F.camX] + tmp.par.x * 0.35, s[F.camY] + tmp.par.y * 0.22, s[F.camZ])
    camera.lookAt(s[F.tgtX], s[F.tgtY], s[F.tgtZ])

    // The cursor in world space (on the plane of the sculpture), so particles can part around it.
    if (fine) {
      tmp.v.set(pointer.x, pointer.y, 0.5).unproject(camera)
      tmp.d.copy(tmp.v).sub(camera.position).normalize()
      const k = (s[F.oz] - camera.position.z) / (tmp.d.z || -1)
      const hit = tmp.v.copy(camera.position).addScaledVector(tmp.d, k)
      live.mouse.x = hit.x
      live.mouse.y = hit.y
      live.mouse.z = hit.z
      tmp.mouseK += ((s[F.mono] > 0.5 ? 0 : 1) - tmp.mouseK) * (1 - Math.exp(-dt * 3))
      live.mouse.active = tmp.mouseK
    }
  }, -2)

  return null
}
