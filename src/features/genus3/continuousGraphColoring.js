const REGION_NODES = [
  'Region_M_A',
  'Region_M_B',
  'Region_I1_A',
  'Region_I1_B',
  'Region_I2',
  'Region_I3',
  'Region_O12',
  'Region_O13',
  'Region_O23_A',
  'Region_O23_B',
  'Region_D1_A',
  'Region_D1_B',
  'Region_D2_A',
  'Region_D2_B',
  'Region_D3_A',
  'Region_D3_B',
]

const REGION_EDGES = [
  { loop: 'H1', u: 'Region_D1_A', v: 'Region_D1_B' },
  { loop: 'H2', u: 'Region_D2_A', v: 'Region_D2_B' },
  { loop: 'H3', u: 'Region_D3_A', v: 'Region_D3_B' },
  { loop: 'H1_star', u: 'Region_I1_A', v: 'Region_I1_B' },
  { loop: 'H1_star', u: 'Region_M_A', v: 'Region_M_B' },
  { loop: 'H1_star', u: 'Region_O23_A', v: 'Region_O23_B' },
  { loop: 'E1', u: 'Region_I1_A', v: 'Region_M_A' },
  { loop: 'E1', u: 'Region_I1_B', v: 'Region_M_B' },
  { loop: 'E1', u: 'Region_D1_A', v: 'Region_O12' },
  { loop: 'E1', u: 'Region_D1_B', v: 'Region_O13' },
  { loop: 'E2', u: 'Region_I2', v: 'Region_M_A' },
  { loop: 'E2', u: 'Region_D2_B', v: 'Region_O12' },
  { loop: 'E2', u: 'Region_D2_A', v: 'Region_O23_A' },
  { loop: 'E3', u: 'Region_I3', v: 'Region_M_B' },
  { loop: 'E3', u: 'Region_D3_A', v: 'Region_O13' },
  { loop: 'E3', u: 'Region_D3_B', v: 'Region_O23_B' },
  { loop: 'B12', u: 'Region_D1_A', v: 'Region_I1_A' },
  { loop: 'B12', u: 'Region_D2_B', v: 'Region_I2' },
  { loop: 'B12', u: 'Region_O12', v: 'Region_M_A' },
  { loop: 'B13', u: 'Region_D1_B', v: 'Region_I1_B' },
  { loop: 'B13', u: 'Region_D3_A', v: 'Region_I3' },
  { loop: 'B13', u: 'Region_O13', v: 'Region_M_B' },
  { loop: 'B23', u: 'Region_D2_A', v: 'Region_I2' },
  { loop: 'B23', u: 'Region_D3_B', v: 'Region_I3' },
  { loop: 'B23', u: 'Region_O23_A', v: 'Region_M_A' },
  { loop: 'B23', u: 'Region_O23_B', v: 'Region_M_B' },
]

const CANONICAL_REGION_BY_SEGMENT = {
  H1: 'D1_A',
  H2: 'D2_A',
  H3: 'D3_A',
  H1s_I1: 'I1_A',
  H1s_M: 'M_A',
  H1s_O23: 'O23_A',
  E1_I1A: 'I1_A',
  E1_I1B: 'I1_B',
  E1_O12: 'D1_A',
  E1_O13: 'D1_B',
  E2_I2: 'I2',
  E2_O12: 'D2_B',
  E2_O23: 'D2_A',
  E3_I3: 'I3',
  E3_O13: 'D3_A',
  E3_O23: 'D3_B',
  B12_I1: 'D1_A',
  B12_I2: 'D2_B',
  B12_C: 'O12',
  B13_I1: 'D1_B',
  B13_I3: 'D3_A',
  B13_C: 'O13',
  B23_I2: 'D2_A',
  B23_I3: 'D3_B',
  B23_CA: 'O23_A',
  B23_CB: 'O23_B',
}

const INTERSECTION_REGION_BY_MATERIAL = {
  Loop_B12_E1: 'D1_A',
  Loop_B12_E2: 'D2_B',
  Loop_B13_E1: 'D1_B',
  Loop_B13_E3: 'D3_A',
  Loop_B23_E2: 'D2_A',
  Loop_B23_E3: 'D3_B',
  Loop_H1s_E1: 'I1_A',
  Loop_H1s_B23: 'O23_A',
}

const ROOT_NODE = REGION_NODES[0]

function parseHexColor(color) {
  return [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ]
}

function mixHexColors(targetColor, parentColor, parentWeight) {
  const target = parseHexColor(targetColor)
  const parent = parseHexColor(parentColor)

  const red = Math.round(target[0] * (1 - parentWeight) + parent[0] * parentWeight)
  const green = Math.round(target[1] * (1 - parentWeight) + parent[1] * parentWeight)
  const blue = Math.round(target[2] * (1 - parentWeight) + parent[2] * parentWeight)

  return `#${(
    (1 << 24) |
    (red << 16) |
    (green << 8) |
    blue
  )
    .toString(16)
    .slice(1)}`
}

function createFlatColorMap(baseColor) {
  const colorMap = {}

  for (const node of REGION_NODES) {
    colorMap[node] = baseColor
  }

  for (const segment of Object.keys(CANONICAL_REGION_BY_SEGMENT)) {
    colorMap[`Loop_${segment}`] = baseColor
  }

  for (const materialName of Object.keys(INTERSECTION_REGION_BY_MATERIAL)) {
    colorMap[materialName] = baseColor
  }

  return colorMap
}

function buildConnectivityMatrix(loopValues) {
  const connectivity = {}

  for (const first of REGION_NODES) {
    connectivity[first] = {}

    for (const second of REGION_NODES) {
      connectivity[first][second] = first === second ? 1 : 0
    }
  }

  for (const { loop, u, v } of REGION_EDGES) {
    const loopValue = loopValues[loop] ?? 0
    const capacity = Math.max(0, 1 - loopValue)

    connectivity[u][v] = Math.max(connectivity[u][v], capacity)
    connectivity[v][u] = Math.max(connectivity[v][u], capacity)
  }

  // Maximum-product transitive closure: path strength is the product of its edges.
  for (const intermediate of REGION_NODES) {
    for (const first of REGION_NODES) {
      for (const second of REGION_NODES) {
        connectivity[first][second] = Math.max(
          connectivity[first][second],
          connectivity[first][intermediate] * connectivity[intermediate][second],
        )
      }
    }
  }

  return connectivity
}

function findCurrentRoots(connectivity) {
  const rootByNode = {}
  const roots = new Set()
  const visited = new Set()

  for (const candidateRoot of REGION_NODES) {
    if (visited.has(candidateRoot)) continue

    roots.add(candidateRoot)

    for (const node of REGION_NODES) {
      if (!visited.has(node) && connectivity[candidateRoot][node] > 0.9999) {
        rootByNode[node] = candidateRoot
        visited.add(node)
      }
    }
  }

  return { rootByNode, roots }
}

export class ContinuousGraphColoring {
  constructor(baseColor, palette) {
    this.baseColor = baseColor
    this.availableColors = [...palette].reverse()
    this.fallbackPalette = [...palette]
    this.overflowIndex = 0

    this.previousRootByNode = {}
    this.targetColorByRoot = { [ROOT_NODE]: baseColor }

    for (const node of REGION_NODES) {
      this.previousRootByNode[node] = ROOT_NODE
    }
  }

  update(loopValues, useComponentColors) {
    if (!useComponentColors) {
      return createFlatColorMap(this.baseColor)
    }

    if (this.availableColors.length === 0 && this.fallbackPalette.length === 0) {
      this.availableColors = [this.baseColor]
      this.fallbackPalette = [this.baseColor]
    }

    const connectivity = buildConnectivityMatrix(loopValues)
    const { rootByNode, roots } = findCurrentRoots(connectivity)

    for (const root of roots) {
      const isNewRoot = this.previousRootByNode[root] !== root

      if (isNewRoot && this.targetColorByRoot[root] === undefined) {
        let color = this.availableColors.pop()

        if (color === undefined) {
          color = this.fallbackPalette[
            this.overflowIndex % this.fallbackPalette.length
          ]
          this.overflowIndex += 1
        }

        this.targetColorByRoot[root] = color
      }
    }

    const previousRoots = new Set(Object.values(this.previousRootByNode))

    for (const previousRoot of previousRoots) {
      if (!roots.has(previousRoot) && previousRoot !== ROOT_NODE) {
        const releasedColor = this.targetColorByRoot[previousRoot]

        if (releasedColor !== undefined) {
          this.availableColors.push(releasedColor)
          delete this.targetColorByRoot[previousRoot]
        }
      }
    }

    const mixedColorByRoot = {}

    for (const root of REGION_NODES) {
      if (!roots.has(root)) continue

      let parentRoot = null
      let parentCapacity = 0

      for (const candidateParent of REGION_NODES) {
        if (candidateParent === root) break
        if (!roots.has(candidateParent)) continue

        if (connectivity[root][candidateParent] > parentCapacity) {
          parentCapacity = connectivity[root][candidateParent]
          parentRoot = candidateParent
        }
      }

      if (parentRoot !== null && parentCapacity > 0) {
        mixedColorByRoot[root] = mixHexColors(
          this.targetColorByRoot[root],
          mixedColorByRoot[parentRoot],
          parentCapacity,
        )
      } else {
        mixedColorByRoot[root] = this.targetColorByRoot[root]
      }
    }

    const colorMap = {}

    for (const node of REGION_NODES) {
      colorMap[node] = mixedColorByRoot[rootByNode[node]]
    }

    for (const [segment, region] of Object.entries(CANONICAL_REGION_BY_SEGMENT)) {
      colorMap[`Loop_${segment}`] = colorMap[`Region_${region}`]
    }

    for (const [materialName, region] of Object.entries(
      INTERSECTION_REGION_BY_MATERIAL,
    )) {
      colorMap[materialName] = colorMap[`Region_${region}`]
    }

    this.previousRootByNode = rootByNode

    return colorMap
  }
}