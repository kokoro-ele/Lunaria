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
    <div className="panel w-[200px] max-w-[42vw] p-4 animate-fadeIn md:w-[230px] md:max-w-none md:p-5">
      <div className="space-y-2.5 md:space-y-3.5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="label mb-0.5 md:mb-1">{r.label}</div>
            <div className="font-mono text-xs text-white/90 md:text-sm">{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
