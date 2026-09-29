import { getComponentColor } from './coloringG2.js'

const MARKER_MATERIAL_RULES = [
  ['H1', (name) => name === 'Loop_H1'],
  ['H2', (name) => name === 'Loop_H2'],
  [
    'E',
    (name) => ['Loop_E_T', 'Loop_E_B', 'Loop_B_E'].includes(name),
  ],
  [
    'B',
    (name) => ['Loop_B_L', 'Loop_B_R', 'Loop_B_E'].includes(name),
  ],
]

const PRIMARY_MORPH_TARGETS = [
  ['H1', 'H1'],
  ['H2', 'H2'],
  ['E', 'E'],
  ['B', 'B'],
]

function getMarkerColor(materialName, markerStyles) {
  for (const [loopName, matchesMaterial] of MARKER_MATERIAL_RULES) {
    const markerStyle = markerStyles[loopName]
    if (markerStyle.visible && matchesMaterial(materialName)) {
      return markerStyle.color
    }
  }

  return null
}

function applyMaterialSettings(material, settings) {
  const {
    baseColor,
    loopValues,
    markerStyles,
    secondaryColor,
    uniformColor,
  } = settings
  const materialName = material.name
  const markerColor = getMarkerColor(materialName, markerStyles)

  if (markerColor !== null) {
    material.color.set(markerColor)
  } else if (
    materialName.startsWith('Region_') ||
    materialName.startsWith('Loop_')
  ) {
    const componentColor = getComponentColor(
      materialName,
      loopValues.H1,
      loopValues.H2,
      loopValues.E,
      loopValues.B,
      baseColor,
      !uniformColor,
      baseColor,
      secondaryColor,
    )
    material.color.set(componentColor)
  } else {
    material.color.set(baseColor)
  }

  material.roughness = 0.35
  if (material.metalness !== undefined) {
    material.metalness = 0.05
  }
}

function applyMorphTargets(mesh, loopValues) {
  if (!mesh.morphTargetDictionary) return

  const dictionary = mesh.morphTargetDictionary
  const influences = mesh.morphTargetInfluences

  for (const [targetName, loopName] of PRIMARY_MORPH_TARGETS) {
    const targetIndex = dictionary[targetName]
    if (targetIndex !== undefined) {
      influences[targetIndex] = loopValues[loopName]
    }
  }
}

export function updateG2Scene(
  scene,
  {
    baseColor,
    loopValues,
    markerStyles,
    secondaryColor,
    uniformColor,
  },
) {
  scene.traverse((child) => {
    if (!child.isMesh) return

    child.frustumCulled = false

    if (child.material) {
      applyMaterialSettings(child.material, {
        baseColor,
        loopValues,
        markerStyles,
        secondaryColor,
        uniformColor,
      })
    }

    applyMorphTargets(child, loopValues)
  })
}
