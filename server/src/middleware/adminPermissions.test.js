const test = require('node:test')
const assert = require('node:assert/strict')
const { normalizeAdminPermissions, hasAdminPermission } = require('./adminPermissions')

test('administrator privileges reject unknown and dependent performance actions without preview', () => {
  assert.deepEqual(normalizeAdminPermissions(['performance:view', 'performance:remarks']), [
    'performance:view',
    'performance:remarks'
  ])
  assert.equal(normalizeAdminPermissions(['performance:remarks']), null)
  assert.equal(normalizeAdminPermissions(['unknown']), null)
  assert.deepEqual(normalizeAdminPermissions(['finance', 'finance']), ['finance'])
})

test('legacy administrators retain full access while new admins use assigned permissions', () => {
  assert.equal(hasAdminPermission({ user: { role: 'admin' }, adminPermissions: null }, 'finance'), true)
  assert.equal(hasAdminPermission({ user: { role: 'admin' }, adminPermissions: [] }, 'finance'), false)
  assert.equal(hasAdminPermission({ user: { role: 'admin' }, adminPermissions: ['finance'] }, 'finance'), true)
  assert.equal(hasAdminPermission({ user: { role: 'teacher' }, adminPermissions: null }, 'finance'), false)
})
