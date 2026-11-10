import Papa from 'papaparse'

const normalizeHeader = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

export const parseStaffRows = text => {
  const parsed = Papa.parse(text, { delimiter: ',', header: true, skipEmptyLines: 'greedy' })
  if (parsed.errors.length) throw new Error(parsed.errors[0].message)

  const fields = parsed.meta.fields || []
  const nameHeader = fields.find(field => normalizeHeader(field) === 'staffname')
  const idHeader = fields.find(field => normalizeHeader(field) === 'staffid')
  if (!nameHeader || !idHeader) {
    throw new Error('The CSV must include STAFF NAME and STAFF ID columns.')
  }

  return parsed.data.map((record, index) => ({
    name: String(record[nameHeader] ?? '').trim(),
    staffId: String(record[idHeader] ?? '').trim(),
    rowNumber: index + 2
  }))
}

export const parseStaffFile = async file => {
  if (!file.name.toLowerCase().endsWith('.csv')) throw new Error('Choose a .csv file.')
  return parseStaffRows(await file.text())
}
