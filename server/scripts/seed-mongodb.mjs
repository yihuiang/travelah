/**
 * Load cleaned merged-data.json into MongoDB (travelah.posts).
 *
 * Usage: npm run seed:mongodb
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mergedDataPath = path.resolve(__dirname, '../data/merged-data.json')

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const dbName = process.env.MONGODB_DB || 'travelah'

async function main() {
  if (!fs.existsSync(mergedDataPath)) {
    throw new Error(`Missing ${mergedDataPath}. Run: npm run import:trending`)
  }

  const posts = JSON.parse(fs.readFileSync(mergedDataPath, 'utf8'))
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection('posts')

    await collection.createIndex({ platform: 1, postId: 1 }, { unique: true })
    await collection.createIndex({ likesScore: -1 })
    await collection.createIndex({ state: 1 })

    const now = new Date()
    const ops = posts.map((post) => ({
      updateOne: {
        filter: { platform: post.platform, postId: post.id },
        update: {
          $set: {
            ...post,
            postId: post.id,
            translationStatus: post.translationStatus || 'pending',
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    }))

    const BATCH = 500
    let upserted = 0
    for (let i = 0; i < ops.length; i += BATCH) {
      const result = await collection.bulkWrite(ops.slice(i, i + BATCH), { ordered: false })
      upserted += result.upsertedCount + result.modifiedCount + result.matchedCount
    }

    const total = await collection.countDocuments()
    console.log(`Seeded ${posts.length} posts from merged-data.json`)
    console.log(`Database: ${dbName}  Collection: posts  Total documents: ${total}`)
    console.log(`URI: ${uri}`)
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
