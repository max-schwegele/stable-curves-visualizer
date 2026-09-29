import {
  getCurveDiagramUrl,
  getGraphDiagramUrl,
} from '../../shared/diagramUrls.js'
import { isColorDark, loadImage } from '../../shared/imageUtils.js'

const OVERLAY_IMAGE_WIDTH = 200
const OVERLAY_BOX_WIDTH = OVERLAY_IMAGE_WIDTH + 25

function createCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function findVisibleBounds(canvas) {
  const context = canvas.getContext('2d')
  if (!context) return null

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  let minX = canvas.width
  let minY = canvas.height
  let maxX = 0
  let maxY = 0
  let foundVisiblePixel = false

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const alphaIndex = (y * canvas.width + x) * 4 + 3
      if (pixels[alphaIndex] === 0) continue

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
      foundVisiblePixel = true
    }
  }

  if (!foundVisiblePixel) return null
  return { minX, minY, maxX, maxY }
}

function cropTransparentBorder(sourceCanvas, devicePixelRatio) {
  const scanCanvas = createCanvas(sourceCanvas.width, sourceCanvas.height)
  const scanContext = scanCanvas.getContext('2d')
  if (!scanContext) return sourceCanvas

  scanContext.drawImage(sourceCanvas, 0, 0)
  const bounds = findVisibleBounds(scanCanvas)
  if (!bounds) return sourceCanvas

  const padding = 25 * devicePixelRatio
  const minX = Math.max(0, bounds.minX - padding)
  const minY = Math.max(0, bounds.minY - padding)
  const maxX = Math.min(scanCanvas.width - 1, bounds.maxX + padding)
  const maxY = Math.min(scanCanvas.height - 1, bounds.maxY + padding)
  const width = maxX - minX + 1
  const height = maxY - minY + 1
  const croppedCanvas = createCanvas(width, height)
  const croppedContext = croppedCanvas.getContext('2d')

  if (!croppedContext) return sourceCanvas

  croppedContext.drawImage(
    scanCanvas,
    minX,
    minY,
    width,
    height,
    0,
    0,
    width,
    height,
  )

  return croppedCanvas
}

async function loadDiagramAssets({ genus, type, includeCurve, includeGraph }) {
  const assets = {
    curve: null,
    curveHeight: 0,
    graph: null,
    graphHeight: 0,
    totalBoxHeight: 20,
  }

  if (includeCurve) {
    assets.curve = await loadImage(getCurveDiagramUrl(genus, type))
    const ratio =
      assets.curve.height && assets.curve.width
        ? assets.curve.height / assets.curve.width
        : 0.5
    assets.curveHeight = OVERLAY_IMAGE_WIDTH * ratio
    assets.totalBoxHeight += 25 + assets.curveHeight + 20
  }

  if (includeGraph) {
    assets.graph = await loadImage(getGraphDiagramUrl(genus, type))
    const ratio =
      assets.graph.height && assets.graph.width
        ? assets.graph.height / assets.graph.width
        : 1
    assets.graphHeight = OVERLAY_IMAGE_WIDTH * ratio
    assets.totalBoxHeight += 25 + assets.graphHeight + 20
  }

  return assets
}

function fillAndStrokeBox(context, x, y, width, height, radius) {
  if (context.roundRect) {
    context.beginPath()
    context.roundRect(x, y, width, height, radius)
    context.fill()
    context.stroke()
    return
  }

  context.fillRect(x, y, width, height)
  context.strokeRect(x, y, width, height)
}

function drawTypeBadge(context, type, useDarkTheme) {
  context.save()
  context.font = 'bold 15px monospace'

  const label = `Type ${type}`
  const width = context.measureText(label).width + 24
  const height = 34
  const x = 20
  const y = 20

  context.fillStyle = useDarkTheme
    ? 'rgba(25, 25, 25, 0.85)'
    : 'rgba(255, 255, 255, 0.95)'
  context.strokeStyle = useDarkTheme
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.15)'
  context.lineWidth = 1
  fillAndStrokeBox(context, x, y, width, height, 6)

  context.fillStyle = useDarkTheme ? '#4ade80' : '#16a34a'
  context.fillText(label, x + 12, y + 22)
  context.restore()
}

function drawDiagramImage(
  context,
  image,
  label,
  x,
  y,
  height,
  useDarkTheme,
  labelColor,
) {
  context.fillStyle = labelColor
  context.fillText(label, x, y)

  const imageY = y + 12
  if (useDarkTheme) context.filter = 'invert(1) brightness(2.2)'
  context.drawImage(image, x, imageY, OVERLAY_IMAGE_WIDTH, height)
  context.filter = 'none'

  return imageY + height
}

function drawDiagramPanel({
  context,
  canvasWidth,
  canvasHeight,
  assets,
  includeCurve,
  includeGraph,
  trimBorder,
  useDarkTheme,
}) {
  const labelColor = useDarkTheme ? '#aaaaaa' : '#444444'
  const boxX = canvasWidth - OVERLAY_BOX_WIDTH - (trimBorder ? 15 : 45)
  const boxY = trimBorder
    ? (canvasHeight - assets.totalBoxHeight) / 2
    : 35

  context.fillStyle = useDarkTheme
    ? 'rgba(25, 25, 25, 0.9)'
    : 'rgba(255, 255, 255, 0.95)'
  context.strokeStyle = useDarkTheme
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(0, 0, 0, 0.15)'
  context.lineWidth = 1
  fillAndStrokeBox(
    context,
    boxX,
    boxY,
    OVERLAY_BOX_WIDTH,
    assets.totalBoxHeight,
    10,
  )

  context.font = 'bold 14px sans-serif'
  let drawY = boxY + 25

  if (includeCurve && assets.curve) {
    drawY = drawDiagramImage(
      context,
      assets.curve,
      'SCHEMATIC CURVE',
      boxX + 12,
      drawY,
      assets.curveHeight,
      useDarkTheme,
      labelColor,
    )
    drawY += 35
  }

  if (includeGraph && assets.graph) {
    drawDiagramImage(
      context,
      assets.graph,
      'DUAL GRAPH',
      boxX + 12,
      drawY,
      assets.graphHeight,
      useDarkTheme,
      labelColor,
    )
  }
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportSnapshot({
  backgroundColor,
  devicePixelRatio,
  genus,
  includeCurve,
  includeGraph,
  includeTypeLabel,
  isKnownType,
  trimBorder,
  type,
  useCustomBackground,
}) {
  const canvas = document.querySelector('#canvas__container canvas')
  if (!canvas) return false

  const sourceCanvas = trimBorder
    ? cropTransparentBorder(canvas, devicePixelRatio)
    : canvas
  const hasDiagramPanel = isKnownType && (includeCurve || includeGraph)

  let diagramAssets = {
    curve: null,
    curveHeight: 0,
    graph: null,
    graphHeight: 0,
    totalBoxHeight: 20,
  }

  if (hasDiagramPanel) {
    try {
      diagramAssets = await loadDiagramAssets({
        genus,
        type,
        includeCurve,
        includeGraph,
      })
    } catch (error) {
      console.error('Failed to load snapshot diagrams:', error)
    }
  }

  const baseWidth = sourceCanvas.width / devicePixelRatio
  const baseHeight = sourceCanvas.height / devicePixelRatio
  const extraWidth =
    trimBorder && hasDiagramPanel ? OVERLAY_BOX_WIDTH + 30 : 0
  const outputWidth = baseWidth + extraWidth
  const outputHeight =
    trimBorder && hasDiagramPanel
      ? Math.max(baseHeight, diagramAssets.totalBoxHeight + 60)
      : baseHeight
  const outputCanvas = createCanvas(
    outputWidth * devicePixelRatio,
    outputHeight * devicePixelRatio,
  )
  const context = outputCanvas.getContext('2d')
  if (!context) return false

  if (useCustomBackground) {
    context.fillStyle = backgroundColor
    context.fillRect(0, 0, outputCanvas.width, outputCanvas.height)
  } else {
    context.clearRect(0, 0, outputCanvas.width, outputCanvas.height)
  }

  context.scale(devicePixelRatio, devicePixelRatio)
  const modelYOffset = (outputHeight - baseHeight) / 2
  context.drawImage(sourceCanvas, 0, modelYOffset, baseWidth, baseHeight)

  const useDarkTheme =
    !useCustomBackground || isColorDark(backgroundColor)

  if (includeTypeLabel) {
    drawTypeBadge(context, type, useDarkTheme)
  }

  if (hasDiagramPanel && (diagramAssets.curve || diagramAssets.graph)) {
    drawDiagramPanel({
      context,
      canvasWidth: outputWidth,
      canvasHeight: outputHeight,
      assets: diagramAssets,
      includeCurve,
      includeGraph,
      trimBorder,
      useDarkTheme,
    })
  }

  const filenameType = type === 'Transition...' ? 'transition' : type
  const timestamp = Math.floor(Date.now() / 1000)
  downloadCanvas(
    outputCanvas,
    `reduction_g${genus}_type_${filenameType}_${timestamp}.png`,
  )
  return true
}
