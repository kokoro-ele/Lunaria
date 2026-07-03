import {
  SHARE_CARD,
  drawMoonPreviewStyle,
  shareCardExportHeight,
  shareCardScale,
} from './shareCardLayout'

export interface ShareCardContent {
  brandTitle: string
  moonDataUrl: string | null
  message: string
  dateLabel: string
  metaLine: string
  watermark: string
}

const CARD_W = SHARE_CARD.exportWidth
const CARD_H = shareCardExportHeight()
const S = shareCardScale()

const PAD = SHARE_CARD.pad * S
const MOON_BOX = SHARE_CARD.moonSize * S
const MOON_MY = SHARE_CARD.moonMarginY * S

const FONT_SANS = '"Inter", "PingFang SC", "Helvetica Neue", system-ui, sans-serif'
const FONT_MONO = '"JetBrains Mono", "SF Mono", ui-monospace, monospace'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load moon image'))
    img.src = src
  })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const char of text) {
    const next = line + char
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = char
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

/** Render the share card to a PNG data URL (pixel-perfect, no DOM capture). */
export async function renderShareCardToPng(content: ShareCardContent): Promise<string> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready
  }

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  ctx.fillStyle = '#04060a'
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, CARD_W - 1, CARD_H - 1)

  const titleSize = 9 * S
  const msgSize = 13 * S
  const dateSize = 10 * S
  const metaSize = 9 * S
  const wmSize = 8 * S

  const titleH = titleSize * 1.3
  const moonOuterH = MOON_BOX + MOON_MY * 2
  const msgLineH = msgSize * 1.35
  const msgLines = (() => {
    ctx.font = `300 ${msgSize}px ${FONT_SANS}`
    return wrapText(ctx, content.message, CARD_W - PAD * 2)
  })()
  const msgBlockH = Math.max(34 * S, msgLines.length * msgLineH)
  const textBlockH = msgBlockH + 8 * S + 1 + 8 * S + dateSize * 1.4 + metaSize * 1.4
  const watermarkH = wmSize * 1.3

  const innerH = CARD_H - PAD * 2
  const gap = (innerH - titleH - moonOuterH - textBlockH - watermarkH) / 3

  let y = PAD

  // Brand title
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = `400 ${titleSize}px ${FONT_MONO}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  if ('letterSpacing' in ctx) {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${0.3 * S}px`
  }
  ctx.fillText(content.brandTitle.toUpperCase(), CARD_W / 2, y)
  if ('letterSpacing' in ctx) {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  }
  y += titleH + gap

  // Moon — same object-cover + scale(1.35) as preview
  const moonCx = CARD_W / 2
  const moonCy = y + MOON_MY + MOON_BOX / 2
  if (content.moonDataUrl) {
    try {
      const moonImg = await loadImage(content.moonDataUrl)
      drawMoonPreviewStyle(
        ctx,
        moonImg,
        moonImg.naturalWidth,
        moonImg.naturalHeight,
        moonCx,
        moonCy,
        MOON_BOX,
      )
    } catch {
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.beginPath()
      ctx.arc(moonCx, moonCy, MOON_BOX / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  y += moonOuterH + gap

  // Message
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = `300 ${msgSize}px ${FONT_SANS}`
  ctx.textAlign = 'center'
  const msgStartY = y + (msgBlockH - msgLines.length * msgLineH) / 2
  msgLines.forEach((line, i) => {
    ctx.fillText(line, CARD_W / 2, msgStartY + i * msgLineH)
  })
  y += msgBlockH

  // Divider
  y += 8 * S
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 1
  const hrW = 32 * S
  ctx.beginPath()
  ctx.moveTo(CARD_W / 2 - hrW / 2, y)
  ctx.lineTo(CARD_W / 2 + hrW / 2, y)
  ctx.stroke()
  y += 8 * S

  // Date
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = `400 ${dateSize}px ${FONT_MONO}`
  ctx.fillText(content.dateLabel, CARD_W / 2, y)
  y += dateSize * 1.4

  // Meta
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = `400 ${metaSize}px ${FONT_MONO}`
  ctx.fillText(content.metaLine, CARD_W / 2, y)

  // Watermark
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = `400 ${wmSize}px ${FONT_MONO}`
  ctx.textBaseline = 'alphabetic'
  if ('letterSpacing' in ctx) {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${0.25 * S}px`
  }
  ctx.fillText(content.watermark.toUpperCase(), CARD_W / 2, CARD_H - PAD)
  if ('letterSpacing' in ctx) {
    ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
  }

  return canvas.toDataURL('image/png')
}
