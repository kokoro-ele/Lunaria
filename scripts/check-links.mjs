import { existsSync, globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const pages = globSync(['index.html', 'about.html', 'en/**/*.html', 'zh/**/*.html'], {
  cwd: root,
})
const failures = []

function targetFor(pathname) {
  const cleanPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!cleanPath) return resolve(root, 'index.html')

  const pageTarget = cleanPath.endsWith('.html')
    ? resolve(root, cleanPath)
    : resolve(root, cleanPath, 'index.html')
  if (existsSync(pageTarget)) return pageTarget

  return resolve(root, 'public', cleanPath)
}

for (const page of pages) {
  const html = readFileSync(resolve(root, page), 'utf8')
  const localLinks = [...html.matchAll(/href="%BASE_URL%([^"#?]*)[^\"]*"/g)]

  for (const [, pathname] of localLinks) {
    if (!existsSync(targetFor(pathname))) {
      failures.push(`${page}: unresolved link %BASE_URL%${pathname}`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Internal link checks passed for ${pages.length} HTML pages.`)
