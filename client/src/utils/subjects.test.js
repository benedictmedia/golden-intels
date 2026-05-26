import test from 'node:test'
import assert from 'node:assert/strict'

import { calculateGrandTotal, getNormalizedScores, getSubjectScore } from './subjects.js'

test('getNormalizedScores canonicalizes subject aliases', () => {
  const normalized = getNormalizedScores({
    Mathematics: { classScore: '10', cat1: '10', cat2: '10', exam: '40' },
    'Creative Arts': { classScore: '5', cat1: '10', cat2: '15', exam: '60' },
    'UC MAS': { classScore: '8', cat1: '12', cat2: '10', exam: '48' }
  })

  assert.deepEqual(Object.keys(normalized), ['Maths', 'Creative Arts', 'UC MAS'])
  assert.deepEqual(normalized.Maths, {
    classScore: '10',
    cat1: '10',
    cat2: '10',
    exam: '40'
  })
})

test('getSubjectScore reads aliased subject keys and calculateGrandTotal includes them', () => {
  const scores = {
    Mathematics: { classScore: '10', cat1: '10', cat2: '10', exam: '40' },
    'Creative Arts': { classScore: '5', cat1: '10', cat2: '15', exam: '60' },
    'UC MAS': { classScore: '8', cat1: '12', cat2: '10', exam: '48' }
  }

  assert.deepEqual(getSubjectScore(scores, 'Maths'), {
    classScore: '10',
    cat1: '10',
    cat2: '10',
    exam: '40'
  })

  assert.equal(calculateGrandTotal(scores), 164)
})
