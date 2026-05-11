const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Register
const register = async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'parent' }
    })
    const token = generateToken(user.id, user.role)
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Login
const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    const token = generateToken(user.id, user.role)
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { register, login, getMe }