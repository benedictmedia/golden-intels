const express = require('express')
const router = express.Router()
const {
  getNewsEvents,
  getHomepageNewsEvents,
  createNewsEvent,
  updateNewsEvent,
  deleteNewsEvent
} = require('../controllers/newsEventController')
const protect = require('../middleware/authMiddleware')
const { uploadNews } = require('../middleware/cloudinaryUpload')

const handleNewsUpload = (req, res, next) => {
  uploadNews.array('images', 5)(req, res, error => {
    if (!error) return next()
    console.error('News image upload error:', error)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Each image must be smaller than 10 MB.' })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'A news or event post can include up to 5 images.' })
    }
    const reason = typeof error.message === 'string' ? error.message.slice(0, 200) : 'Unknown image upload error'
    return res.status(502).json({ message: `Image upload failed: ${reason}` })
  })
}

router.get('/', getNewsEvents)
router.get('/homepage', getHomepageNewsEvents)
router.post('/', protect, (req, res, next) => {
  if (req.is('application/json')) return createNewsEvent(req, res, next)
  return handleNewsUpload(req, res, next)
}, createNewsEvent)
router.put('/:id', protect, (req, res, next) => {
  if (req.is('application/json')) return updateNewsEvent(req, res, next)
  return handleNewsUpload(req, res, next)
}, updateNewsEvent)
router.delete('/:id', protect, deleteNewsEvent)

module.exports = router
