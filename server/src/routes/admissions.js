const express = require('express')
const router = express.Router()
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

module.exports = router
