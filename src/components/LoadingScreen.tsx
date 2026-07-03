import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface LoadingScreenProps {
  /** Moon texture + first frame are ready */
  ready: boolean
  onDone: () => void
}

export default function LoadingScreen({ ready, onDone }: LoadingScreenProps) {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<'loading' | 'exit' | 'done'>('loading')

  useEffect(() => {
    if (ready && phase === 'loading') {
      setPhase('exit')
    }
  }, [ready, phase])

  useEffect(() => {
    if (phase !== 'exit') return
    const timer = window.setTimeout(() => {
      setPhase('done')
      onDone()
    }, 900)
    return () => window.clearTimeout(timer)
  }, [phase, onDone])

  if (phase === 'done') return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-space-black transition-opacity duration-700 ${
        phase === 'exit' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-live="polite"
      aria-busy={phase === 'loading'}
    >
      <div
        className={`flex flex-col items-center transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === 'exit' ? 'scale-[3.2] opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="loader-sphere" aria-hidden="true">
          <div className="loader-sphere__ring loader-sphere__ring--a" />
          <div className="loader-sphere__ring loader-sphere__ring--b" />
          <div className="loader-sphere__ring loader-sphere__ring--c" />
          <div className="loader-sphere__core" />
        </div>
        <p className="mt-8 text-[10px] font-mono uppercase tracking-[0.32em] text-white/45">
          {phase === 'exit' ? t('app.loadingReady') : t('app.loading')}
        </p>
      </div>
    </div>
  )
}
