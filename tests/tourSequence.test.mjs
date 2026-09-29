import assert from 'node:assert/strict'
import test from 'node:test'

import { parseTourSequence } from '../src/features/tour/tourSequence.js'

const GENUS_TWO_TYPES = ['2', '1n', '0nn']
const GENUS_THREE_TYPES = ['3', '2n', 'BRAID']

test('a valid sequence is parsed and whitespace is removed', () => {
  const result = parseTourSequence(
    '2, 1n, 0nn, 2',
    GENUS_TWO_TYPES,
    2,
  )

  assert.deepEqual(result, {
    error: '',
    sequence: ['2', '1n', '0nn', '2'],
  })
})

test('empty entries between commas are ignored', () => {
  const result = parseTourSequence(
    '3, , 2n,',
    GENUS_THREE_TYPES,
    3,
  )

  assert.deepEqual(result, {
    error: '',
    sequence: ['3', '2n'],
  })
})

test('an empty sequence is rejected', () => {
  const result = parseTourSequence(' ,  , ', GENUS_TWO_TYPES, 2)

  assert.equal(result.error, 'Tour sequence cannot be empty!')
  assert.equal(result.sequence, null)
})

test('a type from the wrong genus is rejected', () => {
  const result = parseTourSequence('2, BRAID', GENUS_TWO_TYPES, 2)

  assert.match(result.error, /^Syntax Error! Allowed types for G2:/)
  assert.equal(result.sequence, null)
})
