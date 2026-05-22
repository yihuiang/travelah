import fs from 'fs'
import path from 'path'
import { mergePosts } from './xhs-pipeline.mjs'
import { withSourceDisplay } from './platforms.mjs'

/**
 * Read every *.json in data/platforms/ and merge into one feed for the API.
 */
export function mergeAllPlatformFiles(platformsDir) {
  if (!fs.existsSync(platformsDir)) return []

  const files = fs
    .readdirSync(platformsDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(platformsDir, name))

  const all = []
  for (const file of files) {
    const items = JSON.parse(fs.readFileSync(file, 'utf8'))
    all.push(...items.map(withSourceDisplay))
  }

  return mergePosts(all)
}
