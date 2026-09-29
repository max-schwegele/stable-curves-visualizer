import assert from 'node:assert/strict'
import test from 'node:test'

import { getG3CorrectiveMorphWeights } from '../src/features/genus3/renderingG3.js'

const EMPTY_LOOP_VALUES = {
  E1: 0,
  E2: 0,
  E3: 0,
  B12: 0,
  B13: 0,
  B23: 0,
  H1_star: 0,
}

function assertClose(actual, expected) {
  assert.ok(Math.abs(actual - expected) < Number.EPSILON * 4)
}

test('corrective genus-3 morph weights vanish without overlapping pinches', () => {
  const weights = getG3CorrectiveMorphWeights(EMPTY_LOOP_VALUES)

  assert.equal(Object.keys(weights).length, 16)
  assert.ok(Object.values(weights).every((weight) => weight === 0))
})

test('triple equator overlap is separated from pairwise overlap', () => {
  const weights = getG3CorrectiveMorphWeights({
    ...EMPTY_LOOP_VALUES,
    E1: 0.8,
    E2: 0.6,
    E3: 0.2,
  })

  assertClose(weights.C_E1_E2_E3, 0.2)
  assertClose(weights.C_E1_E2, 0.4)
  assertClose(weights.C_E1_E3, 0)
  assertClose(weights.C_E2_E3, 0)
})

test('H1-star triple overlap is removed from its pairwise corrections', () => {
  const weights = getG3CorrectiveMorphWeights({
    ...EMPTY_LOOP_VALUES,
    E2: 0.5,
    E3: 0.2,
    H1_star: 0.7,
  })

  assertClose(weights.C_H1s_E2_E3, 0.2)
  assertClose(weights.C_H1s_E2, 0.3)
  assertClose(weights.C_H1s_E3, 0)
  assertClose(weights.C_E2_E3, 0)
})
