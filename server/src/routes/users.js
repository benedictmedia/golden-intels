const express = require('express')
const router = express.Router()
const { getUsers, updateUser, deactivateUser, reactivateUser, deleteUser, getAccountAudits } = require('../controllers/userController')
const protect = require('../middleware/authMiddleware')
const { uploadStaff } = require('../middleware/cloudinaryUpload')

router.get('/', protect, getUsers)
router.get('/audits', protect, getAccountAudits)        
router.post('/deactivate', protect, deactivateUser)     
router.post('/reactivate', protect, reactivateUser)     

router.put('/:id', protect, uploadStaff.single('photo'), updateUser)
router.delete('/:id', protect, deleteUser)