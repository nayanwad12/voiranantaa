/**
 * Defer animation setup until it is needed, and never in one big chunk.
 * `whenNear(el, run)` runs `run` once `el` is within ~a screen of the viewport, during idle time,
 * a few jobs per slice — so a slow phone's main thread never blocks for long while the page loads.
 */
type Job = { run: () => void; cancelled: boolean }

const waiting = new Map<Element, Job[]>()
const queue: Job[] = []
let io: IntersectionObserver | null = null
let scheduled = false

type IdleDeadline = { timeRemaining: () => number }
const ric =
  (typeof window !== 'undefined' &&
    (window as Window & { requestIdleCallback?: (cb: (d: IdleDeadline) => void, o?: { timeout: number }) => number })
      .requestIdleCallback) ||
  ((cb: (d: IdleDeadline) => void) => setTimeout(() => cb({ timeRemaining: () => 8 }), 16))

function pump(deadline: IdleDeadline) {
  scheduled = false
  while (queue.length && deadline.timeRemaining() > 4) {
    const job = queue.shift()!
    if (!job.cancelled) job.run()
  }
  if (queue.length) schedule()
}

function schedule() {
  if (scheduled) return
  scheduled = true
  ric(pump, { timeout: 300 })
}

function observer() {
  io ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const jobs = waiting.get(entry.target)
        if (!jobs) continue
        waiting.delete(entry.target)
        io!.unobserve(entry.target)
        queue.push(...jobs)
      }
      if (queue.length) schedule()
    },
    { rootMargin: '120% 0px 120% 0px' },
  )
  return io
}

export function whenNear(el: Element, run: () => void): () => void {
  const job: Job = { run, cancelled: false }
  const jobs = waiting.get(el)
  if (jobs) jobs.push(job)
  else {
    waiting.set(el, [job])
    observer().observe(el)
  }
  return () => {
    job.cancelled = true
  }
}
