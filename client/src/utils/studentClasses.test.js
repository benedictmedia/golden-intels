import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canonicalStudentClassName, displayStudentClassName, normalizeStudentClassName } from './studentClasses.js'

test('matches new and legacy Creche class names', () => {
  assert.equal(normalizeStudentClassName('CRECHE'), normalizeStudentClassName('Creche(Babies)'))
  assert.equal(normalizeStudentClassName('Creche (Babies)'), normalizeStudentClassName('Creche'))
})

test('displays legacy Creche class names as Creche', () => {
  assert.equal(displayStudentClassName('CRECHE'), 'Creche')
  assert.equal(displayStudentClassName('Creche(Babies)'), 'Creche')
})

test('normalizes legacy KG and Reception names to the same class', () => {
  for (const alias of ['KG1', 'KG1)', 'KG 1', 'Kindergarten 1', 'Reception 1']) {
    assert.equal(normalizeStudentClassName(alias), normalizeStudentClassName('KG 1'))
    assert.equal(canonicalStudentClassName(alias), 'KG 1')
  }

  for (const alias of ['KG2', 'KG 2)', 'KG 2', 'Kindergarten 2', 'Reception 2']) {
    assert.equal(normalizeStudentClassName(alias), normalizeStudentClassName('KG 2'))
    assert.equal(canonicalStudentClassName(alias), 'KG 2')
  }
})