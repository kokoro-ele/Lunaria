import { useTranslation } from 'react-i18next'

interface ViewFollowToggleProps {
  active: boolean
  onToggle: () => void
}

function Dot({ on }: { on: boolean }) {
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
        on ? 'bg-space-glow' : 'bg-white/15'
      }`}
    />
  )
}

export default function ViewFollowToggle({ active, onToggle }: ViewFollowToggleProps) {
  const { t } = useTranslation()

  return (
    <div className="group relative">
      <button
        onClick={onToggle}
        className="panel flex items-center gap-2.5 px-3.5 py-2 text-[11px] font-mono uppercase tracking-widest2 text-white/60 transition-all hover:border-white/35 hover:text-white/90 md:px-4 md:py-2.5"
        aria-pressed={active}
        title={t('controls.tiltTooltip')}
      >
        <Dot on={active} />
        <span>{t('controls.viewFollow')}</span>
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/25 text-[8px] not-italic normal-case text-white/45">
          i
        </span>
      </button>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-[min(260px,calc(100vw-2rem))] -translate-x-1/2 translate-y-1 border border-space-line bg-space-deep/95 p-3 text-left text-[11px] font-light normal-case leading-relaxed tracking-normal text-white/70 opacity-0 backdrop-blur-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        {t('controls.tiltTooltip')}
      </div>
    </div>
  )
}
