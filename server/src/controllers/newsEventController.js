const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

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

// Create news or event
const createNewsEvent = async (req, res) => {
  try {
    const { title, content, category, type, videoUrl, eventDate, venue, uploadedBy } = req.body
    const files = req.files || []
    const images = files.map(file => file.path)

    const item = await prisma.newsEvent.create({
      data: {
        title,
        content,
        category,
        type,
        images,
        videoUrl: videoUrl || null,
        eventDate: eventDate || null,
        venue: venue || null,
        uploadedBy,
      }
    })
    res.status(201).json(item)
  } catch (error) {
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
    let images = existing.images || []

    if (files.length > 0) {
      images = files.map(file => file.path)
    }

    const item = await prisma.newsEvent.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        category,
        type,
        images,
        videoUrl: videoUrl || null,
        eventDate: eventDate || null,
        venue: venue || null,
      }
    })
    res.json(item)
  } catch (error) {
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

module.exports = { getNewsEvents, createNewsEvent, updateNewsEvent, deleteNewsEvent }