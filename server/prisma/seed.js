const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

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

  console.log('Seed complete:', { admin, teacher, parent })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())