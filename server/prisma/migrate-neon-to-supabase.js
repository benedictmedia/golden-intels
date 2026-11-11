/**
 * One-time, resumable copy of the school's Prisma data from Neon to Supabase.
 * Source DATABASE_URL remains unchanged. Destination is SUPABASE_DATABASE_URL.
 * This script does not delete or truncate source or destination records.
 */
const { execFileSync } = require('child_process')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const sourceUrl = process.env.DATABASE_URL
const targetUrl = process.env.SUPABASE_DATABASE_URL
if (!sourceUrl) throw new Error('DATABASE_URL (Neon source) is required.')
if (!targetUrl) throw new Error('SUPABASE_DATABASE_URL (Supabase destination) is required.')
if (sourceUrl === targetUrl) throw new Error('Source and destination URLs must differ.')

const cwd = path.join(__dirname, '..')
console.log('Preparing Supabase schema from committed Prisma migrations...')
execFileSync('npx', ['prisma', 'migrate', 'deploy', '--schema=prisma/schema.prisma'], {
  cwd,
  env: { ...process.env, DATABASE_URL: targetUrl },
  stdio: 'inherit'
})

const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } })
const target = new PrismaClient({ datasources: { db: { url: targetUrl } } })
const migrationKey = 'neon-to-supabase-prisma-v1'

// Copy parents before dependent records. All IDs and original timestamps are retained.
const models = [
  ['user', 'User', true],
  ['admissionApplication', 'AdmissionApplication', true],
  ['student', 'Student', true],
  ['accountAudit', 'AccountAudit', true],
  ['admissionToken', 'AdmissionToken', true],
  ['archiveRecord', 'ArchiveRecord', true],
  ['attendanceRecord', 'AttendanceRecord', true],
  ['classworkItem', 'ClassworkItem', true],
  ['classworkSubmission', 'ClassworkSubmission', true],
  ['contactMessage', 'ContactMessage', true],
  ['feeStructure', 'FeeStructure', true],
  ['galleryItem', 'GalleryItem', true],
  ['manualExercise', 'ManualExercise', true],
  ['message', 'Message', true],
  ['newsEvent', 'NewsEvent', true],
  ['notification', 'Notification', false],
  ['passwordResetToken', 'PasswordResetToken', true],
  ['result', 'Result', true],
  ['setting', 'Setting', true],
  ['staff', 'Staff', true],
  ['videoSession', 'VideoSession', true],
  ['academicContext', 'AcademicContext', true],
  ['feePayment', 'FeePayment', true]
]

const run = async () => {
  await source.$queryRaw`SELECT 1`
  await target.$queryRaw`SELECT 1`

  await target.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public."_NeonDataMigrationLog" (
      "migrationKey" text PRIMARY KEY,
      "completedAt" timestamptz NOT NULL DEFAULT now()
    )
  `)
  await target.$executeRawUnsafe('ALTER TABLE public."_NeonDataMigrationLog" ENABLE ROW LEVEL SECURITY')

  const done = await target.$queryRawUnsafe(
    'SELECT "migrationKey" FROM public."_NeonDataMigrationLog" WHERE "migrationKey" = $1',
    migrationKey
  )
  if (done.length) {
    console.log('Neon-to-Supabase copy already completed; no records changed.')
    return
  }

  const summary = []
  for (const [delegateName, tableName, hasSerialId] of models) {
    const from = source[delegateName]
    const to = target[delegateName]
    let offset = 0
    let copied = 0
    while (true) {
      const batch = await from.findMany({ skip: offset, take: 200, orderBy: { id: 'asc' } })
      if (!batch.length) break
      const result = await to.createMany({ data: batch, skipDuplicates: true })
      copied += result.count
      offset += batch.length
      if (batch.length < 200) break
    }

    const sourceCount = await from.count()
    const targetCount = await to.count()
    if (sourceCount !== targetCount) {
      throw new Error(
        `${tableName} verification failed: Neon has ${sourceCount}, Supabase has ${targetCount}. Migration marker was not written; source remains unchanged.`
      )
    }

    summary.push({ table: tableName, sourceCount, targetCount, newlyCopied: copied })
    console.log(`Verified ${tableName}: ${sourceCount} records`)

    if (hasSerialId) {
      await target.$queryRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('public."${tableName}"', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM public."${tableName}"`
      )
    }

    await target.$executeRawUnsafe(`ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY`)
  }

  // The application uses a separate, existing snake_case news_events table for public news.
  // Do not overwrite it: its three existing published records remain untouched.
  await target.$executeRawUnsafe('ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY')

  await target.$executeRawUnsafe(
    'INSERT INTO public."_NeonDataMigrationLog" ("migrationKey") VALUES ($1) ON CONFLICT ("migrationKey") DO NOTHING',
    migrationKey
  )

  console.log('Migration verification complete:', JSON.stringify(summary))
  console.log('All source tables match their Supabase counterparts.')
}

run()
  .catch(error => {
    console.error('Neon-to-Supabase migration failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await Promise.allSettled([source.$disconnect(), target.$disconnect()])
  })
