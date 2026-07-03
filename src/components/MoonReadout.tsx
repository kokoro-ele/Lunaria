import { useTranslation } from 'react-i18next'
import type { MoonView } from '../lib/astronomy'

interface MoonReadoutProps {
  view: MoonView
  compact?: boolean
}

export default function MoonReadout({ view, compact = false }: MoonReadoutProps) {
  const { t } = useTranslation()

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

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-px border-b border-space-line bg-space-line md:hidden">
        {rows.map((r) => (
          <div key={r.label} className="bg-space-deep/95 px-3 py-2.5">
            <div className="label mb-0.5 !text-[9px]">{r.label}</div>
            <div className="truncate font-mono text-[11px] text-white/90">{r.value}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="panel w-[230px] max-w-[86vw] p-5 animate-fadeIn">
      <div className="space-y-3.5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="label mb-1">{r.label}</div>
            <div className="font-mono text-sm text-white/90">{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
