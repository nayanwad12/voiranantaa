import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { F, live } from './state'

/**
 * A living aurora behind everything: slow domain-warped noise in the chapter's three colours.
 * Kept deep and dark (the colours are chosen that way) so white text always stays legible.
 */
export function Background({ octaves }: { octaves: number }) {
  const size = useThree((s) => s.size)
  const { mesh, material } = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      defines: { OCTAVES: octaves },
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uB1: { value: new THREE.Color() },
        uB2: { value: new THREE.Color() },
        uB3: { value: new THREE.Color() },
        uMono: { value: 0 },
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec2 uRes; uniform vec3 uB1; uniform vec3 uB2; uniform vec3 uB3; uniform float uMono;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
        void main() {
          vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
          float t = uTime * 0.035;
          vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 3.1));
          float n = fbm(p * 1.1 + q * 1.7 + vec2(t * 0.6, -t * 0.4));
          vec3 col = mix(uB1, uB2, smoothstep(0.15, 0.85, vUv.y * 0.35 + n * 0.85));
          col = mix(col, uB3, smoothstep(0.5, 0.95, n) * 0.9);
          float vig = smoothstep(1.15, 0.2, length(p * vec2(0.85, 1.1)));
          col *= mix(0.45, 1.0, vig);
          col = mix(col, vec3(dot(col, vec3(0.299, 0.587, 0.114))), uMono);
          col += (hash(vUv * uRes + fract(uTime)) - 0.5) * 0.01; // dither: no banding
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    mesh.frustumCulled = false
    mesh.renderOrder = -10
    return { mesh, material }
  }, [octaves])

  useEffect(() => () => (mesh.geometry.dispose(), material.dispose()), [mesh, material])

  useFrame(() => {
    const s = live.cur.s
    const u = material.uniforms
    u.uTime.value = live.time
    ;(u.uRes.value as THREE.Vector2).set(size.width, size.height)
    ;(u.uB1.value as THREE.Color).setRGB(s[F.b1r], s[F.b1g], s[F.b1b], THREE.SRGBColorSpace)
    ;(u.uB2.value as THREE.Color).setRGB(s[F.b2r], s[F.b2g], s[F.b2b], THREE.SRGBColorSpace)
    ;(u.uB3.value as THREE.Color).setRGB(s[F.b3r], s[F.b3g], s[F.b3b], THREE.SRGBColorSpace)
    u.uMono.value = s[F.mono]
  })

  return <primitive object={mesh} />
}
