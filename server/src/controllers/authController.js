const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prismaClient')

// Generate JWT
const generateToken = (id, role, name, email) => {
  return jwt.sign({ id, role, name, email }, process.env.JWT_SECRET, { expiresIn: '7d' })
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

const generateStudentId = async (tx) => {
  const year = new Date().getFullYear()
  let studentId
  let isUnique = false

  while (!isUnique) {
    const count = await tx.student.count()
    const random = Math.floor(Math.random() * 1000)
    const number = String(count + 1 + random).padStart(4, '0')
    studentId = `GI-${year}-${number}`
    const existing = await tx.student.findUnique({ where: { studentId } })
    if (!existing) isUnique = true
  }

  return studentId
}

const buildUserResponse = async (user) => {
  const responseUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active
  }

  if (user.role === 'teacher') {
    const accountStaff = await prisma.staff.findFirst({
      where: { email: user.email, source: 'account' },
      orderBy: { createdAt: 'desc' }
    })

    const staff = accountStaff || await prisma.staff.findFirst({
      where: { email: user.email, source: 'manual' },
      orderBy: { createdAt: 'desc' }
    })

    if (staff) {
      responseUser.classes = staff.classes || []
      responseUser.subjects = staff.subjects || []
      responseUser.classTeacherClasses = staff.classTeacherClasses || []
      responseUser.department = staff.department
      responseUser.staffSubject = staff.subject || null
      responseUser.bio = staff.bio || null
      responseUser.phone = staff.phone || null
      responseUser.photo = staff.photo || null
    }
  }

  return responseUser
}

// Register
const register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    subject: teacherSubject,
    classes,
    subjects,
    classTeacherClasses,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    gradeLevel,
    parentEmail,
    parentName,
    parentPhone,
    address
  } = req.body

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: { name, email, password: hashedPassword, role: role || 'parent' }
      })

      if (createdUser.role === 'teacher') {
        const parsedClasses = parseArrayField(classes)
        const parsedSubjects = parseArrayField(subjects)
        const parsedClassTeacherClasses = parseArrayField(classTeacherClasses)
        const hasTeacherAssignments = parsedClasses.length > 0 || parsedSubjects.length > 0 || parsedClassTeacherClasses.length > 0 || Boolean(teacherSubject)

        if (hasTeacherAssignments) {
          await tx.staff.create({
            data: {
              name,
              role: 'teacher',
              department: department || 'Teaching',
              subject: teacherSubject || parsedSubjects[0] || null,
              subjects: parsedSubjects,
              classes: parsedClasses,
              classTeacherClasses: parsedClassTeacherClasses,
              source: 'account',
              email,
              phone: null,
              category: 'teaching'
            }
          })
        }
      }

      if (createdUser.role === 'learner') {
        const studentFirstName = firstName || name.split(' ')[0] || ''
        const studentLastName = lastName || name.split(' ').slice(1).join(' ') || ''
        const parsedParentEmail = parentEmail || null
        if (studentFirstName && studentLastName && gender && gradeLevel) {
          let parentId = null
          if (parsedParentEmail) {
            const parentUser = await tx.user.findUnique({ where: { email: parsedParentEmail } })
            if (parentUser && parentUser.role === 'parent') parentId = parentUser.id
          }

          const studentId = await generateStudentId(tx)
          await tx.student.create({
            data: {
              studentId,
              firstName: studentFirstName,
              lastName: studentLastName,
              dateOfBirth,
              gender,
              gradeLevel,
              parentId,
              parentName: parentName || `${studentFirstName} ${studentLastName}`,
              parentEmail: parsedParentEmail,
              parentPhone: parentPhone || null,
              address: address || null
            }
          })
        }
      }

      return createdUser
    })

    const token = generateToken(user.id, user.role, user.name, user.email)
    const responseUser = await buildUserResponse(user)
    res.status(201).json({ token, user: responseUser })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Login
const login = async (req, res) => {
  const { email, password } = req.body
  try {
    // Ensure DB is awake before querying
    await prisma.$queryRaw`SELECT 1`

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    // Block login if user is not active
    if (user.active === false) return res.status(403).json({ message: 'Account deactivated' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    const token = generateToken(user.id, user.role, user.name, user.email)
    const responseUser = await buildUserResponse(user)
    res.json({ token, user: responseUser })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const responseUser = await buildUserResponse(user)
    res.json(responseUser)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { register, login, getMe }