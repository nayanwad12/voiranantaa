import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FRAGMENTS } from '../../content/site'
import { F, live } from '../state'

/**
 * 04 — The 95 / 5 rule. The thread breaks into exactly FRAGMENTS.unconventional +
 * FRAGMENTS.fabric pieces (95 + 5 = 100, the same constants the page text uses):
 * 95 split across six unconventional materials, 5 soft pieces of fabric.
 */
const MATERIAL_KINDS = ['paper', 'metal', 'wire', 'wood', 'natural', 'recycled'] as const

function splitEvenly(total: number, parts: number) {
  const base = Math.floor(total / parts)
  return Array.from({ length: parts }, (_, i) => base + (i < total % parts ? 1 : 0))
}

function wavedPlane() {
  const g = new THREE.PlaneGeometry(0.62, 0.62, 10, 10)
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    p.setZ(i, 0.07 * Math.sin(x * 9) + 0.05 * Math.cos(y * 7))
  }
  g.computeVertexNormals()
  return g
}

function kindLook(kind: (typeof MATERIAL_KINDS)[number] | 'fabric', detail: number) {
  // Physical materials with a thin-film sheen: each piece catches colour as it turns.
  const mat = (o: THREE.MeshPhysicalMaterialParameters) =>
    new THREE.MeshPhysicalMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      iridescence: 1,
      iridescenceIOR: 1.5,
      iridescenceThicknessRange: [120, 720],
      ...o,
    })
  switch (kind) {
    case 'paper':
      return { geo: new THREE.PlaneGeometry(0.32, 0.44), mat: mat({ color: '#FFF4E0', roughness: 0.7, iridescence: 0.4 }) }
    case 'metal':
      return { geo: new THREE.BoxGeometry(0.24, 0.24, 0.05), mat: mat({ color: '#E6E9F0', metalness: 1, roughness: 0.15 }) }
    case 'wire':
      return { geo: new THREE.TorusGeometry(0.17, 0.014, 6, detail ? 40 : 20), mat: mat({ color: '#FF8A4C', metalness: 1, roughness: 0.25 }) }
    case 'wood':
      return { geo: new THREE.BoxGeometry(0.44, 0.07, 0.08), mat: mat({ color: '#C77A3A', roughness: 0.5, iridescence: 0.5 }) }
    case 'natural':
      return { geo: new THREE.IcosahedronGeometry(0.14, 0), mat: mat({ color: '#2BD67B', roughness: 0.4, flatShading: true }) }
    case 'recycled':
      return { geo: new THREE.TetrahedronGeometry(0.17), mat: mat({ color: '#3A6BFF', metalness: 0.4, roughness: 0.3 }) }
    case 'fabric':
      return {
        geo: wavedPlane(),
        mat: mat({ color: '#FF3D8B', emissive: '#FF3D8B', emissiveIntensity: 0.6, roughness: 0.6, sheen: 1, sheenColor: '#FFB3D1' }),
      }
  }
}

type Piece = { mesh: THREE.InstancedMesh; mat: THREE.MeshPhysicalMaterial; ids: number[] }

export function Fragments({ detail }: { detail: number }) {
  const total = FRAGMENTS.unconventional + FRAGMENTS.fabric

  const { pieces, cloud, spin, axis, along } = useMemo(() => {
    const counts = splitEvenly(FRAGMENTS.unconventional, MATERIAL_KINDS.length)
    const kinds = [...MATERIAL_KINDS.map((k, i) => [k, counts[i]] as const), ['fabric', FRAGMENTS.fabric] as const]
    let next = 0
    const pieces: Piece[] = kinds.map(([kind, n]) => {
      const { geo, mat } = kindLook(kind, detail)
      const mesh = new THREE.InstancedMesh(geo, mat, n)
      mesh.frustumCulled = false
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      const ids = Array.from({ length: n }, () => next++)
      return { mesh, mat, ids }
    })
    if (next !== total) throw new Error(`fragment count ${next} ≠ ${total}`)

    // A seeded cloud so the arrangement is the same on every visit.
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const cloud = new Float32Array(total * 3)
    const spin = new Float32Array(total)
    const axis: THREE.Vector3[] = []
    const along = new Float32Array(total)
    for (let i = 0; i < total; i++) {
      cloud[i * 3] = (rnd() - 0.5) * 9
      cloud[i * 3 + 1] = (rnd() - 0.5) * 4.8
      cloud[i * 3 + 2] = -2.4 + rnd() * 3
      spin[i] = 0.2 + rnd() * 0.6
      axis.push(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize())
      along[i] = (i + 0.5) / total
    }
    return { pieces, cloud, spin, axis, along }
  }, [detail, total])

  useEffect(
    () => () =>
      pieces.forEach((p) => {
        p.mesh.geometry.dispose()
        p.mat.dispose()
        p.mesh.dispose()
      }),
    [pieces],
  )

  const m = useMemo(() => new THREE.Matrix4(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const { cur, time, ctx } = live
    const f = cur.s[F.fragments]
    const visible = f > 0.002
    for (const p of pieces) p.mesh.visible = visible
    if (!visible) return
    const e = f * f * (3 - 2 * f)
    // Portrait phones: a taller, narrower cloud of smaller pieces so the text stays readable.
    const sx = ctx.wide ? 1 : 0.36
    const sy = ctx.wide ? 1 : 1.35
    const size = ctx.wide ? 1 : 0.55
    for (const p of pieces) {
      p.mat.opacity = Math.min(ctx.wide ? 1 : 0.85, f * 1.6)
      p.ids.forEach((id, k) => {
        // From a line of light (the thread breaking apart) out to the floating cloud.
        const fx = (along[id] - 0.5) * 12 * ctx.fit
        const fy = -0.4 + 0.22 * Math.sin(along[id] * 7)
        const fz = 0
        const bob = Math.sin(time * 0.6 + id) * 0.08
        const tx = cloud[id * 3] * sx
        const ty = cloud[id * 3 + 1] * sy + bob
        const tz = cloud[id * 3 + 2]
        v.set(fx + (tx - fx) * e, fy + (ty - fy) * e, fz + (tz - fz) * e)
        q.setFromAxisAngle(axis[id], time * spin[id] + id)
        const s = (0.25 + 0.75 * e) * size
        sc.set(s, s, s)
        m.compose(v, q, sc)
        p.mesh.setMatrixAt(k, m)
      })
      p.mesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      {pieces.map((p, i) => (
        <primitive key={i} object={p.mesh} />
      ))}
    </>
  )
}
