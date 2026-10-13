import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { F, live } from '../state'

/** 06 — An empty plinth, a spotlight cone falling on it, and a pool of light on the floor. */
export function Plinth() {
  const TOP = -1.3
  const H = 4.8
  const parts = useMemo(() => {
    const plinthMat = new THREE.MeshStandardMaterial({ color: '#1c1c1b', roughness: 0.85, transparent: true })
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.55, 48), plinthMat)
    plinth.position.y = TOP - 0.275

    const coneMat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 }, uColor: { value: new THREE.Color('#F2EEE6') } },
      vertexShader: `varying float vH; varying vec3 vN; varying vec3 vV;
        void main(){ vH = position.y / ${H.toFixed(1)} + 0.5; vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uOpacity; uniform vec3 uColor; varying float vH; varying vec3 vN; varying vec3 vV;
        void main(){ float facing = pow(abs(dot(vN, vV)), 2.0); float a = uOpacity * facing * (0.18 + 0.82 * smoothstep(0.0, 1.0, vH)) * 0.16;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.25, H, 48, 1, true), coneMat)
    cone.position.y = TOP + H / 2

    const poolMat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform float uOpacity; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0;
        gl_FragColor = vec4(vec3(0.95,0.93,0.9), uOpacity * 0.35 * pow(1.0 - smoothstep(0.0, 1.0, d), 2.0));
        #include <colorspace_fragment>
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), poolMat)
    pool.rotation.x = -Math.PI / 2
    pool.position.y = TOP - 0.56

    const spot = new THREE.SpotLight('#fff6e8', 0, 12, 0.42, 0.7, 0)
    spot.position.set(0, TOP + H, 0.4)
    spot.target.position.set(0, TOP, 0)

    const group = new THREE.Group()
    group.add(plinth, cone, pool, spot, spot.target)
    return { group, plinthMat, coneMat, poolMat, spot }
  }, [H, TOP])

  useEffect(
    () => () =>
      parts.group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          ;(o.material as THREE.Material).dispose()
        }
      }),
    [parts],
  )

  useFrame(() => {
    const k = live.cur.s[F.plinth]
    parts.group.visible = k > 0.002
    if (!parts.group.visible) return
    parts.plinthMat.opacity = Math.min(1, k * 1.5)
    parts.coneMat.uniforms.uOpacity.value = k
    parts.poolMat.uniforms.uOpacity.value = k
    parts.spot.intensity = k * 8
    const s = live.ctx.wide ? 1 : 0.62
    parts.group.scale.setScalar(s)
    parts.group.position.y = live.ctx.wide ? 0 : -0.9
  })

  return <primitive object={parts.group} />
}
