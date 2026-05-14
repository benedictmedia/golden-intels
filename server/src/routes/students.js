const express = require('express')
const router = express.Router()
const { getStudents, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController')
const protect = require('../middleware/authMiddleware')

let uploadStudentPhoto
try {
  const cloudinaryUpload = require('../middleware/cloudinaryUpload')
  uploadStudentPhoto = cloudinaryUpload.uploadStudentPhoto
  console.log('✅ Using Cloudinary for student photos')
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
  uploadStudentPhoto = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
  console.log('⚠️ Using local storage for student photos')
}

router.get('/', protect, getStudents)
router.post('/', protect, uploadStudentPhoto.single('photo'), createStudent)
router.put('/:id', protect, updateStudent)
router.delete('/:id', protect, deleteStudent)

module.exports = router