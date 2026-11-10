const { PrismaClient } = require('@prisma/client')
const { randomUUID } = require('crypto')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const createNewsImageUploadSignature = (req, res) => {
  const { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret } = cloudinary.config()
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('News image signing is unavailable: Cloudinary credentials are not configured.')
    return res.status(503).json({ message: 'Image uploads are temporarily unavailable. Please contact the site administrator.' })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'goldenintels/news'
  const publicId = randomUUID()
  const paramsToSign = { folder, public_id: publicId, timestamp }
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)
  res.set('Cache-Control', 'no-store')
  res.json({ cloudName, apiKey, timestamp, folder, publicId, signature })
}

const getNewsImageUrls = (bodyImages, files = []) => {
  if (files.length) {
    return files.map(file => file.path || file.secure_url || file.url || '').filter(Boolean)
  }
  if (bodyImages === undefined) return []

  let images = bodyImages
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images)
    } catch {
      return null
    }
  }
  if (!Array.isArray(images) || images.length > 5) return null

  const cloudName = cloudinary.config().cloud_name
  return images.every(image => {
    if (typeof image !== 'string') return false
    try {
      const url = new URL(image)
      return url.protocol === 'https:' &&
        url.hostname === 'res.cloudinary.com' &&
        url.pathname.startsWith(`/${cloudName}/image/upload/`)
    } catch {
      return false
    }
  }) ? images : null
}

// Get all news and events
const getNewsEvents = async (req, res) => {
  try {
    const items = await prisma.newsEvent.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getHomepageNewsEvents = async (req, res) => {
  try {
    const postedWithinLastMonth = new Date()
    postedWithinLastMonth.setMonth(postedWithinLastMonth.getMonth() - 1)
    const items = await prisma.newsEvent.findMany({
      where: { createdAt: { gte: postedWithinLastMonth } },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    res.set('Cache-Control', 'public, max-age=60')
    res.json(items)
  } catch (error) {
    console.error('Homepage news load error:', error)
    res.status(500).json({ message: 'Could not load recent announcements.' })
  }
}

// Create news or event
const createNewsEvent = async (req, res) => {
  try {
    const { title, content, category, type, videoUrl, eventDate, venue, uploadedBy } = req.body
    if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ message: 'A title and content are required.' })
    }
    const images = getNewsImageUrls(req.body.images, req.files || [])
    if (!images) return res.status(400).json({ message: 'One or more image URLs are invalid.' })

    const item = await prisma.newsEvent.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category || 'General',
        type: type || 'news',
        images,
        videoUrl: videoUrl || null,
        eventDate: eventDate || null,
        venue: venue || null,
        uploadedBy: uploadedBy || req.user?.name || 'Admin',
      }
    })
    res.status(201).json(item)
  } catch (error) {
    console.error('News create error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update news or event
const updateNewsEvent = async (req, res) => {
  const { id } = req.params
  try {
    const { title, content, category, type, videoUrl, eventDate, venue } = req.body
    const files = req.files || []

    const existing = await prisma.newsEvent.findUnique({ where: { id: parseInt(id) } })
    if (!existing) {
      return res.status(404).json({ message: 'News or event item not found' })
    }
    let images = existing.images || []

    if (files.length > 0 || req.body.images !== undefined) {
      const uploadedImages = getNewsImageUrls(req.body.images, files)
      if (!uploadedImages) return res.status(400).json({ message: 'One or more image URLs are invalid.' })
      images = uploadedImages
    }

    const item = await prisma.newsEvent.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existing.title,
        content: content || existing.content,
        category: category || existing.category,
        type: type || existing.type,
        images,
        videoUrl: videoUrl || null,
        eventDate: eventDate || null,
        venue: venue || null,
      }
    })
    res.json(item)
  } catch (error) {
    console.error('News update error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete news or event
const deleteNewsEvent = async (req, res) => {
  const { id } = req.params
  try {
    const item = await prisma.newsEvent.findUnique({ where: { id: parseInt(id) } })
    if (item && item.images) {
      item.images.forEach(imgPath => {
        const fullPath = path.join(__dirname, '../../', imgPath)
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
      })
    }
    await prisma.newsEvent.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getNewsEvents,
  getHomepageNewsEvents,
  createNewsImageUploadSignature,
  createNewsEvent,
  updateNewsEvent,
  deleteNewsEvent
}
