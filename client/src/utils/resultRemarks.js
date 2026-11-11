export const countWords = (value) => {
  if (typeof value !== 'string' || !value.trim()) return 0
  return value.trim().split(/\s+/).length
}

export const limitRemarkWords = (value, limit = 60) => {
  if (typeof value !== 'string') return ''
  if (countWords(value) <= limit) return value
  return value.trim().split(/\s+/).filter(Boolean).slice(0, limit).join(' ')
}

export const drawResultRemarksSection = (doc, result, y, pageWidth) => {
  const innerWidth = pageWidth - 30
  const classTeacherLines = doc.splitTextToSize(limitRemarkWords(result.remarks).trim() || '—', innerWidth)
  const headmasterLines = doc.splitTextToSize(limitRemarkWords(result.headmasterRemarks).trim() || '—', innerWidth)
  const lineHeight = 2.8
  const classTeacherTextY = 7.5
  const headmasterLabelY = classTeacherTextY + classTeacherLines.length * lineHeight + 2
  const headmasterTextY = headmasterLabelY + 3.5
  const sectionHeight = headmasterTextY + headmasterLines.length * lineHeight + 2.5
  const signatureAndFooterHeight = 6 + 28 + 4 + 14
  const pageHeight = doc.internal.pageSize.getHeight()

  if (y + sectionHeight + signatureAndFooterHeight > pageHeight - 2) {
    doc.addPage()
    y = 15
  }

  doc.setFillColor(240, 245, 255)
  doc.rect(10, y, pageWidth - 20, sectionHeight, 'F')
  doc.setDrawColor(26, 60, 110)
  doc.setLineWidth(0.4)
  doc.rect(10, y, pageWidth - 20, sectionHeight)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(26, 60, 110)
  doc.text("Class Teacher's Remark:", 15, y + 4.5)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(50, 50, 50)
  doc.text(classTeacherLines, 15, y + classTeacherTextY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(26, 60, 110)
  doc.text("Headmaster's Remarks:", 15, y + headmasterLabelY)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6.5)
  doc.setTextColor(50, 50, 50)
  doc.text(headmasterLines, 15, y + headmasterTextY)

  return y + sectionHeight + 6
}
