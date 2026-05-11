const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Generate a random serial number
const generateSerial = () => {
  const prefix = 'GI'
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}-${year}-${random}`
}

// Generate a random PIN
const generatePin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Create admission token (admin only)
const createToken = async (req, res) => {
  try {
    const serialNumber = generateSerial()
    const pin = generatePin()
    const hashedPin = await bcrypt.hash(pin, 10)

    const token = await prisma.admissionToken.create({
      data: {
        serialNumber,
        pin: hashedPin,
      }
    })

    // Return plain pin only once
    res.status(201).json({
      id: token.id,
      serialNumber: token.serialNumber,
      pin,
      createdAt: token.createdAt,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all tokens (admin only)
const getTokens = async (req, res) => {
  try {
    const tokens = await prisma.admissionToken.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(tokens)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Verify token (public)
const verifyToken = async (req, res) => {
  const { serialNumber, pin } = req.body
  try {
    const token = await prisma.admissionToken.findUnique({
      where: { serialNumber }
    })

    if (!token) {
      return res.status(404).json({ message: 'Invalid serial number.' })
    }

    if (token.used) {
      return res.status(400).json({ message: 'This token has already been used.' })
    }

    const isMatch = await bcrypt.compare(pin, token.pin)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid PIN.' })
    }

    res.json({ message: 'Token verified successfully.', serialNumber: token.serialNumber })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Mark token as used
const markTokenUsed = async (req, res) => {
  const { serialNumber } = req.body
  try {
    const token = await prisma.admissionToken.update({
      where: { serialNumber },
      data: { used: true, usedAt: new Date() }
    })
    res.json(token)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete token (admin only)
const deleteToken = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.admissionToken.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Token deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createToken, getTokens, verifyToken, markTokenUsed, deleteToken }