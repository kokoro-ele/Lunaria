import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import GlobePicker from './GlobePicker'
import ScaledToFit from './ScaledToFit'

interface ControlsPanelProps {
  date: string
  time: string
  lat: number
  lon: number
  tzLabel: string
  locationSelected: boolean
  /** Render inside mobile drawer without outer chrome */
  embedded?: boolean
  /** Anchor at screen bottom — content expands upward */
  expandUp?: boolean
  onDate: (v: string) => void
  onTime: (v: string) => void
  onPick: (lat: number, lon: number) => void
  onNow: () => void
}

function fmtCoord(value: number, posSuffix: string, negSuffix: string) {
  const suffix = value >= 0 ? posSuffix : negSuffix
  return `${Math.abs(value).toFixed(2)}° ${suffix}`
}

const LANG_TAG: Record<string, string> = { zh: 'zh-CN', en: 'en-US' }

export default function ControlsPanel({
  date,
  time,
  lat,
  lon,
  tzLabel,
  locationSelected,
  embedded = false,
  expandUp = false,
  onDate,
  onTime,
  onPick,
  onNow,
}: ControlsPanelProps) {
  const { t, i18n } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const langTag = LANG_TAG[i18n.resolvedLanguage === 'zh' ? 'zh' : 'en']

  const globeBox = (
    <div
      className={`relative w-full touch-none overflow-hidden border bg-black/30 ${
        expandUp ? 'h-[128px]' : 'h-[220px]'
      } ${
        locationSelected
          ? 'border-space-line'
          : 'border-space-glow/70 shadow-[0_0_24px_-6px_rgba(180,205,255,0.5)]'
      }`}
    >
      <GlobePicker lat={lat} lon={lon} onPick={onPick} />
      <div
        className={`pointer-events-none absolute bottom-1.5 left-1.5 right-1.5 text-center font-mono uppercase tracking-widest2 ${
          expandUp ? 'text-[8px]' : 'text-[10px]'
        } ${
          locationSelected ? 'text-white/30' : 'animate-pulseSoft text-space-glow'
        }`}
      >
        {locationSelected ? t('controls.pickOnGlobe') : t('controls.selectPrompt')}
      </div>
    </div>
  )

  const formSection = (
    <>
      <div className={`flex items-end justify-between ${expandUp ? 'gap-2' : 'gap-3'}`}>
        <div className="min-w-0 flex-1">
          <div className={`label ${expandUp ? 'mb-1' : 'mb-1.5'}`}>{t('controls.date')}</div>
          <input
            type="date"
            lang={langTag}
            value={date}
            onChange={(e) => onDate(e.target.value)}
            className={`field w-full min-w-0 ${expandUp ? 'px-2 py-1.5 text-xs' : ''}`}
          />
        </div>
        <div className={`shrink-0 ${expandUp ? 'w-[72px]' : 'w-[96px]'}`}>
          <div className={`label ${expandUp ? 'mb-1' : 'mb-1.5'}`}>{t('controls.time')}</div>
          <input
            type="time"
            lang={langTag}
            value={time}
            onChange={(e) => onTime(e.target.value)}
            className={`field w-full ${expandUp ? 'px-2 py-1.5 text-xs' : ''}`}
          />
        </div>
      </div>

      <button
        onClick={onNow}
        className={`btn-line w-full ${expandUp ? 'mt-2 py-1.5 text-[10px]' : 'mt-3'}`}
      >
        {t('controls.today')}
      </button>
    </>
  )

  const metaSection = (
    <div className={`space-y-1.5 font-mono text-white/55 ${expandUp ? 'text-[10px]' : 'space-y-2 text-xs'}`}>
      <div className="flex justify-between gap-2">
        <span className="text-white/35">{t('controls.coordinates')}</span>
        <span className="text-right">{fmtCoord(lat, 'N', 'S')}, {fmtCoord(lon, 'E', 'W')}</span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="shrink-0 text-white/35">{t('controls.timezone')}</span>
        <span className="text-right">{tzLabel}</span>
      </div>
    </div>
  )

  const body = expandUp ? (
    <div className="border-b border-space-lineSoft">
      <ScaledToFit designWidth={300}>
        <div className="w-[300px] px-3 pb-2 pt-3">
          {formSection}
        </div>
      </ScaledToFit>
      <div className={`px-3 ${expandUp ? 'py-2' : ''}`}>{globeBox}</div>
      <ScaledToFit designWidth={300}>
        <div className="w-[300px] px-3 pb-3">{metaSection}</div>
      </ScaledToFit>
    </div>
  ) : (
    <div
      className={
        embedded
          ? 'px-4 pb-5 pt-4'
          : 'border-t border-space-lineSoft px-5 pb-5 pt-4'
      }
    >
      {formSection}
      <div className={embedded ? 'mt-5' : 'mt-5'}>
        <div className="label mb-2 flex items-center gap-1.5">
          {t('controls.location')}
          {!locationSelected && (
            <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-space-glow" />
          )}
        </div>
        {globeBox}
      </div>
      <div className="mt-4">{metaSection}</div>
    </div>
  )

  if (embedded) {
    return body
  }

  const panel = (
    <div
      className={`panel animate-fadeIn ${
        expandUp ? 'flex w-full flex-col-reverse' : 'w-[300px] max-w-[calc(100vw-2.5rem)]'
      }`}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`flex w-full items-center justify-between text-white/55 transition-colors hover:text-white/85 ${
          expandUp ? 'px-3 py-2.5' : 'px-5 py-3.5'
        }`}
        aria-label={collapsed ? t('controls.expand') : t('controls.collapse')}
      >
        <span className="label !text-white/55">{t('controls.panelTitle')}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={`shrink-0 transition-transform duration-300 ${
            expandUp
              ? collapsed
                ? 'rotate-180'
                : ''
              : collapsed
                ? ''
                : 'rotate-180'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>

      {!collapsed && body}
    </div>
  )

  return panel
}
