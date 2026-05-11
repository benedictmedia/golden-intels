const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Generate student ID
const generateStudentId = async () => {
  const year = new Date().getFullYear()
  const count = await prisma.student.count()
  const number = String(count + 1).padStart(4, '0')
  return `GI-${year}-${number}`
}

// Submit admission application
const submitApplication = async (req, res) => {
  try {
    const data = req.body
    const files = req.files || {}

    const photo = files.photo ? files.photo[0].path : null
    const nhisFront = files.nhisFront ? files.nhisFront[0].path : null
    const nhisBack = files.nhisBack ? files.nhisBack[0].path : null
    const ghanaFront = files.ghanaFront ? files.ghanaFront[0].path : null
    const ghanaBack = files.ghanaBack ? files.ghanaBack[0].path : null
    const signedBooklet = files.signedBooklet ? files.signedBooklet[0].path : null

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
        gradeLevel: data.gradeLevel,
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

    res.status(201).json(application)
  } catch (error) {
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

    // Generate student ID
    const studentId = await generateStudentId()

    // Create student from application
    const student = await prisma.student.create({
      data: {
        studentId,
        firstName: application.firstName,
        lastName: application.lastName,
        dateOfBirth: application.dateOfBirth,
        gender: application.gender,
        gradeLevel: application.gradeLevel,
        parentName: application.parentName,
        parentEmail: application.parentEmail,
        parentPhone: application.parentPhone,
        address: application.emergencyAddress || '',
        photo: application.photo,
        status: 'active',
      }
    })

    // Update application status
    const updated = await prisma.admissionApplication.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' }
    })

    res.json({ application: updated, student })
  } catch (error) {
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