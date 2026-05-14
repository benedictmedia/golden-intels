const prisma = require('../config/prismaClient');

// Get all students
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
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    const { 
      firstName, lastName, studentId, dateOfBirth, gender, 
      gradeLevel, parentName, parentEmail, parentPhone, address 
    } = req.body;

    if (!firstName || !lastName || !parentName) {
      return res.status(400).json({ message: "First Name, Last Name and Parent Name are required" });
    }

    // Inside the try block, before prisma.create:
let finalStudentId = studentId || `GI-${Date.now()}`;

const existing = await prisma.student.findUnique({ where: { studentId: finalStudentId } });
if (existing) {
  finalStudentId = `GI-${Date.now()}`;
}

    const student = await prisma.student.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentId: studentId || `GI-${Date.now()}`,
        dateOfBirth: dateOfBirth || null,
        gender: gender || "Male",
        gradeLevel: gradeLevel || "Year 1",
        parentName: parentName.trim(),
        parentEmail: parentEmail || null,
        parentPhone: parentPhone || null,
        address: address || null,
        photo: req.file ? `/uploads/${req.file.filename}` : null,
      }
    });

    console.log("✅ Student created successfully:", student.id);
    res.status(201).json(student);
  } catch (error) {
    console.error("=== CREATE STUDENT ERROR ===");
    console.error(error);
    res.status(500).json({ 
      message: "Failed to create student", 
      error: error.message 
    });
  }
};

module.exports = { getStudents, createStudent };