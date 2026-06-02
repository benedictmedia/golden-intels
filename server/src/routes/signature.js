const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const { PrismaClient } = require('@prisma/client')
const cloudinary = require('cloudinary').v2
const prisma = new PrismaClient()

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

    // Save the real URL (with version number) to the database
    await prisma.setting.upsert({
      where: { key: 'headmaster_signature_url' },
      update: { value: result.secure_url },
      create: { key: 'headmaster_signature_url', value: result.secure_url }
    })

    res.json({ url: result.secure_url })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message })
  }
})

// Get current signature URL from database
router.get('/', protect, async (req, res) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'headmaster_signature_url' }
    })
    res.json({ url: setting?.value || null })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

const axios = require('axios')

// Proxy the signature image through your own server to avoid CORS/tracking issues
router.get('/preview', protect, async (req, res) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'headmaster_signature_url' }
    })
    if (!setting?.value) return res.status(404).json({ message: 'No signature uploaded' })

    const response = await axios.get(setting.value, { responseType: 'arraybuffer' })
    res.set('Content-Type', response.headers['content-type'])
    res.set('Cache-Control', 'no-cache')
    res.send(response.data)
  } catch (error) {
    res.status(500).json({ message: 'Failed to load signature' })
  }
})

module.exports = router