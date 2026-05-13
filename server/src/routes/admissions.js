const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createAdmission, getAdmissions } = require('../controllers/admissionController');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/', upload.fields([
  { name: 'birthCert', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'transcript', maxCount: 1 }
]), createAdmission);

router.get('/', getAdmissions);

module.exports = router;