import * as Astronomy from 'astronomy-engine'
import { phaseKeyFromEcliptic, type PhaseKey } from './lib/astronomy'

type Language = 'en' | 'zh'

const labels: Record<Language, Record<PhaseKey, string>> = {
  en: {
    new: 'New Moon',
    waxingCrescent: 'Waxing Crescent',
    firstQuarter: 'First Quarter',
    waxingGibbous: 'Waxing Gibbous',
    full: 'Full Moon',
    waningGibbous: 'Waning Gibbous',
    lastQuarter: 'Last Quarter',
    waningCrescent: 'Waning Crescent',
  },
  zh: {
    new: '新月',
    waxingCrescent: '娥眉月（盈）',
    firstQuarter: '上弦月',
    waxingGibbous: '盈凸月',
    full: '满月',
    waningGibbous: '亏凸月',
    lastQuarter: '下弦月',
    waningCrescent: '残月（亏）',
  },
}

function setText(id: string, value: string) {
  const element = document.getElementById(id)
  if (element) element.textContent = value
}

function formatMoment(date: Date, language: Language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const language: Language = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en'
const now = new Date()
const phaseAngle = Astronomy.MoonPhase(now)
const phaseKey = phaseKeyFromEcliptic(phaseAngle)
const illumination = Astronomy.Illumination(Astronomy.Body.Moon, now).phase_fraction
const previousNewMoon = Astronomy.SearchMoonPhase(0, now, -40)
const nextFullMoon = Astronomy.SearchMoonPhase(180, new Date(now.getTime() + 60_000), 40)
const nextNewMoon = Astronomy.SearchMoonPhase(0, new Date(now.getTime() + 60_000), 40)
const ageDays = previousNewMoon
  ? (now.getTime() - previousNewMoon.date.getTime()) / 86_400_000
  : (phaseAngle / 360) * 29.530588

setText('current-phase', labels[language][phaseKey])
setText('current-illumination', `${(illumination * 100).toFixed(1)}%`)
setText('current-age', language === 'zh' ? `${ageDays.toFixed(1)} 天` : `${ageDays.toFixed(1)} days`)
setText('current-time', formatMoment(now, language))
setText('next-full', nextFullMoon ? formatMoment(nextFullMoon.date, language) : '—')
setText('next-new', nextNewMoon ? formatMoment(nextNewMoon.date, language) : '—')

const status = document.getElementById('today-status')
if (status) {
  status.textContent =
    language === 'zh'
      ? `此刻的月相是${labels.zh[phaseKey]}，月面约有 ${(illumination * 100).toFixed(1)}% 被太阳照亮。`
      : `The Moon is ${labels.en[phaseKey].toLowerCase()} right now, with ${(illumination * 100).toFixed(1)}% of its visible disk illuminated.`
}

const viewerLink = document.getElementById('today-viewer-link') as HTMLAnchorElement | null
if (viewerLink) {
  const viewerUrl = new URL(import.meta.env.BASE_URL, window.location.origin)
  const localDate = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0')))
    .join('-')
  const localTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  viewerUrl.searchParams.set('date', localDate)
  viewerUrl.searchParams.set('time', localTime)
  viewerUrl.searchParams.set('view', 'local')
  viewerUrl.searchParams.set('lang', language)
  viewerLink.href = viewerUrl.toString()
}
