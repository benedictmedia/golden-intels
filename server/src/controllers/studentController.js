const { PrismaClient } = require('@prisma/client')
const { archive } = require('../utils/archive')
const { canonicalStudentClassName, normalizeStudentClassName } = require('../utils/studentClasses')
const { createParentAccountIfNeeded, createLearnerAccount } = require('../utils/studentAccounts')
const { getAgeFromDateOfBirth } = require('../utils/studentAge')
const prisma = new PrismaClient()

// Every "admission form" field that lives on Student in addition to the core
// fields (firstName, lastName, dateOfBirth, gender, gradeLevel, parentName,
// parentEmail, parentPhone, address, status, email). These are optional on
// Student, so a manually-added learner can be created with just the core
// fields and have the rest filled in later from the Edit screen.
const EXTENDED_PROFILE_FIELDS = [
  'monthOfBirth', 'placeOfBirth', 'height', 'weight', 'hometown',
  'motherTongue', 'religion', 'dateOfAdmission', 'previousSchool',
  'parentOccupation', 'secondaryContactName', 'secondaryContactPhone',
  'fatherName', 'fatherAddress', 'fatherNationality', 'fatherMaritalStatus',
  'fatherPhone', 'fatherHouseNumber', 'fatherReligion', 'fatherOccupation',
  'fatherPlaceOfWork', 'fatherEducation', 'fatherEmail',
  'motherName', 'motherAddress', 'motherNationality', 'motherMaritalStatus',
  'motherPhone', 'motherHouseNumber', 'motherReligion', 'motherOccupation',
  'motherPlaceOfWork', 'motherEducation', 'motherEmail',
  'livesWith', 'olderChildren', 'youngerChildren',
  'language1', 'language2', 'language3', 'language4',
  'medicalConditions', 'allergies', 'specialNeeds',
  'doctorName', 'doctorPhone', 'hospitalName', 'hospitalPhone',
  'emergencyName', 'emergencyRelationship', 'emergencyPhone',
  'emergencyEmail', 'emergencyAddress', 'emergencyWhatsapp',
]

// Document/photo fields that come in as uploaded files (multer .fields()).
// Key = form field name, value = Student column name (same for all of these).
const DOCUMENT_FIELDS = ['photo', 'nhisFront', 'nhisBack', 'ghanaFront', 'ghanaBack', 'signedBooklet']
const normalizeLearnerName = (value) => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
const withCurrentAge = (student) => ({
  ...student,
  age: getAgeFromDateOfBirth(student.dateOfBirth)
})

// Pulls only the extended-profile keys that were actually sent in the body,
// so a partial edit never clobbers fields the admin didn't touch.
const pickExtendedFields = (body) => {
  const data = {}
  for (const field of EXTENDED_PROFILE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field] === '' ? null : body[field]
  }
  return data
}

// Resolves an uploaded file (Cloudinary or local disk) to a storable URL,
// same convention used for admission uploads.
const getFileUrl = (req, file) => {
  if (!file) return null
  if (file.path?.startsWith('http')) return file.path
  if (file.secure_url) return file.secure_url
  if (file.url) return file.url
  if (file.path) return `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`
  return null
}

// req.files can be either an array (upload.single) or an object keyed by
// fieldname (upload.fields([...])) depending on which multer method the
// route uses. This normalizes both into { fieldname: url }.
const extractDocumentUrls = (req) => {
  const urls = {}
  if (!req.files) {
    // Single-file upload (legacy `upload.single('photo')`) lands on req.file
    if (req.file) urls.photo = getFileUrl(req, req.file)
    return urls
  }
  for (const field of DOCUMENT_FIELDS) {
    const fileArr = req.files[field]
    if (fileArr && fileArr[0]) urls[field] = getFileUrl(req, fileArr[0])
  }
  return urls
}

const generateStudentId = async () => {
  const year = new Date().getFullYear()

  const countThisYear = await prisma.student.count({
    where: {
      studentId: {
        startsWith: `STU${year}`
      }
    }
  })

  let nextNumber = countThisYear + 1
  let studentId
  let isUnique = false

  // Safety loop: if the sequential number is somehow taken, increment until free
  while (!isUnique) {
    studentId = `STU${year}${String(nextNumber).padStart(5, '0')}`
    const existing = await prisma.student.findUnique({ where: { studentId } })
    if (!existing) {
      isUnique = true
    } else {
      nextNumber++
    }
  }

  return studentId
}

const includeLearnerAccountStatus = async (students) => {
  const learnerUserIds = students.map(student => student.learnerUserId).filter(Boolean)
  if (!learnerUserIds.length) {
    return students.map(student => ({ ...student, learnerAccountActive: null }))
  }

  const learnerUsers = await prisma.user.findMany({
    where: { id: { in: learnerUserIds }, role: 'learner' },
    select: { id: true, active: true }
  })
  const activeByUserId = new Map(learnerUsers.map(learner => [learner.id, learner.active]))
  return students.map(student => ({
    ...student,
    learnerAccountActive: activeByUserId.get(student.learnerUserId) ?? null
  }))
}

const getStudents = async (req, res) => {
  try {
    const order = { createdAt: 'desc' }
    const activeLearnerWhere = {
      archivedAt: null,
      OR: [{ status: null }, { status: { notIn: ['transferred', 'graduated', 'archived'] } }]
    }
    if (req.user && req.user.role === 'parent') {
      const email = req.user.email
      const students = await prisma.student.findMany({
        where: {
          AND: [activeLearnerWhere, { OR: [{ parentEmail: email }, { parentId: req.user.id }] }]
        },
        orderBy: order,
        include: { parent: { select: { id: true, name: true, email: true } } }
      })
      return res.json(students.map(withCurrentAge))
    }

    if (req.user && req.user.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      const students = await prisma.student.findMany({ 
        where: activeLearnerWhere,
        orderBy: order, 
        include: { parent: { select: { id: true, name: true, email: true } } } 
      })

      if (!staff) return res.json([])

      const teacherClasses = Array.from(new Set([
        ...(staff.classes || []),
        ...(staff.classTeacherClasses || [])
      ].map(value => normalizeStudentClassName(canonicalStudentClassName(value))).filter(Boolean)))

      const filteredStudents = teacherClasses.length
        ? students.filter(student => teacherClasses.includes(normalizeStudentClassName(canonicalStudentClassName(student.gradeLevel))))
        : students.filter(student => normalizeStudentClassName(canonicalStudentClassName(student.gradeLevel)) === normalizeStudentClassName(canonicalStudentClassName(staff.department)))

      return res.json(filteredStudents.map(withCurrentAge))
    }

    const students = await prisma.student.findMany({ 
      where: activeLearnerWhere,
      orderBy: order, 
      include: { parent: { select: { id: true, name: true, email: true } } } 
    })
    const learners = req.user?.role === 'admin' ? await includeLearnerAccountStatus(students) : students
    res.json(learners.map(withCurrentAge))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const createStudent = async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can create learner records.' })
  }

  try {
    const {
      firstName, lastName, dateOfBirth, gender, gradeLevel,
      parentName, parentEmail, parentPhone, address,
      studentId: requestedStudentId,
      division, academicYear, street, city, state
    } = req.body

    const studentId = requestedStudentId?.trim() || await generateStudentId()
    const documentUrls = extractDocumentUrls(req)
    const extendedData = pickExtendedFields(req.body)

    const student = await prisma.$transaction(async (tx) => {
      const parentId = await createParentAccountIfNeeded(tx, { email: parentEmail, name: parentName })
      const learnerAccount = await createLearnerAccount(tx, { firstName, lastName, studentId })

      return await tx.student.create({
        data: {
          studentId,
          firstName,
          lastName,
          dateOfBirth:  dateOfBirth  || null,
          age: getAgeFromDateOfBirth(dateOfBirth),
          gender,
          gradeLevel: canonicalStudentClassName(gradeLevel),
          division: division || null,
          academicYear: academicYear || null,
          parentId,
          parentName: parentName || 'Not provided',
          parentEmail:  parentEmail  || null,
          parentPhone:  parentPhone  || null,
          address:      address || [street, city, state].filter(Boolean).join(', ') || null,
          street:       street       || null,
          city:         city         || null,
          state:        state        || null,
          email:        learnerAccount.email,
          learnerUserId: learnerAccount.id,
          photo: documentUrls.photo || null,
          nhisFront: documentUrls.nhisFront || null,
          nhisBack: documentUrls.nhisBack || null,
          ghanaFront: documentUrls.ghanaFront || null,
          ghanaBack: documentUrls.ghanaBack || null,
          signedBooklet: documentUrls.signedBooklet || null,
          status: 'active',
          source: 'manual',
          ...extendedData
        }
      })
    })

    res.status(201).json({ ...student, learnerAccountActive: false })
  } catch (error) {
    console.error('Create Student Error:', error)
    res.status(error.statusCode || 400).json({ message: error.message || 'Failed to create student' })
  }
}

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Only administrators can update learner records.' })

    // Whitelist only the fields admin is allowed to update — never spread the whole body
    const {
      firstName, lastName, dateOfBirth, gender, gradeLevel,
      parentName, parentEmail, parentPhone, address, status,
      email, learnerEmail, studentId, division, academicYear, street, city, state
    } = req.body

    const data = {}
    if (studentId !== undefined && !String(studentId).trim()) {
      return res.status(400).json({ message: 'Student ID cannot be empty.' })
    }
    if (firstName !== undefined)   data.firstName   = firstName
    if (lastName !== undefined)    data.lastName    = lastName
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth
    if (gender !== undefined)      data.gender      = gender
    if (gradeLevel !== undefined)  data.gradeLevel  = canonicalStudentClassName(gradeLevel)
    if (parentName !== undefined)  data.parentName  = parentName
    if (parentEmail !== undefined) data.parentEmail = parentEmail
    if (parentPhone !== undefined) data.parentPhone = parentPhone
    if (address !== undefined)     data.address     = address
    if (status !== undefined)      data.status      = status
    if (studentId !== undefined)   data.studentId   = studentId.trim()
    if (division !== undefined)    data.division    = division || null
    if (academicYear !== undefined) data.academicYear = academicYear || null
    if (street !== undefined)      data.street      = street || null
    if (city !== undefined)        data.city        = city || null
    if (state !== undefined)       data.state       = state || null

    // email field: accept either key from frontend
    const finalEmail = email !== undefined ? email : learnerEmail
    if (finalEmail !== undefined) data.email = String(finalEmail).trim() || null

    // Every extended admission-form field (father/mother details, medical
    // info, emergency contact, etc.) is editable here too — only fields
    // actually present in the request body are touched.
    Object.assign(data, pickExtendedFields(req.body))

    // Handle any re-uploaded documents/photo — admin can replace any of them,
    // including the passport photo, at any time.
    const documentUrls = extractDocumentUrls(req)
    Object.assign(data, documentUrls)

    const studentIdNumber = parseInt(id)
    const existingStudent = await prisma.student.findUnique({ where: { id: studentIdNumber } })
    if (!existingStudent) return res.status(404).json({ message: 'Student not found.' })
    data.age = getAgeFromDateOfBirth(data.dateOfBirth ?? existingStudent.dateOfBirth)
    const shouldArchive = ['transferred', 'graduated'].includes(String(status || '').toLowerCase()) && !existingStudent.archivedAt
    const student = await prisma.$transaction(async (tx) => {
      if (parentEmail !== undefined) {
        data.parentEmail = String(parentEmail).trim() || null
        data.parentId = await createParentAccountIfNeeded(tx, {
          email: parentEmail,
          name: parentName ?? existingStudent.parentName
        })
      }
      if (finalEmail !== undefined && existingStudent.learnerUserId) {
        const nextEmail = String(finalEmail).trim()
        if (!nextEmail) {
          const error = new Error('A linked learner login must keep an email address.')
          error.statusCode = 400
          throw error
        }
        await tx.user.update({
          where: { id: existingStudent.learnerUserId },
          data: {
            email: nextEmail,
            name: [firstName ?? existingStudent.firstName, lastName ?? existingStudent.lastName].filter(Boolean).join(' ').trim()
          }
        })
        data.email = nextEmail
      }
      if (shouldArchive) {
        const related = await tx.student.findUnique({
          where: { id: studentIdNumber },
          include: {
            results: true, feePayments: true, attendance: true, manualExercises: true,
            classworkSubmissions: { include: { classworkItem: true } },
            admissionApplication: true
          }
        })
        const messages = await tx.message.findMany({ where: { conversationUserId: studentIdNumber } })
        const payload = JSON.parse(JSON.stringify({ student: related, messages, previousStatus: existingStudent.status || 'active' }))
        await archive(tx, {
          entityType: 'student', entityId: studentIdNumber, studentId: studentIdNumber,
          title: `${existingStudent.firstName} ${existingStudent.lastName}`.trim(),
          academicYear: existingStudent.academicYear || null, term: null,
          reason: `learner-${String(status).toLowerCase()}`, payload,
          archivedBy: req.user.name || req.user.email
        })
        data.archivedAt = new Date()
      }
      return tx.student.update({ where: { id: studentIdNumber }, data })
    })

    res.json({
      ...student,
      learnerAccountActive: existingStudent.learnerUserId
        ? (await prisma.user.findUnique({ where: { id: existingStudent.learnerUserId }, select: { active: true } }))?.active ?? null
        : null
    })
  } catch (error) {
    console.error('Update Student Error:', error)
    res.status(error.statusCode || 400).json({ message: error.message || 'Failed to update student' })
  }
}

const bulkImportStudents = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can import learners.' })
  }

  const { students } = req.body
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'The import must contain at least one learner.' })
  }

  const result = { created: 0, updated: 0, errors: [] }
  const rowsByStudentId = new Map()
  for (const [index, row] of students.entries()) {
    const studentId = String(row?.studentId ?? '').trim().toLowerCase()
    if (!studentId) continue
    const rows = rowsByStudentId.get(studentId) || []
    rows.push(Number.isInteger(row?.rowNumber) ? row.rowNumber : index + 2)
    rowsByStudentId.set(studentId, rows)
  }

  const importFields = [
    'firstName', 'lastName', 'dateOfBirth', 'gender', 'gradeLevel', 'division',
    'academicYear', 'parentEmail', 'parentName', 'parentPhone', 'fatherName',
    'motherName', 'street', 'city', 'state'
  ]

  for (const [index, row] of students.entries()) {
    const rowNumber = Number.isInteger(row?.rowNumber) ? row.rowNumber : index + 2
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      result.errors.push({ row: rowNumber, message: 'This spreadsheet row is invalid and was skipped.' })
      continue
    }
    const studentId = String(row.studentId ?? '').trim()
    const firstName = String(row.firstName ?? '').trim()
    const lastName = String(row.lastName ?? '').trim()
    const gradeLevel = String(row.gradeLevel ?? '').trim()

    if ((rowsByStudentId.get(studentId.toLowerCase()) || []).length > 1) {
      result.errors.push({ row: rowNumber, studentId, message: 'This Admission Number appears more than once in the import. All rows with this ID were skipped.' })
      continue
    }
    if (!studentId || !firstName || !gradeLevel) {
      result.errors.push({ row: rowNumber, message: 'Admission Number, Name, and Class are required.' })
      continue
    }

    const data = {}
    for (const field of importFields) {
      if (row[field] !== undefined && row[field] !== null && String(row[field]).trim() !== '') {
        data[field] = String(row[field]).trim()
      }
    }
    data.firstName = firstName
    data.lastName = lastName
    data.gradeLevel = canonicalStudentClassName(gradeLevel)

    const addressParts = [data.street || row.street, data.city || row.city, data.state || row.state]
      .map(value => String(value ?? '').trim())
      .filter(Boolean)
    if (addressParts.length) data.address = addressParts.join(', ')

    try {
      const wasExisting = await prisma.$transaction(async (tx) => {
        const matchingStudents = await tx.student.findMany({
          where: { studentId: { equals: studentId, mode: 'insensitive' } },
          take: 2
        })
        if (matchingStudents.length > 1) {
          throw new Error('This Admission Number matches more than one existing learner ID. This row was skipped; ask an administrator to resolve the duplicate IDs.')
        }
        const existing = matchingStudents[0]
        if (existing && (
          normalizeLearnerName(existing.firstName) !== normalizeLearnerName(firstName) ||
          normalizeLearnerName(existing.lastName) !== normalizeLearnerName(lastName)
        )) {
          throw new Error('The learner name does not match the record for this Admission Number. This row was skipped; verify the ID and learner details.')
        }
        if (existing?.archivedAt) {
          throw new Error('This learner is archived and cannot be updated by spreadsheet import.')
        }

        const parentId = data.parentEmail
          ? await createParentAccountIfNeeded(tx, { email: data.parentEmail, name: data.parentName })
          : existing?.parentId ?? null
        const linkedUser = existing?.learnerUserId
          ? await tx.user.findFirst({ where: { id: existing.learnerUserId, role: 'learner' }, select: { id: true, email: true } })
          : null
        const learnerAccount = linkedUser || await createLearnerAccount(tx, {
          firstName,
          lastName,
          studentId,
          active: false
        })
        const learnerData = {
          ...data,
          age: getAgeFromDateOfBirth(data.dateOfBirth ?? existing?.dateOfBirth),
          parentId,
          email: learnerAccount.email,
          learnerUserId: learnerAccount.id
        }
        if (existing) {
          await tx.student.update({ where: { id: existing.id }, data: learnerData })
        } else {
          await tx.student.create({
            data: {
              studentId,
              ...learnerData,
              gender: data.gender || 'Not specified',
              parentName: data.parentName || 'Not provided',
              status: 'active',
              source: 'manual'
            }
          })
        }
        return Boolean(existing)
      })
      result[wasExisting ? 'updated' : 'created']++
    } catch (error) {
      result.errors.push({ row: rowNumber, studentId, message: error.message || 'Could not save learner.' })
    }
  }

  res.json(result)
}

// Get a single learner's full profile (every admission-form field) plus
// their approved results, for the Learner Profile screen.
const getStudent = async (req, res) => {
  const { id } = req.params
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        parent: { select: { id: true, name: true, email: true } },
        results: {
          where: { status: 'approved' },
          orderBy: [{ academicYear: 'desc' }, { term: 'desc' }]
        }
      }
    })

    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }
    if (student.archivedAt && req.user?.role !== 'admin') {
      return res.status(404).json({ message: 'This learner profile is archived.' })
    }

    // Role-based access: parents/learners may only view their own child/self
    if (req.user && req.user.role === 'parent') {
      const isOwnChild = student.parentEmail === req.user.email || student.parentId === req.user.id
      if (!isOwnChild) return res.status(403).json({ message: 'Forbidden' })
    }
    if (req.user && req.user.role === 'learner' && student.learnerUserId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    if (req.user?.role === 'teacher') {
      const staff = await prisma.staff.findFirst({ where: { email: req.user.email } })
      if (!staff) return res.status(403).json({ message: 'Forbidden' })

      const teacherClasses = Array.from(new Set([
        ...(staff.classes || []),
        ...(staff.classTeacherClasses || [])
      ].map(value => normalizeStudentClassName(canonicalStudentClassName(value))).filter(Boolean)))
      const studentClass = normalizeStudentClassName(canonicalStudentClassName(student.gradeLevel))
      const allowed = teacherClasses.length
        ? teacherClasses.includes(studentClass)
        : studentClass === normalizeStudentClassName(canonicalStudentClassName(staff.department))
      if (!allowed) return res.status(403).json({ message: 'Forbidden' })
    }

    res.json(withCurrentAge(student))
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Creates/links a login account for an existing student who has none
const createLearnerLogin = async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can create learner logins.' })
  }

  const { id } = req.params

  try {
    const student = await prisma.student.findUnique({ where: { id: parseInt(id) } })
    if (!student) return res.status(404).json({ message: 'Student not found.' })

    if (student.learnerUserId) {
      return res.status(400).json({ message: 'This student already has a login account.' })
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentStudent = await tx.student.findUnique({ where: { id: parseInt(id) } })
      if (!currentStudent) {
        const error = new Error('Student not found.')
        error.statusCode = 404
        throw error
      }
      if (currentStudent.learnerUserId) {
        const error = new Error('This student already has a login account.')
        error.statusCode = 409
        throw error
      }

      const learnerUser = await createLearnerAccount(tx, {
        firstName: currentStudent.firstName,
        lastName: currentStudent.lastName,
        studentId: currentStudent.studentId,
        active: false
      })
      const linked = await tx.student.updateMany({
        where: { id: parseInt(id), learnerUserId: null },
        data: { email: learnerUser.email, learnerUserId: learnerUser.id }
      })
      if (linked.count !== 1) {
        const error = new Error('A learner login was created by another administrator. Refresh the learner record.')
        error.statusCode = 409
        throw error
      }
      const updated = await tx.student.findUnique({ where: { id: parseInt(id) } })
      return { student: updated, learnerEmail: learnerUser.email }
    })

    res.json({
      message: 'Login created and linked. An administrator must activate it before the learner can sign in.',
      ...result,
      learnerAccountActive: false
    })
  } catch (error) {
    console.error('Create learner login error:', error)
    res.status(error.statusCode || 500).json({ message: error.message || 'Server error' })
  }
}

const deleteStudent = async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Only administrators can archive learner records.' })
  const { id } = req.params
  const studentId = parseInt(id)
  try {
    const existingStudent = await prisma.student.findUnique({ where: { id: studentId } })
    if (!existingStudent) return res.status(404).json({ message: 'Student not found.' })
    if (existingStudent.archivedAt) return res.status(409).json({ message: 'This learner is already archived.' })
    await prisma.$transaction(async tx => {
      const related = await tx.student.findUnique({
        where: { id: studentId },
        include: {
          results: true, feePayments: true, attendance: true, manualExercises: true,
          classworkSubmissions: { include: { classworkItem: true } },
          admissionApplication: true
        }
      })
      const messages = await tx.message.findMany({ where: { conversationUserId: studentId } })
      const payload = JSON.parse(JSON.stringify({ student: related, messages, previousStatus: existingStudent.status || 'active' }))
      await archive(tx, {
        entityType: 'student', entityId: studentId, studentId,
        title: `${existingStudent.firstName} ${existingStudent.lastName}`.trim(),
        academicYear: existingStudent.academicYear || null, term: null,
        reason: 'admin-archived-learner', payload,
        archivedBy: req.user.name || req.user.email
      })
      await tx.student.update({ where: { id: studentId }, data: { archivedAt: new Date(), status: 'archived' } })
    })
    res.json({ message: 'Learner and linked records moved to the archive.' })
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
    if (student.archivedAt) return res.status(403).json({ message: 'This learner profile is archived.' })

    res.json(withCurrentAge(student))
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getStudents, getStudent, getMyProfile, createStudent, updateStudent, bulkImportStudents, deleteStudent, createLearnerLogin }