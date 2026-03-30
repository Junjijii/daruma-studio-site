export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) {
    return outMin
  }

  const progress = (value - inMin) / (inMax - inMin)
  return lerp(outMin, outMax, progress)
}
