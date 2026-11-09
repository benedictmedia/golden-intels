import test from 'node:test'
import assert from 'node:assert/strict'
import { createCsv } from './adminDataExports.js'

test('creates a quoted UTF-8 CSV and preserves commas, quotes, and newlines', () => {
  const csv = createCsv(['Name', 'Notes'], [['Taylor, Sam', 'Said "hello"\nagain']])

  assert.equal(csv, '\uFEFF"Name","Notes"\r\n"Taylor, Sam","Said ""hello""\nagain"')
})

test('neutralizes spreadsheet formulas in downloaded fields', () => {
  const csv = createCsv(['Email', 'Phone'], [['=HYPERLINK("https://example.com")', '+233 20 000 0000']])

  assert.equal(csv, '\uFEFF"Email","Phone"\r\n"\'=HYPERLINK(""https://example.com"")","\'+233 20 000 0000"')
})
