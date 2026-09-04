import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  isMoonTextureLoaded,
  isMoonTextureLoading,
  loadMoonTexture,
  MOON_TEXTURE_QUALITIES,
  subscribeMoonTexture,
  type MoonTextureQuality,
} from '../lib/moonTexture'
import { useStore } from '../store'
import { useIsMobile } from '../hooks/useIsMobile'

export default function TextureQualitySelector() {
  const { t } = useTranslation()
  const textureQuality = useStore((s) => s.textureQuality)
  const setTextureQuality = useStore((s) => s.setTextureQuality)
  const isMobile = useIsMobile()
  const [hint, setHint] = useState('')
  const [, tick] = useState(0)
  const latestSelection = useRef(0)

  useEffect(() => subscribeMoonTexture(() => tick((n) => n + 1)), [])

  useEffect(() => {
    if (isMobile && textureQuality === '8k') {
      latestSelection.current += 1
      setTextureQuality('2k')
      setHint('')
    }
  }, [isMobile, textureQuality, setTextureQuality])

  useEffect(() => {
    if (!hint) return
    const timer = window.setTimeout(() => setHint(''), 3200)
    return () => window.clearTimeout(timer)
  }, [hint])

  const select = async (quality: MoonTextureQuality) => {
    const selection = ++latestSelection.current
    if (quality === textureQuality) {
      setHint('')
      return
    }

    if (isMoonTextureLoaded(quality)) {
      setTextureQuality(quality)
      setHint('')
      return
    }

    setHint(t('texture.downloading'))
    try {
      await loadMoonTexture(quality)
      if (selection === latestSelection.current) {
        setTextureQuality(quality)
        setHint('')
      }
    } catch {
      if (selection === latestSelection.current) {
        setHint(t('texture.loadFailed'))
      }
    }
  }

  return (
    <div className="relative flex flex-col items-end">
      <div
        className="flex items-center gap-px border border-space-line"
        role="group"
        aria-label={t('texture.label')}
      >
        {MOON_TEXTURE_QUALITIES.filter((q) => !isMobile || q !== '8k').map((q) => {
          const active = textureQuality === q
          const ready = isMoonTextureLoaded(q)
          const loading = isMoonTextureLoading(q)
          return (
            <button
              key={q}
              type="button"
              onClick={() => select(q)}
              className={`relative px-2 py-1.5 text-[10px] font-mono tracking-[0.14em] transition-colors md:px-2.5 md:text-xs ${
                active ? 'bg-white/[0.06] text-white' : 'text-white/40 hover:text-white/80'
              }`}
              aria-pressed={active}
              title={
                ready
                  ? t(`texture.tiers.${q}`)
                  : loading
                    ? t('texture.downloading')
                    : t('texture.loadOnDemand')
              }
            >
              {t(`texture.tiers.${q}`)}
              {!active && ready && (
                <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-space-glow" />
              )}
            </button>
          )
        })}
      </div>
      {hint && (
        <p className="pointer-events-none absolute top-full mt-1.5 max-w-[11rem] text-right text-[9px] font-light leading-snug text-white/45 md:max-w-none md:text-[10px]">
          {hint}
        </p>
      )}
    </div>
  )
}
