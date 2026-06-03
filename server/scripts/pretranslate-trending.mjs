/**
 * Pre-translate top trending posts (run once after import).
 * Usage: node scripts/pretranslate-trending.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { translateFields } from '../src/translate.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mergedDataPath = path.resolve(__dirname, '../data/merged-data.json')
const localesPath = path.resolve(__dirname, '../data/trending-locales.json')
const FIELDS = ['title', 'description', 'category', 'location', 'likesLabel']
const TARGET_LANGS = ['en', 'ms']
const TOP_N = 3
const SOURCE = 'zh-CN'

const items = JSON.parse(fs.readFileSync(mergedDataPath, 'utf8')).slice(0, TOP_N)
const locales = {}

console.log(`Pre-translating top ${items.length} posts to ${TARGET_LANGS.join(', ')}…`)
console.log('This runs slowly on purpose to avoid Google rate limits.\n')

for (const item of items) {
  const key = item.id || item.note_id
  if (!key) continue
  locales[key] = {}

  for (const lang of TARGET_LANGS) {
    console.log(`  [${lang}] ${item.title?.slice(0, 40)}…`)
    locales[key][lang] = await translateFields(
      {
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
      },
      FIELDS,
      lang,
      SOURCE,
    )
  }
}

fs.writeFileSync(localesPath, JSON.stringify(locales, null, 2), 'utf8')
console.log(`\nSaved → ${localesPath}`)
