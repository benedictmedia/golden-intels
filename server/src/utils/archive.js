const getActiveAcademicContext = async (db) => {
  const context = await db.academicContext.findFirst({ orderBy: { updatedAt: 'desc' } })
  const year = Number(String(context?.academicYear || '').match(/^(\d{4})/)?.[1])
  if (!context || !Number.isFinite(year) || year < 2026) return { academicYear: '2026/2027', term: 'Term 1' }
  return context
}

const isPreviousAcademicPeriod = async (db, academicYear, term) => {
  if (!academicYear || !term) return false
  const current = await getActiveAcademicContext(db)
  const currentYear = Number(current.academicYear.slice(0, 4))
  const targetYear = Number(String(academicYear).match(/^(\d{4})/)?.[1])
  if (!Number.isFinite(targetYear)) return false
  if (targetYear < currentYear) return true
  if (targetYear > currentYear) return false
  const currentTerm = Number(String(current.term).match(/\d+/)?.[0] || 1)
  const targetTerm = Number(String(term).match(/\d+/)?.[0] || 0)
  return targetTerm > 0 && targetTerm < currentTerm
}

const isAcademicPeriodVisible = async (db, academicYear, term) => {
  if (!academicYear && !term) return true
  const current = await getActiveAcademicContext(db)
  const currentYear = Number(current.academicYear.slice(0, 4))
  const targetYear = Number(String(academicYear || current.academicYear).match(/^(\d{4})/)?.[1])
  if (!Number.isFinite(targetYear) || targetYear < 2026 || targetYear > currentYear) return false
  if (targetYear < currentYear || !term) return true
  const currentTerm = Number(String(current.term).match(/\d+/)?.[0] || 1)
  const targetTerm = Number(String(term).match(/\d+/)?.[0] || 0)
  return targetTerm > 0 && targetTerm <= currentTerm
}

const archive = (db, data) => db.archiveRecord.create({ data })

module.exports = { getActiveAcademicContext, isPreviousAcademicPeriod, isAcademicPeriodVisible, archive }