import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { snapshotMoon } from '../lib/capture'
import { nodeToPng, downloadDataUrl } from '../lib/share'
import type { MoonView } from '../lib/astronomy'

const PRESETS = ['birth', 'metYou', 'yours', 'sameMoon', 'anniversary', 'firstDay']

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  view: MoonView
  dateLabel: string
  locationLabel: string
}

export default function ShareDialog({
  open,
  onClose,
  view,
  dateLabel,
  locationLabel,
}: ShareDialogProps) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')
  const [moonImg, setMoonImg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      // Wait one frame so the latest WebGL frame is present in the buffer.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setMoonImg(snapshotMoon()))
      })
    }
  }, [open])

  if (!open) return null

  const handleDownload = async () => {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const png = await nodeToPng(cardRef.current)
      downloadDataUrl(png, `lunaria-${dateLabel.replace(/[^\d]/g, '')}.png`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel flex max-h-[92vh] w-full max-w-[760px] flex-col gap-6 overflow-auto p-6 md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview card */}
        <div className="mx-auto w-[260px] shrink-0">
          <div
            ref={cardRef}
            className="relative flex aspect-[3/4] w-full flex-col items-center justify-between overflow-hidden bg-space-black p-6"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">
              {t('app.title')}
            </div>

            <div className="relative my-2 h-[150px] w-[150px] overflow-hidden rounded-full">
              {moonImg ? (
                <img
                  src={moonImg}
                  alt="moon"
                  className="h-full w-full object-cover"
                  style={{ transform: 'scale(1.35)' }}
                />
              ) : (
                <div className="h-full w-full animate-pulseSoft rounded-full bg-white/5" />
              )}
            </div>

            <div className="flex w-full flex-col items-center gap-2 text-center">
              <div className="min-h-[34px] px-1 text-[13px] font-light leading-snug text-white/90">
                {message || t(`share.presetList.${PRESETS[0]}`)}
              </div>
              <div className="h-px w-8 bg-white/20" />
              <div className="font-mono text-[10px] tracking-wider text-white/55">
                {dateLabel}
              </div>
              <div className="font-mono text-[9px] tracking-wider text-white/35">
                {locationLabel} · {t(`moon.phases.${view.phaseKey}`)} ·{' '}
                {(view.illumination * 100).toFixed(0)}%
              </div>
            </div>

            <div className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/25">
              {t('share.watermark')}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-[0.2em] text-white/80">
              {t('share.title')}
            </h2>
            <button
              onClick={onClose}
              className="text-white/40 transition-colors hover:text-white"
              aria-label={t('share.close')}
            >
              ✕
            </button>
          </div>

          <div className="mt-5">
            <div className="label mb-2">{t('share.message')}</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('share.messagePlaceholder')}
              rows={2}
              maxLength={60}
              className="field w-full resize-none"
            />
          </div>

          <div className="mt-4">
            <div className="label mb-2">{t('share.presets')}</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setMessage(t(`share.presetList.${p}`))}
                  className="border border-space-line px-2.5 py-1.5 text-left text-[11px] leading-tight text-white/60 transition-all hover:border-white/35 hover:text-white/90"
                >
                  {t(`share.presetList.${p}`)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={busy}
            className="btn-line mt-auto w-full disabled:opacity-50"
          >
            {busy ? t('share.rendering') : t('share.download')}
          </button>
        </div>
      </div>
    </div>
  )
}
