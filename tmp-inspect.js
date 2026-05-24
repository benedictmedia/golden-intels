require('dotenv').config({ path: 'server/.env' })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

;(async () => {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { createdAt: 'desc' } })
    const students = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } })
    console.log('STAFF', JSON.stringify(staff, null, 2))
    console.log('STUDENTS', JSON.stringify(students, null, 2))
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
})()
