import { useEffect, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import ControlsPanel from './ControlsPanel'

interface ControlsDrawerProps {
  open: boolean
  onClose: () => void
  panelProps: ComponentProps<typeof ControlsPanel>
}

export default function ControlsDrawer({ open, onClose, panelProps }: ControlsDrawerProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label={t('controls.closeDrawer')}
        onClick={onClose}
      />
      <aside
        className="absolute left-0 top-0 flex h-full w-[min(320px,88vw)] flex-col border-r border-space-line bg-space-deep/98 shadow-[8px_0_40px_rgba(0,0,0,0.45)] animate-[slideInLeft_0.28s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-label={t('controls.panelTitle')}
      >
        <div className="flex items-center justify-between border-b border-space-lineSoft px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <span className="label !text-white/55">{t('controls.panelTitle')}</span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-space-line text-white/50 transition-colors hover:text-white"
            aria-label={t('controls.closeDrawer')}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          <ControlsPanel {...panelProps} embedded />
        </div>
      </aside>
    </div>
  )
}
