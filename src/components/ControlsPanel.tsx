import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import GlobePicker from './GlobePicker'

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

  const body = (
    <div
      className={
        embedded
          ? 'px-4 pb-5 pt-4'
          : expandUp
            ? 'border-b border-space-lineSoft px-3 pb-4 pt-3'
            : 'border-t border-space-lineSoft px-5 pb-5 pt-4'
      }
    >
      <div className="flex items-end justify-between gap-3">
        <div className="flex-1">
          <div className="label mb-1.5">{t('controls.date')}</div>
          <input
            type="date"
            lang={langTag}
            value={date}
            onChange={(e) => onDate(e.target.value)}
            className="field w-full"
          />
        </div>
        <div className="w-[96px]">
          <div className="label mb-1.5">{t('controls.time')}</div>
          <input
            type="time"
            lang={langTag}
            value={time}
            onChange={(e) => onTime(e.target.value)}
            className="field w-full"
          />
        </div>
      </div>

      <button onClick={onNow} className="btn-line mt-3 w-full">
        {t('controls.today')}
      </button>

      <div className="mt-5">
        <div className="label mb-2 flex items-center gap-1.5">
          {t('controls.location')}
          {!locationSelected && (
            <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-space-glow" />
          )}
        </div>
        <div
          className={`relative ${expandUp ? 'h-[160px]' : 'h-[220px]'} w-full touch-none overflow-hidden border bg-black/30 ${
            locationSelected
              ? 'border-space-line'
              : 'border-space-glow/70 shadow-[0_0_24px_-6px_rgba(180,205,255,0.5)]'
          }`}
        >
          <GlobePicker lat={lat} lon={lon} onPick={onPick} />
          <div
            className={`pointer-events-none absolute bottom-2 left-2 right-2 text-center text-[10px] font-mono uppercase tracking-widest2 ${
              locationSelected ? 'text-white/30' : 'animate-pulseSoft text-space-glow'
            }`}
          >
            {locationSelected ? t('controls.pickOnGlobe') : t('controls.selectPrompt')}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 font-mono text-xs text-white/55">
        <div className="flex justify-between gap-3">
          <span className="text-white/35">{t('controls.coordinates')}</span>
          <span className="text-right">
            {fmtCoord(lat, 'N', 'S')}, {fmtCoord(lon, 'E', 'W')}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/35">{t('controls.timezone')}</span>
          <span className="text-right">{tzLabel}</span>
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return body
  }

  return (
    <div
      className={`panel animate-fadeIn ${
        expandUp
          ? 'flex w-full flex-col-reverse'
          : 'w-[300px] max-w-[calc(100vw-2.5rem)]'
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
}
