import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { translateText } from './translate.js'
import { connectDb, postsCollection, usersCollection, placesCollection } from './db.js'
import { authMiddleware, signToken } from './auth.js'
import {
  authenticateUser,
  createUser,
  findUserByUsername,
  toPublicUser,
} from './users.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mergedDataPath = path.resolve(__dirname, '../data/merged-data.json')
const placesDataPath = path.resolve(__dirname, '../data/places.json')
const localesPath = path.resolve(__dirname, '../data/trending-locales.json')
const TRENDING_SOURCE_LANG = 'zh-CN'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

function loadLocales() {
  try {
    return JSON.parse(fs.readFileSync(localesPath, 'utf8'))
  } catch {
    return {}
  }
}

function loadTrendingFromFile() {
  try {
    return JSON.parse(fs.readFileSync(mergedDataPath, 'utf8'))
  } catch {
    return []
  }
}

function applyLocale(item, lang, locales) {
  if (lang === TRENDING_SOURCE_LANG) return item

  const key = item.id || item.postId
  const localized = locales[key]?.[lang]
  if (localized) {
    return {
      ...item,
      title: localized.title ?? item.title,
      description: localized.description ?? item.description,
      category: localized.category ?? item.category,
      location: localized.location ?? item.location,
      likesLabel: localized.likesLabel ?? item.likesLabel,
    }
  }

  const i18n = item.i18n?.[lang]
  if (i18n) {
    return {
      ...item,
      title: i18n.title ?? item.title,
      description: i18n.description ?? item.description,
      category: i18n.category ?? item.category,
      location: i18n.location ?? item.location,
      likesLabel: i18n.likesLabel ?? item.likesLabel,
    }
  }

  return item
}

function stripMongoFields(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return { ...rest, id: rest.id || rest.postId }
}

function stripPlaceFields(doc) {
  if (!doc) return doc
  const { _id, extractSources, ...rest } = doc
  return { ...rest, id: _id }
}

function loadPlacesFromFile() {
  try {
    return JSON.parse(fs.readFileSync(placesDataPath, 'utf8'))
  } catch {
    return []
  }
}

async function loadPlaces({ limit, state, category }) {
  const query = {}
  if (state && state !== 'ALL STATES') query.state = state
  if (category && category !== 'ALL') query.categories = category

  try {
    const docs = await placesCollection()
      .find(query)
      .sort({ totalLikes: -1 })
      .limit(limit)
      .toArray()
    if (docs.length > 0) return docs.map(stripPlaceFields)
  } catch {
    // fall through
  }

  let places = loadPlacesFromFile()
  if (state && state !== 'ALL STATES') {
    places = places.filter((p) => p.state === state)
  }
  if (category && category !== 'ALL') {
    places = places.filter((p) => p.categories?.includes(category))
  }
  return places.slice(0, limit).map(stripPlaceFields)
}

async function loadPlaceById(id) {
  try {
    const doc = await placesCollection().findOne({ _id: id })
    if (doc) return stripPlaceFields(doc)
  } catch {
    // fall through
  }
  const place = loadPlacesFromFile().find((p) => p._id === id)
  return place ? stripPlaceFields(place) : null
}

async function loadPostsByIds(ids, lang) {
  if (!ids?.length) return []
  const locales = loadLocales()
  try {
    const docs = await postsCollection()
      .find({ $or: [{ postId: { $in: ids } }, { id: { $in: ids } }] })
      .toArray()
    const byId = new Map(docs.map((d) => [d.postId || d.id, stripMongoFields(d)]))
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean)
    if (ordered.length > 0) {
      return ordered.map((item) => applyLocale(item, lang, locales))
    }
  } catch {
    // fall through
  }
  const all = loadTrendingFromFile()
  const byId = new Map(all.map((p) => [p.id, p]))
  return ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((item) => applyLocale(item, lang, locales))
}

async function loadTrending(limit) {
  try {
    const docs = await postsCollection()
      .find({})
      .sort({ likesScore: -1 })
      .limit(limit)
      .toArray()
    if (docs.length > 0) return docs.map(stripMongoFields)
  } catch {
    // fall through to JSON file
  }
  return loadTrendingFromFile().slice(0, limit)
}

app.get('/api/health', async (_req, res) => {
  let mongo = false
  let postCount = 0
  let userCount = 0
  try {
    await connectDb()
    postCount = await postsCollection().countDocuments()
    userCount = await usersCollection().countDocuments()
    mongo = true
  } catch {
    mongo = false
  }
  res.json({
    status: 'ok',
    message: 'Travelah API is running',
    mongo,
    postCount,
    userCount,
  })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDb()
    const { username, password, email, displayName, avatarUrl, preferences, settings } = req.body
    if (!username?.trim() || !password) {
      return res.status(400).json({ error: 'username and password are required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' })
    }

    const user = await createUser({
      username,
      password,
      email,
      displayName,
      avatarUrl,
      preferences,
      settings,
    })
    const token = signToken({ userId: user.id, username: user.username })
    res.status(201).json({ user, token })
  } catch (error) {
    if (error.code === 'USERNAME_TAKEN' || error.code === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: error.message })
    }
    console.error(error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDb()
    const { username, password } = req.body
    if (!username?.trim() || !password) {
      return res.status(400).json({ error: 'username and password are required' })
    }

    const user = await authenticateUser(username, password)
    const token = signToken({ userId: user.id, username: user.username })
    res.json({ user, token })
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: error.message })
    }
    console.error(error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/profile/me', authMiddleware, async (req, res) => {
  try {
    await connectDb()
    const user = await findUserByUsername(req.auth.username)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(toPublicUser(user))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load profile' })
  }
})

app.get('/api/profile/:username', async (req, res) => {
  try {
    await connectDb()
    const user = await findUserByUsername(req.params.username)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(toPublicUser(user))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load profile' })
  }
})

app.get('/api/trending', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 3, 100)
    const lang = req.query.lang || TRENDING_SOURCE_LANG
    const items = await loadTrending(limit)
    const locales = loadLocales()

    const result = items.map((item) => applyLocale(item, lang, locales))
    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load trending' })
  }
})

app.get('/api/places', async (req, res) => {
  try {
    await connectDb()
    const limit = Math.min(parseInt(req.query.limit, 10) || 60, 200)
    const state = req.query.state || 'ALL STATES'
    const category = req.query.category || 'ALL'
    const places = await loadPlaces({ limit, state, category })
    res.json(places)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load places' })
  }
})

app.get('/api/places/:id/posts', async (req, res) => {
  try {
    await connectDb()
    const lang = req.query.lang || TRENDING_SOURCE_LANG
    const place = await loadPlaceById(req.params.id)
    if (!place) {
      return res.status(404).json({ error: 'Place not found' })
    }
    const posts = await loadPostsByIds(place.postIds, lang)
    res.json({ place, posts })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load place posts' })
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

async function start() {
  try {
    await connectDb()
    const count = await postsCollection().countDocuments()
    const userCount = await usersCollection().countDocuments()
    const placeCount = await placesCollection().countDocuments()
    console.log(`MongoDB connected — ${count} posts, ${placeCount} places, ${userCount} users`)
    if (count === 0) {
      console.log('No posts in MongoDB. Run: npm run seed:mongodb')
    }
    if (placeCount === 0) {
      console.log('No places in MongoDB. Run: python nlp/extract_places.py && npm run seed:places')
    }
    if (userCount === 0) {
      console.log('No users in MongoDB. Run: npm run seed:users')
    }
  } catch (err) {
    console.warn(`MongoDB unavailable (${err.message}). Using merged-data.json fallback.`)
  }

  const locales = loadLocales()
  const localeCount = Object.keys(locales).length
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    if (localeCount > 0) {
      console.log(`Pre-translated locales loaded (${localeCount} posts)`)
    }
  })
}

start()
