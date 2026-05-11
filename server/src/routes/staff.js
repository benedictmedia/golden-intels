const express = require('express')
const router = express.Router()
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController')
const protect = require('../middleware/authMiddleware')
const { uploadStaff } = require('../middleware/cloudinaryUpload')

router.get('/', getStaff)
router.post('/', protect, uploadStaff.single('photo'), createStaff)
router.put('/:id', protect, uploadStaff.single('photo'), updateStaff)
router.delete('/:id', protect, deleteStaff)

module.exports = router