const express = require('express');
const router = express.Router();
const { getStudents, createStudent } = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');
// Temporarily remove upload middleware for testing
// const { uploadStudentPhoto } = require('../middleware/cloudinaryUpload');

router.get('/', protect, getStudents);
router.post('/', protect, createStudent);   // Removed upload middleware for now
// router.post('/', protect, uploadStudentPhoto.single('photo'), createStudent);

module.exports = router;