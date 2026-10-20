export const normalizeStudentClassName = (value) => String(value ?? '')
  .trim()
  .toLocaleLowerCase()
  .replace(/\s*\(babies\)\s*$/i, '')
  .replace(/\s+/g, ' ')

export const displayStudentClassName = (value) => (
  normalizeStudentClassName(value) === 'creche' ? 'Creche' : String(value ?? '')
)