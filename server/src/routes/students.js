const express = require('express')
const router = express.Router()
const { getStudents, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController')
const protect = require('../middleware/authMiddleware')
const { uploadStudentPhoto } = require('../middleware/cloudinaryUpload')

router.get('/', protect, getStudents)
router.post('/', protect, uploadStudentPhoto.single('photo'), createStudent)
router.put('/:id', protect, updateStudent)
router.delete('/:id', protect, deleteStudent)

module.exports = router