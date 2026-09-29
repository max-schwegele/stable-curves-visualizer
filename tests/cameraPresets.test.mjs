import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CAMERA_PRESET_NAMES,
  CAMERA_PRESETS,
  getCameraPreset,
  serializeCameraView,
} from '../src/features/camera/cameraPresets.js'

for (const genus of [2, 3]) {
  test(`genus ${genus} defines every camera preset`, () => {
    assert.deepEqual(Object.keys(CAMERA_PRESETS[genus]), CAMERA_PRESET_NAMES)

    for (const preset of Object.values(CAMERA_PRESETS[genus])) {
      assert.equal(preset.position.length, 3)
      assert.equal(preset.target.length, 3)
      assert.ok(preset.position.every(Number.isFinite))
      assert.ok(preset.target.every(Number.isFinite))
    }
  })
}

test('default is the primary camera preset', () => {
  assert.equal(CAMERA_PRESET_NAMES[0], 'default')

  for (const genus of [2, 3]) {
    assert.equal(getCameraPreset(genus, 'default'), CAMERA_PRESETS[genus].default)
  }
})

test('the elevated camera preset is named overview', () => {
  assert.equal(CAMERA_PRESET_NAMES[1], 'overview')
})

test('unknown camera presets are rejected', () => {
  assert.throws(
    () => getCameraPreset(2, 'unknown'),
    /Unknown camera preset: genus 2, unknown/,
  )
})

test('camera views are serialized with stable precision', () => {
  const serialized = serializeCameraView(
    3,
    [1.234567, 2, -3.456789],
    [0, 0.00001, 4.2],
  )

  assert.deepEqual(JSON.parse(serialized), {
    genus: 3,
    position: [1.2346, 2, -3.4568],
    target: [0, 0, 4.2],
  })
})
