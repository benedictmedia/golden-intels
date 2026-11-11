import test from 'node:test'
import assert from 'node:assert/strict'
import { countWords, limitRemarkWords } from './resultRemarks.js'

test('result remarks count words and cap a remark at 60 words', () => {
  const sixtyWords = Array(60).fill('remark').join(' ')

  assert.equal(countWords('   '), 0)
  assert.equal(countWords(sixtyWords), 60)
  assert.equal(countWords(limitRemarkWords(`${sixtyWords} extra`)), 60)
})
