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
const { requireAdminPermission } = require('../middleware/adminPermissions')

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' })
  next()
}

router.get('/', getPublicStaff)
router.get('/admin', protect, requireAdminPermission('staff'), requireAdmin, getStaff)
router.get('/admin/audit', protect, requireAdminPermission('staff'), requireAdmin, getStaffAudit)
router.patch('/:id/public-visibility', protect, requireAdminPermission('staff'), requireAdmin, setStaffVisibility)
router.post('/:id/archive', protect, requireAdminPermission('staff'), requireAdmin, archiveStaff)
router.post('/:id/restore', protect, requireAdminPermission('staff'), requireAdmin, restoreStaff)
router.post('/', protect, requireAdminPermission('staff'), requireAdmin, uploadStaff.single('photo'), createStaff)
router.put('/:id', protect, requireAdminPermission('staff'), requireAdmin, uploadStaff.single('photo'), updateStaff)
router.delete('/:id', protect, requireAdminPermission('staff'), requireAdmin, deleteStaff)

module.exports = router