import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { gsap } from '../motion/gsap'
import { dropTier, type Tier } from '../quality/tier'
import { TIER_CONFIG, type TierConfig } from './config'
import { Director } from './Director'
import { F, live } from './state'
import { Thread } from './thread/Thread'
import { Fragments } from './moments/Fragments'
import { Plinth } from './moments/Plinth'
import { FinalistLights, TimelineBeads } from './moments/Points'

const Effects = lazy(() => import('./Effects'))

type Props = { tier: Exclude<Tier, 'fallback'>; onReady: () => void }

/**
 * The single persistent 3D scene behind the page. Lazy-loaded; never mounted in fallback mode.
 * Rendering is on demand: a driver on GSAP's ticker requests frames (fewer in calm sections,
 * none while the tab is hidden), and a watchdog steps the tier down if the frame rate stays low.
 */
export default function Experience({ tier, onReady }: Props) {
  const cfg = TIER_CONFIG[tier]
  return (
    <Canvas
      frameloop="demand"
      dpr={cfg.dpr}
      gl={{ antialias: cfg.antialias, alpha: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 45, near: 0.1, far: 120, position: [0, 0, 8] }}
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color('#0A0A0A')
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          // Losing the context is a strong hint the device is struggling: use the CSS fallback.
          while (document.documentElement.dataset.tier !== 'fallback') dropTier()
        })
      }}
    >
      <Director count={cfg.points} />
      <Lights />
      <Thread cfg={cfg} />
      <Fragments detail={cfg.fragmentDetail} />
      <Plinth />
      <FinalistLights />
      <TimelineBeads />
      {cfg.bloom && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
      <Driver onReady={onReady} />
      <Watchdog />
    </Canvas>
  )
}

function Lights() {
  const { scene, gl } = useThree()
  // A generated studio environment so the metal fragments read as metal. No files are loaded.
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.55
    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [scene, gl])
  const rim = useRef<THREE.PointLight>(null)
  useFrame(() => {
    const s = live.state
    rim.current?.color.setRGB(s[F.r], s[F.g], s[F.b], THREE.SRGBColorSpace)
  })
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight ref={rim} position={[-4, 1, -2]} intensity={6} decay={1} distance={14} />
    </>
  )
}

/** Requests frames from GSAP's ticker (the same clock Lenis and ScrollTrigger use). */
function Driver({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate)
  const announced = useRef(false)
  useEffect(() => {
    let frame = 0
    const tick = () => {
      if (document.hidden) return
      frame++
      const s = live.state
      // Calm stretches (dim thread, no moments) only need ~30 fps.
      const calm = s[F.speed] < 0.6 || (s[F.thread] < 0.45 && s[F.fragments] < 0.02 && s[F.lights] < 0.02 && s[F.beads] < 0.02)
      if (calm && frame % 2) return
      invalidate()
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [invalidate])
  useFrame(() => {
    if (!announced.current && live.ready) {
      announced.current = true
      requestAnimationFrame(onReady)
    }
  })
  return null
}

/**
 * If the page can't hold a reasonable frame rate for a few seconds, step down one tier
 * (high → medium → low → fallback). Disabled when the tier is forced with ?tier=.
 */
function Watchdog() {
  const forced = useMemo(() => new URLSearchParams(location.search).has('tier'), [])
  useEffect(() => {
    if (forced) return
    let frames = 0
    let last = performance.now()
    let bad = 0
    const startedAt = last
    let cooldownUntil = last + 4000
    const tick = () => {
      frames++
      const now = performance.now()
      if (now - last < 1000) return
      const fps = (frames * 1000) / (now - last)
      frames = 0
      last = now
      if (document.hidden || now < cooldownUntil || now - startedAt < 4000) return
      bad = fps < 40 ? bad + 1 : 0
      if (bad >= 3) {
        bad = 0
        cooldownUntil = now + 5000
        dropTier()
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [forced])
  return null
}

export type { TierConfig }
