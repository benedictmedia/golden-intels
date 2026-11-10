import test from 'node:test'
import assert from 'node:assert/strict'
import { parseStaffRows } from './staffImport.js'

test('parses staff name and staff ID columns regardless of header casing', () => {
  assert.deepEqual(parseStaffRows('staff name,staff id\nAda Mensah,ST-01'), [
    { name: 'Ada Mensah', staffId: 'ST-01', rowNumber: 2 }
  ])
})

test('requires both staff CSV columns', () => {
  assert.throws(
    () => parseStaffRows('STAFF NAME\nAda Mensah'),
    /STAFF NAME and STAFF ID/
  )
})

test('preserves incomplete rows for row-level import validation', () => {
  assert.deepEqual(parseStaffRows('STAFF NAME,STAFF ID\nAda Mensah,\n,ST-02'), [
    { name: 'Ada Mensah', staffId: '', rowNumber: 2 },
    { name: '', staffId: 'ST-02', rowNumber: 3 }
  ])
})
