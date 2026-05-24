const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const defaultTeacherStaffAssignment = {
  department: 'Primary',
  subject: 'General Studies',
  subjects: ['General Studies'],
  classes: ['Year 1'],
  bio: 'Seeded teacher assignment',
  category: 'teaching'
}

async function ensureTeacherStaffAssignments() {
  const teacherUsers = await prisma.user.findMany({ where: { role: 'teacher' } })

  let created = 0

  for (const teacher of teacherUsers) {
    const existingStaff = await prisma.staff.findFirst({ where: { email: teacher.email } })

    if (existingStaff) {
      continue
    }

    await prisma.staff.create({
      data: {
        name: teacher.name,
        role: 'teacher',
        department: defaultTeacherStaffAssignment.department,
        subject: defaultTeacherStaffAssignment.subject,
        subjects: defaultTeacherStaffAssignment.subjects,
        classes: defaultTeacherStaffAssignment.classes,
        bio: defaultTeacherStaffAssignment.bio,
        email: teacher.email,
        phone: null,
        category: defaultTeacherStaffAssignment.category
      }
    })

    created += 1
  }

  return created
}

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@goldenintels.com' },
    update: {},
    create: {
      name: 'School Admin',
      email: 'admin@goldenintels.com',
      password: hashedPassword,
      role: 'admin',
    },
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@goldenintels.com' },
    update: {},
    create: {
      name: 'Demo Teacher',
      email: 'teacher@goldenintels.com',
      password: hashedPassword,
      role: 'teacher',
    },
  })

  const parent = await prisma.user.upsert({
    where: { email: 'parent@goldenintels.com' },
    update: {},
    create: {
      name: 'Demo Parent',
      email: 'parent@goldenintels.com',
      password: hashedPassword,
      role: 'parent',
    },
  })

  const createdStaffAssignments = await ensureTeacherStaffAssignments()

  console.log('Seed complete:', { admin, teacher, parent, createdStaffAssignments })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())