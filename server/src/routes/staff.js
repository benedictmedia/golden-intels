const express = require('express')
const router = express.Router()
const { getStaff, getStaffAudit, importStaff, getPublicStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController')
const protect = require('../middleware/authMiddleware')
const { uploadStaff } = require('../middleware/cloudinaryUpload')

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' })
  next()
}

router.get('/', getPublicStaff)
router.get('/admin', protect, requireAdmin, getStaff)
router.get('/admin/audit', protect, requireAdmin, getStaffAudit)
router.post('/admin/import', protect, requireAdmin, importStaff)
router.post('/', protect, requireAdmin, uploadStaff.single('photo'), createStaff)
router.put('/:id', protect, requireAdmin, uploadStaff.single('photo'), updateStaff)
router.delete('/:id', protect, requireAdmin, deleteStaff)

module.exports = router