/** Shared layout tokens — preview (260px) and export use the same ratios. */
export const SHARE_CARD = {
  previewWidth: 260,
  aspect: 3 / 4,
  pad: 24,
  moonSize: 150,
  moonZoom: 1.35,
  moonMarginY: 8,
  exportWidth: 1080,
} as const

export function shareCardScale(exportWidth = SHARE_CARD.exportWidth): number {
  return exportWidth / SHARE_CARD.previewWidth
}

export function shareCardExportHeight(exportWidth = SHARE_CARD.exportWidth): number {
  return exportWidth / SHARE_CARD.aspect
}

/**
 * Draw moon like preview DOM: 150×150 circle, object-cover, then scale(1.35) from center.
 */
export function drawMoonPreviewStyle(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  imgW: number,
  imgH: number,
  cx: number,
  cy: number,
  boxSize: number,
  zoom = SHARE_CARD.moonZoom,
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, boxSize / 2, 0, Math.PI * 2)
  ctx.clip()

  const coverScale = Math.max(boxSize / imgW, boxSize / imgH)
  const scale = coverScale * zoom
  const dw = imgW * scale
  const dh = imgH * scale

  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh)
  ctx.restore()
}
