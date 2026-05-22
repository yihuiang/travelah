import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { translateText } from './translate.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const trendingPath = path.resolve(__dirname, '../data/trending.json')
const localesPath = path.resolve(__dirname, '../data/trending-locales.json')
const TRENDING_SOURCE_LANG = 'zh-CN'
const TRENDING_FIELDS = ['title', 'description', 'category', 'location', 'likesLabel']

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

function loadTrending() {
  try {
    return JSON.parse(fs.readFileSync(trendingPath, 'utf8'))
  } catch {
    return []
  }
}

function loadLocales() {
  try {
    return JSON.parse(fs.readFileSync(localesPath, 'utf8'))
  } catch {
    return {}
  }
}

function applyLocale(item, lang, locales) {
  if (lang === TRENDING_SOURCE_LANG) return item

  const key = item.id || item.note_id
  const localized = locales[key]?.[lang]
  if (!localized) return null

  return {
    ...item,
    title: localized.title ?? item.title,
    description: localized.description ?? item.description,
    category: localized.category ?? item.category,
    location: localized.location ?? item.location,
    likesLabel: localized.likesLabel ?? item.likesLabel,
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Travelah API is running' })
})

app.get('/api/trending', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 3, 100)
    const lang = req.query.lang || TRENDING_SOURCE_LANG
    const items = loadTrending().slice(0, limit)
    const locales = loadLocales()

    if (lang === TRENDING_SOURCE_LANG) {
      return res.json(items)
    }

    const result = items.map((item) => applyLocale(item, lang, locales) ?? item)
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load trending' })
  }
})

app.post('/api/translate', async (req, res) => {
  try {
    const { text, to, from = 'auto' } = req.body
    if (!text || !to) {
      return res.status(400).json({ error: 'text and to are required' })
    }
    const translatedText = await translateText(text, to, from)
    res.json({ translatedText })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Translation failed' })
  }
})

app.get('/api/destinations', (_req, res) => {
  res.json([
    {
      id: 1,
      name: 'Kuala Lumpur',
      country: 'Malaysia',
      description: 'Vibrant capital with iconic Petronas Towers and rich street food.',
      image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
    },
  ])
})

app.listen(PORT, () => {
  const locales = loadLocales()
  const count = Object.keys(locales).length
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(
    count > 0
      ? `Pre-translated locales loaded (${count} posts)`
      : 'No trending-locales.json — run: node scripts/pretranslate-trending.mjs',
  )
})
