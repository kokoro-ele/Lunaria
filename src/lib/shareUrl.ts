export interface ShareableViewState {
  date: string
  time: string
  latitude: number
  longitude: number
  tiltCorrection: boolean
  language?: 'en' | 'zh'
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

function validDate(value: string): boolean {
  const match = DATE_RE.exec(value)
  if (!match) return false
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return (
    date.getUTCFullYear() === Number(match[1]) &&
    date.getUTCMonth() === Number(match[2]) - 1 &&
    date.getUTCDate() === Number(match[3])
  )
}

function finiteInRange(value: string | null, min: number, max: number): number | undefined {
  if (value === null || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined
}

export function parseShareState(search: string): Partial<ShareableViewState> {
  const params = new URLSearchParams(search)
  const state: Partial<ShareableViewState> = {}
  const date = params.get('date')
  const time = params.get('time')
  const latitude = finiteInRange(params.get('lat'), -90, 90)
  const longitude = finiteInRange(params.get('lon'), -180, 180)
  const view = params.get('view')
  const language = params.get('lang')

  if (date && validDate(date)) state.date = date
  if (time && TIME_RE.test(time)) state.time = time
  if (latitude !== undefined && longitude !== undefined) {
    state.latitude = latitude
    state.longitude = longitude
  }
  if (view === 'local' || view === 'free') state.tiltCorrection = view === 'local'
  if (language === 'en' || language === 'zh') state.language = language

  return state
}

export function buildShareUrl(
  state: ShareableViewState,
  currentUrl: string = window.location.href,
): string {
  const url = new URL(currentUrl)
  url.search = ''
  url.hash = ''
  url.searchParams.set('date', state.date)
  url.searchParams.set('time', state.time)
  url.searchParams.set('lat', state.latitude.toFixed(4))
  url.searchParams.set('lon', state.longitude.toFixed(4))
  url.searchParams.set('view', state.tiltCorrection ? 'local' : 'free')
  if (state.language) url.searchParams.set('lang', state.language)
  return url.toString()
}
