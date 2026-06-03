/**
 * Load places.json into MongoDB (travelah.places).
 *
 * Usage: npm run seed:places
 * Prerequisite: python nlp/extract_places.py
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const placesPath = path.resolve(__dirname, '../data/places.json')

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const dbName = process.env.MONGODB_DB || 'travelah'

async function main() {
  if (!fs.existsSync(placesPath)) {
    throw new Error(`Missing ${placesPath}. Run: cd nlp && python extract_places.py`)
  }

  const places = JSON.parse(fs.readFileSync(placesPath, 'utf8'))
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const collection = client.db(dbName).collection('places')

    await collection.createIndex({ totalLikes: -1 })
    await collection.createIndex({ state: 1 })
    await collection.createIndex({ name: 1 })

    await collection.deleteMany({})

    const now = new Date()
    const ops = places.map((place) => ({
      replaceOne: {
        filter: { _id: place._id },
        replacement: {
          ...place,
          updatedAt: now,
          createdAt: place.createdAt || now,
        },
        upsert: true,
      },
    }))

    const BATCH = 500
    for (let i = 0; i < ops.length; i += BATCH) {
      await collection.bulkWrite(ops.slice(i, i + BATCH), { ordered: false })
    }

    const total = await collection.countDocuments()
    console.log(`Seeded ${places.length} places from places.json`)
    console.log(`Database: ${dbName}  Collection: places  Total documents: ${total}`)
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
