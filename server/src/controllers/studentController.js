const prisma = require('../config/prismaClient');

// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const { 
      firstName, lastName, studentId, dateOfBirth, gender, 
      gradeLevel, parentName, parentEmail, parentPhone, address 
    } = req.body;

    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const student = await prisma.student.create({
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        studentId: studentId || `GI-${Date.now()}`,
        dateOfBirth: dateOfBirth || null,           // Keep as string
        gender,
        gradeLevel,
        parentName: parentName?.trim(),
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
};

module.exports = { getStudents, createStudent };