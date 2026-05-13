const express = require('express');
const router = express.Router();
const { getStudents, createStudent } = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Important: Multer middleware must come before protect for POST
router.get('/', protect, getStudents);
router.post('/', upload.single('photo'), protect, createStudent);

module.exports = router;