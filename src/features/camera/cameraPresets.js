export const CAMERA_PRESET_NAMES = [
  'default',
  'overview',
  'front',
  'top',
]

export const CAMERA_PRESETS = {
  2: {
    default: {
      position: [1.95, 3.15, 4.05],
      target: [0, 0, 0],
    },
    overview: {
      position: [1.55, 4.2, 3.2],
      target: [0, 0, 0],
    },
    front: {
      position: [0, 3.1, 4.4],
      target: [0, 0, 0],
    },
    top: {
      position: [0, 6, 1],
      target: [0, 0, 0],
    },
  },
  3: {
    default: {
      position: [2.1, 3.45, 4.45],
      target: [0, 0, 0],
    },
    overview: {
      position: [1.65, 4.6, 3.5],
      target: [0, 0, 0],
    },
    front: {
      position: [0, 3.3, 4.65],
      target: [0, 0, 0],
    },
    top: {
      position: [0, 6.4, 1],
      target: [0, 0, 0],
    },
  },
}

export function getCameraPreset(genus, presetName) {
  const preset = CAMERA_PRESETS[genus]?.[presetName]
  if (!preset) {
    throw new Error(`Unknown camera preset: genus ${genus}, ${presetName}`)
  }
  return preset
}

function roundCoordinate(value) {
  return Number(value.toFixed(4))
}

export function serializeCameraView(genus, position, target) {
  return JSON.stringify(
    {
      genus,
      position: position.map(roundCoordinate),
      target: target.map(roundCoordinate),
    },
    null,
    2,
  )
}
