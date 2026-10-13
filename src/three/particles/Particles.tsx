import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { F, live } from '../state'
import { SHAPES_GLSL, SHAPE_INDEX } from './shapes'

const vertex = /* glsl */ `
${SHAPES_GLSL}
uniform int uA;
uniform int uB;
uniform float uMix;
uniform float uTime;
uniform float uIntro;
uniform float uTurb;
uniform float uSize;
uniform float uGlow;
uniform float uPR;
uniform float uMono;
uniform float uFlicker;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uMouse;
uniform float uMouseK;
attribute vec3 aSeed;
attribute float aRand;
varying vec3 vColor;
varying float vAlpha;

// Cheap divergence-free-looking currents: particles swirl in flight between forms.
vec3 currents(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.7 + t * 0.9) + sin(p.z * 1.3 - t * 0.7),
    sin(p.z * 1.9 + t * 0.8) + sin(p.x * 1.1 + t * 0.6),
    sin(p.x * 1.5 - t * 0.75) + sin(p.y * 1.2 + t * 0.5)
  ) * 0.5;
}

void main() {
  vec4 A = shape(uA, aSeed, aRand, uTime);
  // The first note: at load every particle starts in the single point of light, then blooms out.
  if (uIntro < 1.0) {
    vec4 P = sBindu(aSeed, aRand, uTime);
    A = mix(P, A, smoothstep(aRand * 0.55, aRand * 0.55 + 0.45, uIntro));
  }
  vec4 B = uMix > 0.0 ? shape(uB, aSeed, aRand, uTime) : A;

  // Each particle leaves on its own beat, so forms dissolve and re-form in waves.
  float d = aRand * 0.5;
  float m = smoothstep(d, d + 0.5, uMix);
  float flight = sin(m * PI);
  vec3 p = mix(A.xyz, B.xyz, m);
  p += currents(p * 0.9, uTime) * (uTurb + flight * 0.9) * (0.4 + 0.6 * aRand);

  // Particles part around the cursor.
  vec3 world = (modelMatrix * vec4(p, 1.0)).xyz;
  vec2 dm = world.xy - uMouse.xy;
  float dl = length(dm);
  world.xy += normalize(dm + 1e-4) * uMouseK * 0.9 * exp(-dl * dl * 1.6);

  float tone = mix(A.w, B.w, m);
  vec3 col = tone < 0.5 ? mix(uC1, uC2, tone * 2.0) : mix(uC2, uC3, tone * 2.0 - 1.0);
  col = mix(col, vec3(1.0, 0.96, 0.9), flight * 0.35); // a hot glint while in flight
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(lum) * 1.1, uMono);

  // Emphasis: the two winning stars flare.
  float star = (uA == ${SHAPE_INDEX.constellation} || uB == ${SHAPE_INDEX.constellation}) ? A.w * (1.0 - m) * float(uA == ${SHAPE_INDEX.constellation}) + B.w * m * float(uB == ${SHAPE_INDEX.constellation}) : 0.0;
  float flare = 1.0 + star * uWinners * 2.2;

  vec4 mv = viewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = uSize * (0.55 + aRand * 1.1) * (1.0 + flight * 0.7) * flare;
  gl_PointSize = size * uPR * (11.0 / max(0.6, -mv.z));

  float twinkle = 0.6 + 0.4 * sin(uTime * 2.3 + aRand * 60.0);
  float flick = 1.0 - uFlicker * step(0.86, fract(sin(floor(uTime * 14.0) + aRand * 7.0) * 43758.5)) * 0.85;
  vColor = col;
  vAlpha = uGlow * twinkle * flick * (0.55 + 0.45 * aRand) * min(1.0, flare);
}
`

const fragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = pow(max(0.0, 1.0 - d), 2.2);
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
  #include <colorspace_fragment>
}
`

/** The particle field: one draw call, every form computed on the GPU. */
export function Particles({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const { geometry, material, points } = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const seeds = new Float32Array(count * 3)
    const rands = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      seeds[i * 3] = Math.random()
      seeds[i * 3 + 1] = Math.random()
      seeds[i * 3 + 2] = Math.random()
      rands[i] = Math.random()
    }
    // `position` is required by three; the real position is computed in the shader.
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
    geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uA: { value: SHAPE_INDEX.infinity },
        uB: { value: SHAPE_INDEX.infinity },
        uMix: { value: 0 },
        uTime: { value: 0 },
        uIntro: { value: 0 },
        uTurb: { value: 0.1 },
        uSize: { value: 1 },
        uGlow: { value: 1 },
        uPR: { value: 1 },
        uMono: { value: 0 },
        uFlicker: { value: 0 },
        uWinners: { value: 0 },
        uFit: { value: 1 },
        uWide: { value: 1 },
        uC1: { value: new THREE.Color() },
        uC2: { value: new THREE.Color() },
        uC3: { value: new THREE.Color() },
        uMouse: { value: new THREE.Vector3(99, 99, 0) },
        uMouseK: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geometry, material)
    points.frustumCulled = false
    return { geometry, material, points }
  }, [count])

  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material])

  useFrame(() => {
    const { cur, time, intro, ctx, mouse, velocity } = live
    const s = cur.s
    const u = material.uniforms
    u.uA.value = cur.a
    u.uB.value = cur.b
    u.uMix.value = cur.mix
    u.uTime.value = time
    u.uIntro.value = intro
    u.uTurb.value = s[F.turb] + velocity * 0.7
    u.uSize.value = s[F.size]
    u.uGlow.value = s[F.glow]
    u.uPR.value = dpr
    u.uMono.value = s[F.mono]
    u.uFlicker.value = s[F.flicker]
    u.uWinners.value = s[F.winners]
    u.uFit.value = ctx.fit
    u.uWide.value = ctx.wide ? 1 : 0
    ;(u.uC1.value as THREE.Color).setRGB(s[F.c1r], s[F.c1g], s[F.c1b], THREE.SRGBColorSpace)
    ;(u.uC2.value as THREE.Color).setRGB(s[F.c2r], s[F.c2g], s[F.c2b], THREE.SRGBColorSpace)
    ;(u.uC3.value as THREE.Color).setRGB(s[F.c3r], s[F.c3g], s[F.c3b], THREE.SRGBColorSpace)
    ;(u.uMouse.value as THREE.Vector3).set(mouse.x, mouse.y, mouse.z)
    u.uMouseK.value = mouse.active
    points.position.set(s[F.ox], s[F.oy], s[F.oz])
  })

  return <primitive object={points} />
}
