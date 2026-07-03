import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import GlobePicker from './GlobePicker'

interface ControlsPanelProps {
  date: string
  time: string
  lat: number
  lon: number
  tzLabel: string
  hiRes: boolean
  tiltCorrection: boolean
  locationSelected: boolean
  onDate: (v: string) => void
  onTime: (v: string) => void
  onPick: (lat: number, lon: number) => void
  onNow: () => void
  onHiRes: (v: boolean) => void
  onTiltCorrection: (v: boolean) => void
}

function fmtCoord(value: number, posSuffix: string, negSuffix: string) {
  const suffix = value >= 0 ? posSuffix : negSuffix
  return `${Math.abs(value).toFixed(2)}° ${suffix}`
}

const LANG_TAG: Record<string, string> = { zh: 'zh-CN', en: 'en-US' }

function Dot({ on }: { on: boolean }) {
  return (
    <span
      className={`h-2 w-2 rounded-full transition-colors ${
        on ? 'bg-space-glow' : 'bg-white/15'
      }`}
    />
  )
}

export default function ControlsPanel({
  date,
  time,
  lat,
  lon,
  tzLabel,
  hiRes,
  tiltCorrection,
  locationSelected,
  onDate,
  onTime,
  onPick,
  onNow,
  onHiRes,
  onTiltCorrection,
}: ControlsPanelProps) {
  const { t, i18n } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const langTag = LANG_TAG[i18n.resolvedLanguage === 'zh' ? 'zh' : 'en']

  return (
    <div className="panel w-[300px] max-w-[86vw] animate-fadeIn">
      {/* Header with collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-white/55 transition-colors hover:text-white/85"
        aria-label={collapsed ? t('controls.expand') : t('controls.collapse')}
      >
        <span className="label !text-white/55">{t('controls.panelTitle')}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>

      {!collapsed && (
        <div className="border-t border-space-lineSoft px-5 pb-5 pt-4">
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
              className={`relative aspect-square w-full overflow-hidden border bg-black/30 transition-colors ${
                locationSelected
                  ? 'border-space-line'
                  : 'border-space-glow/70 shadow-[0_0_24px_-6px_rgba(180,205,255,0.5)]'
              }`}
            >
              <GlobePicker lat={lat} lon={lon} onPick={onPick} />
              <div
                className={`pointer-events-none absolute bottom-2 left-2 right-2 text-center text-[10px] font-mono uppercase tracking-widest2 transition-colors ${
                  locationSelected
                    ? 'text-white/30'
                    : 'animate-pulseSoft text-space-glow'
                }`}
              >
                {locationSelected ? t('controls.pickOnGlobe') : t('controls.selectPrompt')}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 font-mono text-xs text-white/55">
            <div className="flex justify-between">
              <span className="text-white/35">{t('controls.coordinates')}</span>
              <span>
                {fmtCoord(lat, 'N', 'S')}, {fmtCoord(lon, 'E', 'W')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/35">{t('controls.timezone')}</span>
              <span>{tzLabel}</span>
            </div>
          </div>

          {/* Local viewing-angle correction + tooltip */}
          <div className="group relative mt-4">
            <button
              onClick={() => onTiltCorrection(!tiltCorrection)}
              className="flex w-full items-center justify-between border border-space-line px-3 py-2 text-[11px] font-mono uppercase tracking-widest2 text-white/50 transition-colors hover:text-white/80"
            >
              <span className="flex items-center gap-1.5">
                {t('controls.tiltCorrection')}
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/25 text-[8px] not-italic text-white/45">
                  i
                </span>
              </span>
              <Dot on={tiltCorrection} />
            </button>
            <div className="pointer-events-none absolute bottom-full left-0 right-0 mb-2 translate-y-1 border border-space-line bg-space-deep/95 p-3 text-[11px] font-light leading-relaxed text-white/70 opacity-0 backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              {t('controls.tiltTooltip')}
            </div>
          </div>

          <button
            onClick={() => onHiRes(!hiRes)}
            className="mt-3 flex w-full items-center justify-between border border-space-line px-3 py-2 text-[11px] font-mono uppercase tracking-widest2 text-white/50 transition-colors hover:text-white/80"
          >
            <span>{t('controls.hiRes')}</span>
            <Dot on={hiRes} />
          </button>
        </div>
      )}
    </div>
  )
}
