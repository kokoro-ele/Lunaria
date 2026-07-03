import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage === 'zh' ? 'zh' : 'en'

  return (
    <div className="flex items-center gap-px border border-space-line">
      {LANGS.map((l) => {
        const active = current === l.code
        return (
          <button
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            className={`px-3 py-1.5 text-xs font-mono tracking-[0.18em] transition-colors ${
              active ? 'text-white bg-white/[0.06]' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
