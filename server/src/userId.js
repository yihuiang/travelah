import { usersCollection } from './db.js'

const USER_ID_PATTERN = /^U(\d+)$/

/** Next ID: U01, U02, … U99, U100 (stored as MongoDB _id) */
export async function allocateUserId() {
  const docs = await usersCollection()
    .find({ _id: { $type: 'string', $regex: /^U\d+$/ } })
    .project({ _id: 1 })
    .toArray()

  let max = 0
  for (const doc of docs) {
    const match = USER_ID_PATTERN.exec(String(doc._id))
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > max) max = n
    }
  }

  const next = max + 1
  return next < 100 ? `U${String(next).padStart(2, '0')}` : `U${next}`
}

export function isValidUserId(userId) {
  return USER_ID_PATTERN.test(userId)
}
