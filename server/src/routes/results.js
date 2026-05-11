const express = require('express')
const router = express.Router()
const {
  getResults,
  getResultsByStudent,
  createResult,
  updateResult,
  deleteResult
} = require('../controllers/resultController')
const protect = require('../middleware/authMiddleware')

router.get('/', protect, getResults)
router.get('/student/:studentId', protect, getResultsByStudent)
router.post('/', protect, createResult)
router.put('/:id', protect, updateResult)
router.delete('/:id', protect, deleteResult)

module.exports = router