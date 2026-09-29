import assert from 'node:assert/strict'
import test from 'node:test'

import { updateG2Scene } from '../src/features/genus2/renderingG2.js'

const DEFAULT_SETTINGS = {
  baseColor: '#4b7fba',
  secondaryColor: '#3a6391',
  uniformColor: false,
  loopValues: { H1: 0.2, H2: 0.4, E: 0.6, B: 0.8 },
  markerStyles: {
    H1: { visible: false, color: '#ff2d0c' },
    H2: { visible: false, color: '#67ff00' },
    E: { visible: false, color: '#ff7700' },
    B: { visible: false, color: '#f7ca15' },
  },
}

function createSceneWith(mesh) {
  return {
    traverse(callback) {
      callback(mesh)
    },
  }
}

test('genus-2 rendering applies the four primary morph targets', () => {
  const mesh = {
    isMesh: true,
    frustumCulled: true,
    material: null,
    morphTargetDictionary: { H1: 0, H2: 1, E: 2, B: 3 },
    morphTargetInfluences: [0, 0, 0, 0],
  }

  updateG2Scene(createSceneWith(mesh), DEFAULT_SETTINGS)

  assert.equal(mesh.frustumCulled, false)
  assert.deepEqual(mesh.morphTargetInfluences, [0.2, 0.4, 0.6, 0.8])
})

test('the equator marker retains precedence on the shared E-B material', () => {
  const assignedColors = []
  const mesh = {
    isMesh: true,
    frustumCulled: true,
    material: {
      name: 'Loop_B_E',
      color: { set: (color) => assignedColors.push(color) },
      roughness: 0,
      metalness: 0,
    },
  }
  const settings = {
    ...DEFAULT_SETTINGS,
    markerStyles: {
      ...DEFAULT_SETTINGS.markerStyles,
      E: { visible: true, color: '#ff7700' },
      B: { visible: true, color: '#f7ca15' },
    },
  }

  updateG2Scene(createSceneWith(mesh), settings)

  assert.deepEqual(assignedColors, ['#ff7700'])
  assert.equal(mesh.material.roughness, 0.35)
  assert.equal(mesh.material.metalness, 0.05)
})
