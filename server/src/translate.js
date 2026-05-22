import { translate } from '@vitalets/google-translate-api'

const cache = new Map()
const queue = []
let processing = false
const DELAY_MS = 350

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function processQueue() {
  if (processing) return
  processing = true
  while (queue.length > 0) {
    const { text, to, from, resolve, reject } = queue.shift()
    const cacheKey = `${from}|${to}|${text}`
    try {
      if (cache.has(cacheKey)) {
        resolve(cache.get(cacheKey))
      } else {
        const { text: translated } = await translate(text, { from, to })
        cache.set(cacheKey, translated)
        resolve(translated)
        await sleep(DELAY_MS)
      }
    } catch (error) {
      console.error('Translation failed:', error.message)
      resolve(text)
    }
  }
  processing = false
}

export function translateText(text, to, from = 'auto') {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return Promise.resolve(text)
  if (from !== 'auto' && from === to) return Promise.resolve(text)

  const cacheKey = `${from}|${to}|${trimmed}`
  if (cache.has(cacheKey)) return Promise.resolve(cache.get(cacheKey))

  return new Promise((resolve, reject) => {
    queue.push({ text: trimmed, to, from, resolve, reject })
    processQueue()
  })
}

export async function translateFields(item, fields, to, from = 'zh-CN') {
  if (to === from) return item

  const result = { ...item }
  for (const field of fields) {
    if (item[field]) {
      result[field] = await translateText(item[field], to, from)
    }
  }
  return result
}

export async function translateBatch(texts, to, from = 'auto') {
  const results = []
  for (const text of texts) {
    results.push(await translateText(text, to, from))
  }
  return results
}
