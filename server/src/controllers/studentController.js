const prisma = require('../config/prismaClient');

// Get Students
const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// Create Student
const createStudent = async (req, res) => {
  try {
    console.log("Received body:", req.body); // ← Helpful for debugging

    const { 
      firstName, lastName, studentId, dateOfBirth, gender = "Male", 
      gradeLevel = "Year 1", parentName, parentEmail, parentPhone, address 
    } = req.body;

    const student = await prisma.student.create({
      data: {
        firstName: String(firstName || '').trim(),
        lastName: String(lastName || '').trim(),
        studentId: studentId || `GI-${Date.now()}`,
        dateOfBirth: dateOfBirth || null,
        gender: String(gender),
        gradeLevel: String(gradeLevel),
        parentName: String(parentName || '').trim(),
        parentEmail: parentEmail || null,
        parentPhone: parentPhone || null,
        address: address || null,
        photo: req.file ? `/uploads/${req.file.filename}` : null,
      }
    });

    console.log("Student created:", student.id);
    res.status(201).json(student);
  } catch (error) {
    console.error("=== CREATE STUDENT ERROR ===");
    console.error(error);
    res.status(500).json({ 
      message: "Failed to create student", 
      error: error.message,
      details: error.meta || null 
    });
  }
};

module.exports = { getStudents, createStudent };