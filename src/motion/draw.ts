/**
 * Length of an SVG path in screen pixels. The line art uses `vector-effect: non-scaling-stroke`
 * (a hairline at any size), and with it dash lengths are measured on screen, not in viewBox units,
 * so `pathLength` normalisation cannot be used.
 */
export function screenPathLength(path: SVGPathElement): number {
  const svg = path.ownerSVGElement
  if (!svg) return path.getTotalLength()
  const vb = svg.viewBox.baseVal
  const box = svg.getBoundingClientRect()
  const scale = vb && vb.width ? Math.min(box.width / vb.width, box.height / vb.height) : 1
  return Math.ceil(path.getTotalLength() * scale) + 2
}
