const express = require('express')
const multer = require('multer')
const router = express.Router()
const {
  getNewsEvents,
  getHomepageNewsEvents,
  createNewsEvent,
  updateNewsEvent,
  deleteNewsEvent
} = require('../controllers/newsEventController')
const protect = require('../middleware/authMiddleware')
<<<<<<< HEAD
const { uploadNews } = require('../middleware/cloudinaryUpload')
const { requireAdminPermission } = require('../middleware/adminPermissions')
=======

const uploadNews = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) return callback(null, true)
    callback(new Error('Only JPG, PNG and WebP images are accepted.'))
  }
}).array('images', 5)
>>>>>>> 27bda13b1a9283c522603fc654908f1e2e90ce74

const handleNewsUpload = (req, res, next) => {
  uploadNews(req, res, error => {
    if (!error) return next()
    console.error('News image upload error:', error)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Each image must be smaller than 10 MB.' })
    }
    if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'A news or event post can include up to 5 images.' })
    }
    return res.status(400).json({ message: error.message || 'Invalid image upload.' })
  })
}

router.get('/', getNewsEvents)
router.get('/homepage', getHomepageNewsEvents)
<<<<<<< HEAD
router.post('/', protect, requireAdminPermission('news'), (req, res, next) => {
  if (req.is('application/json')) return createNewsEvent(req, res, next)
  return handleNewsUpload(req, res, next)
}, createNewsEvent)
router.put('/:id', protect, requireAdminPermission('news'), (req, res, next) => {
  if (req.is('application/json')) return updateNewsEvent(req, res, next)
  return handleNewsUpload(req, res, next)
}, updateNewsEvent)
router.delete('/:id', protect, requireAdminPermission('news'), deleteNewsEvent)
=======
router.post('/', protect, handleNewsUpload, createNewsEvent)
router.put('/:id', protect, handleNewsUpload, updateNewsEvent)
router.delete('/:id', protect, deleteNewsEvent)
>>>>>>> 27bda13b1a9283c522603fc654908f1e2e90ce74

module.exports = router
