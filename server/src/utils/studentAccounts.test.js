const { test } = require('node:test')
const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')
const {
  createLearnerAccount,
  createParentAccountIfNeeded
} = require('./studentAccounts')

process.env.INITIAL_ACCOUNT_PASSWORD = 'test-account-password'

const createTransactionMock = () => {
  const users = []
  let nextId = 1
  return {
    users,
    user: {
      findFirst: async ({ where }) => users.find(user => (
        user.email.toLowerCase() === where.email.equals.toLowerCase()
      )) || null,
      create: async ({ data }) => {
        const user = { id: nextId++, ...data }
        users.push(user)
        return user
      }
    },
    student: {
      findFirst: async () => null
    }
  }
}

test('creates an active parent account with the guardian email and default password', async () => {
  const tx = createTransactionMock()
  const parentId = await createParentAccountIfNeeded(tx, {
    email: 'Guardian@example.com ',
    name: 'Guardian Name'
  })

  assert.equal(parentId, 1)
  assert.equal(tx.users[0].email, 'guardian@example.com')
  assert.equal(tx.users[0].role, 'parent')
  assert.equal(tx.users[0].active, true)
  assert.equal(await bcrypt.compare(process.env.INITIAL_ACCOUNT_PASSWORD, tx.users[0].password), true)
})

test('generates a short-name learner login that remains inactive', async () => {
  const tx = createTransactionMock()
  const learner = await createLearnerAccount(tx, {
    firstName: 'Márie-José',
    lastName: 'Doe',
    studentId: 'STU202600001'
  })

  assert.equal(learner.email, 'mariejose.stu202600001@goldenintels.com')
  assert.equal(learner.active, false)
  assert.equal(tx.users[0].role, 'learner')
  assert.equal(await bcrypt.compare(process.env.INITIAL_ACCOUNT_PASSWORD, tx.users[0].password), true)
})
