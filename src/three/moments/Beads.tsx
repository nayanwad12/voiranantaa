import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { journey } from '../../content/site'
import { F, live } from '../state'
import { helixX } from '../particles/shapes'

/**
 * 10 — The journey. Each date is a bead of light on the helix that switches on as the camera
 * descends past it. The show date (tentative) is drawn as an open ring.
 */
export function Beads() {
  const dpr = useThree((s) => s.viewport.dpr)
  const { geometry, material } = useMemo(() => {
    const n = journey.steps.length
    const y = new Float32Array(n)
    const tent = new Float32Array(n)
    journey.steps.forEach((s, i) => {
      y[i] = 4.5 - (9 * i) / (n - 1)
      tent[i] = 'tentative' in s && s.tentative ? 1 : 0
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    geometry.setAttribute('aY', new THREE.BufferAttribute(y, 1))
    geometry.setAttribute('aTent', new THREE.BufferAttribute(tent, 1))
    const material = new THREE.ShaderMaterial({
      uniforms: { uX: { value: 3 }, uCamY: { value: 0 }, uBeads: { value: 0 }, uPR: { value: 1 }, uColor: { value: new THREE.Color('#FFFFFF') } },
      vertexShader: /* glsl */ `
        attribute float aY; attribute float aTent;
        uniform float uX; uniform float uCamY; uniform float uBeads; uniform float uPR;
        varying float vAlpha; varying float vRing;
        void main() {
          vec4 mv = modelViewMatrix * vec4(uX, aY, -0.5, 1.0);
          gl_Position = projectionMatrix * mv;
          float lit = 1.0 - smoothstep(aY - 0.2, aY + 1.4, uCamY);
          float near = 1.0 - smoothstep(0.0, 1.8, abs(aY - uCamY));
          vAlpha = uBeads * (0.25 + 0.75 * lit + 0.4 * near);
          vRing = aTent;
          gl_PointSize = (30.0 + 18.0 * near) * uPR * (8.0 / max(1.0, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vAlpha; varying float vRing;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float core = smoothstep(0.3, 0.0, d);
          float halo = pow(1.0 - smoothstep(0.0, 1.0, d), 3.0) * 0.7;
          float ring = smoothstep(0.07, 0.0, abs(d - 0.32));
          gl_FragColor = vec4(uColor * mix(core + halo, ring + halo * 0.6, vRing) * vAlpha, 1.0);
          #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry, material }
  }, [])
  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material])
  useFrame(() => {
    const s = live.cur.s
    const u = material.uniforms
    u.uBeads.value = s[F.beads]
    u.uCamY.value = s[F.camY]
    u.uX.value = helixX(live.ctx.wide)
    u.uPR.value = dpr
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}
