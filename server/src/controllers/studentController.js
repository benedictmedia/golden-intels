const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const generateStudentId = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.student.count()
  const number = String(count + 1).padStart(4, '0')
  return `GI-${year}-${number}`
}

const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createStudent = async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, gradeLevel, parentName, parentEmail, parentPhone, address } = req.body
  try {
    const studentId = await generateStudentId()
    let photo = null
    if (req.file) {
      photo = req.file.path
      console.log('Photo saved at:', photo)
    }
    const student = await prisma.student.create({
      data: { studentId, firstName, lastName, dateOfBirth, gender, gradeLevel, parentName, parentEmail, parentPhone, address, photo }
    })
    console.log('✅ Student created successfully:', student.id)
    res.status(201).json(student)
  } catch (error) {
    console.error('Create student error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateStudent = async (req, res) => {
  const { id } = req.params
  try {
    const existing = await prisma.student.findUnique({ where: { id: parseInt(id) } })
    const photo = req.file ? req.file.path : existing?.photo
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { ...req.body, photo }
    })
    res.json(student)
  } catch (error) {
    console.error('Update student error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteStudent = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.student.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Delete student error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getStudents, createStudent, updateStudent, deleteStudent }