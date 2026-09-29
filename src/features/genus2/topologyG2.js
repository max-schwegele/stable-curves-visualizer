export const ALL_LOOPS_G2 = ['H1', 'H2', 'E', 'B']

export const CROSSING_PAIRS_G2 = [['E', 'B']]

export function getConflictingLoopsToOpenG2(
  previousLoopValues,
  currentLoopValues,
) {
  const equatorWasActivated =
    currentLoopValues.E > 0 && previousLoopValues.E === 0
  if (equatorWasActivated && currentLoopValues.B > 0) {
    return ['B']
  }

  const bridgeWasActivated =
    currentLoopValues.B > 0 && previousLoopValues.B === 0
  if (bridgeWasActivated && currentLoopValues.E > 0) {
    return ['E']
  }

  return []
}

export const TYPE_TO_STATES_G2 = {
  2: ['0000'],
  '1n': ['1000', '0100', '0001'],
  '0nn': ['1100', '1001', '0101'],
  '0---0': ['1101'],
  ee: ['0010'],
  me: ['1010', '0110'],
  mm: ['1110'],
}

export const TYPES_G2 = Object.keys(TYPE_TO_STATES_G2)

const STATE_TO_TYPE_G2 = Object.fromEntries(
  Object.entries(TYPE_TO_STATES_G2).flatMap(([type, states]) =>
    states.map((state) => [state, type]),
  ),
)

export function getValidStatesG2() {
  return Object.keys(STATE_TO_TYPE_G2)
}

export function classifyG2State(state) {
  return STATE_TO_TYPE_G2[state] ?? 'UNKNOWN'
}

export function loopValuesToState(loopValues, threshold = 0.5) {
  return ALL_LOOPS_G2.map((loop) =>
    (loopValues[loop] ?? 0) > threshold ? '1' : '0',
  ).join('')
}

export function stateToLoopValues(state) {
  if (!/^[01]{4}$/.test(state)) {
    throw new TypeError(`Invalid genus-2 loop state: "${state}".`)
  }

  return Object.fromEntries(
    ALL_LOOPS_G2.map((loop, index) => [loop, Number(state[index])]),
  )
}

function stateDistance(first, second) {
  return [...first].filter((value, index) => value !== second[index]).length
}

export function findOptimalTransitionG2(currentState, targetType) {
  const targetStates = TYPE_TO_STATES_G2[targetType]

  if (targetStates === undefined) {
    return {
      error: `No valid loop configuration exists for type "${targetType}".`,
      options: [],
    }
  }

  const evaluatedTargets = targetStates.map((targetState) => {
    const currentValues = stateToLoopValues(currentState)
    const targetValues = stateToLoopValues(targetState)
    const toOpen = ALL_LOOPS_G2.filter(
      (loop) => currentValues[loop] === 1 && targetValues[loop] === 0,
    )
    const toClose = ALL_LOOPS_G2.filter(
      (loop) => currentValues[loop] === 0 && targetValues[loop] === 1,
    )

    return {
      targetState,
      targetLoops: ALL_LOOPS_G2.filter((loop) => targetValues[loop] === 1),
      toOpen,
      toClose,
      distance: stateDistance(currentState, targetState),
    }
  })

  const distance = Math.min(
    ...evaluatedTargets.map((target) => target.distance),
  )
  const options = evaluatedTargets.filter(
    (target) => target.distance === distance,
  )

  return {
    sourceType: classifyG2State(currentState),
    targetType,
    distance,
    options,
  }
}
