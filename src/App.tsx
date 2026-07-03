import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from './store'
import { computeMoonView } from './lib/astronomy'
import { localWallTimeToUtc, timezoneFor, offsetLabel } from './lib/timezone'
import MoonScene from './components/MoonScene'
import ControlsPanel from './components/ControlsPanel'
import MoonReadout from './components/MoonReadout'
import ShareDialog from './components/ShareDialog'
import LanguageSwitcher from './components/LanguageSwitcher'
import GitHubLink from './components/GitHubLink'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function App() {
  const { t, i18n } = useTranslation()
  const {
    date,
    time,
    latitude,
    longitude,
    locationSelected,
    hiRes,
    tiltCorrection,
    setDate,
    setTime,
    setLocation,
    setHiRes,
    setTiltCorrection,
  } = useStore()
  const [shareOpen, setShareOpen] = useState(false)

  const uiLang = i18n.resolvedLanguage === 'zh' ? 'zh-CN' : 'en-US'

  // Keep the document language in sync so native date/time pickers localise.
  useEffect(() => {
    document.documentElement.lang = uiLang
  }, [uiLang])

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

  const handleNow = () => {
    const now = new Date()
    setDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`)
    setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-space-black">
      {/* Moon scene fills the viewport */}
      <div className="absolute inset-0">
        <MoonScene view={view} hiRes={hiRes} tiltCorrection={tiltCorrection} />
      </div>

      {/* subtle vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* Prompt to choose a location on first load */}
      {!locationSelected && (
        <div className="pointer-events-none absolute left-1/2 top-[4.5rem] z-10 -translate-x-1/2 animate-fadeIn px-4">
          <div className="panel flex items-center gap-2 whitespace-nowrap px-4 py-2 text-[11px] font-mono uppercase tracking-widest2 text-space-glow">
            <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-space-glow" />
            {t('controls.selectPrompt')}
          </div>
        </div>
      )}

      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
        <div className="pointer-events-auto">
          <h1 className="text-lg font-light tracking-[0.32em] text-white/90">
            {t('app.title').toUpperCase()}
          </h1>
          <p className="mt-1 text-[11px] font-light tracking-wide text-white/40">
            {t('app.tagline')}
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <button onClick={() => setShareOpen(true)} className="btn-line">
            {t('share.button')}
          </button>
          <LanguageSwitcher />
          <GitHubLink />
        </div>
      </header>

      {/* Left controls */}
      <div className="absolute bottom-5 left-5 top-24 hidden flex-col justify-end md:flex">
        <ControlsPanel
          date={date}
          time={time}
          lat={latitude}
          lon={longitude}
          tzLabel={tzLabel}
          hiRes={hiRes}
          tiltCorrection={tiltCorrection}
          locationSelected={locationSelected}
          onDate={setDate}
          onTime={setTime}
          onPick={setLocation}
          onNow={handleNow}
          onHiRes={setHiRes}
          onTiltCorrection={setTiltCorrection}
        />
      </div>

      {/* Right readout */}
      <div className="absolute bottom-5 right-5 hidden md:block">
        <MoonReadout view={view} />
      </div>

      {/* Mobile: stacked panels */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-[62vh] flex-col gap-3 overflow-auto p-4 md:hidden">
        <MoonReadout view={view} />
        <ControlsPanel
          date={date}
          time={time}
          lat={latitude}
          lon={longitude}
          tzLabel={tzLabel}
          hiRes={hiRes}
          tiltCorrection={tiltCorrection}
          locationSelected={locationSelected}
          onDate={setDate}
          onTime={setTime}
          onPick={setLocation}
          onNow={handleNow}
          onHiRes={setHiRes}
          onTiltCorrection={setTiltCorrection}
        />
      </div>

      {/* Footer credit */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 hidden -translate-x-1/2 text-[9px] font-mono uppercase tracking-widest2 text-white/20 md:block">
        {t('footer.credit')}
      </div>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        view={view}
        dateLabel={dateLabel}
        locationLabel={locationLabel}
      />
    </div>
  )
}
