import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from './store'
import { computeMoonView } from './lib/astronomy'
import { localWallTimeToUtc, timezoneFor, offsetLabel, wallTimeAt } from './lib/timezone'
import { buildShareUrl } from './lib/shareUrl'
import MoonScene from './components/MoonScene'
import ControlsPanel from './components/ControlsPanel'
import MoonReadout from './components/MoonReadout'
import ViewFollowToggle from './components/ViewFollowToggle'
import LanguageSwitcher from './components/LanguageSwitcher'
import GitHubLink from './components/GitHubLink'
import TextureQualitySelector from './components/TextureQualitySelector'
import LoadingScreen from './components/LoadingScreen'

const ShareDialog = lazy(() => import('./components/ShareDialog'))

export default function App() {
  const { t, i18n } = useTranslation()
  const {
    date,
    time,
    latitude,
    longitude,
    locationSelected,
    tiltCorrection,
    setDate,
    setTime,
    setDateTime,
    setLocation,
    setTiltCorrection,
  } = useStore()
  const [shareOpen, setShareOpen] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneError, setSceneError] = useState(false)
  const [textureRetryKey, setTextureRetryKey] = useState(0)
  const [loaderDone, setLoaderDone] = useState(false)

  const handleBootstrapReady = useCallback(() => {
    setSceneError(false)
    setSceneReady(true)
  }, [])
  const handleBootstrapError = useCallback(() => setSceneError(true), [])
  const handleTextureRetry = useCallback(() => {
    setSceneError(false)
    setTextureRetryKey((key) => key + 1)
  }, [])
  const handleShareOpen = useCallback(() => setShareOpen(true), [])
  const handleShareClose = useCallback(() => setShareOpen(false), [])

  const uiLang = i18n.resolvedLanguage === 'zh' ? 'zh-CN' : 'en-US'

  useEffect(() => {
    document.documentElement.lang = uiLang
    const title = t('app.metaTitle')
    const description = t('app.metaDescription')
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute('content', uiLang === 'zh-CN' ? 'zh_CN' : 'en_US')
  }, [t, uiLang])

  const timeZone = useMemo(
    () => timezoneFor(latitude, longitude),
    [latitude, longitude],
  )

  const utcDate = useMemo(
    () => localWallTimeToUtc(date, time, timeZone),
    [date, time, timeZone],
  )

  const view = useMemo(
    () => computeMoonView(utcDate, latitude, longitude),
    [utcDate, latitude, longitude],
  )

  const tzLabel = useMemo(
    () => `${timeZone} · ${offsetLabel(utcDate, timeZone)}`,
    [timeZone, utcDate],
  )

  const dateLabel = useMemo(() => {
    const d = new Date(`${date}T${time}:00Z`)
    return new Intl.DateTimeFormat(uiLang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(d)
  }, [date, time, uiLang])

  const locationLabel = `${Math.abs(latitude).toFixed(1)}°${
    latitude >= 0 ? 'N' : 'S'
  } ${Math.abs(longitude).toFixed(1)}°${longitude >= 0 ? 'E' : 'W'}`

  const shareUrl = useMemo(
    () =>
      buildShareUrl({
        date,
        time,
        latitude,
        longitude,
        tiltCorrection,
        language: i18n.resolvedLanguage === 'zh' ? 'zh' : 'en',
      }),
    [date, i18n.resolvedLanguage, latitude, longitude, tiltCorrection, time],
  )

  const handleNow = () => {
    const now = wallTimeAt(new Date(), timeZone)
    setDateTime(now.date, now.time)
  }

  const panelProps = {
    date,
    time,
    lat: latitude,
    lon: longitude,
    tzLabel,
    locationSelected,
    onDate: setDate,
    onTime: setTime,
    onPick: setLocation,
    onNow: handleNow,
  }

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-space-black">
      <div className="absolute inset-0">
        <MoonScene
          view={view}
          tiltCorrection={tiltCorrection}
          retryKey={textureRetryKey}
          onBootstrapReady={handleBootstrapReady}
          onBootstrapError={handleBootstrapError}
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, transparent 38%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {!locationSelected && (
          <div className="pointer-events-none absolute left-1/2 top-[4.5rem] z-10 hidden -translate-x-1/2 animate-fadeIn md:block">
            <div className="panel flex items-center gap-2 whitespace-nowrap px-4 py-2 text-[11px] font-mono uppercase tracking-widest2 text-space-glow">
              <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-space-glow" />
              {t('controls.selectPrompt')}
            </div>
          </div>
        )}
      </div>

      {!loaderDone && (
        <LoadingScreen
          ready={sceneReady}
          error={sceneError}
          onRetry={handleTextureRetry}
          onDone={() => setLoaderDone(true)}
        />
      )}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-7">
        <div className="pointer-events-auto min-w-0">
          <h1 className="truncate text-base font-light tracking-[0.18em] text-white/90 md:text-lg md:tracking-[0.32em]">
            {t('app.title').toUpperCase()}
          </h1>
          <p className="mt-0.5 hidden text-[11px] font-light tracking-wide text-white/40 md:block">
            {t('app.tagline')}
          </p>
        </div>
        <div className="pointer-events-auto flex shrink-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={handleShareOpen}
            className="btn-line min-h-[36px] px-3 py-1.5 text-[10px] md:px-4 md:py-2 md:text-xs"
          >
            {t('share.button')}
          </button>
          <TextureQualitySelector />
          <LanguageSwitcher />
          <GitHubLink />
        </div>
      </header>

      {/* Mobile: bottom corners — controls + view follow (left), lunar data (right) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="pointer-events-auto flex min-w-0 max-w-[calc(50%-0.25rem)] flex-col gap-2">
          <ControlsPanel {...panelProps} expandUp />
          <ViewFollowToggle
            active={tiltCorrection}
            onToggle={() => setTiltCorrection(!tiltCorrection)}
          />
        </div>
        <div className="pointer-events-auto min-w-0 max-w-[calc(50%-0.25rem)]">
          <div className="max-h-[min(52dvh,calc(100dvh-11rem))] overflow-y-auto overscroll-contain">
            <MoonReadout view={view} expandUp locationSelected={locationSelected} />
          </div>
        </div>
      </div>

      {/* Desktop: view-follow toggle — moon viewport, bottom center */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 hidden justify-center px-4 pb-[env(safe-area-inset-bottom)] md:flex">
        <div className="pointer-events-auto">
          <ViewFollowToggle
            active={tiltCorrection}
            onToggle={() => setTiltCorrection(!tiltCorrection)}
          />
        </div>
      </div>

      {/* Desktop: left controls panel */}
      <div className="pointer-events-none absolute bottom-5 left-5 top-24 z-20 hidden max-w-[calc(100%-2.5rem)] flex-col justify-end md:flex">
        <div className="pointer-events-auto max-h-full overflow-y-auto overscroll-contain">
          <ControlsPanel {...panelProps} />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-5 z-20 hidden md:block">
        <div className="pointer-events-auto">
          <MoonReadout view={view} locationSelected={locationSelected} />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-1/2 hidden -translate-x-1/2 text-[9px] font-mono uppercase tracking-widest2 text-white/20 md:block">
        {t('footer.credit')}
      </div>

      {shareOpen && (
        <Suspense fallback={null}>
          <ShareDialog
            open
            onClose={handleShareClose}
            view={view}
            dateLabel={dateLabel}
            locationLabel={locationLabel}
            shareUrl={shareUrl}
          />
        </Suspense>
      )}
    </main>
  )
}
