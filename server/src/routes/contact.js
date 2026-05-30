const express = require('express')
const router = express.Router()
const { submitContact, getContacts, markContactRead, deleteContact } = require('../controllers/contactController')
const protect = require('../middleware/authMiddleware')

router.post('/', submitContact)                          // public — contact form
router.get('/', protect, getContacts)                    // admin only
router.put('/:id/read', protect, markContactRead)        // mark as read
router.delete('/:id', protect, deleteContact)            // delete
module.exports = router