import { getPublicAssetUrl } from './publicAssetUrl.js'

export function getCurveDiagramUrl(genus, type) {
  return getPublicAssetUrl(`diagrams/genus-${genus}/curves/curve_${type}.svg`)
}

export function getGraphDiagramUrl(genus, type) {
  return getPublicAssetUrl(`diagrams/genus-${genus}/graphs/graph_${type}.svg`)
}
