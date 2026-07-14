const express = require('express')
const router = express.Router()
const { getStudents, getStudent, getMyProfile, createStudent, updateStudent, deleteStudent, createLearnerLogin } = require('../controllers/studentController')
const protect = require('../middleware/authMiddleware')

// A learner's profile can now include every admission-form document, not
// just the passport photo, and the admin can replace any of them later.
const studentDocumentFields = [
  { name: 'photo', maxCount: 1 },
  { name: 'nhisFront', maxCount: 1 },
  { name: 'nhisBack', maxCount: 1 },
  { name: 'ghanaFront', maxCount: 1 },
  { name: 'ghanaBack', maxCount: 1 },
  { name: 'signedBooklet', maxCount: 1 },
]

let uploadStudentDocs
try {
  // Same PDF-only rule for signedBooklet and image-only rule for everything
  // else as the admissions form, but stored under its own Cloudinary folder.
  const { uploadStudentDocuments } = require('../middleware/cloudinaryUpload')
  uploadStudentDocs = uploadStudentDocuments.fields(studentDocumentFields)
  console.log('✅ Using Cloudinary for student documents')
} catch (e) {
  const multer = require('multer')
  const path = require('path')
  const fs = require('fs')
  const uploadDir = 'uploads/students'
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`)
  })
  uploadStudentDocs = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }).fields(studentDocumentFields)
  console.log('⚠️ Using local storage for student documents')
}

const handleUpload = (req, res, next) => {
  uploadStudentDocs(req, res, (err) => {
    if (err) {
      console.error('Student document upload error:', err)
      if (err.message === 'PDF_ONLY') {
        return res.status(400).json({ message: 'The signed admission booklet must be a PDF file.' })
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
}

router.get('/', protect, getStudents)
router.post('/', protect, handleUpload, createStudent)
router.get('/me', protect, getMyProfile)
router.get('/:id', protect, getStudent)
router.put('/:id', protect, handleUpload, updateStudent)
router.delete('/:id', protect, deleteStudent)
router.post('/:id/create-login', protect, createLearnerLogin)

module.exports = router