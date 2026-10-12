import { lazy, Suspense, useEffect, useState } from 'react'
import { useTier } from '../../quality/tier'
import { InfinityMark } from '../ui/Infinity'

// The whole 3D scene (three.js, R3F, post-processing) is its own chunk, fetched after first paint.
const Experience = lazy(() => import('../../three/Experience'))

const whenIdle = (fn: () => void) => {
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
  if (ric) ric(fn, { timeout: 1200 })
  else setTimeout(fn, 200)
}

/**
 * Everything behind the page: the CSS backdrop (always there; it is the whole look in fallback
 * mode), the lazily-loaded WebGL canvas, and a minimal loader if the 3D takes longer than ~1 s.
 */
export function Stage() {
  const tier = useTier()
  const [mount, setMount] = useState(false)
  const [ready, setReady] = useState(false)
  const [slow, setSlow] = useState(false)
  const webgl = tier !== 'fallback'

  useEffect(() => {
    if (!webgl) return
    const go = () => whenIdle(() => setMount(true))
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => window.removeEventListener('load', go)
  }, [webgl])

  useEffect(() => {
    if (!mount || ready) return
    const t = setTimeout(() => setSlow(true), 1000)
    return () => clearTimeout(t)
  }, [mount, ready])

  useEffect(() => {
    document.documentElement.dataset['3d'] = !webgl ? 'off' : ready ? 'ready' : 'loading'
  }, [webgl, ready])

  return (
    <>
      <div className="stage-backdrop" aria-hidden="true" />
      {webgl && mount && (
        <div className="stage-canvas" aria-hidden="true">
          <Suspense fallback={null}>
            <Experience key={tier} tier={tier} onReady={() => setReady(true)} />
          </Suspense>
        </div>
      )}
      {webgl && slow && !ready && (
        <div className="stage-loader" aria-hidden="true">
          <InfinityMark className="h-5 w-10 text-paper/60" />
        </div>
      )}
    </>
  )
}
