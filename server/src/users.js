import bcrypt from 'bcryptjs'
import { usersCollection } from './db.js'
import { allocateUserId } from './userId.js'

const SALT_ROUNDS = 10

export function toPublicUser(doc) {
  if (!doc) return null
  const { passwordHash, _id, userId: _legacyUserId, ...rest } = doc
  const id = typeof _id === 'string' ? _id : _id?.toString()
  return {
    id,
    username: rest.username,
    email: rest.email,
    displayName: rest.displayName,
    avatarUrl: rest.avatarUrl,
    memberSince: rest.memberSince || rest.createdAt,
    preferences: rest.preferences || {},
    settings: rest.settings || {},
    savedItineraries: rest.savedItineraries || [],
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
  }
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain, passwordHash) {
  return bcrypt.compare(plain, passwordHash)
}

export async function findUserByUsername(username) {
  return usersCollection().findOne({ username: username.toLowerCase() })
}

export async function findUserByEmail(email) {
  return usersCollection().findOne({ email: email.toLowerCase() })
}

export async function createUser({ username, password, email, displayName, avatarUrl, preferences, settings }) {
  const normalizedUsername = username.trim().toLowerCase()
  const existing = await findUserByUsername(normalizedUsername)
  if (existing) {
    const err = new Error('Username already taken')
    err.code = 'USERNAME_TAKEN'
    throw err
  }

  if (email) {
    const emailTaken = await findUserByEmail(email)
    if (emailTaken) {
      const err = new Error('Email already registered')
      err.code = 'EMAIL_TAKEN'
      throw err
    }
  }

  const now = new Date()
  const id = await allocateUserId()
  const doc = {
    _id: id,
    username: normalizedUsername,
    email: email?.trim().toLowerCase() || null,
    passwordHash: await hashPassword(password),
    displayName: displayName?.trim() || normalizedUsername,
    avatarUrl: avatarUrl || null,
    memberSince: now,
    preferences: preferences || { pace: '', focus: '', dining: '' },
    settings: settings || { language: 'en-GB', currency: 'MYR' },
    savedItineraries: [],
    createdAt: now,
    updatedAt: now,
  }

  await usersCollection().insertOne(doc)
  return toPublicUser(doc)
}

export async function findUserById(id) {
  return usersCollection().findOne({ _id: id })
}

export async function authenticateUser(username, password) {
  const user = await findUserByUsername(username)
  if (!user) {
    const err = new Error('Invalid username or password')
    err.code = 'INVALID_CREDENTIALS'
    throw err
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    const err = new Error('Invalid username or password')
    err.code = 'INVALID_CREDENTIALS'
    throw err
  }

  return toPublicUser(user)
}
