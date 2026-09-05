import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const pages = [
  ['index.html', 'https://lunaria.timeblind.xyz/'],
  ['about.html', 'https://lunaria.timeblind.xyz/about.html'],
  ['en/index.html', 'https://lunaria.timeblind.xyz/en/'],
  ['zh/index.html', 'https://lunaria.timeblind.xyz/zh/'],
  ['en/moon-phase-today/index.html', 'https://lunaria.timeblind.xyz/en/moon-phase-today/'],
  ['zh/today-moon/index.html', 'https://lunaria.timeblind.xyz/zh/today-moon/'],
  ['en/moon-phase-calendar-2026/index.html', 'https://lunaria.timeblind.xyz/en/moon-phase-calendar-2026/'],
  ['zh/2026-moon-calendar/index.html', 'https://lunaria.timeblind.xyz/zh/2026-moon-calendar/'],
  ['en/moon-phase-calendar-2027/index.html', 'https://lunaria.timeblind.xyz/en/moon-phase-calendar-2027/'],
  ['zh/2027-moon-calendar/index.html', 'https://lunaria.timeblind.xyz/zh/2027-moon-calendar/'],
  ['en/moon-on-birthday/index.html', 'https://lunaria.timeblind.xyz/en/moon-on-birthday/'],
  ['zh/moon-on-birthday/index.html', 'https://lunaria.timeblind.xyz/zh/moon-on-birthday/'],
  ['en/guides/lunar-libration/index.html', 'https://lunaria.timeblind.xyz/en/guides/lunar-libration/'],
  ['zh/guides/lunar-libration/index.html', 'https://lunaria.timeblind.xyz/zh/guides/lunar-libration/'],
]
const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8')
const failures = []

for (const [file, canonical] of pages) {
  const html = readFileSync(resolve(root, file), 'utf8')
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim()
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"\s*\/>/)?.[1]
  const pageCanonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/>/)?.[1]
  const jsonLdBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)]

  if (!title || title.length > 65) failures.push(`${file}: missing or overlong title`)
  if (!description || description.length < 50 || description.length > 180) {
    failures.push(`${file}: description should contain 50–180 characters`)
  }
  if (pageCanonical !== canonical) failures.push(`${file}: canonical mismatch`)
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) failures.push(`${file}: missing from sitemap`)
  if (!html.includes('hreflang="en"') || !html.includes('hreflang="zh-CN"')) {
    failures.push(`${file}: incomplete language alternates`)
  }
  if (jsonLdBlocks.length === 0) failures.push(`${file}: missing JSON-LD`)
  for (const [, json] of jsonLdBlocks) {
    try {
      JSON.parse(json)
    } catch {
      failures.push(`${file}: invalid JSON-LD`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`SEO checks passed for ${pages.length} indexable pages.`)
