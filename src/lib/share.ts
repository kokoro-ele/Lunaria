import { toPng } from 'html-to-image'

/** Render a DOM node to a high-resolution PNG data URL. */
export async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#04060a',
  })
}

/** Whether the browser can share image files (iOS Safari, Android Chrome, etc.). */
export function supportsImageShare(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false
  try {
    const probe = new File([new Uint8Array([0])], 'probe.png', { type: 'image/png' })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || 'image/png' })
}

/** Open the system share sheet, or fall back to a file download. */
export async function shareOrDownloadImage(
  dataUrl: string,
  filename: string,
): Promise<'shared' | 'downloaded'> {
  if (navigator.share) {
    const file = await dataUrlToFile(dataUrl, filename)
    const payload = { files: [file] }

    if (!navigator.canShare || navigator.canShare(payload)) {
      try {
        await navigator.share(payload)
        return 'shared'
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return 'shared'
      }
    }
  }

  downloadDataUrl(dataUrl, filename)
  return 'downloaded'
}

/** Trigger a browser download for a data URL. */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
