const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

const getStaff = async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const parseArrayField = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean)
    } catch {
      return value.split(',').map(v => v.trim()).filter(Boolean)
    }
  }
  return []
}

const createStaff = async (req, res) => {
  try {
    const { name, role, department, subject, bio, email, phone, category, classes, subjects } = req.body
    const parsedClasses = parseArrayField(classes)
    const parsedSubjects = parseArrayField(subjects)
    const photo = req.file ? req.file.path : null
    const staff = await prisma.staff.create({
      data: {
        name,
        role,
        department,
        subject: subject || parsedSubjects[0] || null,
        subjects: parsedSubjects,
        classes: parsedClasses,
        bio,
        email,
        phone,
        category,
        photo
      }
    })
    res.status(201).json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateStaff = async (req, res) => {
  const { id } = req.params
  try {
    const { name, role, department, subject, bio, email, phone, category, classes, subjects } = req.body
    const existing = await prisma.staff.findUnique({ where: { id: parseInt(id) } })
    const parsedClasses = parseArrayField(classes)
    const parsedSubjects = parseArrayField(subjects)
    const photo = req.file ? req.file.path : existing?.photo
    const staff = await prisma.staff.update({
      where: { id: parseInt(id) },
      data: {
        name,
        role,
        department,
        subject: subject || parsedSubjects[0] || existing?.subject || null,
        subjects: parsedSubjects,
        classes: parsedClasses,
        bio,
        email,
        phone,
        category,
        photo
      }
    })
    res.json(staff)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteStaff = async (req, res) => {
  const { id } = req.params
  try {
    const staff = await prisma.staff.findUnique({ where: { id: parseInt(id) } })
    if (staff?.photo) {
      const fullPath = path.join(__dirname, '../../', staff.photo)
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    }
    await prisma.staff.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Staff deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getStaff, createStaff, updateStaff, deleteStaff }