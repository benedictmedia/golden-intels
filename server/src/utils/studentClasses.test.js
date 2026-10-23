const { test } = require('node:test')
const assert = require('node:assert/strict')
const { canonicalStudentClassName, normalizeStudentClassName, studentClassNameVariants } = require('./studentClasses')

test('normalizes KG and legacy Reception names to canonical classes', () => {
  for (const alias of ['KG1', 'KG1)', 'KG 1', 'Kindergarten 1', 'Reception 1']) {
    assert.equal(normalizeStudentClassName(alias), normalizeStudentClassName('KG 1'))
    assert.equal(canonicalStudentClassName(alias), 'KG 1')
  }

  for (const alias of ['KG2', 'KG 2)', 'KG 2', 'Kindergarten 2', 'Reception 2']) {
    assert.equal(normalizeStudentClassName(alias), normalizeStudentClassName('KG 2'))
    assert.equal(canonicalStudentClassName(alias), 'KG 2')
  }
})

test('includes legacy database labels when querying a canonical class', () => {
  assert.ok(studentClassNameVariants('KG 1').includes('Reception 1'))
  assert.ok(studentClassNameVariants('KG 2').includes('Kindergarten 2'))
})
