const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const bcrypt = require('bcryptjs')
const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')
const { createServer } = require('http')
const { initSocket } = require('./socket')

dotenv.config()

// DATABASE_URL remains the Neon source until the one-time migration verifies.
// Once SUPABASE_DATABASE_URL is configured, copy the data before serving traffic,
// then use Supabase for all Prisma-backed school-management requests.
const useSupabaseDatabase = Boolean(process.env.SUPABASE_DATABASE_URL)
const runtimeDatabaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL

try {
  if (useSupabaseDatabase) {
    console.log('⏳ Preparing and verifying Neon → Supabase database migration...')
    execSync('node prisma/migrate-neon-to-supabase.js', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })
    console.log('✅ Supabase database migration verified')
  } else {
    console.log('⏳ Applying Prisma migrations to the configured database...')
    execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })
    console.log('✅ Prisma migrations deployed successfully')
  }
} catch (error) {
  console.error('Database preparation failed. Server startup is aborted to protect school data:', error)
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: { db: { url: runtimeDatabaseUrl } }
})

// Verify the selected database before accepting traffic.
const waitForDB = async (retries = 10, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log(`✅ ${useSupabaseDatabase ? 'Supabase' : 'Neon'} database connected`)
      return true
    } catch (err) {
      console.warn(`⏳ DB not ready (attempt ${i}/${retries}), retrying in ${delay/1000}s...`)
      await new Promise(res => setTimeout(res, delay))
    }
  }
  throw new Error('Could not connect to the configured application database.')
}

const app = express()
const httpServer = createServer(app)

const configuredOrigins = [
  ...(process.env.CORS_ORIGINS || '').split(','),
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
]
  .map((origin) => origin?.trim())
  .filter(Boolean)
  .map((origin) => {
    try {
      const url = new URL(origin)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Only HTTP and HTTPS origins are supported')
      }
      return url.origin
    } catch {
      throw new Error(`Invalid frontend origin in CORS configuration: ${origin}`)
    }
  })

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://goldenintels.edu.gh',
    'https://www.goldenintels.edu.gh',
    'https://golden-intels.vercel.app',
    'https://golden-intels-git-main-golden-intels-projects.vercel.app',
    ...configuredOrigins
  ],
  credentials: true
}))

app.disable('x-powered-by')
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

initSocket(httpServer)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const notificationRoutes = require('./routes/notifications')
app.use('/api/notifications', notificationRoutes)

// Serve uploaded files
const uploadsPath = path.join(__dirname, '../uploads')
app.use('/uploads', express.static(uploadsPath))
console.log('✅ Static uploads folder served')

app.get('/', (req, res) => {
  res.json({ message: 'Golden-Intels Server is running!' })
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/students', require('./routes/students'))
app.use('/api/results', require('./routes/results'))
app.use('/api/admission-tokens', require('./routes/admissionTokens'))
app.use('/api/admissions', require('./routes/admissions'))
app.use('/api/gallery', require('./routes/gallery'))
app.use('/api/news', require('./routes/newsEvents'))
app.use('/api/staff', require('./routes/staff'))
app.use('/api/fees', require('./routes/fees'))
app.use('/api/attendance', require('./routes/attendance'))
app.use('/api/manual-exercises', require('./routes/manualExercises'))
app.use('/api/users', require('./routes/users'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/messages', require('./routes/messageRoutes'))
app.use('/api/video-sessions', require('./routes/videoSessions'))
app.use('/api/signature', require('./routes/signature'))
app.use('/api/academic-context', require('./routes/academicContext'))
app.use('/api/classwork', require('./routes/classwork'))
app.use('/api/archives', require('./routes/archives'))

const seedDefaultUsers = async () => {
  const defaultUsers = [
    { email: 'goldenintelse@gmail.com', name: 'School Admin', role: 'admin' },
    { email: 'teacher@goldenintels.com', name: 'Demo Teacher', role: 'teacher' },
    { email: 'parent@goldenintels.com', name: 'Demo Parent', role: 'parent' }
  ]

  const hashedPassword = await bcrypt.hash('admin123', 10)

  for (const user of defaultUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role
      }
    })
  }
}

const PORT = process.env.PORT || 5000

const startServer = async () => {
  await waitForDB()
  if (process.env.SEED_DEMO_USERS === 'true' && process.env.NODE_ENV !== 'production') {
    try {
      await seedDefaultUsers()
      console.log('✅ Default users seeded')
    } catch (err) {
      console.warn('⚠️ Seed skipped:', err.message)
    }
  } else {
    console.log('ℹ️ Default demo users are not enabled')
  }
  httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
}

startServer().catch(error => {
  console.error('Server startup failed:', error)
  process.exit(1)
})
