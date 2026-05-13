const asyncHandler = require('express-async-handler');
const prisma = require('../config/prismaClient');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload');

// @desc    Get all students
// @route   GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  const students = await prisma.student.findMany({
    include: { parent: true }
  });
  res.json(students);
});

// @desc    Create new student
// @route   POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const { 
    firstName, lastName, dateOfBirth, gender, gradeLevel,
    parentName, parentEmail, parentPhone, address, studentId 
  } = req.body;

  let photoUrl = null;
  if (req.file) {
    photoUrl = await uploadToCloudinary(req.file.path);
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
    },
    include: { parent: true }
  });

  res.status(201).json(student);
});

module.exports = { getStudents, createStudent };