import { useEffect, useRef } from 'react'

import { startTourRecording } from './videoRecorder.js'

export function useTourRecorder({
  backgroundColor,
  bitrateMbps,
  devicePixelRatio,
  genus,
  isRecording,
  trimBorder,
  useCustomBackground,
}) {
  const controllerRef = useRef(null)
  const settingsRef = useRef({
    backgroundColor,
    bitrateMbps,
    devicePixelRatio,
    trimBorder,
    useCustomBackground,
  })

  useEffect(() => {
    settingsRef.current = {
      backgroundColor,
      bitrateMbps,
      devicePixelRatio,
      trimBorder,
      useCustomBackground,
    }
  }, [
    backgroundColor,
    bitrateMbps,
    devicePixelRatio,
    trimBorder,
    useCustomBackground,
  ])

  useEffect(() => {
    if (isRecording) {
      if (!controllerRef.current) {
        controllerRef.current = startTourRecording({
          ...settingsRef.current,
          genus,
        })
      }
      return
    }

    const controller = controllerRef.current
    controllerRef.current = null
    controller?.stop()
  }, [genus, isRecording])

  useEffect(
    () => () => {
      const controller = controllerRef.current
      controllerRef.current = null
      controller?.dispose()
    },
    [],
  )
}
