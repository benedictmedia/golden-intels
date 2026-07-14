const { PrismaClient } = require('@prisma/client')
const { createNotificationsForRole } = require('./notificationController')
const { sendMail } = require('../utils/mailer')

const path = require('path')
const prisma = new PrismaClient()

// Generate student ID
const generateStudentId = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.student.count()
  const number = String(count + 1).padStart(4, '0')
  return `GI-${year}-${number}`
}

const getFileUrl = (req, file) => {
  if (!file) return null
  if (file.path?.startsWith('http')) return file.path
  if (file.secure_url) return file.secure_url
  if (file.url) return file.url
  if (file.path) return `${req.protocol}://${req.get('host')}/${file.path.replace(/\\/g, '/')}`
  return null
}

const normalizeGradeLevel = (gradeLevel) => {
  const gradeMap = {
    'Creche': 'Creche',
    'Pre-Nursery': 'Pre-Nursery',
    'Nursery 1': 'Nursery 1',
    'Nursery 2': 'Nursery 2',
    'Kindergarten 1': 'Reception 1',
    'Kindergarten 2': 'Reception 2',
    'Grade 1': 'Grade 1',
    'Grade 2': 'Grade 2',
    'Grade 3': 'Grade 3',
    'Grade 4': 'Grade 4',
    'Grade 5': 'Grade 5',
    'Grade 6': 'Grade 6',
    'Grade 7': 'Grade 7',
    'Grade 8': 'Grade 8',
    'Grade 9': 'Grade 9',
    'Grade 10': 'Grade 10',
    'Grade 11': 'Grade 11',
    'Grade 12': 'Grade 12'
  }
  return gradeMap[gradeLevel] || gradeLevel
}

const getAdmissionApprovalEmails = (application) => Array.from(new Set([
  application.parentEmail,
  application.fatherEmail,
  application.motherEmail,
  application.emergencyEmail
].filter(Boolean).map(email => email.trim()).filter(Boolean)))

// Submit admission application
const submitApplication = async (req, res) => {
  try {
    const data = req.body
    const files = req.files || {}

    if (!data.serialNumber) {
      return res.status(400).json({ message: 'Admission token serial number is required.' })
    }

    const token = await prisma.admissionToken.findUnique({
      where: { serialNumber: data.serialNumber }
    })

    if (!token) {
      return res.status(404).json({ message: 'Invalid admission token.' })
    }

    if (token.used) {
      return res.status(400).json({ message: 'This admission token has already been used.' })
    }

    const photo = getFileUrl(req, files.photo?.[0])
    const nhisFront = getFileUrl(req, files.nhisFront?.[0])
    const nhisBack = getFileUrl(req, files.nhisBack?.[0])
    const ghanaFront = getFileUrl(req, files.ghanaFront?.[0])
    const ghanaBack = getFileUrl(req, files.ghanaBack?.[0])
    const signedBooklet = getFileUrl(req, files.signedBooklet?.[0])
    const gradeLevel = normalizeGradeLevel(data.gradeLevel)

    const application = await prisma.admissionApplication.create({
      data: {
        serialNumber: data.serialNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        age: data.age,
        monthOfBirth: data.monthOfBirth,
        placeOfBirth: data.placeOfBirth,
        height: data.height,
        weight: data.weight,
        hometown: data.hometown,
        motherTongue: data.motherTongue,
        religion: data.religion,
        dateOfAdmission: data.dateOfAdmission,
        gradeLevel,
        previousSchool: data.previousSchool,
        parentName: data.parentName,
        parentOccupation: data.parentOccupation,
        parentEmail: data.parentEmail,
        parentPhone: data.parentPhone,
        secondaryContactName: data.secondaryContactName,
        secondaryContactPhone: data.secondaryContactPhone,
        fatherName: data.fatherName,
        fatherAddress: data.fatherAddress,
        fatherNationality: data.fatherNationality,
        fatherMaritalStatus: data.fatherMaritalStatus,
        fatherPhone: data.fatherPhone,
        fatherHouseNumber: data.fatherHouseNumber,
        fatherReligion: data.fatherReligion,
        fatherOccupation: data.fatherOccupation,
        fatherPlaceOfWork: data.fatherPlaceOfWork,
        fatherEducation: data.fatherEducation,
        fatherEmail: data.fatherEmail,
        motherName: data.motherName,
        motherAddress: data.motherAddress,
        motherNationality: data.motherNationality,
        motherMaritalStatus: data.motherMaritalStatus,
        motherPhone: data.motherPhone,
        motherHouseNumber: data.motherHouseNumber,
        motherReligion: data.motherReligion,
        motherOccupation: data.motherOccupation,
        motherPlaceOfWork: data.motherPlaceOfWork,
        motherEducation: data.motherEducation,
        motherEmail: data.motherEmail,
        livesWith: data.livesWith,
        olderChildren: data.olderChildren,
        youngerChildren: data.youngerChildren,
        language1: data.language1,
        language2: data.language2,
        language3: data.language3,
        language4: data.language4,
        medicalConditions: data.medicalConditions,
        allergies: data.allergies,
        specialNeeds: data.specialNeeds,
        doctorName: data.doctorName,
        doctorPhone: data.doctorPhone,
        hospitalName: data.hospitalName,
        hospitalPhone: data.hospitalPhone,
        emergencyName: data.emergencyName,
        emergencyRelationship: data.emergencyRelationship,
        emergencyPhone: data.emergencyPhone,
        emergencyEmail: data.emergencyEmail,
        emergencyAddress: data.emergencyAddress,
        emergencyWhatsapp: data.emergencyWhatsapp,
        admissionDate: data.admissionDate,
        photo,
        nhisFront,
        nhisBack,
        ghanaFront,
        ghanaBack,
        signedBooklet,
        status: 'pending',
      }
    })

    // Mark token as used
    await prisma.admissionToken.update({
      where: { serialNumber: data.serialNumber },
      data: { used: true, usedAt: new Date() }
    })

    await createNotificationsForRole(
      'admin',
      'New Admission Application',
      `${application.firstName} ${application.lastName} submitted an admission application for ${application.gradeLevel}.`,
      'admission'
    )

    res.status(201).json(application)
  } catch (error) {
    console.error('Admission submit error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get all applications
const getApplications = async (req, res) => {
  try {
    const applications = await prisma.admissionApplication.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(applications)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get single application
const getApplication = async (req, res) => {
  const { id } = req.params
  try {
    const application = await prisma.admissionApplication.findUnique({
      where: { id: parseInt(id) }
    })
    res.json(application)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Approve application and create student
const approveApplication = async (req, res) => {
  const { id } = req.params
  try {
    const application = await prisma.admissionApplication.findUnique({
      where: { id: parseInt(id) }
    })

    if (!application) {
      return res.status(404).json({ message: 'Application not found' })
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: `This application has already been ${application.status}.` })
    }

    // Generate student ID
    const studentId = await generateStudentId()

    // Create student from application — copy over EVERY field captured on the
    // admission form so the learner's full profile is available immediately,
    // not just the handful of summary fields.
    const student = await prisma.student.create({
      data: {
        studentId,
        firstName: application.firstName,
        lastName: application.lastName,
        dateOfBirth: application.dateOfBirth,
        gender: application.gender,
        gradeLevel: normalizeGradeLevel(application.gradeLevel),
        parentName: application.parentName,
        parentEmail: application.parentEmail,
        parentPhone: application.parentPhone,
        address: application.emergencyAddress || '',
        photo: application.photo,
        status: 'active',
        source: 'admission',
        admissionApplicationId: application.id,

        age: application.age,
        monthOfBirth: application.monthOfBirth,
        placeOfBirth: application.placeOfBirth,
        height: application.height,
        weight: application.weight,
        hometown: application.hometown,
        motherTongue: application.motherTongue,
        religion: application.religion,
        dateOfAdmission: application.dateOfAdmission,
        previousSchool: application.previousSchool,

        parentOccupation: application.parentOccupation,
        secondaryContactName: application.secondaryContactName,
        secondaryContactPhone: application.secondaryContactPhone,

        fatherName: application.fatherName,
        fatherAddress: application.fatherAddress,
        fatherNationality: application.fatherNationality,
        fatherMaritalStatus: application.fatherMaritalStatus,
        fatherPhone: application.fatherPhone,
        fatherHouseNumber: application.fatherHouseNumber,
        fatherReligion: application.fatherReligion,
        fatherOccupation: application.fatherOccupation,
        fatherPlaceOfWork: application.fatherPlaceOfWork,
        fatherEducation: application.fatherEducation,
        fatherEmail: application.fatherEmail,

        motherName: application.motherName,
        motherAddress: application.motherAddress,
        motherNationality: application.motherNationality,
        motherMaritalStatus: application.motherMaritalStatus,
        motherPhone: application.motherPhone,
        motherHouseNumber: application.motherHouseNumber,
        motherReligion: application.motherReligion,
        motherOccupation: application.motherOccupation,
        motherPlaceOfWork: application.motherPlaceOfWork,
        motherEducation: application.motherEducation,
        motherEmail: application.motherEmail,

        livesWith: application.livesWith,
        olderChildren: application.olderChildren,
        youngerChildren: application.youngerChildren,

        language1: application.language1,
        language2: application.language2,
        language3: application.language3,
        language4: application.language4,

        medicalConditions: application.medicalConditions,
        allergies: application.allergies,
        specialNeeds: application.specialNeeds,
        doctorName: application.doctorName,
        doctorPhone: application.doctorPhone,
        hospitalName: application.hospitalName,
        hospitalPhone: application.hospitalPhone,

        emergencyName: application.emergencyName,
        emergencyRelationship: application.emergencyRelationship,
        emergencyPhone: application.emergencyPhone,
        emergencyEmail: application.emergencyEmail,
        emergencyAddress: application.emergencyAddress,
        emergencyWhatsapp: application.emergencyWhatsapp,

        nhisFront: application.nhisFront,
        nhisBack: application.nhisBack,
        ghanaFront: application.ghanaFront,
        ghanaBack: application.ghanaBack,
        signedBooklet: application.signedBooklet,
      }
    })

    // Update application status
    const updated = await prisma.admissionApplication.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' }
    })

    const learnerName = `${application.firstName} ${application.lastName}`.trim()
    const emailRecipients = getAdmissionApprovalEmails(application)
    await sendMail({
      to: emailRecipients,
      subject: `Admission Approved - ${learnerName}`,
      text: [
        `Dear ${application.parentName || 'Parent/Guardian'},`,
        '',
        `Congratulations! We are pleased to inform you that ${learnerName} has been admitted into Golden-Intels International School for ${normalizeGradeLevel(application.gradeLevel)}.`,
        '',
        'Our admissions team will contact you with the next enrolment steps. You may also reach the school office if you need any assistance.',
        '',
        'Warm regards,',
        'Golden-Intels International School'
      ].join('\n'),
      html: `
        <p>Dear ${application.parentName || 'Parent/Guardian'},</p>
        <p>Congratulations! We are pleased to inform you that <strong>${learnerName}</strong> has been admitted into <strong>Golden-Intels International School</strong> for <strong>${normalizeGradeLevel(application.gradeLevel)}</strong>.</p>
        <p>Our admissions team will contact you with the next enrolment steps. You may also reach the school office if you need any assistance.</p>
        <p>Warm regards,<br />Golden-Intels International School</p>
      `
    })

    res.json({ application: updated, student })
  } catch (error) {
    console.error('Approve application error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Reject application
const rejectApplication = async (req, res) => {
  const { id } = req.params
  try {
    const application = await prisma.admissionApplication.update({
      where: { id: parseInt(id) },
      data: { status: 'rejected' }
    })
    res.json(application)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete application
const deleteApplication = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.admissionApplication.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Application deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  submitApplication,
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  deleteApplication
}