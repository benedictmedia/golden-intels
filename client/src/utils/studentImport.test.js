import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mapStudentRows } from './studentImport.js'

test('maps the provided spreadsheet columns to learner fields', () => {
  const rows = mapStudentRows([
    ['Admission Number', 'Name', 'Class', 'Division', 'Academic Year', 'Email', 'Phone(of guardian)', 'Street', 'City', 'State', 'Guardian', 'Father', 'Mother', 'Date of Birth'],
    ['STU202600001', 'Ama Mensah', 'Grade 2', 'Lower Primary', '2026-27', 'ama@example.com', '0240000000', 'Main Road', 'Accra', 'Greater Accra', 'Kojo Mensah', 'Kojo Mensah', 'Abena Mensah', '12/05/2018'],
  ])

  assert.deepEqual(rows[0], {
    rowNumber: 2,
    studentId: 'STU202600001',
    firstName: 'Ama',
    lastName: 'Mensah',
    gradeLevel: 'Grade 2',
    division: 'Lower Primary',
    academicYear: '2026-27',
    email: 'ama@example.com',
    parentPhone: '0240000000',
    street: 'Main Road',
    city: 'Accra',
    state: 'Greater Accra',
    parentName: 'Kojo Mensah',
    fatherName: 'Kojo Mensah',
    motherName: 'Abena Mensah',
    dateOfBirth: '2018-05-12',
  })
})

test('leaves missing optional columns out of imported rows', () => {
  const rows = mapStudentRows([
    ['Admission Number', 'Name', 'Class'],
    ['STU202600002', 'Akua', 'Nursery 1'],
  ])

  assert.deepEqual(rows[0], {
    rowNumber: 2,
    studentId: 'STU202600002',
    firstName: 'Akua',
    lastName: '',
    gradeLevel: 'Nursery 1',
  })
})

test('ignores blank spreadsheet rows', () => {
  const rows = mapStudentRows([
    ['Admission Number', 'Name', 'Class'],
    ['', '', ''],
    ['STU202600003', 'Yaw Boateng', 'Grade 1'],
  ])

  assert.equal(rows.length, 1)
  assert.equal(rows[0].rowNumber, 3)
})

test('finds headers after leading title rows and accepts a misspelled Division header', () => {
  const rows = mapStudentRows([
    ['Golden Intels Learner List'],
    [],
    ['Admission Number', 'Name', 'Class', 'Divition'],
    ['STU202600004', 'Ethan Skye', 'CRECHE', 'EARLY YEARS'],
  ])

  assert.deepEqual(rows[0], {
    rowNumber: 4,
    studentId: 'STU202600004',
    firstName: 'Ethan',
    lastName: 'Skye',
    gradeLevel: 'CRECHE',
    division: 'EARLY YEARS',
  })
})