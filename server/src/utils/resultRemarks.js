const countWords = (value) => {
  if (typeof value !== 'string' || !value.trim()) return 0
  return value.trim().split(/\s+/).length
}

const isValidRemark = (value) => typeof value === 'string' && countWords(value) <= 60

const limitRemarkWords = (value, limit = 60) => {
  if (typeof value !== 'string') return ''
  return value.trim().split(/\s+/).filter(Boolean).slice(0, limit).join(' ')
}

module.exports = { countWords, isValidRemark, limitRemarkWords }
