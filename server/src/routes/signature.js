const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const cloudinary = require('cloudinary').v2

// Upload headmaster signature (admin only)
router.post('/upload', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' })
  try {
    const { imageBase64 } = req.body
    if (!imageBase64) return res.status(400).json({ message: 'No image provided' })

    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'goldenintels/signatures',
      public_id: 'headmaster_signature',
      overwrite: true,
      resource_type: 'image'
    })

    res.json({ url: result.secure_url })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
})

// Get current signature URL (stored as env or in a settings table)
router.get('/', protect, async (req, res) => {
  try {
    // We use Cloudinary's fixed public_id so the URL is always predictable
    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/goldenintels/signatures/headmaster_signature`
    res.json({ url })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

module.exports = router