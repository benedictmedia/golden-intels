const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://golden-intels.vercel.app',
    'https://golden-intels-git-main-golden-intels-projects.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}))

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

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})