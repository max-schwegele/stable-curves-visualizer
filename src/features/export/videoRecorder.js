const CANVAS_SELECTOR = '#canvas__container canvas'
const CAPTURE_FRAME_RATE = 60
const CROP_PADDING_CSS_PIXELS = 25

function getFullCanvasRect(canvas) {
  return {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  }
}

function getVisibleCanvasRect(canvas, devicePixelRatio) {
  const scanCanvas = document.createElement('canvas')
  scanCanvas.width = canvas.width
  scanCanvas.height = canvas.height

  const context = scanCanvas.getContext('2d', { willReadFrequently: true })
  if (!context) return getFullCanvasRect(canvas)

  context.drawImage(canvas, 0, 0)

  const pixels = context.getImageData(
    0,
    0,
    scanCanvas.width,
    scanCanvas.height,
  ).data

  let minX = scanCanvas.width
  let minY = scanCanvas.height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < scanCanvas.height; y += 1) {
    for (let x = 0; x < scanCanvas.width; x += 1) {
      const alphaIndex = (y * scanCanvas.width + x) * 4 + 3
      if (pixels[alphaIndex] === 0) continue

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (maxX < minX || maxY < minY) return getFullCanvasRect(canvas)

  const padding = Math.ceil(
    CROP_PADDING_CSS_PIXELS * Math.max(1, devicePixelRatio),
  )
  const x = Math.max(0, minX - padding)
  const y = Math.max(0, minY - padding)
  const right = Math.min(scanCanvas.width - 1, maxX + padding)
  const bottom = Math.min(scanCanvas.height - 1, maxY + padding)

  return {
    x,
    y,
    width: right - x + 1,
    height: bottom - y + 1,
  }
}

function getCaptureRect(canvas, trimBorder, devicePixelRatio) {
  if (!trimBorder) return getFullCanvasRect(canvas)

  try {
    return getVisibleCanvasRect(canvas, devicePixelRatio)
  } catch (error) {
    console.warn('Could not determine video crop bounds; using the full canvas.', error)
    return getFullCanvasRect(canvas)
  }
}

function getRecorderOptions(bitrateMbps) {
  const videoBitsPerSecond = Math.max(1, bitrateMbps) * 1_000_000
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]

  const mimeType = mimeTypes.find((candidate) =>
    MediaRecorder.isTypeSupported(candidate),
  )

  return mimeType
    ? { mimeType, videoBitsPerSecond }
    : { videoBitsPerSecond }
}

function downloadRecording(chunks, mimeType, genus) {
  if (chunks.length === 0) return

  const blob = new Blob(chunks, { type: mimeType || 'video/webm' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.download = `stable_curves_g${genus}_tour_${Math.floor(Date.now() / 1000)}.webm`
  link.href = url
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

export function startTourRecording({
  backgroundColor,
  bitrateMbps,
  devicePixelRatio,
  genus,
  trimBorder,
  useCustomBackground,
}) {
  if (typeof MediaRecorder === 'undefined') {
    console.error('Video recording is not supported by this browser.')
    return null
  }

  const sourceCanvas = document.querySelector(CANVAS_SELECTOR)
  if (!sourceCanvas) {
    console.error('Cannot start video recording because the scene canvas is missing.')
    return null
  }

  if (typeof sourceCanvas.captureStream !== 'function') {
    console.error('Canvas video capture is not supported by this browser.')
    return null
  }

  const captureRect = getCaptureRect(
    sourceCanvas,
    trimBorder,
    devicePixelRatio,
  )
  const captureCanvas = document.createElement('canvas')
  captureCanvas.width = captureRect.width
  captureCanvas.height = captureRect.height

  const context = captureCanvas.getContext('2d')
  if (!context) {
    console.error('Cannot start video recording because a 2D canvas is unavailable.')
    return null
  }

  const chunks = []
  const stream = captureCanvas.captureStream(CAPTURE_FRAME_RATE)
  let animationFrameId = null
  let isRendering = true
  let shouldDownload = true

  const renderFrame = () => {
    if (!isRendering) return

    if (useCustomBackground) {
      context.fillStyle = backgroundColor
      context.fillRect(0, 0, captureCanvas.width, captureCanvas.height)
    } else {
      context.clearRect(0, 0, captureCanvas.width, captureCanvas.height)
    }

    context.drawImage(
      sourceCanvas,
      captureRect.x,
      captureRect.y,
      captureRect.width,
      captureRect.height,
      0,
      0,
      captureCanvas.width,
      captureCanvas.height,
    )

    animationFrameId = requestAnimationFrame(renderFrame)
  }

  const stopRendering = () => {
    isRendering = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  const stopStream = () => {
    stream.getTracks().forEach((track) => track.stop())
  }

  let recorder

  try {
    recorder = new MediaRecorder(stream, getRecorderOptions(bitrateMbps))
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data?.size > 0) chunks.push(event.data)
    })
    recorder.addEventListener('stop', () => {
      stopRendering()
      stopStream()
      if (shouldDownload) {
        downloadRecording(chunks, recorder.mimeType, genus)
      }
    })
    recorder.addEventListener('error', (event) => {
      console.error('Video recording failed.', event.error ?? event)
    })

    renderFrame()
    recorder.start()
  } catch (error) {
    stopRendering()
    stopStream()
    console.error('Failed to start video recording.', error)
    return null
  }

  const finish = (download) => {
    shouldDownload = download
    stopRendering()

    if (recorder.state !== 'inactive') {
      recorder.stop()
    } else {
      stopStream()
    }
  }

  return {
    dispose: () => finish(false),
    stop: () => finish(true),
  }
}
