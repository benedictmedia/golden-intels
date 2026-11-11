const express = require('express')
const router = express.Router()
const { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } = require('../controllers/galleryController')
const protect = require('../middleware/authMiddleware')
const { uploadGallery } = require('../middleware/cloudinaryUpload')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.get('/', getGalleryItems)
router.post('/', protect, requireAdminPermission('gallery'), (req, res, next) => {
  uploadGallery.array('images', 20)(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', err)
      return res.status(500).json({ message: 'Upload error', error: err.message })
    }
    next()
  })
}, createGalleryItem)
router.put('/:id', protect, requireAdminPermission('gallery'), (req, res, next) => {
  uploadGallery.array('images', 20)(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', err)
      return res.status(500).json({ message: 'Upload error', error: err.message })
    }
    next()
  })
}, updateGalleryItem)
router.delete('/:id', protect, requireAdminPermission('gallery'), deleteGalleryItem)

module.exports = router
