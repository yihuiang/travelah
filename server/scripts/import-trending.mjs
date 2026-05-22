/**
 * RedNote (XHS) pipeline: CSV → clean → platforms/xhs.json → trending.json
 *
 * CSV is the raw crawl export (easy for MediaCrawler).
 * JSON is what the Node API and React app read (fast, one file load).
 *
 * Many CSV batches (malaysia, penang, …) are cleaned and merged into ONE
 * platform file: data/platforms/xhs.json
 *
 * data/trending.json = all platforms combined (xhs + dy + … when you add them).
 *
 * Usage:
 *   npm run import:trending
 *   node scripts/import-trending.mjs path/to/extra.csv
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'
import { mergePosts, cleanPost, normalizeRow } from './lib/xhs-pipeline.mjs'
import { withSourceDisplay } from './lib/platforms.mjs'
import { mergeAllPlatformFiles } from './lib/merge-platforms.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLATFORM = 'xhs'
const mediaCrawlerCsv = path.resolve(__dirname, '../../../MediaCrawler/data/xhs/csv')
const platformsDir = path.resolve(__dirname, '../data/platforms')
const platformOutPath = path.join(platformsDir, 'xhs.json')
const trendingPath = path.resolve(__dirname, '../data/trending.json')
const statsPath = path.resolve(__dirname, '../data/import-stats.json')

const DEFAULT_BATCHES = [
  { file: path.join(mediaCrawlerCsv, 'malaysia_contents_xhs.csv'), label: 'malaysia' },
  { file: path.join(mediaCrawlerCsv, 'penang_contents_xhs.csv'), label: 'penang' },
]

function loadCsv(filePath, batchLabel) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV not found: ${filePath}`)
  }
  const rows = parse(fs.readFileSync(filePath, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  })
  return rows.map((row, index) => normalizeRow(row, index, { batchLabel }))
}

function runBatch(filePath, batchLabel) {
  const normalized = loadCsv(filePath, batchLabel)
  const kept = []
  const dropped = {}

  for (const post of normalized) {
    const result = cleanPost(post)
    if (result.ok) {
      kept.push(withSourceDisplay(post))
    } else {
      dropped[result.reason] = (dropped[result.reason] || 0) + 1
    }
  }

  return { batchLabel, filePath, raw: normalized.length, kept, dropped }
}

function main() {
  const cliFiles = process.argv.slice(2).map((p) => path.resolve(p))
  const batches =
    cliFiles.length > 0
      ? cliFiles.map((file, i) => ({ file, label: `batch-${i + 1}` }))
      : DEFAULT_BATCHES

  const batchReports = []
  const allKept = []

  for (const { file, label } of batches) {
    const report = runBatch(file, label)
    batchReports.push(report)
    allKept.push(...report.kept)
    console.log(
      `[${label}] ${path.basename(file)}: ${report.raw} rows → ${report.kept.length} kept`,
    )
    if (Object.keys(report.dropped).length) {
      console.log(`  dropped:`, report.dropped)
    }
  }

  const platformMerged = mergePosts(allKept)
  const duplicateInBatches = allKept.length - platformMerged.length

  fs.mkdirSync(platformsDir, { recursive: true })
  fs.writeFileSync(platformOutPath, JSON.stringify(platformMerged, null, 2), 'utf8')
  console.log(`\nRedNote (${PLATFORM}): ${allKept.length} → ${platformMerged.length} unique`)
  console.log(`Wrote ${platformOutPath}`)

  const trending = mergeAllPlatformFiles(platformsDir)
  fs.writeFileSync(trendingPath, JSON.stringify(trending, null, 2), 'utf8')
  console.log(`Combined feed: ${trending.length} posts from all platforms → ${trendingPath}`)

  const stats = {
    importedAt: new Date().toISOString(),
    platform: PLATFORM,
    batches: batchReports,
    totalAfterClean: allKept.length,
    duplicatesRemovedInPlatform: duplicateInBatches,
    platformCount: platformMerged.length,
    combinedTrendingCount: trending.length,
    platformFiles: fs.readdirSync(platformsDir).filter((f) => f.endsWith('.json')),
  }
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8')
  console.log(`Stats ${statsPath}`)
  console.log('\nNext: npm run pretranslate')
  console.log('Add more CSV paths to DEFAULT_BATCHES in import-trending.mjs, or pass files on the CLI.')
}

main()
