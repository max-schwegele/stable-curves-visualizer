export const ALL_LOOPS_G3 = [
  'H1',
  'H2',
  'H3',
  'H1_star',
  'E1',
  'E2',
  'E3',
  'B12',
  'B13',
  'B23',
]

export const CROSSING_PAIRS_G3 = [
  ['E1', 'B12'],
  ['E1', 'B13'],
  ['E2', 'B12'],
  ['E2', 'B23'],
  ['E3', 'B13'],
  ['E3', 'B23'],
  ['H1_star', 'E1'],
  ['H1_star', 'B23'],
]

export function getConflictingLoopsToOpenG3(
  previousLoopValues,
  currentLoopValues,
) {
  const newlyActivatedLoops = new Set(
    ALL_LOOPS_G3.filter(
      (loop) =>
        currentLoopValues[loop] > 0 && previousLoopValues[loop] === 0,
    ),
  )
  const loopsToOpen = new Set()

  for (const [first, second] of CROSSING_PAIRS_G3) {
    if (newlyActivatedLoops.has(first)) loopsToOpen.add(second)
    if (newlyActivatedLoops.has(second)) loopsToOpen.add(first)
  }

  return [...loopsToOpen]
}

export function getValidCombinationsG3() {
  const validCombinations = []
  const totalCombinations = 2 ** ALL_LOOPS_G3.length

  for (let index = 0; index < totalCombinations; index += 1) {
    const combination = ALL_LOOPS_G3.filter(
      (_, loopIndex) => (index & (1 << loopIndex)) !== 0,
    )

    const hasCrossingPair = CROSSING_PAIRS_G3.some(
      ([first, second]) =>
        combination.includes(first) && combination.includes(second),
    )

    if (!hasCrossingPair) {
      validCombinations.push(combination)
    }
  }

  return validCombinations
}

export function classifyG3(combination) {
  const has = (loop) => combination.includes(loop)

  if (has('H1') && has('H1_star')) {
    const getSideState = (handle, equator, bridge) => {
      if (has(handle) && has(equator)) return '0m'
      if (has(handle) && has(bridge)) return 'Z'
      if (has(handle) || has(bridge)) return '0n'
      if (has(equator)) return '0e'
      return '1'
    }

    const left = getSideState('H2', 'E2', 'B12')
    const right = getSideState('H3', 'E3', 'B13')

    const weight = {
      1: 0,
      '0n': 1,
      '0e': 2,
      '0m': 3,
      Z: 4,
    }

    const result =
      weight[left] > weight[right]
        ? `${right}=${left}`
        : `${left}=${right}`

    const canonicalNames = {
      '0e=0m': '0m=0e',
      '1=Z': 'Z=1',
      '0n=Z': 'Z=0n',
      '0e=Z': 'Z=0e',
      '0m=Z': 'Z=0m',
    }

    return canonicalNames[result] ?? result
  }

  const numberOfEquators = ['E1', 'E2', 'E3'].filter(has).length

  if (numberOfEquators === 3) {
    const numberOfHandles = ['H1', 'H2', 'H3'].filter(has).length

    if (numberOfHandles === 0) return '0eee'
    if (numberOfHandles === 1) return '0mee'
    if (numberOfHandles === 2) return '0mme'
    if (numberOfHandles === 3) return '0mmm'
  }

  if (numberOfEquators === 2) {
    let tailNodeCount = 0
    let coreNodeCount = 0

    if (!has('E3')) {
      if (has('H1')) tailNodeCount += 1
      if (has('H2')) tailNodeCount += 1
      if (has('H3')) coreNodeCount += 1
    } else if (!has('E2')) {
      if (has('H1')) tailNodeCount += 1
      if (has('H3')) tailNodeCount += 1
      if (has('H2')) coreNodeCount += 1
    } else if (!has('E1')) {
      if (has('H2')) tailNodeCount += 1
      if (has('H3')) tailNodeCount += 1
      if (has('H1') || has('H1_star')) coreNodeCount += 1
    }

    if (coreNodeCount === 0) {
      if (tailNodeCount === 0) return '1ee'
      if (tailNodeCount === 1) return '1me'
      return '1mm'
    }

    if (tailNodeCount === 0) return '0nee'
    if (tailNodeCount === 1) return '0nme'
    return '0nmm'
  }

  if (numberOfEquators === 1) {
    let hasTailNode = false
    let hasThreeEdgeBridge = false
    let coreNodeCount = 0

    if (has('E1')) {
      hasTailNode = has('H1')
      hasThreeEdgeBridge = has('H2') && has('B23') && has('H3')

      if (!hasThreeEdgeBridge) {
        coreNodeCount = ['H2', 'H3', 'B23'].filter(has).length
      }
    } else if (has('E2')) {
      hasTailNode = has('H2')
      hasThreeEdgeBridge =
        (has('H1') && has('B13') && has('H3')) ||
        (has('H1_star') && has('B13') && has('H3'))

      if (!hasThreeEdgeBridge) {
        coreNodeCount = ['H1', 'H3', 'B13', 'H1_star'].filter(has).length
      }
    } else if (has('E3')) {
      hasTailNode = has('H3')
      hasThreeEdgeBridge =
        (has('H1') && has('B12') && has('H2')) ||
        (has('H1_star') && has('B12') && has('H2'))

      if (!hasThreeEdgeBridge) {
        coreNodeCount = ['H1', 'H2', 'B12', 'H1_star'].filter(has).length
      }
    }

    if (hasThreeEdgeBridge) {
      return hasTailNode ? '0---0m' : '0---0e'
    }

    if (coreNodeCount === 0) return hasTailNode ? '2m' : '2e'
    if (coreNodeCount === 1) return hasTailNode ? '1nm' : '1ne'
    if (coreNodeCount === 2) return hasTailNode ? '0nnm' : '0nne'
  }

  if (numberOfEquators === 0) {
    const numberOfLoops = combination.length

    const numberOfThreeEdgeBridges = [
      has('H1') && has('B12') && has('H2'),
      has('H2') && has('B23') && has('H3'),
      has('H1') && has('B13') && has('H3'),
      has('H1_star') && has('B12') && has('H2'),
      has('H1_star') && has('B13') && has('H3'),
      has('B12') && has('B13') && has('B23'),
    ].filter(Boolean).length

    if (numberOfLoops === 6) return 'BRAID'
    if (numberOfLoops === 5) return 'CAVE'

    if (numberOfLoops === 4) {
      return numberOfThreeEdgeBridges >= 1 ? '0---0n' : '0----0'
    }

    if (numberOfLoops === 3) {
      return numberOfThreeEdgeBridges >= 1 ? '1---0' : '0nnn'
    }

    if (numberOfLoops === 2) return '1nn'
    if (numberOfLoops === 1) return '2n'
    if (numberOfLoops === 0) return '3'
  }

  return 'UNKNOWN'
}

export function findOptimalTransitionG3(currentLoops, targetType) {
  const validCombinations = getValidCombinationsG3()
  const targets = validCombinations.filter(
    (combination) => classifyG3(combination) === targetType,
  )

  if (targets.length === 0) {
    return {
      error: `No valid loop configuration exists for type "${targetType}".`,
      options: [],
    }
  }

  let minimumDistance = Number.POSITIVE_INFINITY

  const evaluatedTargets = targets.map((targetLoops) => {
    const toOpen = currentLoops.filter(
      (loop) => !targetLoops.includes(loop),
    )
    const toClose = targetLoops.filter(
      (loop) => !currentLoops.includes(loop),
    )
    const distance = toOpen.length + toClose.length

    minimumDistance = Math.min(minimumDistance, distance)

    return {
      targetLoops,
      toOpen,
      toClose,
      distance,
    }
  })

  const options = evaluatedTargets.filter(
    ({ distance }) => distance === minimumDistance,
  )

  return {
    sourceType: classifyG3(currentLoops),
    targetType,
    distance: minimumDistance,
    options,
  }
}
