import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { F, live } from '../state'
import type { TierConfig } from '../config'

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** A fat line whose segment buffer is rewritten in place every frame (no allocations). */
function makeLine(count: number, width: number, additive: boolean) {
  const segments = new Float32Array((count - 1) * 6)
  const colors = new Float32Array((count - 1) * 6).fill(1)
  const geometry = new LineSegmentsGeometry()
  geometry.setPositions(segments)
  geometry.setColors(colors)
  const material = new LineMaterial({
    linewidth: width,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  const line = new LineSegments2(geometry, material)
  line.frustumCulled = false
  return { line, segments, colors, material, geometry }
}

/** The glowing raga thread: a crisp core line, a soft halo line, and particles riding along it. */
export function Thread({ cfg }: { cfg: TierConfig }) {
  const size = useThree((s) => s.size)
  const count = cfg.points

  const core = useMemo(() => makeLine(count, 1.5, true), [count])
  const halo = useMemo(() => makeLine(count, 9, true), [count])

  useEffect(() => {
    core.material.resolution.set(size.width, size.height)
    halo.material.resolution.set(size.width, size.height)
  }, [size, core, halo])

  useEffect(
    () => () => {
      core.geometry.dispose()
      core.material.dispose()
      halo.geometry.dispose()
      halo.material.dispose()
    },
    [core, halo],
  )

  const color = useMemo(() => new THREE.Color(), [])
  const lastClosed = useRef(-1)

  useFrame(() => {
    const { points, state } = live
    if (points.length !== count * 3) return
    for (let j = 0; j < count - 1; j++) {
      const a = j * 3
      const o = j * 6
      core.segments[o] = points[a]
      core.segments[o + 1] = points[a + 1]
      core.segments[o + 2] = points[a + 2]
      core.segments[o + 3] = points[a + 3]
      core.segments[o + 4] = points[a + 4]
      core.segments[o + 5] = points[a + 5]
    }
    halo.segments.set(core.segments)
    ;(core.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true
    ;(halo.geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true

    // Open threads fade out at both ends; closed loops don't.
    if (Math.abs(live.closed - lastClosed.current) > 0.01) {
      lastClosed.current = live.closed
      const open = 1 - live.closed
      for (let j = 0; j < count - 1; j++) {
        const t0 = j / (count - 1)
        const t1 = (j + 1) / (count - 1)
        const f0 = 1 - open + open * smooth(0, 0.12, t0) * smooth(1, 0.88, t0)
        const f1 = 1 - open + open * smooth(0, 0.12, t1) * smooth(1, 0.88, t1)
        const o = j * 6
        core.colors.fill(f0, o, o + 3)
        core.colors.fill(f1, o + 3, o + 6)
      }
      halo.colors.set(core.colors)
      ;(core.geometry.attributes.instanceColorStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true
      ;(halo.geometry.attributes.instanceColorStart as THREE.InterleavedBufferAttribute).data.needsUpdate = true
    }

    color.setRGB(state[F.r], state[F.g], state[F.b], THREE.SRGBColorSpace)
    // Bhayanaka: the thread trembles and flickers.
    const flicker = state[F.flicker]
    const f = flicker > 0.01 ? 1 - flicker * (Math.random() < 0.12 ? 0.75 : Math.random() * 0.2) : 1
    core.material.color.copy(color)
    halo.material.color.copy(color)
    core.material.opacity = state[F.thread] * f
    halo.material.opacity = state[F.thread] * cfg.halo * f
  })

  return (
    <>
      <primitive object={halo.line} />
      <primitive object={core.line} />
      <Particles cfg={cfg} />
      {cfg.stars > 0 && <Stars count={cfg.stars} />}
      <AmbientGlow />
    </>
  )
}

/* ------------------------------------------------------------------------ */

const particleVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (18.0 / max(0.5, -mv.z));
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.7 + aPhase * 6.2831);
  }
`
const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * uOpacity * vTwinkle);
  }
`

/** Dust riding the thread: each particle follows a point along it with its own offset. */
function Particles({ cfg }: { cfg: TierConfig }) {
  const n = cfg.particles
  const dpr = useThree((s) => s.viewport.dpr)
  const { geometry, material, ts, offsets } = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(n * 3)
    const sizes = new Float32Array(n)
    const phases = new Float32Array(n)
    const ts = new Float32Array(n)
    const offsets = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      ts[i] = Math.random()
      phases[i] = Math.random()
      // Most particles hug the thread; a few drift further out.
      const r = Math.random() < 0.85 ? Math.pow(Math.random(), 2) * 0.22 : 0.25 + Math.random() * 0.7
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      offsets[i * 3] = r * Math.sin(ph) * Math.cos(th)
      offsets[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
      offsets[i * 3 + 2] = r * Math.cos(ph)
      sizes[i] = 0.6 + Math.random() * 1.6
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uColor: { value: new THREE.Color() }, uOpacity: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry, material, ts, offsets }
  }, [n])

  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material])

  useFrame((_, delta) => {
    const { points, count, state, time } = live
    if (points.length !== count * 3 || count < 2) return
    const pos = geometry.attributes.position.array as Float32Array
    const drift = Math.min(delta, 0.1) * 0.006 * state[F.speed]
    for (let i = 0; i < n; i++) {
      let t = ts[i] + drift
      if (t > 1) t -= 1
      ts[i] = t
      const x = t * (count - 1)
      const j = Math.min(count - 2, x | 0)
      const f = x - j
      const a = j * 3
      const breathe = 1 + 0.3 * Math.sin(time * 0.8 + i)
      const o = i * 3
      pos[o] = points[a] + (points[a + 3] - points[a]) * f + offsets[o] * breathe
      pos[o + 1] = points[a + 1] + (points[a + 4] - points[a + 1]) * f + offsets[o + 1] * breathe
      pos[o + 2] = points[a + 2] + (points[a + 5] - points[a + 2]) * f + offsets[o + 2] * breathe
    }
    geometry.attributes.position.needsUpdate = true
    material.uniforms.uTime.value = time
    material.uniforms.uPixelRatio.value = dpr
    ;(material.uniforms.uColor.value as THREE.Color).setRGB(state[F.r], state[F.g], state[F.b], THREE.SRGBColorSpace)
    material.uniforms.uOpacity.value = state[F.particles] * Math.min(1, state[F.thread] * 1.5 + 0.1) * 0.9
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}

/** A sparse, static field of distant dust for depth (high / medium tiers). */
function Stars({ count }: { count: number }) {
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 60
      p[i * 3 + 1] = (Math.random() - 0.5) * 36
      p[i * 3 + 2] = -10 - Math.random() * 30
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(p, 3))
    const material = new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, color: '#F2EEE6', transparent: true, opacity: 0.28, depthWrite: false })
    return { geometry, material }
  }, [count])
  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material])
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

/** A very soft light in the current rasa colour, always centred behind the thread. */
function AmbientGlow() {
  const camera = useThree((s) => s.camera)
  const { mesh, material } = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color() }, uAlpha: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv;
        void main(){ vec2 p = (vUv - 0.5) * vec2(1.6, 1.0); float d = length(p); float a = pow(1.0 - smoothstep(0.0, 0.62, d), 2.2);
        gl_FragColor = vec4(uColor, a * uAlpha); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 38), material)
    mesh.frustumCulled = false
    mesh.renderOrder = -1
    return { mesh, material }
  }, [])
  const fwd = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const s = live.state
    camera.getWorldDirection(fwd)
    mesh.position.copy(camera.position).addScaledVector(fwd, 22)
    mesh.quaternion.copy(camera.quaternion)
    ;(material.uniforms.uColor.value as THREE.Color).setRGB(s[F.r], s[F.g], s[F.b], THREE.SRGBColorSpace)
    material.uniforms.uAlpha.value = s[F.glow]
  })
  useEffect(() => () => (mesh.geometry.dispose(), material.dispose()), [mesh, material])
  return <primitive object={mesh} />
}
