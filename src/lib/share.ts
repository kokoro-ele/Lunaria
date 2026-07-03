import { toPng } from 'html-to-image'

/** Render a DOM node to a high-resolution PNG data URL. */
export async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#04060a',
  })
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
