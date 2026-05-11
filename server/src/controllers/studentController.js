const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Generate student ID
const generateStudentId = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.student.count()
  const number = String(count + 1).padStart(4, '0')
  return `GI-${year}-${number}`
}

// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Create student
const createStudent = async (req, res) => {
  const {
    firstName, lastName, dateOfBirth, gender,
    gradeLevel, parentName, parentEmail, parentPhone, address
  } = req.body

  try {
    const studentId = await generateStudentId()
   const photo = req.file ? req.file.path : null
   
    const student = await prisma.student.create({
      data: {
        studentId,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        gradeLevel,
        parentName,
        parentEmail,
        parentPhone,
        address,
        photo,
      }
    })
    res.status(201).json(student)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update student
const updateStudent = async (req, res) => {
  const { id } = req.params
  try {
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: req.body
    })
    res.json(student)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete student
const deleteStudent = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.student.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getStudents, createStudent, updateStudent, deleteStudent }