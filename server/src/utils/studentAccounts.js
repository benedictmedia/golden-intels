const bcrypt = require('bcryptjs')

const LEARNER_EMAIL_DOMAIN = 'goldenintels.com'

const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase()

const getInitialAccountPassword = () => {
  const password = process.env.INITIAL_ACCOUNT_PASSWORD
  if (!password) {
    const error = new Error('INITIAL_ACCOUNT_PASSWORD must be configured before creating parent or learner accounts.')
    error.statusCode = 500
    throw error
  }
  return password
}

const createParentAccountIfNeeded = async (tx, { email, name }) => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    const error = new Error('A valid guardian email is required to create a parent account.')
    error.statusCode = 400
    throw error
  }

  const existingUser = await tx.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
  })
  if (existingUser) {
    if (existingUser.role !== 'parent') {
      const error = new Error(`The guardian email "${normalizedEmail}" is already assigned to a non-parent account.`)
      error.statusCode = 409
      throw error
    }
    return existingUser.id
  }

  const hashedPassword = await bcrypt.hash(getInitialAccountPassword(), 10)
  const parent = await tx.user.create({
    data: {
      name: String(name ?? '').trim() || normalizedEmail,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'parent',
      active: true
    }
  })
  return parent.id
}

const generateLearnerEmail = async (tx, { firstName, studentId }) => {
  const namePart = String(firstName ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18) || 'learner'
  const idPart = String(studentId ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
  const localPart = `${namePart}.${idPart || 'student'}`

  let email = `${localPart}@${LEARNER_EMAIL_DOMAIN}`
  let suffix = 2
  const emailIsTaken = async (candidate) => {
    const [user, student] = await Promise.all([
      tx.user.findFirst({
        where: { email: { equals: candidate, mode: 'insensitive' } },
        select: { id: true }
      }),
      tx.student.findFirst({
        where: { email: { equals: candidate, mode: 'insensitive' } },
        select: { id: true }
      })
    ])
    return Boolean(user || student)
  }
  while (await emailIsTaken(email)) {
    email = `${localPart}${suffix}@${LEARNER_EMAIL_DOMAIN}`
    suffix += 1
  }
  return email
}

const createLearnerAccount = async (tx, { firstName, lastName, studentId, active = false }) => {
  const email = await generateLearnerEmail(tx, { firstName, studentId })
  const hashedPassword = await bcrypt.hash(getInitialAccountPassword(), 10)
  const learner = await tx.user.create({
    data: {
      name: [firstName, lastName].filter(Boolean).join(' ').trim() || email,
      email,
      password: hashedPassword,
      role: 'learner',
      active
    }
  })
  return { id: learner.id, email: learner.email, active: learner.active }
}

module.exports = {
  createParentAccountIfNeeded,
  createLearnerAccount,
  generateLearnerEmail,
  normalizeEmail
}
