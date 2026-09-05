import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { snapshotMoon } from '../lib/capture'
import { SHARE_CARD } from '../lib/shareCardLayout'
import {
  composeShareCard,
  copyText,
  shareOrDownloadImage,
  sharePage,
  supportsImageShare,
} from '../lib/share'
import type { MoonView } from '../lib/astronomy'

const PRESETS = ['birth', 'metYou', 'yours', 'sameMoon', 'anniversary', 'firstDay']

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  view: MoonView
  dateLabel: string
  locationLabel: string
  shareUrl: string
}

export default function ShareDialog({
  open,
  onClose,
  view,
  dateLabel,
  locationLabel,
  shareUrl,
}: ShareDialogProps) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')
  const [moonImg, setMoonImg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [linkStatus, setLinkStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [canShare, setCanShare] = useState(false)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setCanShare(supportsImageShare())
  }, [])

  useEffect(() => {
    if (!open) return
    // Wait one frame so the latest WebGL frame is present in the buffer.
    let cleanupSecondFrame = () => {}
    const firstFrame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => setMoonImg(snapshotMoon()))
      cleanupSecondFrame = () => cancelAnimationFrame(secondFrame)
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cleanupSecondFrame()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]',
        ),
      ).filter((element) => element.tabIndex !== -1)
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const handleSave = async () => {
    setBusy(true)
    setSaveError(false)
    try {
      const moonDataUrl = snapshotMoon() ?? moonImg
      const png = await composeShareCard({
        brandTitle: t('app.title'),
        moonDataUrl,
        message: message || t(`share.presetList.${PRESETS[0]}`),
        dateLabel,
        metaLine: `${locationLabel} · ${t(`moon.phases.${view.phaseKey}`)} · ${(view.illumination * 100).toFixed(0)}%`,
        watermark: t('share.watermark'),
      })
      await shareOrDownloadImage(png, `lunaria-${dateLabel.replace(/[^\d]/g, '')}.png`)
    } catch {
      setSaveError(true)
    } finally {
      setBusy(false)
    }
  }

  const handleCopyLink = async () => {
    setLinkStatus('idle')
    setLinkStatus((await copyText(shareUrl)) ? 'copied' : 'failed')
  }

  const handleShareLink = async () => {
    const shared = await sharePage(t('app.metaTitle'), shareUrl)
    if (!shared) await handleCopyLink()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm md:items-center md:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="panel flex max-h-[96dvh] w-full max-w-[760px] flex-col gap-5 overflow-auto rounded-none border-x-0 border-b-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:flex-row md:gap-6 md:rounded-none md:border md:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Preview card */}
        <div className="mx-auto w-[260px] shrink-0">
          <div
            className="relative flex aspect-[3/4] w-full flex-col items-center justify-between overflow-hidden bg-space-black p-6"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">
              {t('app.title')}
            </div>

            <div
              className="relative overflow-hidden rounded-full"
              style={{
                width: SHARE_CARD.moonSize,
                height: SHARE_CARD.moonSize,
                marginTop: SHARE_CARD.moonMarginY,
                marginBottom: SHARE_CARD.moonMarginY,
              }}
            >
              {moonImg ? (
                <img
                  src={moonImg}
                  alt={t('share.moonPreviewAlt')}
                  className="h-full w-full object-cover"
                  style={{ transform: `scale(${SHARE_CARD.moonZoom})` }}
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
            <h2 id={titleId} className="text-sm uppercase tracking-[0.2em] text-white/80">
              {t('share.title')}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
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
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="btn-line mt-auto w-full disabled:opacity-50"
          >
            {busy ? t('share.rendering') : canShare ? t('share.save') : t('share.download')}
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={handleCopyLink} className="btn-line w-full px-2">
              {linkStatus === 'copied' ? t('share.linkCopied') : t('share.copyLink')}
            </button>
            <button type="button" onClick={handleShareLink} className="btn-line w-full px-2">
              {t('share.shareLink')}
            </button>
          </div>
          {linkStatus === 'failed' && (
            <p className="mt-2 text-center text-[10px] text-red-300/80" role="alert">
              {t('share.linkFailed')}
            </p>
          )}
          {saveError && (
            <p className="mt-2 text-center text-[10px] leading-relaxed text-red-300/80" role="alert">
              {t('share.failed')}
            </p>
          )}
          {canShare && (
            <p className="mt-2 text-center text-[10px] font-light leading-relaxed text-white/35">
              {t('share.saveHint')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
