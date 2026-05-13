const asyncHandler = require('express-async-handler');
const prisma = require('../config/prismaClient');

// @desc    Create new student
const createStudent = asyncHandler(async (req, res) => {
  try {
    const { 
      firstName, lastName, studentId, dateOfBirth, gender, 
      gradeLevel, parentName, parentEmail, parentPhone, address 
    } = req.body;

    // Handle photo if uploaded
    let photoUrl = null;
    if (req.file) {
      // For now, we'll store the local path or skip Cloudinary if not configured
      photoUrl = `/uploads/${req.file.filename}`; 
    }

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        studentId: studentId || `GI-${Date.now()}`,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        gradeLevel,
        parentName,
        parentEmail,
        parentPhone,
        address,
        photo: photoUrl,
      }
    });

    res.status(201).json(student);
  } catch (error) {
    console.error("Create Student Error:", error);
    res.status(500).json({ 
      message: "Failed to create student", 
      error: error.message 
    });
  }
});

const getStudents = asyncHandler(async (req, res) => {
  const students = await prisma.student.findMany();
  res.json(students);
});

module.exports = { getStudents, createStudent };