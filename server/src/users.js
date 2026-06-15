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

export async function resolveUniqueUsername(preferred) {
  const base = (preferred || 'traveler').trim().toLowerCase().replace(/\W/g, '') || 'traveler'
  let candidate = base.slice(0, 30)
  let suffix = 0
  while (await findUserByUsername(candidate)) {
    suffix += 1
    candidate = `${base.slice(0, 24)}${suffix}`
  }
  return candidate
}

export async function createUser({ username, password, email, displayName, avatarUrl, preferences, settings }) {
  const normalizedUsername = await resolveUniqueUsername(username)

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
    preferences: preferences || { pace: [], focus: [], dining: [] },
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

export async function updateUserById(id, { preferences, settings, displayName, avatarUrl, email, currentPassword, newPassword }) {
  const user = await findUserById(id)
  if (!user) return null

  const $set = { updatedAt: new Date() }
  if (preferences) $set.preferences = preferences
  if (settings) $set.settings = settings
  if (displayName !== undefined && displayName !== null) {
    const trimmed = displayName.trim()
    if (!trimmed) {
      const err = new Error('Name cannot be empty')
      err.code = 'VALIDATION'
      throw err
    }
    $set.displayName = trimmed
  }
  if (avatarUrl !== undefined) $set.avatarUrl = avatarUrl

  if (email !== undefined) {
    const normalized = email?.trim().toLowerCase() || null
    if (normalized) {
      const existing = await findUserByEmail(normalized)
      if (existing && existing._id !== id) {
        const err = new Error('Email already registered')
        err.code = 'EMAIL_TAKEN'
        throw err
      }
    }
    $set.email = normalized
  }

  if (newPassword) {
    if (!currentPassword) {
      const err = new Error('Current password is required to set a new password')
      err.code = 'VALIDATION'
      throw err
    }
    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      const err = new Error('Current password is incorrect')
      err.code = 'INVALID_PASSWORD'
      throw err
    }
    if (newPassword.length < 8) {
      const err = new Error('New password must be at least 8 characters')
      err.code = 'VALIDATION'
      throw err
    }
    $set.passwordHash = await hashPassword(newPassword)
  }

  await usersCollection().updateOne({ _id: id }, { $set })
  const doc = await findUserById(id)
  return toPublicUser(doc)
}

export async function findUserByLogin(login) {
  const normalized = login.trim().toLowerCase()
  if (normalized.includes('@')) {
    return findUserByEmail(normalized)
  }
  return findUserByUsername(normalized)
}

export async function authenticateUser(login, password) {
  const user = await findUserByLogin(login)
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
