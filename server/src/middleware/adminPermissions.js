const prisma = require('../config/prismaClient')

const ADMIN_PERMISSION_OPTIONS = [
  'dashboard',
  'attendance',
  'admissions',
  'finance',
  'performance:view',
  'performance:edit',
  'performance:remarks',
  'performance:signature',
  'performance:approve',
  'performance:delete',
  'learners',
  'accounts',
  'admission-tokens',
  'gallery',
  'news',
  'staff',
  'messages',
  'contact-messages',
  'academic-context',
  'archives'
]

const normalizeAdminPermissions = (permissions) => {
  if (!Array.isArray(permissions) || permissions.some(permission => !ADMIN_PERMISSION_OPTIONS.includes(permission))) {
    return null
  }
  const normalized = [...new Set(permissions)]
  if (normalized.some(permission => permission.startsWith('performance:') && permission !== 'performance:view') &&
      !normalized.includes('performance:view')) {
    return null
  }
  return normalized
}

const hasAdminPermission = (req, permission) => {
  if (req.user?.role !== 'admin') return false
  if (req.adminPermissions === null) return true
  return Array.isArray(req.adminPermissions) && req.adminPermissions.includes(permission)
}

const requireAdminPermission = (permission) => async (req, res, next) => {
  if (req.user?.role !== 'admin') return next()

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, active: true, adminPermissions: true }
    })
    if (!user || user.role !== 'admin' || user.active === false) {
      return res.status(403).json({ message: 'Administrator access is no longer available for this account.' })
    }

    const permissions = user.adminPermissions === null
      ? null
      : normalizeAdminPermissions(user.adminPermissions)
    if (user.adminPermissions !== null && !permissions) {
      return res.status(403).json({ message: 'Administrator permissions are invalid. Contact the account owner.' })
    }

    req.adminPermissions = permissions
    // A null permission list preserves full access for administrator accounts created before scoped privileges existed.
    if (permissions === null || permissions.includes(permission)) return next()
    return res.status(403).json({ message: 'You do not have permission to access this section.' })
  } catch (error) {
    console.error('Failed to verify administrator permissions:', error.message)
    return res.status(500).json({ message: 'Could not verify administrator permissions.' })
  }
}

const requireAnyAdminPermission = (permissions) => async (req, res, next) => {
  if (req.user?.role !== 'admin') return next()

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, active: true, adminPermissions: true }
    })
    if (!user || user.role !== 'admin' || user.active === false) {
      return res.status(403).json({ message: 'Administrator access is no longer available for this account.' })
    }

    const assignedPermissions = user.adminPermissions === null
      ? null
      : normalizeAdminPermissions(user.adminPermissions)
    if (user.adminPermissions !== null && !assignedPermissions) {
      return res.status(403).json({ message: 'Administrator permissions are invalid. Contact the account owner.' })
    }

    req.adminPermissions = assignedPermissions
    if (assignedPermissions === null || permissions.some(permission => assignedPermissions.includes(permission))) {
      return next()
    }
    return res.status(403).json({ message: 'You do not have permission to access this section.' })
  } catch (error) {
    console.error('Failed to verify administrator permissions:', error.message)
    return res.status(500).json({ message: 'Could not verify administrator permissions.' })
  }
}

module.exports = {
  ADMIN_PERMISSION_OPTIONS,
  normalizeAdminPermissions,
  hasAdminPermission,
  requireAdminPermission,
  requireAnyAdminPermission
}
