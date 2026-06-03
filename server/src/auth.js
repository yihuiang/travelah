import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'travelah-dev-secret-change-in-production'

export function signToken({ userId, username }) {
  return jwt.sign({ userId, username }, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Authorization required' })
  }
  try {
    req.auth = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
