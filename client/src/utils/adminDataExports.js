const csvValue = (value) => {
  const text = Array.isArray(value)
    ? value.join('; ')
    : value && typeof value === 'object'
      ? JSON.stringify(value)
      : String(value ?? '')
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replace(/"/g, '""')}"`
}

export const createCsv = (headers, rows) => (
  `\uFEFF${[headers, ...rows].map(row => row.map(csvValue).join(',')).join('\r\n')}`
)

export const downloadCsv = (filename, headers, rows) => {
  const blob = new Blob([createCsv(headers, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character])

export const openAuditPrintWindow = () => window.open('', '_blank')

export const writeAuditReport = (printWindow, title, headers, rows) => {
  const tableHead = headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')
  const tableRows = rows.map(row => (
    `<tr>${row.map(value => `<td>${escapeHtml(Array.isArray(value) ? value.join('; ') : value)}</td>`).join('')}</tr>`
  )).join('')

  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          body { font: 12px Arial, sans-serif; color: #111827; margin: 24px; }
          h1 { font-size: 20px; margin: 0 0 6px; }
          p { color: #4b5563; margin: 0 0 16px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #9ca3af; padding: 6px 8px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
          th { background: #e5e7eb; }
          @media print { body { margin: 10mm; } tr { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>Generated ${escapeHtml(new Date().toLocaleString())} · ${rows.length} record(s)</p>
        <table><thead><tr>${tableHead}</tr></thead><tbody>${tableRows}</tbody></table>
      </body>
    </html>`)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
