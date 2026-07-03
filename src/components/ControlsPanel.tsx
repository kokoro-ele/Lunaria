import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GlobePicker from './GlobePicker'

type Tab = 'time' | 'place' | 'opts'

interface ControlsPanelProps {
  date: string
  time: string
  lat: number
  lon: number
  tzLabel: string
  tiltCorrection: boolean
  locationSelected: boolean
  defaultCollapsed?: boolean
  docked?: boolean
  onDate: (v: string) => void
  onTime: (v: string) => void
  onPick: (lat: number, lon: number) => void
  onNow: () => void
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
  tiltCorrection,
  locationSelected,
  defaultCollapsed = false,
  docked = false,
  onDate,
  onTime,
  onPick,
  onNow,
  onTiltCorrection,
}: ControlsPanelProps) {
  const { t, i18n } = useTranslation()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [tab, setTab] = useState<Tab>(locationSelected ? 'time' : 'place')
  const langTag = LANG_TAG[i18n.resolvedLanguage === 'zh' ? 'zh' : 'en']

  useEffect(() => {
    if (docked && !locationSelected) {
      setCollapsed(false)
      setTab('place')
    }
  }, [docked, locationSelected])

  const handlePick = (la: number, lo: number) => {
    onPick(la, lo)
    if (docked) setTab('time')
  }

  const tabs: { id: Tab; label: string; alert?: boolean }[] = [
    { id: 'time', label: t('controls.tabTime') },
    { id: 'place', label: t('controls.tabPlace'), alert: !locationSelected },
    { id: 'opts', label: t('controls.tabOptions') },
  ]

  const collapsedSummary = locationSelected
    ? `${date} · ${fmtCoord(lat, 'N', 'S')}`
    : t('controls.selectPrompt')

  return (
    <div
      className={`panel animate-fadeIn ${
        docked ? 'w-full border-x-0 border-b-0 bg-space-deep/95' : 'w-[300px] max-w-[86vw]'
      }`}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-white/55 transition-colors hover:text-white/85 md:px-5 md:py-3.5"
        aria-label={collapsed ? t('controls.expand') : t('controls.collapse')}
      >
        <div className="min-w-0 text-left">
          <span className="label !text-white/55">{t('controls.panelTitle')}</span>
          {docked && collapsed && (
            <p className="mt-1 truncate font-mono text-[10px] normal-case tracking-normal text-white/40">
              {collapsedSummary}
            </p>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={`shrink-0 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>

      {!collapsed && (
        <div className="border-t border-space-lineSoft">
          {docked && (
            <div className="flex border-b border-space-lineSoft">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`relative flex-1 py-2.5 text-[10px] font-mono uppercase tracking-widest2 transition-colors ${
                    tab === item.id
                      ? 'bg-white/[0.04] text-white/90'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {item.label}
                  {item.alert && (
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-space-glow" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="max-h-[48dvh] overflow-y-auto px-4 pb-4 pt-3 md:max-h-none md:px-5 md:pb-5 md:pt-4">
            {(!docked || tab === 'time') && (
              <div>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="label mb-1.5">{t('controls.date')}</div>
                    <input
                      type="date"
                      lang={langTag}
                      value={date}
                      onChange={(e) => onDate(e.target.value)}
                      className="field w-full min-h-[44px]"
                    />
                  </div>
                  <div className="w-[96px] shrink-0">
                    <div className="label mb-1.5">{t('controls.time')}</div>
                    <input
                      type="time"
                      lang={langTag}
                      value={time}
                      onChange={(e) => onTime(e.target.value)}
                      className="field w-full min-h-[44px]"
                    />
                  </div>
                </div>
                <button onClick={onNow} className="btn-line mt-3 w-full min-h-[44px]">
                  {t('controls.today')}
                </button>
              </div>
            )}

            {(!docked || tab === 'place') && (
              <div className={docked && tab === 'place' ? '' : 'mt-4 md:mt-5'}>
                {!docked && (
                  <div className="label mb-2 flex items-center gap-1.5">
                    {t('controls.location')}
                    {!locationSelected && (
                      <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-space-glow" />
                    )}
                  </div>
                )}
                <div
                  className={`relative mx-auto aspect-square w-full overflow-hidden border bg-black/30 transition-colors ${
                    docked ? 'max-h-[240px] max-w-[240px]' : 'md:max-w-none'
                  } ${
                    locationSelected
                      ? 'border-space-line'
                      : 'border-space-glow/70 shadow-[0_0_24px_-6px_rgba(180,205,255,0.5)]'
                  }`}
                >
                  <GlobePicker lat={lat} lon={lon} onPick={handlePick} />
                  {!locationSelected && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/20 px-4 text-center">
                      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-space-glow/50">
                        <span className="h-2 w-2 animate-pulseSoft rounded-full bg-space-glow" />
                      </span>
                      <p className="text-[10px] font-mono uppercase leading-relaxed tracking-widest2 text-space-glow">
                        {t('controls.selectPrompt')}
                      </p>
                      <p className="mt-2 text-[9px] font-mono normal-case tracking-normal text-white/40">
                        {t('controls.pickHint')}
                      </p>
                    </div>
                  )}
                  {locationSelected && (
                    <div className="pointer-events-none absolute bottom-2 left-2 right-2 text-center text-[9px] font-mono normal-case tracking-normal text-white/30">
                      {t('controls.pickHint')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(!docked || tab === 'opts') && (
              <div className={docked && tab === 'opts' ? '' : 'mt-4'}>
                <div className="space-y-2 font-mono text-[11px] text-white/55 md:text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-white/35">{t('controls.coordinates')}</span>
                    <span className="text-right">
                      {fmtCoord(lat, 'N', 'S')}, {fmtCoord(lon, 'E', 'W')}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="shrink-0 text-white/35">{t('controls.timezone')}</span>
                    <span className="text-right">{tzLabel}</span>
                  </div>
                </div>

                <div className="group relative mt-4">
                  <button
                    onClick={() => onTiltCorrection(!tiltCorrection)}
                    className="flex min-h-[44px] w-full items-center justify-between border border-space-line px-3 py-2.5 text-[11px] font-mono uppercase tracking-widest2 text-white/50 transition-colors hover:text-white/80"
                  >
                    <span className="flex items-center gap-1.5 text-left leading-tight">
                      {t('controls.tiltCorrection')}
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-white/25 text-[8px] not-italic text-white/45">
                        i
                      </span>
                    </span>
                    <Dot on={tiltCorrection} />
                  </button>
                  <div className="pointer-events-none absolute bottom-full left-0 right-0 z-10 mb-2 hidden translate-y-1 border border-space-line bg-space-deep/95 p-3 text-[11px] font-light leading-relaxed text-white/70 opacity-0 backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 md:block">
                    {t('controls.tiltTooltip')}
                  </div>
                  {docked && (
                    <p className="mt-2 text-[10px] font-light leading-relaxed text-white/35">
                      {t('controls.tiltTooltip')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
