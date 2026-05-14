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

// Try Cloudinary first, fallback to local
let uploadFields
try {
  const { uploadAdmissions } = require('../middleware/cloudinaryUpload')
  uploadFields = uploadAdmissions.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'nhisFront', maxCount: 1 },
    { name: 'nhisBack', maxCount: 1 },
    { name: 'ghanaFront', maxCount: 1 },
    { name: 'ghanaBack', maxCount: 1 },
    { name: 'signedBooklet', maxCount: 1 },
  ])
} catch (e) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  })
  const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
  uploadFields = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'nhisFront', maxCount: 1 },
    { name: 'nhisBack', maxCount: 1 },
    { name: 'ghanaFront', maxCount: 1 },
    { name: 'ghanaBack', maxCount: 1 },
    { name: 'signedBooklet', maxCount: 1 },
  ])
}

router.post('/', uploadFields, submitApplication)
router.get('/', protect, getApplications)
router.get('/:id', protect, getApplication)
router.put('/:id/approve', protect, approveApplication)
router.put('/:id/reject', protect, rejectApplication)
router.delete('/:id', protect, deleteApplication)

module.exports = router