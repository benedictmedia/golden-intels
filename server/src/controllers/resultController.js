const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Get all results
const getResults = async (req, res) => {
  try {
    const results = await prisma.result.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Get results by student
const getResultsByStudent = async (req, res) => {
  const { studentId } = req.params
  try {
    const results = await prisma.result.findMany({
      where: { studentId: parseInt(studentId) },
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Create result
const createResult = async (req, res) => {
  const { studentId, gradeLevel, academicYear, term, scores, remarks, submittedBy } = req.body
  try {
    const result = await prisma.result.create({
      data: {
        studentId: parseInt(studentId),
        gradeLevel,
        academicYear,
        term,
        scores,
        remarks,
        submittedBy,
        status: 'pending'
      },
      include: { student: true }
    })
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Update result
const updateResult = async (req, res) => {
  const { id } = req.params
  const { scores, remarks, status } = req.body
  try {
    const result = await prisma.result.update({
      where: { id: parseInt(id) },
      data: { scores, remarks, status },
      include: { student: true }
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Delete result (teacher only — admin results are protected on frontend)
const deleteResult = async (req, res) => {
  const { id } = req.params
  try {
    await prisma.result.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Result deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getResults, getResultsByStudent, createResult, updateResult, deleteResult }