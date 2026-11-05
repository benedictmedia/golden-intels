const { test } = require('node:test')
const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')

const prismaPath = require.resolve('../config/prismaClient')
const mailerPath = require.resolve('../utils/mailer')
const controllerPath = require.resolve('./userController')
const originalPrismaModule = require.cache[prismaPath]
const originalMailerModule = require.cache[mailerPath]

let accounts = []
let updates = []
let auditEntries = []
let resetTokensInvalidated = false
let mailAttempts = 0

const tx = {
  user: {
    updateMany: async ({ where, data }) => {
      updates.push({ where, data })
      return { count: 1 }
    }
  },
  passwordResetToken: {
    updateMany: async () => {
      resetTokensInvalidated = true
      return { count: 0 }
    }
  },
  accountAudit: {
    createMany: async ({ data }) => {
      auditEntries = data
      return { count: data.length }
    }
  }
}

const prisma = {
  user: {
    findMany: async ({ where }) => accounts.filter(account => where.id.in.includes(account.id))
  },
  $transaction: async callback => callback(tx)
}

require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: prisma
}
require.cache[mailerPath] = {
  id: mailerPath,
  filename: mailerPath,
  loaded: true,
  exports: {
    sendMail: async () => {
      mailAttempts += 1
    }
  }
}
delete require.cache[controllerPath]
const { resetUserPasswords } = require('./userController')

const invokeReset = async ({ userIds, password, sendEmail = false }, role = 'admin') => {
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    }
  }
  await resetUserPasswords({
    user: { role, email: 'admin@example.com' },
    body: { userIds, password, sendEmail }
  }, response)
  return response
}

test('resets mixed portal accounts together and returns card details without emailing passwords', async () => {
  accounts = [
    { id: 1, name: 'Demo Parent', email: 'parent@example.com', role: 'parent' },
    { id: 2, name: 'Demo Teacher', email: 'teacher@example.com', role: 'teacher' },
    { id: 3, name: 'Demo Learner', email: 'learner@example.com', role: 'learner' }
  ]
  updates = []
  auditEntries = []
  resetTokensInvalidated = false
  mailAttempts = 0

  const response = await invokeReset({ userIds: [1, 2, 3], password: 'secure123', sendEmail: false })

  assert.equal(response.statusCode, 200)
  assert.equal(response.body.updatedCount, 3)
  assert.deepEqual(response.body.users.map(account => account.role), ['parent', 'teacher', 'learner'])
  assert.equal('password' in response.body.users[0], false)
  assert.equal(updates.length, 3)
  assert.equal(updates.every(update => update.where.role === accounts.find(account => account.id === update.where.id).role), true)
  assert.equal(await bcrypt.compare('secure123', updates[0].data.password), true)
  assert.equal(auditEntries.length, 3)
  assert.equal(resetTokensInvalidated, true)
  assert.equal(mailAttempts, 0)
})

test('rejects short passwords when a selected batch includes a teacher', async () => {
  accounts = [
    { id: 1, name: 'Demo Parent', email: 'parent@example.com', role: 'parent' },
    { id: 2, name: 'Demo Teacher', email: 'teacher@example.com', role: 'teacher' }
  ]
  updates = []

  const response = await invokeReset({ userIds: [1, 2], password: 'abc' })

  assert.equal(response.statusCode, 400)
  assert.match(response.body.message, /at least 6 characters/)
  assert.equal(updates.length, 0)
})

test('does not allow admin accounts in bulk login-card batches', async () => {
  accounts = [{ id: 1, name: 'School Admin', email: 'admin@example.com', role: 'admin' }]
  updates = []

  const response = await invokeReset({ userIds: [1], password: 'secure123' })

  assert.equal(response.statusCode, 400)
  assert.match(response.body.message, /Admin accounts cannot/)
  assert.equal(updates.length, 0)
})

test('requires an authenticated admin for bulk password resets', async () => {
  const response = await invokeReset({ userIds: [1], password: 'secure123' }, 'teacher')

  assert.equal(response.statusCode, 403)
  assert.equal(response.body.message, 'Admin only')
})

test.after(() => {
  delete require.cache[controllerPath]
  if (originalPrismaModule) require.cache[prismaPath] = originalPrismaModule
  else delete require.cache[prismaPath]
  if (originalMailerModule) require.cache[mailerPath] = originalMailerModule
  else delete require.cache[mailerPath]
})
