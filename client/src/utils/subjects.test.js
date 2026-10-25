import test from 'node:test'
import assert from 'node:assert/strict'

import { calculateGrandTotal, clampScoreInput, getCompletedSubjects, getNormalizedScores, getSubjectScore } from './subjects.js'

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

test('recognizes the added subject names and phonics aliases', () => {
  const normalized = getNormalizedScores({
    Numeracy: { classScore: 1 },
    Literacy: { classScore: 2 },
    Phonics: { classScore: 3 }
  })
  assert.equal(normalized.Numeracy.classScore, 1)
  assert.equal(normalized.Literacy.classScore, 2)
  assert.equal(normalized['Floppy Phonics (Phonics)'].classScore, 3)
})

test('only includes subjects with all score fields, including zero scores', () => {
  const scores = {
    Maths: { classScore: '0', cat1: '10', cat2: '15', exam: '80' },
    English: { classScore: '10', cat1: '10', cat2: '', exam: '80' },
    Science: { classScore: '1', cat1: '2', cat2: '3', exam: '4' }
  }
  assert.deepEqual(getCompletedSubjects(scores, ['Maths', 'English', 'Science']), ['Maths', 'Science'])
})

test('clamps score input to each field maximum while allowing blank values', () => {
  assert.equal(clampScoreInput('classScore', '11'), '10')
  assert.equal(clampScoreInput('cat1', '21'), '20')
  assert.equal(clampScoreInput('cat2', '21'), '20')
  assert.equal(clampScoreInput('exam', '101'), '100')
  assert.equal(clampScoreInput('exam', ''), '')
})
