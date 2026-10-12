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
  const std = (o: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial({ transparent: true, side: THREE.DoubleSide, ...o })
  switch (kind) {
    case 'paper':
      return { geo: new THREE.PlaneGeometry(0.32, 0.44), mat: std({ color: '#EDE6D6', roughness: 0.95 }), scale: 1 }
    case 'metal':
      return { geo: new THREE.BoxGeometry(0.24, 0.24, 0.05), mat: std({ color: '#C4C7CC', metalness: 1, roughness: 0.25 }), scale: 1 }
    case 'wire':
      return { geo: new THREE.TorusGeometry(0.17, 0.012, 6, detail ? 40 : 20), mat: std({ color: '#A6A8AB', metalness: 0.9, roughness: 0.3 }), scale: 1 }
    case 'wood':
      return { geo: new THREE.BoxGeometry(0.44, 0.07, 0.08), mat: std({ color: '#8A5A35', roughness: 0.8 }), scale: 1 }
    case 'natural':
      return { geo: new THREE.IcosahedronGeometry(0.14, 0), mat: std({ color: '#6E7A4E', roughness: 0.9, flatShading: true }), scale: 1 }
    case 'recycled':
      return { geo: new THREE.TetrahedronGeometry(0.17), mat: std({ color: '#5F7F8C', roughness: 0.55, metalness: 0.2 }), scale: 1 }
    case 'fabric':
      return {
        geo: wavedPlane(),
        mat: std({ color: '#F2EEE6', emissive: '#F2EEE6', emissiveIntensity: 0.45, roughness: 1 }),
        scale: 1,
      }
  }
}

type Piece = { mesh: THREE.InstancedMesh; mat: THREE.MeshStandardMaterial; ids: number[] }

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
    const { state, points, count, time, ctx } = live
    const f = state[F.fragments]
    const visible = f > 0.002
    for (const p of pieces) p.mesh.visible = visible
    if (!visible || points.length < 6) return
    const e = f * f * (3 - 2 * f)
    // Portrait phones: a taller, narrower cloud of smaller pieces so the text stays readable.
    const sx = ctx.wide ? 1 : 0.36
    const sy = ctx.wide ? 1 : 1.35
    const size = ctx.wide ? 1 : 0.55
    for (const p of pieces) {
      p.mat.opacity = Math.min(ctx.wide ? 1 : 0.8, f * 1.6)
      p.ids.forEach((id, k) => {
        // From a point on the thread (so it reads as the thread breaking apart) out to the cloud.
        const x = along[id] * (count - 1)
        const j = Math.min(count - 2, x | 0)
        const fr = x - j
        const a = j * 3
        const fx = points[a] + (points[a + 3] - points[a]) * fr
        const fy = points[a + 1] + (points[a + 4] - points[a + 1]) * fr
        const fz = points[a + 2] + (points[a + 5] - points[a + 2]) * fr
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
