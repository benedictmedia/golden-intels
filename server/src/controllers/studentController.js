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
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const normalizeClassName = (value) => String(value ?? '').trim().toLowerCase()
      const students = await prisma.student.findMany({ 
        orderBy: order, 
        include: { parent: { select: { id: true, name: true, email: true } } } 
      })

      if (!staff) return res.json([])

      const teacherClasses = Array.from(new Set([
        ...(staff.classes || []),
        ...(staff.classTeacherClasses || [])
      ].map(normalizeClassName).filter(Boolean)))

      const filteredStudents = teacherClasses.length
        ? students.filter(student => teacherClasses.includes(normalizeClassName(student.gradeLevel)))
        : students.filter(student => normalizeClassName(student.gradeLevel) === normalizeClassName(staff.department))

      return res.json(filteredStudents)
    }

    const students = await prisma.student.findMany({ 
      orderBy: order, 
      include: { parent: { select: { id: true, name: true, email: true } } } 
    })
    res.json(students)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const createStudent = async (req, res) => {
  try {
    const {
      firstName, lastName, dateOfBirth, gender, gradeLevel,
      parentName, parentEmail, parentPhone, address,
      email, learnerEmail, password
    } = req.body

    const finalEmail = (email || learnerEmail || '').trim() || null
    const finalPassword = (password || '').trim() || null

    // Both email AND password required together if either is provided
    if ((finalEmail || finalPassword) && !(finalEmail && finalPassword)) {
      return res.status(400).json({
        message: 'Both learner email and password are required to create a dashboard account.'
      })
    }

    // Prevent duplicate User email
    if (finalEmail) {
      const existing = await prisma.user.findUnique({ where: { email: finalEmail } })
      if (existing) {
        return res.status(400).json({ message: `A user with email "${finalEmail}" already exists.` })
      }
    }

    const studentId = await generateStudentId()
    const photo = req.file ? (req.file.path || req.file.secure_url) : null

    // Link to existing parent account if parentEmail matches a parent user
    let parentId = null
    if (parentEmail) {
      const parentUser = await prisma.user.findUnique({ where: { email: parentEmail } })
      if (parentUser && parentUser.role === 'parent') parentId = parentUser.id
    }

    const student = await prisma.$transaction(async (tx) => {
      let learnerUserId = null

      // Create a User account for the learner if credentials were provided
      if (finalEmail && finalPassword) {
        const hashed = await bcrypt.hash(finalPassword, 10)
        const learnerUser = await tx.user.create({
          data: {
            name: [firstName, lastName].filter(Boolean).join(' ') || finalEmail,
            email: finalEmail,
            password: hashed,
            role: 'learner'
          }
        })
        learnerUserId = learnerUser.id
      }

      return await tx.student.create({
        data: {
          studentId,
          firstName,
          lastName,
          dateOfBirth:  dateOfBirth  || null,
          gender,
          gradeLevel,
          parentId,
          parentName,
          parentEmail:  parentEmail  || null,
          parentPhone:  parentPhone  || null,
          address:      address      || null,
          email:        finalEmail,
          learnerUserId,
          photo,
          status: 'active'
        }
      })
    })

    res.status(201).json(student)
  } catch (error) {
    console.error('Create Student Error:', error)
    res.status(400).json({ message: error.message || 'Failed to create student' })
  }
}

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params

    // Whitelist only the fields admin is allowed to update — never spread the whole body
    const {
      firstName, lastName, dateOfBirth, gender, gradeLevel,
      parentName, parentEmail, parentPhone, address, status,
      email, learnerEmail
    } = req.body

    const data = {}
    if (firstName !== undefined)   data.firstName   = firstName
    if (lastName !== undefined)    data.lastName    = lastName
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth
    if (gender !== undefined)      data.gender      = gender
    if (gradeLevel !== undefined)  data.gradeLevel  = gradeLevel
    if (parentName !== undefined)  data.parentName  = parentName
    if (parentEmail !== undefined) data.parentEmail = parentEmail
    if (parentPhone !== undefined) data.parentPhone = parentPhone
    if (address !== undefined)     data.address     = address
    if (status !== undefined)      data.status      = status

    // email field: accept either key from frontend
    const finalEmail = email || learnerEmail
    if (finalEmail !== undefined)  data.email       = finalEmail

    // If parentEmail changed, try to re-link to the parent's user account
    if (parentEmail) {
      const parentUser = await prisma.user.findUnique({ where: { email: parentEmail } })
      if (parentUser && parentUser.role === 'parent') {
        data.parentId = parentUser.id
      }
    }

    // Handle photo if a new file was uploaded
    if (req.file) {
      data.photo = req.file.path || req.file.secure_url
    }

    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data
    })

    res.json(student)
  } catch (error) {
    console.error('Update Student Error:', error)
    res.status(400).json({ message: error.message || 'Failed to update student' })
  }
}

// Creates/links a login account for an existing student who has none
const createLearnerLogin = async (req, res) => {
  const { id } = req.params
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const student = await prisma.student.findUnique({ where: { id: parseInt(id) } })
    if (!student) return res.status(404).json({ message: 'Student not found.' })

    if (student.learnerUserId) {
      return res.status(400).json({ message: 'This student already has a login account.' })
    }

    // Check no other user owns this email
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: `The email "${email}" is already used by another account.` })
    }

    const hashed = await bcrypt.hash(password, 10)

    const updated = await prisma.$transaction(async (tx) => {
      const learnerUser = await tx.user.create({
        data: {
          name: `${student.firstName} ${student.lastName}`.trim(),
          email,
          password: hashed,
          role: 'learner'
        }
      })
      return await tx.student.update({
        where: { id: parseInt(id) },
        data: { email, learnerUserId: learnerUser.id }
      })
    })

    res.json({ message: 'Login created and linked successfully.', student: updated })
  } catch (error) {
    console.error('Create learner login error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteStudent = async (req, res) => {
  const { id } = req.params
  const studentId = parseInt(id)
  try {
    await prisma.result.deleteMany({ where: { studentId } })
    await prisma.attendanceRecord.deleteMany({ where: { studentId } })
    await prisma.feePayment.deleteMany({ where: { studentId } })
    await prisma.message.deleteMany({ where: { conversationUserId: studentId } })

    await prisma.student.delete({ where: { id: studentId } })

    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Delete student error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getMyProfile = async (req, res) => {
  try {
    const userId  = req.user.id
    const userEmail = req.user.email

    // 1. Most reliable — look up by the learner's linked user account ID
    let student = await prisma.student.findFirst({
      where: { learnerUserId: userId },
      include: { parent: { select: { id: true, name: true, email: true } } }
    })

    // 2. Fallback for older records — match by the student's own email field
    if (!student) {
      student = await prisma.student.findFirst({
        where: { email: userEmail },
        include: { parent: { select: { id: true, name: true, email: true } } }
      })
    }

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' })
    }

    res.json(student)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getStudents, getMyProfile, createStudent, updateStudent, deleteStudent }