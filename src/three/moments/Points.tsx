import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FINALISTS, journey } from '../../content/site'
import { F, live } from '../state'
import { verticalX } from '../thread/shapes'

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vRing;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = smoothstep(0.32, 0.0, d);
    float halo = pow(1.0 - smoothstep(0.0, 1.0, d), 3.0) * 0.6;
    float ring = smoothstep(0.08, 0.0, abs(d - 0.3));
    float a = mix(core + halo, ring + halo * 0.6, vRing);
    gl_FragColor = vec4(uColor, a * vAlpha);
  }
`

function useGlowPoints(vertexShader: string, attributes: Record<string, [Float32Array, number]>, uniforms: Record<string, THREE.IUniform>) {
  const r = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    for (const [name, [arr, size]] of Object.entries(attributes)) geometry.setAttribute(name, new THREE.BufferAttribute(arr, size))
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: glowFragment,
      uniforms: { uColor: { value: new THREE.Color('#F2EEE6') }, uPR: { value: 1 }, ...uniforms },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry, material }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => (r.geometry.dispose(), r.material.dispose()), [r])
  return r
}

/**
 * 08 / 13 — 20 points of light: two groups of 10 (RAGA / FORM, RAGA / VOICE), then one in each
 * brightens as the category winner. In 13 they move onto an arc, like footlights on a stage.
 */
export function FinalistLights() {
  const n = FINALISTS.form + FINALISTS.voice
  const dpr = useThree((s) => s.viewport.dpr)
  const attrs = useMemo(() => {
    const wideA = new Float32Array(n * 3)
    const narrowA = new Float32Array(n * 3)
    const wideB = new Float32Array(n * 3)
    const narrowB = new Float32Array(n * 3)
    const idx = new Float32Array(n)
    const win = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const group = i < FINALISTS.form ? 0 : 1
      const k = group ? i - FINALISTS.form : i
      const col = k % 5
      const row = Math.floor(k / 5)
      wideA.set([(group ? 1.5 : -3.7) + col * 0.55, 0.35 - row * 0.6, 0], i * 3)
      narrowA.set([-1.1 + col * 0.55, (group ? -1.1 : 1.2) - row * 0.55, 0], i * 3)
      const a = -1 + (2 * i) / (n - 1)
      wideB.set([5.2 * Math.sin(a), -2.1, 1 - 3.2 * Math.cos(a)], i * 3)
      narrowB.set([1.9 * Math.sin(a), -2.1, 1.5 - 2.4 * Math.cos(a)], i * 3)
      idx[i] = i / n
      win[i] = k === 0 ? 1 : 0
    }
    return { wideA, narrowA, wideB, narrowB, idx, win, pos: new Float32Array(n * 3) }
  }, [n])

  const { geometry, material } = useGlowPoints(
    /* glsl */ `
      attribute vec3 aWideA; attribute vec3 aNarrowA; attribute vec3 aWideB; attribute vec3 aNarrowB;
      attribute float aIdx; attribute float aWin;
      uniform float uLights; uniform float uArc; uniform float uWinners; uniform float uWide; uniform float uPR; uniform float uTime;
      varying float vAlpha; varying float vRing;
      void main() {
        vec3 a = mix(aNarrowA, aWideA, uWide);
        vec3 b = mix(aNarrowB, aWideB, uWide);
        vec3 p = mix(a, b, uArc);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float appear = clamp((uLights * 1.35 - aIdx) * 4.0, 0.0, 1.0);
        float w = aWin * uWinners;
        float base = mix(0.75, 0.4, uWinners * (1.0 - aWin));
        vAlpha = appear * (base + w * 0.9) * (0.92 + 0.08 * sin(uTime * 2.0 + aIdx * 30.0));
        vRing = 0.0;
        gl_PointSize = (14.0 + w * 26.0) * uPR * (8.0 / max(1.0, -mv.z)) * appear;
      }
    `,
    {
      position: [attrs.pos, 3],
      aWideA: [attrs.wideA, 3],
      aNarrowA: [attrs.narrowA, 3],
      aWideB: [attrs.wideB, 3],
      aNarrowB: [attrs.narrowB, 3],
      aIdx: [attrs.idx, 1],
      aWin: [attrs.win, 1],
    },
    { uLights: { value: 0 }, uArc: { value: 0 }, uWinners: { value: 0 }, uWide: { value: 1 }, uTime: { value: 0 } },
  )

  useFrame(() => {
    const s = live.state
    const u = material.uniforms
    u.uLights.value = s[F.lights]
    u.uArc.value = s[F.arc]
    u.uWinners.value = s[F.winners]
    u.uWide.value = live.ctx.wide ? 1 : 0
    u.uTime.value = live.time
    u.uPR.value = dpr
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

/**
 * 10 — The journey. The thread is vertical; each date is a bead of light that switches on as
 * the camera descends past it. The show date (tentative) is drawn as an open ring.
 */
export function TimelineBeads() {
  const steps = journey.steps
  const dpr = useThree((s) => s.viewport.dpr)
  const attrs = useMemo(() => {
    const n = steps.length
    const y = new Float32Array(n)
    const tent = new Float32Array(n)
    steps.forEach((s, i) => {
      y[i] = 4.5 - (9 * i) / (n - 1)
      tent[i] = 'tentative' in s && s.tentative ? 1 : 0
    })
    return { y, tent, pos: new Float32Array(n * 3) }
  }, [steps])

  const { geometry, material } = useGlowPoints(
    /* glsl */ `
      attribute float aY; attribute float aTent;
      uniform float uX; uniform float uCamY; uniform float uBeads; uniform float uPR;
      varying float vAlpha; varying float vRing;
      void main() {
        vec3 p = vec3(uX, aY, -0.5);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float lit = 1.0 - smoothstep(aY - 0.2, aY + 1.4, uCamY);
        float near = 1.0 - smoothstep(0.0, 1.8, abs(aY - uCamY));
        vAlpha = uBeads * (0.22 + 0.6 * lit + 0.35 * near);
        vRing = aTent;
        gl_PointSize = (18.0 + 10.0 * near) * uPR * (8.0 / max(1.0, -mv.z));
      }
    `,
    { position: [attrs.pos, 3], aY: [attrs.y, 1], aTent: [attrs.tent, 1] },
    { uX: { value: 3 }, uCamY: { value: 0 }, uBeads: { value: 0 } },
  )

  useFrame(() => {
    const s = live.state
    const u = material.uniforms
    u.uBeads.value = s[F.beads]
    u.uCamY.value = s[F.camY]
    u.uX.value = verticalX(live.ctx.wide)
    u.uPR.value = dpr
  })
  return <points geometry={geometry} material={material} frustumCulled={false} visible />
}
