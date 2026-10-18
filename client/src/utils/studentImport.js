import Papa from 'papaparse'
import readXlsxFile from 'read-excel-file/browser'

const normalizeHeader = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

const HEADER_FIELDS = {
  admissionnumber: 'studentId',
  studentid: 'studentId',
  name: 'name',
  firstname: 'firstName',
  lastname: 'lastName',
  class: 'gradeLevel',
  grade: 'gradeLevel',
  gradelevel: 'gradeLevel',
  division: 'division',
  academicyear: 'academicYear',
  email: 'email',
  phone: 'parentPhone',
  phoneofguardian: 'parentPhone',
  guardianphone: 'parentPhone',
  street: 'street',
  city: 'city',
  state: 'state',
  guardian: 'parentName',
  father: 'fatherName',
  fathername: 'fatherName',
  mother: 'motherName',
  mothername: 'motherName',
  dateofbirth: 'dateOfBirth',
  dob: 'dateOfBirth',
}

const cellText = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return String(value ?? '').trim()
}

const normalizeDate = (value) => {
  const text = cellText(value)
  if (!text) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

  const dayFirst = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (dayFirst) {
    return `${dayFirst[3]}-${dayFirst[2].padStart(2, '0')}-${dayFirst[1].padStart(2, '0')}`
  }

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? text : cellText(parsed)
}

export const mapStudentRows = (rows) => {
  if (!Array.isArray(rows) || rows.length < 2) return []

  const headers = rows[0].map(header => HEADER_FIELDS[normalizeHeader(header)] || null)
  return rows.slice(1).flatMap((cells, index) => {
    const row = { rowNumber: index + 2 }
    headers.forEach((field, column) => {
      if (field) row[field] = field === 'dateOfBirth' ? normalizeDate(cells[column]) : cellText(cells[column])
    })

    if (row.name) {
      const nameParts = row.name.split(/\s+/)
      row.firstName = row.firstName || nameParts.shift() || ''
      row.lastName = row.lastName || nameParts.join(' ')
      delete row.name
    }
    return Object.entries(row).some(([key, value]) => key !== 'rowNumber' && value !== '') ? [row] : []
  })
}

export const parseStudentFile = async (file) => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  let rows

  if (extension === 'csv') {
    const result = Papa.parse(await file.text(), { skipEmptyLines: 'greedy' })
    if (result.errors.length) throw new Error(result.errors[0].message)
    rows = result.data
  } else if (extension === 'xlsx') {
    rows = await readXlsxFile(file)
  } else {
    throw new Error('Choose an .xlsx or .csv file.')
  }

  return mapStudentRows(rows)
}