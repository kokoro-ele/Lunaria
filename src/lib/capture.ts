// Holds a reference to the WebGL canvas that renders the Moon so the share
// dialog can grab a high-quality snapshot of exactly what's on screen.
let moonCanvas: HTMLCanvasElement | null = null

export function setMoonCanvas(canvas: HTMLCanvasElement | null) {
  moonCanvas = canvas
}

export function getMoonCanvas(): HTMLCanvasElement | null {
  return moonCanvas
}

/** Returns a PNG data URL of the current Moon render, or null. */
export function snapshotMoon(): string | null {
  if (!moonCanvas) return null
  try {
    return moonCanvas.toDataURL('image/png')
  } catch {
    return null
  }
}
