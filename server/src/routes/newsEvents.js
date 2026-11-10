const express = require('express')
const router = express.Router()
const { getNewsEvents, getHomepageNewsEvents, createNewsEvent, updateNewsEvent, deleteNewsEvent } = require('../controllers/newsEventController')
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
    return res.status(502).json({ message: 'An image could not be uploaded. Please try again with smaller images.' })
  })
}

router.get('/', getNewsEvents)
router.get('/homepage', getHomepageNewsEvents)
router.post('/', protect, handleNewsUpload, createNewsEvent)
router.put('/:id', protect, handleNewsUpload, updateNewsEvent)
router.delete('/:id', protect, deleteNewsEvent)

module.exports = router
