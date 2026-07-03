import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MoonView } from '../lib/astronomy'

export default function MoonReadout({ view }: { view: MoonView }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const rows = [
    { label: t('moon.phase'), value: t(`moon.phases.${view.phaseKey}`) },
    { label: t('moon.illumination'), value: `${(view.illumination * 100).toFixed(1)}%` },
    {
      label: t('moon.age'),
      value: `${view.ageDays.toFixed(1)} ${t('moon.days')}`,
    },
    {
      label: t('moon.distance'),
      value: `${Math.round(view.distanceKm).toLocaleString()} km`,
    },
  ]

  return (
    <div className="panel w-[200px] max-w-[42vw] animate-fadeIn md:w-[230px] md:max-w-none">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-3 text-white/55 transition-colors hover:text-white/85 md:px-5 md:py-3.5"
        aria-label={collapsed ? t('controls.expand') : t('controls.collapse')}
      >
        <span className="label !text-white/55">{t('moon.panelTitle')}</span>
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
        <div className="space-y-2.5 border-t border-space-lineSoft px-4 pb-4 pt-3 md:space-y-3.5 md:px-5 md:pb-5 md:pt-4">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="label mb-0.5 md:mb-1">{r.label}</div>
              <div className="font-mono text-xs text-white/90 md:text-sm">{r.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
