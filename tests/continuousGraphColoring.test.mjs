import assert from 'node:assert/strict'
import test from 'node:test'

import { ContinuousGraphColoring } from '../src/features/genus3/continuousGraphColoring.js'

const LOOP_NAMES = [
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
const BASE_COLOR = '#000000'
const COMPONENT_PALETTE = ['#ff0000', '#00ff00', '#0000ff']
const OPEN_SURFACE = Object.fromEntries(
  LOOP_NAMES.map((loopName) => [loopName, 0]),
)

function createColoring() {
  return new ContinuousGraphColoring(BASE_COLOR, COMPONENT_PALETTE)
}

function getRegionColors(colorMap) {
  return Object.fromEntries(
    Object.entries(colorMap).filter(([name]) => name.startsWith('Region_')),
  )
}

test('component coloring can be disabled independently of loop values', () => {
  const coloring = createColoring()
  const colorMap = coloring.update(
    { ...OPEN_SURFACE, E1: 1, E2: 1, E3: 1 },
    false,
  )

  assert.ok(Object.values(colorMap).length > 0)
  assert.ok(Object.values(colorMap).every((color) => color === BASE_COLOR))
})

test('the unpinched genus-3 surface has one component color', () => {
  const coloring = createColoring()
  const regionColors = getRegionColors(
    coloring.update(OPEN_SURFACE, true),
  )

  assert.deepEqual(new Set(Object.values(regionColors)), new Set([BASE_COLOR]))
})

test('a closed E1 loop separates the expected genus-1 tail regions', () => {
  const coloring = createColoring()
  coloring.update(OPEN_SURFACE, true)

  const colorMap = coloring.update({ ...OPEN_SURFACE, E1: 1 }, true)
  const separatedRegions = Object.entries(getRegionColors(colorMap))
    .filter(([, color]) => color !== BASE_COLOR)
    .map(([name]) => name)

  assert.deepEqual(separatedRegions, [
    'Region_I1_A',
    'Region_I1_B',
    'Region_D1_A',
    'Region_D1_B',
  ])
  assert.equal(colorMap.Region_I1_A, COMPONENT_PALETTE[0])
  assert.equal(colorMap.Loop_E1_I1A, colorMap.Region_I1_A)
  assert.equal(colorMap.Loop_B12_E1, colorMap.Region_D1_A)
})

test('component colors blend continuously during a partial pinch', () => {
  const coloring = createColoring()
  coloring.update(OPEN_SURFACE, true)
  coloring.update({ ...OPEN_SURFACE, E1: 1 }, true)

  const colorMap = coloring.update({ ...OPEN_SURFACE, E1: 0.5 }, true)

  assert.equal(colorMap.Region_I1_A, '#800000')
  assert.equal(colorMap.Region_M_A, BASE_COLOR)
})

test('a component color is reused after separated regions merge again', () => {
  const coloring = createColoring()
  coloring.update(OPEN_SURFACE, true)
  coloring.update({ ...OPEN_SURFACE, E1: 1 }, true)
  coloring.update(OPEN_SURFACE, true)

  const colorMap = coloring.update({ ...OPEN_SURFACE, E2: 1 }, true)

  assert.equal(colorMap.Region_I2, COMPONENT_PALETTE[0])
})
