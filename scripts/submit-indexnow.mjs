import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const key = '380cc7854312f11db235db202205bc74'
const host = 'lunaria.timeblind.xyz'
const keyLocation = `https://${host}/${key}.txt`
const sitemap = readFileSync(resolve(import.meta.dirname, '../public/sitemap.xml'), 'utf8')
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((match) => match[1])

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
})

if (!response.ok) {
  throw new Error(`IndexNow submission failed with HTTP ${response.status}`)
}

console.log(`IndexNow accepted ${urlList.length} URLs (HTTP ${response.status}).`)
