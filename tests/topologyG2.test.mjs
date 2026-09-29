import assert from 'node:assert/strict'
import test from 'node:test'

import { GENUS_2_DATA } from '../src/features/genus2/configG2.js'
import {
  ALL_LOOPS_G2,
  CROSSING_PAIRS_G2,
  TYPE_TO_STATES_G2,
  classifyG2State,
  findOptimalTransitionG2,
  getConflictingLoopsToOpenG2,
  getValidStatesG2,
  stateToLoopValues,
} from '../src/features/genus2/topologyG2.js'

test('the genus-2 loop family contains four distinct loops', () => {
  assert.equal(ALL_LOOPS_G2.length, 4)
  assert.equal(new Set(ALL_LOOPS_G2).size, 4)
})

test('there are twelve valid genus-2 loop states', () => {
  const validStates = getValidStatesG2()

  assert.equal(validStates.length, 12)
  assert.equal(new Set(validStates).size, 12)
})

test('valid states never contain both intersecting loops E and B', () => {
  const [[first, second]] = CROSSING_PAIRS_G2

  for (const state of getValidStatesG2()) {
    const loops = stateToLoopValues(state)
    assert.equal(loops[first] === 1 && loops[second] === 1, false, state)
  }
})

test('the newly activated genus-2 crossing loop takes precedence', () => {
  assert.deepEqual(
    getConflictingLoopsToOpenG2(
      { E: 0, B: 1 },
      { E: 1, B: 1 },
    ),
    ['B'],
  )
  assert.deepEqual(
    getConflictingLoopsToOpenG2(
      { E: 1, B: 0 },
      { E: 1, B: 1 },
    ),
    ['E'],
  )
  assert.deepEqual(
    getConflictingLoopsToOpenG2(
      { E: 0, B: 0 },
      { E: 1, B: 1 },
    ),
    ['B'],
  )
})

test('the valid states realize exactly the seven configured types', () => {
  const configuredTypes = new Set(GENUS_2_DATA.TYPES)
  const realizedTypes = new Set()

  for (const state of getValidStatesG2()) {
    const type = classifyG2State(state)
    assert.equal(configuredTypes.has(type), true, `${state} -> ${type}`)
    realizedTypes.add(type)
  }

  assert.deepEqual(realizedTypes, configuredTypes)
})

test('the two maximal states have the documented types', () => {
  assert.equal(classifyG2State('1110'), 'mm')
  assert.equal(classifyG2State('1101'), '0---0')
})

test('every transition option is a nearest state of the requested type', () => {
  for (const currentState of getValidStatesG2()) {
    for (const targetType of GENUS_2_DATA.TYPES) {
      const transition = findOptimalTransitionG2(currentState, targetType)
      const targetStates = TYPE_TO_STATES_G2[targetType]
      const expectedDistance = Math.min(
        ...targetStates.map((targetState) =>
          [...currentState].filter(
            (value, index) => value !== targetState[index],
          ).length,
        ),
      )

      assert.equal(transition.error, undefined)
      assert.equal(transition.sourceType, classifyG2State(currentState))
      assert.equal(transition.targetType, targetType)
      assert.equal(transition.distance, expectedDistance)
      assert.equal(transition.options.length > 0, true)

      for (const option of transition.options) {
        assert.equal(classifyG2State(option.targetState), targetType)
        assert.equal(option.distance, expectedDistance)

        const currentValues = stateToLoopValues(currentState)
        const targetValues = stateToLoopValues(option.targetState)
        const expectedToOpen = ALL_LOOPS_G2.filter(
          (loop) => currentValues[loop] === 1 && targetValues[loop] === 0,
        )
        const expectedToClose = ALL_LOOPS_G2.filter(
          (loop) => currentValues[loop] === 0 && targetValues[loop] === 1,
        )

        assert.deepEqual(option.toOpen, expectedToOpen)
        assert.deepEqual(option.toClose, expectedToClose)
      }
    }
  }
})

test('the default tour contains only configured types and returns to type 2', () => {
  for (const type of GENUS_2_DATA.DEFAULT_TOUR) {
    assert.equal(GENUS_2_DATA.TYPES.includes(type), true, type)
  }

  assert.equal(GENUS_2_DATA.DEFAULT_TOUR[0], '2')
  assert.equal(GENUS_2_DATA.DEFAULT_TOUR.at(-1), '2')
})
