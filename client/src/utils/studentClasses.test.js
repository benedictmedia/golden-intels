import { test } from 'node:test'
import assert from 'node:assert/strict'
import { displayStudentClassName, normalizeStudentClassName } from './studentClasses.js'

test('matches new and legacy Creche class names', () => {
  assert.equal(normalizeStudentClassName('CRECHE'), normalizeStudentClassName('Creche(Babies)'))
  assert.equal(normalizeStudentClassName('Creche (Babies)'), normalizeStudentClassName('Creche'))
})

test('displays legacy Creche class names as Creche', () => {
  assert.equal(displayStudentClassName('CRECHE'), 'Creche')
  assert.equal(displayStudentClassName('Creche(Babies)'), 'Creche')
})