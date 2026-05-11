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
const { uploadAdmissions } = require('../middleware/cloudinaryUpload')

const uploadFields = uploadAdmissions.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'nhisFront', maxCount: 1 },
  { name: 'nhisBack', maxCount: 1 },
  { name: 'ghanaFront', maxCount: 1 },
  { name: 'ghanaBack', maxCount: 1 },
  { name: 'signedBooklet', maxCount: 1 },
])

router.post('/', uploadFields, submitApplication)
router.get('/', protect, getApplications)
router.get('/:id', protect, getApplication)
router.put('/:id/approve', protect, approveApplication)
router.put('/:id/reject', protect, rejectApplication)
router.delete('/:id', protect, deleteApplication)

module.exports = router