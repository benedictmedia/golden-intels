const express = require('express')
const router = express.Router()
const { getNewsEvents, createNewsEvent, updateNewsEvent, deleteNewsEvent } = require('../controllers/newsEventController')
const protect = require('../middleware/authMiddleware')
const { uploadNews } = require('../middleware/cloudinaryUpload')

router.get('/', getNewsEvents)
router.post('/', protect, (req, res, next) => {
  uploadNews.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', err)
      return res.status(500).json({ message: 'Upload error', error: err.message })
    }
    next()
  })
}, createNewsEvent)
router.put('/:id', protect, (req, res, next) => {
  uploadNews.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', err)
      return res.status(500).json({ message: 'Upload error', error: err.message })
    }
    next()
  })
}, updateNewsEvent)
router.delete('/:id', protect, deleteNewsEvent)

module.exports = router
