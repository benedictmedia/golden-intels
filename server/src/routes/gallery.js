const express = require('express')
const router = express.Router()
const { getGalleryItems, createGalleryItem, deleteGalleryItem } = require('../controllers/galleryController')
const protect = require('../middleware/authMiddleware')
const { uploadGallery } = require('../middleware/cloudinaryUpload')

router.get('/', getGalleryItems)
router.post('/', protect, (req, res, next) => {
  uploadGallery.array('images', 20)(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', err)
      return res.status(500).json({ message: 'Upload error', error: err.message })
    }
    next()
  })
}, createGalleryItem)
router.delete('/:id', protect, deleteGalleryItem)

module.exports = router