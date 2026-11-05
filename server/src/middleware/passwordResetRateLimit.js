const crypto = require('node:crypto')

const requestWindows = new Map()
const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = 3
const MAX_TRACKED_EMAILS = 10000

const getRateLimitKey = (email) => crypto
  .createHash('sha256')
  .update(String(email || '').trim().toLowerCase())
  .digest('hex')

const passwordResetRateLimit = (req, res, next) => {
  const key = getRateLimitKey(req.body?.email)
  const now = Date.now()
  let window = requestWindows.get(key)

  if (!window || now - window.startedAt >= WINDOW_MS) {
    window = { startedAt: now, count: 0 }
  }

  if (window.count >= MAX_REQUESTS) {
    res.set('Retry-After', String(Math.ceil((WINDOW_MS - (now - window.startedAt)) / 1000)))
    return res.status(429).json({
      message: 'Please wait before requesting another password reset email.'
    })
  }

  window.count += 1
  requestWindows.set(key, window)

  if (requestWindows.size > MAX_TRACKED_EMAILS) {
    for (const [trackedKey, trackedWindow] of requestWindows) {
      if (now - trackedWindow.startedAt >= WINDOW_MS) requestWindows.delete(trackedKey)
    }
    if (requestWindows.size > MAX_TRACKED_EMAILS) {
      const oldestKey = requestWindows.keys().next().value
      if (oldestKey) requestWindows.delete(oldestKey)
    }
  }

  return next()
}

module.exports = passwordResetRateLimit
