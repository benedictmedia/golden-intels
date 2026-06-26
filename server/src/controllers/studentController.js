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
    } = req.body;

    const finalEmail = email || learnerEmail;

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        gradeLevel,
        parentName,
        parentEmail,
        parentPhone,
        address,
        email: finalEmail,           // ← This should now work after schema update
        photo: req.file ? (req.file.path || req.file.secure_url) : null,
        status: 'active',
        studentId: await generateStudentId()
      }
    });

    // Create learner account if email + password provided
    if (finalEmail && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: finalEmail,
          password: hashedPassword,
          role: 'learner',
          // Remove studentId if it causes error — link via learnerUserId instead
        }
      });
    }

    res.status(201).json(student);
  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(400).json({ message: error.message || 'Failed to create student' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Remove id and other sensitive fields from update data
    const { id: _, studentId: __, createdAt: ___, updatedAt: ____, ...updateData } = req.body;

    // Normalize email field
    if (req.body.email || req.body.learnerEmail) {
      updateData.email = req.body.email || req.body.learnerEmail;
    }

    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(student);
  } catch (error) {
    console.error("Update Student Error:", error);
    res.status(400).json({ message: error.message || 'Failed to update student' });
  }
};

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
    const userId = req.user.id
    const userEmail = req.user.email

    let student = await prisma.student.findFirst({
      where: { learnerUserId: userId },
      include: { parent: { select: { id: true, name: true, email: true } } }
    })

    if (!student) {
      student = await prisma.student.findFirst({
        where: { OR: [{ parentEmail: userEmail }] },
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