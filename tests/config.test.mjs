import assert from 'node:assert/strict'
import test from 'node:test'

import { GENUS_DATA } from '../src/config.js'

function assertUnique(values, label) {
  assert.equal(
    new Set(values).size,
    values.length,
    `${label} must not contain duplicates`,
  )
}

function getNavigationTypes(sections) {
  return sections.flatMap((section) =>
    section.subgroups.flatMap((subgroup) => subgroup.items),
  )
}

test('the configurations contain seven genus-2 and 42 genus-3 types', () => {
  assert.equal(GENUS_DATA[2].TYPES.length, 7)
  assert.equal(GENUS_DATA[3].TYPES.length, 42)
})

test('the configured type names are unique in each genus', () => {
  assertUnique(GENUS_DATA[2].TYPES, 'Genus-2 types')
  assertUnique(GENUS_DATA[3].TYPES, 'Genus-3 types')
})

test('the genus-3 navigation contains every configured type exactly once', () => {
  const navigationTypes = getNavigationTypes(GENUS_DATA[3].SECTIONS)

  assert.equal(navigationTypes.length, 42)
  assertUnique(navigationTypes, 'Genus-3 navigation types')
  assert.deepEqual(navigationTypes, GENUS_DATA[3].TYPES)
})

test('section identifiers are unique and every subgroup is nonempty', () => {
  const sections = GENUS_DATA[3].SECTIONS

  assertUnique(
    sections.map((section) => section.id),
    'Genus-3 section identifiers',
  )

  for (const section of sections) {
    assert.ok(section.subgroups.length > 0)
    for (const subgroup of section.subgroups) {
      assert.ok(subgroup.items.length > 0)
    }
  }
})

test('each default type belongs to its configured genus', () => {
  for (const genus of [2, 3]) {
    assert.ok(GENUS_DATA[genus].TYPES.includes(GENUS_DATA[genus].DEFAULT_TYPE))
  }
})

test('each default tour uses only configured types and returns to its start', () => {
  for (const genus of [2, 3]) {
    const { DEFAULT_TOUR, TYPES } = GENUS_DATA[genus]

    assert.ok(DEFAULT_TOUR.every((type) => TYPES.includes(type)))
    assert.equal(DEFAULT_TOUR.at(-1), DEFAULT_TOUR[0])
  }
})

test('the genus-3 default tour visits every type once before returning', () => {
  const { DEFAULT_TOUR, TYPES } = GENUS_DATA[3]
  const visitedTypes = DEFAULT_TOUR.slice(0, -1)

  assert.deepEqual(visitedTypes, TYPES)
  assertUnique(visitedTypes, 'Genus-3 tour types')
})
