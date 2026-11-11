const express = require('express')
const router = express.Router()
const { submitContact, getContacts, markContactRead, deleteContact } = require('../controllers/contactController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission } = require('../middleware/adminPermissions')

router.post('/', submitContact)                          // public — contact form
router.get('/', protect, requireAdminPermission('contact-messages'), getContacts)
router.put('/:id/read', protect, requireAdminPermission('contact-messages'), markContactRead)
router.delete('/:id', protect, requireAdminPermission('contact-messages'), deleteContact)
module.exports = router