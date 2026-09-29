const MARKER_MATERIAL_RULES = [
  ['H1', (name) => name === 'Loop_H1'],
  ['H2', (name) => name === 'Loop_H2'],
  ['H3', (name) => name === 'Loop_H3'],
  [
    'E1',
    (name) =>
      name.startsWith('Loop_E1') ||
      name === 'Loop_B12_E1' ||
      name === 'Loop_B13_E1' ||
      name === 'Loop_H1s_E1',
  ],
  [
    'E2',
    (name) =>
      name.startsWith('Loop_E2') ||
      name === 'Loop_B12_E2' ||
      name === 'Loop_B23_E2',
  ],
  [
    'E3',
    (name) =>
      name.startsWith('Loop_E3') ||
      name === 'Loop_B13_E3' ||
      name === 'Loop_B23_E3',
  ],
  ['B12', (name) => name.startsWith('Loop_B12')],
  ['B13', (name) => name.startsWith('Loop_B13')],
  ['B23', (name) => name.startsWith('Loop_B23')],
  [
    'H1_star',
    (name) =>
      name.startsWith('Loop_H1s') ||
      name.startsWith('Loop_H1_star') ||
      name.startsWith('Loop_H1*'),
  ],
]

const PRIMARY_MORPH_TARGETS = [
  ['H1', 'H1'],
  ['H2', 'H2'],
  ['H3', 'H3'],
  ['E1', 'E1'],
  ['E2', 'E2'],
  ['E3', 'E3'],
  ['B12', 'B12'],
  ['B13', 'B13'],
  ['B23', 'B23'],
  ['H1*', 'H1_star'],
  ['H1_star', 'H1_star'],
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
    componentColorMap,
    markerStyles,
    uniformColor,
  } = settings
  const materialName = material.name
  const markerColor = getMarkerColor(materialName, markerStyles)
  const componentColor =
    !uniformColor && componentColorMap?.[materialName]
      ? componentColorMap[materialName]
      : baseColor

  material.color.set(markerColor ?? componentColor)
  material.roughness = 0.35
  if (material.metalness !== undefined) {
    material.metalness = 0.05
  }
}

function setMorphTarget(dictionary, influences, targetName, value) {
  const targetIndex = dictionary[targetName]
  if (targetIndex !== undefined) {
    influences[targetIndex] = value
  }
}

export function getG3CorrectiveMorphWeights({
  E1,
  E2,
  E3,
  B12,
  B13,
  B23,
  H1_star,
}) {
  const tripleE1E2E3 = Math.min(E1, E2, E3)
  const tripleB12B13B23 = Math.min(B12, B13, B23)
  const tripleH1StarE2E3 = Math.min(H1_star, E2, E3)
  const tripleH1StarE2B13 = Math.min(H1_star, E2, B13)
  const tripleH1StarB12E3 = Math.min(H1_star, B12, E3)
  const tripleH1StarB12B13 = Math.min(H1_star, B12, B13)

  return {
    C_E1_E2_E3: tripleE1E2E3,
    C_B12_B13_B23: tripleB12B13B23,
    C_H1s_E2_E3: tripleH1StarE2E3,
    C_H1s_E2_B13: tripleH1StarE2B13,
    C_H1s_B12_E3: tripleH1StarB12E3,
    C_H1s_B12_B13: tripleH1StarB12B13,
    C_E1_E2: Math.min(E1, E2) - tripleE1E2E3,
    C_E1_E3: Math.min(E1, E3) - tripleE1E2E3,
    C_E2_E3:
      Math.min(E2, E3) - tripleE1E2E3 - tripleH1StarE2E3,
    C_B12_B13:
      Math.min(B12, B13) - tripleB12B13B23 - tripleH1StarB12B13,
    C_B12_B23: Math.min(B12, B23) - tripleB12B13B23,
    C_B13_B23: Math.min(B13, B23) - tripleB12B13B23,
    C_H1s_E2:
      Math.min(H1_star, E2) - tripleH1StarE2E3 - tripleH1StarE2B13,
    C_H1s_E3:
      Math.min(H1_star, E3) - tripleH1StarE2E3 - tripleH1StarB12E3,
    C_H1s_B12:
      Math.min(H1_star, B12) -
      tripleH1StarB12E3 -
      tripleH1StarB12B13,
    C_H1s_B13:
      Math.min(H1_star, B13) -
      tripleH1StarE2B13 -
      tripleH1StarB12B13,
  }
}

function applyMorphTargets(mesh, loopValues) {
  if (!mesh.morphTargetDictionary) return

  const dictionary = mesh.morphTargetDictionary
  const influences = mesh.morphTargetInfluences

  for (const [targetName, loopName] of PRIMARY_MORPH_TARGETS) {
    setMorphTarget(
      dictionary,
      influences,
      targetName,
      loopValues[loopName],
    )
  }

  const correctiveWeights = getG3CorrectiveMorphWeights(loopValues)
  for (const [targetName, weight] of Object.entries(correctiveWeights)) {
    setMorphTarget(dictionary, influences, targetName, weight)
  }
}

export function updateG3Scene(
  scene,
  { baseColor, componentColorMap, loopValues, markerStyles, uniformColor },
) {
  scene.traverse((child) => {
    if (!child.isMesh) return

    child.frustumCulled = false

    if (child.material) {
      applyMaterialSettings(child.material, {
        baseColor,
        componentColorMap,
        markerStyles,
        uniformColor,
      })
    }

    applyMorphTargets(child, loopValues)
  })
}
