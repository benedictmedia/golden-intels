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

try {
  console.log('⏳ Applying Prisma migrations on startup...')
  execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  })
  console.log('✅ Prisma migrations deployed successfully')
} catch (error) {
  console.error('Failed to deploy Prisma migrations:', error)
}

const prisma = new PrismaClient()
const app = express()
const httpServer = createServer(app)

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://golden-intels.vercel.app',
    'https://golden-intels-git-main-golden-intels-projects.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}))

initSocket(httpServer)

app.use(express.json())

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
app.use('/api/users', require('./routes/users'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/messages', require('./routes/messageRoutes'))
app.use('/api/video-sessions', require('./routes/videoSessions'))

const seedDefaultUsers = async () => {
  const defaultUsers = [
    { email: 'admin@goldenintels.com', name: 'School Admin', role: 'admin' },
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

seedDefaultUsers()
  .then(() => {
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((error) => {
    console.error('Failed to seed default users:', error)
    process.exit(1)
  })
