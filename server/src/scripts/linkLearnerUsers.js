const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function linkLearnerUsers() {
  console.log('🔗 Starting learner user linking migration...\n')

  // Get all learner user accounts
  const learnerUsers = await prisma.user.findMany({
    where: { role: 'learner' }
  })

  console.log(`Found ${learnerUsers.length} learner user account(s).\n`)

  let linked = 0
  let alreadyLinked = 0
  let notFound = 0

  for (const learnerUser of learnerUsers) {
    // Skip if already linked
    const alreadyLinkedStudent = await prisma.student.findFirst({
      where: { learnerUserId: learnerUser.id }
    })
    if (alreadyLinkedStudent) {
      console.log(`⏭  Already linked: ${learnerUser.name} (${learnerUser.email})`)
      alreadyLinked++
      continue
    }

    // Strategy 1: match by learner email stored in parentEmail (old linking method)
    let student = await prisma.student.findFirst({
      where: { parentEmail: learnerUser.email, learnerUserId: null }
    })

    // Strategy 2: match by full name (firstName + lastName = user.name)
    if (!student) {
      const nameParts = learnerUser.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      if (firstName && lastName) {
        student = await prisma.student.findFirst({
          where: {
            firstName: { equals: firstName, mode: 'insensitive' },
            lastName: { equals: lastName, mode: 'insensitive' },
            learnerUserId: null
          }
        })
      }
    }

    if (student) {
      await prisma.student.update({
        where: { id: student.id },
        data: { learnerUserId: learnerUser.id }
      })
      console.log(`✅ Linked: ${learnerUser.name} (${learnerUser.email}) → Student ID: ${student.studentId}`)
      linked++
    } else {
      console.log(`❌ No match found for: ${learnerUser.name} (${learnerUser.email})`)
      notFound++
    }
  }

  console.log(`\n📊 Migration complete:`)
  console.log(`   ✅ Newly linked:     ${linked}`)
  console.log(`   ⏭  Already linked:  ${alreadyLinked}`)
  console.log(`   ❌ No match found:   ${notFound}`)

  if (notFound > 0) {
    console.log(`\n⚠️  For unmatched learners, check that the student's name in the`)
    console.log(`   Learners tab exactly matches the name on their user account.`)
  }

  await prisma.$disconnect()
}

linkLearnerUsers().catch(async (err) => {
  console.error('Migration failed:', err)
  await prisma.$disconnect()
  process.exit(1)
})