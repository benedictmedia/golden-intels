const express = require('express')
const router = express.Router()
const {
  getPortfolios,
  createPortfolio,
  updatePortfolio,
  updateParentComment,
  deletePortfolio
} = require('../controllers/portfolioController')
const protect = require('../middleware/authMiddleware')
const { requireAdminPermission, requireAnyAdminPermission } = require('../middleware/adminPermissions')

router.use(protect)
router.get('/', requireAdminPermission('portfolios:view'), getPortfolios)
router.post('/', createPortfolio)
router.put('/:id/parent-comment', updateParentComment)
router.put('/:id', requireAnyAdminPermission(['portfolios:edit', 'portfolios:approve']), updatePortfolio)
router.delete('/:id', requireAdminPermission('portfolios:delete'), deletePortfolio)

module.exports = router
