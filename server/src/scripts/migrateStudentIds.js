const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrateStudentIds() {
  console.log('🔄 Starting Student ID migration...\n')

  // Fetch all students oldest-first so numbering follows enrolment order
  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'asc' }
  })

  console.log(`Found ${students.length} student(s) to process.\n`)

  // Group students by the year they were created
  const byYear = {}
  for (const student of students) {
    const year = new Date(student.createdAt).getFullYear()
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(student)
  }

  let updated = 0
  let skipped = 0

  for (const [year, group] of Object.entries(byYear).sort()) {
    console.log(`\n📅 Year ${year}: ${group.length} student(s)`)
    for (let i = 0; i < group.length; i++) {
      const student = group[i]
      const newId = `GI${year}${String(i + 1).padStart(4, '0')}`

      if (student.studentId === newId) {
        console.log(`  ⏭  Already correct: ${newId}`)
        skipped++
        continue
      }

      await prisma.student.update({
        where: { id: student.id },
        data: { studentId: newId }
      })
      console.log(`  ✅ ${student.studentId} → ${newId}`)
      updated++
    }
  }

  console.log(`\n📊 Migration complete:`)
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ⏭  Skipped (already correct): ${skipped}`)
  await prisma.$disconnect()
}

migrateStudentIds().catch(async (err) => {
  console.error('❌ Migration failed:', err)
  await prisma.$disconnect()
  process.exit(1)
})