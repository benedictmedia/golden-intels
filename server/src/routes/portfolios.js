const express = require('express')
const router = express.Router()
const {
  getPortfolios,
  createPortfolio,
  updatePortfolio,
  updateParentComment,
  deletePortfolio,
  authorizePortfolioEvidenceUpload,
  addPortfolioEvidence,
  assistPortfolioText,
  assistPortfolioCompletion
} = require('../controllers/portfolioController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission, requireAnyAdminPermission } = require('../middleware/adminPermissions')
const { uploadPortfolioEvidence } = require('../middleware/cloudinaryUpload')

router.use(protect)
router.get('/', requireAdminPermission('portfolios:view'), getPortfolios)
router.post('/assist', assistPortfolioText)
router.post('/assist/complete', assistPortfolioCompletion)
router.post('/', createPortfolio)
router.post('/:id/evidence/:areaKey', authorizePortfolioEvidenceUpload, (req, res, next) => {
  if (!uploadPortfolioEvidence) {
    return res.status(503).json({ message: 'Portfolio image storage is not configured on the school server.' })
  }
  uploadPortfolioEvidence.single('image')(req, res, error => {
    if (!error) return next()
    console.error('Portfolio evidence upload failed:', { code: error.code, message: error.message })
    if (error.message === 'IMAGE_ONLY') {
      return res.status(400).json({ message: 'Upload a JPEG, PNG, or WEBP image.' })
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Evidence images must be 8 MB or smaller.' })
    }
    return res.status(400).json({ message: 'The image could not be uploaded. Please try another file.' })
  })
}, addPortfolioEvidence)
router.put('/:id/parent-comment', updateParentComment)
router.put('/:id', requireAnyAdminPermission(['portfolios:edit', 'portfolios:approve']), updatePortfolio)
router.delete('/:id', requireAdminPermission('portfolios:delete'), deletePortfolio)

module.exports = router
