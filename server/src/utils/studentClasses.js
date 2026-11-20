const STUDENT_CLASSES = [
  'Creche',
  'Pre-Nursery',
  'Nursery 1',
  'Nursery 2',
  'KG 1',
  'KG 2',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
]

const CLASS_ALIASES = new Map([
  ['kindergarten 1', 'KG 1'],
  ['kindergarten1', 'KG 1'],
  ['kg1', 'KG 1'],
  ['kg 1', 'KG 1'],
  ['reception 1', 'KG 1'],
  ['reception1', 'KG 1'],
  ['reception 1 (kg1', 'KG 1'],
  ['reception 1 (kg 1', 'KG 1'],
  ['reception 1(kg1', 'KG 1'],
  ['reception 1(kg 1', 'KG 1'],
  ['reception1(kg1', 'KG 1'],
  ['kindergarten 2', 'KG 2'],
  ['kindergarten2', 'KG 2'],
  ['kg2', 'KG 2'],
  ['kg 2', 'KG 2'],
  ['reception 2', 'KG 2'],
  ['reception2', 'KG 2'],
  ['reception 2 (kg2', 'KG 2'],
  ['reception 2 (kg 2', 'KG 2'],
  ['reception 2(kg2', 'KG 2'],
  ['reception 2(kg 2', 'KG 2'],
  ['reception2(kg2', 'KG 2'],
])

const normalizeStudentClassName = (value) => {
  const normalized = String(value ?? '')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s*\(babies\)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[.)]+$/g, '')
  return CLASS_ALIASES.get(normalized)?.toLowerCase() || normalized
}

const canonicalStudentClassName = (value) => {
  const normalized = normalizeStudentClassName(value)
  if (normalized === 'creche') return 'Creche'
  return CLASS_ALIASES.get(normalized) || (
    STUDENT_CLASSES.find(className => normalizeStudentClassName(className) === normalized) || String(value ?? '').trim()
  )
}

const studentClassNameVariants = (value) => {
  const normalized = normalizeStudentClassName(value)
  if (normalized === 'kg 1') return ['KG 1', 'KG1', 'KG1)', 'KG 1)', 'Reception 1', 'Reception1', 'Kindergarten 1', 'Kindergarten1']
  if (normalized === 'kg 2') return ['KG 2', 'KG2', 'KG2)', 'KG 2)', 'Reception 2', 'Reception2', 'Kindergarten 2', 'Kindergarten2']
  return [canonicalStudentClassName(value)]
}

module.exports = {
  STUDENT_CLASSES,
  normalizeStudentClassName,
  canonicalStudentClassName,
  studentClassNameVariants
}
