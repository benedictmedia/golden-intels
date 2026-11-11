const test = require('node:test')
const assert = require('node:assert/strict')
const { countWords, isValidRemark, limitRemarkWords } = require('./resultRemarks')

test('result remarks are limited to 60 whitespace-separated words', () => {
  const sixtyWords = Array(60).fill('remark').join(' ')
  const sixtyOneWords = `${sixtyWords} extra`

  assert.equal(countWords('  '), 0)
  assert.equal(countWords(sixtyWords), 60)
  assert.equal(isValidRemark(sixtyWords), true)
  assert.equal(isValidRemark(sixtyOneWords), false)
  assert.equal(countWords(limitRemarkWords(sixtyOneWords)), 60)
})
