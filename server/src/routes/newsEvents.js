const express = require('express')
const router = express.Router()
const { getNewsEvents, createNewsEvent, updateNewsEvent, deleteNewsEvent } = require('../controllers/newsEventController')
const protect = require('../middleware/authMiddleware')
const { uploadNews } = require('../middleware/cloudinaryUpload')

router.get('/', getNewsEvents)
router.post('/', protect, uploadNews.array('images', 5), createNewsEvent)
router.put('/:id', protect, uploadNews.array('images', 5), updateNewsEvent)
router.delete('/:id', protect, deleteNewsEvent)

module.exports = router