import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_COMPONENT_COLORS_G2,
  DEFAULT_LOOP_COLORS_G2,
} from '../src/features/genus2/paletteG2.js'
import { ALL_LOOPS_G2 } from '../src/features/genus2/topologyG2.js'
import {
  DEFAULT_COMPONENT_COLORS_G3,
  DEFAULT_LOOP_COLORS_G3,
} from '../src/features/genus3/paletteG3.js'
import { ALL_LOOPS_G3 } from '../src/features/genus3/topologyG3.js'

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

function assertValidPalette(colors, label) {
  for (const color of Object.values(colors)) {
    assert.match(color, HEX_COLOR_PATTERN, `${label}: ${color}`)
  }
}

function assertUniqueColors(colors, label) {
  const values = Object.values(colors)
  assert.equal(
    new Set(values.map((color) => color.toLowerCase())).size,
    values.length,
    `${label} must not contain duplicate colors`,
  )
}

test('component palettes contain the expected number of colors', () => {
  assert.equal(Object.keys(DEFAULT_COMPONENT_COLORS_G2).length, 2)
  assert.equal(Object.keys(DEFAULT_COMPONENT_COLORS_G3).length, 4)
})

test('component palettes contain distinct hexadecimal colors', () => {
  assertValidPalette(DEFAULT_COMPONENT_COLORS_G2, 'Genus-2 components')
  assertValidPalette(DEFAULT_COMPONENT_COLORS_G3, 'Genus-3 components')
  assertUniqueColors(DEFAULT_COMPONENT_COLORS_G2, 'Genus-2 components')
  assertUniqueColors(DEFAULT_COMPONENT_COLORS_G3, 'Genus-3 components')
})

test('loop palettes cover every configured loop', () => {
  assert.deepEqual(
    Object.keys(DEFAULT_LOOP_COLORS_G2).sort(),
    [...ALL_LOOPS_G2].sort(),
  )
  assert.deepEqual(
    Object.keys(DEFAULT_LOOP_COLORS_G3).sort(),
    [...ALL_LOOPS_G3].sort(),
  )
})

test('loop palettes contain distinct hexadecimal colors', () => {
  assertValidPalette(DEFAULT_LOOP_COLORS_G2, 'Genus-2 loops')
  assertValidPalette(DEFAULT_LOOP_COLORS_G3, 'Genus-3 loops')
  assertUniqueColors(DEFAULT_LOOP_COLORS_G2, 'Genus-2 loops')
  assertUniqueColors(DEFAULT_LOOP_COLORS_G3, 'Genus-3 loops')
})
