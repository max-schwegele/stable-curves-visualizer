import { Color } from 'three'

const MATERIAL_TO_REGION = {
  Loop_H1: 'Region_TL',
  Loop_H2: 'Region_TR',
  Loop_B_L: 'Region_BL',
  Loop_B_R: 'Region_BR',
  Loop_E_T: 'Region_TR',
  Loop_E_B: 'Region_BR',
  Loop_B_E: 'Region_BR',
}

const LEFT_REGIONS = new Set(['Region_TL', 'Region_BL'])
const RIGHT_REGIONS = new Set(['Region_TR', 'Region_BR'])
const TOP_REGIONS = new Set(['Region_TL', 'Region_TR'])
const BOTTOM_REGIONS = new Set(['Region_BL', 'Region_BR'])

export function getComponentColor(
  materialName,
  h1,
  h2,
  e,
  b,
  baseHex,
  showComponents,
  color1Hex,
  color2Hex,
) {
  const baseColor = new Color(baseHex)

  if (!showComponents) {
    return baseColor
  }

  const region = MATERIAL_TO_REGION[materialName] ?? materialName
  const color1 = new Color(color1Hex)
  const color2 = new Color(color2Hex)
  const finalColor = baseColor.clone()

  if (e > 0) {
    if (LEFT_REGIONS.has(region)) {
      finalColor.lerp(color1, e)
    } else if (RIGHT_REGIONS.has(region)) {
      finalColor.lerp(color2, e)
    }
  }

  const jointIntensity = Math.min(h1, h2, b)

  if (jointIntensity > 0) {
    if (TOP_REGIONS.has(region)) {
      finalColor.lerp(color1, jointIntensity)
    } else if (BOTTOM_REGIONS.has(region)) {
      finalColor.lerp(color2, jointIntensity)
    }
  }

  return finalColor
}