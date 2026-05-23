const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const generateStudentId = async () => {
  const year = new Date().getFullYear()
  let studentId
  let isUnique = false
  
  while (!isUnique) {
    const count = await prisma.student.count()
    const random = Math.floor(Math.random() * 1000)
    const number = String(count + 1 + random).padStart(4, '0')
    studentId = `GI-${year}-${number}`
    
    const existing = await prisma.student.findUnique({ where: { studentId } })
    if (!existing) isUnique = true
  }
  
  return studentId
}

const getStudents = async (req, res) => {
  try {
    const order = { createdAt: 'desc' }
    if (req.user && req.user.role === 'parent') {
      const email = req.user.email
      const students = await prisma.student.findMany({
        where: {
          OR: [{ parentEmail: email }, { parentId: req.user.id }]
        },
        orderBy: order,
        include: { parent: { select: { id: true, name: true, email: true } } }
      })
      return res.json(students)
    }

    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findUnique({ where: { email: req.user.email } })
      const where = {}
      if (staff?.classes?.length) {
        where.gradeLevel = { in: staff.classes }
      } else if (staff?.department) {
        where.gradeLevel = staff.department
      }
      const students = await prisma.student.findMany({ where, orderBy: order, include: { parent: { select: { id: true, name: true, email: true } } } })
      return res.json(students)
    }

    const students = await prisma.student.findMany({ orderBy: order, include: { parent: { select: { id: true, name: true, email: true } } } })
    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createStudent = async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, gradeLevel, parentName, parentEmail, parentPhone, address, email, password } = req.body
  const learnerCredentialsProvided = Boolean(String(email || '').trim()) || Boolean(String(password || '').trim())

  if (learnerCredentialsProvided && (!email || !password)) {
    return res.status(400).json({ message: 'Learner email and password are required to create a learner dashboard account.' })
  }

  try {
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' })
      }
    }

    const studentId = await generateStudentId()
    let photo = null
    if (req.file) {
      photo = req.file.path
      console.log('Photo saved at:', photo)
    }

    let parentId = null
    if (parentEmail) {
      const parentUser = await prisma.user.findUnique({ where: { email: parentEmail } })
      if (parentUser && parentUser.role === 'parent') parentId = parentUser.id
    }

    const student = await prisma.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: { studentId, firstName, lastName, dateOfBirth, gender, gradeLevel, parentId, parentName, parentEmail, parentPhone, address, photo }
      })

      if (email && password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        await tx.user.create({
          data: {
            name: [firstName, lastName].filter(Boolean).join(' ') || email,
            email,
            password: hashedPassword,
            role: 'learner'
          }
        })
      }

      return createdStudent
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
    let parentId = existing?.parentId || null
    if (req.body.parentEmail) {
      const parentUser = await prisma.user.findUnique({ where: { email: req.body.parentEmail } })
      if (parentUser && parentUser.role === 'parent') parentId = parentUser.id
      else parentId = null
    }
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { ...req.body, photo, parentId }
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