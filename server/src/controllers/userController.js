const prisma = require('../config/prismaClient')

const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
}

const getUsers = async (req, res) => {
  try {
    // query params: q, page, limit, role
    const { q = '', page = 1, limit = 10, role } = req.query
    const where = {}
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }]
    if (role) where.role = role

    const pageNum = parseInt(page) || 1
    const pageSize = Math.min(parseInt(limit) || 10, 100)

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * pageSize, take: pageSize })
    ])

    res.json({ users, total, page: pageNum, limit: pageSize })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  const { id } = req.params
  try {
    const { name, email, role } = req.body
    const user = await prisma.user.update({ where: { id: parseInt(id) }, data: { name, email, role } })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deactivateUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  const { email } = req.body
  try {
    const user = await prisma.user.update({ where: { email }, data: { active: false } })
    // create audit
    await prisma.accountAudit.create({ data: { userId: user.id, action: 'deactivate', performedBy: req.user.email, details: { email } } })
    res.json({ message: 'User deactivated', email })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const reactivateUser = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  const { email } = req.body
  try {
    const user = await prisma.user.update({ where: { email }, data: { active: true } })
    await prisma.accountAudit.create({ data: { userId: user.id, action: 'reactivate', performedBy: req.user.email, details: { email } } })
    res.json({ message: 'User reactivated', email })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAccountAudits = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  try {
    const { userId, page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page) || 1
    const pageSize = Math.min(parseInt(limit) || 20, 200)
    const where = {}
    if (userId) where.userId = parseInt(userId)
    const [total, audits] = await Promise.all([
      prisma.accountAudit.count({ where }),
      prisma.accountAudit.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * pageSize, take: pageSize })
    ])
    res.json({ audits, total, page: pageNum, limit: pageSize })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getUsers, updateUser, deactivateUser, reactivateUser, getAccountAudits }
