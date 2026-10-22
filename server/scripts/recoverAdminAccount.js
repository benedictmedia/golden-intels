const path = require('path')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const CURRENT_EMAIL = 'admin@goldenintels.com'
const NEW_EMAIL = 'goldenintelse@gmail.com'
const prisma = new PrismaClient()

const readSecret = (prompt) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    reject(new Error('Run this script in an interactive terminal so the password can be entered without echo.'))
    return
  }

  let value = ''
  process.stdout.write(prompt)
  process.stdin.setRawMode(true)
  process.stdin.resume()

  const cleanup = () => {
    process.stdin.removeListener('data', onData)
    process.stdin.setRawMode(false)
    process.stdin.pause()
    process.stdout.write('\n')
  }

  const onData = (buffer) => {
    for (const character of buffer.toString('utf8')) {
      if (character === '\u0003') {
        cleanup()
        reject(new Error('Recovery canceled.'))
        return
      }
      if (character === '\r' || character === '\n') {
        cleanup()
        resolve(value)
        return
      }
      if (character === '\u007f' || character === '\b') {
        value = Array.from(value).slice(0, -1).join('')
      } else if (character >= ' ') {
        value += character
      }
    }
  }

  process.stdin.on('data', onData)
})

const findAdminAndCheckEmail = async () => {
  const admin = await prisma.user.findFirst({
    where: { email: { equals: CURRENT_EMAIL, mode: 'insensitive' } }
  })
  if (!admin || admin.role !== 'admin') {
    throw new Error(`No admin account was found for ${CURRENT_EMAIL}; no changes were made.`)
  }
  if (admin.active === false) {
    throw new Error('The existing admin account is inactive; no changes were made.')
  }

  const existingNewEmail = await prisma.user.findFirst({
    where: { email: { equals: NEW_EMAIL, mode: 'insensitive' } }
  })
  if (existingNewEmail) {
    throw new Error(`${NEW_EMAIL} is already assigned to an account; no changes were made.`)
  }

  return admin
}

const main = async () => {
  if (!process.argv.includes('--confirm-live')) {
    throw new Error('Live account recovery requires the explicit --confirm-live flag.')
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured; no changes were made.')
  }

  const confirmation = await new Promise((resolve) => {
    process.stdout.write(`Type RECOVER ${CURRENT_EMAIL} to ${NEW_EMAIL} to continue: `)
    process.stdin.resume()
    process.stdin.once('data', (data) => resolve(data.toString().trim()))
  })
  if (confirmation !== `RECOVER ${CURRENT_EMAIL} to ${NEW_EMAIL}`) {
    throw new Error('Confirmation did not match; no changes were made.')
  }

  const existingAdmin = await findAdminAndCheckEmail()
  console.log(`Verified active admin account for ${existingAdmin.email}.`)

  const password = await readSecret('Enter a temporary password (14+ characters): ')
  if (Buffer.byteLength(password, 'utf8') < 14 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Password must be between 14 and 72 UTF-8 bytes; no changes were made.')
  }

  const confirmationPassword = await readSecret('Confirm the temporary password: ')
  if (password !== confirmationPassword) {
    throw new Error('Passwords did not match; no changes were made.')
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const updatedAt = new Date()

  await prisma.$transaction(async (transaction) => {
    const admin = await transaction.user.findUnique({ where: { id: existingAdmin.id } })
    if (!admin || admin.role !== 'admin' || admin.active === false) {
      throw new Error('The admin account changed during recovery; no changes were made.')
    }

    const collision = await transaction.user.findFirst({
      where: { email: { equals: NEW_EMAIL, mode: 'insensitive' } }
    })
    if (collision) {
      throw new Error(`${NEW_EMAIL} is now assigned to another account; no changes were made.`)
    }

    await transaction.user.update({
      where: { id: admin.id },
      data: { email: NEW_EMAIL, password: hashedPassword }
    })
    await transaction.passwordResetToken.updateMany({
      where: { userId: admin.id, usedAt: null },
      data: { usedAt: updatedAt }
    })
    await transaction.accountAudit.create({
      data: {
        userId: admin.id,
        action: 'admin_account_recovered',
        performedBy: 'approved_local_admin_recovery',
        details: { previousEmail: admin.email, newEmail: NEW_EMAIL }
      }
    })
  })

  console.log(`Admin login updated to ${NEW_EMAIL}. The temporary password was not displayed or stored in plaintext.`)
  console.log('Sign in and change the temporary password from the portal password settings.')
}

main()
  .catch((error) => {
    console.error(`Admin recovery failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
