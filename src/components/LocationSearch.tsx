import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { locationDescription, searchLocations, type LocationResult } from '../lib/locationSearch'

interface Props {
  lat: number
  lon: number
  onPick: (lat: number, lon: number) => void
}

export default function LocationSearch({ lat, lon, onPick }: Props) {
  const { t, i18n } = useTranslation()
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [composing, setComposing] = useState(false)
  const [results, setResults] = useState<LocationResult[]>([])
  const [active, setActive] = useState(-1)
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0, maxHeight: 280 })
  const language = i18n.resolvedLanguage === 'zh' ? 'zh' : 'en'
  const visible = open && !composing && Array.from(query.trim()).length >= 2

  useEffect(() => { setOpen(false) }, [lat, lon])

  useEffect(() => {
    if (!visible) return
    const controller = new AbortController()
    let timeout: number | undefined
    setResults([])
    setActive(-1)
    setStatus('loading')
    const debounce = window.setTimeout(async () => {
      timeout = window.setTimeout(() => {
        controller.abort()
        setStatus('error')
      }, 10000)
      try {
        const places = await searchLocations(query, language, controller.signal)
        if (!controller.signal.aborted) {
          setResults(places)
          setStatus('done')
        }
      } catch {
        if (!controller.signal.aborted) setStatus('error')
      } finally {
        window.clearTimeout(timeout)
      }
    }, 350)
    return () => {
      controller.abort()
      window.clearTimeout(debounce)
      window.clearTimeout(timeout)
    }
  }, [query, language, visible])

  // Render outside the scrolling controls so the floating results are never clipped.
  useLayoutEffect(() => {
    if (!visible) return
    const update = () => {
      const rect = inputRef.current?.getBoundingClientRect()
      if (!rect) return
      const viewport = window.visualViewport
      const leftEdge = viewport?.offsetLeft ?? 0
      const topEdge = viewport?.offsetTop ?? 0
      const width = Math.min(Math.max(rect.width, 260), (viewport?.width ?? window.innerWidth) - 24)
      const bottom = topEdge + (viewport?.height ?? window.innerHeight)
      const below = bottom - rect.bottom - 16
      const above = rect.top - topEdge - 16
      const upwards = below < 180 && above > below
      const maxHeight = Math.max(60, Math.min(280, upwards ? above : below))
      setPosition({
        left: Math.max(leftEdge + 12, Math.min(rect.left, leftEdge + (viewport?.width ?? window.innerWidth) - width - 12)),
        top: upwards ? rect.top - maxHeight - 6 : rect.bottom + 6,
        width,
        maxHeight,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    const observer = new ResizeObserver(update)
    if (inputRef.current) observer.observe(inputRef.current)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const dismiss = (event: Event) => {
      const target = event.target as Node
      if (!inputRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('focusin', dismiss)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('focusin', dismiss)
    }
  }, [visible])

  function choose(place: LocationResult) {
    setOpen(false)
    setQuery(place.name)
    onPick(place.latitude, place.longitude)
    inputRef.current?.focus()
    setOpen(false)
  }

  return (
    <div className="mb-3">
      <label htmlFor={id} className="sr-only">{t('controls.searchLocation')}</label>
      <div className="relative">
        <svg aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" />
        </svg>
        <input
          ref={inputRef}
          id={id}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={visible ? `${id}-results` : undefined}
          aria-activedescendant={visible && active >= 0 ? `${id}-option-${active}` : undefined}
          autoComplete="off"
          maxLength={120}
          placeholder={t('controls.searchPlaceholder')}
          value={query}
          onFocus={() => setOpen(true)}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          onChange={(event) => {
            setQuery(event.target.value)
            setResults([])
            setActive(-1)
            setStatus('loading')
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || composing) return
            if (event.key === 'Escape') { setOpen(false); return }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              setOpen(true)
              const next = results.length ? (active + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length : -1
              setActive(next)
              document.getElementById(`${id}-option-${next}`)?.scrollIntoView({ block: 'nearest' })
            }
            if (event.key === 'Enter') {
              event.preventDefault()
              if (visible && results[active]) choose(results[active])
            }
          }}
          className="field w-full min-w-0 pl-8 pr-2 text-base md:text-sm"
        />
      </div>
      {visible && createPortal(
        <div ref={popupRef} style={position} className="fixed z-[100] overflow-y-auto overscroll-contain border border-space-line bg-[#0b101b] shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
          onKeyDown={(event) => { if (event.key === 'Escape') { inputRef.current?.focus(); setOpen(false) } }}>
          <div role="status" className="px-3 py-2 text-xs leading-relaxed text-white/60">
            {status === 'loading' && t('controls.searching')}
            {status === 'error' && t('controls.searchError')}
            {status === 'done' && (results.length ? t('controls.searchResults', { count: results.length }) : t('controls.searchEmpty'))}
          </div>
          <ul id={`${id}-results`} role="listbox" aria-label={t('controls.searchLocation')}>
            {results.map((place, index) => (
              <li key={place.id} id={`${id}-option-${index}`} role="option" aria-selected={active === index}
                className={`cursor-pointer px-3 py-2.5 text-sm text-white/90 hover:bg-white/10 ${active === index ? 'bg-white/10' : ''}`}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(place)}>
                <span className="block">{place.name}</span>
                <span className="block text-xs text-white/50">{locationDescription(place)}</span>
                {results.some((other) => other.id !== place.id && other.name === place.name && locationDescription(other) === locationDescription(place)) && (
                  <span className="block font-mono text-[10px] text-white/40">
                    {Math.abs(place.latitude).toFixed(4)}°{place.latitude >= 0 ? 'N' : 'S'} · {Math.abs(place.longitude).toFixed(4)}°{place.longitude >= 0 ? 'E' : 'W'}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="border-t border-space-line px-3 py-2 text-[9px] text-white/40">
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline hover:text-white/70">Open-Meteo</a>
            {' / '}
            <a href="https://www.geonames.org/" target="_blank" rel="noreferrer" className="underline hover:text-white/70">GeoNames</a>
          </p>
        </div>, document.body,
      )}
    </div>
  )
}
