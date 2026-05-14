const express = require('express');
const router = express.Router();
const { getStudents, createStudent } = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.get('/', protect, getStudents);
router.post('/', upload.single('photo'), protect, createStudent);   // ✅ Fixed order

module.exports = router;