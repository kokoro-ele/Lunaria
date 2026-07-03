import { useTranslation } from 'react-i18next'
import type { MoonView } from '../lib/astronomy'

export default function MoonReadout({ view }: { view: MoonView }) {
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
