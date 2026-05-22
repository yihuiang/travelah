import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultCsv = path.resolve(
  __dirname,
  '../../../FYP_Project/MediaCrawler/data/xhs/csv/search_contents_2026-05-16_xhs_01test.csv',
)
const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultCsv
const outPath = path.resolve(__dirname, '../data/trending.json')

function parseLikes(value) {
  if (!value) return 0
  const raw = String(value).trim().replace(/,/g, '')
  const match = raw.match(/^([\d.]+)\s*万/)
  if (match) return Math.round(parseFloat(match[1]) * 10000)
  const num = parseInt(raw.replace(/\D/g, ''), 10)
  return Number.isNaN(num) ? 0 : num
}

function cleanDesc(text) {
  if (!text) return ''
  const cleaned = text
    .replace(/#[^#\s\n\[]+(\[话题\])?#?/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (cleaned.length < 8) return ''
  return cleaned.slice(0, 180)
}

function firstImage(imageList) {
  if (!imageList) return ''
  const url = imageList.split(/[,;]/)[0]?.trim()
  return url || ''
}

function firstTag(tagList, sourceKeyword) {
  if (tagList) {
    const tag = tagList.split(',')[0]?.trim()
    if (tag) return tag
  }
  return sourceKeyword || 'Malaysia'
}

function formatLikes(value) {
  if (!value) return 'Trending'
  const raw = String(value).trim()
  if (raw.includes('万')) return `🔥 ${raw} likes`
  return `🔥 ${raw} likes`
}

const csvText = fs.readFileSync(csvPath, 'utf8')
const rows = parse(csvText, {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true,
})

function rowNoteId(row, index) {
  const id = row.note_id || row['\ufeffnote_id']
  return id?.trim() || `row-${index}`
}

const trending = rows
  .map((row, index) => ({
    id: rowNoteId(row, index),
    title: (row.title || 'Untitled').trim(),
    description: cleanDesc(row.desc) || (row.title || '').trim(),
    image: firstImage(row.image_list),
    location: row.ip_location?.trim() || row.source_keyword?.trim() || 'Malaysia',
    category: firstTag(row.tag_list, row.source_keyword),
    likes: row.liked_count || '',
    likesScore: parseLikes(row.liked_count),
    likesLabel: formatLikes(row.liked_count),
    comments: row.comment_count || '',
    shares: row.share_count || '',
    author: row.nickname || '',
    noteUrl: row.note_url || '',
    type: row.type || 'normal',
  }))
  .filter((item) => item.image && item.title)
  .sort((a, b) => b.likesScore - a.likesScore)

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(trending, null, 2), 'utf8')
console.log(`Imported ${trending.length} items → ${outPath}`)
