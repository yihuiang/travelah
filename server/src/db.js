import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const dbName = process.env.MONGODB_DB || 'travelah'

let client
let db

export async function connectDb() {
  if (db) return db
  client = new MongoClient(uri)
  await client.connect()
  db = client.db(dbName)
  return db
}

export function getDb() {
  if (!db) throw new Error('Database not connected. Call connectDb() first.')
  return db
}

export async function closeDb() {
  if (client) {
    await client.close()
    client = undefined
    db = undefined
  }
}

export function postsCollection() {
  return getDb().collection('posts')
}

export function usersCollection() {
  return getDb().collection('users')
}

export function placesCollection() {
  return getDb().collection('places')
}
