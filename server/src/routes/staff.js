const express = require('express')
const router = express.Router()
const {
  getStaff,
  getStaffAudit,
  getPublicStaff,
  createStaff,
  updateStaff,
  setStaffVisibility,
  archiveStaff,
  restoreStaff,
  deleteStaff
} = require('../controllers/staffController')
const protect = require('../middleware/authMiddleware')
const { uploadStaff } = require('../middleware/cloudinaryUpload')

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' })
  next()
}

router.get('/', getPublicStaff)
router.get('/admin', protect, requireAdmin, getStaff)
router.get('/admin/audit', protect, requireAdmin, getStaffAudit)
router.patch('/:id/public-visibility', protect, requireAdmin, setStaffVisibility)
router.post('/:id/archive', protect, requireAdmin, archiveStaff)
router.post('/:id/restore', protect, requireAdmin, restoreStaff)
router.post('/', protect, requireAdmin, uploadStaff.single('photo'), createStaff)
router.put('/:id', protect, requireAdmin, uploadStaff.single('photo'), updateStaff)
router.delete('/:id', protect, requireAdmin, deleteStaff)

module.exports = router