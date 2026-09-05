import { renderShareCardToPng, type ShareCardContent } from './renderShareCard'

export type { ShareCardContent }

/** Render the share card to a high-resolution PNG data URL. */
export async function composeShareCard(content: ShareCardContent): Promise<string> {
  return renderShareCardToPng(content)
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

/** Copy a result URL, including a fallback for older mobile browsers. */
export async function copyText(value: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // Fall through to the selection-based method when clipboard permission is denied.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  try {
    textarea.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

/** Open the native share sheet for a result link when supported. */
export async function sharePage(title: string, url: string): Promise<boolean> {
  if (!navigator.share) return false
  try {
    await navigator.share({ title, url })
    return true
  } catch (error) {
    return error instanceof DOMException && error.name === 'AbortError'
  }
}
