const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getGalleryItems = async (req, res) => {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createGalleryItem = async (req, res) => {
  try {
    const { title, description, category, uploadedBy } = req.body
    const files = req.files || []

    const images = files.map(file => {
      return file.path || file.secure_url || file.url || ''
    }).filter(url => url !== '')

    console.log('Images URLs:', images)

    const item = await prisma.galleryItem.create({
      data: {
        title: title || 'Untitled',
        description: description || '',
        category: category || 'General',
        uploadedBy: uploadedBy || 'Admin',
        images,
      }
    })
    res.status(201).json(item)
  } catch (error) {
    console.error('Gallery create error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateGalleryItem = async (req, res) => {
  const { id } = req.params
  try {
    const { title, description, category, uploadedBy } = req.body
    const files = req.files || []
    const existing = await prisma.galleryItem.findUnique({ where: { id: parseInt(id) } })

    if (!existing) {
      return res.status(404).json({ message: 'Gallery item not found' })
    }

    const uploadedImages = files.map(file => {
      return file.path || file.secure_url || file.url || ''
    }).filter(url => url !== '')

    const item = await prisma.galleryItem.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existing.title,
        description: description ?? existing.description,
        category: category || existing.category,
        uploadedBy: uploadedBy || existing.uploadedBy,
        images: uploadedImages.length > 0 ? uploadedImages : existing.images,
      }
    })
    res.json(item)
  } catch (error) {
    console.error('Gallery update error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteGalleryItem = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.galleryItem.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Gallery item deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem }
