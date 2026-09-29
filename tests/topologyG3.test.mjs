import assert from 'node:assert/strict'
import test from 'node:test'

import { GENUS_3_DATA } from '../src/features/genus3/configG3.js'
import {
  ALL_LOOPS_G3,
  CROSSING_PAIRS_G3,
  classifyG3,
  findOptimalTransitionG3,
  getConflictingLoopsToOpenG3,
  getValidCombinationsG3,
} from '../src/features/genus3/topologyG3.js'

const MAXIMAL_TYPES = {
  '0mmm': ['H1', 'H2', 'H3', 'E1', 'E2', 'E3'],
  BRAID: ['H1', 'H2', 'H3', 'B12', 'B13', 'B23'],
  'Z=0m': ['H1', 'H2', 'H3', 'H1_star', 'E3', 'B12'],
  '0m=0m': ['H1', 'H2', 'H3', 'H1_star', 'E2', 'E3'],
  'Z=Z': ['H1', 'H2', 'H3', 'H1_star', 'B12', 'B13'],
}

function combinationKey(combination) {
  return [...combination].sort().join('|')
}

function transitionDistance(first, second) {
  const firstSet = new Set(first)
  const secondSet = new Set(second)

  const removed = first.filter((loop) => !secondSet.has(loop)).length
  const added = second.filter((loop) => !firstSet.has(loop)).length

  return removed + added
}

test('the genus-3 loop family contains ten distinct loops', () => {
  assert.equal(ALL_LOOPS_G3.length, 10)
  assert.equal(new Set(ALL_LOOPS_G3).size, 10)
})

test('there are 216 valid loop combinations', () => {
  const combinations = getValidCombinationsG3()

  assert.equal(combinations.length, 216)
  assert.equal(
    new Set(combinations.map(combinationKey)).size,
    combinations.length,
  )
})

test('valid combinations contain no crossing pair', () => {
  const combinations = getValidCombinationsG3()

  for (const combination of combinations) {
    for (const [first, second] of CROSSING_PAIRS_G3) {
      assert.equal(
        combination.includes(first) && combination.includes(second),
        false,
        `${first} and ${second} occur together in ${combinationKey(combination)}`,
      )
    }
  }
})

test('activating a loop opens every crossing loop', () => {
  const inactiveValues = Object.fromEntries(
    ALL_LOOPS_G3.map((loop) => [loop, 0]),
  )

  for (const activatedLoop of ALL_LOOPS_G3) {
    const expectedLoops = CROSSING_PAIRS_G3.flatMap(([first, second]) => {
      if (first === activatedLoop) return [second]
      if (second === activatedLoop) return [first]
      return []
    })

    assert.deepEqual(
      getConflictingLoopsToOpenG3(inactiveValues, {
        ...inactiveValues,
        [activatedLoop]: 1,
      }),
      expectedLoops,
    )
  }
})

test('simultaneously activated crossing loops both open again', () => {
  const previousValues = Object.fromEntries(
    ALL_LOOPS_G3.map((loop) => [loop, 0]),
  )
  const currentValues = {
    ...previousValues,
    E1: 1,
    B12: 1,
  }

  assert.deepEqual(
    getConflictingLoopsToOpenG3(previousValues, currentValues),
    ['B12', 'E1', 'B13', 'E2', 'H1_star'],
  )
})

test('every valid combination has one of the 42 configured types', () => {
  const combinations = getValidCombinationsG3()
  const configuredTypes = new Set(GENUS_3_DATA.TYPES)
  const realizedTypes = new Set()

  for (const combination of combinations) {
    const type = classifyG3(combination)

    assert.notEqual(
      type,
      'UNKNOWN',
      `Unclassified combination: ${combinationKey(combination)}`,
    )
    assert.equal(
      configuredTypes.has(type),
      true,
      `Unexpected type ${type} for ${combinationKey(combination)}`,
    )

    realizedTypes.add(type)
  }

  assert.equal(realizedTypes.size, 42)
  assert.deepEqual(
    [...realizedTypes].sort(),
    [...configuredTypes].sort(),
  )
})

test('the five maximal subsets have the documented types', () => {
  for (const [expectedType, combination] of Object.entries(MAXIMAL_TYPES)) {
    assert.equal(
      classifyG3(combination),
      expectedType,
      combinationKey(combination),
    )
  }
})

test('the three B-loops produce the reducible three-edge types', () => {
  const bridgeLoops = ['B12', 'B13', 'B23']

  assert.equal(classifyG3(bridgeLoops), '1---0')

  for (const handleLoop of ['H1', 'H2', 'H3']) {
    assert.equal(
      classifyG3([handleLoop, ...bridgeLoops]),
      '0---0n',
      handleLoop,
    )
  }
})

test('every configured type has a transition target', () => {
  const validCombinations = getValidCombinationsG3()
  const initialCombination = []

  for (const type of GENUS_3_DATA.TYPES) {
    const transition = findOptimalTransitionG3(initialCombination, type)

    assert.equal(transition.error, undefined, type)
    assert.equal(transition.sourceType, '3')
    assert.equal(transition.targetType, type)
    assert.ok(transition.options.length > 0, type)

    const possibleTargets = validCombinations.filter(
      (combination) => classifyG3(combination) === type,
    )

    const expectedDistance = Math.min(
      ...possibleTargets.map((target) =>
        transitionDistance(initialCombination, target),
      ),
    )

    assert.equal(transition.distance, expectedDistance, type)

    for (const option of transition.options) {
      assert.equal(classifyG3(option.targetLoops), type)
      assert.equal(option.distance, expectedDistance)
    }
  }
})
