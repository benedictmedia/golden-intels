const express = require('express')
const router = express.Router()
const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const {
  submitApplication,
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  deleteApplication
} = require('../controllers/admissionController')
const protect = require('../middleware/authMiddleware')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Create uploads folder for fallback
const uploadDir = 'uploads/admissions'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const admissionFields = [
  { name: 'photo', maxCount: 1 },
  { name: 'nhisFront', maxCount: 1 },
  { name: 'nhisBack', maxCount: 1 },
  { name: 'ghanaFront', maxCount: 1 },
  { name: 'ghanaBack', maxCount: 1 },
  { name: 'signedBooklet', maxCount: 1 },
]

const createLocalUpload = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  })
  return multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }).fields(admissionFields)
}

// Use Cloudinary when configured, otherwise local uploads for development.
let uploadFields
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  const { uploadAdmissions } = require('../middleware/cloudinaryUpload')
  uploadFields = uploadAdmissions.fields(admissionFields)
} else {
  uploadFields = createLocalUpload()
}

router.post('/', (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      console.error('Admission upload error:', err)
      if (err.message === 'PDF_ONLY') {
        return res.status(400).json({
          message: 'Your signed admission booklet must be a PDF file. Word documents (.doc, .docx) and images are not accepted for this field. Please save or export your signed booklet as a PDF and upload again.'
        })
      }
      if (err.message === 'IMAGE_ONLY') {
        return res.status(400).json({ message: 'Please upload a valid image file (JPG, PNG, or WEBP) for this document.' })
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'One of your files is too large. Please upload files under 25MB.' })
      }
      return res.status(500).json({ message: `Upload error: ${err.message}`, error: err.message })
    }
    next()
  })
}, submitApplication)
router.get('/', protect, getApplications)
router.get('/:id', protect, getApplication)
router.put('/:id/approve', protect, approveApplication)
router.put('/:id/reject', protect, rejectApplication)
router.delete('/:id', protect, deleteApplication)

// ✅ Specific routes FIRST
router.get('/download-booklet/:id', protect, async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    const application = await prisma.admissionApplication.findUnique({
      where: { id: parseInt(req.params.id) }
    })

    if (!application?.signedBooklet) {
      return res.status(404).json({ message: 'No booklet found' })
    }

    // Extract the public_id from the stored Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>
    const url = application.signedBooklet
    const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/)
    if (!match) {
      return res.status(400).json({ message: 'Could not parse Cloudinary URL' })
    }

    // Strip file extension from public_id for Cloudinary API
    const publicId = match[1].replace(/\.[^/.]+$/, '')

    const { cloudinary } = require('../middleware/cloudinaryUpload')

    // Generate a signed URL valid for 60 seconds — forces download
    const signedUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
      resource_type: 'image',
      expires_at: Math.floor(Date.now() / 1000) + 60,
      attachment: `${application.firstName}_${application.lastName}_Booklet`,
    })

    // Redirect the admin's browser directly to the signed Cloudinary URL
    res.redirect(signedUrl)

  } catch (error) {
    console.error('[BOOKLET] Error:', error.message)
    res.status(500).json({ message: 'Download failed', error: error.message })
  }
})

module.exports = router
